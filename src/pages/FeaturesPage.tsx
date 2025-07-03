
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, BookOpen, Brain, Scan, BarChart3, Zap, Calendar, Target, MessageSquare, Clock, TrendingUp, Play, Eye, Layers, CheckCircle, Award, Bot, FileText, LayoutDashboard, HelpCircle } from 'lucide-react';
import { GoalSettingDemo } from '@/components/features/GoalSettingDemo';
import { AIChatDemo } from '@/components/features/AIChatDemo';
import { FeatureComingSoonBanner } from '@/components/features/FeatureComingSoonBanner';

// Demo data for interactive components
const demoData = {
  smartNotes: {
    before: {
      title: "My Biology Notes - Photosynthesis",
      content: "photosynthesis is when plants make food from sunlight. they use co2 and water. makes glucose and oxygen. happens in chloroplasts. light reactions and calvin cycle are the two parts. need chlorophyll."
    },
    after: {
      title: "Enhanced Biology Notes - Photosynthesis",
      content: "**Photosynthesis Process Overview**\n\n**Definition:** The biological process where plants convert light energy into chemical energy (glucose)\n\n**Key Inputs:**\n• Sunlight (light energy)\n• Carbon dioxide (CO₂)\n• Water (H₂O)\n\n**Products:**\n• Glucose (C₆H₁₂O₆) - energy storage\n• Oxygen (O₂) - released as byproduct\n\n**Location:** Chloroplasts (contains chlorophyll)\n\n**Two Main Stages:**\n1. **Light Reactions** - Convert light to chemical energy\n2. **Calvin Cycle** - Use chemical energy to make glucose",
      summary: "Photosynthesis converts sunlight, CO₂, and water into glucose and oxygen through light reactions and the Calvin cycle in chloroplasts.",
      keyPoints: ["Energy conversion: Light → Chemical", "Occurs in chloroplasts", "Two-stage process", "Essential for plant survival"]
    }
  },
  dashboard: {
    stats: {
      studyStreak: 15,
      completedSets: 8,
      accuracyRate: 87,
      weeklyGoal: 12
    },
    recentActivity: [
      "Completed Biology flashcards",
      "Generated quiz from Chemistry notes", 
      "Updated study plan schedule"
    ]
  },
  studyPlan: {
    title: "HSC Biology Preparation",
    timeline: "6 weeks remaining",
    progress: 68,
    todaysTasks: [
      "Review Photosynthesis flashcards (30 min)",
      "Complete Cellular Respiration practice quiz",
      "Read Chapter 5: Genetics (45 min)"
    ]
  },
  flashcard: {
    front: "What is the overall equation for photosynthesis?",
    back: "6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂ + ATP",
    difficulty: "Medium",
    mastery: "Learning"
  },
  quiz: {
    question: "Which organelle is responsible for photosynthesis in plant cells?",
    options: ["Mitochondria", "Chloroplast", "Nucleus", "Ribosome"],
    correct: 1,
    explanation: "Chloroplasts contain chlorophyll and are the site where photosynthesis occurs in plant cells."
  }
};

