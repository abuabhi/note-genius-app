
// This is the main operations file that exports all database operations
// It imports directly from the specialized operation files

import {
  addNoteToDatabase,
  deleteNoteFromDatabase,
  updateNoteInDatabase
} from './operations/noteDbOperations';

import {
  fetchTagsFromDatabase,
  updateNoteTagsInDatabase,
  addNoteTagsToDatabase  
} from './operations/tagOperations';

import {
  updateScanDataInDatabase,
  addScanDataToDatabase
} from './operations/scanOperations';

import {
  fetchNoteEnrichmentUsage
} from './operations/usageStats';

// Export everything for convenience
export {
  // Note operations
  addNoteToDatabase,
  deleteNoteFromDatabase,
  updateNoteInDatabase,
  
  // Tag operations
  fetchTagsFromDatabase,
  updateNoteTagsInDatabase,
  addNoteTagsToDatabase,
  
  // Scan operations
  updateScanDataInDatabase,
  addScanDataToDatabase,
  
  // Usage stats
  fetchNoteEnrichmentUsage
};

// Re-export the supabase instance for convenience
export { supabase } from "@/integrations/supabase/client";
