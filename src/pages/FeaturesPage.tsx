
import Layout from "@/components/layout/Layout";
import { ArrowRight, BookOpen, Brain, Scan, BarChart3, Zap, Calendar, Target, CheckSquare, Settings, Video, FileText, Upload, TrendingUp, Clock, Star, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";

const featureCategories = [
  {
    id: "ai-tools",
    title: "AI-Powered Study Tools",
    description: "Intelligent tools that enhance your learning with artificial intelligence",
    color: "from-mint-500 to-mint-600",
    features: [
      {
        name: "Smart Notes Enhancement",
        description: "Transform your notes with AI-generated summaries, key insights, and study guides for better comprehension.",
        icon: Brain,
        highlight: "AI-Powered",
      },
      {
        name: "AI Flashcard Generation", 
        description: "Automatically convert your notes into smart flashcards with spaced repetition algorithms.",
        icon: Zap,
        highlight: "Popular",
      },
      {
        name: "Adaptive Quiz Creation",
        description: "Generate personalized quizzes that adjust difficulty based on your performance and learning progress.",
        icon: Target,
        highlight: "Adaptive",
      },
      {
        name: "YouTube Video Summary",
        description: "Extract key concepts and generate study notes from educational YouTube videos automatically.",
        icon: Video,
        highlight: "Coming Soon",
      }
    ]
  },
  {
    id: "content-management", 
    title: "Content Management",
    description: "Organize, import, and digitize your study materials effortlessly",
    color: "from-blue-500 to-blue-600",
    features: [
      {
        name: "Document Scanning",
        description: "Scan handwritten notes, textbooks, and documents with OCR technology for instant digitization.",
        icon: Scan,
        highlight: "",
      },
      {
        name: "Multi-format Import",
        description: "Import content from PDFs, Word documents, images, and various file formats seamlessly.",
        icon: Upload,
        highlight: "",
      },
      {
        name: "Note Organization",
        description: "Organize notes by subjects, tags, and categories with powerful search and filtering capabilities.",
        icon: FileText,
        highlight: "",
      }
    ]
  },
  {
    id: "study-analytics",
    title: "Study & Analytics", 
    description: "Track your progress and optimize your learning with detailed insights",
    color: "from-purple-500 to-purple-600",
    features: [
      {
        name: "Progress Tracking",
        description: "Monitor your study time, completion rates, and mastery levels across all subjects.",
        icon: TrendingUp,
        highlight: "Analytics",
      },
      {
        name: "Study Session Analytics",
        description: "Detailed insights into your study patterns, focus time, and productivity trends.",
        icon: BarChart3,
        highlight: "",
      },
      {
        name: "Performance Insights", 
        description: "Get personalized recommendations and identify areas for improvement based on your data.",
        icon: Star,
        highlight: "",
      }
    ]
  },
  {
    id: "planning-organization",
    title: "Planning & Organization",
    description: "Structure your study routine with intelligent planning and goal management",
    color: "from-green-500 to-green-600", 
    features: [
      {
        name: "Smart Study Plans",
        description: "Create personalized study schedules that adapt to your goals, deadlines, and learning patterns.",
        icon: Calendar,
        highlight: "Smart",
      },
      {
        name: "Goal Management",
        description: "Set, track, and achieve your academic goals with milestone tracking and progress visualization.",
        icon: Target,
        highlight: "",
      },
      {
        name: "Task Organization",
        description: "Manage assignments, deadlines, and study tasks with intelligent reminders and prioritization.",
        icon: CheckSquare,
        highlight: "",
      }
    ]
  }
];

const CategoryDemo = ({ category }: { category: typeof featureCategories[0] }) => {
  const getDemoContent = () => {
    switch (category.id) {
      case "ai-tools":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-mint-200">
              <h4 className="font-semibold text-mint-800 mb-4">AI Note Enhancement Demo</h4>
              <Tabs defaultValue="before" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="before">Original Note</TabsTrigger>
                  <TabsTrigger value="after">AI Enhanced</TabsTrigger>
                </TabsList>
                <TabsContent value="before" className="mt-4">
                  <div className="bg-gray-50 p-4 rounded border text-sm">
                    <p className="text-gray-700">
                      Photosynthesis is the process plants use to make food. Light energy from sun converts CO2 and water into glucose and oxygen. Happens in chloroplasts. Important for life on earth.
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="after" className="mt-4">
                  <div className="bg-mint-50 p-4 rounded border text-sm space-y-3">
                    <div>
                      <h5 className="font-semibold text-mint-800">📋 Summary</h5>
                      <p className="text-mint-700">Photosynthesis converts light energy into chemical energy, producing glucose and oxygen from CO2 and water.</p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-mint-800">🔑 Key Points</h5>
                      <ul className="text-mint-700 list-disc list-inside space-y-1">
                        <li>Location: Chloroplasts in plant cells</li>
                        <li>Inputs: CO2, H2O, sunlight energy</li>
                        <li>Outputs: Glucose (C6H12O6), Oxygen (O2)</li>
                        <li>Significance: Foundation of most food chains</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-mint-800">💡 Study Tips</h5>
                      <p className="text-mint-700">Remember the equation: 6CO2 + 6H2O + light energy → C6H12O6 + 6O2</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        );
      case "content-management":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-4">Document Scanning & Import Process</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded">
                  <Scan className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h5 className="font-medium text-blue-800">1. Scan Document</h5>
                  <p className="text-sm text-blue-600">Upload or scan your handwritten notes</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded">
                  <Brain className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h5 className="font-medium text-blue-800">2. OCR Processing</h5>
                  <p className="text-sm text-blue-600">AI extracts and digitizes text content</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded">
                  <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h5 className="font-medium text-blue-800">3. Organize & Study</h5>
                  <p className="text-sm text-blue-600">Searchable, organized digital notes</p>
                </div>
              </div>
            </div>
          </div>
        );
      case "study-analytics":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-4">Learning Analytics Dashboard</h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded">
                    <h5 className="font-medium text-purple-800 mb-2">📊 Weekly Progress</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Mathematics</span>
                        <span className="text-purple-600">85%</span>
                      </div>
                      <div className="w-full bg-purple-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full w-[85%]"></div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded">
                    <h5 className="font-medium text-purple-800 mb-2">⏱️ Study Time</h5>
                    <p className="text-2xl font-bold text-purple-600">12.5 hours</p>
                    <p className="text-sm text-purple-500">This week</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded">
                    <h5 className="font-medium text-purple-800 mb-2">🎯 Accuracy</h5>
                    <p className="text-2xl font-bold text-purple-600">94%</p>
                    <p className="text-sm text-purple-500">Flashcard reviews</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded">
                    <h5 className="font-medium text-purple-800 mb-2">📈 Streak</h5>
                    <p className="text-2xl font-bold text-purple-600">7 days</p>
                    <p className="text-sm text-purple-500">Current streak</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "planning-organization":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-green-200">
              <h4 className="font-semibold text-green-800 mb-4">Smart Study Plan Creation</h4>
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded">
                  <h5 className="font-medium text-green-800 mb-3">📅 Your Study Schedule</h5>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-white rounded border border-green-200">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">Mathematics - Calculus Review</span>
                      </div>
                      <span className="text-xs text-green-600">2:00 PM - 3:30 PM</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded border border-green-200">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium">Physics - Flashcard Review</span>
                      </div>
                      <span className="text-xs text-green-600">4:00 PM - 4:45 PM</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded border border-green-200">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-sm font-medium">Chemistry - Quiz Practice</span>
                      </div>
                      <span className="text-xs text-green-600">7:00 PM - 8:00 PM</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded">
                    <p className="text-lg font-bold text-green-600">15</p>
                    <p className="text-xs text-green-500">Goals this month</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded">
                    <p className="text-lg font-bold text-green-600">12</p>
                    <p className="text-xs text-green-500">Completed tasks</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded">
                    <p className="text-lg font-bold text-green-600">3</p>
                    <p className="text-xs text-green-500">Upcoming deadlines</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mt-12 mb-16">
      <div className="text-center mb-8">
        <Badge className="mb-4 bg-gradient-to-r from-mint-100 to-mint-200 text-mint-700 border-mint-300">
          <Play className="h-3 w-3 mr-1" />
          Interactive Demo
        </Badge>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          See {category.title} in Action
        </h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {category.description}
        </p>
      </div>
      {getDemoContent()}
    </div>
  );
};

