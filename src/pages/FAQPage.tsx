
import { Helmet } from 'react-helmet';
import Layout from '@/components/layout/Layout';

const FAQPage = () => {
  const faqs = [
    // Getting Started
    {
      id: 1,
      category: "Getting Started",
      question: "How do I create my first note?",
      answer: "Click the 'Add Note' button on your notes page, then choose from manual entry, scanning a document with OCR, or importing from a file. Fill in the title, content, and select a subject to organize your note."
    },
    {
      id: 2,
      category: "Getting Started",
      question: "How do I create flashcards?",
      answer: "You can create flashcards manually from the flashcards page, or convert existing notes into flashcards using our AI-powered conversion tool. Simply select a note and choose 'Convert to Flashcards' from the actions menu."
    },
    {
      id: 3,
      category: "Getting Started",
      question: "What's the best way to get started with PrepGenie?",
      answer: "Start by creating your first note, either manually or by importing content. Explore the AI enhancement features to improve your notes, then convert them to flashcards for studying. Set up study reminders and begin tracking your progress."
    },

    // Subscription & Pricing
    {
      id: 4,
      category: "Subscription & Pricing",
      question: "Which plan is right for me?",
      answer: "Scholar (Free) is great to explore core features with basic limits. Graduate adds larger limits and AI enhancements for regular study. Master unlocks the highest limits, priority support, and advanced features for power users."
    },
    {
      id: 5,
      category: "Subscription & Pricing",
      question: "How do I upgrade my account?",
      answer: "Go to your account settings and click 'Upgrade Plan' or use the upgrade prompts when you approach tier limits. You can choose between monthly and yearly billing, with yearly plans offering a 20% discount."
    },
    {
      id: 6,
      category: "Subscription & Pricing",
      question: "Can I switch between monthly and yearly billing?",
      answer: "Yes. You can upgrade/downgrade or switch billing frequency anytime from the customer portal in your account settings. Changes apply immediately or at the next billing cycle depending on your current plan."
    },
    {
      id: 7,
      category: "Subscription & Pricing",
      question: "Do you offer refunds or trials?",
      answer: "We don't generally offer refunds once a billing period starts, but you can cancel anytime to stop future renewals. Promotional trials or coupons may apply occasionally. Contact support for special circumstances."
    },
    {
      id: 8,
      category: "Subscription & Pricing",
      question: "What payment methods are supported?",
      answer: "Major debit and credit cards are supported through our secure payment processor. Taxes may be added based on your location. All payments are processed securely with industry-standard encryption."
    },
    {
      id: 9,
      category: "Subscription & Pricing",
      question: "How much does PrepGenie cost?",
      answer: "Scholar tier is completely free. Graduate tier starts at affordable monthly rates with annual discounts available. Master tier offers premium features at competitive pricing. Visit our pricing page for current rates and detailed feature comparison."
    },

    // Tier Limits & Usage
    {
      id: 10,
      category: "Tier Limits & Usage",
      question: "What limits are included in each plan?",
      answer: "Each tier includes limits for notes, flashcard sets, cards per set, storage, AI enhancements/generations, and various features. Scholar: 10 notes, 5 flashcard sets. Graduate: 100 notes, 25 sets. Master: 250 notes, 50 sets. Dean: unlimited. See your account page for detailed limits."
    },
    {
      id: 11,
      category: "Tier Limits & Usage",
      question: "When do my monthly limits reset?",
      answer: "Monthly usage counters (like AI enhancements) reset on your billing renewal date. We'll show your renewal date in-app and send notifications as you approach limits. Storage and content limits don't reset but increase with upgrades."
    },
    {
      id: 12,
      category: "Tier Limits & Usage",
      question: "What happens if I hit a limit?",
      answer: "Actions pause for that feature (e.g., AI enhancements or new note creation) and the system explains why. You can free up usage by deleting content or upgrade anytime to increase limits. Essential features remain accessible."
    },
    {
      id: 13,
      category: "Tier Limits & Usage",
      question: "Do unused limits roll over?",
      answer: "No, unused monthly quotas (like AI generations) don't roll over. They refresh on your renewal date. However, storage space and content limits are cumulative - they don't reset but increase when you upgrade."
    },
    {
      id: 14,
      category: "Tier Limits & Usage",
      question: "How can I track my usage?",
      answer: "View your current usage and limits in the account section or user tier display. The system shows progress bars for notes, flashcard sets, storage, and monthly AI usage. Notifications appear when approaching limits."
    },
    {
      id: 15,
      category: "Tier Limits & Usage",
      question: "What are AI enhancement limits?",
      answer: "AI enhancement limits control how many times per month you can use features like grammar correction, summarization, and content improvement. Scholar: 10/month, Graduate: 50/month, Master: 200/month, Dean: unlimited."
    },

    // Account Management
    {
      id: 16,
      category: "Account Management",
      question: "How do I cancel my subscription?",
      answer: "Open the customer portal from your account settings to manage or cancel your subscription. You'll retain access until the end of your current billing period, then automatically return to the free Scholar tier."
    },
    {
      id: 17,
      category: "Account Management",
      question: "How do I update my payment information?",
      answer: "Access the customer portal through your account settings to update payment methods, billing information, and view invoice history. Changes take effect immediately for future billing cycles."
    },
    {
      id: 18,
      category: "Account Management",
      question: "Can I change my plan anytime?",
      answer: "Yes! You can upgrade or downgrade anytime through your account settings. Upgrades take effect immediately, while downgrades typically apply at your next billing cycle to preserve your current benefits."
    },
    {
      id: 19,
      category: "Account Management",
      question: "What happens when I downgrade?",
      answer: "Your content remains accessible, but you'll be subject to the new tier's limits. If you exceed limits (e.g., more notes than allowed), you can still view existing content but may need to delete items to create new ones."
    },

    // AI Features
    {
      id: 20,
      category: "AI Features",
      question: "What AI features are available?",
      answer: "PrepGenie offers AI-powered note enhancement (grammar correction, summarization, key points extraction), AI chat with your notes for interactive studying, automatic flashcard generation from notes, and content optimization."
    },
    {
      id: 21,
      category: "AI Features",
      question: "How does the AI note chat work?",
      answer: "AI note chat allows interactive conversations about your notes. Ask questions about content, request explanations, generate practice questions, or get study suggestions. Access it from the chat icon when viewing a note."
    },
    {
      id: 22,
      category: "AI Features",
      question: "What AI enhancements are available for my notes?",
      answer: "AI enhancements include grammar and spelling correction, content summarization, key points extraction, study guide generation, and formatting improvements. Premium users get access to advanced AI models for more sophisticated enhancements."
    },
    {
      id: 23,
      category: "AI Features",
      question: "How accurate is the AI-generated content?",
      answer: "Our AI features use advanced language models and are highly accurate for grammar, formatting, and content organization. However, always review AI-generated content for context and accuracy, especially for academic or professional use."
    },
    {
      id: 24,
      category: "AI Features",
      question: "Are AI features available on all tiers?",
      answer: "Basic AI features are available on all tiers with different monthly limits. Scholar gets 10 AI enhancements/month, Graduate gets 50, Master gets 200, and Dean has unlimited access. Some advanced features require premium tiers."
    },

    // Notes & Flashcards
    {
      id: 25,
      category: "Notes & Flashcards",
      question: "What file formats can I import?",
      answer: "You can import PDF files, Word documents (.docx), and plain text files. Additionally, use our OCR scanning feature to capture text from images or physical documents using your camera."
    },
    {
      id: 26,
      category: "Notes & Flashcards",
      question: "How does OCR scanning work?",
      answer: "OCR (Optical Character Recognition) scanning lets you capture text from images or physical documents. Use your camera to take a photo, and our system will extract the text automatically. Multiple languages are supported with image enhancement for better accuracy."
    },
    {
      id: 27,
      category: "Notes & Flashcards",
      question: "Can I organize my content?",
      answer: "Yes! Use subjects to categorize your notes and flashcards by topic (e.g., Math, History, Science). Add tags for detailed organization, and use the search function to quickly find specific content."
    },
    {
      id: 28,
      category: "Notes & Flashcards",
      question: "How do I convert notes to flashcards?",
      answer: "Select a note and choose 'Convert to Flashcards' from the actions menu. Our AI will automatically create flashcards from key concepts, or you can manually create them. Review and edit the generated cards as needed."
    },
    {
      id: 29,
      category: "Notes & Flashcards",
      question: "Can I search through my notes?",
      answer: "Yes, use the search bar to find notes by title, content, subject, or tags. You can also filter notes by date, subject, source type, and other criteria to quickly locate what you need."
    },

    // Study Tools & Sessions
    {
      id: 30,
      category: "Study Tools & Sessions",
      question: "How do I study with flashcards?",
      answer: "Select a flashcard set and choose your study mode. You can study in order or randomly, mark cards as easy/hard to adjust review frequency, and track your progress. The system uses spaced repetition to optimize learning."
    },
    {
      id: 31,
      category: "Study Tools & Sessions",
      question: "What study modes are available?",
      answer: "Available study modes include flashcard review, quiz taking, note reading with AI chat assistance, and timed study sessions. Each mode is designed to help you learn and retain information effectively."
    },
    {
      id: 32,
      category: "Study Tools & Sessions",
      question: "Can I track my study sessions?",
      answer: "Yes! Start a study session from your dashboard or notes page to track your study time. The system records session duration, subjects studied, and provides analytics to help you understand your study patterns and progress."
    },
    {
      id: 33,
      category: "Study Tools & Sessions",
      question: "How do study analytics work?",
      answer: "Study analytics track your daily and weekly study time, show progress by subject, identify your most productive study periods, and provide insights into your learning patterns. Access detailed analytics from your dashboard."
    },
    {
      id: 34,
      category: "Study Tools & Sessions",
      question: "Can I set study goals?",
      answer: "Yes! Create study goals with target study hours, deadlines, and specific subjects. The system tracks your progress and sends reminders to help you stay on track. View goal completion rates in your progress dashboard."
    },

    // Reminders & Organization
    {
      id: 35,
      category: "Reminders & Organization",
      question: "How do I set up reminders?",
      answer: "Create reminders from the reminders section in your navigation. Set reminders for study sessions, goal deadlines, flashcard reviews, or custom tasks. Choose your preferred reminder time and notification method."
    },
    {
      id: 36,
      category: "Reminders & Organization",
      question: "What types of reminders can I create?",
      answer: "You can create reminders for study events, goal deadlines, flashcard reviews, and general todos. Each reminder can be customized with specific times, descriptions, and priority levels to help you stay organized."
    },
    {
      id: 37,
      category: "Reminders & Organization",
      question: "How do I customize notifications?",
      answer: "Go to Settings to customize notifications for study reminders, goal deadlines, flashcard reviews, and other study events. Choose your preferred notification timing and delivery methods."
    },

    // Security & Privacy
    {
      id: 38,
      category: "Security & Privacy",
      question: "Is my data secure?",
      answer: "Yes! We use Supabase authentication and row-level security to protect your data. All data is encrypted in transit and at rest. You maintain full control over your content and can export your notes anytime."
    },
    {
      id: 39,
      category: "Security & Privacy",
      question: "Does AI training use my content?",
      answer: "Your private content isn't used to train public AI models. We may use anonymized telemetry and usage patterns to improve product quality as described in our privacy policy, but your personal notes and study content remain private."
    },
    {
      id: 40,
      category: "Security & Privacy",
      question: "Can I export my data?",
      answer: "Yes! You can export all your notes, flashcards, and study data at any time. This ensures you always have access to your content and can migrate it if needed. Export options are available in your account settings."
    },
    {
      id: 41,
      category: "Security & Privacy",
      question: "What happens if I delete my account?",
      answer: "When you delete your account, all your data is permanently removed from our servers within 30 days. We recommend exporting your important content before deletion. This action cannot be undone."
    },

    // Advanced Features
    {
      id: 42,
      category: "Advanced Features",
      question: "What collaboration features are available?",
      answer: "Premium users can share flashcard sets with others, collaborate on study materials, and access shared libraries. These features help groups study together and share knowledge effectively."
    },
    {
      id: 43,
      category: "Advanced Features",
      question: "Can I use PrepGenie offline?",
      answer: "Some features work offline once loaded, such as viewing previously loaded notes and flashcards. However, AI features, syncing, and new content creation require an internet connection for the best experience."
    },
    {
      id: 44,
      category: "Advanced Features",
      question: "Are there API integrations available?",
      answer: "Currently, PrepGenie focuses on providing an excellent web experience. API integrations and advanced developer features may be available for enterprise users. Contact support to discuss specific integration needs."
    },

    // Troubleshooting
    {
      id: 45,
      category: "Troubleshooting",
      question: "What if my imported content doesn't look right?",
      answer: "If imported content appears garbled or incomplete, try re-importing with different settings. For OCR scans, ensure good lighting and clear text. For files, make sure they're in a supported format and not password-protected."
    },
    {
      id: 46,
      category: "Troubleshooting",
      question: "How do I get help if I'm stuck?",
      answer: "Visit our Help Center for comprehensive guides and tutorials, search our documentation, or contact support through the help section. We also provide video tutorials for common tasks and feature explanations."
    },
    {
      id: 47,
      category: "Troubleshooting",
      question: "Why can't I create more notes/flashcards?",
      answer: "You've likely reached your tier limit. Check your usage in account settings to see current limits. You can delete existing content to free up space or upgrade to a higher tier for increased limits."
    },
    {
      id: 48,
      category: "Troubleshooting",
      question: "My AI features aren't working - why?",
      answer: "Check if you've reached your monthly AI enhancement limit in your account settings. AI features reset monthly on your billing date. If you need more, consider upgrading your tier or wait for the next billing cycle."
    },
    {
      id: 49,
      category: "Troubleshooting",
      question: "The app seems slow - what can I do?",
      answer: "Try refreshing the page, clearing your browser cache, or switching browsers. Large notes or many flashcard sets can impact performance. Consider organizing content into smaller sets for better performance."
    }
  ];

  const categories = [
    "Getting Started",
    "Subscription & Pricing",
    "Tier Limits & Usage",
    "Account Management",
    "AI Features",
    "Notes & Flashcards",
    "Study Tools & Sessions",
    "Reminders & Organization",
    "Security & Privacy",
    "Advanced Features",
    "Troubleshooting"
  ];

  const quickLinks = [
    {
      question: "How do I upgrade my account?",
      category: "Subscription & Pricing",
      id: 5
    },
    {
      question: "What limits are included in each plan?",
      category: "Tier Limits & Usage", 
      id: 10
    },
    {
      question: "How do I cancel my subscription?",
      category: "Account Management",
      id: 16
    },
    {
      question: "What AI features are available?",
      category: "AI Features",
      id: 20
    },
    {
      question: "Is my data secure?",
      category: "Security & Privacy",
      id: 38
    }
  ];

  return (
    <Layout>
      <Helmet>
        <title>FAQ | PrepGenie</title>
        <meta name="description" content="Frequently asked questions about PrepGenie features, AI tools, pricing, and more." />
        <link rel="canonical" href={typeof window !== 'undefined' ? `${window.location.origin}/faq` : '/faq'} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(f => ({
              "@type": "Question",
              "name": f.question,
              "acceptedAnswer": { "@type": "Answer", "text": f.answer }
            }))
          })}
        </script>
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h1>
              <p className="text-xl text-gray-600">
                Find answers to common questions about using PrepGenie
              </p>
            </div>

            {/* Quick Links Section */}
            <div className="mb-12 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-mint-700 mb-6 text-center">
                Quick Links - Most Asked Questions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickLinks.map((link) => {
                  const faq = faqs.find(f => f.id === link.id);
                  return (
                    <a
                      key={link.id}
                      href={`#faq-${link.id}`}
                      className="block p-4 border border-mint-200 rounded-lg hover:border-mint-400 hover:bg-mint-50/30 transition-colors"
                    >
                      <div className="text-sm text-mint-600 mb-1">{link.category}</div>
                      <div className="text-gray-900 font-medium text-sm leading-tight">
                        {link.question}
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="space-y-8">
              {categories.map((category) => {
                const categoryFaqs = faqs.filter(faq => faq.category === category);
                if (categoryFaqs.length === 0) return null;
                
                return (
                  <div key={category} className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-semibold text-mint-700 mb-6 border-b border-mint-200 pb-2">
                      {category}
                    </h2>
                    <div className="space-y-6">
                      {categoryFaqs.map((faq) => (
                        <div key={faq.id} id={`faq-${faq.id}`} className="border-l-4 border-mint-300 pl-4">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {faq.question}
                          </h3>
                          <p className="text-gray-600 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-12 bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Still have questions?
              </h2>
              <p className="text-gray-600 mb-6">
                Can't find what you're looking for? We're here to help!
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
    </Layout>
  );
};

export default FAQPage;
