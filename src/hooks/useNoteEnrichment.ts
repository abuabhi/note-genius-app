
// This file is now just a re-export from the refactored modules
// This maintains backward compatibility

import { useNoteEnrichment as useRefactoredNoteEnrichment } from './noteEnrichment/useNoteEnrichment';
export { enhancementOptions } from './noteEnrichment/enhancementOptions';
export type { EnhancementFunction, EnhancementType, EnhancementResult } from './noteEnrichment/types';

export const useNoteEnrichment = useRefactoredNoteEnrichment;
export default useNoteEnrichment;
