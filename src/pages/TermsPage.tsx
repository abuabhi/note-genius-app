
import Layout from "@/components/layout/Layout";

const TermsPage = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-white via-mint-50/30 to-mint-50/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="prose prose-lg max-w-none">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
            <p className="text-gray-600 mb-8">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Agreement to Terms</h2>
                <p className="text-gray-700">
                  By accessing and using PrepGenie, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Description of Service</h2>
                <p className="text-gray-700">
                  PrepGenie is an AI-powered educational platform that helps students create, organize, and study their notes and learning materials. Our services include note-taking tools, flashcard creation, study analytics, and various AI-enhanced learning features.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Accounts</h2>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>You must be at least 13 years old to create an account</li>
                  <li>You are responsible for maintaining the confidentiality of your account</li>
                  <li>You are responsible for all activities that occur under your account</li>
                  <li>You must provide accurate and complete information when creating your account</li>
                  <li>You must notify us immediately of any unauthorized use of your account</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acceptable Use</h2>
                <p className="text-gray-700 mb-4">You agree not to use PrepGenie to:</p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on the intellectual property rights of others</li>
                  <li>Upload harmful, offensive, or inappropriate content</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with or disrupt our services</li>
                  <li>Create multiple accounts to evade restrictions</li>
                  <li>Share copyrighted materials without permission</li>
                  <li>Use our service for commercial purposes without authorization</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Content and Intellectual Property</h2>
                <h3 className="text-xl font-medium text-gray-800 mb-3">Your Content</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>You retain ownership of the content you create and upload</li>
                  <li>You grant us a license to use your content to provide our services</li>
                  <li>You are responsible for ensuring you have the right to share any content you upload</li>
                  <li>You must not upload copyrighted materials without proper authorization</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">Our Content</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>PrepGenie and all related content are protected by intellectual property laws</li>
                  <li>You may not copy, modify, or distribute our content without permission</li>
                  <li>Our AI-generated suggestions and enhancements remain our intellectual property</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Privacy</h2>
                <p className="text-gray-700">
                  Your privacy is important to us. Please review our Privacy Policy, which also governs your use of PrepGenie, to understand our practices regarding the collection and use of your information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Subscription and Payments</h2>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Some features require a paid subscription</li>
                  <li>Subscription fees are billed in advance</li>
                  <li>You can cancel your subscription at any time</li>
                  <li>Refunds are provided according to our refund policy</li>
                  <li>We reserve the right to change pricing with notice</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Service Availability</h2>
                <p className="text-gray-700">
                  While we strive to provide reliable service, we do not guarantee that PrepGenie will be available at all times. We may experience downtime for maintenance, updates, or unforeseen circumstances. We are not liable for any losses resulting from service interruptions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
                <p className="text-gray-700">
                  To the fullest extent permitted by law, PrepGenie shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Termination</h2>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>You may terminate your account at any time</li>
                  <li>We may terminate or suspend your account for violations of these terms</li>
                  <li>Upon termination, your access to the service will cease immediately</li>
                  <li>We will retain your data according to our data retention policy</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to Terms</h2>
                <p className="text-gray-700">
                  We reserve the right to modify these terms at any time. We will notify users of any changes by posting the new terms on this page and updating the "Last updated" date. Your continued use of PrepGenie after changes constitute acceptance of the new terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Governing Law</h2>
                <p className="text-gray-700">
                  These terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law provisions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
                <p className="text-gray-700">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="mt-4 p-4 bg-mint-50 rounded-lg">
                  <p className="text-gray-700">
                    <strong>Email:</strong> hello@prepgenie.io<br />
                    <strong>Subject:</strong> Terms of Service Inquiry
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

export default TermsPage;
