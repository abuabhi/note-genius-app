import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { createTestData } from '@/test/utils/testDataFactory';

// Mock the study goals hook
const mockUseStudyGoals = vi.fn();
vi.mock('@/hooks/useStudyGoals', () => ({
  useStudyGoals: () => mockUseStudyGoals(),
}));

// Mock component for testing
const MockStudyGoalsPage = () => {
  const { goals, loading, error, createGoal, updateGoal, deleteGoal } = mockUseStudyGoals();
  
  if (loading) return <div data-testid="loading">Loading...</div>;
  if (error) return <div data-testid="error">Error: {error.message}</div>;
  
  return (
    <div>
      <h1>Study Goals</h1>
      <button onClick={() => createGoal(createTestData.studyGoal())}>
        Create Goal
      </button>
      <div data-testid="goals-list">
        {goals?.map((goal: any) => (
          <div key={goal.id} data-testid={`goal-${goal.id}`}>
            <h3>{goal.title}</h3>
            <p>{goal.description}</p>
            <span>Progress: {goal.current_progress}/{goal.target_value}</span>
            <span>Type: {goal.target_type}</span>
            <span>Status: {goal.completed ? 'Completed' : 'In Progress'}</span>
            <button onClick={() => updateGoal(goal.id, { current_progress: goal.current_progress + 10 })}>
              Update Progress
            </button>
            <button onClick={() => deleteGoal(goal.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

describe('Study Goals Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    mockUseStudyGoals.mockReturnValue({
      goals: [],
      loading: true,
      error: null,
      createGoal: vi.fn(),
      updateGoal: vi.fn(),
      deleteGoal: vi.fn(),
    });

    render(<MockStudyGoalsPage />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUseStudyGoals.mockReturnValue({
      goals: [],
      loading: false,
      error: { message: 'Failed to load study goals' },
      createGoal: vi.fn(),
      updateGoal: vi.fn(),
      deleteGoal: vi.fn(),
    });

    render(<MockStudyGoalsPage />);
    expect(screen.getByTestId('error')).toHaveTextContent('Error: Failed to load study goals');
  });

  it('renders study goals with progress', () => {
    const mockGoal = createTestData.studyGoal({
      target_value: 100,
      completed: false,
    });
    
    mockUseStudyGoals.mockReturnValue({
      goals: [mockGoal],
      loading: false,
      error: null,
      createGoal: vi.fn(),
      updateGoal: vi.fn(),
      deleteGoal: vi.fn(),
    });

    render(<MockStudyGoalsPage />);
    
    expect(screen.getByText('Study Goals')).toBeInTheDocument();
    expect(screen.getByTestId(`goal-${mockGoal.id}`)).toBeInTheDocument();
    expect(screen.getByText(mockGoal.title)).toBeInTheDocument();
    expect(screen.getByText('Progress: 25/100')).toBeInTheDocument();
    expect(screen.getByText('Type: flashcards')).toBeInTheDocument();
    expect(screen.getByText('Status: In Progress')).toBeInTheDocument();
  });

  it('shows completed status for finished goals', () => {
    const mockGoal = createTestData.studyGoal({
      current_progress: 100,
      target_value: 100,
      completed: true,
    });
    
    mockUseStudyGoals.mockReturnValue({
      goals: [mockGoal],
      loading: false,
      error: null,
      createGoal: vi.fn(),
      updateGoal: vi.fn(),
      deleteGoal: vi.fn(),
    });

    render(<MockStudyGoalsPage />);
    
    expect(screen.getByText('Status: Completed')).toBeInTheDocument();
    expect(screen.getByText('Progress: 100/100')).toBeInTheDocument();
  });

  it('handles create goal action', async () => {
    const user = userEvent.setup();
    const mockCreateGoal = vi.fn();
    
    mockUseStudyGoals.mockReturnValue({
      goals: [],
      loading: false,
      error: null,
      createGoal: mockCreateGoal,
      updateGoal: vi.fn(),
      deleteGoal: vi.fn(),
    });

    render(<MockStudyGoalsPage />);
    
    await user.click(screen.getByText('Create Goal'));
    expect(mockCreateGoal).toHaveBeenCalledTimes(1);
  });

  it('handles update progress action', async () => {
    const user = userEvent.setup();
    const mockUpdateGoal = vi.fn();
    const mockGoal = createTestData.studyGoal({ current_progress: 50 });
    
    mockUseStudyGoals.mockReturnValue({
      goals: [mockGoal],
      loading: false,
      error: null,
      createGoal: vi.fn(),
      updateGoal: mockUpdateGoal,
      deleteGoal: vi.fn(),
    });

    render(<MockStudyGoalsPage />);
    
    await user.click(screen.getByText('Update Progress'));
    expect(mockUpdateGoal).toHaveBeenCalledWith(mockGoal.id, { current_progress: 60 });
  });

  it('handles delete goal action', async () => {
    const user = userEvent.setup();
    const mockDeleteGoal = vi.fn();
    const mockGoal = createTestData.studyGoal();
    
    mockUseStudyGoals.mockReturnValue({
      goals: [mockGoal],
      loading: false,
      error: null,
      createGoal: vi.fn(),
      updateGoal: vi.fn(),
      deleteGoal: mockDeleteGoal,
    });

    render(<MockStudyGoalsPage />);
    
    await user.click(screen.getByText('Delete'));
    expect(mockDeleteGoal).toHaveBeenCalledWith(mockGoal.id);
  });
});