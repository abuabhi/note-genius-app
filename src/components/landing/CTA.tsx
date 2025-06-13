
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Zap, Clock } from "lucide-react";

const CTA = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-mint-50/30 to-mint-100/50">
      <div className="absolute inset-0 bg-gradient-to-br from-mint-400/80 via-mint-500/70 to-neutral-300/40" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
      <div className="relative max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm mb-8">
            <Star className="h-4 w-4 mr-2" />
            <span>Join 10,000+ successful students</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
            Ready to study smarter?
          </h2>
          <p className="mt-4 text-xl text-mint-50 max-w-2xl mx-auto">
            Start creating AI-powered flashcards, enhanced notes, and adaptive quizzes today. No credit card required.
          </p>

          {/* Feature highlights */}
          <div className="mt-8 flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                <span className="text-sm">AI-Generated Content</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span className="text-sm">Save 5+ Hours/Week</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                <span className="text-sm">95% Success Rate</span>
              </div>
            </div>
          </div>
          
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              className="bg-white text-mint-700 hover:bg-mint-50 hover:scale-105 transform transition-all duration-200"
            >
              <Link to="/signup" className="flex items-center">
                Start Free Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
            >
              <Link to="/flashcards" className="flex items-center">
                Try Live Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <p className="mt-6 text-sm text-mint-100">
            ✓ Free forever plan ✓ No credit card required ✓ Upgrade anytime
          </p>
        </div>
      </div>
    </div>
  );
};

export default CTA;
