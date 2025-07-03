
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Separator } from '@/components/ui/separator';
import { Shield, Lock, Eye, Database, UserCheck, Mail } from 'lucide-react';

const PrivacyPage = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-xl shadow-sm border border-mint-100 p-8 md:p-12">
            <div className="text-center mb-12">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-mint-100 rounded-full">
                  <Shield className="h-8 w-8 text-mint-600" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
              <p className="text-lg text-gray-600">Last updated: December 2024</p>
            </div>

            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <div className="flex items-center mb-4">
                  <UserCheck className="h-6 w-6 text-mint-600 mr-3" />
                  <h2 className="text-2xl font-semibold text-gray-900">1. Information We Collect</h2>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We collect information you provide directly to us, such as when you create an account, 
                  use our services, or contact us for support.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Account information (name, email, password)</li>
                  <li>Study materials and notes you create</li>
                  <li>Usage data and learning progress</li>
                  <li>Device and browser information</li>
                  <li>Communication preferences</li>
                </ul>
              </section>

              <Separator className="my-8" />

              <section className="mb-8">
                <div className="flex items-center mb-4">
                  <Eye className="h-6 w-6 text-mint-600 mr-3" />
                  <h2 className="text-2xl font-semibold text-gray-900">2. How We Use Your Information</h2>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We use the information we collect to provide, maintain, and improve our services:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Provide and operate our study platform</li>
                  <li>Personalize your learning experience</li>
                  <li>Generate AI-powered study recommendations</li>
                  <li>Send important service updates and notifications</li>
                  <li>Analyze usage patterns to improve our service</li>
                  <li>Provide customer support</li>
                </ul>
              </section>

              <Separator className="my-8" />

              <section className="mb-8">
                <div className="flex items-center mb-4">
                  <Database className="h-6 w-6 text-mint-600 mr-3" />
                  <h2 className="text-2xl font-semibold text-gray-900">3. Information Sharing</h2>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We do not sell, trade, or otherwise transfer your personal information to third parties. 
                  We may share information in the following limited circumstances:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>With your explicit consent</li>
                  <li>To comply with legal obligations</li>
                  <li>To protect our rights and safety</li>
                  <li>With trusted service providers who assist in operating our platform</li>
                </ul>
              </section>

              <Separator className="my-8" />

              <section className="mb-8">
                <div className="flex items-center mb-4">
                  <Lock className="h-6 w-6 text-mint-600 mr-3" />
                  <h2 className="text-2xl font-semibold text-gray-900">4. Data Security</h2>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We implement industry-standard security measures to protect your information:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>SSL encryption for all data transmission</li>
                  <li>Secure database storage with encryption at rest</li>
                  <li>Regular security audits and updates</li>
                  <li>Access controls and authentication protocols</li>
                  <li>Regular data backups and recovery procedures</li>
                </ul>
              </section>

              <Separator className="my-8" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Your Rights and Choices</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Access and update your personal information</li>
                  <li>Delete your account and associated data</li>
                  <li>Opt out of non-essential communications</li>
                  <li>Request a copy of your data</li>
                  <li>Correct inaccurate information</li>
                </ul>
              </section>

              <Separator className="my-8" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cookies and Tracking</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We use cookies and similar technologies to enhance your experience and analyze usage patterns. 
                  You can control cookie settings through your browser preferences.
                </p>
              </section>

              <Separator className="my-8" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Children's Privacy</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Our service is not intended for children under 13. We do not knowingly collect personal information 
                  from children under 13. If we become aware that we have collected such information, we will take steps to delete it.
                </p>
              </section>

              <Separator className="my-8" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Changes to This Policy</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
                  the new Privacy Policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <Separator className="my-8" />

              <section className="mb-8">
                <div className="flex items-center mb-4">
                  <Mail className="h-6 w-6 text-mint-600 mr-3" />
                  <h2 className="text-2xl font-semibold text-gray-900">9. Contact Us</h2>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have any questions about this Privacy Policy, please contact us:
                </p>
                <div className="bg-mint-50 p-6 rounded-lg border border-mint-200">
                  <div className="space-y-2">
                    <p className="text-gray-700 font-medium">Email: hello@prepgenie.io</p>
                    <p className="text-gray-700">Subject: Privacy Policy Inquiry</p>
                    <p className="text-gray-700 text-sm mt-4">
                      We typically respond to privacy-related inquiries within 24-48 hours.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPage;
