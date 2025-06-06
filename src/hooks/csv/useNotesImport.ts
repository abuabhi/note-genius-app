
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { parseCSV } from "@/utils/csvUtils";
import { CSVUploadResult, NoteCSVRow } from "@/types/admin";
import { toast } from "sonner";

export const useNotesImport = () => {
  const [isImporting, setIsImporting] = useState(false);

  const importNotes = async (file: File): Promise<CSVUploadResult> => {
    setIsImporting(true);
    
    try {
      console.log('Starting notes CSV import...');
      
      // Parse CSV file
      const csvData = await parseCSV(file) as NoteCSVRow[];
      console.log('Parsed CSV data:', csvData);
      
      if (!csvData || csvData.length === 0) {
        throw new Error('No data found in CSV file');
      }

      const result: CSVUploadResult = {
        totalRows: csvData.length,
        successCount: 0,
        errorCount: 0,
        errors: [],
        userResults: []
      };

      const userResults = new Map<string, { successCount: number; errorCount: number; errors: string[] }>();

      // Process each row
      for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];
        const rowNumber = i + 2; // +2 because CSV has header and is 1-indexed
        
        try {
          // Validate required fields
          if (!row.title?.trim()) {
            throw new Error('Title is required');
          }
          if (!row.description?.trim()) {
            throw new Error('Description is required');
          }
          if (!row.user_email?.trim()) {
            throw new Error('User email is required');
          }

          // Look up user by email
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', supabase.auth.getUser().then(u => u.data.user?.email === row.user_email.trim() ? u.data.user.id : null))
            .single();

          // Alternative approach: get user by email from auth.users (requires service role)
          const { data: authUsers, error: authError } = await supabase.functions.invoke('get-user-by-email', {
            body: { email: row.user_email.trim() }
          });

          let userId = null;
          if (authUsers?.user?.id) {
            userId = authUsers.user.id;
          } else {
            throw new Error(`User not found: ${row.user_email}`);
          }

          // Initialize user result tracking
          if (!userResults.has(row.user_email)) {
            userResults.set(row.user_email, { successCount: 0, errorCount: 0, errors: [] });
          }
          const userResult = userResults.get(row.user_email)!;

          // Create the note
          const noteData = {
            user_id: userId,
            title: row.title.trim(),
            description: row.description.trim(),
            content: row.content?.trim() || '',
            subject: row.subject?.trim() || 'Uncategorized',
            source_type: row.source_type?.trim() || 'import',
            archived: false,
            pinned: false
          };

          const { data: noteInsertData, error: noteError } = await supabase
            .from('notes')
            .insert(noteData)
            .select()
            .single();

          if (noteError) {
            throw noteError;
          }

          // Handle tags if provided
          if (row.tags?.trim()) {
            const tagNames = row.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            
            for (const tagName of tagNames) {
              try {
                // Check if tag exists
                let { data: existingTag, error: tagFindError } = await supabase
                  .from('tags')
                  .select('id')
                  .eq('name', tagName)
                  .maybeSingle();

                if (tagFindError) {
                  console.error('Error finding tag:', tagFindError);
                  continue;
                }

                let tagId = existingTag?.id;

                // Create tag if it doesn't exist
                if (!tagId) {
                  const { data: newTag, error: tagCreateError } = await supabase
                    .from('tags')
                    .insert({ name: tagName, color: '#94a3b8' })
                    .select('id')
                    .single();

                  if (tagCreateError) {
                    console.error('Error creating tag:', tagCreateError);
                    continue;
                  }
                  tagId = newTag.id;
                }

                // Link tag to note
                const { error: linkError } = await supabase
                  .from('note_tags')
                  .insert({ note_id: noteInsertData.id, tag_id: tagId });

                if (linkError) {
                  console.error('Error linking tag to note:', linkError);
                }
              } catch (tagError) {
                console.error('Error processing tag:', tagError);
              }
            }
          }

          result.successCount++;
          userResult.successCount++;
          console.log(`Successfully imported note for ${row.user_email}: ${row.title}`);

        } catch (error) {
          console.error(`Error importing row ${rowNumber}:`, error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          
          result.errorCount++;
          result.errors.push({
            row: rowNumber,
            message: `${row.user_email || 'Unknown user'}: ${errorMessage}`
          });

          if (row.user_email) {
            if (!userResults.has(row.user_email)) {
              userResults.set(row.user_email, { successCount: 0, errorCount: 0, errors: [] });
            }
            const userResult = userResults.get(row.user_email)!;
            userResult.errorCount++;
            userResult.errors.push(errorMessage);
          }
        }
      }

      // Convert user results to array
      result.userResults = Array.from(userResults.entries()).map(([email, stats]) => ({
        email,
        ...stats
      }));

      console.log('Notes import completed:', result);
      
      if (result.successCount > 0) {
        toast.success(`Successfully imported ${result.successCount} notes`);
      }
      if (result.errorCount > 0) {
        toast.error(`Failed to import ${result.errorCount} notes`);
      }

      return result;

    } catch (error) {
      console.error('Error during notes import:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Import failed: ${errorMessage}`);
      
      return {
        totalRows: 0,
        successCount: 0,
        errorCount: 1,
        errors: [{ row: 0, message: errorMessage }]
      };
    } finally {
      setIsImporting(false);
    }
  };

  return {
    isImporting,
    importNotes
  };
};
