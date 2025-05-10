
// This file is kept for backward compatibility
// It re-exports all operations from the modularized files
// We could eventually refactor all imports to use the new modules directly

export {
  addNoteToDatabase,
  deleteNoteFromDatabase,
  updateNoteInDatabase,
  fetchTagsFromDatabase,
  fetchNoteEnrichmentUsage
} from './operations';

// Explicitly re-export tag operations
export { 
  updateNoteTagsInDatabase, 
  addNoteTagsToDatabase 
} from './operations/tagOperations';
