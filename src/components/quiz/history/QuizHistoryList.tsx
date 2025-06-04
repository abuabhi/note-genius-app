
import { QuizHistoryCard } from "./QuizHistoryCard";

interface QuizResultItem {
  id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  duration_seconds: number | null;
  completed_at: string;
  quiz: {
    title: string;
    description: string | null;
  };
}

interface QuizSessionItem {
  id: string;
  flashcard_set_id: string;
  start_time: string;
  end_time: string;
  total_cards: number;
  correct_answers: number;
  total_score: number;
  duration_seconds: number;
  average_response_time: number;
  grade: string;
  flashcard_set: {
    name: string;
    subject: string;
  };
}

interface QuizHistoryListProps {
  quizResults: QuizResultItem[];
  quizSessions: QuizSessionItem[];
}

export const QuizHistoryList = ({ quizResults, quizSessions }: QuizHistoryListProps) => {
  return (
    <div className="space-y-4">
      {/* Traditional Quiz Results */}
      {quizResults.map((quiz) => (
        <QuizHistoryCard key={quiz.id} quiz={quiz} type="traditional" />
      ))}

      {/* Flashcard Quiz Sessions */}
      {quizSessions.map((quiz) => (
        <QuizHistoryCard key={quiz.id} quiz={quiz} type="flashcard" />
      ))}
    </div>
  );
};
