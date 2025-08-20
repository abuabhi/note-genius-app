import { BookOpen, Brain, Scan, BarChart3, Zap, Calendar, ArrowRight, MessageSquare, Timer, Target, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const features = [
  {
    name: "Notes Import & AI Enhancement",
    description: "Create notes manually or import from PDF, Google Docs, OneNote, or handwriting with OCR. Summaries, key points, and top questions with AI.",
    icon: BookOpen,
    highlight: "All-in-one",
    color: "from-mint-500 to-mint-600"
  },
  {
    name: "AI Flashcard Generation",
    description: "Turn notes into smart flashcards instantly with spaced repetition and multiple types.",
    icon: Brain,
    highlight: "Popular",
    color: "from-mint-400 to-mint-500"
  },
  {
    name: "Smart Quizzes",
    description: "Generate adaptive quizzes from your notes in one click to master concepts fast.",
    icon: Zap,
    highlight: "AI-Powered",
    color: "from-mint-600 to-mint-700"
  },
  {
    name: "AI Chat with Your Notes",
    description: "Ask questions, get explanations, and create flashcards directly from chat.",
    icon: MessageSquare,
    highlight: "New",
    color: "from-mint-300 to-mint-400"
  },
  {
    name: "Personalized Study Plans",
    description: "Plans that adapt to your goals, deadlines, and learning pace.",
    icon: Calendar,
    highlight: "Adaptive",
    color: "from-mint-500 to-mint-600"
  },
  {
    name: "To‑Do & Focus",
    description: "Stay organized with tasks and keep focus during sessions.",
    icon: ListChecks,
    highlight: "Organizer",
    color: "from-mint-400 to-mint-600"
  },
  {
    name: "Learning Analytics",
    description: "Track time, mastery, and trends with actionable insights.",
    icon: BarChart3,
    highlight: "Analytics",
    color: "from-mint-400 to-mint-600"
  },
  {
    name: "Study Timer",
    description: "Built-in timer to structure sessions and boost consistency.",
    icon: Timer,
    highlight: "Pomodoro",
    color: "from-mint-500 to-mint-600"
  },
  {
    name: "Goals & Progress",
    description: "Set goals and measure progress to stay motivated.",
    icon: Target,
    highlight: "Motivation",
    color: "from-mint-600 to-mint-700"
  },
];

const Features = () => {
  return (
    <div className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-mint-50/10 via-white to-mint-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-mint-100 rounded-full text-mint-700 text-xs sm:text-sm mb-6 sm:mb-8">
            🚀 Complete Study Solution
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 lg:text-4xl">
            Everything you need to study smarter
          </h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            From AI-powered flashcards to personalized study plans and detailed analytics - all the tools you need in one platform
          </p>
        </div>

        <div className="mt-12 sm:mt-16 lg:mt-20 grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="relative group rounded-xl sm:rounded-2xl transition-all duration-300 sm:hover:scale-105 sm:hover:-translate-y-2"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-mint-300 to-neutral-300 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300" />
              <div className="relative h-full p-6 sm:p-8 bg-white rounded-xl sm:rounded-2xl border border-mint-100 shadow-sm group-hover:shadow-2xl transition-all duration-300">
                <div className="flex items-start justify-between mb-4 sm:mb-6">
                  <div className={`inline-flex items-center justify-center p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r ${feature.color} shadow-lg`}>
                    <feature.icon className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                  </div>
                  {feature.highlight && (
                    <span className="px-2 sm:px-3 py-1 text-xs bg-mint-100 text-mint-700 rounded-full font-medium border border-mint-200">
                      {feature.highlight}
                    </span>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3 leading-tight">{feature.name}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4 sm:mb-6">{feature.description}</p>
                
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
        <div className="mt-12 sm:mt-16 text-center">
          <Button
            variant="outline"
            size="lg"
            className="border-2 border-mint-300 text-mint-700 hover:bg-mint-50 hover:border-mint-400 bg-white shadow-md hover:shadow-lg transition-all duration-200 min-h-[48px] text-base font-medium"
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
