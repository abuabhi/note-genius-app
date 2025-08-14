import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { createTestData } from '@/test/utils/testDataFactory';

// Mock the quiz hook
const mockUseQuiz = vi.fn();
vi.mock('@/hooks/useQuiz', () => ({
  useQuiz: () => mockUseQuiz(),
}));

// Mock component for testing
const MockQuizPage = () => {
  const { quizzes, loading, error, createQuiz, deleteQuiz, startQuiz } = mockUseQuiz();
  
  if (loading) return <div data-testid="loading">Loading...</div>;
  if (error) return <div data-testid="error">Error: {error.message}</div>;
  
  return (
    <div>
      <h1>Quizzes</h1>
      <button onClick={() => createQuiz(createTestData.quiz())}>
        Create Quiz
      </button>
      <div data-testid="quiz-list">
        {quizzes?.map((quiz: any) => (
          <div key={quiz.id} data-testid={`quiz-${quiz.id}`}>
            <h3>{quiz.title}</h3>
            <p>{quiz.description}</p>
            <span>Questions: {quiz.question_count}</span>
            <span>Difficulty: {quiz.difficulty}</span>
            <span>Time Limit: {quiz.time_limit_minutes}min</span>
            <button onClick={() => startQuiz(quiz.id)}>Start Quiz</button>
            <button onClick={() => deleteQuiz(quiz.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

describe('Quiz Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    mockUseQuiz.mockReturnValue({
      quizzes: [],
      loading: true,
      error: null,
      createQuiz: vi.fn(),
      deleteQuiz: vi.fn(),
      startQuiz: vi.fn(),
    });

    render(<MockQuizPage />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUseQuiz.mockReturnValue({
      quizzes: [],
      loading: false,
      error: { message: 'Failed to load quizzes' },
      createQuiz: vi.fn(),
      deleteQuiz: vi.fn(),
      startQuiz: vi.fn(),
    });

    render(<MockQuizPage />);
    expect(screen.getByTestId('error')).toHaveTextContent('Error: Failed to load quizzes');
  });

  it('renders quiz list with details', () => {
    const mockQuiz = createTestData.quiz({
      questionCount: 10,
    });
    
    mockUseQuiz.mockReturnValue({
      quizzes: [mockQuiz],
      loading: false,
      error: null,
      createQuiz: vi.fn(),
      deleteQuiz: vi.fn(),
      startQuiz: vi.fn(),
    });

    render(<MockQuizPage />);
    
    expect(screen.getByText('Quizzes')).toBeInTheDocument();
    expect(screen.getByTestId(`quiz-${mockQuiz.id}`)).toBeInTheDocument();
    expect(screen.getByText(mockQuiz.title)).toBeInTheDocument();
    expect(screen.getByText('Questions: 10')).toBeInTheDocument();
    expect(screen.getByText('Difficulty: hard')).toBeInTheDocument();
    expect(screen.getByText('Time Limit: 45min')).toBeInTheDocument();
  });

  it('handles create quiz action', async () => {
    const user = userEvent.setup();
    const mockCreateQuiz = vi.fn();
    
    mockUseQuiz.mockReturnValue({
      quizzes: [],
      loading: false,
      error: null,
      createQuiz: mockCreateQuiz,
      deleteQuiz: vi.fn(),
      startQuiz: vi.fn(),
    });

    render(<MockQuizPage />);
    
    await user.click(screen.getByText('Create Quiz'));
    expect(mockCreateQuiz).toHaveBeenCalledTimes(1);
  });

  it('handles start quiz action', async () => {
    const user = userEvent.setup();
    const mockStartQuiz = vi.fn();
    const mockQuiz = createTestData.quiz();
    
    mockUseQuiz.mockReturnValue({
      quizzes: [mockQuiz],
      loading: false,
      error: null,
      createQuiz: vi.fn(),
      deleteQuiz: vi.fn(),
      startQuiz: mockStartQuiz,
    });

    render(<MockQuizPage />);
    
    await user.click(screen.getByText('Start Quiz'));
    expect(mockStartQuiz).toHaveBeenCalledWith(mockQuiz.id);
  });

  it('handles delete quiz action', async () => {
    const user = userEvent.setup();
    const mockDeleteQuiz = vi.fn();
    const mockQuiz = createTestData.quiz();
    
    mockUseQuiz.mockReturnValue({
      quizzes: [mockQuiz],
      loading: false,
      error: null,
      createQuiz: vi.fn(),
      deleteQuiz: mockDeleteQuiz,
      startQuiz: vi.fn(),
    });

    render(<MockQuizPage />);
    
    await user.click(screen.getByText('Delete'));
    expect(mockDeleteQuiz).toHaveBeenCalledWith(mockQuiz.id);
  });

  it('displays multiple quizzes with different difficulties', () => {
    const quizzes = [
      createTestData.quiz({ questionCount: 5 }),
      createTestData.quiz({ questionCount: 10 }),
      createTestData.quiz({ questionCount: 15 }),
    ];
    
    mockUseQuiz.mockReturnValue({
      quizzes,
      loading: false,
      error: null,
      createQuiz: vi.fn(),
      deleteQuiz: vi.fn(),
      startQuiz: vi.fn(),
    });

    render(<MockQuizPage />);
    
    expect(screen.getByText('Difficulty: easy')).toBeInTheDocument();
    expect(screen.getByText('Difficulty: intermediate')).toBeInTheDocument();
    expect(screen.getByText('Difficulty: hard')).toBeInTheDocument();
    expect(screen.getByText('Questions: 5')).toBeInTheDocument();
    expect(screen.getByText('Questions: 10')).toBeInTheDocument();
    expect(screen.getByText('Questions: 15')).toBeInTheDocument();
  });
});