
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  BookOpen, 
  Brain, 
  Scan, 
  BarChart3, 
  Users, 
  Zap, 
  ArrowRight,
  Clock,
  Target,
  Calendar,
  MessageSquare,
  Bell,
  CheckSquare,
  Upload,
  FileText,
  HelpCircle,
  Settings,
  Smartphone,
  Globe,
  Download,
  Video,
  Camera,
  Lightbulb,
  Trophy,
  Repeat,
  PieChart,
  Star
} from "lucide-react";

const featureCategories = [
  {
    id: "ai-powered",
    title: "AI-Powered Study Tools",
    description: "Revolutionary AI features that transform how you study",
    features: [
      {
        name: "AI Flashcard Generation",
        description: "Transform any note into smart flashcards automatically with advanced AI processing.",
        icon: Brain,
        badges: ["AI-Powered", "Premium"],
        demoLink: "/notes"
      },
      {
        name: "Smart Note Enhancement",
        description: "Get AI-generated summaries, explanations, key concepts, and study guides from your notes.",
        icon: Lightbulb,
        badges: ["AI-Powered"],
        demoLink: "/notes"
      },
      {
        name: "Adaptive Quiz Generation",
        description: "Create personalized quizzes that adapt to your learning progress and weak areas.",
        icon: HelpCircle,
        badges: ["AI-Powered", "Adaptive"],
        demoLink: "/quiz"
      },
      {
        name: "YouTube Video Transcription",
        description: "Convert YouTube lectures into searchable notes with AI-powered transcription and summaries.",
        icon: Video,
        badges: ["AI-Powered", "New"],
        demoLink: "/notes"
      }
    ]
  },
  {
    id: "content-management",
    title: "Content & Import Tools",
    description: "Digitize and organize your study materials effortlessly",
    features: [
      {
        name: "OCR Document Scanning",
        description: "Scan handwritten notes, textbooks, and documents with advanced OCR technology.",
        icon: Scan,
        badges: ["Premium"],
        demoLink: "/notes"
      },
      {
        name: "Multi-Format Import",
        description: "Import from Evernote, Google Docs, Notion, OneNote, PDFs, and more.",
        icon: Upload,
        badges: ["Premium"],
        demoLink: "/notes"
      },
      {
        name: "Bulk PDF Processing",
        description: "Process multiple PDF files at once and extract searchable content.",
        icon: FileText,
        badges: ["Premium"],
        demoLink: "/notes"
      },
      {
        name: "Camera Capture",
        description: "Instantly capture and digitize notes using your device's camera.",
        icon: Camera,
        badges: ["Mobile"],
        demoLink: "/notes"
      }
    ]
  },
  {
    id: "study-progress",
    title: "Study & Progress Tracking",
    description: "Monitor your learning journey with detailed analytics",
    features: [
      {
        name: "Advanced Analytics",
        description: "Track study time, performance trends, mastery levels, and learning velocity.",
        icon: BarChart3,
        badges: ["Analytics"],
        demoLink: "/progress"
      },
      {
        name: "Spaced Repetition",
        description: "Optimized review scheduling based on forgetting curves and retention rates.",
        icon: Repeat,
        badges: ["Science-Based"],
        demoLink: "/flashcards"
      },
      {
        name: "Study Session Tracking",
        description: "Monitor focused study time with detailed session analytics and insights.",
        icon: Clock,
        badges: ["Premium"],
        demoLink: "/study-sessions"
      },
      {
        name: "Achievement System",
        description: "Earn badges and track milestones to stay motivated throughout your studies.",
        icon: Trophy,
        badges: ["Gamification"],
        demoLink: "/progress"
      },
      {
        name: "Goal Management",
        description: "Set SMART study goals and track progress with automated reminders.",
        icon: Target,
        badges: ["Productivity"],
        demoLink: "/goals"
      }
    ]
  },
  {
    id: "collaboration",
    title: "Collaboration & Sharing",
    description: "Study together and share knowledge with classmates",
    features: [
      {
        name: "Study Groups",
        description: "Create and join study groups with real-time collaboration features.",
        icon: Users,
        badges: ["Social"],
        demoLink: "/collaboration"
      },
      {
        name: "Real-time Chat",
        description: "Discuss concepts and get help from study partners with built-in messaging.",
        icon: MessageSquare,
        badges: ["Real-time"],
        demoLink: "/chat"
      },
      {
        name: "Content Sharing",
        description: "Share flashcard sets, notes, and quizzes with permission controls.",
        icon: Users,
        badges: ["Premium"],
        demoLink: "/collaboration"
      },
      {
        name: "Note Chat Assistant",
        description: "AI-powered chat that answers questions about your specific notes and content.",
        icon: Brain,
        badges: ["AI-Powered", "New"],
        demoLink: "/notes"
      }
    ]
  },
  {
    id: "organization",
    title: "Organization & Planning",
    description: "Stay organized with smart scheduling and task management",
    features: [
      {
        name: "Smart Scheduling",
        description: "AI-powered study schedule optimization based on your goals and availability.",
        icon: Calendar,
        badges: ["AI-Powered"],
        demoLink: "/schedule"
      },
      {
        name: "Study Reminders",
        description: "Automated reminders for study sessions, reviews, and important deadlines.",
        icon: Bell,
        badges: ["Automation"],
        demoLink: "/reminders"
      },
      {
        name: "Todo Management",
        description: "Comprehensive task management with dependencies and smart suggestions.",
        icon: CheckSquare,
        badges: ["Productivity"],
        demoLink: "/todos"
      },
      {
        name: "Subject Organization",
        description: "Organize content by subjects, grades, and custom tags for easy discovery.",
        icon: BookOpen,
        badges: ["Organization"],
        demoLink: "/notes"
      }
    ]
  },
  {
    id: "advanced",
    title: "Advanced Features",
    description: "Professional-grade tools for serious learners",
    features: [
      {
        name: "Multi-language Support",
        description: "Study in multiple languages with OCR and AI support for various languages.",
        icon: Globe,
        badges: ["International"],
        demoLink: "/settings"
      },
      {
        name: "Export & Backup",
        description: "Export your data in multiple formats (PDF, JSON, CSV) with cloud backup.",
        icon: Download,
        badges: ["Data"],
        demoLink: "/settings"
      },
      {
        name: "API Integrations",
        description: "Connect with external tools and services through our comprehensive API.",
        icon: Settings,
        badges: ["Developer"],
        demoLink: "/settings"
      },
      {
        name: "Mobile Optimization",
        description: "Full-featured mobile experience with offline study capabilities.",
        icon: Smartphone,
        badges: ["Mobile"],
        demoLink: "/"
      }
    ]
  }
];

