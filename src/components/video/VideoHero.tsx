import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { HeroLogo } from "@/components/landing/HeroLogo";
import { ReactVideoPlayer } from "./ReactVideoPlayer";

const VideoHero = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-12 sm:pb-16 max-w-7xl mx-auto">
      <div className="space-y-8 sm:space-y-12">
        {/* Text Content Section */}
        <div className="text-center space-y-6 sm:space-y-8">
          <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-mint-100 rounded-full text-mint-700 text-xs sm:text-sm">
            <span>✨ See Your Learning Come Alive</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Transform Your Study Game
              <span className="block text-mint-500 mt-1 sm:mt-2">
                With Visual Learning Tools That Actually Work
              </span>
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Watch how AI transforms your notes into flashcards, creates smart quizzes, and builds personalized study plans. See every feature in action.
            </p>
          </div>
        </div>

        {/* Video Section */}
        <div className="relative max-w-4xl mx-auto">
          <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-mint-300 to-neutral-300 blur-2xl sm:blur-3xl opacity-20" />
          <ReactVideoPlayer 
            url="https://www.youtube.com/watch?v=UR94FhzUOg0" 
            title="PrepGenie Platform Overview"
            className="relative rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl w-full"
          />
          <div className="absolute -bottom-2 sm:-bottom-4 -right-2 sm:-right-4 bg-white rounded-lg shadow-lg p-2 sm:p-3 border border-mint-100">
            <p className="text-xs text-gray-600 font-medium">🎥 See It In Action</p>
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="text-center space-y-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-mint-600 hover:bg-mint-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 min-h-[48px] text-base font-medium"
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
              className="border-2 border-mint-300 text-mint-700 hover:bg-mint-50 hover:border-mint-400 bg-white shadow-md hover:shadow-lg transition-all duration-200 min-h-[48px] text-base font-medium"
              asChild
            >
              <Link to="/features">
                <Play className="mr-2 h-4 w-4" />
                Try Interactive Demo
              </Link>
            </Button>
          </div>
          
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
            No credit card required • Join 15,000+ high school & college students
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-mint-600">50K+</div>
            <div className="text-xs sm:text-sm text-gray-600">Flashcard Sets</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-mint-600">25K+</div>
            <div className="text-xs sm:text-sm text-gray-600">Study Plans</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-mint-600">1M+</div>
            <div className="text-xs sm:text-sm text-gray-600">Study Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-mint-600">95%</div>
            <div className="text-xs sm:text-sm text-gray-600">Improvement Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoHero;