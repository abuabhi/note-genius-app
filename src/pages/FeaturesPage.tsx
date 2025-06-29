
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/layout/Layout";
import { 
  BookOpen, 
  Brain, 
  Scan, 
  BarChart3, 
  Zap, 
  Calendar, 
  Target,
  CheckSquare,
  Settings,
  Youtube,
  ArrowRight,
  Play,
  Star,
  Users,
  Clock
} from "lucide-react";

const features = [
  {
    category: "AI-Powered Study Tools",
    items: [
      {
        name: "AI Flashcard Generation",
        description: "Transform your notes into smart flashcards automatically with AI-powered content processing and spaced repetition.",
        icon: Brain,
        highlight: "Popular",
        color: "from-mint-500 to-mint-600",
        demoType: "interactive"
      },
      {
        name: "Smart Quiz Creation", 
        description: "Generate adaptive quizzes from your content that adjust difficulty based on your performance and learning progress.",
        icon: Zap,
        highlight: "AI-Powered",
        color: "from-mint-400 to-mint-500",
        demoType: "interactive"
      },
      {
        name: "YouTube Video Summary",
        description: "Convert YouTube educational videos into structured notes and flashcards with AI-powered transcription and summarization.",
        icon: Youtube,
        highlight: "Coming Soon",
        color: "from-mint-600 to-mint-700",
        demoType: "preview"
      },
      {
        name: "Smart Note Enhancement",
        description: "Get AI-generated summaries, explanations, and study guides from your notes instantly.",
        icon: BookOpen,
        highlight: "",
        color: "from-mint-300 to-mint-400",
        demoType: "interactive"
      }
    ]
  },
  {
    category: "Content Management",
    items: [
      {
        name: "Document Scanning",
        description: "Scan handwritten notes, textbooks, and documents with OCR technology for instant digitization.",
        icon: Scan,
        highlight: "",
        color: "from-mint-500 to-mint-600",
        demoType: "demo"
      },
      {
        name: "Multi-format Import",
        description: "Import from PDF, Word, Google Docs, Notion, and other platforms to centralize your study materials.",
        icon: BookOpen,
        highlight: "",
        color: "from-mint-400 to-mint-500",
        demoType: "demo"
      }
    ]
  },
  {
    category: "Study & Analytics",
    items: [
      {
        name: "Learning Analytics",
        description: "Track your study time, performance trends, mastery levels, and get personalized insights to improve faster.",
        icon: BarChart3,
        highlight: "Analytics",
        color: "from-mint-400 to-mint-600",
        demoType: "chart"
      },
      {
        name: "Study Session Tracking",
        description: "Monitor your study sessions with detailed analytics, time tracking, and progress visualization.",
        icon: Clock,
        highlight: "",
        color: "from-mint-500 to-mint-600",
        demoType: "chart"
      }
    ]
  },
  {
    category: "Planning & Organization",
    items: [
      {
        name: "Personalized Study Plans",
        description: "Create intelligent study schedules that adapt to your goals, deadlines, and learning patterns.",
        icon: Calendar,
        highlight: "Smart",
        color: "from-mint-600 to-mint-700",
        demoType: "interactive"
      },
      {
        name: "Goal Management",
        description: "Set academic goals, track progress, and receive intelligent recommendations to stay on track.",
        icon: Target,
        highlight: "",
        color: "from-mint-400 to-mint-500",
        demoType: "interactive"
      },
      {
        name: "Smart ToDo System",
        description: "AI-powered task management that suggests study priorities based on deadlines and difficulty.",
        icon: CheckSquare,
        highlight: "",
        color: "from-mint-500 to-mint-600",
        demoType: "interactive"
      }
    ]
  }
];

