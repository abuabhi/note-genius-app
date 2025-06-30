
import React from 'react';
import Layout from '@/components/layout/Layout';
import Features from '@/components/landing/Features';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

const FeaturesPage = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-blue-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-mint-500/10 to-blue-500/10 backdrop-blur-3xl"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
            <div className="text-center">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-mint-100 to-blue-100 rounded-full text-mint-700 text-sm mb-8 shadow-lg">
                <Sparkles className="w-4 h-4 mr-2" />
                Complete Study Solution
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Everything you need to
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-mint-600 to-blue-600">
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
                  className="bg-gradient-to-r from-mint-600 to-mint-700 hover:from-mint-700 hover:to-mint-800 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
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
                  className="border-2 border-mint-300 text-mint-700 hover:bg-mint-50 px-8 py-3 text-lg shadow-md hover:shadow-lg transition-all duration-200"
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

        {/* Features Section */}
        <Features />

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
