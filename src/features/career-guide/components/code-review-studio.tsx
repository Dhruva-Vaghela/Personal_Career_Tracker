import { useState } from "react";
import {
  Code2,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Loader2,
  ShieldAlert,
  FileCode,
  Bug,
  Award,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/store/app-store";
import careerCurriculum from "@/data/career-curriculum.json";
import type { CodeReview, FlawedCodeAssessment } from "../types";
import {
  evaluateCodeReviewServerFn,
  generateFlawedCodeAssessmentServerFn
} from "../services/gemini-assessment-fn";

export function CodeReviewStudio() {
  const [activeTab, setActiveTab] = useState<string>("submit-review");

  // Mode 1 State: Submit Code for Review
  const [codeTitle, setCodeTitle] = useState("Order Processing Service");
  const [language, setLanguage] = useState("typescript");
  const [codeContent, setCodeContent] = useState(`async function processOrder(orderId: string, userId: string) {
  // Missing authorization check
  const order = await db.query("SELECT * FROM orders WHERE id = " + orderId); // SQL Injection vulnerability
  
  if (!order) {
    throw new Error("Order not found");
  }
  
  // Unhandled async promise loop
  order.items.forEach(async (item: any) => {
    await inventory.deduct(item.id, item.quantity);
  });
  
  return { success: true };
}`);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [currentReview, setCurrentReview] = useState<CodeReview | null>(null);

  // Mode 2 State: Flawed Code Assessment ("Spot the Bugs")
  const [selectedTopicId, setSelectedTopicId] = useState("react");
  const [flawedAssessment, setFlawedAssessment] = useState<FlawedCodeAssessment | null>(null);
  const [flawedLoading, setFlawedLoading] = useState(false);
  const [identifiedIssues, setIdentifiedIssues] = useState("");
  const [fixedCodeInput, setFixedCodeInput] = useState("");
  const [flawedSubmitted, setFlawedSubmitted] = useState(false);

  const addCodeReview = useAppStore((s) => s.addCodeReview);

  // Handle AI Code Review Submission
  const handleRunCodeReview = async () => {
    if (!codeContent.trim()) return;
    setReviewLoading(true);
    try {
      const res = await evaluateCodeReviewServerFn({
        data: {
          title: codeTitle,
          language,
          code: codeContent,
        },
      });
      setCurrentReview(res.review);
      addCodeReview(res.review);
    } catch (e) {
      console.error(e);
    } finally {
      setReviewLoading(false);
    }
  };

  // Handle Flawed Code Assessment Generation
  const handleGenerateFlawedCode = async () => {
    setFlawedLoading(true);
    try {
      const allTopics = careerCurriculum.modules.flatMap((m) => m.topics);
      const targetTopic = allTopics.find((t) => t.id === selectedTopicId) || allTopics[0];

      const res = await generateFlawedCodeAssessmentServerFn({
        data: {
          topicId: targetTopic.id,
          topicTitle: targetTopic.title,
          language: "typescript",
        },
      });

      setFlawedAssessment(res.assessment);
      setIdentifiedIssues("");
      setFixedCodeInput(res.assessment.flawedCode);
      setFlawedSubmitted(false);
    } catch (e) {
      console.error(e);
    } finally {
      setFlawedLoading(false);
    }
  };

  return (
    <div className="surface-panel p-6 glow-primary rounded-xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="outline" className="text-xs font-mono uppercase tracking-wider text-emerald-400 border-emerald-500/30">
              AI Code Review Engine
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Quality & Bug Detection
            </Badge>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">AI Code Review & Flawed Code Studio</h2>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Get automated multi-metric code reviews or test your engineering readiness by finding bugs in AI-generated code.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md bg-secondary/30 p-1 rounded-lg">
          <TabsTrigger value="submit-review" className="text-xs flex items-center gap-1.5">
            <FileCode className="h-3.5 w-3.5" />
            AI Code Review
          </TabsTrigger>
          <TabsTrigger value="spot-bugs" className="text-xs flex items-center gap-1.5">
            <Bug className="h-3.5 w-3.5" />
            Spot the Bugs (Flawed Code)
          </TabsTrigger>
        </TabsList>

        {/* MODE 1: AI CODE REVIEW */}
        <TabsContent value="submit-review" className="mt-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Title</label>
                  <Input
                    value={codeTitle}
                    onChange={(e) => setCodeTitle(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Language</label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="typescript" className="text-xs">TypeScript</SelectItem>
                      <SelectItem value="javascript" className="text-xs">JavaScript</SelectItem>
                      <SelectItem value="python" className="text-xs">Python</SelectItem>
                      <SelectItem value="sql" className="text-xs">SQL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Source Code Snippet</label>
                <Textarea
                  value={codeContent}
                  onChange={(e) => setCodeContent(e.target.value)}
                  rows={14}
                  className="font-mono text-xs bg-background/50"
                />
              </div>

              <Button onClick={handleRunCodeReview} disabled={reviewLoading} className="w-full gap-2">
                {reviewLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Analyze Code with Gemini AI Reviewer
              </Button>
            </div>

            {/* Review Results Display */}
            <div>
              {!currentReview ? (
                <div className="h-full min-h-[350px] flex flex-col items-center justify-center p-8 border border-dashed border-border/60 rounded-xl text-center text-muted-foreground bg-background/20 space-y-3">
                  <Code2 className="h-10 w-10 opacity-40 text-primary" />
                  <p className="text-xs max-w-xs">
                    Paste your code on the left and click "Analyze Code" to receive multi-metric severity breakdown and recommended fixes.
                  </p>
                </div>
              ) : (
                <div className="p-5 rounded-xl bg-card border border-border space-y-5">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Code Quality Score</div>
                      <div className="text-2xl font-bold font-mono text-primary">{currentReview.overallScore}%</div>
                    </div>
                    <Badge variant={currentReview.overallScore >= 80 ? "default" : "secondary"}>
                      {currentReview.overallScore >= 80 ? "High Quality" : "Issues Detected"}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground">{currentReview.summary}</p>

                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-primary uppercase tracking-wider">
                      Severity Breakdown ({currentReview.issues.length} Issues)
                    </h4>

                    {currentReview.issues.map((iss) => (
                      <div key={iss.id} className="p-3.5 rounded-lg bg-secondary/30 border border-border/60 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <ShieldAlert className="h-3.5 w-3.5 text-destructive" />
                            {iss.category}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              iss.severity === "Critical" ? "text-destructive border-destructive/40 bg-destructive/10" :
                              iss.severity === "High" ? "text-warning border-warning/40 bg-warning/10" : "text-primary border-primary/40 bg-primary/10"
                            }`}
                          >
                            {iss.severity} Severity
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{iss.description}</p>
                        <div className="p-2.5 bg-background/60 rounded text-[11px] font-mono text-emerald-400 border border-border/40">
                          Recommended Fix: {iss.recommendedFix}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* MODE 2: SPOT THE BUGS (FLAWED CODE ASSESSMENT) */}
        <TabsContent value="spot-bugs" className="mt-6 space-y-6">
          {!flawedAssessment ? (
            <div className="text-center py-12 border border-dashed border-border/60 rounded-xl bg-background/30 space-y-4 max-w-lg mx-auto">
              <Bug className="h-10 w-10 mx-auto text-primary opacity-60" />
              <div>
                <h4 className="text-base font-semibold">AI-Generated Flawed Code Assessment</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Test your ability to review AI-generated code by detecting intentional security vulnerabilities, bugs, and performance flaws.
                </p>
              </div>
              <Button onClick={handleGenerateFlawedCode} disabled={flawedLoading} className="gap-2">
                {flawedLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate Flawed Code Challenge
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-5 rounded-xl bg-card border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold">{flawedAssessment.title}</h3>
                  <Button variant="outline" size="sm" onClick={handleGenerateFlawedCode} disabled={flawedLoading}>
                    Generate New Challenge
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{flawedAssessment.scenarioDescription}</p>

                <pre className="p-4 bg-secondary/40 rounded-lg text-xs font-mono overflow-x-auto text-foreground border border-border/60 mt-2">
                  {flawedAssessment.flawedCode}
                </pre>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold">1. Identify the Problems & Vulnerabilities</label>
                  <Textarea
                    value={identifiedIssues}
                    onChange={(e) => setIdentifiedIssues(e.target.value)}
                    placeholder="List all bugs, security risks, or performance flaws you found in the code..."
                    rows={6}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold">2. Fixed Implementation Code</label>
                  <Textarea
                    value={fixedCodeInput}
                    onChange={(e) => setFixedCodeInput(e.target.value)}
                    placeholder="Paste the corrected, refactored code here..."
                    rows={6}
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              <Button
                onClick={() => setFlawedSubmitted(true)}
                disabled={flawedSubmitted || !identifiedIssues.trim()}
                className="w-full"
              >
                {flawedSubmitted ? "Assessment Submitted & Evaluated" : "Submit Code Review Solution"}
              </Button>

              {flawedSubmitted && (
                <div className="p-5 rounded-xl bg-secondary/30 border border-border space-y-3">
                  <h4 className="text-sm font-semibold text-primary">Hidden Known Flaws in Challenge:</h4>
                  <ul className="list-disc pl-4 text-xs space-y-1">
                    {flawedAssessment.knownFlaws.map((flaw) => (
                      <li key={flaw.id}>
                        <strong className="text-foreground">[{flaw.type}]:</strong> {flaw.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
