
import { supabase } from "@/integrations/supabase/client";
import { Note } from "@/types/note";

export const fetchNotesFromSupabase = async (): Promise<Note[]> => {
  try {
    console.log('🔄 Fetching notes with all enhancement fields and user subjects...');
    
    const { data: notesData, error: notesError } = await supabase
      .from('notes')
      .select(`
        *,
        scan_data(*),
        note_tags(
          tags(*)
        ),
        user_subjects!notes_subject_id_fkey(
          id,
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (notesError) {
      console.error('❌ Error fetching notes:', notesError);
      throw notesError;
    }

    if (!notesData || notesData.length === 0) {
      console.log('📝 No notes found in database');
      return [];
    }

    console.log('✅ Raw notes data from database:', {
      count: notesData.length,
      sampleNote: notesData[0] ? {
        id: notesData[0].id,
        title: notesData[0].title,
        subject_id: notesData[0].subject_id,
        subject_from_join: notesData[0].user_subjects?.name || 'none',
        legacy_subject: notesData[0].subject || 'none',
        summary: notesData[0].summary?.substring(0, 50) || 'none',
        key_points: notesData[0].key_points?.substring(0, 50) || 'none',
        improved_content: notesData[0].improved_content?.substring(0, 50) || 'none',
        markdown_content: notesData[0].markdown_content?.substring(0, 50) || 'none',
        summary_status: notesData[0].summary_status,
        enhancementTimestamps: {
          summary_generated_at: notesData[0].summary_generated_at,
          key_points_generated_at: notesData[0].key_points_generated_at,
          improved_content_generated_at: notesData[0].improved_content_generated_at,
          markdown_content_generated_at: notesData[0].markdown_content_generated_at
        }
      } : null
    });

    const transformedNotes: Note[] = notesData.map((note) => {
      // Transform tags from the join query
      const tags = note.note_tags?.map((noteTag: any) => ({
        id: noteTag.tags?.id || noteTag.tag_id,
        name: noteTag.tags?.name || '',
        color: noteTag.tags?.color || '#94a3b8'
      })) || [];

      // Transform scan data
      const scanData = note.scan_data && note.scan_data.length > 0 ? {
        originalImageUrl: note.scan_data[0].original_image_url,
        recognizedText: note.scan_data[0].recognized_text,
        confidence: note.scan_data[0].confidence,
        language: note.scan_data[0].language
      } : undefined;

      // Resolve subject name: prioritize user_subjects join, then fall back to legacy subject field
      const resolvedSubjectName = note.user_subjects?.name || note.subject || 'Uncategorized';

      const transformedNote: Note = {
        id: note.id,
        title: note.title,
        description: note.description,
        date: new Date(note.date).toISOString().split('T')[0],
        category: resolvedSubjectName, // Map resolved subject name to category for backward compatibility
        content: note.content,
        sourceType: note.source_type as 'manual' | 'scan' | 'import',
        archived: note.archived || false,
        pinned: note.pinned || false,
        tags,
        scanData,
        subject_id: note.subject_id,
        
        // Enhancement fields - ensure they're properly mapped
        summary: note.summary || undefined,
        summary_status: note.summary_status as 'pending' | 'generating' | 'completed' | 'failed' || 'pending',
        summary_generated_at: note.summary_generated_at || undefined,
        
        key_points: note.key_points || undefined,
        key_points_generated_at: note.key_points_generated_at || undefined,
        
        markdown_content: note.markdown_content || undefined,
        markdown_content_generated_at: note.markdown_content_generated_at || undefined,
        
        improved_content: note.improved_content || undefined,
        improved_content_generated_at: note.improved_content_generated_at || undefined
      };

      console.log(`🔍 Transformed note ${note.id}:`, {
        title: transformedNote.title,
        subject_id: note.subject_id,
        resolved_subject: resolvedSubjectName,
        category_field: transformedNote.category,
        hasEnhancements: {
          summary: !!transformedNote.summary,
          key_points: !!transformedNote.key_points,
          improved_content: !!transformedNote.improved_content,
          markdown_content: !!transformedNote.markdown_content
        },
        enhancementLengths: {
          summary: transformedNote.summary?.length || 0,
          key_points: transformedNote.key_points?.length || 0,
          improved_content: transformedNote.improved_content?.length || 0,
          markdown_content: transformedNote.markdown_content?.length || 0
        },
        rawEnhancementData: {
          summary: note.summary?.substring(0, 50) || 'none',
          key_points: note.key_points?.substring(0, 50) || 'none',
          improved_content: note.improved_content?.substring(0, 50) || 'none'
        }
      });

      return transformedNote;
    });

    console.log('✅ Notes transformation completed:', {
      totalNotes: transformedNotes.length,
      notesWithEnhancements: transformedNotes.filter(note => 
        note.summary || note.key_points || note.improved_content || note.markdown_content
      ).length,
      notesWithSubjects: transformedNotes.filter(note => 
        note.category && note.category !== 'Uncategorized'
      ).length
    });

    return transformedNotes;
  } catch (error) {
    console.error('❌ Error in fetchNotesFromSupabase:', error);
    throw error;
  }
};
