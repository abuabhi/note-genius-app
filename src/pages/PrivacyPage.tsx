
import Layout from "@/components/layout/Layout";

const PrivacyPage = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-white via-mint-50/30 to-mint-50/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="prose prose-lg max-w-none">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
            <p className="text-gray-600 mb-8">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
                <p className="text-gray-700">
                  At PrepGenie, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our educational platform and services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
                <h3 className="text-xl font-medium text-gray-800 mb-3">Personal Information</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Name and email address when you create an account</li>
                  <li>Educational information such as school, grade level, and subjects</li>
                  <li>Profile information you choose to provide</li>
                  <li>Communication preferences and settings</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">Study Data</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Notes, flashcards, and other study materials you create</li>
                  <li>Study session data and progress tracking</li>
                  <li>Quiz results and performance analytics</li>
                  <li>Usage patterns and feature interactions</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">Technical Information</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>IP address and device information</li>
                  <li>Browser type and version</li>
                  <li>Usage logs and analytics data</li>
                  <li>Cookies and similar technologies</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Provide and maintain our educational services</li>
                  <li>Personalize your learning experience</li>
                  <li>Track your progress and provide analytics</li>
                  <li>Send important updates and notifications</li>
                  <li>Improve our platform and develop new features</li>
                  <li>Provide customer support</li>
                  <li>Ensure security and prevent fraud</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Sharing and Disclosure</h2>
                <p className="text-gray-700 mb-4">
                  We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>With your explicit consent</li>
                  <li>To comply with legal obligations</li>
                  <li>To protect our rights and prevent fraud</li>
                  <li>With trusted service providers who help us operate our platform</li>
                  <li>In case of business transfer or merger</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
                <p className="text-gray-700">
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security audits.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
                <p className="text-gray-700 mb-4">You have the right to:</p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate or incomplete data</li>
                  <li>Delete your account and associated data</li>
                  <li>Export your data in a portable format</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Object to certain data processing activities</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Retention</h2>
                <p className="text-gray-700">
                  We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy. When you delete your account, we will remove your personal data within 30 days, except where required by law.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Children's Privacy</h2>
                <p className="text-gray-700">
                  PrepGenie is designed for users 13 years and older. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it promptly.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">International Data Transfers</h2>
                <p className="text-gray-700">
                  Your information may be processed and stored in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this privacy policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Policy</h2>
                <p className="text-gray-700">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
                <p className="text-gray-700">
                  If you have any questions about this Privacy Policy or our data practices, please contact us at:
                </p>
                <div className="mt-4 p-4 bg-mint-50 rounded-lg">
                  <p className="text-gray-700">
                    <strong>Email:</strong> hello@prepgenie.io<br />
                    <strong>Subject:</strong> Privacy Policy Inquiry
                  </p>
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
