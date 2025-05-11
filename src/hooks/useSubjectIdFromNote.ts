
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Note } from "@/types/note";

export const useSubjectIdFromNote = (note: Note | null) => {
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSubjectId = async () => {
      if (!note || !note.subject_id) {
        setSubjectId(null);
        return;
      }

      try {
        setLoading(true);
        // Get subject details
        const { data, error } = await supabase
          .from('user_subjects')
          .select('id, name')
          .eq('id', note.subject_id)
          .single();

        if (error) throw error;
        
        setSubjectId(data?.id || null);
      } catch (error) {
        console.error("Error fetching subject from note:", error);
        setSubjectId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjectId();
  }, [note]);

  return { subjectId, loading };
};
