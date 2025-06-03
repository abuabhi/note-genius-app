import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useQuizList } from "@/hooks/useQuizzes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, History } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuizPage = () => {
  const { userProfile } = useRequireAuth();
  const { data: quizzes, isLoading, error } = useQuizList();
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Quizzes</h1>
            <p className="text-muted-foreground">Test your knowledge and track your progress</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/quiz/history')}
              className="flex items-center gap-2"
            >
              <History className="h-4 w-4" />
              History
            </Button>
            <Button onClick={() => navigate('/quiz/create')}>
              Create Quiz
            </Button>
          </div>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle><Skeleton className="h-5 w-4/5" /></CardTitle>
                  <CardDescription><Skeleton className="h-4 w-3/5" /></CardDescription>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {error && (
          <div className="text-red-500">Error: {error.message}</div>
        )}

        {quizzes && quizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-md transition-shadow duration-200">
                <CardHeader>
                  <CardTitle>{quiz.title}</CardTitle>
                  <CardDescription>{quiz.description || "No description"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {quiz.questions?.length || 0} Questions
                  </p>
                  <Link to={`/quiz/take/${quiz.id}`}>
                    <Button className="mt-4 w-full">Take Quiz</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold">No quizzes found</h2>
            <p className="text-muted-foreground">Create a quiz to get started</p>
            <Button onClick={() => navigate('/quiz/create')} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Create Quiz
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default QuizPage;
