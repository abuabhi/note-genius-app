
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";



const Hero = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-12 sm:pb-16 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div className="space-y-6 sm:space-y-8">
          
          <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-mint-100 rounded-full text-mint-700 text-xs sm:text-sm">
            <span>✨ AI-Powered Study Tools</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Master Any Subject
              <span className="block text-mint-500 mt-1 sm:mt-2">
                With AI Flashcards, Smart Quizzes, Study Plans & Learning Analytics
              </span>
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-600 max-w-2xl leading-relaxed">
              Create flashcards from your notes, generate AI-powered quizzes, build personalized study plans, and track your progress with detailed learning analytics.
            </p>
          </div>
          
          {/* Stats - Mobile Optimized Grid */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:gap-6 py-4">
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

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
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
        <div className="relative mt-8 lg:mt-0">
          <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-mint-300 to-neutral-300 blur-2xl sm:blur-3xl opacity-20" />
          <picture>
            <source srcSet="/lovable-uploads/hero.webp" type="image/webp" />
            <img
              src="/lovable-uploads/hero.png?v=5"
              alt="PrepGenie dashboard showing flashcards, quizzes, study plans, notes, and analytics tracking"
              width={1600}
              height={900}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 50vw"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="relative rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl w-full object-cover max-h-[400px] sm:max-h-none sm:aspect-[16/10]"
            />
          </picture>
          <div className="absolute -bottom-2 sm:-bottom-4 -right-2 sm:-right-4 bg-white rounded-lg shadow-lg p-2 sm:p-3 border border-mint-100">
            <p className="text-xs text-gray-600 font-medium">📊 Study Analytics</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
