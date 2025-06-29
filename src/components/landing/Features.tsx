
import { BookOpen, Brain, Scan, BarChart3, Zap, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const features = [
  {
    name: "AI Flashcard Generation",
    description: "Transform your notes into smart flashcards automatically with AI-powered content processing and spaced repetition.",
    icon: Brain,
    highlight: "Popular",
    color: "from-mint-500 to-mint-600"
  },
  {
    name: "Smart Quiz Creation",
    description: "Generate adaptive quizzes from your content that adjust difficulty based on your performance and learning progress.",
    icon: Zap,
    highlight: "AI-Powered",
    color: "from-blue-500 to-blue-600"
  },
  {
    name: "Personalized Study Plans",
    description: "Create intelligent study schedules that adapt to your goals, deadlines, and learning patterns for optimal results.",
    icon: Calendar,
    highlight: "New",
    color: "from-purple-500 to-purple-600"
  },
  {
    name: "Smart Note Enhancement",
    description: "Upload, scan, or write notes. Get AI-generated summaries, explanations, and study guides instantly.",
    icon: BookOpen,
    highlight: "",
    color: "from-green-500 to-green-600"
  },
  {
    name: "Document Scanning",
    description: "Scan handwritten notes, textbooks, and documents with OCR technology for instant digitization and processing.",
    icon: Scan,
    highlight: "",
    color: "from-orange-500 to-orange-600"
  },
  {
    name: "Learning Analytics",
    description: "Track your study time, performance trends, mastery levels, and get personalized insights to improve faster.",
    icon: BarChart3,
    highlight: "Analytics",
    color: "from-pink-500 to-pink-600"
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
            From AI-powered flashcards to personalized study plans and detailed analytics - all the tools you need in one platform
          </p>
        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="relative group rounded-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-mint-300 to-neutral-300 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300" />
              <div className="relative h-full p-8 bg-white rounded-2xl border border-mint-100 shadow-sm group-hover:shadow-2xl transition-all duration-300">
                <div className="flex items-start justify-between mb-6">
                  <div className={`inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-r ${feature.color} shadow-lg`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  {feature.highlight && (
                    <span className="px-3 py-1 text-xs bg-mint-100 text-mint-700 rounded-full font-medium border border-mint-200">
                      {feature.highlight}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.name}</h3>
                <p className="text-gray-600 leading-relaxed mb-6">{feature.description}</p>
                
                {/* Interactive hover element */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center text-mint-600 text-sm font-medium">
                    <span>Try this feature</span>
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Demo Section */}
        <div className="mt-16 text-center">
          <Button
            variant="outline"
            size="lg"
            className="border-2 border-mint-300 text-mint-700 hover:bg-mint-50 hover:border-mint-400 bg-white shadow-md hover:shadow-lg transition-all duration-200"
            asChild
          >
            <Link to="/features">
              See All Features in Action
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Features;
