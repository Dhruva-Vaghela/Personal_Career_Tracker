import { createFileRoute } from "@tanstack/react-router";
import { Server, Plus, Target } from "lucide-react";
import { PageBody, PageHeader } from "@/components/app-shell";
import { Panel } from "@/components/stat-card";
import { useAppStore, type TrackTopic } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/system-design")({
  head: () => ({
    meta: [
      { title: "System Design · Engineering OS" },
      { name: "description", content: "Scalable architecture concepts." },
    ],
  }),
  component: SystemDesignPage,
});

function SystemDesignPage() {
  const topics = useAppStore(state => state.systemDesignTopics);
  const addTopic = useAppStore(state => state.addSystemDesignTopic);
  const [isOpen, setIsOpen] = useState(false);
  
  const [newTopic, setNewTopic] = useState<Omit<TrackTopic, "id">>({
    title: "",
    status: "Learning",
    notes: ""
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.title) return;
    addTopic(newTopic);
    setIsOpen(false);
    setNewTopic({ title: "", status: "Learning", notes: "" });
  };

  return (
    <>
      <PageHeader 
        eyebrow="Architecture" 
        title="System Design" 
        description="Patterns for scaling." 
        actions={
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Add Topic
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add System Design Topic</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Topic Title</Label>
                  <Input value={newTopic.title} onChange={e => setNewTopic({...newTopic, title: e.target.value})} placeholder="e.g. Distributed Caching" required />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select 
                    className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={newTopic.status} 
                    onChange={e => setNewTopic({...newTopic, status: e.target.value as any})}
                  >
                    <option value="Learning" className="bg-background">Learning</option>
                    <option value="Review" className="bg-background">Review</option>
                    <option value="Completed" className="bg-background">Completed</option>
                  </select>
                </div>
                <Button type="submit" className="w-full">Save Topic</Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <PageBody>
        {topics.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground border border-dashed border-border/50 rounded-lg bg-background/20">
            <Server className="h-10 w-10 mb-3 opacity-20" />
            <p className="text-[13px]">No system design topics mapped yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {topics.map(topic => (
              <Panel key={topic.id} className="!p-5 relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-semibold text-sm line-clamp-1">{topic.title}</h3>
                    <Badge variant={topic.status === "Completed" ? "default" : "secondary"}>{topic.status}</Badge>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5" />
                    {topic.status === "Completed" ? "Mastered" : "In Progress"}
                  </div>
                </div>
              </Panel>
            ))}
          </div>
        )}
      </PageBody>
    </>
  );
}