const expandedFeatures = [
  {
    name: "AI Flashcard Generation",
    description: "Transform your notes into smart flashcards automatically with AI-powered content processing and spaced repetition.",
    longDescription: "Our advanced AI analyzes your study materials and automatically generates effective flashcards with optimal question-answer pairs. The system uses natural language processing to identify key concepts, important terms, and relationships within your content. Features include automatic difficulty adjustment, spaced repetition scheduling, and intelligent review timing to maximize retention and minimize study time.",
    icon: Brain,
    highlight: "Popular",
    color: "from-mint-500 to-mint-600",
    demoComponent: "flashcard"
  },
  {
    name: "Smart Quiz Creation",
    description: "Generate adaptive quizzes from your content that adjust difficulty based on your performance and learning progress.",
    longDescription: "Create comprehensive quizzes that adapt to your learning style and progress. Our AI generates multiple question types including multiple choice, true/false, fill-in-the-blank, and essay questions. The system tracks your performance patterns and adjusts question difficulty in real-time, focusing on areas where you need the most improvement while reinforcing your strengths.",
    icon: Zap,
    highlight: "AI-Powered",
    color: "from-mint-400 to-mint-500",
    demoComponent: "quiz"
  },
  {
    name: "Personalized Study Plans",
    description: "Create intelligent study schedules that adapt to your goals, deadlines, and learning patterns for optimal results.",
    longDescription: "Build customized study plans that work around your schedule and learning preferences. The system considers your goals, available time, subject priorities, and learning velocity to create realistic and effective study schedules. Plans automatically adjust based on your progress, exam dates, and performance metrics to ensure you stay on track.",
    icon: Calendar,
    highlight: "New",
    color: "from-mint-600 to-mint-700",
    demoComponent: "studyPlan"
  },
  {
    name: "Smart Note Enhancement",
    description: "Upload, scan, or write notes. Get AI-generated summaries, explanations, and study guides instantly.",
    longDescription: "Transform any study material into comprehensive learning resources. Upload documents, scan handwritten notes, or type directly into our editor. Our AI analyzes your content and generates detailed summaries, clarifying explanations, key concept lists, and comprehensive study guides. The system also identifies knowledge gaps and suggests additional resources.",
    icon: BookOpen,
    highlight: "",
    color: "from-mint-300 to-mint-400",
    demoComponent: "smartNotes"
  },
  {
    name: "Document Scanning & OCR",
    description: "Scan handwritten notes, textbooks, and documents with OCR technology for instant digitization and processing.",
    longDescription: "Convert any physical document into searchable, editable digital content. Our advanced OCR technology accurately recognizes text from handwritten notes, printed materials, and complex layouts. The system preserves formatting, handles multiple languages, and can process mathematical equations and diagrams for comprehensive digitization.",
    icon: Scan,
    highlight: "",
    color: "from-mint-500 to-mint-600",
    demoComponent: null
  },
  {
    name: "Learning Analytics Dashboard",
    description: "Track your study time, performance trends, mastery levels, and get personalized insights to improve faster.",
    longDescription: "Gain deep insights into your learning patterns with comprehensive analytics. Monitor study time across subjects, track performance trends, identify strengths and weaknesses, and receive personalized recommendations. The dashboard provides detailed reports on retention rates, learning velocity, and optimal study times to help you maximize efficiency.",
    icon: BarChart3,
    highlight: "Analytics",
    color: "from-mint-400 to-mint-600",
    demoComponent: "dashboard"
  },
  {
    name: "Goal Setting & Tracking",
    description: "Set specific learning objectives, track your progress, and achieve your academic goals with structured planning.",
    longDescription: "Define clear learning objectives and track your journey toward achieving them. Set SMART goals for different subjects, monitor daily and weekly progress, and receive motivation through achievement badges and milestone celebrations. The system provides goal-specific recommendations and adjusts study plans to ensure you meet your targets.",
    icon: Target,
    highlight: "",
    color: "from-purple-400 to-purple-600",
    demoComponent: "goalSetting"
  },
  {
    name: "AI Study Assistant Chat",
    description: "Get instant answers to questions, explanations of complex topics, and personalized study guidance through AI chat.",
    longDescription: "Access a knowledgeable AI tutor available 24/7 to help with any study-related questions. The assistant can explain complex concepts, provide examples, suggest study strategies, and offer personalized guidance based on your learning history. It integrates with your study materials to provide contextual help and recommendations.",
    icon: MessageSquare,
    highlight: "24/7",
    color: "from-indigo-400 to-indigo-600",
    demoComponent: "aiChat"
  },
  {
    name: "Spaced Repetition System",
    description: "Optimize your memory retention with scientifically-backed spaced repetition algorithms for long-term learning.",
    longDescription: "Maximize retention with our advanced spaced repetition system based on cognitive science research. The algorithm tracks your memory performance for each piece of information and schedules reviews at optimal intervals. This approach significantly improves long-term retention while minimizing the time spent on already-mastered material.",
    icon: Clock,
    highlight: "Coming Soon",
    color: "from-orange-400 to-orange-600",
    demoComponent: "comingSoon"
  },
  {
    name: "Progress Forecasting",
    description: "Predict your future performance and readiness for exams using advanced analytics and machine learning.",
    longDescription: "Get data-driven predictions about your readiness for upcoming exams and assignments. Our machine learning models analyze your study patterns, performance trends, and learning velocity to forecast your likely performance. Receive early warnings about potential difficulties and recommendations for improvement strategies.",
    icon: TrendingUp,
    highlight: "Coming Soon",
    color: "from-red-400 to-red-600",
    demoComponent: "comingSoon"
  },
  {
    name: "Interactive Study Sessions",
    description: "Engage in dynamic study sessions with interactive elements, gamification, and real-time feedback.",
    longDescription: "Make studying engaging and effective with interactive elements that keep you motivated. Features include gamified study sessions, real-time feedback, progress streaks, achievement systems, and adaptive difficulty. The system creates a engaging learning environment that makes studying feel less like work and more like play.",
    icon: Play,
    highlight: "Coming Soon",
    color: "from-green-400 to-green-600",
    demoComponent: "comingSoon"
  },
  {
    name: "Visual Learning Tools",
    description: "Create mind maps, diagrams, and visual study aids to enhance comprehension and memory retention.",
    longDescription: "Leverage visual learning techniques with our comprehensive set of visual tools. Create mind maps, concept diagrams, flowcharts, and other visual aids that help you understand complex relationships and remember information more effectively. The tools integrate with your notes and flashcards for a cohesive learning experience.",
    icon: Eye,
    highlight: "Coming Soon",
    color: "from-teal-400 to-teal-600",
    demoComponent: "comingSoon"
  },
  {
    name: "Multi-Subject Organization",
    description: "Organize and manage study materials across multiple subjects with intelligent categorization and cross-references.",
    longDescription: "Keep all your subjects organized and interconnected with intelligent categorization systems. The platform automatically tags content, identifies cross-subject relationships, and helps you discover connections between different areas of study. Features include subject-specific dashboards, integrated calendars, and unified search across all materials.",
    icon: Layers,
    highlight: "Coming Soon",
    color: "from-cyan-400 to-cyan-600",
    demoComponent: "comingSoon"
  },
  {
    name: "Mastery Verification",
    description: "Verify your understanding with comprehensive assessments and receive certification for mastered topics.",
    longDescription: "Prove your mastery with rigorous assessment tools that verify deep understanding rather than memorization. The system creates comprehensive tests that evaluate knowledge from multiple angles, provides detailed feedback on areas of strength and weakness, and awards certificates for truly mastered topics that you can share with teachers or employers.",
    icon: CheckCircle,
    highlight: "Coming Soon",
    color: "from-emerald-400 to-emerald-600",
    demoComponent: "comingSoon"
  },
  {
    name: "Achievement System",
    description: "Stay motivated with comprehensive achievement badges, progress streaks, and milestone celebrations.",
    longDescription: "Maintain motivation through our comprehensive gamification system. Earn badges for various achievements like study streaks, mastery milestones, collaboration contributions, and improvement metrics. The system celebrates your progress with personalized celebrations and provides clear pathways to unlock new achievements.",
    icon: Award,
    highlight: "Motivational",
    color: "from-yellow-400 to-yellow-600",
    demoComponent: null
  },
  {
    name: "AI Content Generation",
    description: "Generate practice questions, summaries, and study materials from any content using advanced AI technology.",
    longDescription: "Leverage cutting-edge AI to automatically generate high-quality study materials from any source. Upload textbooks, lecture notes, or web articles and receive comprehensive study packages including practice questions, detailed summaries, key concept lists, and related topics. The AI adapts content to your learning level and style preferences.",
    icon: Bot,
    highlight: "Advanced AI",
    color: "from-violet-400 to-violet-600",
    demoComponent: null
  }
];

