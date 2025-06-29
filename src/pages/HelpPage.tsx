
import Layout from "@/components/layout/Layout";
import { HelpFloatingButton } from "@/components/help/HelpFloatingButton";

const HelpPage = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Help & Support
              </h1>
              <p className="text-xl text-gray-600">
                Get the most out of PrepGenie with our comprehensive help resources
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4">Getting Started</h3>
                <p className="text-gray-600 mb-4">
                  Learn the basics of using PrepGenie for your studies
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Creating your first notes</li>
                  <li>• Setting up flashcard sets</li>
                  <li>• Taking quizzes</li>
                  <li>• Organizing your content</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4">Advanced Features</h3>
                <p className="text-gray-600 mb-4">
                  Discover powerful features to enhance your learning
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• AI-powered enhancements</li>
                  <li>• OCR scanning</li>
                  <li>• Collaboration tools</li>
                  <li>• Analytics insights</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4">Troubleshooting</h3>
                <p className="text-gray-600 mb-4">
                  Common issues and how to resolve them
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Login problems</li>
                  <li>• Sync issues</li>
                  <li>• Performance tips</li>
                  <li>• Browser compatibility</li>
                </ul>
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Can't find what you're looking for?
              </p>
              <a 
                href="/contact" 
                className="inline-block bg-mint-600 text-white px-6 py-3 rounded-lg hover:bg-mint-700 transition-colors"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
      <HelpFloatingButton />
    </Layout>
  );
};

export default HelpPage;
