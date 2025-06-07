
import { supabase } from "@/integrations/supabase/client";
import { Note } from "@/types/note";

interface DatabaseNote {
  id: string;
  title: string;
  description: string;
  date: string;
  subject: string;
  content: string;
  source_type: string;
  archived: boolean;
  pinned: boolean;
  subject_id: string;
  created_at: string;
  updated_at: string;
  summary?: string;
  summary_status?: string;
  summary_generated_at?: string;
  key_points?: string;
  key_points_generated_at?: string;
  markdown_content?: string;
  markdown_content_generated_at?: string;
  improved_content?: string;
  improved_content_generated_at?: string;
}

export const fetchNotesFromSupabase = async (): Promise<Note[]> => {
  try {
    console.log('🔄 Starting simplified notes fetch...');
    
    // Step 1: Fetch basic notes data with timeout
    const notesPromise = supabase
      .from('notes')
      .select(`
        id,
        title,
        description,
        date,
        subject,
        content,
        source_type,
        archived,
        pinned,
        subject_id,
        created_at,
        updated_at,
        summary,
        summary_status,
        summary_generated_at,
        key_points,
        key_points_generated_at,
        markdown_content,
        markdown_content_generated_at,
        improved_content,
        improved_content_generated_at
      `)
      .order('created_at', { ascending: false });

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database query timeout')), 10000);
    });

    const { data: notesData, error: notesError } = await Promise.race([
      notesPromise,
      timeoutPromise
    ]) as any;

    if (notesError) {
      console.error('❌ Error fetching notes:', notesError);
      throw new Error(`Database error: ${notesError.message}`);
    }

    if (!notesData || notesData.length === 0) {
      console.log('📝 No notes found in database');
      return [];
    }

    console.log('✅ Basic notes fetched successfully:', notesData.length);

    // Step 2: Fetch subjects data separately
    let subjectsMap: Record<string, string> = {};
    try {
      const { data: subjectsData } = await supabase
        .from('user_subjects')
        .select('id, name');
      
      if (subjectsData) {
        subjectsMap = subjectsData.reduce((acc, subject) => {
          acc[subject.id] = subject.name;
          return acc;
        }, {} as Record<string, string>);
      }
    } catch (error) {
      console.warn('⚠️ Could not fetch subjects, using fallback');
    }

    // Step 3: Transform notes data
    const transformedNotes: Note[] = notesData.map((note: DatabaseNote) => {
      const resolvedSubjectName = note.subject_id && subjectsMap[note.subject_id] 
        ? subjectsMap[note.subject_id] 
        : note.subject || 'Uncategorized';

      return {
        id: note.id,
        title: note.title || "Untitled",
        description: note.description || "",
        date: new Date(note.date).toISOString().split('T')[0],
        category: resolvedSubjectName,
        content: note.content || "",
        sourceType: (note.source_type as 'manual' | 'scan' | 'import') || 'manual',
        archived: note.archived || false,
        pinned: note.pinned || false,
        tags: [], // Will be loaded separately if needed
        subject_id: note.subject_id,
        
        // Enhancement fields
        summary: note.summary,
        summary_status: (note.summary_status as 'pending' | 'generating' | 'completed' | 'failed') || 'pending',
        summary_generated_at: note.summary_generated_at,
        key_points: note.key_points,
        key_points_generated_at: note.key_points_generated_at,
        markdown_content: note.markdown_content,
        markdown_content_generated_at: note.markdown_content_generated_at,
        improved_content: note.improved_content,
        improved_content_generated_at: note.improved_content_generated_at
      };
    });

    console.log('✅ Notes transformation completed:', {
      totalNotes: transformedNotes.length,
      notesWithEnhancements: transformedNotes.filter(note => 
        note.summary || note.key_points || note.improved_content || note.markdown_content
      ).length
    });

    return transformedNotes;
  } catch (error) {
    console.error('❌ Error in fetchNotesFromSupabase:', error);
    
    // Return empty array instead of throwing to prevent complete failure
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    
    return [];
  }
};
