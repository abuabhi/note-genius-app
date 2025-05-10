
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Search, BookOpen, Award, Clock, Filter } from "lucide-react";
import { useQuizzes } from "@/hooks/useQuizzes";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSubjects } from "@/hooks/useSubjects";
import { useGrades } from "@/hooks/useGrades";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const QuizList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [subject, setSubject] = useState<string>("");
  const [grade, setGrade] = useState<string>("");
  
  const { quizzes, isLoading } = useQuizzes({
    subject: subject || undefined,
    grade: grade || undefined,
    search: searchQuery || undefined
  });
  const { subjects } = useSubjects();
  const { grades } = useGrades();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search quizzes..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">All Subjects</SelectItem>
              {subjects?.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={grade} onValueChange={setGrade}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Grades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">All Grades</SelectItem>
              {grades?.map((grade) => (
                <SelectItem key={grade.id} value={grade.id}>
                  {grade.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          // Skeleton loader
          Array(6).fill(0).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))
        ) : quizzes?.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-1">No quizzes found</h3>
            <p className="text-muted-foreground mb-4">Try changing your filters or create a new quiz.</p>
            <Button onClick={() => navigate("/quiz/create")}>Create Quiz</Button>
          </div>
        ) : (
          quizzes?.map((quiz) => (
            <Card key={quiz.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{quiz.title}</CardTitle>
                <div className="flex gap-1 flex-wrap mt-2">
                  <Badge variant="outline">{quiz.questions?.length || 0} questions</Badge>
                  {quiz.source_type && (
                    <Badge variant={quiz.source_type === 'prebuilt' ? 'secondary' : 'outline'}>
                      {quiz.source_type.charAt(0).toUpperCase() + quiz.source_type.slice(1)}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {quiz.description || "No description provided."}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
                  <Clock className="h-3 w-3" />
                  <span>Created {formatDate(quiz.created_at)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => navigate(`/quiz/take/${quiz.id}`)}
                >
                  Take Quiz
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default QuizList;
