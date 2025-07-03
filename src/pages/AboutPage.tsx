
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
              <span className="block">About PrepGenie</span>
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
            
            <div className="max-w-4xl mx-auto">
              {/* Origin Story */}
              <div className="mb-12">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">The Spark That Started It All</h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  In late 2022, Abhinav Sharma was watching his daughter Alaysa struggle through endless hours of note-taking for her pre-med courses. 
                  Despite being a brilliant student, Alaysa was drowning in unorganized notes, spending more time searching for information than actually learning. 
                  That's when he asked himself: <span className="font-medium text-mint-700">"What if AI could help students study smarter, not harder?"</span>
                </p>
                
                <div className="bg-mint-50 border-l-4 border-mint-500 p-6 rounded-r-lg mb-8">
                  <p className="text-gray-700 italic">
                    "I watched my daughter highlight the same textbook page five times because she couldn't find her previous notes. 
                    That moment made me realize we needed to revolutionize how students interact with their study materials."
                  </p>
                  <p className="text-mint-700 font-medium mt-2">- Abhinav Sharma, CEO & Founder</p>
                </div>
              </div>

              {/* Key Milestones */}
              <div className="mb-12">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">From Idea to Impact</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-mint-100 rounded-full flex items-center justify-center">
                      <span className="text-mint-700 font-bold">2023</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">The Foundation</h4>
                      <p className="text-gray-700">
                        Assembled a team of 3 educators and 2 AI engineers. Built our first prototype with basic note enhancement capabilities. 
                        Tested with 50 university students who showed a 40% improvement in study efficiency.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-mint-100 rounded-full flex items-center justify-center">
                      <span className="text-mint-700 font-bold">2024</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Rapid Growth</h4>
                      <p className="text-gray-700">
                        Launched AI-powered flashcard generation and intelligent study chat. Grew from 50 to 15,000+ active students. 
                        Students reported average GPA improvements of 0.7 points within their first semester.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Impact Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="text-center bg-white p-6 rounded-lg shadow-sm border border-mint-100">
                  <div className="text-3xl font-bold text-mint-600 mb-2">15,000+</div>
                  <div className="text-gray-600">Active Students</div>
                </div>
                <div className="text-center bg-white p-6 rounded-lg shadow-sm border border-mint-100">
                  <div className="text-3xl font-bold text-mint-600 mb-2">2.3M+</div>
                  <div className="text-gray-600">Notes Enhanced</div>
                </div>
                <div className="text-center bg-white p-6 rounded-lg shadow-sm border border-mint-100">
                  <div className="text-3xl font-bold text-mint-600 mb-2">89%</div>
                  <div className="text-gray-600">Report Better Grades</div>
                </div>
              </div>

              {/* Current Mission */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">What Drives Us Today</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Every feature we build starts with a real student problem. Our AI doesn't just organize notes—it understands learning patterns, 
                  identifies knowledge gaps, and creates personalized study paths. We've helped students transform chaotic study sessions into 
                  structured, effective learning experiences.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  From our intelligent note enhancement that turns messy handwriting into structured summaries, to our AI chat that answers 
                  questions about your specific study materials, PrepGenie has become the study companion that adapts to each student's unique way of learning.
                </p>
              </div>

              {/* Future Vision */}
              <div className="bg-gradient-to-r from-mint-50 to-blue-50 p-8 rounded-xl border border-mint-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Looking Ahead</h3>
                <p className="text-gray-700 leading-relaxed">
                  We're building toward a future where every student has a personalized AI tutor that understands their learning style, 
                  tracks their progress, and guides them toward academic success. Our vision is simple: make high-quality, personalized education 
                  accessible to every student, anywhere in the world.
                </p>
              </div>
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
              Experience the future of education today with PrepGenie's personalized learning platform.
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
