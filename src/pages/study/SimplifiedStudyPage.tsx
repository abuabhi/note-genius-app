
import { useParams, Navigate, useSearchParams } from "react-router-dom";
import { useOptimizedFlashcardStudy } from "@/hooks/useOptimizedFlashcardStudy";
import { SimplifiedFlashcardStudy } from "@/components/study/SimplifiedFlashcardStudy";
import { StudyMode } from "./types";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home, BookOpen } from "lucide-react";

export const SimplifiedStudyPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get('mode');
  
  console.log("SimplifiedStudyPage: Params received", { id, mode: modeParam });
  console.log("SimplifiedStudyPage: Current URL:", window.location.pathname);
  
  // Support all three study modes
  const getInitialMode = (): StudyMode => {
    switch (modeParam) {
      case "review":
        return "review";
      case "test":
        return "test";
      case "learn":
      default:
        return "learn";
    }
  };
  
  const mode = getInitialMode();
  
  if (!id) {
    console.log("SimplifiedStudyPage: No id provided, redirecting to flashcards");
    return <Navigate to="/flashcards" />;
  }

  // Use the optimized hook directly - it handles all the data fetching and session management
  const {
    flashcards,
    isLoading,
    error,
    currentCard,
    totalCards
  } = useOptimizedFlashcardStudy({ setId: id, mode });

  // Get set name from first flashcard or use fallback
  const setName = flashcards.length > 0 ? `Study Session` : "Loading...";

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard" className="flex items-center gap-1">
                  <Home className="h-3 w-3" />
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/flashcards" className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  Flashcards
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Error</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col gap-4">
            <div>
              <strong>Failed to load flashcard set</strong>
              <p className="mt-1">{error.message || "An unexpected error occurred while loading the flashcard set."}</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" asChild>
                <Link to="/flashcards">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Flashcards
                </Link>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard" className="flex items-center gap-1">
                  <Home className="h-3 w-3" />
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/flashcards" className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  Flashcards
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Loading...</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="border rounded-lg p-8">
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="flex justify-center gap-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    );
  }

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard" className="flex items-center gap-1">
                  <Home className="h-3 w-3" />
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/flashcards" className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  Flashcards
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Empty Set</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <Alert className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col gap-4">
            <div>
              <strong>No flashcards found</strong>
              <p className="mt-1">This flashcard set appears to be empty. Add some flashcards to start studying!</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/flashcards">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Flashcards
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard" className="flex items-center gap-1">
                <Home className="h-3 w-3" />
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/flashcards" className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                Flashcards
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{setName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold">{setName}</h1>
            <p className="text-muted-foreground mt-1">
              {totalCards} flashcard{totalCards !== 1 ? 's' : ''} • {mode.charAt(0).toUpperCase() + mode.slice(1)} mode
            </p>
          </div>
        </div>
      </div>
      
      {/* Use the existing simplified flashcard study component */}
      <SimplifiedFlashcardStudy setId={id} mode={mode} />
    </div>
  );
};
