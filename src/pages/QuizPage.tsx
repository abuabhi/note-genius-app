
import Layout from "@/components/layout/Layout";
import QuizList from "@/components/quiz/QuizList";

const QuizPage = () => {
  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Quizzes</h1>
        <QuizList />
      </div>
    </Layout>
  );
};

export default QuizPage;
