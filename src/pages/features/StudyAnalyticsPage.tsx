import React from 'react';
import Layout from '@/components/layout/Layout';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageBreadcrumb } from '@/components/ui/page-breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { BarChart3, CheckCircle, ArrowRight, TrendingUp, Target, Clock, Award } from 'lucide-react';

const StudyAnalyticsPage = () => {
  const canonicalUrl = typeof window !== 'undefined' ? `${window.location.origin}/features/study-analytics` : undefined;

  const howToSteps = [
    {
      step: 1,
      title: "Study as Normal",
      description: "Use flashcards, quizzes, and notes - analytics track automatically",
      icon: BarChart3
    },
    {
      step: 2,
      title: "Data Collection",
      description: "AI analyzes your performance, time spent, and learning patterns",
      icon: TrendingUp
    },
    {
      step: 3,
      title: "Generate Insights",
      description: "Get personalized reports on strengths, weaknesses, and progress",
      icon: Target
    },
    {
      step: 4,
      title: "Optimize Learning",
      description: "Receive recommendations to improve your study efficiency",
      icon: Award
    }
  ];

  const analyticsFeatures = [
    {
      name: "Performance Tracking",
      description: "Monitor quiz scores, flashcard accuracy, and improvement trends",
      icon: TrendingUp,
      metrics: ["Quiz scores over time", "Accuracy rates", "Improvement velocity"]
    },
    {
      name: "Time Management",
      description: "Analyze study time distribution and optimize your schedule",
      icon: Clock,
      metrics: ["Daily study time", "Subject allocation", "Peak performance hours"]
    },
    {
      name: "Knowledge Mapping",
      description: "Visualize your mastery levels across topics and subjects",
      icon: Target,
      metrics: ["Mastery percentages", "Learning gaps", "Topic connections"]
    },
    {
      name: "Progress Reports",
      description: "Comprehensive reports showing your academic journey",
      icon: BarChart3,
      metrics: ["Weekly summaries", "Monthly progress", "Goal achievements"]
    }
  ];

  const benefits = [
    "Identify your strongest and weakest subjects instantly",
    "Optimize study time based on performance data",
    "Track learning velocity and retention rates",
    "Get personalized study recommendations",
    "Monitor progress toward academic goals",
    "Predict performance on upcoming exams"
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Study Analytics Dashboard - PrepGenie",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Advanced learning analytics to track study progress, identify strengths and weaknesses, and optimize your academic performance with data-driven insights.",
    "featureList": [
      "Performance tracking and trends",
      "Study time optimization",
      "Knowledge gap identification",
      "Progress forecasting",
      "Personalized recommendations",
      "Goal achievement monitoring"
    ],
    "screenshot": "/lovable-uploads/analytics-dashboard-demo.png",
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
    "name": "How to Use Study Analytics to Improve Academic Performance",
    "description": "Learn how to leverage learning analytics to track progress, identify weaknesses, and optimize your study strategy",
    "totalTime": "PT15M",
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
        "name": "Study Analytics",
        "item": canonicalUrl
      }
    ]
  };

  return (
    <Layout>
      <Helmet>
        <title>Study Analytics Dashboard - Track Learning Progress & Performance | PrepGenie</title>
        <meta name="description" content="Advanced learning analytics to track study progress, identify strengths and weaknesses, and optimize academic performance with data-driven insights." />
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
        <meta property="og:title" content="Study Analytics Dashboard - Track Learning Progress & Performance" />
        <meta property="og:description" content="Advanced learning analytics to track study progress, identify strengths and weaknesses, and optimize academic performance with data-driven insights." />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Study Analytics Dashboard - Track Learning Progress & Performance" />
        <meta name="twitter:description" content="Advanced learning analytics to track study progress, identify strengths and weaknesses, and optimize academic performance with data-driven insights." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PageBreadcrumb 
            pageName="Study Analytics" 
            pageIcon={<BarChart3 className="h-4 w-4" />}
            parentName="Features"
            parentPath="/features"
          />

          {/* Hero Section */}
          <div className="text-center py-16">
            <div className="inline-flex items-center gap-2 bg-mint-100 text-mint-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <BarChart3 className="h-4 w-4" />
              Data-Driven Learning
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Study Analytics Dashboard
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your study data into actionable insights. Track performance, identify learning gaps, and optimize your academic strategy with advanced analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-mint-600 hover:bg-mint-700">
                <Link to="/signup">
                  Start Tracking Progress Free
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
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How Study Analytics Work</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Get powerful insights into your learning patterns without any extra effort
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

          {/* Analytics Features Section */}
          <section className="py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Comprehensive Analytics Features</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Get detailed insights into every aspect of your learning journey
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {analyticsFeatures.map((feature, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-mint-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <feature.icon className="h-6 w-6 text-mint-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-xl mb-2">{feature.name}</h3>
                      <p className="text-gray-600 mb-4">{feature.description}</p>
                      <ul className="space-y-1">
                        {feature.metrics.map((metric, metricIndex) => (
                          <li key={metricIndex} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-mint-500 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{metric}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Benefits Section */}
          <section className="py-16 bg-white/50 rounded-3xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Use Study Analytics?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Make data-driven decisions to maximize your learning efficiency and academic success
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

          {/* Dashboard Preview */}
          <section className="py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Personal Learning Dashboard</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                See all your key metrics at a glance with beautiful, easy-to-understand visualizations
              </p>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="text-center p-6 bg-gradient-to-br from-mint-50 to-mint-100">
                <div className="text-3xl font-bold text-mint-700 mb-2">87%</div>
                <div className="text-mint-600 font-medium">Overall Accuracy</div>
                <div className="text-xs text-mint-500 mt-1">↑ 12% this week</div>
              </Card>
              <Card className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="text-3xl font-bold text-blue-700 mb-2">24h</div>
                <div className="text-blue-600 font-medium">Study Time</div>
                <div className="text-xs text-blue-500 mt-1">This week</div>
              </Card>
              <Card className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100">
                <div className="text-3xl font-bold text-purple-700 mb-2">15</div>
                <div className="text-purple-600 font-medium">Day Streak</div>
                <div className="text-xs text-purple-500 mt-1">Personal best!</div>
              </Card>
              <Card className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100">
                <div className="text-3xl font-bold text-orange-700 mb-2">92%</div>
                <div className="text-orange-600 font-medium">Goal Progress</div>
                <div className="text-xs text-orange-500 mt-1">On track</div>
              </Card>
            </div>
          </section>

          {/* Insights Section */}
          <section className="py-16 bg-white/50 rounded-3xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">AI-Powered Insights</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Get personalized recommendations based on your unique learning patterns
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-mint-100 to-mint-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-mint-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Smart Recommendations</h3>
                <p className="text-gray-600 text-sm">AI suggests the best times to study, review topics, and take breaks based on your performance patterns.</p>
              </Card>
              <Card className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-mint-100 to-mint-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-mint-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Weakness Detection</h3>
                <p className="text-gray-600 text-sm">Automatically identify topics that need more attention and get targeted practice recommendations.</p>
              </Card>
              <Card className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-mint-100 to-mint-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-mint-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Performance Prediction</h3>
                <p className="text-gray-600 text-sm">Forecast your likely performance on upcoming exams and get study plan adjustments.</p>
              </Card>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 text-center">
            <div className="bg-gradient-to-br from-mint-600 to-mint-700 rounded-3xl p-12 text-white">
              <h2 className="text-3xl font-bold mb-4">Ready to Optimize Your Learning?</h2>
              <p className="text-mint-100 mb-8 max-w-2xl mx-auto">
                Join students who've improved their academic performance by 40% using data-driven insights. Start tracking your progress today.
              </p>
              <Button asChild size="lg" className="bg-white text-mint-700 hover:bg-mint-50">
                <Link to="/signup">
                  Access Your Analytics Dashboard
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

export default StudyAnalyticsPage;