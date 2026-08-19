import { createFileRoute } from "@tanstack/react-router";
import { PageBody, PageHeader } from "@/components/app-shell";
import { Panel } from "@/components/stat-card";
import { BookX, BookOpen, Plus, Search } from "lucide-react";
import { useAppStore, type Book } from "@/store/app-store";
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

export const Route = createFileRoute("/books")({
  head: () => ({
    meta: [
      { title: "Books · Engineering OS" },
      { name: "description", content: "Books shaping your engineering thinking." },
    ],
  }),
  component: BooksPage,
});

function BooksPage() {
  const books = useAppStore(state => state.books);
  const addBook = useAppStore(state => state.addBook);
  const [isOpen, setIsOpen] = useState(false);
  
  const [newBook, setNewBook] = useState<Omit<Book, "id">>({
    title: "",
    author: "",
    category: "Engineering",
    status: "To Read",
    progress: 0,
    notes: ""
  });

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.title) return;
    addBook(newBook);
    setIsOpen(false);
    setNewBook({
      title: "", author: "", category: "Engineering", status: "To Read", progress: 0, notes: ""
    });
  };

  return (
    <>
      <PageHeader 
        eyebrow="Slow inputs" 
        title="Books" 
        description="What you read shapes how you think." 
        actions={
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Add Book
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a Book</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddBook} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} placeholder="e.g. Designing Data-Intensive Applications" required />
                </div>
                <div className="space-y-2">
                  <Label>Author</Label>
                  <Input value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})} placeholder="e.g. Martin Kleppmann" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input value={newBook.category} onChange={e => setNewBook({...newBook, category: e.target.value})} placeholder="e.g. Engineering" />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <select 
                      className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      value={newBook.status} 
                      onChange={e => setNewBook({...newBook, status: e.target.value as any})}
                    >
                      <option value="To Read" className="bg-background">To Read</option>
                      <option value="Reading" className="bg-background">Reading</option>
                      <option value="Completed" className="bg-background">Completed</option>
                    </select>
                  </div>
                </div>
                <Button type="submit" className="w-full">Save Book</Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <PageBody>
        {books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground border border-dashed border-border/50 rounded-lg bg-background/20">
            <BookX className="h-10 w-10 mb-3 opacity-20" />
            <p className="text-[13px]">No books in your reading list yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {books.map(book => (
              <Panel key={book.id} className="!p-5 relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="font-semibold text-sm line-clamp-1">{book.title}</h3>
                      <p className="text-xs text-muted-foreground">{book.author}</p>
                    </div>
                    <Badge variant={book.status === "Completed" ? "default" : "secondary"}>{book.status}</Badge>
                  </div>
                  <Badge variant="outline" className="text-[10px] mt-1">{book.category}</Badge>
                </div>
                <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" />
                    {book.progress}% Completed
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