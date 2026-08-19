import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Sparkles, FolderOpen } from "lucide-react";
import { useState } from "react";
import { PageBody, PageHeader } from "@/components/app-shell";
import { Panel } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "Learning Journal · Engineering OS" },
      { name: "description", content: "Daily learnings, mistakes, and ideas." },
    ],
  }),
  component: JournalPage,
});

function JournalPage() {
  const { journalEntries, addJournalEntry, learningStreak } = useAppStore();
  
  const [learned, setLearned] = useState("");
  const [mistake, setMistake] = useState("");
  const [questions, setQuestions] = useState("");
  const [ideas, setIdeas] = useState("");

  const handleSave = () => {
    if (!learned && !mistake && !questions && !ideas) return;
    
    addJournalEntry({
      learned,
      mistake,
      questions,
      ideas,
    });
    
    setLearned("");
    setMistake("");
    setQuestions("");
    setIdeas("");
  };

  return (
    <>
      <PageHeader eyebrow="Compound daily" title="Learning Journal" description="What you write down is what you keep."
        actions={<Button size="sm" variant="secondary" className="gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Weekly AI summary</Button>}
      />
      <PageBody>
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Panel title="Today's entry">
              <div className="grid gap-3">
                <div>
                  <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">What I learned</div>
                  <Textarea value={learned} onChange={e => setLearned(e.target.value)} placeholder="What I learned…" className="min-h-20 resize-none border-border bg-background/40 text-[13px]" />
                </div>
                <div>
                  <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Mistakes</div>
                  <Textarea value={mistake} onChange={e => setMistake(e.target.value)} placeholder="Mistakes…" className="min-h-20 resize-none border-border bg-background/40 text-[13px]" />
                </div>
                <div>
                  <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Questions</div>
                  <Textarea value={questions} onChange={e => setQuestions(e.target.value)} placeholder="Questions…" className="min-h-20 resize-none border-border bg-background/40 text-[13px]" />
                </div>
                <div>
                  <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Ideas</div>
                  <Textarea value={ideas} onChange={e => setIdeas(e.target.value)} placeholder="Ideas…" className="min-h-20 resize-none border-border bg-background/40 text-[13px]" />
                </div>
                <div className="flex justify-end"><Button size="sm" onClick={handleSave}>Save entry</Button></div>
              </div>
            </Panel>
            
            {journalEntries.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border border-dashed border-border/50 rounded-lg bg-background/20">
                 <FolderOpen className="h-10 w-10 mb-3 opacity-20" />
                 <p className="text-[13px]">No journal entries yet.</p>
               </div>
            ) : (
              journalEntries.map((e) => (
                <Panel key={e.id} title={e.date}>
                  <dl className="space-y-3 text-[13px]">
                    {e.learned && (
                      <div>
                        <dt className="text-[11px] font-medium uppercase tracking-wider text-primary/80">Learned</dt>
                        <dd className="mt-0.5 text-foreground/90">{e.learned}</dd>
                      </div>
                    )}
                    {e.mistake && (
                      <div>
                        <dt className="text-[11px] font-medium uppercase tracking-wider text-destructive/80">Mistake</dt>
                        <dd className="mt-0.5 text-foreground/90">{e.mistake}</dd>
                      </div>
                    )}
                    {e.questions && (
                      <div>
                        <dt className="text-[11px] font-medium uppercase tracking-wider text-warning/80">Questions</dt>
                        <dd className="mt-0.5 text-foreground/90">{e.questions}</dd>
                      </div>
                    )}
                    {e.ideas && (
                      <div>
                        <dt className="text-[11px] font-medium uppercase tracking-wider text-success/80">Idea</dt>
                        <dd className="mt-0.5 text-foreground/90">{e.ideas}</dd>
                      </div>
                    )}
                  </dl>
                </Panel>
              ))
            )}
          </div>
          <div className="space-y-6">
            <Panel title="AI weekly summary">
              <div className="flex items-start gap-3">
                <BookOpen className="mt-0.5 h-4 w-4 text-primary" />
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  {journalEntries.length > 3 
                    ? "Your AI mentor is analyzing your recent patterns. (To be implemented)" 
                    : "Not enough entries this week to generate an AI summary. Keep writing!"}
                </p>
              </div>
            </Panel>
            <Panel title="Streak">
              <div className="text-center">
                <div className="font-mono text-3xl font-semibold text-primary">{learningStreak.currentStreak}</div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">days active</div>
              </div>
            </Panel>
          </div>
        </div>
      </PageBody>
    </>
  );
}