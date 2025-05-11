import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth"; // Updated import path
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubjectSelection } from "./SubjectSelection";
import { GradeSelection } from "./GradeSelection";
import { SchoolInput } from "./SchoolInput";

export const OnboardingForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set());
  const [customSubject, setCustomSubject] = useState("");
  const [grade, setGrade] = useState<GradeLevel | "">("");
  const [school, setSchool] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to complete onboarding");
      return;
    }
    
    if (!grade) {
      toast.error("Please select your grade/education level");
      return;
    }
    
    if (selectedSubjects.size === 0) {
      toast.error("Please select at least one subject");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Update user profile with grade and school
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          grade: grade as GradeLevel,
          school: school.trim() || null,
          onboarding_completed: true // Explicitly mark onboarding as completed
        })
        .eq('id', user.id);
        
      if (profileError) throw profileError;
      
      // Save selected subjects to database
      const subjectsToAdd = Array.from(selectedSubjects).map(name => ({
        user_id: user.id,
        name
      }));
      
      const { error: subjectsError } = await supabase
        .from('user_subjects')
        .insert(subjectsToAdd);
        
      if (subjectsError) throw subjectsError;
      
      // No need to call markOnboardingCompleted since we've already set it directly
      
      toast.success("Onboarding completed successfully!");
      
      // Force a small delay before redirecting
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 500);
    } catch (error: any) {
      console.error("Error completing onboarding:", error);
      toast.error("Failed to complete onboarding: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSubject = (subject: string) => {
    const newSelected = new Set(selectedSubjects);
    if (newSelected.has(subject)) {
      newSelected.delete(subject);
    } else {
      newSelected.add(subject);
    }
    setSelectedSubjects(newSelected);
  };

  const addCustomSubject = () => {
    if (!customSubject.trim()) return;
    
    const newSelected = new Set(selectedSubjects);
    newSelected.add(customSubject.trim());
    setSelectedSubjects(newSelected);
    setCustomSubject("");
  };

  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Account Setup</CardTitle>
          <CardDescription>
            Tell us about your education to help personalize your experience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <GradeSelection 
              grade={grade} 
              setGrade={setGrade} 
            />

            <SchoolInput 
              school={school} 
              setSchool={setSchool} 
            />

            <SubjectSelection 
              selectedSubjects={selectedSubjects}
              toggleSubject={toggleSubject}
              customSubject={customSubject}
              setCustomSubject={setCustomSubject}
              addCustomSubject={addCustomSubject}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-mint-600 hover:bg-mint-700"
              disabled={isSubmitting || !grade || selectedSubjects.size === 0}
            >
              {isSubmitting ? "Saving..." : "Complete Setup"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
