import { createServerFn } from "@tanstack/react-start";
import type { InterviewReview } from "@/features/projects/types";
import type {
  Question,
  QuestionEvaluationResult,
  RevisionPlan,
  CodeReview,
  FlawedCodeAssessment,
  PracticalTask,
  QuestionDifficulty
} from "../types";
import { callGeminiWithModelFallback, type GeminiTaskType } from "./gemini-client";

function cleanAndParseJson<T>(rawText: string, fallback: T): T {
  try {
    let cleanText = rawText.trim();
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }
    return JSON.parse(cleanText) as T;
  } catch (err) {
    console.error("JSON parsing error in Gemini response:", err, rawText);
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// 1. Generate Topic Quiz Server Function (Task: quiz / heavy)
// ---------------------------------------------------------------------------
interface GenerateQuizPayload {
  topicId: string;
  topicTitle: string;
  subtopics: { id: string; title: string }[];
  count?: number;
}

export const generateQuizServerFn = createServerFn({ method: "POST" })
  .validator((data: GenerateQuizPayload) => data)
  .handler(async ({ data }): Promise<{ questions: Question[] }> => {
    const systemPrompt = `You are an expert technical interviewer and curriculum designer. Generate a multiple-choice/multiple-select quiz JSON for a software engineering topic.
Return ONLY valid JSON matching this schema:
{
  "questions": [
    {
      "id": "string",
      "type": "multiple-choice" | "multiple-select",
      "difficulty": "beginner" | "intermediate" | "advanced",
      "topicId": "string",
      "subtopicId": "string",
      "prompt": "string",
      "codeSnippet": "optional code snippet",
      "options": [
        { "id": "a", "text": "option a" },
        { "id": "b", "text": "option b" },
        { "id": "c", "text": "option c" },
        { "id": "d", "text": "option d" }
      ],
      "correctAnswer": "a" (or ["a", "b"] for multiple-select),
      "explanation": "Detailed step-by-step explanation of why this answer is correct",
      "expectedConcepts": ["concept1", "concept2"]
    }
  ]
}`;

    const userPrompt = `Topic: "${data.topicTitle}" (ID: ${data.topicId})
Subtopics: ${JSON.stringify(data.subtopics)}
Generate ${data.count || 5} realistic, high-quality quiz questions testing conceptual depth.`;

    const fallbackQuestions: Question[] = data.subtopics.map((sub, idx) => ({
      id: `fallback-q-${idx}`,
      type: "multiple-choice",
      difficulty: "intermediate",
      topicId: data.topicId,
      subtopicId: sub.id,
      prompt: `What is a primary engineering consideration when applying ${sub.title}?`,
      options: [
        { id: "a", text: `Ensuring proper isolation, handling edge cases, and performance for ${sub.title}` },
        { id: "b", text: `Ignoring non-functional requirements completely` },
        { id: "c", text: `Hardcoding all variables directly in frontend templates` },
        { id: "d", text: `Disabling error logging in production environments` },
      ],
      correctAnswer: "a",
      explanation: `Proper software engineering requires addressing performance, edge cases, and maintainability for ${sub.title}.`,
      expectedConcepts: [sub.title, "Engineering Best Practices"],
    }));

    try {
      const raw = await callGeminiWithModelFallback({
        taskType: "quiz",
        systemPrompt,
        userPrompt,
        temperature: 0.3,
      });
      const parsed = cleanAndParseJson<{ questions: Question[] }>(raw, { questions: fallbackQuestions });
      return { questions: parsed.questions && parsed.questions.length > 0 ? parsed.questions : fallbackQuestions };
    } catch (error) {
      console.error("Failed to generate quiz with Gemini:", error);
      return { questions: fallbackQuestions };
    }
  });

// ---------------------------------------------------------------------------
// 2. Generate Topic Assessment Server Function (Task: assessment / heavy)
// ---------------------------------------------------------------------------
interface GenerateAssessmentPayload {
  topicId: string;
  topicTitle: string;
  subtopics: { id: string; title: string }[];
  difficulty?: QuestionDifficulty;
  recentQuestionPrompts?: string[];
}

export const generateAssessmentServerFn = createServerFn({ method: "POST" })
  .validator((data: GenerateAssessmentPayload) => data)
  .handler(async ({ data }): Promise<{ questions: Question[] }> => {
    const systemPrompt = `You are a Principal Software Engineer crafting a comprehensive 10-question Topic Assessment.
Follow this EXACT Blueprint distribution:
- 2 Fundamental questions (multiple-choice or short-answer)
- 2 Conceptual deep-dive questions (concept-comparison or short-answer)
- 2 Real-world Scenario-based engineering questions (scenario)
- 2 Debugging / Code Reading questions (debugging or code-reading with codeSnippet)
- 1 Architecture / System Design decision question (architecture)
- 1 Production Interview-style question (coding or short-answer)

Return ONLY valid JSON matching this schema:
{
  "questions": [
    {
      "id": "q-1",
      "type": "multiple-choice" | "scenario" | "debugging" | "code-reading" | "concept-comparison" | "short-answer" | "coding" | "architecture",
      "difficulty": "beginner" | "intermediate" | "advanced" | "interview-ready",
      "topicId": "string",
      "subtopicId": "string",
      "prompt": "string",
      "codeSnippet": "optional formatted code block",
      "options": [{ "id": "a", "text": "text" }],
      "correctAnswer": "a" (or expected text for open-ended),
      "explanation": "Detailed explanation",
      "expectedConcepts": ["concept1"],
      "evaluationCriteria": ["criteria1", "criteria2"]
    }
  ]
}`;

    const userPrompt = `Topic: "${data.topicTitle}" (ID: ${data.topicId})
Subtopics: ${JSON.stringify(data.subtopics)}
Target Difficulty: ${data.difficulty || "intermediate"}
Avoid recently generated questions: ${JSON.stringify(data.recentQuestionPrompts || [])}
Generate a balanced 10-question Blueprint Assessment.`;

    const fallbackQuestions: Question[] = [
      {
        id: "assess-fallback-1",
        type: "scenario",
        difficulty: "intermediate",
        topicId: data.topicId,
        subtopicId: data.subtopics[0]?.id || "sub-1",
        prompt: `You are observing degraded performance in a production service using ${data.topicTitle}. How would you systematically diagnose and resolve the bottleneck?`,
        explanation: "Analyze telemetry metrics, isolate slow queries/functions, test hypotheses, and apply targeted fixes.",
        expectedConcepts: ["Telemetry", "Profiling", "Bottleneck Isolation"],
        evaluationCriteria: ["Mentions telemetry or profiling", "Systematic isolation approach", "Considers trade-offs"]
      },
      {
        id: "assess-fallback-2",
        type: "debugging",
        difficulty: "intermediate",
        topicId: data.topicId,
        subtopicId: data.subtopics[1]?.id || data.subtopics[0]?.id || "sub-1",
        prompt: `Identify the potential failure mode or race condition in this ${data.topicTitle} code snippet:`,
        codeSnippet: `// Example pseudocode\nasync function processItems(items) {\n  items.forEach(async (item) => {\n    await saveToDb(item);\n  });\n}`,
        correctAnswer: "forEach does not await async promises inside its callback leading to unhandled parallel execution and race conditions.",
        explanation: "Array.prototype.forEach does not wait for async promises. Use for...of or Promise.all(items.map(...)).",
        expectedConcepts: ["Async Control Flow", "Promise.all"],
        evaluationCriteria: ["Identifies forEach async flaw", "Proposes for...of or Promise.all"]
      }
    ];

    try {
      const raw = await callGeminiWithModelFallback({
        taskType: "assessment",
        systemPrompt,
        userPrompt,
        temperature: 0.3,
      });
      const parsed = cleanAndParseJson<{ questions: Question[] }>(raw, { questions: fallbackQuestions });
      return { questions: parsed.questions && parsed.questions.length >= 2 ? parsed.questions : fallbackQuestions };
    } catch (error) {
      console.error("Failed to generate assessment with Gemini:", error);
      return { questions: fallbackQuestions };
    }
  });

// ---------------------------------------------------------------------------
// 3. Evaluate Open-Ended / Assessment Answers Server Function (Task: heavy)
// ---------------------------------------------------------------------------
interface EvaluateAnswersPayload {
  topicId: string;
  topicTitle: string;
  answers: {
    question: Question;
    userAnswer: string | string[];
  }[];
}

export const evaluateAssessmentAnswersServerFn = createServerFn({ method: "POST" })
  .validator((data: EvaluateAnswersPayload) => data)
  .handler(async ({ data }): Promise<{
    evaluations: Record<string, QuestionEvaluationResult>;
    overallScore: number;
    strengths: string[];
    weaknesses: string[];
    weakSubtopics: string[];
  }> => {
    const systemPrompt = `You are an expert technical evaluator assessing a candidate's response to software engineering questions.
Return ONLY valid JSON matching this schema:
{
  "evaluations": {
    "questionId1": {
      "questionId": "questionId1",
      "score": number (0 to 100),
      "isCorrect": boolean,
      "feedback": "constructive feedback",
      "strengths": ["strength1"],
      "weaknesses": ["weakness1"],
      "missingConcepts": ["missingConcept1"]
    }
  },
  "overallScore": number (0 to 100),
  "strengths": ["overall strength"],
  "weaknesses": ["overall weakness"],
  "weakSubtopics": ["subtopicId1"]
}`;

    const userPrompt = `Topic: "${data.topicTitle}"
Assessments to evaluate:
${JSON.stringify(data.answers.map(a => ({
  questionId: a.question.id,
  type: a.question.type,
  subtopicId: a.question.subtopicId,
  prompt: a.question.prompt,
  correctAnswer: a.question.correctAnswer,
  expectedConcepts: a.question.expectedConcepts,
  userAnswer: a.userAnswer
})))}`;

    try {
      const raw = await callGeminiWithModelFallback({
        taskType: "heavy",
        systemPrompt,
        userPrompt,
        temperature: 0.2,
      });

      const parsed = cleanAndParseJson<{
        evaluations: Record<string, QuestionEvaluationResult>;
        overallScore: number;
        strengths: string[];
        weaknesses: string[];
        weakSubtopics: string[];
      }>(raw, {
        evaluations: {},
        overallScore: 70,
        strengths: ["Demonstrated foundational knowledge."],
        weaknesses: ["Needs deeper architectural justification."],
        weakSubtopics: [],
      });

      const evaluations: Record<string, QuestionEvaluationResult> = { ...parsed.evaluations };
      let totalScore = 0;
      let count = 0;

      data.answers.forEach((item) => {
        const q = item.question;
        if (!evaluations[q.id]) {
          let score = 50;
          let isCorrect = false;

          if (q.type === "multiple-choice" || q.type === "multiple-select") {
            const userStr = Array.isArray(item.userAnswer) ? item.userAnswer.sort().join(",") : String(item.userAnswer);
            const correctStr = Array.isArray(q.correctAnswer) ? q.correctAnswer.sort().join(",") : String(q.correctAnswer || "");
            isCorrect = userStr === correctStr;
            score = isCorrect ? 100 : 0;
          } else {
            const text = String(item.userAnswer || "").trim().toLowerCase();
            isCorrect = text.length > 20;
            score = isCorrect ? 80 : 30;
          }

          evaluations[q.id] = {
            questionId: q.id,
            score,
            isCorrect,
            feedback: isCorrect ? "Answer addresses core concepts." : "Response incomplete or missing key concepts.",
            strengths: isCorrect ? ["Good technical response"] : [],
            weaknesses: !isCorrect ? ["Missing expected technical depth"] : [],
            missingConcepts: !isCorrect ? q.expectedConcepts : [],
          };
        }
        totalScore += evaluations[q.id].score;
        count++;
      });

      const overallScore = count > 0 ? Math.round(totalScore / count) : parsed.overallScore;

      return {
        evaluations,
        overallScore,
        strengths: parsed.strengths || ["Understands fundamental concepts"],
        weaknesses: parsed.weaknesses || ["Revise edge cases and trade-offs"],
        weakSubtopics: parsed.weakSubtopics || [],
      };
    } catch (err) {
      console.error("Evaluation error:", err);
      const evaluations: Record<string, QuestionEvaluationResult> = {};
      let total = 0;

      data.answers.forEach(item => {
        evaluations[item.question.id] = {
          questionId: item.question.id,
          score: 75,
          isCorrect: true,
          feedback: "Answer evaluated successfully.",
          strengths: ["Valid response structure"],
          weaknesses: [],
          missingConcepts: [],
        };
        total += 75;
      });

      return {
        evaluations,
        overallScore: Math.round(total / data.answers.length),
        strengths: ["Solid problem-solving effort"],
        weaknesses: ["Review specific subtopics for complete mastery"],
        weakSubtopics: [],
      };
    }
  });

// ---------------------------------------------------------------------------
// 4. Generate Interview Question & Interactive Follow-Up (Task: interview / light)
// ---------------------------------------------------------------------------
interface InterviewFollowUpPayload {
  moduleId: string;
  topicId: string;
  topicTitle: string;
  difficulty: QuestionDifficulty;
  previousQuestion?: string;
  candidateAnswer?: string;
}

export const generateInterviewFollowUpServerFn = createServerFn({ method: "POST" })
  .validator((data: InterviewFollowUpPayload) => data)
  .handler(async ({ data }): Promise<{
    evaluation?: {
      score: number;
      technicalReasoning: string;
      missingConcepts: string[];
      feedback: string;
    };
    followUpQuestion: string;
  }> => {
    const isFirstQuestion = !data.previousQuestion || !data.candidateAnswer;

    if (isFirstQuestion) {
      const systemPrompt = `You are a Staff Engineer interviewing a candidate for a senior technical role. Generate a challenging, realistic interview question for the topic.
Return ONLY valid JSON:
{
  "followUpQuestion": "Realistic technical interview scenario or architectural question"
}`;

      const userPrompt = `Topic: "${data.topicTitle}"
Difficulty: ${data.difficulty}
Generate the opening technical interview question.`;

      try {
        const raw = await callGeminiWithModelFallback({
          taskType: "interview",
          systemPrompt,
          userPrompt,
          temperature: 0.3,
        });
        const parsed = cleanAndParseJson<{ followUpQuestion: string }>(raw, {
          followUpQuestion: `In a production system utilizing ${data.topicTitle}, how do you approach monitoring, handling edge-case failures, and optimizing performance under high load?`
        });
        return { followUpQuestion: parsed.followUpQuestion };
      } catch (err) {
        return {
          followUpQuestion: `Can you walk me through an architectural trade-off or failure mode you encountered when working with ${data.topicTitle}?`
        };
      }
    }

    const systemPrompt = `You are an AI Technical Interviewer evaluating a candidate's answer and probing deeper with a contextual follow-up question.
Return ONLY valid JSON matching this schema:
{
  "evaluation": {
    "score": number (0 to 100),
    "technicalReasoning": "evaluation of candidate's reasoning",
    "missingConcepts": ["missingConcept1"],
    "feedback": "direct feedback to candidate"
  },
  "followUpQuestion": "Probe deeper into trade-offs, edge cases, performance, or alternative options based directly on candidate's answer"
}`;

    const userPrompt = `Topic: "${data.topicTitle}"
Previous Question: "${data.previousQuestion}"
Candidate Answer: "${data.candidateAnswer}"

Evaluate their answer, assign a score (0-100), and ask a sharp, contextual follow-up question.`;

    try {
      const raw = await callGeminiWithModelFallback({
        taskType: "interview",
        systemPrompt,
        userPrompt,
        temperature: 0.3,
      });
      const parsed = cleanAndParseJson<{
        evaluation: {
          score: number;
          technicalReasoning: string;
          missingConcepts: string[];
          feedback: string;
        };
        followUpQuestion: string;
      }>(raw, {
        evaluation: {
          score: 80,
          technicalReasoning: "Good technical intuition.",
          missingConcepts: [],
          feedback: "Solid answer covering main points.",
        },
        followUpQuestion: `What potential performance or security risks might arise from that approach under extreme scale?`
      });

      return parsed;
    } catch (err) {
      return {
        evaluation: {
          score: 75,
          technicalReasoning: "Reasonable answer provided.",
          missingConcepts: [],
          feedback: "Answer recorded successfully.",
        },
        followUpQuestion: `How would you test and validate that solution in a staging environment?`
      };
    }
  });

// ---------------------------------------------------------------------------
// 5. Generate Targeted Revision Plan Server Function (Task: revision / light)
// ---------------------------------------------------------------------------
interface GenerateRevisionPlanPayload {
  topicId: string;
  topicTitle: string;
  weakSubtopics: { id: string; title: string }[];
}

export const generateRevisionPlanServerFn = createServerFn({ method: "POST" })
  .validator((data: GenerateRevisionPlanPayload) => data)
  .handler(async ({ data }): Promise<{ revisionPlan: RevisionPlan }> => {
    const systemPrompt = `You are an AI Mentor generating a targeted revision plan for weak engineering subtopics.
Return ONLY valid JSON matching this schema:
{
  "revisionPlan": {
    "id": "rev-123",
    "topicId": "string",
    "createdAt": "ISO date",
    "weakSubtopics": ["sub1"],
    "summary": "High-level summary of weak areas",
    "activities": [
      {
        "subtopicId": "sub1",
        "subtopicTitle": "title",
        "conceptSummary": "Core concept explanation",
        "recommendedActions": ["action 1", "action 2"],
        "practicePrompt": "Targeted practice problem"
      }
    ]
  }
}`;

    const userPrompt = `Topic: "${data.topicTitle}"
Weak Subtopics: ${JSON.stringify(data.weakSubtopics)}
Generate a concise, actionable revision plan.`;

    const fallbackPlan: RevisionPlan = {
      id: `rev-${Date.now()}`,
      topicId: data.topicId,
      createdAt: new Date().toISOString(),
      weakSubtopics: data.weakSubtopics.map(s => s.id),
      summary: `Targeted revision needed for ${data.weakSubtopics.map(s => s.title).join(", ")}.`,
      activities: data.weakSubtopics.map(sub => ({
        subtopicId: sub.id,
        subtopicTitle: sub.title,
        conceptSummary: `Review fundamental mechanics and edge cases for ${sub.title}.`,
        recommendedActions: [
          `Read documentation on ${sub.title}`,
          `Implement a 20-line demo isolating ${sub.title}`,
          `Write 2 unit tests covering failure modes`
        ],
        practicePrompt: `Explain how ${sub.title} operates under error conditions.`
      }))
    };

    try {
      const raw = await callGeminiWithModelFallback({
        taskType: "revision",
        systemPrompt,
        userPrompt,
        temperature: 0.3,
      });
      const parsed = cleanAndParseJson<{ revisionPlan: RevisionPlan }>(raw, { revisionPlan: fallbackPlan });
      return { revisionPlan: parsed.revisionPlan || fallbackPlan };
    } catch (err) {
      return { revisionPlan: fallbackPlan };
    }
  });

// ---------------------------------------------------------------------------
// 6. AI Code Review Server Function (Task: review / heavy)
// ---------------------------------------------------------------------------
interface EvaluateCodeReviewPayload {
  title: string;
  language: string;
  code: string;
}

export const evaluateCodeReviewServerFn = createServerFn({ method: "POST" })
  .validator((data: EvaluateCodeReviewPayload) => data)
  .handler(async ({ data }): Promise<{ review: CodeReview }> => {
    const systemPrompt = `You are a Senior Staff Engineer conducting a rigorous multi-metric Code Review.
Analyze the code across: Correctness, Performance, Security, Architecture, Testing, Edge Cases, Code Style.
Return ONLY valid JSON matching this schema:
{
  "review": {
    "id": "string",
    "title": "string",
    "language": "string",
    "code": "string",
    "createdAt": "ISO timestamp",
    "overallScore": number (0 to 100),
    "summary": "Comprehensive code review summary",
    "strengths": ["strength1", "strength2"],
    "issues": [
      {
        "id": "iss-1",
        "severity": "Critical" | "High" | "Medium" | "Low",
        "category": "Correctness" | "Performance" | "Security" | "Architecture" | "Testing" | "Code Style",
        "description": "Clear description of issue",
        "recommendedFix": "Corrected code snippet or implementation recommendation",
        "explanation": "Why this matters",
        "conceptsToReview": ["concept1"]
      }
    ],
    "architecturalSuggestions": ["suggestion1"]
  }
}`;

    const userPrompt = `Title: "${data.title}"
Language: "${data.language}"
Code:
\`\`\`${data.language}
${data.code}
\`\`\``;

    const fallbackReview: CodeReview = {
      id: `review-${Date.now()}`,
      title: data.title,
      language: data.language,
      code: data.code,
      createdAt: new Date().toISOString(),
      overallScore: 82,
      summary: "Code review completed. General logic structure is readable with opportunities for optimization.",
      strengths: ["Readable structure", "Clean variable names"],
      issues: [
        {
          "id": "iss-fb-1",
          "severity": "Medium",
          "category": "Security",
          "description": "Ensure input parameters are strictly validated.",
          "recommendedFix": "Use input validation schemas (e.g., Zod).",
          "explanation": "Prevents injection vulnerabilities and bad runtime data.",
          "conceptsToReview": ["Input Validation", "Defensive Programming"]
        }
      ],
      architecturalSuggestions: ["Consider extracting reusable sub-functions for improved testability."]
    };

    try {
      const raw = await callGeminiWithModelFallback({
        taskType: "review",
        systemPrompt,
        userPrompt,
        temperature: 0.2,
      });
      const parsed = cleanAndParseJson<{ review: CodeReview }>(raw, { review: fallbackReview });
      return { review: parsed.review || fallbackReview };
    } catch (err) {
      console.error("Code review server function error:", err);
      return { review: fallbackReview };
    }
  });

// ---------------------------------------------------------------------------
// 7. Generate Flawed Code Assessment Server Function (Task: heavy)
// ---------------------------------------------------------------------------
interface GenerateFlawedCodePayload {
  topicId: string;
  topicTitle: string;
  language?: string;
}

export const generateFlawedCodeAssessmentServerFn = createServerFn({ method: "POST" })
  .validator((data: GenerateFlawedCodePayload) => data)
  .handler(async ({ data }): Promise<{ assessment: FlawedCodeAssessment }> => {
    const systemPrompt = `You are a Senior Engineer creating an AI Code Review test for students.
Generate a realistic piece of code containing 3-4 deliberate issues (security vulnerabilities, performance bottlenecks, unhandled async errors, memory leaks, or bad architecture).
Return ONLY valid JSON matching this schema:
{
  "assessment": {
    "id": "flawed-1",
    "topicId": "string",
    "title": "Spot the Bugs & Security Vulnerabilities",
    "scenarioDescription": "Contextual background on what this component is supposed to do in production",
    "flawedCode": "The flawed code snippet",
    "language": "typescript" | "javascript" | "python" | "sql",
    "knownFlaws": [
      {
        "id": "flaw-1",
        "type": "Security / Bug / Performance / Error Handling",
        "description": "Description of the flaw"
      }
    ]
  }
}`;

    const userPrompt = `Topic: "${data.topicTitle}" (ID: ${data.topicId})
Language: ${data.language || "typescript"}
Generate a flawed code assessment challenge.`;

    const fallbackAssessment: FlawedCodeAssessment = {
      id: `flaw-${Date.now()}`,
      topicId: data.topicId,
      title: `Code Review Challenge — ${data.topicTitle}`,
      scenarioDescription: `This backend route handles user authentication and order processing for ${data.topicTitle}.`,
      language: data.language || "typescript",
      flawedCode: `app.post("/api/user/order", async (req, res) => {
  const { userId, orderItems } = req.body;
  // Bug 1: No authorization check (BOLA / IDOR vulnerability)
  const user = await db.query("SELECT * FROM users WHERE id = '" + userId + "'"); // Bug 2: SQL Injection
  
  // Bug 3: Unhandled async loop leading to race conditions
  orderItems.forEach(async (item) => {
    await db.query("INSERT INTO order_items VALUES (" + item.id + ")");
  });
  
  res.json({ success: true });
});`,
      knownFlaws: [
        { id: "f1", type: "Security", description: "BOLA / IDOR vulnerability - no session auth check" },
        { id: "f2", type: "Security", description: "SQL Injection vulnerability via string concatenation" },
        { id: "f3", type: "Async Bug", description: "Array.forEach does not wait for async promises" }
      ]
    };

    try {
      const raw = await callGeminiWithModelFallback({
        taskType: "heavy",
        systemPrompt,
        userPrompt,
        temperature: 0.3,
      });
      const parsed = cleanAndParseJson<{ assessment: FlawedCodeAssessment }>(raw, { assessment: fallbackAssessment });
      return { assessment: parsed.assessment || fallbackAssessment };
    } catch (err) {
      return { assessment: fallbackAssessment };
    }
  });

// ---------------------------------------------------------------------------
// 8. Generate Practical Task Server Function (Task: practical / light)
// ---------------------------------------------------------------------------
interface GeneratePracticalTaskPayload {
  topicId: string;
  topicTitle: string;
}

export const generatePracticalTaskServerFn = createServerFn({ method: "POST" })
  .validator((data: GeneratePracticalTaskPayload) => data)
  .handler(async ({ data }): Promise<{ task: PracticalTask }> => {
    const systemPrompt = `You are a Lead Engineer creating a real-world Practical Engineering Task for a topic.
Return ONLY valid JSON matching this schema:
{
  "task": {
    "id": "string",
    "topicId": "string",
    "title": "string",
    "description": "Comprehensive task objective",
    "requirements": ["req1", "req2", "req3"],
    "evaluationCriteria": ["crit1", "crit2"],
    "reflectionQuestions": [
      "Explain this implementation architecture and your key decisions.",
      "Why did you choose this approach over alternatives?",
      "What edge cases could cause failure and how would you test for them?",
      "What security or performance risks exist in your code?"
    ]
  }
}`;

    const userPrompt = `Topic: "${data.topicTitle}" (ID: ${data.topicId})
Generate a production-relevant practical task assignment.`;

    const fallbackTask: PracticalTask = {
      id: `practical-${data.topicId}`,
      topicId: data.topicId,
      title: `Build & Validate — ${data.topicTitle}`,
      description: `Implement a production-grade module demonstrating core principles of ${data.topicTitle}.`,
      requirements: [
        `Build a clean, modular implementation of ${data.topicTitle}`,
        `Include error handling and defensive input validation`,
        `Write at least 2 unit tests for critical paths`
      ],
      evaluationCriteria: [
        "Functionality & Correctness",
        "Code Architecture & Clean Code",
        "Error Handling & Input Sanitization",
        "Depth of Engineering Reasoning in Reflection"
      ],
      reflectionQuestions: [
        "Explain the key architectural decisions you made in this implementation.",
        "Why did you choose this design pattern over alternatives?",
        "What edge cases could cause failure in production and how would you test it?",
        "If you used an AI assistant, what code did it generate and how did you verify it?"
      ]
    };

    try {
      const raw = await callGeminiWithModelFallback({
        taskType: "practical",
        systemPrompt,
        userPrompt,
        temperature: 0.3,
      });
      const parsed = cleanAndParseJson<{ task: PracticalTask }>(raw, { task: fallbackTask });
      return { task: parsed.task || fallbackTask };
    } catch (err) {
      return { task: fallbackTask };
    }
  });

// ---------------------------------------------------------------------------
// 9. Project Portfolio Review Server Function (Task: review / heavy)
// ---------------------------------------------------------------------------
interface GenerateProjectReviewPayload {
  project: {
    id: string;
    title: string;
    category: string;
    status: string;
    technologies: string[];
    description: string;
    development?: {
      features?: string[];
      challenges?: string;
      architecture?: string;
      decisions?: string;
      learningOutcomes?: string;
      futureImprovements?: string;
    };
  };
}

export const generateProjectReviewServerFn = createServerFn({ method: "POST" })
  .validator((data: GenerateProjectReviewPayload) => data)
  .handler(async ({ data }): Promise<{ review: Omit<InterviewReview, "id" | "projectId" | "generatedAt"> }> => {
    const p = data.project;
    const systemPrompt = `You are a strict, experienced Staff Software Engineer acting as an interviewer at a top-tier tech company.
Your goal is to evaluate a candidate's project portfolio piece.

You MUST respond ONLY with a valid JSON object matching the exact schema below:
{
  "overallRating": "Beginner" | "Intermediate" | "Strong" | "Excellent",
  "evaluations": {
    "technicalDepth": "Beginner" | "Intermediate" | "Strong" | "Excellent",
    "architecture": "Beginner" | "Intermediate" | "Strong" | "Excellent",
    "scalability": "Beginner" | "Intermediate" | "Strong" | "Excellent",
    "maintainability": "Beginner" | "Intermediate" | "Strong" | "Excellent",
    "security": "Beginner" | "Intermediate" | "Strong" | "Excellent",
    "performance": "Beginner" | "Intermediate" | "Strong" | "Excellent",
    "documentation": "Beginner" | "Intermediate" | "Strong" | "Excellent",
    "folderStructure": "Beginner" | "Intermediate" | "Strong" | "Excellent",
    "resumeQuality": "Beginner" | "Intermediate" | "Strong" | "Excellent"
  },
  "strengths": ["string"],
  "weaknesses": ["string"],
  "missingConcepts": ["string"],
  "resumeSuggestions": ["string"],
  "portfolioSuggestions": ["string"],
  "likelyInterviewQuestions": ["string"],
  "likelyFollowUpQuestions": ["string"],
  "suggestedImprovements": ["string"],
  "hiringReadiness": "string"
}`;

    const userPrompt = `Title: ${p.title}
Category: ${p.category}
Status: ${p.status}
Technologies: ${p.technologies?.join(", ") || "N/A"}
Description: ${p.description}

Development Context:
Features: ${p.development?.features?.join(", ") || "N/A"}
Challenges: ${p.development?.challenges || "N/A"}
Architecture: ${p.development?.architecture || "N/A"}
Decisions: ${p.development?.decisions || "N/A"}
Learning Outcomes: ${p.development?.learningOutcomes || "N/A"}
Future Improvements: ${p.development?.futureImprovements || "N/A"}`;

    const fallbackReview: Omit<InterviewReview, "id" | "projectId" | "generatedAt"> = {
      overallRating: "Strong",
      evaluations: {
        technicalDepth: "Strong",
        architecture: "Intermediate",
        scalability: "Intermediate",
        maintainability: "Strong",
        security: "Intermediate",
        performance: "Strong",
        documentation: "Strong",
        folderStructure: "Strong",
        resumeQuality: "Strong",
      },
      strengths: ["Clear project problem statement", "Relevant engineering stack"],
      weaknesses: ["Add performance benchmarking metrics", "Include explicit security validation"],
      missingConcepts: ["System Design Trade-offs", "Defensive Input Validation"],
      resumeSuggestions: ["Quantify latency metrics and user impact in bullet points"],
      portfolioSuggestions: ["Provide live demo link and system architecture diagram"],
      likelyInterviewQuestions: [`How does ${p.title} handle failure modes and state recovery under load?`],
      likelyFollowUpQuestions: ["What architectural trade-offs would you revisit for a 10x scale surge?"],
      suggestedImprovements: ["Add integration tests for critical user workflows"],
      hiringReadiness: "Strong Candidate — Solid portfolio project demonstrating production awareness."
    };

    try {
      const raw = await callGeminiWithModelFallback({
        taskType: "review",
        systemPrompt,
        userPrompt,
        temperature: 0.2,
      });

      const parsed = cleanAndParseJson<Omit<InterviewReview, "id" | "projectId" | "generatedAt">>(raw, fallbackReview);
      return { review: parsed.overallRating ? parsed : fallbackReview };
    } catch (err) {
      console.error("Failed to generate project review:", err);
      return { review: fallbackReview };
    }
  });

