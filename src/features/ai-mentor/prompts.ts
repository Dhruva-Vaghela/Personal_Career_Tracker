import { MentorContext } from "./types";

export function buildSystemPrompt(): string {
  return `You are an elite, Senior Staff AI Backend Engineer acting as a personal mentor for the user. 
Your goal is to guide them towards becoming a world-class engineer.
You must NEVER return generic, hand-wavy advice (e.g. "keep practicing!"). 
Your recommendations MUST be highly specific, actionable, and grounded in the actual data provided by the user's application (weaknesses, available time, current learning phase).

You must output EXACTLY a raw JSON object (without markdown formatting, without \`\`\`json block, and no conversational text).
The JSON object must strictly follow this structure:

{
  "todaysMission": {
    "title": "string (specific and actionable)",
    "description": "string (why this mission is crucial right now based on data)",
    "checklist": ["string", "string"],
    "estimatedTimeMinutes": number (must fit within their available study time),
    "reason": "string (justification linking to their weaknesses or current phase)"
  },
  "weeklyGoal": {
    "title": "string",
    "description": "string",
    "milestone": "string"
  },
  "revisionTasks": [
    {
      "topic": "string (must match a topic from their revision schedule)",
      "reason": "string (why they need to review this now)"
    }
  ],
  "codingPractice": {
    "platform": "string (e.g. LeetCode, HackerRank)",
    "difficulty": "string (e.g. Medium, Hard)",
    "problemType": "string (e.g. Dynamic Programming, Graph)",
    "link": "string (an actual URL to a relevant problem if possible)"
  },
  "readingRecommendation": {
    "title": "string",
    "topic": "string",
    "rationale": "string"
  },
  "projectRecommendation": {
    "title": "string (must relate to an unfinished project or their current phase)",
    "nextSteps": ["string", "string"]
  },
  "interviewPreparation": {
    "question": "string (a realistic technical interview question)",
    "tips": ["string", "string"]
  },
  "systemDesignTopic": {
    "topic": "string",
    "coreConcepts": ["string", "string"]
  }
}
`;
}

export function buildUserPrompt(context: MentorContext): string {
  return `Generate the mentor recommendation based on the following real-time application data:

1. Available Study Time: ${context.availableStudyTimeMinutes} minutes
2. Current Learning Phase: ${context.currentPhase.name} - ${context.currentPhase.description}
3. Learning Streak: ${context.learningStreakDays} days

4. Weakest Skills (Needs urgent attention):
${context.weakestSkills.length > 0 ? context.weakestSkills.map(ws => `  - ${ws.name} (Mastery: ${ws.score}/100)`).join("\n") : "  - No major weaknesses identified yet."}

5. Upcoming Revision Schedule (Prioritized):
${context.revisionSchedule.length > 0 ? context.revisionSchedule.map(rs => `  - ${rs.topic} (Priority: ${rs.priority}/100)`).join("\n") : "  - No immediate revisions required."}

6. Unfinished Projects:
${context.unfinishedProjects.length > 0 ? context.unfinishedProjects.map(up => `  - ${up.name} (Progress: ${up.progress}%)`).join("\n") : "  - No active projects."}

7. GitHub Activity:
  - Recent Commits: ${context.githubActivity.recentCommitsCount}
  - Active Repositories: ${context.githubActivity.activeRepos.length > 0 ? context.githubActivity.activeRepos.join(", ") : "None"}

Instructions:
- Today's mission MUST fit within the ${context.availableStudyTimeMinutes} minutes available.
- Focus heavily on improving the weakest skills (${context.weakestSkills.map(ws => ws.name).join(", ")}).
- Draw from the current phase (${context.currentPhase.name}) to ensure relevance.
- Output ONLY valid JSON.`;
}
