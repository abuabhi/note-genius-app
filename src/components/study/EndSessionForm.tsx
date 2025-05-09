
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Clock, BookOpen, Save } from "lucide-react";
import { useStudySessions, StudySession } from "@/hooks/useStudySessions";
import { formatDuration } from "@/utils/formatTime";

interface EndSessionFormProps {
  activeSession: StudySession;
  focusTime: number;
  breakTime: number;
  onComplete: () => void;
}

export const EndSessionForm = ({ 
  activeSession, 
  focusTime, 
  breakTime, 
  onComplete 
}: EndSessionFormProps) => {
  const [notes, setNotes] = useState(activeSession.notes || "");
  const { endSession } = useStudySessions();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const endSessionData = {
      sessionId: activeSession.id,
      endTime: new Date(),
      duration: focusTime + breakTime,
      notes,
      focusTime,
      breakTime
    };
    
    endSession.mutate(endSessionData, {
      onSuccess: () => {
        onComplete();
      }
    });
  };
  
  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>End Study Session</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-secondary/30 p-4 rounded-md">
            <h3 className="font-medium">{activeSession.title}</h3>
            {activeSession.subject && (
              <div className="flex items-center text-sm mt-1">
                <BookOpen className="h-3.5 w-3.5 mr-1" />
                <span>{activeSession.subject}</span>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <div className="text-xs text-muted-foreground">Focus Time</div>
                <div className="flex items-center mt-1">
                  <Clock className="h-3.5 w-3.5 mr-1 text-primary" />
                  <span>{formatDuration(focusTime)}</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Break Time</div>
                <div className="flex items-center mt-1">
                  <Clock className="h-3.5 w-3.5 mr-1 text-green-600" />
                  <span>{formatDuration(breakTime)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Session Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you accomplish? What did you learn?"
              rows={4}
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end">
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Save & End Session
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
