
import React, { useState } from 'react';
import { BookOpen, Brain, Scan, BarChart3, Zap, Calendar, ArrowRight, Play, FileText, Search, Filter, Tag, TrendingUp, Target, CheckCircle, Clock, Youtube, Sparkles, Upload, Image, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

const features = [
  {
    category: "AI-Powered Study Tools",
    description: "Transform your learning with advanced AI technology",
    features: [
      {
        name: "AI Flashcard Generation",
        description: "Transform your notes into smart flashcards automatically with AI-powered content processing and spaced repetition.",
        icon: Brain,
        highlight: "Popular"
      },
      {
        name: "Smart Quiz Creation",
        description: "Generate adaptive quizzes from your content that adjust difficulty based on your performance and learning progress.",
        icon: Zap,
        highlight: "AI-Powered"
      },
      {
        name: "Smart Note Enhancement",
        description: "Upload, scan, or write notes. Get AI-generated summaries, explanations, and study guides instantly.",
        icon: BookOpen,
        highlight: ""
      },
      {
        name: "YouTube Video Summary",
        description: "Extract key insights and create study materials from educational videos automatically.",
        icon: Youtube,
        highlight: "New"
      }
    ]
  },
  {
    category: "Content Management",
    description: "Organize and digitize all your study materials effortlessly",
    features: [
      {
        name: "Document Scanning",
        description: "Scan handwritten notes, textbooks, and documents with OCR technology for instant digitization and processing.",
        icon: Scan,
        highlight: ""
      },
      {
        name: "Multi-Format Import",
        description: "Import from Google Docs, PDFs, Word documents, and more. Connect with popular note-taking apps.",
        icon: Upload,
        highlight: ""
      },
      {
        name: "Smart Organization",
        description: "Automatically categorize, tag, and filter your notes with intelligent subject detection and search.",
        icon: FolderOpen,
        highlight: ""
      }
    ]
  },
  {
    category: "Study & Analytics",
    description: "Track your progress and optimize your learning performance",
    features: [
      {
        name: "Learning Analytics",
        description: "Track your study time, performance trends, mastery levels, and get personalized insights to improve faster.",
        icon: BarChart3,
        highlight: "Analytics"
      },
      {
        name: "Progress Tracking",
        description: "Monitor your learning journey with detailed progress reports and achievement tracking.",
        icon: TrendingUp,
        highlight: ""
      },
      {
        name: "Performance Insights",
        description: "Get AI-powered recommendations to optimize your study habits and improve retention.",
        icon: Sparkles,
        highlight: ""
      }
    ]
  },
  {
    category: "Planning & Organization",
    description: "Create structured study plans and stay on track with your goals",
    features: [
      {
        name: "Personalized Study Plans",
        description: "Create intelligent study schedules that adapt to your goals, deadlines, and learning patterns for optimal results.",
        icon: Calendar,
        highlight: "New"
      },
      {
        name: "Goal Tracking",
        description: "Set study goals, track milestones, and celebrate achievements to stay motivated.",
        icon: Target,
        highlight: ""
      },
      {
        name: "Smart Reminders",
        description: "Never miss a study session with intelligent notifications and deadline management.",
        icon: Clock,
        highlight: ""
      }
    ]
  }
];

const FeaturesPage = () => {
  const [activeDemo, setActiveDemo] = useState<string>("ai-tools");

  const AIToolsDemo = () => (
    <div className="bg-white rounded-2xl border border-mint-100 p-8 shadow-lg">
      <Tabs defaultValue="enhancement" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="enhancement">Note Enhancement</TabsTrigger>
          <TabsTrigger value="flashcards">Flashcard Generation</TabsTrigger>
          <TabsTrigger value="quizzes">Adaptive Quizzes</TabsTrigger>
          <TabsTrigger value="youtube">YouTube Summary</TabsTrigger>
        </TabsList>
        
        <TabsContent value="enhancement" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Original Note</h4>
              <div className="bg-gray-50 p-4 rounded-lg border text-sm">
                <p className="text-gray-700">Photosynthesis is the process by which plants convert light energy into chemical energy. It occurs in chloroplasts and involves two main stages: light reactions and Calvin cycle.</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">AI Enhanced</h4>
              <div className="bg-mint-50 p-4 rounded-lg border border-mint-200 text-sm">
                <div className="space-y-3">
                  <div>
                    <Badge className="bg-mint-100 text-mint-700 mb-2">Summary</Badge>
                    <p className="text-gray-700">Plants convert sunlight into energy through a two-stage process in chloroplasts.</p>
                  </div>
                  <div>
                    <Badge className="bg-blue-100 text-blue-700 mb-2">Key Points</Badge>
                    <ul className="text-gray-700 list-disc list-inside space-y-1">
                      <li>Occurs in chloroplasts</li>
                      <li>Light reactions capture energy</li>
                      <li>Calvin cycle produces glucose</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="flashcards" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">Generated Flashcards</h4>
              <Badge className="bg-mint-100 text-mint-700">3 cards created</Badge>
            </div>
            <div className="grid gap-4">
              <div className="bg-gradient-to-r from-mint-50 to-white p-4 rounded-lg border border-mint-200">
                <div className="text-sm text-gray-600 mb-2">Front</div>
                <div className="font-medium text-gray-900 mb-3">What are the two main stages of photosynthesis?</div>
                <div className="text-sm text-gray-600 mb-2">Back</div>
                <div className="text-gray-700">Light reactions and the Calvin cycle</div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="quizzes" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">Adaptive Quiz Generation</h4>
              <Badge className="bg-purple-100 text-purple-700">Difficulty: Medium</Badge>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-white p-4 rounded-lg border border-purple-200">
              <div className="font-medium text-gray-900 mb-3">Where does photosynthesis primarily occur in plant cells?</div>
              <div className="space-y-2">
                <div className="p-2 bg-white rounded border text-sm">A) Mitochondria</div>
                <div className="p-2 bg-mint-100 rounded border border-mint-300 text-sm">B) Chloroplasts ✓</div>
                <div className="p-2 bg-white rounded border text-sm">C) Nucleus</div>
                <div className="p-2 bg-white rounded border text-sm">D) Ribosomes</div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="youtube" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Youtube className="h-5 w-5 text-red-500" />
                <span className="font-medium text-gray-900">Photosynthesis Explained - Khan Academy</span>
              </div>
              <Badge className="bg-green-100 text-green-700">Processed</Badge>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-white p-4 rounded-lg border border-green-200">
              <h5 className="font-medium text-gray-900 mb-2">Key Takeaways</h5>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Light energy is captured by chlorophyll</li>
                <li>• Water molecules are split to release oxygen</li>
                <li>• Carbon dioxide is converted to glucose</li>
                <li>• Process essential for all life on Earth</li>
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  const ContentManagementDemo = () => (
    <div className="bg-white rounded-2xl border border-mint-100 p-8 shadow-lg">
      <Tabs defaultValue="scanning" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scanning">Document Scanning</TabsTrigger>
          <TabsTrigger value="import">Multi-Format Import</TabsTrigger>
          <TabsTrigger value="organization">Smart Organization</TabsTrigger>
        </TabsList>
        
        <TabsContent value="scanning" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Scan Document</h4>
              <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300 text-center">
                <Image className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">Upload or capture image</p>
                <Button size="sm" className="bg-mint-600 hover:bg-mint-700">
                  <Scan className="h-4 w-4 mr-2" />
                  Start Scanning
                </Button>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Extracted Text</h4>
              <div className="bg-mint-50 p-4 rounded-lg border border-mint-200 text-sm h-full">
                <div className="space-y-2">
                  <Badge className="bg-green-100 text-green-700">98% Accuracy</Badge>
                  <p className="text-gray-700">The mitochondria is the powerhouse of the cell. It produces ATP through cellular respiration...</p>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline">Edit</Button>
                    <Button size="sm" className="bg-mint-600 hover:bg-mint-700">Save Note</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="import" className="mt-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Import from Multiple Sources</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-white rounded-lg border border-blue-200">
                <FileText className="h-8 w-8 text-blue-600 mb-2" />
                <h5 className="font-medium text-gray-900">Google Docs</h5>
                <p className="text-sm text-gray-600 mb-3">Import directly from Drive</p>
                <Badge className="bg-green-100 text-green-700 text-xs">Connected</Badge>
              </div>
              <div className="p-4 bg-gradient-to-r from-red-50 to-white rounded-lg border border-red-200">
                <FileText className="h-8 w-8 text-red-600 mb-2" />
                <h5 className="font-medium text-gray-900">PDF Files</h5>
                <p className="text-sm text-gray-600 mb-3">Extract text from PDFs</p>
                <Badge className="bg-blue-100 text-blue-700 text-xs">15 imported</Badge>
              </div>
              <div className="p-4 bg-gradient-to-r from-purple-50 to-white rounded-lg border border-purple-200">
                <FileText className="h-8 w-8 text-purple-600 mb-2" />
                <h5 className="font-medium text-gray-900">Word Docs</h5>
                <p className="text-sm text-gray-600 mb-3">DOCX support</p>
                <Badge className="bg-yellow-100 text-yellow-700 text-xs">Processing</Badge>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="organization" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-500" 
                  placeholder="Search notes..."
                  defaultValue="biology"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
            <div className="grid gap-3">
              <div className="p-3 bg-mint-50 rounded-lg border border-mint-200">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900">Cell Biology Notes</h5>
                  <div className="flex gap-1">
                    <Badge className="bg-mint-100 text-mint-700 text-xs">Biology</Badge>
                    <Badge className="bg-blue-100 text-blue-700 text-xs">Chapter 3</Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Mitochondria, cellular respiration, ATP production...</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900">Photosynthesis Overview</h5>
                  <div className="flex gap-1">
                    <Badge className="bg-green-100 text-green-700 text-xs">Biology</Badge>
                    <Badge className="bg-purple-100 text-purple-700 text-xs">Chapter 4</Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Light reactions, Calvin cycle, chloroplasts...</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  const StudyAnalyticsDemo = () => (
    <div className="bg-white rounded-2xl border border-mint-100 p-8 shadow-lg">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-900">Learning Analytics Dashboard</h4>
          <Badge className="bg-mint-100 text-mint-700">Last 30 days</Badge>
        </div>
        
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-gradient-to-r from-mint-50 to-white rounded-lg border border-mint-200">
            <div className="text-2xl font-bold text-mint-600">156</div>
            <div className="text-sm text-gray-600">Study Hours</div>
          </div>
          <div className="p-4 bg-gradient-to-r from-blue-50 to-white rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">89%</div>
            <div className="text-sm text-gray-600">Quiz Average</div>
          </div>
          <div className="p-4 bg-gradient-to-r from-green-50 to-white rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">23</div>
            <div className="text-sm text-gray-600">Day Streak</div>
          </div>
          <div className="p-4 bg-gradient-to-r from-purple-50 to-white rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">342</div>
            <div className="text-sm text-gray-600">Cards Mastered</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-gray-900 mb-3">Subject Progress</h5>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Biology</span>
                  <span>85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Chemistry</span>
                  <span>72%</span>
                </div>
                <Progress value={72} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Physics</span>
                  <span>91%</span>
                </div>
                <Progress value={91} className="h-2" />
              </div>
            </div>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-900 mb-3">Study Pattern</h5>
            <div className="bg-gradient-to-r from-mint-50 to-white p-4 rounded-lg border border-mint-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-mint-600" />
                <span className="font-medium text-gray-900">Peak Hours: 7-9 PM</span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Most productive on weekdays</p>
                <p>• Average session: 45 minutes</p>
                <p>• Best retention: Biology flashcards</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const PlanningDemo = () => (
    <div className="bg-white rounded-2xl border border-mint-100 p-8 shadow-lg">
      <Tabs defaultValue="planner" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="planner">Study Planner</TabsTrigger>
          <TabsTrigger value="goals">Goal Tracking</TabsTrigger>
          <TabsTrigger value="reminders">Smart Reminders</TabsTrigger>
        </TabsList>
        
        <TabsContent value="planner" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">Weekly Study Plan</h4>
              <Badge className="bg-mint-100 text-mint-700">Auto-generated</Badge>
            </div>
            <div className="grid gap-3">
              <div className="flex items-center gap-4 p-3 bg-mint-50 rounded-lg border border-mint-200">
                <div className="w-2 h-2 bg-mint-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Biology Chapter 5 Review</div>
                  <div className="text-sm text-gray-600">Monday, 7:00 PM - 8:30 PM</div>
                </div>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Chemistry Problem Set</div>
                  <div className="text-sm text-gray-600">Tuesday, 6:30 PM - 8:00 PM</div>
                </div>
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex items-center gap-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Physics Quiz Practice</div>
                  <div className="text-sm text-gray-600">Wednesday, 7:30 PM - 9:00 PM</div>
                </div>
                <Play className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="goals" className="mt-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Active Goals</h4>
            <div className="grid gap-4">
              <div className="p-4 bg-gradient-to-r from-green-50 to-white rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-gray-900">Complete Biology Unit 3</span>
                  </div>
                  <Badge className="bg-green-100 text-green-700">75% Complete</Badge>
                </div>
                <Progress value={75} className="h-2 mb-2" />
                <div className="text-sm text-gray-600">Due: March 15, 2024</div>
              </div>
              <div className="p-4 bg-gradient-to-r from-blue-50 to-white rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-900">Master 50 Chemistry Flashcards</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">32/50</Badge>
                </div>
                <Progress value={64} className="h-2 mb-2" />
                <div className="text-sm text-gray-600">Due: March 20, 2024</div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="reminders" className="mt-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Smart Notifications</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Study Session Reminder</div>
                  <div className="text-sm text-gray-600">Biology review starts in 30 minutes</div>
                </div>
                <Badge className="bg-yellow-100 text-yellow-700">Upcoming</Badge>
              </div>
              <div className="flex items-center gap-4 p-3 bg-red-50 rounded-lg border border-red-200">
                <Target className="h-5 w-5 text-red-600" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Goal Deadline</div>
                  <div className="text-sm text-gray-600">Chemistry unit due in 2 days</div>
                </div>
                <Badge className="bg-red-100 text-red-700">Urgent</Badge>
              </div>
              <div className="flex items-center gap-4 p-3 bg-mint-50 rounded-lg border border-mint-200">
                <TrendingUp className="h-5 w-5 text-mint-600" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Performance Insight</div>
                  <div className="text-sm text-gray-600">Your retention is 20% higher in evening sessions</div>
                </div>
                <Badge className="bg-mint-100 text-mint-700">Tip</Badge>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-mint-50/10 via-white to-mint-50/20">
      {/* Hero Section */}
      <div className="px-4 sm:px-6 lg:px-8 pt-20 pb-16 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center px-4 py-2 bg-mint-100 rounded-full text-mint-700 text-sm mb-8">
          🚀 Complete Feature Overview
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Everything You Need to
          <span className="block text-mint-500 mt-2">Excel in Your Studies</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
          Discover how our comprehensive suite of AI-powered tools, content management features, analytics, and planning capabilities work together to transform your learning experience.
        </p>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 py-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-mint-600">50K+</div>
            <div className="text-sm text-gray-600">Flashcard Sets</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-mint-600">25K+</div>
            <div className="text-sm text-gray-600">Study Plans</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-mint-600">1M+</div>
            <div className="text-sm text-gray-600">Study Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-mint-600">95%</div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </div>
        </div>
      </div>

      {/* Features Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-24">
        {features.map((category, categoryIndex) => (
          <div key={categoryIndex}>
            {/* Category Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{category.category}</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">{category.description}</p>
            </div>

            {/* Feature Cards */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
              {category.features.map((feature, index) => (
                <div
                  key={index}
                  className="relative group rounded-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-mint-300 to-neutral-300 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300" />
                  <div className="relative h-full p-8 bg-white rounded-2xl border border-mint-100 shadow-sm group-hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-start justify-between mb-6">
                      <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-r from-mint-500 to-mint-600 shadow-lg">
                        <feature.icon className="h-7 w-7 text-white" />
                      </div>
                      {feature.highlight && (
                        <span className="px-3 py-1 text-xs bg-mint-100 text-mint-700 rounded-full font-medium border border-mint-200">
                          {feature.highlight}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.name}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive Demo */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Interactive Demo</h3>
                <p className="text-gray-600">See {category.category.toLowerCase()} in action</p>
              </div>

              {categoryIndex === 0 && <AIToolsDemo />}
              {categoryIndex === 1 && <ContentManagementDemo />}
              {categoryIndex === 2 && <StudyAnalyticsDemo />}
              {categoryIndex === 3 && <PlanningDemo />}
            </div>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-mint-600 to-mint-700 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-mint-100 mb-8">
            Join thousands of students who are already studying smarter with our comprehensive platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-mint-700 hover:bg-mint-50 shadow-lg hover:shadow-xl transition-all duration-200"
              asChild
            >
              <Link to="/signup">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-mint-700 transition-all duration-200"
              asChild
            >
              <Link to="/dashboard">
                <Play className="mr-2 h-4 w-4" />
                Try Live Demo
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;
