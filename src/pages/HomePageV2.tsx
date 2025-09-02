import React, { Suspense } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import VideoHero from "@/components/video/VideoHero";
import { VideoFeatureSection } from "@/components/video/VideoFeatureSection";
import CTA from "@/components/landing/CTA";
import StickyMobileCTA from "@/components/landing/StickyMobileCTA";
import { UrgencyBanner } from "@/components/landing/UrgencyBanner";
import { ProgressBasedCTA } from "@/components/landing/ProgressBasedCTA";
import { RealTimeSignupCounter } from "@/components/landing/RealTimeSignupCounter";
import { Logos3 } from "@/components/ui/logos3";
import { Button } from "@/components/ui/button";
import { useVideoSettings } from "@/hooks/admin/useAdminSettings";
import { 
  BookOpen, 
  Brain, 
  Zap, 
  MessageSquare, 
  Calendar, 
  ListChecks, 
  BarChart3, 
  Timer, 
  Target, 
  FolderOpen 
} from "lucide-react";

const Testimonials = React.lazy(() => import("@/components/landing/Testimonials"));

const HomePageV2 = () => {
  const { data: videoSettings } = useVideoSettings();
  const canonicalUrl = typeof window !== 'undefined' ? `${window.location.origin}/v2` : undefined;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "AI Study App - Video Demo",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "See how AI transforms your notes into flashcards, creates smart quizzes, and builds personalized study plans. Visual learning tools that work.",
    keywords: [
      "AI flashcards demo",
      "study planner video",
      "quiz generator demo",
      "OCR notes demo",
      "study analytics video",
    ],
  };

  return (
    <Layout>
      <Helmet>
        <title>AI Study App Demo: See Every Feature in Action</title>
        <meta name="description" content="Watch how AI transforms your notes into flashcards, creates smart quizzes, and builds personalized study plans. See every feature in action." />
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
        <meta property="og:title" content="AI Study App Demo: See Every Feature in Action" />
        <meta property="og:description" content="Watch how AI transforms your notes into flashcards, creates smart quizzes, and builds personalized study plans. See every feature in action." />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30 overflow-x-hidden">
        <UrgencyBanner />
        <VideoHero />
        
        {/* Social Proof Section */}
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center">
              <RealTimeSignupCounter />
            </div>
          </div>
        </div>
        
        {/* Trust Signal */}
        <Logos3 heading="Trusted by students at" count={17} />

        {/* Mid-Page CTA */}
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-gradient-to-r from-mint-500 to-mint-600 rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-2">Ready to Transform Your Study Process?</h3>
              <p className="text-mint-100 mb-4">Join 50,000+ students who study smarter with AI</p>
              <Button 
                asChild 
                size="lg" 
                className="bg-white text-mint-600 hover:bg-mint-50 font-semibold"
              >
                <Link to="/signup">Start Free Plan - No Credit Card</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Feature Demo Sections */}
        <VideoFeatureSection
          title="Notes Import & AI Enhancement"
          description="Transform any document into powerful study materials. Upload PDFs, import from Google Docs, or use handwriting recognition - then watch AI create summaries, key points, and practice questions."
          benefits={[
            "OCR handwriting recognition with 95% accuracy",
            "Auto-generated summaries and key concepts",
            "Smart question creation from your content",
            "Support for PDF, Word, OneNote, and more"
          ]}
          videoUrl={videoSettings?.video_notes_import_url ?? "https://www.youtube.com/watch?v=UR94FhzUOg0"}
          icon={BookOpen}
          highlight="All-in-one"
        />

        <VideoFeatureSection
          title="AI Flashcard Generation"
          description="Watch your notes transform into smart flashcards instantly. Our AI understands context and creates multiple question types with spaced repetition algorithms that adapt to your learning pace."
          benefits={[
            "Instant flashcard creation from any content",
            "Multiple question types: fill-in-blank, multiple choice, true/false",
            "Spaced repetition algorithm for optimal retention",
            "Difficulty adjustment based on your performance"
          ]}
          videoUrl={videoSettings?.video_flashcard_generation_url ?? "https://www.youtube.com/watch?v=UR94FhzUOg0"}
          icon={Brain}
          highlight="Popular"
          reverse={true}
        />

        <VideoFeatureSection
          title="Smart Quizzes"
          description="Generate comprehensive quizzes that adapt to your knowledge level. See how our AI creates challenging questions that help you master concepts faster than traditional study methods."
          benefits={[
            "Adaptive difficulty that adjusts to your performance",
            "Comprehensive explanations for every answer",
            "Progress tracking across all quiz attempts",
            "Instant feedback to reinforce learning"
          ]}
          videoUrl={videoSettings?.video_smart_quizzes_url ?? "https://www.youtube.com/watch?v=UR94FhzUOg0"}
          icon={Zap}
          highlight="AI-Powered"
        />

        <VideoFeatureSection
          title="AI Chat with Your Notes"
          description="Have conversations with your study materials. Ask questions, get instant explanations, and create new flashcards directly from your chat interactions."
          benefits={[
            "Natural language questions about your content",
            "Instant explanations with source references",
            "Create flashcards directly from chat responses",
            "Context-aware answers from your specific materials"
          ]}
          videoUrl={videoSettings?.video_ai_chat_url ?? "https://www.youtube.com/watch?v=UR94FhzUOg0"}
          icon={MessageSquare}
          highlight="New"
          reverse={true}
        />

        <VideoFeatureSection
          title="Personalized Study Plans"
          description="See how our AI creates study schedules that adapt to your goals, deadlines, and learning pace. Watch plans automatically adjust based on your progress and performance."
          benefits={[
            "Custom schedules based on your goals and deadlines",
            "Automatic adjustments based on your progress",
            "Integration with calendar apps",
            "Realistic time estimates for each study session"
          ]}
          videoUrl={videoSettings?.video_study_plans_url ?? "https://www.youtube.com/watch?v=UR94FhzUOg0"}
          icon={Calendar}
          highlight="Adaptive"
        />

        <VideoFeatureSection
          title="To-Do & Focus Tools"
          description="Stay organized and maintain focus during study sessions. See how our integrated task management and focus tools work together to maximize your productivity."
          benefits={[
            "Smart task prioritization based on deadlines",
            "Focus mode to eliminate distractions",
            "Session-based task completion tracking",
            "Integration with study plans and goals"
          ]}
          videoUrl={videoSettings?.video_todo_focus_url ?? "https://www.youtube.com/watch?v=UR94FhzUOg0"}
          icon={ListChecks}
          highlight="Organizer"
          reverse={true}
        />

        <VideoFeatureSection
          title="Learning Analytics"
          description="Discover insights about your learning patterns. Watch how our analytics track your progress, identify knowledge gaps, and provide actionable recommendations."
          benefits={[
            "Detailed progress tracking across all subjects",
            "Performance trends and pattern recognition",
            "Knowledge gap identification",
            "Personalized recommendations for improvement"
          ]}
          videoUrl={videoSettings?.video_analytics_url ?? "https://www.youtube.com/watch?v=UR94FhzUOg0"}
          icon={BarChart3}
          highlight="Analytics"
          reverse={true}
        />

        <VideoFeatureSection
          title="Study Timer"
          description="Built-in Pomodoro timer that integrates with all your study activities. See how timing your sessions leads to better focus and consistent study habits."
          benefits={[
            "Pomodoro technique with customizable intervals",
            "Automatic break reminders",
            "Time tracking across all study activities",
            "Focus statistics and productivity insights"
          ]}
          videoUrl={videoSettings?.video_timer_url ?? "https://www.youtube.com/watch?v=UR94FhzUOg0"}
          icon={Timer}
          highlight="Pomodoro"
        />

        <VideoFeatureSection
          title="Goals & Progress"
          description="Set meaningful study goals and track your progress with visual indicators. Watch how goal-setting and progress tracking keep you motivated throughout your learning journey."
          benefits={[
            "SMART goal setting with deadline tracking",
            "Visual progress indicators and milestones",
            "Achievement celebrations and streaks",
            "Goal adjustment based on performance data"
          ]}
          videoUrl={videoSettings?.video_goals_progress_url ?? "https://www.youtube.com/watch?v=UR94FhzUOg0"}
          icon={Target}
          highlight="Motivation"
          reverse={true}
        />

        <VideoFeatureSection
          title="Resources Management"
          description="Organize all your study materials in one place. See how to manage PDFs, websites, research papers, and digital resources with smart categorization and quick access."
          benefits={[
            "Smart categorization of study materials",
            "Quick search across all your resources",
            "Website bookmarking with automatic tagging",
            "Integration with notes and flashcard creation"
          ]}
          videoUrl={videoSettings?.video_resources_url ?? "https://www.youtube.com/watch?v=UR94FhzUOg0"}
          icon={FolderOpen}
          highlight="Organization"
          reverse={true}
        />

        {/* Strategic Mid-Page CTA */}
        <div className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-mint-500 to-mint-600 rounded-3xl p-8 shadow-2xl">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Ready to Study Smarter, Not Harder?
              </h3>
              <p className="text-mint-100 mb-6 text-lg">
                Join 50,000+ students who improved their grades by 35% on average
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-white text-mint-600 hover:bg-mint-50 font-semibold text-lg px-8 py-4"
                >
                  <Link to="/signup">Start Free Plan - No Credit Card</Link>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-4"
                >
                  <Link to="/features">See All Features</Link>
                </Button>
              </div>
              <div className="flex flex-wrap justify-center gap-6 pt-6 text-sm text-mint-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Cancel anytime</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Works on all devices</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Free forever plan</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Suspense fallback={<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"><div className="h-72 rounded-2xl bg-white/60 border border-mint-100 animate-pulse" /></div>}>
          <Testimonials />
        </Suspense>

        <CTA />
        <StickyMobileCTA />
        
        {/* Progressive CTAs */}
        <ProgressBasedCTA 
          milestone={3} 
          total={10} 
          message="You've seen 3 amazing features! Ready to transform your study routine?" 
        />
        <ProgressBasedCTA 
          milestone={6} 
          total={10} 
          message="6 features explored! Join thousands of students studying smarter with AI." 
        />
        <ProgressBasedCTA 
          milestone={9} 
          total={10} 
          message="Almost done! See how these features work together in your free plan." 
        />
        
      </div>
    </Layout>
  );
};

export default HomePageV2;