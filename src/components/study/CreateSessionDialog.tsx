
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStudySessions } from "@/hooks/useStudySessions";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { toast } from "sonner";

interface CreateSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSubject?: string;
  defaultTitle?: string;
}

export const CreateSessionDialog = ({ 
  open, 
  onOpenChange, 
  defaultSubject = "",
  defaultTitle = "Study Session"
}: CreateSessionDialogProps) => {
  const [title, setTitle] = useState(defaultTitle);
  const [subject, setSubject] = useState(defaultSubject);
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  
  const { startSession } = useStudySessions();
  
  // Safely try to get flashcard context - it might not be available in all contexts
  let flashcardSets: any[] = [];
  try {
    const flashcardContext = useFlashcards();
    flashcardSets = flashcardContext?.flashcardSets || [];
  } catch (error) {
    console.warn('FlashcardContext not available in CreateSessionDialog:', error);
    // Continue without flashcard sets - they're optional
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await startSession.mutateAsync({
        title,
        subject: subject || null,
        flashcard_set_id: selectedSetId,
        notes: notes || null
      });
      
      toast.success("Study session started successfully!");
      onOpenChange(false);
      
      // Reset form
      setTitle("Study Session");
      setSubject("");
      setSelectedSetId(null);
      setNotes("");
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error("Failed to start study session");
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Start New Study Session</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Session Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Study Session"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Mathematics, English, etc."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="flashcard-set">Flashcard Set (optional)</Label>
            <Select
              value={selectedSetId || ""}
              onValueChange={(value) => setSelectedSetId(value || null)}
            >
              <SelectTrigger id="flashcard-set">
                <SelectValue placeholder="Select a flashcard set" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {flashcardSets.map((set) => (
                  <SelectItem key={set.id} value={set.id}>{set.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes or goals for this session"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={startSession.isPending}>
              {startSession.isPending ? "Starting..." : "Start Session"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
