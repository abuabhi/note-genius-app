
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";

const CTA = () => {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-500" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      <div className="relative max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm mb-8">
            <Star className="h-4 w-4 mr-2" />
            <span>Join thousands of successful students</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
            Ready to transform your learning?
          </h2>
          <p className="mt-4 text-xl text-orange-50">
            Start for free and upgrade anytime. No credit card required.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button
              size="lg"
              className="bg-white text-orange-700 hover:bg-orange-50 hover:scale-105 transform transition-all duration-200"
            >
              <Link to="/signup" className="flex items-center">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTA;
