
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PREDEFINED_SUBJECTS, GRADE_LEVELS, GradeLevel } from "@/types/subject";
import Layout from "@/components/layout/Layout";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const OnboardingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isOnboardingCompleted, isLoading: statusLoading, markOnboardingCompleted } = useOnboardingStatus();
  
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set());
  const [customSubject, setCustomSubject] = useState("");
  const [grade, setGrade] = useState<GradeLevel | "">("");
  const [school, setSchool] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // Redirect if already completed onboarding
    if (isOnboardingCompleted && !statusLoading) {
      navigate('/dashboard');
    }
  }, [isOnboardingCompleted, statusLoading, navigate]);

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
          school: school.trim() || null
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
      
      // Mark onboarding as complete
      await markOnboardingCompleted();
      
      toast.success("Onboarding completed successfully!");
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Error completing onboarding:", error);
      toast.error("Failed to complete onboarding: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (statusLoading) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-16rem)] flex justify-center items-center">
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[calc(100vh-16rem)] flex flex-col justify-center py-12 px-6 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-mint-50/30 to-mint-50/10">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-3xl font-bold text-center text-gray-900">Welcome to StudyApp!</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Let's set up your account to personalize your experience.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Account Setup</CardTitle>
              <CardDescription>
                Tell us about your education to help personalize your experience.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Grade Selection - Required */}
                <div className="space-y-2">
                  <Label htmlFor="grade" className="text-sm font-medium">
                    Grade/Education Level <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={grade} 
                    onValueChange={setGrade}
                    required
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select your grade/level" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADE_LEVELS.map((gradeLevel) => (
                        <SelectItem key={gradeLevel} value={gradeLevel}>
                          {gradeLevel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* School Name - Optional */}
                <div className="space-y-2">
                  <Label htmlFor="school" className="text-sm font-medium">
                    School Name (Optional)
                  </Label>
                  <Input
                    id="school"
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="Enter your school name"
                  />
                </div>

                {/* Subject Selection */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">
                    Select your subjects <span className="text-red-500">*</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PREDEFINED_SUBJECTS.map((subject) => (
                      <div key={subject} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`subject-${subject}`} 
                          checked={selectedSubjects.has(subject)}
                          onCheckedChange={() => toggleSubject(subject)}
                        />
                        <Label htmlFor={`subject-${subject}`}>{subject}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Add Custom Subject */}
                <div className="space-y-2">
                  <Label htmlFor="customSubject" className="text-sm font-medium">
                    Add a custom subject
                  </Label>
                  <div className="flex space-x-2">
                    <Input
                      id="customSubject"
                      type="text"
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      placeholder="Enter subject name"
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      onClick={addCustomSubject} 
                      variant="outline"
                      disabled={!customSubject.trim()}
                    >
                      Add
                    </Button>
                  </div>
                </div>
                
                {/* Selected Subjects */}
                {selectedSubjects.size > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Selected subjects:</h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(selectedSubjects).map((subject) => (
                        <div 
                          key={subject} 
                          className="bg-mint-100 text-mint-800 px-2 py-1 rounded-md text-sm flex items-center"
                        >
                          <span>{subject}</span>
                          <button 
                            type="button" 
                            onClick={() => toggleSubject(subject)}
                            className="ml-1 text-mint-500 hover:text-mint-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
      </div>
    </Layout>
  );
};

export default OnboardingPage;
