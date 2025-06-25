
import { useState } from "react";
import { useQuizList } from "@/hooks/quiz/useQuizList";
import { useSubjects } from "@/hooks/useSubjects";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, Eye, Trash2, Search, Grid3X3, List, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DeleteQuizDialog } from "./DeleteQuizDialog";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Quiz } from "@/types/quiz";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type ViewMode = 'grid' | 'list' | 'compact';

const QuizList = () => {
  const navigate = useNavigate();
  const { userProfile } = useRequireAuth();
  const [filters, setFilters] = useState({
    subject: '',
    grade: '',
    section: '',
    search: '',
    userOnly: false
  });
  
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [deleteQuiz, setDeleteQuiz] = useState<Quiz | null>(null);

  const { data, isLoading, error, refetch } = useQuizList(filters);
  const { academicSubjects } = useSubjects();

  // Helper function to ensure source_type is properly typed
  const normalizeQuiz = (quiz: any): Quiz => ({
    ...quiz,
    source_type: quiz.source_type as 'prebuilt' | 'note' | 'custom'
  });

  const handleTakeQuiz = (quiz: any) => {
    const normalizedQuiz = normalizeQuiz(quiz);
    navigate(`/quiz/${normalizedQuiz.id}/take`);
  };

  const handleViewQuiz = (quiz: any) => {
    const normalizedQuiz = normalizeQuiz(quiz);
    navigate(`/quiz/${normalizedQuiz.id}/view`);
  };

  const handleDeleteQuiz = (quiz: any) => {
    const normalizedQuiz = normalizeQuiz(quiz);
    setDeleteQuiz(normalizedQuiz);
  };

  const handleDeleteSuccess = () => {
    setDeleteQuiz(null);
    refetch();
  };

  const isOwner = (quiz: any) => userProfile?.id === quiz.user_id;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-600">Error loading quizzes. Please try again.</p>
          <Button onClick={() => refetch()} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const quizzes = data?.quizzes || [];

  const renderQuizCard = (quiz: any) => {
    const subject = academicSubjects?.find(s => s.id === quiz.subject_id);
    
    return (
      <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg">{quiz.title}</CardTitle>
              <CardDescription className="mt-1">
                {quiz.description || "No description available"}
              </CardDescription>
            </div>
            {isOwner(quiz) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteQuiz(quiz)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="secondary">
              {quiz.questionCount} questions
            </Badge>
            {subject && (
              <Badge variant="outline">{subject.name}</Badge>
            )}
            {quiz.is_public && (
              <Badge variant="default">Public</Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex gap-2">
            <Button 
              onClick={() => handleTakeQuiz(quiz)}
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-2" />
              Take Quiz
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleViewQuiz(quiz)}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderQuizList = (quiz: any) => {
    const subject = academicSubjects?.find(s => s.id === quiz.subject_id);
    
    return (
      <Card key={quiz.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{quiz.title}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {quiz.description || "No description available"}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  {quiz.questionCount} questions
                </Badge>
                {subject && (
                  <Badge variant="outline" className="text-xs">{subject.name}</Badge>
                )}
                {quiz.is_public && (
                  <Badge variant="default" className="text-xs">Public</Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <Button size="sm" onClick={() => handleTakeQuiz(quiz)}>
                <Play className="h-4 w-4 mr-1" />
                Take
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleViewQuiz(quiz)}>
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              {isOwner(quiz) && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteQuiz(quiz)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderQuizCompact = (quiz: any) => {
    const subject = academicSubjects?.find(s => s.id === quiz.subject_id);
    
    return (
      <div key={quiz.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="font-medium">{quiz.title}</h3>
            <Badge variant="secondary" className="text-xs">
              {quiz.questionCount}Q
            </Badge>
            {subject && (
              <Badge variant="outline" className="text-xs">{subject.name}</Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button size="sm" onClick={() => handleTakeQuiz(quiz)}>
            <Play className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleViewQuiz(quiz)}>
            <Eye className="h-3 w-3" />
          </Button>
          {isOwner(quiz) && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDeleteQuiz(quiz)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Quizzes</h1>
        
        {/* View Toggle */}
        <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as ViewMode)}>
          <ToggleGroupItem value="grid" aria-label="Grid view">
            <Grid3X3 className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="compact" aria-label="Compact view">
            <MoreHorizontal className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search quizzes..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>
        
        <Select value={filters.subject} onValueChange={(value) => setFilters({ ...filters, subject: value })}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All subjects</SelectItem>
            {academicSubjects?.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={filters.userOnly ? "default" : "outline"}
          onClick={() => setFilters({ ...filters, userOnly: !filters.userOnly })}
        >
          My Quizzes
        </Button>
      </div>

      {/* Quiz List */}
      {quizzes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500 text-lg">No quizzes found.</p>
            <p className="text-gray-400 mt-2">Try adjusting your filters or create a new quiz.</p>
          </CardContent>
        </Card>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }>
          {quizzes.map((quiz) => {
            if (viewMode === 'grid') return renderQuizCard(quiz);
            if (viewMode === 'list') return renderQuizList(quiz);
            return renderQuizCompact(quiz);
          })}
        </div>
      )}

      {/* Delete Dialog */}
      {deleteQuiz && (
        <DeleteQuizDialog
          isOpen={!!deleteQuiz}
          onClose={() => setDeleteQuiz(null)}
          quiz={deleteQuiz}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
};

export default QuizList;
