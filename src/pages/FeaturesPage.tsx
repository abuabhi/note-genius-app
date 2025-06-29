
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  FileText, 
  CreditCard, 
  HelpCircle, 
  CheckSquare, 
  Target,
  ArrowRight,
  BookOpen,
  BarChart3,
  Zap,
  Calendar,
  Scan,
  Upload,
  Filter,
  Search,
  TrendingUp,
  Clock,
  Star,
  PlayCircle,
  Users,
  BookText
} from "lucide-react";

// Enhanced AI Flashcard Generation Demo Component
const AIFlashcardGenerationDemo = () => {
  const [activeStep, setActiveStep] = useState(0);
  
  const steps = [
    { title: "Select Notes", description: "Choose from your study materials" },
    { title: "AI Processing", description: "Smart content analysis" },
    { title: "Generate Cards", description: "Create flashcards automatically" }
  ];

  const toolkitItems = [
    {
      title: "Notes",
      value: 12,
      icon: FileText,
      color: "blue",
    },
    {
      title: "Flashcard Sets",
      value: 8,
      icon: CreditCard,
      color: "mint",
    },
    {
      title: "Total Cards",
      value: 156,
      icon: BookOpen,
      color: "purple",
    },
    {
      title: "Quizzes",
      value: 5,
      icon: HelpCircle,
      color: "orange",
    },
    {
      title: "Todos",
      value: 23,
      icon: CheckSquare,
      color: "green",
    },
    {
      title: "Goals",
      value: 4,
      icon: Target,
      color: "red",
    }
  ];

  const getCardColors = (color: string) => {
    switch (color) {
      case 'mint': return 'bg-mint-50 border-mint-200';
      case 'blue': return 'bg-blue-50 border-blue-200';
      case 'purple': return 'bg-purple-50 border-purple-200';
      case 'orange': return 'bg-orange-50 border-orange-200';
      case 'green': return 'bg-green-50 border-green-200';
      case 'red': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getIconColors = (color: string) => {
    switch (color) {
      case 'mint': return 'text-mint-600 bg-mint-100';
      case 'blue': return 'text-blue-600 bg-blue-100';
      case 'purple': return 'text-purple-600 bg-purple-100';
      case 'orange': return 'text-orange-600 bg-orange-100';
      case 'green': return 'text-green-600 bg-green-100';
      case 'red': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-8">
      {/* Learning Toolkit Stats */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Learning Toolkit</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {toolkitItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Card 
                key={index} 
                className={`${getCardColors(item.color)} border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group`}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className={`p-3 rounded-lg ${getIconColors(item.color)} group-hover:scale-110 transition-transform duration-200`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    
                    <div>
                      <p className="text-2xl font-bold text-gray-900 mb-1">
                        {item.value}
                      </p>
                      <p className="text-sm font-medium text-gray-600">
                        {item.title}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* AI Generation Process */}
      <div className="bg-gradient-to-br from-mint-50 to-blue-50 rounded-xl p-6 border border-mint-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-mint-500 to-mint-600 rounded-lg flex items-center justify-center">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">AI Flashcard Generation</h3>
            <p className="text-mint-600">Transform your Biology notes into smart flashcards</p>
          </div>
        </div>

        {/* Process Steps */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index <= activeStep ? 'bg-mint-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {index + 1}
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-800">{step.title}</p>
                <p className="text-sm text-gray-500">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="h-4 w-4 text-gray-400 mx-4" />
              )}
            </div>
          ))}
        </div>

        {/* Note Preview */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-gray-800">Biology Notes</span>
              <Badge variant="secondary" className="ml-auto">Processing</Badge>
            </div>
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Photosynthesis</strong> is the process by which plants convert light energy into chemical energy...</p>
              <p><strong>Cellular Respiration</strong> breaks down glucose to release energy for cellular activities...</p>
              <p><strong>Mitosis</strong> is the process of cell division that produces two identical diploid cells...</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-mint-200">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-4 w-4 text-mint-600" />
              <span className="font-medium text-gray-800">Generated Flashcards</span>
              <Badge className="ml-auto bg-mint-100 text-mint-700">12 Cards</Badge>
            </div>
            <div className="space-y-3">
              <div className="bg-mint-50 rounded-lg p-3 border border-mint-100">
                <p className="font-medium text-gray-800 mb-1">What is photosynthesis?</p>
                <p className="text-sm text-gray-600">The process by which plants convert light energy...</p>
              </div>
              <div className="bg-mint-50 rounded-lg p-3 border border-mint-100">
                <p className="font-medium text-gray-800 mb-1">Define cellular respiration</p>
                <p className="text-sm text-gray-600">The process that breaks down glucose...</p>
              </div>
              <div className="bg-mint-50 rounded-lg p-3 border border-mint-100">
                <p className="font-medium text-gray-800 mb-1">What happens during mitosis?</p>
                <p className="text-sm text-gray-600">Cell division producing two identical...</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button 
            className="bg-mint-500 hover:bg-mint-600 text-white"
            onClick={() => setActiveStep((prev) => Math.min(prev + 1, steps.length - 1))}
          >
            <Zap className="h-4 w-4 mr-2" />
            Generate More Cards
          </Button>
          <Button variant="outline" className="border-mint-200 hover:bg-mint-50 text-mint-700">
            <BookOpen className="h-4 w-4 mr-2" />
            Start Studying
          </Button>
        </div>
      </div>
    </div>
  );
};

const FeaturesPage = () => {
  const features = [
    {
      group: "AI-Powered Study Tools",
      items: [
        {
          name: "Smart Notes Enhancement",
          description: "AI-powered summaries, explanations, and key concepts extraction from your study materials.",
          icon: Brain,
          highlight: "AI-Powered"
        },
        {
          name: "AI Flashcard Generation", 
          description: "Automatically transform your notes into effective flashcards with spaced repetition.",
          icon: CreditCard,
          highlight: "Popular"
        },
        {
          name: "Adaptive Quiz Creation",
          description: "Generate personalized quizzes that adapt to your learning progress and weak areas.",
          icon: HelpCircle,
          highlight: "Smart"
        },
        {
          name: "YouTube Video Summary",
          description: "Extract key insights and create study notes from educational YouTube videos.",
          icon: PlayCircle,
          highlight: "New"
        }
      ]
    },
    {
      group: "Content Management",
      items: [
        {
          name: "Document Scanning",
          description: "OCR technology to digitize handwritten notes, textbooks, and documents instantly.",
          icon: Scan,
          highlight: "OCR"
        },
        {
          name: "Multi-format Import",
          description: "Import from PDF, Word, Google Docs, Notion, Evernote, and more formats seamlessly.",
          icon: Upload,
          highlight: "Versatile"
        },
        {
          name: "Smart Organization",
          description: "Automatic tagging, filtering, and search capabilities to organize your study materials.",
          icon: Filter,
          highlight: "Auto-tag"
        },
        {
          name: "Advanced Search",
          description: "Find any content across notes, flashcards, and quizzes with intelligent search.",
          icon: Search,
          highlight: "Intelligent"
        }
      ]
    },
    {
      group: "Study & Analytics",
      items: [
        {
          name: "Performance Tracking",
          description: "Detailed analytics on study time, completion rates, and learning progress trends.",
          icon: BarChart3,
          highlight: "Analytics"
        },
        {
          name: "Learning Insights",
          description: "AI-driven insights about your study patterns and recommendations for improvement.",
          icon: TrendingUp,
          highlight: "AI Insights"
        },
        {
          name: "Progress Visualization",
          description: "Interactive charts and graphs showing your mastery levels across different subjects.",
          icon: Star,
          highlight: "Visual"
        },
        {
          name: "Study Session History",
          description: "Complete history of your study sessions with detailed performance metrics.",
          icon: Clock,
          highlight: "Detailed"
        }
      ]
    },
    {
      group: "Planning & Organization",
      items: [
        {
          name: "Smart Study Plans",
          description: "AI-generated study schedules that adapt to your goals, deadlines, and availability.",
          icon: Calendar,
          highlight: "AI-Generated"
        },
        {
          name: "Goal Management",
          description: "Set, track, and achieve your academic goals with smart milestone tracking.",
          icon: Target,
          highlight: "Smart Goals"
        },
        {
          name: "Task Automation",
          description: "Automated reminders, deadline tracking, and study session suggestions.",
          icon: Zap,
          highlight: "Automated"
        },
        {
          name: "Collaboration Tools",
          description: "Share study materials, create study groups, and collaborate with classmates.",
          icon: Users,
          highlight: "Social"
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-mint-50/20 via-white to-mint-50/30">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-mint-100 rounded-full text-mint-700 text-sm mb-8">
            🚀 Complete Feature Overview
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need to Study Smarter
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Explore our comprehensive suite of AI-powered study tools, content management, analytics, and planning features
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-mint-600">50K+</div>
              <div className="text-gray-600">Flashcard Sets</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-mint-600">25K+</div>
              <div className="text-gray-600">Study Plans</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-mint-600">1M+</div>
              <div className="text-gray-600">Study Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-mint-600">95%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Feature Demos */}
        <div className="space-y-16">
          {features.map((group, groupIndex) => (
            <div key={groupIndex}>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                {group.group}
              </h2>
              
              {/* Special Demo for AI Flashcard Generation */}
              {group.group === "AI-Powered Study Tools" && (
                <div className="mb-12">
                  <AIFlashcardGenerationDemo />
                </div>
              )}
              
              {/* Content Management Demo */}
              {group.group === "Content Management" && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 mb-12 border border-blue-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Content Management in Action</h3>
                  <Tabs defaultValue="scanning" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-white">
                      <TabsTrigger value="scanning">Document Scanning</TabsTrigger>
                      <TabsTrigger value="import">Multi-format Import</TabsTrigger>
                      <TabsTrigger value="organize">Smart Organization</TabsTrigger>
                      <TabsTrigger value="search">Advanced Search</TabsTrigger>
                    </TabsList>
                    <TabsContent value="scanning" className="mt-6">
                      <div className="bg-white rounded-lg p-6 border">
                        <div className="flex items-center gap-3 mb-4">
                          <Scan className="h-6 w-6 text-blue-600" />
                          <span className="font-semibold">OCR Document Processing</span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="bg-gray-100 rounded-lg p-4 text-center">
                            <BookText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Handwritten Notes</p>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-4">
                            <p className="font-medium mb-2">Extracted Text:</p>
                            <p className="text-sm text-gray-700">"Photosynthesis converts CO₂ + H₂O + light → glucose + O₂"</p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="import" className="mt-6">
                      <div className="bg-white rounded-lg p-6 border">
                        <div className="flex items-center gap-3 mb-4">
                          <Upload className="h-6 w-6 text-green-600" />
                          <span className="font-semibold">Multi-format Import</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {['PDF', 'Word', 'Google Docs', 'Notion'].map((format) => (
                            <div key={format} className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
                              <p className="font-medium text-green-700">{format}</p>
                              <p className="text-xs text-green-600">Supported</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="organize" className="mt-6">
                      <div className="bg-white rounded-lg p-6 border">
                        <div className="flex items-center gap-3 mb-4">
                          <Filter className="h-6 w-6 text-purple-600" />
                          <span className="font-semibold">Smart Organization</span>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Badge className="bg-purple-100 text-purple-700">Biology</Badge>
                            <Badge className="bg-blue-100 text-blue-700">Chapter 3</Badge>
                            <Badge className="bg-green-100 text-green-700">Photosynthesis</Badge>
                          </div>
                          <p className="text-gray-600">Auto-tagged: Subject, Chapter, Topic</p>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="search" className="mt-6">
                      <div className="bg-white rounded-lg p-6 border">
                        <div className="flex items-center gap-3 mb-4">
                          <Search className="h-6 w-6 text-orange-600" />
                          <span className="font-semibold">Intelligent Search</span>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                            <Search className="h-4 w-4 text-gray-400" />
                            <input placeholder="Search for 'cellular respiration'..." className="bg-transparent flex-1 outline-none" />
                          </div>
                          <p className="text-sm text-gray-600">Found in: 3 notes, 8 flashcards, 2 quizzes</p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {/* Study & Analytics Demo */}
              {group.group === "Study & Analytics" && (
                <div className="bg-gradient-to-br from-mint-50 to-teal-50 rounded-xl p-8 mb-12 border border-mint-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Your Study Analytics Dashboard</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <Card className="bg-white border-mint-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <BarChart3 className="h-5 w-5 text-mint-600" />
                          Performance
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-mint-600 mb-1">85%</div>
                        <p className="text-sm text-gray-600">Average Score</p>
                        <div className="mt-3 bg-mint-100 rounded-full h-2">
                          <div className="bg-mint-500 h-2 rounded-full w-4/5"></div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-white border-blue-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Clock className="h-5 w-5 text-blue-600" />
                          Study Time
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600 mb-1">24h</div>
                        <p className="text-sm text-gray-600">This Week</p>
                        <div className="mt-3 bg-blue-100 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full w-3/5"></div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-white border-orange-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Star className="h-5 w-5 text-orange-600" />
                          Streak
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-orange-600 mb-1">12</div>
                        <p className="text-sm text-gray-600">Days</p>
                        <div className="mt-3 bg-orange-100 rounded-full h-2">
                          <div className="bg-orange-500 h-2 rounded-full w-4/5"></div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Planning & Organization Demo */}
              {group.group === "Planning & Organization" && (
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-8 mb-12 border border-purple-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Smart Study Planning</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg p-6 border">
                      <div className="flex items-center gap-3 mb-4">
                        <Calendar className="h-6 w-6 text-purple-600" />
                        <span className="font-semibold">This Week's Plan</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                          <span className="text-sm font-medium">Biology Quiz Review</span>
                          <Badge variant="secondary">Today</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <span className="text-sm font-medium">Math Problem Set</span>
                          <Badge variant="secondary">Tomorrow</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <span className="text-sm font-medium">History Essay Draft</span>
                          <Badge variant="secondary">Wed</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 border">
                      <div className="flex items-center gap-3 mb-4">
                        <Target className="h-6 w-6 text-green-600" />
                        <span className="font-semibold">Goals Progress</span>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Weekly Study Goal</span>
                            <span className="text-sm text-gray-500">20h / 25h</span>
                          </div>
                          <div className="bg-green-100 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full w-4/5"></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Flashcards Mastered</span>
                            <span className="text-sm text-gray-500">156 / 200</span>
                          </div>
                          <div className="bg-blue-100 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full w-3/4"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Feature Cards Grid */}
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
                {group.items.map((feature, index) => (
                  <div
                    key={index}
                    className="relative group rounded-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-mint-300 to-mint-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300" />
                    <div className="relative h-full p-8 bg-white rounded-2xl border border-mint-100 shadow-sm group-hover:shadow-2xl transition-all duration-300">
                      <div className="flex items-start justify-between mb-6">
                        <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-r from-mint-400 to-mint-500 shadow-lg">
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
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <Button
            size="lg"
            className="bg-gradient-to-r from-mint-500 to-mint-600 hover:from-mint-600 hover:to-mint-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Start Using All Features
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="mt-4 text-gray-600">
            Join thousands of students already studying smarter with our complete toolkit
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;
