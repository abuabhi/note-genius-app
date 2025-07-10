
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Plus, X } from "lucide-react";
import { OnboardingData } from "../OnboardingWizard";
import { PREDEFINED_SUBJECTS, GradeLevel } from "@/types/subject";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SubjectStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const GRADE_SPECIFIC_SUBJECTS = {
  "Grade 10": [
    "Mathematics",
    "Biology", 
    "Physics",
    "Chemistry",
    "English Language",
    "English Literature",
    "History",
    "Geography",
    "Civics",
    "Computer Science",
    "Physical Education",
    "Art",
    "Music",
    "Second Language"
  ],
  "Grade 11": {
    "Science Stream": [
      "Mathematics",
      "Physics", 
      "Chemistry",
      "Biology",
      "Computer Science",
      "English",
      "Physical Education",
      "Environmental Science"
    ],
    "Commerce Stream": [
      "Accountancy",
      "Business Studies",
      "Economics", 
      "Mathematics",
      "English",
      "Informatics Practices",
      "Physical Education"
    ],
    "Arts/Humanities Stream": [
      "History",
      "Geography",
      "Political Science",
      "Sociology",
      "Psychology", 
      "English",
      "Philosophy",
      "Education",
      "Fine Arts"
    ]
  },
  "Grade 12": {
    "Science Stream": [
      "Mathematics",
      "Physics",
      "Chemistry", 
      "Biology",
      "Computer Science",
      "English",
      "Physical Education",
      "Environmental Science"
    ],
    "Commerce Stream": [
      "Accountancy",
      "Business Studies",
      "Economics",
      "Mathematics", 
      "English",
      "Informatics Practices",
      "Physical Education"
    ],
    "Arts/Humanities Stream": [
      "History",
      "Geography",
      "Political Science",
      "Sociology",
      "Psychology",
      "English", 
      "Philosophy",
      "Education",
      "Fine Arts"
    ]
  },
  "Undergraduate": {
    "Bachelor of Science (B.Sc.)": [
      "Physics",
      "Chemistry",
      "Biology",
      "Mathematics",
      "Computer Science",
      "Statistics",
      "Environmental Science"
    ],
    "Bachelor of Commerce (B.Com.)": [
      "Accountancy",
      "Business Law",
      "Economics",
      "Finance",
      "Taxation",
      "Auditing",
      "Business Mathematics",
      "Marketing"
    ],
    "Bachelor of Arts (B.A.)": [
      "History",
      "Political Science",
      "Sociology",
      "Psychology",
      "Philosophy",
      "English",
      "Education",
      "Anthropology",
      "Linguistics"
    ],
    "Bachelor of Technology / Engineering (B.Tech/B.E.)": [
      "Mathematics",
      "Physics", 
      "Chemistry",
      "Data Structures",
      "Algorithms",
      "Computer Programming",
      "Electrical Engineering",
      "Electronics Engineering",
      "Mechanical Engineering",
      "Civil Engineering",
      "Engineering Drawing",
      "Control Systems"
    ]
  }
};

