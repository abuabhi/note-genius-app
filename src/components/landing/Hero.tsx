
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-20 pb-16 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center px-4 py-2 bg-mint-100 rounded-full text-mint-700 text-sm">
            <span>Start Learning Today</span>
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Learn From Home
              <span className="block text-orange-500 mt-2">
                With AI-Powered Study Tools
              </span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-2xl">
              Transform your learning experience with personalized study paths, interactive lessons, and real-time progress tracking.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Link to="/signup" className="flex items-center">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-orange-200 text-orange-700 hover:bg-orange-50"
            >
              <Link to="/courses">
                Browse Courses
              </Link>
            </Button>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-mint-300 to-mint-300 blur-3xl opacity-20" />
          <img
            src="/lovable-uploads/300e0c37-2d0d-4e48-aaaf-8b1c4dc65276.png"
            alt="Learning dashboard"
            className="relative rounded-2xl shadow-xl w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
