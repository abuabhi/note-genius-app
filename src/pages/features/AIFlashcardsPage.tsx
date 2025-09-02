import React from 'react';
import Layout from '@/components/layout/Layout';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageBreadcrumb } from '@/components/ui/page-breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Brain, CheckCircle, ArrowRight, Zap, Clock, Target, BarChart3 } from 'lucide-react';

const AIFlashcardsPage = () => {
  const canonicalUrl = typeof window !== 'undefined' ? `${window.location.origin}/features/ai-flashcards` : undefined;

  const howToSteps = [
    {
      step: 1,
      title: "Upload Your Notes",
      description: "Import your study materials - type, upload PDFs, or scan handwritten notes",
      icon: Brain
    },
    {
      step: 2,
      title: "AI Analyzes Content",
      description: "Our AI identifies key concepts, terms, and relationships in your material",
      icon: Zap
    },
    {
      step: 3,
      title: "Generate Smart Flashcards",
      description: "Get professionally formatted flashcards with optimal question-answer pairs",
      icon: Target
    },
    {
      step: 4,
      title: "Study with Spaced Repetition",
      description: "Review at scientifically optimized intervals for maximum retention",
      icon: Clock
    }
  ];

  const benefits = [
    "Save 90% of time creating flashcards manually",
    "Improve retention with AI-optimized content",
    "Automatic difficulty adjustment based on performance",
    "Smart scheduling with spaced repetition",
    "Multi-format support (text, PDFs, images)",
    "Instant generation from any study material"
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "AI Flashcard Generator - PrepGenie",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Transform your study notes into smart flashcards automatically using AI. Features spaced repetition, difficulty adjustment, and multi-format support.",
    "featureList": [
      "AI-powered flashcard generation",
      "Spaced repetition system",
      "Automatic difficulty adjustment",
      "Multi-format content support",
      "Performance tracking",
      "Smart review scheduling"
    ],
    "screenshot": "/lovable-uploads/flashcard-demo.png",
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
    "name": "How to Create AI Flashcards for Studying",
    "description": "Learn how to automatically generate smart flashcards from your study notes using AI technology",
    "totalTime": "PT5M",
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
        "name": "AI Flashcards",
        "item": canonicalUrl
      }
    ]
  };

  return (
    <Layout>
      <Helmet>
        <title>AI Flashcard Generator - Create Smart Study Cards Instantly | PrepGenie</title>
        <meta name="description" content="Transform any study material into smart flashcards with AI. Features spaced repetition, difficulty adjustment, and instant generation from notes, PDFs, and images." />
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
        <meta property="og:title" content="AI Flashcard Generator - Create Smart Study Cards Instantly" />
        <meta property="og:description" content="Transform any study material into smart flashcards with AI. Features spaced repetition, difficulty adjustment, and instant generation from notes, PDFs, and images." />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Flashcard Generator - Create Smart Study Cards Instantly" />
        <meta name="twitter:description" content="Transform any study material into smart flashcards with AI. Features spaced repetition, difficulty adjustment, and instant generation from notes, PDFs, and images." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PageBreadcrumb 
            pageName="AI Flashcards" 
            pageIcon={<Brain className="h-4 w-4" />}
            parentName="Features"
            parentPath="/features"
          />

          {/* Hero Section */}
          <div className="text-center py-16">
            <div className="inline-flex items-center gap-2 bg-mint-100 text-mint-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Brain className="h-4 w-4" />
              AI-Powered Study Tool
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              AI Flashcard Generator
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your study notes into smart flashcards automatically. Our AI analyzes your content and creates optimized question-answer pairs with spaced repetition scheduling.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-mint-600 hover:bg-mint-700">
                <Link to="/signup">
                  Start Creating Flashcards Free
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
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How to Create AI Flashcards</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Generate professional flashcards from any study material in minutes, not hours
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

          {/* Benefits Section */}
          <section className="py-16 bg-white/50 rounded-3xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose AI Flashcards?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Experience the power of AI-enhanced studying with features designed for maximum retention
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

          {/* Features Comparison */}
          <section className="py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Manual vs AI Flashcards</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-700">Manual Creation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-gray-600">Hours of manual work</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-gray-600">Inconsistent quality</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-gray-600">No optimization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-gray-600">Fixed review schedule</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-mint-200 bg-mint-50/50">
                <CardHeader>
                  <CardTitle className="text-mint-700 flex items-center gap-2">
                    <Badge className="bg-mint-100 text-mint-700">AI-Powered</Badge>
                    AI Flashcards
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-mint-500" />
                    <span className="text-gray-700">Generated in seconds</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-mint-500" />
                    <span className="text-gray-700">Professionally optimized</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-mint-500" />
                    <span className="text-gray-700">Performance-based difficulty</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-mint-500" />
                    <span className="text-gray-700">Smart spaced repetition</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 text-center">
            <div className="bg-gradient-to-br from-mint-600 to-mint-700 rounded-3xl p-12 text-white">
              <h2 className="text-3xl font-bold mb-4">Ready to Study Smarter?</h2>
              <p className="text-mint-100 mb-8 max-w-2xl mx-auto">
                Join thousands of students who've transformed their study routine with AI flashcards. Get started free today.
              </p>
              <Button asChild size="lg" className="bg-white text-mint-700 hover:bg-mint-50">
                <Link to="/signup">
                  Create Your First AI Flashcards
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

export default AIFlashcardsPage;