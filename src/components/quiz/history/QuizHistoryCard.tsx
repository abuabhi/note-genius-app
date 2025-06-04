import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, Target, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface QuizResultItem {
  id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  duration_seconds: number | null;
  completed_at: string;
  quiz: {
    title: string;
    description: string | null;
  };
}

interface QuizSessionItem {
  id: string;
  flashcard_set_id: string;
  start_time: string;
  end_time: string;
  total_cards: number;
  correct_answers: number;
  total_score: number;
  duration_seconds: number;
  average_response_time: number;
  grade: string;
  flashcard_set: {
    name: string;
    subject: string;
  };
}

interface QuizHistoryCardProps {
  quiz: QuizResultItem | QuizSessionItem;
  type: 'traditional' | 'flashcard';
}

const getGradeFromScore = (score: number, total: number) => {
  const percentage = (score / total) * 100;
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
};

const getGradeColor = (grade: string) => {
  switch (grade) {
    case 'A': return 'bg-green-100 text-green-800 border-green-200';
    case 'B': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'C': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'D': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'F': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const QuizHistoryCard = ({ quiz, type }: QuizHistoryCardProps) => {
  if (type === 'traditional') {
    const traditionalQuiz = quiz as QuizResultItem;
    const grade = getGradeFromScore(traditionalQuiz.score, traditionalQuiz.total_questions);
    const percentage = Math.round((traditionalQuiz.score / traditionalQuiz.total_questions) * 100);
    
    return (
      <Card className="bg-white/60 backdrop-blur-sm border-mint-100">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-semibold text-mint-800">
                {traditionalQuiz.quiz?.title || 'Quiz'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Traditional Quiz • {formatDistanceToNow(new Date(traditionalQuiz.completed_at), { addSuffix: true })}
              </p>
            </div>
            <Badge className={`${getGradeColor(grade)} font-bold text-lg px-3 py-1`}>
              {grade}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-mint-600" />
              <div>
                <div className="text-sm font-medium">{traditionalQuiz.score}</div>
                <div className="text-xs text-muted-foreground">Score</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-sm font-medium">
                  {traditionalQuiz.score}/{traditionalQuiz.total_questions}
                </div>
                <div className="text-xs text-muted-foreground">
                  {percentage}% Correct
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-sm font-medium">
                  {traditionalQuiz.duration_seconds ? formatTime(traditionalQuiz.duration_seconds) : '--'}
                </div>
                <div className="text-xs text-muted-foreground">Duration</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-sm font-medium">{traditionalQuiz.total_questions}</div>
                <div className="text-xs text-muted-foreground">Questions</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  } else {
    const flashcardQuiz = quiz as QuizSessionItem;
    
    return (
      <Card className="bg-white/60 backdrop-blur-sm border-mint-100">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-semibold text-mint-800">
                {flashcardQuiz.flashcard_set?.name || 'Flashcard Quiz'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {flashcardQuiz.flashcard_set?.subject || 'Study'} • {formatDistanceToNow(new Date(flashcardQuiz.start_time), { addSuffix: true })}
              </p>
            </div>
            <Badge className={`${getGradeColor(flashcardQuiz.grade)} font-bold text-lg px-3 py-1`}>
              {flashcardQuiz.grade}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-mint-600" />
              <div>
                <div className="text-sm font-medium">{flashcardQuiz.total_score}</div>
                <div className="text-xs text-muted-foreground">Total Score</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-sm font-medium">
                  {flashcardQuiz.correct_answers}/{flashcardQuiz.total_cards}
                </div>
                <div className="text-xs text-muted-foreground">
                  {Math.round((flashcardQuiz.correct_answers / flashcardQuiz.total_cards) * 100)}% Correct
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-sm font-medium">{formatTime(flashcardQuiz.duration_seconds)}</div>
                <div className="text-xs text-muted-foreground">Total Time</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-sm font-medium">
                  {flashcardQuiz.average_response_time.toFixed(1)}s
                </div>
                <div className="text-xs text-muted-foreground">Avg. Time</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
};
