
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuizList } from "@/hooks/quiz/useQuizList";
import { useSubjects } from "@/hooks/useSubjects";
import { useViewPreferences } from "@/hooks/useViewPreferences";
import { Quiz } from "@/types/quiz";
import { Play, Clock, HelpCircle, Search, History, MoreVertical, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ViewToggle } from "@/components/notes/page/ViewToggle";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { DeleteQuizDialog } from "./DeleteQuizDialog";

export const QuizList = () => {
  const navigate = useNavigate();
  const { userProfile } = useRequireAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [deleteQuiz, setDeleteQuiz] = useState<Quiz | null>(null);
  
  const { viewMode, setViewMode } = useViewPreferences('quizzes', 'grid');
  const { academicSubjects } = useSubjects();
  const { data, isLoading, error } = useQuizList({
    search: searchTerm,
    subject: selectedSubject === "all" ? undefined : selectedSubject
  });

  // Extract quizzes from the returned data
  const quizzes = data?.quizzes || [];

  const handleTakeQuiz = (quiz: Quiz) => {
    navigate(`/quiz/${quiz.id}/take`);
  };

  const handleViewQuiz = (quiz: Quiz) => {
    navigate(`/quiz/${quiz.id}/view`);
  };

  const handleDeleteQuiz = (quiz: Quiz) => {
    setDeleteQuiz(quiz);
  };

  const isOwner = (quiz: Quiz) => userProfile?.id === quiz.user_id;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-600">Error loading quizzes: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  const renderQuizCard = (quiz: Quiz) => (
    <Card key={quiz.id} className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl">{quiz.title}</CardTitle>
            <CardDescription className="mt-1">
              {quiz.description || "No description available"}
            </CardDescription>
          </div>
          <div className="flex gap-2 items-center">
            <Button onClick={() => handleTakeQuiz(quiz)} size="sm">
              <Play className="h-4 w-4 mr-2" />
              Take Quiz
            </Button>
            <Button variant="outline" onClick={() => handleViewQuiz(quiz)} size="sm">
              <History className="h-4 w-4 mr-2" />
              View
            </Button>
            {isOwner(quiz) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem 
                    onClick={() => handleDeleteQuiz(quiz)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Quiz
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="secondary">
            <HelpCircle className="h-3 w-3 mr-1" />
            {(quiz as any).questionCount || 0} questions
          </Badge>
          {quiz.subject_id && (
            <Badge variant="outline">
              {academicSubjects?.find(s => s.id === quiz.subject_id)?.name || "Unknown Subject"}
            </Badge>
          )}
          {quiz.is_public && (
            <Badge variant="default">Public</Badge>
          )}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="h-4 w-4 mr-1" />
          Created {formatDistanceToNow(new Date(quiz.created_at), { addSuffix: true })}
        </div>
      </CardContent>
    </Card>
  );

  const renderListView = (quiz: Quiz) => (
    <Card key={quiz.id} className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="font-medium">{quiz.title}</h3>
              <div className="flex gap-1">
                <Badge variant="secondary" className="text-xs">
                  {(quiz as any).questionCount || 0} questions
                </Badge>
                {quiz.subject_id && (
                  <Badge variant="outline" className="text-xs">
                    {academicSubjects?.find(s => s.id === quiz.subject_id)?.name}
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {quiz.description || "No description available"}
            </p>
          </div>
          <div className="flex gap-2 items-center ml-4">
            <Button onClick={() => handleTakeQuiz(quiz)} size="sm">
              <Play className="h-4 w-4 mr-1" />
              Take
            </Button>
            <Button variant="outline" onClick={() => handleViewQuiz(quiz)} size="sm">
              <History className="h-4 w-4 mr-1" />
              View
            </Button>
            {isOwner(quiz) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem 
                    onClick={() => handleDeleteQuiz(quiz)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderCompactView = (quiz: Quiz) => (
    <div key={quiz.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{quiz.title}</span>
          <Badge variant="secondary" className="text-xs">
            {(quiz as any).questionCount || 0}
          </Badge>
          {quiz.subject_id && (
            <Badge variant="outline" className="text-xs">
              {academicSubjects?.find(s => s.id === quiz.subject_id)?.name}
            </Badge>
          )}
        </div>
      </div>
      <div className="flex gap-1">
        <Button onClick={() => handleTakeQuiz(quiz)} size="sm" variant="ghost">
          <Play className="h-4 w-4" />
        </Button>
        <Button variant="ghost" onClick={() => handleViewQuiz(quiz)} size="sm">
          <History className="h-4 w-4" />
        </Button>
        {isOwner(quiz) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem 
                onClick={() => handleDeleteQuiz(quiz)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Search, Filters, and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {academicSubjects?.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
      </div>

      {/* Quiz List */}
      {!quizzes || quizzes.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No quizzes found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedSubject !== "all"
                ? "Try adjusting your search filters"
                : "Create your first quiz to get started"}
            </p>
            <Button onClick={() => navigate("/quiz/create")}>
              Create Quiz
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" 
            : "space-y-3"
        }>
          {quizzes.map((quiz) => {
            switch (viewMode) {
              case 'list':
                return renderListView(quiz);
              case 'compact':
                return renderCompactView(quiz);
              default:
                return renderQuizCard(quiz);
            }
          })}
        </div>
      )}

      {/* Delete Dialog */}
      {deleteQuiz && (
        <DeleteQuizDialog
          isOpen={!!deleteQuiz}
          onClose={() => setDeleteQuiz(null)}
          quiz={deleteQuiz}
          onSuccess={() => {
            setDeleteQuiz(null);
            // Quiz list will automatically refresh due to query invalidation
          }}
        />
      )}
    </div>
  );
};
