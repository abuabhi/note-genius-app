
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { UserSubject } from '@/types/subject';

export const useUserSubjects = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<UserSubject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('user_subjects')
          .select('*')
          .eq('user_id', user.id)
          .order('name');

        if (error) throw error;
        
        setSubjects(data as UserSubject[]);
      } catch (error) {
        console.error('Error fetching user subjects:', error);
        setSubjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjects();
  }, [user]);

  const addSubject = async (name: string) => {
    if (!user || !name.trim()) return false;

    try {
      // Check if subject already exists
      const exists = subjects.some(
        (subject) => subject.name.toLowerCase() === name.trim().toLowerCase()
      );

      if (exists) {
        console.warn('Subject already exists');
        return false;
      }

      const newSubject: UserSubject = {
        user_id: user.id,
        name: name.trim()
      };

      const { data, error } = await supabase
        .from('user_subjects')
        .insert(newSubject)
        .select();

      if (error) throw error;

      setSubjects([...subjects, data[0] as UserSubject]);
      return true;
    } catch (error) {
      console.error('Error adding subject:', error);
      return false;
    }
  };

  const removeSubject = async (subjectId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_subjects')
        .delete()
        .eq('id', subjectId)
        .eq('user_id', user.id);

      if (error) throw error;

      setSubjects(subjects.filter(subject => subject.id !== subjectId));
      return true;
    } catch (error) {
      console.error('Error removing subject:', error);
      return false;
    }
  };

  return { subjects, isLoading, addSubject, removeSubject };
};
