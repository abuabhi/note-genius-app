
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Plus, X } from "lucide-react";
import { OnboardingData } from "../OnboardingWizard";
import { PREDEFINED_SUBJECTS, GradeLevel } from "@/types/subject";
import { useState } from "react";

interface SubjectStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const SUBJECT_BUNDLES = {
  "Elementary": ["Math", "English", "Science", "Social Studies", "Art"],
  "Middle School": ["Math", "English", "Science", "History", "Geography", "Art", "Physical Education"],
  "High School": ["Math", "English", "Science", "History", "Physics", "Chemistry", "Biology", "Literature"],
  "College": ["Computer Science", "Mathematics", "Physics", "Chemistry", "Biology", "Psychology", "Economics"],
  "University": ["Advanced Mathematics", "Research Methods", "Statistics", "Philosophy", "Critical Thinking"]
};

export const SubjectStep = ({ data, updateData, onNext, onPrev }: SubjectStepProps) => {
  const [customSubject, setCustomSubject] = useState("");
  
  const canProceed = data.selectedSubjects.size > 0;

  const getRecommendedBundle = (): string[] => {
    const grade = data.grade as GradeLevel;
    if (grade.includes("Elementary") || grade.includes("Grade")) {
      return SUBJECT_BUNDLES["Elementary"];
    } else if (grade.includes("Middle")) {
      return SUBJECT_BUNDLES["Middle School"];
    } else if (grade.includes("High")) {
      return SUBJECT_BUNDLES["High School"];
    } else if (grade.includes("College")) {
      return SUBJECT_BUNDLES["College"];
    } else if (grade.includes("University") || grade.includes("Graduate")) {
      return SUBJECT_BUNDLES["University"];
    }
    return SUBJECT_BUNDLES["High School"]; // Default
  };

  const selectBundle = (bundle: string[]) => {
    const newSubjects = new Set([...data.selectedSubjects, ...bundle]);
    updateData({ selectedSubjects: newSubjects });
  };

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

  const recommendedBundle = getRecommendedBundle();

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

      {/* Quick Setup */}
      <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100">
        <h3 className="font-semibold text-slate-800 mb-3">Quick Setup</h3>
        <p className="text-sm text-slate-600 mb-4">
          Based on your grade level, here are some recommended subjects:
        </p>
        <Button
          onClick={() => selectBundle(recommendedBundle)}
          variant="outline"
          className="border-blue-200 hover:bg-blue-50"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Recommended Subjects
        </Button>
      </div>

      {/* Subject Selection */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-800">All Subjects</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PREDEFINED_SUBJECTS.map((subject) => (
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
