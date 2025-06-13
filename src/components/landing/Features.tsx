
import { BookOpen, Brain, Scan, BarChart3, Users, Zap } from "lucide-react";

const features = [
  {
    name: "AI Flashcard Generation",
    description: "Transform your notes into smart flashcards automatically with AI-powered content processing.",
    icon: Brain,
    highlight: "Popular"
  },
  {
    name: "Smart Note Enhancement",
    description: "Upload, scan, or write notes. Get AI-generated summaries, explanations, and study guides.",
    icon: BookOpen,
    highlight: ""
  },
  {
    name: "Document Scanning",
    description: "Scan handwritten notes, textbooks, and documents with OCR technology for instant digitization.",
    icon: Scan,
    highlight: ""
  },
  {
    name: "Adaptive Quizzes",
    description: "Generate personalized quizzes from your content that adapt to your learning progress.",
    icon: Zap,
    highlight: "AI-Powered"
  },
  {
    name: "Progress Analytics",
    description: "Track your study time, performance trends, and mastery levels with detailed insights.",
    icon: BarChart3,
    highlight: ""
  },
  {
    name: "Study Collaboration",
    description: "Share flashcard sets, join study groups, and learn together with classmates.",
    icon: Users,
    highlight: ""
  },
];

const Features = () => {
  return (
    <div className="py-24 bg-gradient-to-b from-mint-50/10 via-white to-mint-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 bg-mint-100 rounded-full text-mint-700 text-sm mb-8">
            🚀 Complete Study Solution
          </div>
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Everything you need to study smarter
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            From AI-powered flashcards to collaborative study groups - all the tools you need in one platform
          </p>
        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="relative group rounded-2xl transition-all duration-200 hover:scale-105"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-mint-300 to-neutral-300 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-200" />
              <div className="relative h-full p-6 bg-white rounded-2xl border border-mint-100">
                <div className="flex items-start justify-between mb-4">
                  <span className="inline-flex items-center justify-center p-3 rounded-xl bg-gradient-to-br from-mint-400 to-neutral-400">
                    <feature.icon className="h-6 w-6 text-white" />
                  </span>
                  {feature.highlight && (
                    <span className="px-2 py-1 text-xs bg-mint-100 text-mint-700 rounded-full">
                      {feature.highlight}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{feature.name}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Demo Section */}
        <div className="mt-16 text-center">
          <Button
            variant="outline"
            size="lg"
            className="border-mint-200 text-mint-700 hover:bg-mint-50"
          >
            <Link to="/flashcards" className="flex items-center">
              See Features in Action
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Features;
