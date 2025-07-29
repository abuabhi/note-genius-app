
import { supabase } from "@/integrations/supabase/client";
import { Note } from "@/types/note";

export interface NotesQueryOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  subject?: string;
  showArchived?: boolean;
  sortBy?: 'newest' | 'oldest' | 'alphabetical' | 'subject';
}

export interface NotesQueryResult {
  notes: Note[];
  totalCount: number;
  hasMore: boolean;
}

export const fetchNotesFromSupabase = async (options: NotesQueryOptions = {}): Promise<NotesQueryResult> => {
  const {
    page = 1,
    pageSize = 20,
    search = '',
    subject = 'all',
    showArchived = false,
    sortBy = 'newest'
  } = options;

  const offset = (page - 1) * pageSize;

  // Notes fetch logging disabled for cleaner console

  try {
    // Build the base query with JOIN for subjects and minimal fields for performance
    let query = supabase
      .from('notes')
      .select(`
        id,
        title,
        description,
        content,
        date,
        subject,
        subject_id,
        source_type,
        archived,
        pinned,
        created_at,
        updated_at,
        user_subjects!notes_subject_id_fkey (
          id,
          name
        ),
        note_tags (
          tags (
            id,
            name,
            color
          )
        )
      `, { count: 'exact' })
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

    // Apply archived filter
    if (!showArchived) {
      query = query.eq('archived', false);
    }

    // Apply search filter at database level
    if (search.trim()) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,content.ilike.%${search}%`);
    }

    // FIXED: Apply subject filter correctly
    if (subject !== 'all' && subject.trim() !== '') {
      console.log(`🎯 Applying subject filter for: "${subject}"`);
      
      // First try to get notes by subject_id through the join
      const subjectFilterQuery = supabase
        .from('notes')
        .select(`
          id,
          title,
          description,
          content,
          date,
          subject,
          subject_id,
          source_type,
          archived,
          pinned,
          created_at,
          updated_at,
          user_subjects!notes_subject_id_fkey (
            id,
            name
          ),
          note_tags (
            tags (
              id,
              name,
              color
            )
          )
        `, { count: 'exact' })
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      // Apply the same filters as the main query
      if (!showArchived) {
        subjectFilterQuery.eq('archived', false);
      }
      
      if (search.trim()) {
        subjectFilterQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%,content.ilike.%${search}%`);
      }

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          subjectFilterQuery.order('pinned', { ascending: false })
                           .order('updated_at', { ascending: false });
          break;
        case 'oldest':
          subjectFilterQuery.order('pinned', { ascending: false })
                           .order('created_at', { ascending: true });
          break;
        case 'alphabetical':
          subjectFilterQuery.order('pinned', { ascending: false })
                           .order('title', { ascending: true });
          break;
        case 'subject':
          subjectFilterQuery.order('pinned', { ascending: false })
                           .order('subject', { ascending: true });
          break;
      }

      // Apply pagination
      subjectFilterQuery.range(offset, offset + pageSize - 1);

      const { data: allNotes, error, count } = await subjectFilterQuery;

      if (error) {
        console.error('❌ Error fetching notes for subject filter:', error);
        throw error;
      }

      // Filter in memory for subject match
      const filteredNotes = (allNotes || []).filter(note => {
        const hasSubjectIdMatch = note.user_subjects?.name === subject;
        const hasLegacySubjectMatch = note.subject === subject;
        
        console.log(`Note "${note.title}": subject_id match=${hasSubjectIdMatch}, legacy match=${hasLegacySubjectMatch}, user_subjects name="${note.user_subjects?.name}", legacy subject="${note.subject}"`);
        
        return hasSubjectIdMatch || hasLegacySubjectMatch;
      });

      console.log(`✅ Subject filter applied: ${filteredNotes.length} notes match subject "${subject}"`);

      // Transform data to match Note interface
      const transformedNotes: Note[] = filteredNotes.map(note => ({
        id: note.id,
        title: note.title,
        description: note.description || '',
        content: note.content || '',
        date: note.date,
        subject: note.user_subjects?.name || note.subject || 'Uncategorized',
        sourceType: (note.source_type || 'manual') as 'manual' | 'import' | 'scan',
        archived: note.archived || false,
        pinned: note.pinned || false,
        subject_id: note.subject_id,
        tags: note.note_tags?.map(nt => nt.tags).filter(Boolean) || []
      }));

      return {
        notes: transformedNotes,
        totalCount: filteredNotes.length,
        hasMore: false // Since we're filtering in memory, no more pages
      };
    }

    // Apply sorting with pinned notes first (for non-subject queries)
    switch (sortBy) {
      case 'newest':
        query = query.order('pinned', { ascending: false })
                     .order('updated_at', { ascending: false });
        break;
      case 'oldest':
        query = query.order('pinned', { ascending: false })
                     .order('created_at', { ascending: true });
        break;
      case 'alphabetical':
        query = query.order('pinned', { ascending: false })
                     .order('title', { ascending: true });
        break;
      case 'subject':
        query = query.order('pinned', { ascending: false })
                     .order('subject', { ascending: true });
        break;
    }

    // Apply pagination
    query = query.range(offset, offset + pageSize - 1);

    const { data: notes, error, count } = await query;

    if (error) {
      console.error('❌ Error fetching notes:', error);
      throw error;
    }

    // Transform data to match Note interface
    const transformedNotes: Note[] = (notes || []).map(note => ({
      id: note.id,
      title: note.title,
      description: note.description || '',
      content: note.content || '',
      date: note.date,
      subject: note.user_subjects?.name || note.subject || 'Uncategorized',
      sourceType: (note.source_type || 'manual') as 'manual' | 'import' | 'scan',
      archived: note.archived || false,
      pinned: note.pinned || false,
      subject_id: note.subject_id,
      tags: note.note_tags?.map(nt => nt.tags).filter(Boolean) || []
    }));

    const totalCount = count || 0;
    const hasMore = totalCount > offset + pageSize;

    console.log(`✅ Fetched ${transformedNotes.length} notes (${totalCount} total, hasMore: ${hasMore})`);

    return {
      notes: transformedNotes,
      totalCount,
      hasMore
    };

  } catch (error) {
    console.error('❌ Error in fetchNotesFromSupabase:', error);
    throw error;
  }
};

// Legacy function for backward compatibility - now uses optimized version
export const fetchNotesFromSupabaseOld = async (): Promise<Note[]> => {
  const result = await fetchNotesFromSupabase({ pageSize: 1000 });
  return result.notes;
};
