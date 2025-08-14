import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { createTestData } from '@/test/utils/testDataFactory';

// Mock the flashcards hook
const mockUseFlashcards = vi.fn();
vi.mock('@/hooks/useFlashcards', () => ({
  useFlashcards: () => mockUseFlashcards(),
}));

// Mock component for testing
const MockFlashcardsPage = () => {
  const { flashcardSets, loading, error, createSet, deleteSet } = mockUseFlashcards();
  
  if (loading) return <div data-testid="loading">Loading...</div>;
  if (error) return <div data-testid="error">Error: {error.message}</div>;
  
  return (
    <div>
      <h1>Flashcard Sets</h1>
      <button onClick={() => createSet(createTestData.flashcardSet())}>
        Create Set
      </button>
      <div data-testid="flashcard-sets">
        {flashcardSets?.map((set: any) => (
          <div key={set.id} data-testid={`set-${set.id}`}>
            <h3>{set.name}</h3>
            <p>{set.description}</p>
            <span>Cards: {set.card_count}</span>
            <button onClick={() => deleteSet(set.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

describe('Flashcards Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    mockUseFlashcards.mockReturnValue({
      flashcardSets: [],
      loading: true,
      error: null,
      createSet: vi.fn(),
      deleteSet: vi.fn(),
    });

    render(<MockFlashcardsPage />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUseFlashcards.mockReturnValue({
      flashcardSets: [],
      loading: false,
      error: { message: 'Failed to load flashcard sets' },
      createSet: vi.fn(),
      deleteSet: vi.fn(),
    });

    render(<MockFlashcardsPage />);
    expect(screen.getByTestId('error')).toHaveTextContent('Error: Failed to load flashcard sets');
  });

  it('renders flashcard sets', () => {
    const mockSet = createTestData.flashcardSet({ card_count: 15 });
    mockUseFlashcards.mockReturnValue({
      flashcardSets: [mockSet],
      loading: false,
      error: null,
      createSet: vi.fn(),
      deleteSet: vi.fn(),
    });

    render(<MockFlashcardsPage />);
    
    expect(screen.getByText('Flashcard Sets')).toBeInTheDocument();
    expect(screen.getByTestId(`set-${mockSet.id}`)).toBeInTheDocument();
    expect(screen.getByText(mockSet.name)).toBeInTheDocument();
    expect(screen.getByText('Cards: 15')).toBeInTheDocument();
  });

  it('handles create set action', async () => {
    const user = userEvent.setup();
    const mockCreateSet = vi.fn();
    
    mockUseFlashcards.mockReturnValue({
      flashcardSets: [],
      loading: false,
      error: null,
      createSet: mockCreateSet,
      deleteSet: vi.fn(),
    });

    render(<MockFlashcardsPage />);
    
    await user.click(screen.getByText('Create Set'));
    expect(mockCreateSet).toHaveBeenCalledTimes(1);
  });

  it('handles delete set action', async () => {
    const user = userEvent.setup();
    const mockDeleteSet = vi.fn();
    const mockSet = createTestData.flashcardSet();
    
    mockUseFlashcards.mockReturnValue({
      flashcardSets: [mockSet],
      loading: false,
      error: null,
      createSet: vi.fn(),
      deleteSet: mockDeleteSet,
    });

    render(<MockFlashcardsPage />);
    
    await user.click(screen.getByText('Delete'));
    expect(mockDeleteSet).toHaveBeenCalledWith(mockSet.id);
  });

  it('displays correct card count for each set', () => {
    const sets = [
      createTestData.flashcardSet({ card_count: 5 }),
      createTestData.flashcardSet({ card_count: 20 }),
    ];
    
    mockUseFlashcards.mockReturnValue({
      flashcardSets: sets,
      loading: false,
      error: null,
      createSet: vi.fn(),
      deleteSet: vi.fn(),
    });

    render(<MockFlashcardsPage />);
    
    expect(screen.getByText('Cards: 5')).toBeInTheDocument();
    expect(screen.getByText('Cards: 20')).toBeInTheDocument();
  });
});