
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { UserSubject } from "@/types/subject";

export const useUserSubjects = () => {
  const [subjects, setSubjects] = useState<UserSubject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchSubjects = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('user_subjects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      setSubjects(data || []);
    } catch (err: any) {
      console.error("Error fetching user subjects:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addSubject = async (subjectName: string): Promise<boolean> => {
    if (!user) return false;
    if (!subjectName.trim()) return false;

    try {
      // Check if subject already exists
      const exists = subjects.some(
        (subject) => subject.name.toLowerCase() === subjectName.trim().toLowerCase()
      );
      
      if (exists) {
        setError("Subject already exists");
        return false;
      }
      
      const newSubject = {
        user_id: user.id,
        name: subjectName.trim()
      };
      
      const { data, error } = await supabase
        .from('user_subjects')
        .insert(newSubject)
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setSubjects([...subjects, data[0]]);
        return true;
      }
      
      return false;
    } catch (err: any) {
      console.error("Error adding subject:", err);
      setError(err.message);
      return false;
    }
  };

  const removeSubject = async (subjectId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('user_subjects')
        .delete()
        .eq('id', subjectId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setSubjects(subjects.filter((subject) => subject.id !== subjectId));
      return true;
    } catch (err: any) {
      console.error("Error removing subject:", err);
      setError(err.message);
      return false;
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [user]);

  return {
    subjects,
    isLoading,
    error,
    fetchSubjects,
    addSubject,
    removeSubject
  };
};
