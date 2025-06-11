
import { Note } from '@/types/note';

export const createMockNote = (overrides: Partial<Note> = {}): Note => {
  return {
    id: 'test-note-1',
    title: 'Test Note',
    description: 'Test Description',
    content: 'Test Content',
    date: '2024-01-01',
    subject: 'Math',
    sourceType: 'manual',
    archived: false,
    pinned: false,
    tags: [],
    ...overrides
  };
};

export const createMockNotes = (count: number = 3): Note[] => {
  return Array.from({ length: count }, (_, i) => createMockNote({
    id: `test-note-${i + 1}`,
    title: `Test Note ${i + 1}`,
    subject: i % 2 === 0 ? 'Math' : 'Science'
  }));
};
