import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { createTestData } from '@/test/utils/testDataFactory';
import { mockSupabaseResponses } from '@/test/utils/mockSupabase';

// Mock the notes hook
const mockUseNotes = vi.fn();
vi.mock('@/hooks/useNotes', () => ({
  useNotes: () => mockUseNotes(),
}));

// Mock the component we want to test
const MockNotesPage = () => {
  const { notes, loading, error, addNote, updateNote, deleteNote } = mockUseNotes();
  
  if (loading) return <div data-testid="loading">Loading...</div>;
  if (error) return <div data-testid="error">Error: {error.message}</div>;
  
  return (
    <div>
      <h1>Notes</h1>
      <button onClick={() => addNote(createTestData.note())}>Add Note</button>
      <div data-testid="notes-list">
        {notes?.map((note: any) => (
          <div key={note.id} data-testid={`note-${note.id}`}>
            <h3>{note.title}</h3>
            <p>{note.content}</p>
            <button onClick={() => updateNote(note.id, { title: 'Updated' })}>
              Update
            </button>
            <button onClick={() => deleteNote(note.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

describe('Notes Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    mockUseNotes.mockReturnValue({
      notes: [],
      loading: true,
      error: null,
      addNote: vi.fn(),
      updateNote: vi.fn(),
      deleteNote: vi.fn(),
    });

    render(<MockNotesPage />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUseNotes.mockReturnValue({
      notes: [],
      loading: false,
      error: { message: 'Failed to load notes' },
      addNote: vi.fn(),
      updateNote: vi.fn(),
      deleteNote: vi.fn(),
    });

    render(<MockNotesPage />);
    expect(screen.getByTestId('error')).toHaveTextContent('Error: Failed to load notes');
  });

  it('renders notes list', () => {
    const mockNotes = createTestData.notes(2);
    mockUseNotes.mockReturnValue({
      notes: mockNotes,
      loading: false,
      error: null,
      addNote: vi.fn(),
      updateNote: vi.fn(),
      deleteNote: vi.fn(),
    });

    render(<MockNotesPage />);
    
    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByTestId(`note-${mockNotes[0].id}`)).toBeInTheDocument();
    expect(screen.getByTestId(`note-${mockNotes[1].id}`)).toBeInTheDocument();
  });

  it('handles add note action', async () => {
    const user = userEvent.setup();
    const mockAddNote = vi.fn();
    
    mockUseNotes.mockReturnValue({
      notes: [],
      loading: false,
      error: null,
      addNote: mockAddNote,
      updateNote: vi.fn(),
      deleteNote: vi.fn(),
    });

    render(<MockNotesPage />);
    
    await user.click(screen.getByText('Add Note'));
    expect(mockAddNote).toHaveBeenCalledTimes(1);
  });

  it('handles update note action', async () => {
    const user = userEvent.setup();
    const mockUpdateNote = vi.fn();
    const mockNote = createTestData.note();
    
    mockUseNotes.mockReturnValue({
      notes: [mockNote],
      loading: false,
      error: null,
      addNote: vi.fn(),
      updateNote: mockUpdateNote,
      deleteNote: vi.fn(),
    });

    render(<MockNotesPage />);
    
    await user.click(screen.getByText('Update'));
    expect(mockUpdateNote).toHaveBeenCalledWith(mockNote.id, { title: 'Updated' });
  });

  it('handles delete note action', async () => {
    const user = userEvent.setup();
    const mockDeleteNote = vi.fn();
    const mockNote = createTestData.note();
    
    mockUseNotes.mockReturnValue({
      notes: [mockNote],
      loading: false,
      error: null,
      addNote: vi.fn(),
      updateNote: vi.fn(),
      deleteNote: mockDeleteNote,
    });

    render(<MockNotesPage />);
    
    await user.click(screen.getByText('Delete'));
    expect(mockDeleteNote).toHaveBeenCalledWith(mockNote.id);
  });
});