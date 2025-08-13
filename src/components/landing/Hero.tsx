
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";

const Hero = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-20 pb-16 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center px-4 py-2 bg-mint-100 rounded-full text-mint-700 text-sm">
            <span>✨ AI-Powered Study Tools</span>
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Master Any Subject
              <span className="block text-mint-500 mt-2">
                With AI Flashcards, Smart Quizzes, Study Plans & Learning Analytics
              </span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-2xl">
              Create flashcards from your notes, generate AI-powered quizzes, build personalized study plans, and track your progress with detailed learning analytics.
            </p>
          </div>
          
          {/* Stats */}
          <div className="flex flex-wrap gap-6 py-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-mint-600">50K+</div>
              <div className="text-sm text-gray-600">Flashcard Sets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-mint-600">25K+</div>
              <div className="text-sm text-gray-600">Study Plans</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-mint-600">1M+</div>
              <div className="text-sm text-gray-600">Study Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-mint-600">95%</div>
              <div className="text-sm text-gray-600">Improvement Rate</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="bg-mint-600 hover:bg-mint-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              asChild
            >
              <Link to="/signup">
                Start Learning Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-mint-300 text-mint-700 hover:bg-mint-50 hover:border-mint-400 bg-white shadow-md hover:shadow-lg transition-all duration-200"
              asChild
            >
              <Link to="/features">
                <Play className="mr-2 h-4 w-4" />
                Try Interactive Demo
              </Link>
            </Button>
          </div>
          
          <p className="text-sm text-gray-500">
            No credit card required • Join 15,000+ high school & college students
          </p>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-mint-300 to-neutral-300 blur-3xl opacity-20" />
          <img
            src="/lovable-uploads/9e080446-2784-40e3-9ee8-d58f79a70960.png"
            alt="PrepGenie dashboard showing flashcards, quizzes, study plans, notes, and analytics tracking"
            className="relative rounded-2xl shadow-xl w-full"
          />
          <div className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-lg p-3 border border-mint-100">
            <p className="text-xs text-gray-600 font-medium">📊 Study Analytics</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
