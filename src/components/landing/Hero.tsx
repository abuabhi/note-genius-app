
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, BookOpen } from "lucide-react";

const Hero = () => {
  return (
    <div className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 bg-opacity-10 backdrop-blur-sm rounded-full text-purple-100 text-sm mb-4">
              <Sparkles className="h-4 w-4 mr-2" />
              <span>AI-Powered Learning Revolution</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white space-y-3">
              <span className="block">Transform Your</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-300">
                Study Game
              </span>
            </h1>
            <p className="text-xl text-purple-100 max-w-2xl">
              Level up your learning with AI-powered study tools. Create flashcards, quizzes, and summaries instantly from your notes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-white text-purple-900 hover:bg-purple-50 hover:scale-105 transform transition-all duration-200">
                <Link to="/signup" className="flex items-center">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="border-purple-200 text-purple-100 hover:bg-purple-800 hover:text-white">
                <Link to="/demo" className="flex items-center">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Watch Demo
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-pink-500 blur-3xl opacity-20 animate-pulse" />
            <div className="relative rounded-2xl overflow-hidden border border-purple-200/10 backdrop-blur-sm">
              <img
                className="w-full h-auto"
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80"
                alt="Students collaborating"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-white to-transparent" />
    </div>
  );
};

export default Hero;