const FeaturesPage = () => {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  // Filter out collaboration features - remove the collaborative study groups feature
  const filteredFeatures = expandedFeatures.filter(feature => 
    feature.name !== "Collaborative Study Groups"
  );

  const renderInteractiveDemo = (demoType: string) => {
    switch (demoType) {
      case 'smartNotes':
        return (
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            {/* Before - Raw Notes */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-700">
                  <FileText className="h-5 w-5" />
                  Before AI Enhancement
                  <Badge variant="outline" className="text-xs">Raw Notes</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">{demoData.smartNotes.before.title}</h3>
                  <div className="bg-gray-50 p-4 rounded-lg min-h-[200px]">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {demoData.smartNotes.before.content}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500 italic">
                    Unstructured, missing key details, hard to study from
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* After - Enhanced Notes */}
            <Card className="border-mint-200 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-mint-700">
                  <Brain className="h-5 w-5" />
                  After AI Enhancement
                  <Badge className="bg-mint-100 text-mint-700 text-xs">AI Enhanced</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">{demoData.smartNotes.after.title}</h3>
                  <div className="bg-mint-50 p-4 rounded-lg min-h-[200px]">
                    <div className="prose prose-sm text-gray-700">
                      {demoData.smartNotes.after.content.split('\n').map((line, index) => (
                        <div key={index} className="mb-1">
                          {line.startsWith('**') ? (
                            <div className="font-semibold text-mint-800">{line.replace(/\*\*/g, '')}</div>
                          ) : line.startsWith('•') ? (
                            <div className="ml-4 text-sm">{line}</div>
                          ) : line.startsWith('1.') || line.startsWith('2.') ? (
                            <div className="ml-2 text-sm font-medium text-mint-700">{line}</div>
                          ) : (
                            <div className="text-sm">{line}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-mint-100 p-3 rounded-lg">
                    <h4 className="font-medium text-mint-800 mb-2 text-sm">AI Summary:</h4>
                    <p className="text-mint-700 text-sm">{demoData.smartNotes.after.summary}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          );

      case 'goalSetting':
        return <GoalSettingDemo />;

      case 'aiChat':
        return <AIChatDemo />;

      case 'comingSoon':
        return null; // Will be handled separately

      case 'dashboard':
        return (
          <Card className="border-mint-200 mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-mint-600" />
                Study Dashboard
                <Badge className="bg-mint-100 text-mint-700 text-xs">Real-time</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-mint-50 to-mint-100 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold text-mint-700">{demoData.dashboard.stats.studyStreak}</div>
                  <div className="text-sm text-mint-600">Day Streak</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold text-blue-700">{demoData.dashboard.stats.completedSets}</div>
                  <div className="text-sm text-blue-600">Sets Completed</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold text-green-700">{demoData.dashboard.stats.accuracyRate}%</div>
                  <div className="text-sm text-green-600">Accuracy</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold text-purple-700">{demoData.dashboard.stats.weeklyGoal}/12</div>
                  <div className="text-sm text-purple-600">Weekly Goal</div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Recent Activity</h4>
                <div className="space-y-2">
                  {demoData.dashboard.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-mint-500 rounded-full"></div>
                      {activity}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'studyPlan':
        return (
          <Card className="border-mint-200 mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-mint-600" />
                Personalized Study Plan
                <Badge className="bg-mint-100 text-mint-700 text-xs">AI Generated</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">{demoData.studyPlan.title}</h3>
                    <p className="text-sm text-gray-600">{demoData.studyPlan.timeline}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-mint-600">{demoData.studyPlan.progress}%</div>
                    <div className="text-sm text-gray-500">Complete</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-mint-500 to-mint-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${demoData.studyPlan.progress}%` }}
                  ></div>
                </div>
                <div className="bg-mint-50 p-4 rounded-lg">
                  <h4 className="font-medium text-mint-800 mb-3">Today's Tasks</h4>
                  <div className="space-y-2">
                    {demoData.studyPlan.todaysTasks.map((task, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <input type="checkbox" className="rounded border-mint-300 text-mint-600" />
                        <span className="text-sm text-gray-700">{task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'flashcard':
        return (
          <Card className="border-mint-200 mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-mint-600" />
                AI-Generated Flashcard
                <Badge className="bg-mint-100 text-mint-700 text-xs">Auto-generated</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white border-2 border-mint-200 rounded-xl p-8 min-h-[250px] flex flex-col justify-center items-center text-center mb-4">
                <div className="space-y-6 w-full">
                  <div className="space-y-4">
                    <div className="text-sm text-mint-600 font-medium">Question</div>
                    <p className="text-lg font-medium text-gray-900">{demoData.flashcard.front}</p>
                  </div>
                  <div className="border-t border-gray-200 pt-4 space-y-4">
                    <div className="text-sm text-mint-600 font-medium">Answer</div>
                    <p className="text-lg text-gray-700">{demoData.flashcard.back}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex gap-4">
                  <span className="text-gray-500">Difficulty: <span className="font-medium text-orange-600">{demoData.flashcard.difficulty}</span></span>
                  <span className="text-gray-500">Status: <span className="font-medium text-blue-600">{demoData.flashcard.mastery}</span></span>
                </div>
                <Button size="sm" className="bg-mint-600 hover:bg-mint-700">
                  Next Card
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'quiz':
        return (
          <Card className="border-mint-200 mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-mint-600" />
                Adaptive Quiz Question
                <Badge className="bg-mint-100 text-mint-700 text-xs">AI Generated</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <h3 className="font-semibold text-lg">{demoData.quiz.question}</h3>
                <div className="space-y-3">
                  {demoData.quiz.options.map((option, index) => (
                    <button
                      key={index}
                      className={`w-full text-left p-4 rounded-lg border transition-colors ${
                        index === demoData.quiz.correct
                          ? 'border-green-300 bg-green-50 text-green-800'
                          : 'border-gray-200 hover:border-mint-300 hover:bg-mint-50'
                      }`}
                    >
                      <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                      {index === demoData.quiz.correct && (
                        <span className="ml-2 text-green-600 text-sm">✓ Correct</span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="bg-mint-50 p-4 rounded-lg">
                  <h4 className="font-medium text-mint-800 mb-2">Explanation:</h4>
                  <p className="text-mint-700 text-sm">{demoData.quiz.explanation}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 bg-mint-100 rounded-full text-mint-700 text-sm mb-8">
                <Sparkles className="w-4 h-4 mr-2" />
                Complete Study Solution
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Everything you need to
                <span className="block text-mint-500 mt-2">
                  study smarter
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
                Discover all the powerful features that make PrepGenie the ultimate study companion. 
                From AI-powered flashcards to personalized analytics, we've got everything covered.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-mint-600 hover:bg-mint-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  asChild
                >
                  <Link to="/signup">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-mint-300 text-mint-700 hover:bg-mint-50 hover:border-mint-400 bg-white shadow-md hover:shadow-lg transition-all duration-200"
                  asChild
                >
                  <Link to="/about">
                    Learn More
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Features List Section */}
        <div className="py-24 bg-gradient-to-b from-mint-50/10 via-white to-mint-50/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
                Comprehensive Feature Overview
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Explore every feature in detail with interactive demonstrations and comprehensive explanations
              </p>
            </div>

            <div className="space-y-12">
              {filteredFeatures.map((feature, index) => (
                <div
                  key={feature.name}
                  className="relative group"
                >
                  <div className="flex flex-col lg:flex-row gap-8 p-8 bg-white rounded-2xl border border-mint-100 shadow-sm hover:shadow-xl transition-all duration-300">
                    {/* Feature Icon and Header */}
                    <div className="lg:w-1/4 flex flex-col items-start">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-r ${feature.color} shadow-lg`}>
                          <feature.icon className="h-8 w-8 text-white" />
                        </div>
                        {feature.highlight && (
                          <span className="px-3 py-1 text-xs bg-mint-100 text-mint-700 rounded-full font-medium border border-mint-200">
                            {feature.highlight}
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.name}</h3>
                      <p className="text-gray-600 font-medium mb-4">{feature.description}</p>
                    </div>

                    {/* Feature Details */}
                    <div className="lg:w-3/4 space-y-6">
                      {/* Detailed Description */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-800">How It Works</h4>
                        <p className="text-gray-600 leading-relaxed">{feature.longDescription}</p>
                      </div>

                      {/* Interactive Demo Section */}
                      {feature.demoComponent && feature.demoComponent !== 'comingSoon' ? (
                        <div className="bg-gradient-to-r from-mint-50 to-blue-50 rounded-xl p-6 border border-mint-100">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                              <Play className="h-5 w-5 text-mint-600" />
                              Interactive Demo
                            </h4>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-white hover:bg-mint-50 border-mint-200 text-mint-700"
                              onClick={() => setActiveDemo(activeDemo === feature.demoComponent ? null : feature.demoComponent)}
                            >
                              {activeDemo === feature.demoComponent ? 'Hide Demo' : 'Coming Soon'}
                              <ArrowRight className="ml-2 h-3 w-3" />
                            </Button>
                          </div>
                          
                          {activeDemo === feature.demoComponent && renderInteractiveDemo(feature.demoComponent)}
                        </div>
                      ) : feature.demoComponent === 'comingSoon' ? (
                        <FeatureComingSoonBanner 
                          title={`${feature.name} Demo`}
                          description="Experience this powerful feature with an interactive demonstration in our upcoming release."
                        />
                      ) : (
                        <FeatureComingSoonBanner 
                          title={`${feature.name} Demo`}
                          description="Interactive demonstration will be available soon. This feature is currently in development."
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-mint-50 to-blue-50 rounded-2xl p-8 border border-mint-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Transform Your Study Experience?</h3>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              Join thousands of students who are already studying smarter with our AI-powered tools
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-mint-600 hover:bg-mint-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                asChild
              >
                <Link to="/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-mint-300 text-mint-700 hover:bg-white hover:border-mint-400 bg-transparent shadow-md hover:shadow-lg transition-all duration-200"
                asChild
              >
                <Link to="/pricing">
                  View Pricing
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
