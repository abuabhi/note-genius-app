
import { Note } from '@/types/note';

// Mock data generators for testing
export const createMockNote = (overrides: Partial<Note> = {}): Note => ({
  id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  title: 'Test Note',
  description: 'This is a test note for testing purposes',
  content: 'Test content for the note',
  date: new Date().toISOString().split('T')[0],
  category: 'Test Category',
  sourceType: 'manual',
  archived: false,
  pinned: false,
  tags: [],
  ...overrides
});

export const createMockNotes = (count: number): Note[] => {
  return Array.from({ length: count }, (_, index) => 
    createMockNote({
      title: `Test Note ${index + 1}`,
      category: index % 2 === 0 ? 'Science' : 'Math'
    })
  );
};

// Test data validators
export const validateNoteStructure = (note: any): boolean => {
  const requiredFields = ['id', 'title', 'description', 'date', 'category', 'sourceType'];
  return requiredFields.every(field => note.hasOwnProperty(field));
};

// Performance test helpers
export const measureOperation = async <T>(operation: () => Promise<T>): Promise<{ result: T; duration: number }> => {
  const start = performance.now();
  const result = await operation();
  const duration = performance.now() - start;
  return { result, duration };
};

// Security test helpers
export const createMaliciousInput = (type: 'xss' | 'injection' | 'overflow'): string => {
  switch (type) {
    case 'xss':
      return '<script>alert("XSS")</script>';
    case 'injection':
      return "'; DROP TABLE notes; --";
    case 'overflow':
      return 'A'.repeat(100000);
    default:
      return 'malicious input';
  }
};

// Load testing helpers
export const simulateHighLoad = async (operations: (() => Promise<void>)[], concurrency: number = 10) => {
  const batches = [];
  for (let i = 0; i < operations.length; i += concurrency) {
    batches.push(operations.slice(i, i + concurrency));
  }

  const results = [];
  for (const batch of batches) {
    const batchResults = await Promise.allSettled(
      batch.map(op => measureOperation(op))
    );
    results.push(...batchResults);
  }

  return results;
};

// Cache testing helpers
export const createCacheTestScenario = () => {
  const operations = [
    'read',
    'write',
    'update',
    'delete'
  ] as const;

  return {
    operations,
    generateRandomOperation: () => operations[Math.floor(Math.random() * operations.length)],
    generateOperationSequence: (length: number) => 
      Array.from({ length }, () => operations[Math.floor(Math.random() * operations.length)])
  };
};

// Error boundary testing
export const triggerErrorBoundary = (errorType: 'security' | 'network' | 'validation') => {
  switch (errorType) {
    case 'security':
      throw new Error('CSRF token validation failed');
    case 'network':
      throw new Error('Network request failed');
    case 'validation':
      throw new Error('Input validation failed');
    default:
      throw new Error('Test error');
  }
};

// Performance benchmarking
export const benchmarkNotesOperations = {
  async addNotes(addFunction: (note: Omit<Note, 'id'>) => Promise<Note | null>, count: number) {
    const notes = createMockNotes(count).map(({ id, ...note }) => note);
    const start = performance.now();
    
    const results = await Promise.allSettled(
      notes.map(note => addFunction(note))
    );
    
    const duration = performance.now() - start;
    const successful = results.filter(r => r.status === 'fulfilled').length;
    
    return {
      totalCount: count,
      successfulCount: successful,
      failedCount: count - successful,
      totalDuration: duration,
      averageDuration: duration / count,
      operationsPerSecond: count / (duration / 1000)
    };
  },

  async searchNotes(searchFunction: (term: string) => void, searchTerms: string[]) {
    const results = [];
    
    for (const term of searchTerms) {
      const { duration } = await measureOperation(async () => {
        searchFunction(term);
        // Wait for search to complete (simulate)
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      results.push({ term, duration });
    }
    
    return {
      totalSearches: searchTerms.length,
      averageSearchTime: results.reduce((sum, r) => sum + r.duration, 0) / results.length,
      results
    };
  }
};
