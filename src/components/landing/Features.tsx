
import { Notebook, BrainCircuit, FileText, AlertCircle } from "lucide-react";

const features = [
  {
    name: "Smart Notes",
    description:
      "Take notes or record audio that automatically transcribes to text. Our AI helps organize and structure your notes for better learning.",
    icon: Notebook,
  },
  {
    name: "AI-Generated Flashcards",
    description:
      "Convert your notes into effective flashcards with spaced repetition algorithms to help you remember more in less time.",
    icon: BrainCircuit,
  },
  {
    name: "Personalized Quizzes",
    description:
      "Generate customized quizzes based on your notes to test your knowledge and identify areas that need more focus.",
    icon: FileText,
  },
  {
    name: "Study Insights",
    description:
      "Track your progress and receive insights about your learning patterns to help you study more effectively.",
    icon: AlertCircle,
  },
];

const Features = () => {
  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-purple-600 font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            A better way to study
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Our AI-powered tools help you learn more efficiently and retain information longer.
          </p>
        </div>

        <div className="mt-10">
          <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {features.map((feature) => (
              <div key={feature.name} className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white">
                  <feature.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                <p className="mt-2 ml-16 text-base text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
