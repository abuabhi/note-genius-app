
import { useParams, useNavigate } from "react-router-dom";
import { useQuizDetails } from "@/hooks/quiz/useQuizDetails";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Edit, Trash2, Clock, HelpCircle, Home, BookOpen } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useSubjects } from "@/hooks/useSubjects";
import { useState } from "react";
import { DeleteQuizDialog } from "@/components/quiz/DeleteQuizDialog";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

const QuizDetailsPage = () => {
  const { id: quizId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userProfile } = useRequireAuth();
  const { data: quiz, isLoading, error } = useQuizDetails(quizId);
  const { academicSubjects } = useSubjects();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600">Quiz not found or error loading quiz.</p>
            <Button onClick={() => navigate("/quizzes")} className="mt-4">
              Back to Quizzes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwner = userProfile?.id === quiz.user_id;
  const subject = academicSubjects?.find(s => s.id === quiz.subject_id);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard" className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/quizzes" className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              Quizzes
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium text-mint-700">
              {quiz.title}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/quizzes")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quizzes
          </Button>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate(`/quiz/${quiz.id}/take`)}>
            <Play className="h-4 w-4 mr-2" />
            Take Quiz
          </Button>
          {isOwner && (
            <>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button 
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Quiz Info */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{quiz.title}</CardTitle>
              <CardDescription className="mt-2">
                {quiz.description || "No description available"}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="secondary">
              <HelpCircle className="h-3 w-3 mr-1" />
              {quiz.questions?.length || 0} questions
            </Badge>
            {subject && (
              <Badge variant="outline">{subject.name}</Badge>
            )}
            {quiz.is_public && (
              <Badge variant="default">Public</Badge>
            )}
          </div>
          <div className="flex items-center text-sm text-muted-foreground mt-2">
            <Clock className="h-4 w-4 mr-1" />
            Created {formatDistanceToNow(new Date(quiz.created_at), { addSuffix: true })}
          </div>
        </CardHeader>
      </Card>

      {/* Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Questions</CardTitle>
        </CardHeader>
        <CardContent>
          {quiz.questions && quiz.questions.length > 0 ? (
            <div className="space-y-6">
              {quiz.questions.map((question, index) => (
                <div key={question.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1">
                      {index + 1}
                    </Badge>
                    <div className="flex-1">
                      <h4 className="font-medium mb-3">{question.question}</h4>
                      <div className="space-y-2">
                        {question.options?.map((option, optIndex) => (
                          <div 
                            key={option.id} 
                            className={`p-2 rounded border ${
                              option.is_correct 
                                ? 'bg-green-50 border-green-200 text-green-800' 
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <span className="font-medium mr-2">
                              {String.fromCharCode(65 + optIndex)}.
                            </span>
                            {option.content}
                            {option.is_correct && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                Correct
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                      {question.explanation && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-sm text-blue-800">
                            <strong>Explanation:</strong> {question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No questions available for this quiz.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <DeleteQuizDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        quiz={quiz}
        onSuccess={() => navigate("/quizzes")}
      />
    </div>
  );
};

export default QuizDetailsPage;