const stats = [
  { label: "AI-Generated Flashcards", value: "500K+" },
  { label: "Study Sessions Tracked", value: "2M+" },
  { label: "Notes Enhanced", value: "100K+" },
  { label: "Students Helped", value: "50K+" }
];

const FeaturesPage = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-white via-mint-50/30 to-mint-50/10">
        {/* Hero Section */}
        <div className="px-4 sm:px-6 lg:px-8 pt-12 pb-16 max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-mint-100 rounded-full text-mint-700 text-sm mb-8">
              🚀 Complete Study Solution
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Everything You Need to
              <span className="block text-mint-500 mt-2">
                Study Smarter
              </span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              From AI-powered flashcards to collaborative study groups - discover all the features that make PrepGenie the most comprehensive study platform for students.
            </p>
            
            {/* Stats */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-mint-600">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="bg-mint-500 hover:bg-mint-600 text-white">
                <Link to="/signup" className="flex items-center">
                  Start Learning Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-mint-200 text-mint-700 hover:bg-mint-50"
              >
                <Link to="/dashboard" className="flex items-center">
                  Try Live Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Feature Categories */}
        <div className="px-4 sm:px-6 lg:px-8 pb-24 max-w-7xl mx-auto">
          {featureCategories.map((category, categoryIndex) => (
            <div key={category.id} className="mb-20">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {category.title}
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  {category.description}
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
                {category.features.map((feature, index) => (
                  <div
                    key={index}
                    className="group relative rounded-2xl transition-all duration-200 hover:scale-105"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-mint-300 to-neutral-300 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-200" />
                    <div className="relative h-full p-8 bg-white rounded-2xl border border-mint-100">
                      <div className="flex items-start justify-between mb-6">
                        <span className="inline-flex items-center justify-center p-4 rounded-xl bg-gradient-to-br from-mint-400 to-neutral-400">
                          <feature.icon className="h-7 w-7 text-white" />
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {feature.badges.map((badge, badgeIndex) => (
                            <Badge 
                              key={badgeIndex} 
                              variant="secondary"
                              className={`text-xs ${
                                badge === 'AI-Powered' ? 'bg-purple-100 text-purple-700' :
                                badge === 'Premium' ? 'bg-yellow-100 text-yellow-700' :
                                badge === 'New' ? 'bg-green-100 text-green-700' :
                                'bg-mint-100 text-mint-700'
                              }`}
                            >
                              {badge}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {feature.name}
                      </h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {feature.description}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-mint-200 text-mint-700 hover:bg-mint-50"
                      >
                        <Link to={feature.demoLink} className="flex items-center">
                          Try Feature
                          <ArrowRight className="ml-2 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Final CTA Section */}
        <div className="bg-gradient-to-r from-mint-500 to-mint-600 py-16">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Study Experience?
            </h2>
            <p className="text-xl text-mint-100 mb-8">
              Join thousands of students who are already studying smarter with PrepGenie's AI-powered features.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                size="lg"
                className="bg-white text-mint-700 hover:bg-mint-50"
              >
                <Link to="/signup" className="flex items-center">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Link to="/contact" className="flex items-center">
                  Contact Sales
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
