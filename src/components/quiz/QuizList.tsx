import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuizList } from "@/hooks/quiz/useQuizList";
import { useSubjects } from "@/hooks/useSubjects";
import { Quiz } from "@/types/quiz";
import { Play, Clock, HelpCircle, Search, History } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const QuizList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  
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
    navigate(`/quiz/${quiz.id}`);
  };

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

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
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
        <div className="space-y-4">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{quiz.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {quiz.description || "No description available"}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleTakeQuiz(quiz as Quiz)}>
                      <Play className="h-4 w-4 mr-2" />
                      Take Quiz
                    </Button>
                    <Button variant="outline" onClick={() => handleViewQuiz(quiz as Quiz)}>
                      <History className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary">
                    <HelpCircle className="h-3 w-3 mr-1" />
                    {(quiz as any).questions?.length || 0} questions
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
          ))}
        </div>
      )}
    </div>
  );
};
