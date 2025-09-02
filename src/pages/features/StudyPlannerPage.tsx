import React from 'react';
import Layout from '@/components/layout/Layout';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageBreadcrumb } from '@/components/ui/page-breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle, ArrowRight, Target, Clock, BarChart3, Zap } from 'lucide-react';

const StudyPlannerPage = () => {
  const canonicalUrl = typeof window !== 'undefined' ? `${window.location.origin}/features/study-planner` : undefined;

  const howToSteps = [
    {
      step: 1,
      title: "Set Your Goals",
      description: "Define your study objectives, exam dates, and subject priorities",
      icon: Target
    },
    {
      step: 2,
      title: "AI Analyzes Schedule",
      description: "Our AI considers your availability, learning patterns, and deadlines",
      icon: BarChart3
    },
    {
      step: 3,
      title: "Get Custom Plan",
      description: "Receive a personalized study schedule optimized for your success",
      icon: Calendar
    },
    {
      step: 4,
      title: "Track Progress",
      description: "Monitor your progress and let AI adjust your plan dynamically",
      icon: Zap
    }
  ];

  const benefits = [
    "Personalized study schedules based on your goals",
    "Intelligent time allocation across subjects",
    "Automatic deadline management and reminders",
    "Progress tracking with performance analytics",
    "Adaptive planning that adjusts to your pace",
    "Integration with flashcards and quizzes"
  ];

  const planTypes = [
    {
      name: "Exam Preparation",
      description: "Structured plans for upcoming exams with strategic review sessions",
      icon: Target,
      features: ["Deadline-driven scheduling", "Review sessions", "Mock exam planning"]
    },
    {
      name: "Subject Mastery",
      description: "Long-term learning plans for comprehensive subject understanding",
      icon: BarChart3,
      features: ["Progressive difficulty", "Skill building", "Knowledge mapping"]
    },
    {
      name: "Daily Study Routine",
      description: "Consistent daily habits for ongoing learning and retention",
      icon: Clock,
      features: ["Habit formation", "Daily goals", "Streak tracking"]
    }
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "AI Study Planner - PrepGenie",
    "applicationCategory": "ProductivityApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Create personalized study schedules with AI. Intelligent time management, deadline tracking, and adaptive planning for academic success.",
    "featureList": [
      "Personalized study scheduling",
      "AI-powered time optimization",
      "Deadline management",
      "Progress tracking",
      "Adaptive plan adjustments",
      "Multi-subject coordination"
    ],
    "screenshot": "/lovable-uploads/study-planner-demo.png",
    "softwareVersion": "1.0",
    "datePublished": "2024-01-01",
    "author": {
      "@type": "Organization",
      "name": "PrepGenie"
    }
  };

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Create an Effective Study Plan with AI",
    "description": "Learn how to build personalized study schedules that adapt to your learning style and academic goals",
    "totalTime": "PT10M",
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "USD",
      "value": "0"
    },
    "step": howToSteps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.title,
      "text": step.description
    }))
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": typeof window !== 'undefined' ? window.location.origin : ""
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Features",
        "item": typeof window !== 'undefined' ? `${window.location.origin}/features` : ""
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Study Planner",
        "item": canonicalUrl
      }
    ]
  };

  return (
    <Layout>
      <Helmet>
        <title>AI Study Planner - Personalized Study Schedules & Time Management | PrepGenie</title>
        <meta name="description" content="Create intelligent study plans with AI. Personalized schedules, deadline management, progress tracking, and adaptive planning for academic success." />
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
        <meta property="og:title" content="AI Study Planner - Personalized Study Schedules & Time Management" />
        <meta property="og:description" content="Create intelligent study plans with AI. Personalized schedules, deadline management, progress tracking, and adaptive planning for academic success." />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Study Planner - Personalized Study Schedules & Time Management" />
        <meta name="twitter:description" content="Create intelligent study plans with AI. Personalized schedules, deadline management, progress tracking, and adaptive planning for academic success." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PageBreadcrumb 
            pageName="Study Planner" 
            pageIcon={<Calendar className="h-4 w-4" />}
            parentName="Features"
            parentPath="/features"
          />

          {/* Hero Section */}
          <div className="text-center py-16">
            <div className="inline-flex items-center gap-2 bg-mint-100 text-mint-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Calendar className="h-4 w-4" />
              Smart Planning Tool
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              AI Study Planner
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Create personalized study schedules that adapt to your goals, deadlines, and learning patterns. Our AI optimizes your time for maximum academic success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-mint-600 hover:bg-mint-700">
                <Link to="/signup">
                  Build Your Study Plan Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/features">View All Features</Link>
              </Button>
            </div>
          </div>

          {/* How It Works Section */}
          <section className="py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How to Create Your Perfect Study Plan</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Get a personalized study schedule optimized for your success in just minutes
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howToSteps.map((step) => (
                <Card key={step.step} className="text-center">
                  <CardHeader>
                    <div className="w-16 h-16 bg-mint-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <step.icon className="h-8 w-8 text-mint-600" />
                    </div>
                    <div className="w-8 h-8 bg-mint-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                      {step.step}
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Plan Types Section */}
          <section className="py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Study Plan Types</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Choose the planning approach that matches your learning goals
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {planTypes.map((plan, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="w-16 h-16 bg-mint-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <plan.icon className="h-8 w-8 text-mint-600" />
                    </div>
                    <CardTitle className="text-xl mb-2">{plan.name}</CardTitle>
                    <p className="text-gray-600">{plan.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-mint-500 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Benefits Section */}
          <section className="py-16 bg-white/50 rounded-3xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Use AI Study Planning?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Experience the benefits of intelligent study scheduling and time management
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle className="h-5 w-5 text-mint-500" />
                  </div>
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Integration Section */}
          <section className="py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Seamless Integration</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Your study planner works together with all your learning tools
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-mint-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-mint-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Calendar Integration</h3>
                    <p className="text-gray-600">Sync with your existing calendar apps</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-mint-500" />
                    <span className="text-gray-700">Google Calendar sync</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-mint-500" />
                    <span className="text-gray-700">Automatic reminders</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-mint-500" />
                    <span className="text-gray-700">Conflict detection</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-mint-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-mint-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Study Tools Integration</h3>
                    <p className="text-gray-600">Connect with flashcards, quizzes, and notes</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-mint-500" />
                    <span className="text-gray-700">Flashcard scheduling</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-mint-500" />
                    <span className="text-gray-700">Quiz planning</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-mint-500" />
                    <span className="text-gray-700">Note review sessions</span>
                  </li>
                </ul>
              </Card>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 text-center">
            <div className="bg-gradient-to-br from-mint-600 to-mint-700 rounded-3xl p-12 text-white">
              <h2 className="text-3xl font-bold mb-4">Ready to Plan Your Success?</h2>
              <p className="text-mint-100 mb-8 max-w-2xl mx-auto">
                Join students who've improved their study efficiency by 70% with AI-powered planning. Start free today.
              </p>
              <Button asChild size="lg" className="bg-white text-mint-700 hover:bg-mint-50">
                <Link to="/signup">
                  Create Your Study Plan
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default StudyPlannerPage;