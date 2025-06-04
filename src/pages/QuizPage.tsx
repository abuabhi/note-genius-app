
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useQuizList } from "@/hooks/useQuizzes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, History, GraduationCap, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuizPage = () => {
  const { userProfile } = useRequireAuth();
  const { quizzes, isLoading, error } = useQuizList();
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-mint-600" />
              Formal Quizzes
            </h1>
            <p className="text-muted-foreground mt-2">
              Take comprehensive multiple-choice quizzes to test your knowledge
            </p>
            <div className="mt-3 p-3 bg-mint-50 rounded-lg border border-mint-100">
              <div className="flex items-center gap-2 text-sm text-mint-700">
                <FileText className="h-4 w-4" />
                <span className="font-medium">Looking for flashcard practice?</span>
              </div>
              <p className="text-xs text-mint-600 mt-1">
                Use the "Timed Review" feature in your flashcard sets for quick flashcard assessments
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/quiz/history')}
              className="flex items-center gap-2"
            >
              <History className="h-4 w-4" />
              Quiz History
            </Button>
            <Button onClick={() => navigate('/quiz/create')}>
              <Plus className="h-4 w-4 mr-2" />
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
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-mint-600" />
                    {quiz.title}
                  </CardTitle>
                  <CardDescription>{quiz.description || "No description"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {quiz.questions?.length || 0} Multiple Choice Questions
                  </p>
                  <Link to={`/quizzes/${quiz.id}`}>
                    <Button className="w-full">Take Quiz</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <GraduationCap className="h-16 w-16 text-mint-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold">No formal quizzes found</h2>
            <p className="text-muted-foreground mb-6">Create your first multiple-choice quiz to get started</p>
            <Button onClick={() => navigate('/quiz/create')} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Quiz
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default QuizPage;
