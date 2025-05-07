
import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, SkipForward, Clock, Coffee } from "lucide-react";
import { formatTime } from "@/utils/formatTime";

interface StudyTimerProps {
  isActive: boolean;
  mode: "focus" | "break";
  focusTime: number;
  breakTime: number;
  onStart: () => void;
  onPause: () => void;
  onToggleMode: () => void;
  onTick: () => void;
}

export const StudyTimer = ({
  isActive,
  mode,
  focusTime,
  breakTime,
  onStart,
  onPause,
  onToggleMode,
  onTick
}: StudyTimerProps) => {
  const [seconds, setSeconds] = useState(0);
  
  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(prev => (prev + 1) % 60);
        if (seconds === 59) {
          onTick();
        }
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isActive, seconds, onTick]);
  
  return (
    <Card className="shadow-md">
      <CardHeader className="space-y-1">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl">Study Timer</CardTitle>
          <Badge variant={mode === "focus" ? "default" : "secondary"}>
            {mode === "focus" ? (
              <Clock className="w-3 h-3 mr-1" />
            ) : (
              <Coffee className="w-3 h-3 mr-1" />
            )}
            {mode === "focus" ? "Focus Mode" : "Break Time"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex items-center justify-center">
          <div className="text-5xl font-bold text-center my-4">
            {formatTime(mode === "focus" ? focusTime : breakTime)}:{seconds.toString().padStart(2, '0')}
          </div>
        </div>
        
        <div className="flex justify-between text-sm text-muted-foreground mt-2">
          <span>Total Focus: {formatTime(focusTime)}</span>
          <span>Total Break: {formatTime(breakTime)}</span>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant={isActive ? "outline" : "default"}
          onClick={isActive ? onPause : onStart}
          className="w-28"
        >
          {isActive ? (
            <>
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Start
            </>
          )}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={onToggleMode}
          className="w-28"
        >
          <SkipForward className="mr-2 h-4 w-4" />
          {mode === "focus" ? "Take Break" : "Resume Focus"}
        </Button>
      </CardFooter>
    </Card>
  );
};
