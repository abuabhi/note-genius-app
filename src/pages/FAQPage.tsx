
import Layout from "@/components/layout/Layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQPage = () => {
  const faqs = [
    {
      question: "What is StudyAI?",
      answer: "StudyAI is an intelligent learning platform that uses artificial intelligence to personalize your educational experience. Our platform adapts to your learning style, identifies knowledge gaps, and provides customized study materials to help you master any subject more efficiently."
    },
    {
      question: "How does the AI personalization work?",
      answer: "Our AI analyzes your study patterns, quiz results, and learning pace to create a personalized learning path. It identifies strengths and weaknesses in real-time and adjusts content difficulty accordingly. The more you use StudyAI, the better it gets at customizing your learning experience."
    },
    {
      question: "Which subjects does StudyAI cover?",
      answer: "StudyAI currently covers mathematics, sciences, languages, history, and programming. We're continuously expanding our subject library based on user feedback and demands."
    },
    {
      question: "Can I use StudyAI for test preparation?",
      answer: "Absolutely! StudyAI is excellent for standardized test prep, including SAT, ACT, GRE, GMAT, and subject-specific exams. Our platform includes practice tests, timed quizzes, and personalized study plans designed specifically for test preparation."
    },
    {
      question: "Is StudyAI suitable for different education levels?",
      answer: "Yes, StudyAI supports learners from high school through university and professional development. The platform automatically adjusts content complexity based on your education level and learning goals."
    },
    {
      question: "Can I track my progress over time?",
      answer: "Yes, StudyAI provides detailed analytics that track your progress across subjects, including mastery levels, study time, improvement rates, and recommended focus areas. You can view your progress through intuitive dashboards and detailed reports."
    },
    {
      question: "Do you offer group or classroom features?",
      answer: "Yes, our Teams plan includes collaborative features for study groups, classes, and educational institutions. Instructors can track group progress, assign specific materials, and identify common areas where students might need additional support."
    },
    {
      question: "What devices can I use StudyAI on?",
      answer: "StudyAI works on any device with an internet connection, including computers, tablets, and smartphones. Our responsive design ensures a seamless experience across all devices, and you can switch between devices while maintaining your progress."
    },
    {
      question: "How secure is my data with StudyAI?",
      answer: "We take data security seriously. All personal information and study data is encrypted and stored securely. We adhere to strict privacy policies and never sell user data to third parties. You can review our complete privacy policy for more details."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time. If you cancel, you'll continue to have access to your plan features until the end of your current billing period. There are no cancellation fees or hidden charges."
    }
  ];

  return (
    <Layout>
      <div className="bg-gradient-to-b from-white via-mint-50/30 to-mint-50/10">
        {/* FAQ Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              Frequently Asked Questions
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
              Find answers to the most common questions about StudyAI
            </p>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="bg-gradient-to-b from-mint-50/10 via-white to-mint-50/20 py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <Accordion type="single" collapsible className="space-y-6">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-white rounded-lg shadow-sm border border-mint-100"
                >
                  <AccordionTrigger className="px-6 py-4 text-lg font-medium text-left text-gray-900 hover:text-mint-700">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 pt-2 text-gray-600">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* Still Have Questions */}
        <div className="bg-gradient-to-b from-mint-50/20 via-white to-mint-50/30 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Still Have Questions?</h2>
            <p className="mt-4 text-xl text-gray-500">
              Our support team is here to help
            </p>
            <div className="mt-10 flex justify-center gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-mint-100 w-full max-w-md">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Support</h3>
                <p className="text-gray-600 mb-6">
                  Get personalized help from our customer support team
                </p>
                <a 
                  href="/contact" 
                  className="inline-block px-6 py-3 bg-mint-600 text-white rounded-md hover:bg-mint-700 transition-colors"
                >
                  Contact Us
                </a>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-mint-100 w-full max-w-md">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Browse Resources</h3>
                <p className="text-gray-600 mb-6">
                  Explore our guides, tutorials and knowledge base
                </p>
                <a 
                  href="#" 
                  className="inline-block px-6 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
                >
                  Visit Resources
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FAQPage;
