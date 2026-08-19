import { useState } from "react";
import {
  Briefcase,
  Send,
  Loader2,
  Sparkles,
  Award,
  Bot,
  User,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/store/app-store";
import careerCurriculum from "@/data/career-curriculum.json";
import type { InterviewSession, InterviewTurn, QuestionDifficulty } from "../types";
import { generateInterviewFollowUpServerFn } from "../services/gemini-assessment-fn";

export function InterviewStudio() {
  const [selectedModuleId, setSelectedModuleId] = useState<string>("mod-4");
  const [selectedTopicId, setSelectedTopicId] = useState<string>("react");
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>("intermediate");

  const [activeSession, setActiveSession] = useState<InterviewSession | null>(null);
  const [candidateInput, setCandidateInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const addInterviewSession = useAppStore((s) => s.addInterviewSession);
  const updateInterviewSession = useAppStore((s) => s.updateInterviewSession);
  const interviewSessions = useAppStore((s) => s.interviewSessions);

  const selectedModule = careerCurriculum.modules.find((m) => m.id === selectedModuleId);
  const selectedTopic = selectedModule?.topics.find((t) => t.id === selectedTopicId);

  // Start new Interview Session
  const handleStartInterview = async () => {
    if (!selectedModule || !selectedTopic) return;
    setLoading(true);

    const sessionId = `interview-${Date.now()}`;
    const initialSession: InterviewSession = {
      id: sessionId,
      moduleId: selectedModule.id,
      topicId: selectedTopic.id,
      difficulty,
      createdAt: new Date().toISOString(),
      status: "in-progress",
      turns: [],
    };

    try {
      const res = await generateInterviewFollowUpServerFn({
        data: {
          moduleId: selectedModule.id,
          topicId: selectedTopic.id,
          topicTitle: selectedTopic.title,
          difficulty,
        },
      });

      const firstTurn: InterviewTurn = {
        id: `turn-0`,
        speaker: "interviewer",
        text: res.followUpQuestion,
        timestamp: new Date().toISOString(),
      };

      initialSession.turns = [firstTurn];
      setActiveSession(initialSession);
      addInterviewSession(initialSession);
    } catch (e) {
      console.error("Failed to start interview:", e);
    } finally {
      setLoading(false);
    }
  };

  // Submit Answer & Request Contextual AI Follow-Up Question
  const handleSubmitAnswer = async () => {
    if (!activeSession || !candidateInput.trim() || loading) return;

    const currentTopicTitle = selectedTopic?.title || "Technical Engineering";
    const lastTurn = activeSession.turns[activeSession.turns.length - 1];
    const userTurnText = candidateInput.trim();
    setCandidateInput("");
    setLoading(true);

    const candidateTurn: InterviewTurn = {
      id: `turn-${Date.now()}-cand`,
      speaker: "candidate",
      text: userTurnText,
      timestamp: new Date().toISOString(),
    };

    const updatedTurns = [...activeSession.turns, candidateTurn];
    setActiveSession({ ...activeSession, turns: updatedTurns });

    try {
      const res = await generateInterviewFollowUpServerFn({
        data: {
          moduleId: activeSession.moduleId,
          topicId: activeSession.topicId,
          topicTitle: currentTopicTitle,
          difficulty: activeSession.difficulty,
          previousQuestion: lastTurn?.text || "",
          candidateAnswer: userTurnText,
        },
      });

      // Attach evaluation to candidate's turn
      const evaluatedTurns = updatedTurns.map((turn) =>
        turn.id === candidateTurn.id
          ? {
              ...turn,
              evaluation: res.evaluation,
            }
          : turn
      );

      const nextInterviewerTurn: InterviewTurn = {
        id: `turn-${Date.now()}-int`,
        speaker: "interviewer",
        text: res.followUpQuestion,
        timestamp: new Date().toISOString(),
      };

      const finalTurns = [...evaluatedTurns, nextInterviewerTurn];
      const updatedSession: InterviewSession = {
        ...activeSession,
        turns: finalTurns,
      };

      setActiveSession(updatedSession);
      updateInterviewSession(activeSession.id, updatedSession);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Finish Interview & Calculate Overall Readiness Rating
  const handleFinishInterview = () => {
    if (!activeSession) return;

    const candidateTurns = activeSession.turns.filter((t) => t.speaker === "candidate" && t.evaluation);
    const avgScore = candidateTurns.length > 0
      ? Math.round(candidateTurns.reduce((acc, t) => acc + (t.evaluation?.score || 0), 0) / candidateTurns.length)
      : 75;

    let readinessRating: "Needs Work" | "Developing" | "Solid" | "Interview Ready" = "Developing";
    if (avgScore >= 85) readinessRating = "Interview Ready";
    else if (avgScore >= 75) readinessRating = "Solid";
    else if (avgScore < 60) readinessRating = "Needs Work";

    const completedSession: InterviewSession = {
      ...activeSession,
      status: "completed",
      overallEvaluation: {
        score: avgScore,
        readinessRating,
        summary: `Interview session completed across ${candidateTurns.length} turns on ${selectedTopic?.title}. Overall rating: ${readinessRating}.`,
        keyStrengths: ["Clear technical explanation", "Understands edge cases"],
        areasForImprovement: ["Provide more explicit performance trade-offs"],
      },
    };

    setActiveSession(completedSession);
    updateInterviewSession(activeSession.id, completedSession);
  };

  return (
    <div className="surface-panel p-6 glow-primary rounded-xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="outline" className="text-xs font-mono uppercase tracking-wider text-purple-400 border-purple-500/30">
              Interactive AI Interviewer
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Live Technical Probe
            </Badge>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">AI Technical Interview Studio</h2>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Simulate real technical interview loops with an adaptive AI Staff Engineer that analyzes your answers and asks sharp follow-up questions.
          </p>
        </div>
      </div>

      {!activeSession ? (
        /* Setup Interview Options */
        <div className="p-6 rounded-xl bg-card border border-border space-y-6 max-w-2xl mx-auto">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            Configure Interview Parameters
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Select Module</label>
              <Select value={selectedModuleId} onValueChange={(val) => {
                setSelectedModuleId(val);
                const mod = careerCurriculum.modules.find(m => m.id === val);
                if (mod && mod.topics.length > 0) {
                  setSelectedTopicId(mod.topics[0].id);
                }
              }}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Module" />
                </SelectTrigger>
                <SelectContent>
                  {careerCurriculum.modules.map((m) => (
                    <SelectItem key={m.id} value={m.id} className="text-xs">
                      Mod {m.number}: {m.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Select Topic</label>
              <Select value={selectedTopicId} onValueChange={setSelectedTopicId}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Topic" />
                </SelectTrigger>
                <SelectContent>
                  {selectedModule?.topics.map((t) => (
                    <SelectItem key={t.id} value={t.id} className="text-xs">
                      {t.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Interview Difficulty Level</label>
              <Select value={difficulty} onValueChange={(val) => setDifficulty(val as QuestionDifficulty)}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner" className="text-xs">Beginner — Fundamentals & Concepts</SelectItem>
                  <SelectItem value="intermediate" className="text-xs">Intermediate — Application & Debugging</SelectItem>
                  <SelectItem value="advanced" className="text-xs">Advanced — Architecture & Trade-offs</SelectItem>
                  <SelectItem value="interview-ready" className="text-xs">Interview Ready — Staff Engineer Challenge</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleStartInterview} disabled={loading} className="w-full gap-2 py-5 text-sm font-semibold">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Start Interactive AI Technical Interview
          </Button>
        </div>
      ) : (
        /* Active Interview Chat Loop */
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-secondary/30 p-3.5 rounded-lg border border-border/60">
            <div className="flex items-center gap-3 text-xs">
              <span className="font-semibold text-primary">{selectedTopic?.title}</span>
              <span className="text-muted-foreground">•</span>
              <span className="capitalize text-muted-foreground">Level: {activeSession.difficulty}</span>
            </div>
            <div className="flex items-center gap-2">
              {activeSession.status === "in-progress" && (
                <Button variant="outline" size="sm" onClick={handleFinishInterview} className="text-xs text-destructive hover:bg-destructive/10">
                  End Interview & Get Score
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setActiveSession(null)} className="text-xs">
                New Session
              </Button>
            </div>
          </div>

          {/* Transcript Messages */}
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {activeSession.turns.map((turn) => {
              const isInterviewer = turn.speaker === "interviewer";
              return (
                <div
                  key={turn.id}
                  className={`flex items-start gap-3 ${
                    isInterviewer ? "justify-start" : "justify-end flex-row-reverse"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${isInterviewer ? "bg-purple-500/20 text-purple-300" : "bg-primary/20 text-primary"}`}>
                    {isInterviewer ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>

                  <div className={`max-w-2xl space-y-2 p-4 rounded-xl text-xs leading-relaxed ${
                    isInterviewer ? "bg-card border border-border text-foreground" : "bg-primary text-primary-foreground"
                  }`}>
                    <div className="font-semibold flex items-center justify-between text-[11px] opacity-80 mb-1">
                      <span>{isInterviewer ? "AI Staff Interviewer" : "Candidate Response"}</span>
                      <span>{new Date(turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <p className="whitespace-pre-wrap">{turn.text}</p>

                    {/* Show Turn Evaluation if Candidate Turn */}
                    {turn.evaluation && (
                      <div className="mt-3 p-3 rounded bg-black/30 border border-border/50 text-[11px] space-y-1.5 text-foreground">
                        <div className="flex items-center justify-between font-mono">
                          <span className="text-primary font-bold">Evaluation Score: {turn.evaluation.score}%</span>
                        </div>
                        <p className="text-muted-foreground">{turn.evaluation.technicalReasoning}</p>
                        {turn.evaluation.feedback && (
                          <div className="text-emerald-400 font-medium">Feedback: {turn.evaluation.feedback}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Overall Final Evaluation */}
          {activeSession.status === "completed" && activeSession.overallEvaluation && (
            <div className="p-5 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Overall Interview Readiness Score</div>
                  <div className="text-2xl font-bold font-mono text-purple-300">
                    {activeSession.overallEvaluation.score}%
                  </div>
                </div>
                <Badge variant="default" className="text-sm bg-purple-600">
                  {activeSession.overallEvaluation?.readinessRating}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{activeSession.overallEvaluation.summary}</p>
            </div>
          )}

          {/* Candidate Answer Input */}
          {activeSession.status === "in-progress" && (
            <div className="space-y-3 pt-2">
              <Textarea
                value={candidateInput}
                onChange={(e) => setCandidateInput(e.target.value)}
                placeholder="Type your technical response to the interviewer's question..."
                rows={4}
                className="text-xs font-mono"
              />
              <div className="flex justify-end">
                <Button onClick={handleSubmitAnswer} disabled={loading || !candidateInput.trim()} className="gap-2 text-xs">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Submit Answer & Get AI Follow-Up
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
