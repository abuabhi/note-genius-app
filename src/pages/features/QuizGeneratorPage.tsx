import React from 'react';
import Layout from '@/components/layout/Layout';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageBreadcrumb } from '@/components/ui/page-breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Zap, CheckCircle, ArrowRight, FileText, Target, BarChart3, Clock } from 'lucide-react';

const QuizGeneratorPage = () => {
  const canonicalUrl = typeof window !== 'undefined' ? `${window.location.origin}/features/quiz-generator` : undefined;

  const howToSteps = [
    {
      step: 1,
      title: "Upload Study Material",
      description: "Import your notes, textbooks, or any study content you want to test",
      icon: FileText
    },
    {
      step: 2,
      title: "Choose Quiz Settings",
      description: "Select question types, difficulty level, and number of questions",
      icon: Target
    },
    {
      step: 3,
      title: "AI Generates Quiz",
      description: "Our AI creates comprehensive questions from your content automatically",
      icon: Zap
    },
    {
      step: 4,
      title: "Take & Analyze",
      description: "Complete the quiz and get detailed performance analytics",
      icon: BarChart3
    }
  ];

  const questionTypes = [
    "Multiple Choice Questions",
    "True/False Statements", 
    "Fill in the Blanks",
    "Short Answer Questions",
    "Essay Questions",
    "Matching Exercises"
  ];

  const benefits = [
    "Generate unlimited practice quizzes from any content",
    "Adaptive difficulty based on your performance",
    "Instant feedback with detailed explanations",
    "Progress tracking across all subjects",
    "Multiple question formats for comprehensive testing",
    "Automatic grading and performance analytics"
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "AI Quiz Generator - PrepGenie",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Generate practice quizzes from any study material using AI. Multiple question types, adaptive difficulty, and instant feedback for effective learning.",
    "featureList": [
      "AI-powered quiz generation",
      "Multiple question formats",
      "Adaptive difficulty adjustment",
      "Instant feedback and explanations",
      "Performance analytics",
      "Unlimited quiz creation"
    ],
    "screenshot": "/lovable-uploads/quiz-generator-demo.png",
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
    "name": "How to Create Practice Quizzes with AI",
    "description": "Learn how to automatically generate comprehensive practice quizzes from your study materials using artificial intelligence",
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
        "name": "Quiz Generator",
        "item": canonicalUrl
      }
    ]
  };

  return (
    <Layout>
      <Helmet>
        <title>AI Quiz Generator - Create Practice Tests from Any Content | PrepGenie</title>
        <meta name="description" content="Generate unlimited practice quizzes from your study materials using AI. Multiple question types, adaptive difficulty, instant feedback, and detailed analytics." />
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
        <meta property="og:title" content="AI Quiz Generator - Create Practice Tests from Any Content" />
        <meta property="og:description" content="Generate unlimited practice quizzes from your study materials using AI. Multiple question types, adaptive difficulty, instant feedback, and detailed analytics." />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Quiz Generator - Create Practice Tests from Any Content" />
        <meta name="twitter:description" content="Generate unlimited practice quizzes from your study materials using AI. Multiple question types, adaptive difficulty, instant feedback, and detailed analytics." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PageBreadcrumb 
            pageName="Quiz Generator" 
            pageIcon={<Zap className="h-4 w-4" />}
            parentName="Features"
            parentPath="/features"
          />

          {/* Hero Section */}
          <div className="text-center py-16">
            <div className="inline-flex items-center gap-2 bg-mint-100 text-mint-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              AI-Powered Testing
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              AI Quiz Generator
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform any study material into comprehensive practice quizzes instantly. Our AI creates diverse question types with adaptive difficulty and detailed feedback.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-mint-600 hover:bg-mint-700">
                <Link to="/signup">
                  Generate Your First Quiz Free
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
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How to Generate AI Quizzes</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Create comprehensive practice tests from any study material in minutes
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

          {/* Question Types Section */}
          <section className="py-16 bg-white/50 rounded-3xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Diverse Question Types</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our AI creates multiple question formats to thoroughly test your knowledge
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {questionTypes.map((type, index) => (
                <Card key={index} className="text-center p-6">
                  <div className="w-12 h-12 bg-mint-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-6 w-6 text-mint-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{type}</h3>
                </Card>
              ))}
            </div>
          </section>

          {/* Benefits Section */}
          <section className="py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose AI Quiz Generation?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Experience the advantages of intelligent quiz creation and assessment
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
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Traditional vs AI Quiz Creation</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-700">Manual Quiz Creation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-gray-600">Hours of question writing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-gray-600">Limited question variety</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-gray-600">Manual grading required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-gray-600">No adaptive difficulty</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-mint-200 bg-mint-50/50">
                <CardHeader>
                  <CardTitle className="text-mint-700 flex items-center gap-2">
                    <Badge className="bg-mint-100 text-mint-700">AI-Powered</Badge>
                    AI Quiz Generator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-mint-500" />
                    <span className="text-gray-700">Generated in seconds</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-mint-500" />
                    <span className="text-gray-700">Multiple question formats</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-mint-500" />
                    <span className="text-gray-700">Automatic grading & feedback</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-mint-500" />
                    <span className="text-gray-700">Adaptive difficulty system</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Analytics Section */}
          <section className="py-16 bg-white/50 rounded-3xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Advanced Analytics</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Get detailed insights into your learning progress and performance
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center p-6">
                <div className="w-12 h-12 bg-mint-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-6 w-6 text-mint-600" />
                </div>
                <h3 className="font-semibold mb-2">Performance Tracking</h3>
                <p className="text-gray-600 text-sm">Monitor your quiz scores and improvement over time</p>
              </Card>
              <Card className="text-center p-6">
                <div className="w-12 h-12 bg-mint-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-mint-600" />
                </div>
                <h3 className="font-semibold mb-2">Weak Areas</h3>
                <p className="text-gray-600 text-sm">Identify topics that need more study attention</p>
              </Card>
              <Card className="text-center p-6">
                <div className="w-12 h-12 bg-mint-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-mint-600" />
                </div>
                <h3 className="font-semibold mb-2">Study Time</h3>
                <p className="text-gray-600 text-sm">Track time spent on each subject and topic</p>
              </Card>
              <Card className="text-center p-6">
                <div className="w-12 h-12 bg-mint-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-mint-600" />
                </div>
                <h3 className="font-semibold mb-2">Mastery Levels</h3>
                <p className="text-gray-600 text-sm">See your mastery progress for each topic</p>
              </Card>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 text-center">
            <div className="bg-gradient-to-br from-mint-600 to-mint-700 rounded-3xl p-12 text-white">
              <h2 className="text-3xl font-bold mb-4">Ready to Test Your Knowledge?</h2>
              <p className="text-mint-100 mb-8 max-w-2xl mx-auto">
                Join thousands of students who've improved their test performance with AI-generated quizzes. Start practicing today.
              </p>
              <Button asChild size="lg" className="bg-white text-mint-700 hover:bg-mint-50">
                <Link to="/signup">
                  Generate Your First Quiz
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

export default QuizGeneratorPage;