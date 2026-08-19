import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Trash2, RefreshCw } from "lucide-react";
import { CodingPracticeService } from "../../services/coding-practice.service";
import { SolutionReviewService } from "../../services/solution-review.service";
import { AIReviewDisplay } from "./ai-review-display";
import { useCodingStore } from "../../store/coding-store";

interface SolutionPanelProps {
  problemId: string;
}

const SUPPORTED_LANGUAGES = ["C", "C++", "Java", "Python", "JavaScript", "TypeScript", "Go", "Rust", "Other"];

export function SolutionPanel({ problemId }: SolutionPanelProps) {
  const problems = useCodingStore(state => state.problems);
  const problem = problems.find(p => p.id === problemId);
  
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState(SUPPORTED_LANGUAGES[5]); // TypeScript default
  const [isReviewing, setIsReviewing] = useState(false);
  
  const hasSolutions = problem && problem.solutions && problem.solutions.length > 0;
  const [activeTab, setActiveTab] = useState<string>(hasSolutions ? "past" : "new");

  useEffect(() => {
    if (!hasSolutions) {
      setActiveTab("new");
    }
  }, [hasSolutions]);

  if (!problem) return null;

  const handleReview = async () => {
    if (!code.trim()) return;
    setIsReviewing(true);
    
    try {
      const review = await SolutionReviewService.generateReview(code, language, problem.title);
      CodingPracticeService.addSolutionToProblem(problemId, code, language, review);
      setCode("");
      setActiveTab("past");
    } catch (e) {
      console.error(e);
    } finally {
      setIsReviewing(false);
    }
  };

  const handleRegenerate = async (solutionId: string, currentCode: string, currentLang: string) => {
    setIsReviewing(true);
    try {
      const review = await SolutionReviewService.generateReview(currentCode, currentLang, problem.title);
      CodingPracticeService.updateSolution(problemId, solutionId, { aiReview: review });
    } catch (e) {
      console.error(e);
    } finally {
      setIsReviewing(false);
    }
  };

  const handleDelete = (solutionId: string) => {
    if (confirm("Are you sure you want to delete this solution and its review?")) {
      CodingPracticeService.deleteSolution(problemId, solutionId);
    }
  };

  return (
    <div className="flex flex-col gap-6 pt-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="new">Submit New Solution</TabsTrigger>
          {hasSolutions && (
            <TabsTrigger value="past">Past Solutions ({problem.solutions.length})</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="new">
          <div className="bg-muted/30 p-4 rounded-md">
            <h4 className="text-sm font-semibold mb-3">Paste Your Solution</h4>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LANGUAGES.map(lang => (
                      <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Textarea 
                placeholder="Paste your full solution code here..." 
                className="font-mono text-xs min-h-[300px] border-border/50 focus-visible:ring-primary/50"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <div className="flex justify-end pt-2">
                <Button onClick={handleReview} disabled={!code.trim() || isReviewing}>
                  {isReviewing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  AI Code Review
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {hasSolutions && (
          <TabsContent value="past">
            <Tabs defaultValue={problem.solutions[problem.solutions.length - 1].id}>
              <TabsList className="mb-4 flex flex-wrap h-auto">
                {problem.solutions.map((sol, index) => (
                  <TabsTrigger key={sol.id} value={sol.id} className="text-xs">
                    Attempt {index + 1} ({sol.language}) - {format(new Date(sol.submittedAt), "MMM d")}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {problem.solutions.map((sol) => (
                <TabsContent key={sol.id} value={sol.id}>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="rounded-md border p-4 bg-muted/20 relative group">
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleRegenerate(sol.id, sol.code, sol.language)} disabled={isReviewing} title="Regenerate Review">
                          <RefreshCw className={`h-3 w-3 ${isReviewing ? "animate-spin" : ""}`} />
                        </Button>
                        <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => handleDelete(sol.id)} title="Delete Solution">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <pre className="text-[11px] overflow-x-auto whitespace-pre-wrap font-mono mt-4">
                        {sol.code}
                      </pre>
                    </div>
                    {sol.aiReview && (
                      <AIReviewDisplay review={sol.aiReview} />
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
