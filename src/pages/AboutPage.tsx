
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const AboutPage = () => {
  return (
    <Layout>
      <div className="bg-gradient-to-b from-white via-mint-50/30 to-mint-50/10">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">About StudyAI</span>
              <span className="block text-mint-600">Transforming Education</span>
            </h1>
            <p className="mt-6 max-w-xl mx-auto text-lg text-gray-500">
              We're on a mission to make learning more accessible, personalized, and effective through the power of artificial intelligence.
            </p>
          </div>
        </div>

        {/* Our Story Section */}
        <div className="bg-gradient-to-b from-mint-50/10 via-white to-mint-50/20 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900">Our Story</h2>
              <div className="mt-2 h-1 w-20 bg-mint-500 mx-auto"></div>
            </div>
            <div className="prose prose-lg mx-auto">
              <p>
                Founded in 2023, StudyAI began with a simple question: How can we use AI to make learning more personal and effective?
              </p>
              <p>
                Our team of educators and AI specialists came together to create a platform that adapts to the unique learning style of each student, providing personalized guidance and support at every step of their educational journey.
              </p>
              <p>
                Today, StudyAI serves thousands of students worldwide, helping them achieve their academic goals with the support of cutting-edge artificial intelligence.
              </p>
            </div>
          </div>
        </div>

        {/* Our Values Section */}
        <div className="bg-gradient-to-b from-mint-50/20 via-white to-mint-50/30 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900">Our Values</h2>
              <div className="mt-2 h-1 w-20 bg-mint-500 mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-white rounded-lg shadow-sm border border-mint-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Accessibility</h3>
                <p className="text-gray-600">
                  We believe quality education should be available to everyone, regardless of location or background.
                </p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-sm border border-mint-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Innovation</h3>
                <p className="text-gray-600">
                  We continuously explore new ways to use technology to enhance the learning experience.
                </p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-sm border border-mint-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Effectiveness</h3>
                <p className="text-gray-600">
                  We design our platform with proven educational methods to ensure actual learning outcomes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-b from-mint-50/30 to-mint-100/50 py-24">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Join Our Journey</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the future of education today with StudyAI's personalized learning platform.
            </p>
            <div className="mt-8">
              <Button size="lg" className="bg-mint-600 hover:bg-mint-700">
                <Link to="/signup" className="text-white">
                  Get Started Free
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;
