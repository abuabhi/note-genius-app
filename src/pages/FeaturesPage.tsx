
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, BookOpen, Brain, Scan, BarChart3, Zap, Calendar, Users, Target, MessageSquare, Clock, TrendingUp, Play, Eye, Layers, CheckCircle, Award, Bot } from 'lucide-react';

const expandedFeatures = [
  {
    name: "AI Flashcard Generation",
    description: "Transform your notes into smart flashcards automatically with AI-powered content processing and spaced repetition.",
    longDescription: "Our advanced AI analyzes your study materials and automatically generates effective flashcards with optimal question-answer pairs. The system uses natural language processing to identify key concepts, important terms, and relationships within your content. Features include automatic difficulty adjustment, spaced repetition scheduling, and intelligent review timing to maximize retention and minimize study time.",
    icon: Brain,
    highlight: "Popular",
    color: "from-mint-500 to-mint-600",
    demo: "Upload any text or notes → AI identifies key concepts → Generates optimized flashcard pairs → Schedules reviews based on your memory performance"
  },
  {
    name: "Smart Quiz Creation",
    description: "Generate adaptive quizzes from your content that adjust difficulty based on your performance and learning progress.",
    longDescription: "Create comprehensive quizzes that adapt to your learning style and progress. Our AI generates multiple question types including multiple choice, true/false, fill-in-the-blank, and essay questions. The system tracks your performance patterns and adjusts question difficulty in real-time, focusing on areas where you need the most improvement while reinforcing your strengths.",
    icon: Zap,
    highlight: "AI-Powered",
    color: "from-mint-400 to-mint-500",
    demo: "Select your content → Choose quiz parameters → AI generates varied question types → Take adaptive quiz → Receive detailed performance analytics"
  },
  {
    name: "Personalized Study Plans",
    description: "Create intelligent study schedules that adapt to your goals, deadlines, and learning patterns for optimal results.",
    longDescription: "Build customized study plans that work around your schedule and learning preferences. The system considers your goals, available time, subject priorities, and learning velocity to create realistic and effective study schedules. Plans automatically adjust based on your progress, exam dates, and performance metrics to ensure you stay on track.",
    icon: Calendar,
    highlight: "New",
    color: "from-mint-600 to-mint-700",
    demo: "Set your goals and deadlines → Input your available study time → AI creates personalized schedule → Track daily progress → Automatic adjustments based on performance"
  },
  {
    name: "Smart Note Enhancement",
    description: "Upload, scan, or write notes. Get AI-generated summaries, explanations, and study guides instantly.",
    longDescription: "Transform any study material into comprehensive learning resources. Upload documents, scan handwritten notes, or type directly into our editor. Our AI analyzes your content and generates detailed summaries, clarifying explanations, key concept lists, and comprehensive study guides. The system also identifies knowledge gaps and suggests additional resources.",
    icon: BookOpen,
    highlight: "",
    color: "from-mint-300 to-mint-400",
    demo: "Upload your notes or documents → AI processes and analyzes content → Generates summaries and explanations → Creates interactive study guides → Suggests related topics"
  },
  {
    name: "Document Scanning & OCR",
    description: "Scan handwritten notes, textbooks, and documents with OCR technology for instant digitization and processing.",
    longDescription: "Convert any physical document into searchable, editable digital content. Our advanced OCR technology accurately recognizes text from handwritten notes, printed materials, and complex layouts. The system preserves formatting, handles multiple languages, and can process mathematical equations and diagrams for comprehensive digitization.",
    icon: Scan,
    highlight: "",
    color: "from-mint-500 to-mint-600",
    demo: "Capture image of document → OCR processes and extracts text → Edit and organize digital content → Convert to flashcards or study materials → Search through all content"
  },
  {
    name: "Learning Analytics Dashboard",
    description: "Track your study time, performance trends, mastery levels, and get personalized insights to improve faster.",
    longDescription: "Gain deep insights into your learning patterns with comprehensive analytics. Monitor study time across subjects, track performance trends, identify strengths and weaknesses, and receive personalized recommendations. The dashboard provides detailed reports on retention rates, learning velocity, and optimal study times to help you maximize efficiency.",
    icon: BarChart3,
    highlight: "Analytics",
    color: "from-mint-400 to-mint-600",
    demo: "Study using our tools → System tracks all interactions → Generates detailed performance reports → Provides personalized insights → Suggests optimization strategies"
  },
  {
    name: "Collaborative Study Groups",
    description: "Join or create study groups to share flashcards, quizzes, and notes with classmates and friends.",
    longDescription: "Connect with classmates and study together more effectively. Share your flashcard sets, collaborate on study plans, participate in group challenges, and learn from each other's progress. Features include real-time collaboration, shared study sessions, group performance tracking, and peer-to-peer learning recommendations.",
    icon: Users,
    highlight: "Social",
    color: "from-blue-400 to-blue-600",
    demo: "Create or join study group → Share flashcards and notes → Participate in group challenges → Track collective progress → Engage in peer learning"
  },
  {
    name: "Goal Setting & Tracking",
    description: "Set specific learning objectives, track your progress, and achieve your academic goals with structured planning.",
    longDescription: "Define clear learning objectives and track your journey toward achieving them. Set SMART goals for different subjects, monitor daily and weekly progress, and receive motivation through achievement badges and milestone celebrations. The system provides goal-specific recommendations and adjusts study plans to ensure you meet your targets.",
    icon: Target,
    highlight: "",
    color: "from-purple-400 to-purple-600",
    demo: "Define your learning goals → Set target dates and metrics → Follow structured study plan → Monitor daily progress → Celebrate achievements and milestones"
  },
  {
    name: "AI Study Assistant Chat",
    description: "Get instant answers to questions, explanations of complex topics, and personalized study guidance through AI chat.",
    longDescription: "Access a knowledgeable AI tutor available 24/7 to help with any study-related questions. The assistant can explain complex concepts, provide examples, suggest study strategies, and offer personalized guidance based on your learning history. It integrates with your study materials to provide contextual help and recommendations.",
    icon: MessageSquare,
    highlight: "24/7",
    color: "from-indigo-400 to-indigo-600",
    demo: "Ask any study question → Receive detailed explanations → Get personalized study tips → Access subject-specific guidance → Build on previous conversations"
  },
  {
    name: "Spaced Repetition System",
    description: "Optimize your memory retention with scientifically-backed spaced repetition algorithms for long-term learning.",
    longDescription: "Maximize retention with our advanced spaced repetition system based on cognitive science research. The algorithm tracks your memory performance for each piece of information and schedules reviews at optimal intervals. This approach significantly improves long-term retention while minimizing the time spent on already-mastered material.",
    icon: Clock,
    highlight: "Science-Based",
    color: "from-orange-400 to-orange-600",
    demo: "Study flashcards → System tracks your performance → Calculates optimal review intervals → Schedules future reviews → Adapts based on memory strength"
  },
  {
    name: "Progress Forecasting",
    description: "Predict your future performance and readiness for exams using advanced analytics and machine learning.",
    longDescription: "Get data-driven predictions about your readiness for upcoming exams and assignments. Our machine learning models analyze your study patterns, performance trends, and learning velocity to forecast your likely performance. Receive early warnings about potential difficulties and recommendations for improvement strategies.",
    icon: TrendingUp,
    highlight: "Predictive",
    color: "from-red-400 to-red-600",
    demo: "Study consistently using our platform → AI analyzes your patterns → Generates performance predictions → Provides readiness assessments → Suggests improvement strategies"
  },
  {
    name: "Interactive Study Sessions",
    description: "Engage in dynamic study sessions with interactive elements, gamification, and real-time feedback.",
    longDescription: "Make studying engaging and effective with interactive elements that keep you motivated. Features include gamified study sessions, real-time feedback, progress streaks, achievement systems, and adaptive difficulty. The system creates a engaging learning environment that makes studying feel less like work and more like play.",
    icon: Play,
    highlight: "Engaging",
    color: "from-green-400 to-green-600",
    demo: "Start interactive study session → Engage with gamified content → Receive real-time feedback → Earn points and achievements → Maintain study streaks"
  },
  {
    name: "Visual Learning Tools",
    description: "Create mind maps, diagrams, and visual study aids to enhance comprehension and memory retention.",
    longDescription: "Leverage visual learning techniques with our comprehensive set of visual tools. Create mind maps, concept diagrams, flowcharts, and other visual aids that help you understand complex relationships and remember information more effectively. The tools integrate with your notes and flashcards for a cohesive learning experience.",
    icon: Eye,
    highlight: "",
    color: "from-teal-400 to-teal-600",
    demo: "Input your study topics → Create visual mind maps → Build concept relationships → Generate diagrams → Export and share visual aids"
  },
  {
    name: "Multi-Subject Organization",
    description: "Organize and manage study materials across multiple subjects with intelligent categorization and cross-references.",
    longDescription: "Keep all your subjects organized and interconnected with intelligent categorization systems. The platform automatically tags content, identifies cross-subject relationships, and helps you discover connections between different areas of study. Features include subject-specific dashboards, integrated calendars, and unified search across all materials.",
    icon: Layers,
    highlight: "",
    color: "from-cyan-400 to-cyan-600",
    demo: "Add content from different subjects → AI categorizes and tags → Discovers cross-subject connections → Provides unified search → Manages integrated study schedule"
  },
  {
    name: "Mastery Verification",
    description: "Verify your understanding with comprehensive assessments and receive certification for mastered topics.",
    longDescription: "Prove your mastery with rigorous assessment tools that verify deep understanding rather than memorization. The system creates comprehensive tests that evaluate knowledge from multiple angles, provides detailed feedback on areas of strength and weakness, and awards certificates for truly mastered topics that you can share with teachers or employers.",
    icon: CheckCircle,
    highlight: "Certification",
    color: "from-emerald-400 to-emerald-600",
    demo: "Complete study materials → Take comprehensive mastery test → Receive detailed performance analysis → Earn mastery certificates → Share achievements"
  },
  {
    name: "Achievement System",
    description: "Stay motivated with comprehensive achievement badges, progress streaks, and milestone celebrations.",
    longDescription: "Maintain motivation through our comprehensive gamification system. Earn badges for various achievements like study streaks, mastery milestones, collaboration contributions, and improvement metrics. The system celebrates your progress with personalized celebrations and provides clear pathways to unlock new achievements.",
    icon: Award,
    highlight: "Motivational",
    color: "from-yellow-400 to-yellow-600",
    demo: "Complete study activities → Earn achievement badges → Build study streaks → Unlock milestone rewards → Share accomplishments with friends"
  },
  {
    name: "AI Content Generation",
    description: "Generate practice questions, summaries, and study materials from any content using advanced AI technology.",
    longDescription: "Leverage cutting-edge AI to automatically generate high-quality study materials from any source. Upload textbooks, lecture notes, or web articles and receive comprehensive study packages including practice questions, detailed summaries, key concept lists, and related topics. The AI adapts content to your learning level and style preferences.",
    icon: Bot,
    highlight: "Advanced AI",
    color: "from-violet-400 to-violet-600",
    demo: "Upload any study content → AI analyzes and processes → Generates comprehensive study materials → Customizes to your level → Creates practice assessments"
  }
];

const FeaturesPage = () => {
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
              {expandedFeatures.map((feature, index) => (
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

                      {/* Demo Section */}
                      <div className="bg-gradient-to-r from-mint-50 to-blue-50 rounded-xl p-6 border border-mint-100">
                        <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                          <Play className="h-5 w-5 text-mint-600 mr-2" />
                          Interactive Demo Flow
                        </h4>
                        <p className="text-gray-700 leading-relaxed font-medium">{feature.demo}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20 bg-gradient-to-r from-mint-600 to-blue-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to transform your studying?
            </h2>
            <p className="text-xl text-mint-100 mb-8 max-w-2xl mx-auto">
              Join thousands of students who are already studying smarter with PrepGenie's powerful features.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-mint-700 hover:bg-gray-50 px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
              asChild
            >
              <Link to="/signup">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FeaturesPage;
