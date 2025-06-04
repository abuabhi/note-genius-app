
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuizList } from "@/hooks/quiz/useQuizList";
import { QuizWithQuestions } from "@/types/quiz";
import { Play, Clock, HelpCircle, Search, Plus, History } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const QuizList = () => {
  const navigate = useNavigate();
  const { quizzes, isLoading, error } = useQuizList();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredQuizzes = quizzes?.filter(quiz =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-white/60 backdrop-blur-sm border-mint-100">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-mint-200 rounded w-1/3"></div>
                <div className="h-4 bg-mint-200 rounded w-2/3"></div>
                <div className="h-10 bg-mint-200 rounded w-24"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-white/60 backdrop-blur-sm border-mint-100">
        <CardContent className="p-6 text-center">
          <div className="text-red-600 mb-4">Failed to load quizzes</div>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-mint-600 hover:bg-mint-700 text-white"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mint-500 h-4 w-4" />
          <Input
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-mint-200 focus:border-mint-400"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => navigate('/quiz-history')}
            variant="outline"
            className="border-mint-200 hover:bg-mint-50 text-mint-700"
          >
            <History className="mr-2 h-4 w-4" />
            Quiz History
          </Button>
          <Button 
            onClick={() => navigate('/create-quiz')}
            className="bg-mint-600 hover:bg-mint-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Quiz
          </Button>
        </div>
      </div>

      {filteredQuizzes.length === 0 ? (
        <Card className="bg-white/60 backdrop-blur-sm border-mint-100">
          <CardContent className="p-12 text-center">
            <HelpCircle className="h-12 w-12 text-mint-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-mint-800 mb-2">
              {searchTerm ? "No quizzes found" : "No quizzes yet"}
            </h3>
            <p className="text-mint-600 mb-6">
              {searchTerm 
                ? "Try adjusting your search terms" 
                : "Create your first quiz to get started"
              }
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => navigate('/create-quiz')}
                className="bg-mint-600 hover:bg-mint-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Quiz
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz: QuizWithQuestions) => (
            <QuizCard key={quiz.id} quiz={quiz} onTakeQuiz={() => navigate(`/quiz/${quiz.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
};

interface QuizCardProps {
  quiz: QuizWithQuestions;
  onTakeQuiz: () => void;
}

const QuizCard = ({ quiz, onTakeQuiz }: QuizCardProps) => {
  const questionCount = quiz.questions?.length || 0;
  
  return (
    <Card className="bg-white/60 backdrop-blur-sm border-mint-100 hover:shadow-lg transition-all duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          <Badge 
            variant="secondary" 
            className="bg-mint-100 text-mint-700 border-mint-200"
          >
            {questionCount} questions
          </Badge>
          <div className="text-xs text-mint-600">
            {quiz.created_at && formatDistanceToNow(new Date(quiz.created_at), { addSuffix: true })}
          </div>
        </div>
        <CardTitle className="text-lg text-mint-800 group-hover:text-mint-700 transition-colors">
          {quiz.title}
        </CardTitle>
        {quiz.description && (
          <CardDescription className="text-mint-600 line-clamp-2">
            {quiz.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-mint-600">
            <div className="flex items-center gap-1">
              <HelpCircle className="h-4 w-4" />
              <span>{questionCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>~{Math.ceil(questionCount * 1.5)}m</span>
            </div>
          </div>
          <Button 
            onClick={onTakeQuiz}
            size="sm"
            className="bg-mint-600 hover:bg-mint-700 text-white"
          >
            <Play className="mr-1 h-3 w-3" />
            Take Quiz
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
