
import React from 'react';
import { useQuizList } from '@/hooks/quiz';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Eye, Users, Clock, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { EmptyState } from '@/components/ui/empty-state';

const QuizList = () => {
  const { data, isLoading, error } = useQuizList();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <p className="font-medium">Error loading quizzes</p>
          <p className="text-sm text-gray-600 mt-1">
            {error.message || 'Something went wrong. Please try again.'}
          </p>
        </div>
      </Card>
    );
  }

  const quizzes = data?.quizzes || [];

  if (quizzes.length === 0) {
    return (
      <EmptyState
        title="No quizzes found"
        description="Get started by creating your first quiz or check if there are any public quizzes available."
        icon={<BookOpen className="h-8 w-8 text-gray-400" />}
        action={
          <Button asChild>
            <Link to="/quiz/create">
              Create Your First Quiz
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {quizzes.map((quiz) => (
        <Card key={quiz.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{quiz.title}</CardTitle>
                <CardDescription className="mt-1">
                  {quiz.description || "No description available"}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button asChild size="sm">
                  <Link to={`/quiz/${quiz.id}/take`}>
                    <Play className="h-4 w-4 mr-1" />
                    Take Quiz
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/quiz/${quiz.id}`}>
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 items-center">
              <Badge variant="secondary" className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {quiz.questionCount || 0} questions
              </Badge>
              
              {quiz.academic_subjects?.name && (
                <Badge variant="outline">
                  {quiz.academic_subjects.name}
                </Badge>
              )}
              
              {quiz.is_public && (
                <Badge variant="default" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Public
                </Badge>
              )}
              
              <div className="flex items-center text-xs text-gray-500 ml-auto">
                <Clock className="h-3 w-3 mr-1" />
                {formatDistanceToNow(new Date(quiz.created_at), { addSuffix: true })}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QuizList;