const InteractiveDemo = ({ feature }: { feature: any }) => {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  const renderDemo = () => {
    switch (feature.demoType) {
      case "interactive":
        return (
          <div className="bg-gray-50 rounded-lg p-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Try {feature.name}</span>
              <Button size="sm" variant="outline" onClick={() => setActiveDemo(feature.name)}>
                <Play className="h-3 w-3 mr-1" />
                Demo
              </Button>
            </div>
            {activeDemo === feature.name && (
              <div className="bg-white rounded border p-3 text-sm text-gray-600">
                Interactive demo for {feature.name} would appear here. This showcases the core functionality in a simplified format.
              </div>
            )}
          </div>
        );
      
      case "chart":
        return (
          <div className="bg-gray-50 rounded-lg p-4 mt-4">
            <div className="h-20 bg-gradient-to-r from-mint-100 to-mint-200 rounded flex items-center justify-center">
              <BarChart3 className="h-8 w-8 text-mint-600" />
              <span className="ml-2 text-mint-700 font-medium">Sample Analytics Chart</span>
            </div>
          </div>
        );
      
      case "preview":
        return (
          <div className="bg-gray-50 rounded-lg p-4 mt-4">
            <div className="flex items-center text-mint-600">
              <Youtube className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Feature launching soon with full demo</span>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="bg-gray-50 rounded-lg p-4 mt-4">
            <div className="text-center text-sm text-gray-600">
              Live demo available in the full application
            </div>
          </div>
        );
    }
  };

  return renderDemo();
};

const FeaturesPage = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-mint-50/20 via-white to-mint-50/30">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-mint-100 rounded-full text-mint-700 text-sm mb-8">
              🚀 Complete Study Solution
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything you need to
              <span className="block text-mint-500 mt-2">study smarter, not harder</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              From AI-powered flashcards to personalized study plans and detailed analytics - explore all the tools that make StudyAI the complete learning platform.
            </p>
            
            {/* Stats */}
            <div className="flex justify-center flex-wrap gap-8 py-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-mint-600">15K+</div>
                <div className="text-sm text-gray-600">Active Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-mint-600">50K+</div>
                <div className="text-sm text-gray-600">Flashcard Sets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-mint-600">1M+</div>
                <div className="text-sm text-gray-600">Study Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-mint-600">95%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Sections */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          {features.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-20">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {category.category}
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-mint-400 to-mint-600 mx-auto rounded-full"></div>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {category.items.map((feature, index) => (
                  <div
                    key={index}
                    className="relative group rounded-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-mint-300 to-neutral-300 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300" />
                    <div className="relative h-full p-8 bg-white rounded-2xl border border-mint-100 shadow-sm group-hover:shadow-2xl transition-all duration-300">
                      <div className="flex items-start justify-between mb-6">
                        <div className={`inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-r ${feature.color} shadow-lg`}>
                          <feature.icon className="h-7 w-7 text-white" />
                        </div>
                        {feature.highlight && (
                          <Badge 
                            variant="secondary" 
                            className="bg-mint-100 text-mint-700 text-xs px-3 py-1 font-medium border border-mint-200"
                          >
                            {feature.highlight}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.name}</h3>
                      <p className="text-gray-600 leading-relaxed mb-6">{feature.description}</p>
                      
                      {/* Interactive Demo */}
                      <InteractiveDemo feature={feature} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-b from-mint-50/30 to-mint-100/50 py-20">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-mint-700 text-sm mb-8 border border-mint-200">
              <Star className="h-4 w-4 mr-2" />
              <span>Join 15,000+ successful students</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Ready to transform your study routine?
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Start using AI-powered study tools, create personalized study plans, and track your learning progress today.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                size="lg"
                className="bg-mint-600 hover:bg-mint-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                asChild
              >
                <Link to="/signup">
                  Start Free Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-mint-300 text-mint-700 hover:bg-mint-50 hover:border-mint-400 bg-white shadow-md hover:shadow-lg transition-all duration-200"
                asChild
              >
                <Link to="/login">
                  Sign In to Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <p className="mt-6 text-sm text-gray-500">
              ✓ Free forever plan ✓ No credit card required ✓ Full access to core features
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FeaturesPage;
