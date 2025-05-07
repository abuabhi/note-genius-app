
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X } from "lucide-react";
import { useStudySessions } from "@/hooks/useStudySessions";
import { useFlashcards } from "@/contexts/FlashcardContext";

interface SessionFormProps {
  onComplete: () => void;
  onCancel: () => void;
}

export const SessionForm = ({ onComplete, onCancel }: SessionFormProps) => {
  const [title, setTitle] = useState("Study Session");
  const [subject, setSubject] = useState("");
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  
  const { startSession } = useStudySessions();
  const { flashcardSets } = useFlashcards();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    startSession.mutate({
      title,
      subject: subject || null,
      flashcard_set_id: selectedSetId,
      notes: notes || null
    }, {
      onSuccess: () => {
        onComplete();
      }
    });
  };
  
  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Start New Study Session</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
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
            <Label htmlFor="subject">Subject (optional)</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Mathematics, History, etc."
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
        </CardContent>
        
        <CardFooter className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button type="submit">
            <Check className="mr-2 h-4 w-4" />
            Start Session
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