const FeaturesPage = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        {/* Hero Section */}
        <div className="px-4 sm:px-6 lg:px-8 pt-20 pb-16 max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-mint-100 rounded-full text-mint-700 text-sm mb-8">
              ✨ Complete Study Platform
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Powerful Features for
              <span className="block text-mint-500 mt-2">
                Smarter Studying
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
              Discover all the tools and features that make StudyAI the ultimate platform for students. 
              From AI-powered content generation to detailed analytics, everything you need is here.
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
        </div>

        {/* Features Categories */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          {featureCategories.map((category, categoryIndex) => (
            <div key={category.id} className="mb-20">
              {/* Category Header */}
              <div className="text-center mb-12">
                <Badge className={`mb-4 bg-gradient-to-r ${category.color} text-white border-none`}>
                  {category.title}
                </Badge>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {category.title}
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  {category.description}
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-8">
                {category.features.map((feature) => (
                  <Card key={feature.name} className="group bg-white/60 backdrop-blur-sm border-mint-100 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-2">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-r ${category.color} shadow-lg`}>
                          <feature.icon className="h-7 w-7 text-white" />
                        </div>
                        {feature.highlight && (
                          <Badge className="bg-mint-100 text-mint-700 border-mint-200">
                            {feature.highlight}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl font-semibold text-gray-900">
                        {feature.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Category Demo */}
              <CategoryDemo category={category} />

              {/* Divider */}
              {categoryIndex < featureCategories.length - 1 && (
                <div className="border-t border-gray-200 mt-16"></div>
              )}
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-mint-500 to-mint-600 py-16">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Study Experience?
            </h2>
            <p className="text-xl text-mint-100 mb-8">
              Join thousands of students who are already studying smarter with our comprehensive platform.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                size="lg"
                className="bg-white text-mint-700 hover:bg-mint-50 hover:scale-105 transform transition-all duration-200 shadow-xl font-semibold"
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
                className="border-2 border-white/40 text-white hover:bg-white/10 backdrop-blur-sm bg-white/5 hover:border-white/60 transition-all duration-200"
                asChild
              >
                <Link to="/dashboard">
                  View Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FeaturesPage;