export const SubjectStep = ({ data, updateData, onNext, onPrev }: SubjectStepProps) => {
  const [customSubject, setCustomSubject] = useState("");
  const [selectedStream, setSelectedStream] = useState<string>("");
  const [selectedDegree, setSelectedDegree] = useState<string>("");
  
  const canProceed = data.selectedSubjects.size > 0;
  const grade = data.grade as GradeLevel;

  // Get available subjects based on grade and stream/degree selection
  const getAvailableSubjects = (): string[] => {
    if (grade === "Grade 10" && GRADE_SPECIFIC_SUBJECTS[grade]) {
      return GRADE_SPECIFIC_SUBJECTS[grade];
    }
    
    if ((grade === "Grade 11" || grade === "Grade 12") && selectedStream) {
      const gradeData = GRADE_SPECIFIC_SUBJECTS[grade];
      if (gradeData && typeof gradeData === 'object' && selectedStream in gradeData) {
        return (gradeData as any)[selectedStream];
      }
    }
    
    if (grade === "Undergraduate" && selectedDegree) {
      const gradeData = GRADE_SPECIFIC_SUBJECTS[grade];
      if (gradeData && typeof gradeData === 'object' && selectedDegree in gradeData) {
        return (gradeData as any)[selectedDegree];
      }
    }
    
    // Fallback to predefined subjects for other grades
    return [...PREDEFINED_SUBJECTS];
  };

  // Get available streams for Grade 11/12
  const getAvailableStreams = (): string[] => {
    if ((grade === "Grade 11" || grade === "Grade 12")) {
      const gradeData = GRADE_SPECIFIC_SUBJECTS[grade];
      if (gradeData && typeof gradeData === 'object') {
        return Object.keys(gradeData);
      }
    }
    return [];
  };

  // Get available degrees for Undergraduate
  const getAvailableDegrees = (): string[] => {
    if (grade === "Undergraduate") {
      const gradeData = GRADE_SPECIFIC_SUBJECTS.Undergraduate;
      if (gradeData && typeof gradeData === 'object') {
        return Object.keys(gradeData);
      }
    }
    return [];
  };

  // Auto-select top 7 subjects when grade/stream/degree changes
  useEffect(() => {
    const availableSubjects = getAvailableSubjects();
    const predefinedSubjectsArray = [...PREDEFINED_SUBJECTS];
    
    // Check if we have grade-specific subjects (not the default predefined ones)
    const hasGradeSpecificSubjects = availableSubjects.length > 0 && 
      JSON.stringify(availableSubjects) !== JSON.stringify(predefinedSubjectsArray);
    
    if (hasGradeSpecificSubjects) {
      // Only auto-select if we have grade-specific subjects and haven't selected any yet
      if (data.selectedSubjects.size === 0 || 
          !Array.from(data.selectedSubjects).some(subject => availableSubjects.includes(subject))) {
        // Select top 7 subjects
        const topSevenSubjects = availableSubjects.slice(0, 7);
        const newSelected = new Set(topSevenSubjects);
        updateData({ selectedSubjects: newSelected });
      }
    }
  }, [grade, selectedStream, selectedDegree]);

  const toggleSubject = (subject: string) => {
    const newSelected = new Set(data.selectedSubjects);
    if (newSelected.has(subject)) {
      newSelected.delete(subject);
    } else {
      newSelected.add(subject);
    }
    updateData({ selectedSubjects: newSelected });
  };

  const addCustomSubject = () => {
    if (!customSubject.trim()) return;
    
    const newSelected = new Set(data.selectedSubjects);
    newSelected.add(customSubject.trim());
    updateData({ selectedSubjects: newSelected });
    setCustomSubject("");
  };

  const removeSubject = (subject: string) => {
    const newSelected = new Set(data.selectedSubjects);
    newSelected.delete(subject);
    updateData({ selectedSubjects: newSelected });
  };

  const availableSubjects = getAvailableSubjects();
  const availableStreams = getAvailableStreams();
  const availableDegrees = getAvailableDegrees();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Choose Your Subjects
        </h2>
        <p className="text-slate-600">
          Select the subjects you want to study. You can always add more later.
        </p>
      </div>


      {/* Stream Selection for Grade 11/12 */}
      {availableStreams.length > 0 && (
        <div className="space-y-3">
          <Label className="font-semibold text-slate-800">Select Your Stream</Label>
          <Select value={selectedStream} onValueChange={setSelectedStream}>
            <SelectTrigger>
              <SelectValue placeholder="Choose your stream" />
            </SelectTrigger>
            <SelectContent>
              {availableStreams.map((stream) => (
                <SelectItem key={stream} value={stream}>
                  {stream}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Degree Selection for Undergraduate */}
      {availableDegrees.length > 0 && (
        <div className="space-y-3">
          <Label className="font-semibold text-slate-800">Select Your Degree</Label>
          <Select value={selectedDegree} onValueChange={setSelectedDegree}>
            <SelectTrigger>
              <SelectValue placeholder="Choose your degree type" />
            </SelectTrigger>
            <SelectContent>
              {availableDegrees.map((degree) => (
                <SelectItem key={degree} value={degree}>
                  {degree}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Subject Selection */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-800">
          {grade === "Grade 10" ? `Grade 10 Subjects` :
           (grade === "Grade 11" || grade === "Grade 12") && selectedStream ? `${selectedStream} Subjects` :
           grade === "Undergraduate" && selectedDegree ? `${selectedDegree} Subjects` :
           "Available Subjects"}
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {availableSubjects.map((subject) => (
            <div key={subject} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <Checkbox 
                id={`subject-${subject}`} 
                checked={data.selectedSubjects.has(subject)}
                onCheckedChange={() => toggleSubject(subject)}
              />
              <Label htmlFor={`subject-${subject}`} className="cursor-pointer flex-1">
                {subject}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Subject */}
      <div className="space-y-3">
        <Label className="font-semibold text-slate-800">Add Custom Subject</Label>
        <div className="flex space-x-2">
          <Input
            type="text"
            value={customSubject}
            onChange={(e) => setCustomSubject(e.target.value)}
            placeholder="Enter subject name"
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && addCustomSubject()}
          />
          <Button 
            onClick={addCustomSubject} 
            variant="outline"
            disabled={!customSubject.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Selected Subjects */}
      {data.selectedSubjects.size > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-800">Selected Subjects ({data.selectedSubjects.size})</h4>
          <div className="flex flex-wrap gap-2">
            {Array.from(data.selectedSubjects).map((subject) => (
              <div 
                key={subject} 
                className="bg-mint-100 text-mint-800 px-3 py-2 rounded-lg text-sm flex items-center gap-2 border border-mint-200"
              >
                <span>{subject}</span>
                <button 
                  onClick={() => removeSubject(subject)}
                  className="text-mint-600 hover:text-mint-800 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              💡 You can add or remove subjects later from your Settings page.
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button onClick={onPrev} variant="outline">
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className="bg-mint-600 hover:bg-mint-700"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
