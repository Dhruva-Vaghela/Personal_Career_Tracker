import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import type { ProjectCategory, ProjectStatus } from "../types";

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const addProject = useAppStore((state) => state.addProject);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ProjectCategory>("Personal Project");
  const [status, setStatus] = useState<ProjectStatus>("Planning");
  const [technologies, setTechnologies] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [liveLink, setLiveLink] = useState("");

  const handleSave = () => {
    if (!title.trim() || !description.trim()) return;

    addProject({
      source: "MANUAL",
      title,
      description,
      category,
      status,
      technologies: technologies.split(",").map((t) => t.trim()).filter(Boolean),
      githubUrl: githubUrl || undefined,
      liveLink: liveLink || undefined,
    });

    setOpen(false);
    reset();
  };

  const reset = () => {
    setTitle("");
    setDescription("");
    setCategory("Personal Project");
    setStatus("Planning");
    setTechnologies("");
    setGithubUrl("");
    setLiveLink("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" size="sm">
          <Plus className="h-4 w-4" />
          Add Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Manual Project</DialogTitle>
          <DialogDescription>
            Add a project that isn't on your GitHub to build out your portfolio.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Key-Value Store"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of what the project does..."
              className="resize-none h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(v: ProjectCategory) => setCategory(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hackathon">Hackathon</SelectItem>
                  <SelectItem value="College Project">College Project</SelectItem>
                  <SelectItem value="Freelance">Freelance</SelectItem>
                  <SelectItem value="Research">Research</SelectItem>
                  <SelectItem value="Personal Project">Personal Project</SelectItem>
                  <SelectItem value="Startup Idea">Startup Idea</SelectItem>
                  <SelectItem value="Problem Statement">Problem Statement</SelectItem>
                  <SelectItem value="Open Source">Open Source</SelectItem>
                  <SelectItem value="Competition">Competition</SelectItem>
                  <SelectItem value="Client Work">Client Work</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(v: ProjectStatus) => setStatus(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planning">Planning</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                  <SelectItem value="Maintained">Maintained</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="technologies">Technologies (comma separated)</Label>
            <Input
              id="technologies"
              value={technologies}
              onChange={(e) => setTechnologies(e.target.value)}
              placeholder="React, Node.js, PostgreSQL"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="githubUrl">GitHub URL (Optional)</Label>
              <Input
                id="githubUrl"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="liveLink">Live Link (Optional)</Label>
              <Input
                id="liveLink"
                value={liveLink}
                onChange={(e) => setLiveLink(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!title.trim() || !description.trim()}>Save Project</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
