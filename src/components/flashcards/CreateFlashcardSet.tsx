
import { useState } from "react";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CreateFlashcardSetPayload } from "@/types/flashcard";
import { useUserSubjects } from "@/hooks/useUserSubjects";

interface CreateFlashcardSetProps {
  onSuccess?: () => void;
  initialSubject?: string;
}

const CreateFlashcardSet = ({ onSuccess, initialSubject }: CreateFlashcardSetProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState(initialSubject || "");
  const [topic, setTopic] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createFlashcardSet } = useFlashcards();
  const { subjects: userSubjects, isLoading: subjectsLoading } = useUserSubjects();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Missing name",
        description: "Please provide a name for your flashcard set.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const setData: CreateFlashcardSetPayload = {
        name: name.trim(),
        description: description.trim() || undefined,
        subject: subject || undefined,
        topic: topic.trim() || undefined,
      };
      
      console.log("Creating flashcard set with data:", setData);
      
      const result = await createFlashcardSet(setData);
      
      if (result) {
        setName("");
        setDescription("");
        setSubject("");
        setTopic("");
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error("Error creating flashcard set:", error);
      toast({
        title: "Error",
        description: "Failed to create flashcard set. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create New Flashcard Set</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name"
              placeholder="Enter a name for this set"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea 
              id="description"
              placeholder="Enter a description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select value={subject} onValueChange={setSubject} disabled={isSubmitting || subjectsLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No subject</SelectItem>
                  {userSubjects.map((userSubject) => (
                    <SelectItem key={userSubject.id} value={userSubject.name}>
                      {userSubject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {initialSubject && (
                <p className="text-xs text-blue-600">Pre-filled from note subject</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="topic">Topic (optional)</Label>
              <Input 
                id="topic"
                placeholder="E.g. Algebra"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Set"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CreateFlashcardSet;
