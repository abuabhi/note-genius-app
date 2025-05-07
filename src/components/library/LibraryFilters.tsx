
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface FiltersProps {
  filters: {
    subject: string;
    gradeLevel: string;
    difficulty: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    subject: string;
    gradeLevel: string;
    difficulty: string;
  }>>;
}

export function LibraryFilters({ filters, setFilters }: FiltersProps) {
  const subjects = [
    "Mathematics", 
    "Sciences", 
    "Languages",
    "History",
    "Arts",
    "Computer Science"
  ];
  
  const gradeLevels = [
    "Elementary",
    "Middle School",
    "High School",
    "Undergraduate",
    "Graduate"
  ];
  
  const difficulties = [
    "Beginner",
    "Intermediate",
    "Advanced",
    "Expert"
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Select
            value={filters.subject}
            onValueChange={(value) => setFilters({ ...filters, subject: value })}
          >
            <SelectTrigger id="subject">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Subjects</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <Label htmlFor="gradeLevel">Grade Level</Label>
          <Select
            value={filters.gradeLevel}
            onValueChange={(value) => setFilters({ ...filters, gradeLevel: value })}
          >
            <SelectTrigger id="gradeLevel">
              <SelectValue placeholder="All Grade Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Grade Levels</SelectItem>
              {gradeLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty</Label>
          <Select
            value={filters.difficulty}
            onValueChange={(value) => setFilters({ ...filters, difficulty: value })}
          >
            <SelectTrigger id="difficulty">
              <SelectValue placeholder="All Difficulties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Difficulties</SelectItem>
              {difficulties.map((difficulty) => (
                <SelectItem key={difficulty} value={difficulty}>
                  {difficulty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
