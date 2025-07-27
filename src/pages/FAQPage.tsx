
const FAQPage = () => {
  const faqs = [
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
      category: "AI Features",
      question: "What AI features are available?",
      answer: "PrepGenie offers several AI-powered features including note enhancement (grammar correction, summarization, key points extraction), AI chat with your notes for interactive studying, and automatic flashcard generation from your notes content."
    },
    {
      id: 4,
      category: "AI Features",
      question: "How does the AI note chat work?",
      answer: "The AI note chat allows you to have interactive conversations about your notes. You can ask questions about the content, request explanations, generate practice questions, or get study suggestions. Access it from the chat icon when viewing a note."
    },
    {
      id: 5,
      category: "AI Features",
      question: "What AI enhancements are available for my notes?",
      answer: "AI enhancements include grammar and spelling correction, content summarization, key points extraction, and study guide generation. Premium users get access to advanced AI models for more sophisticated enhancements."
    },
    {
      id: 6,
      category: "Import & Scanning",
      question: "What file formats can I import?",
      answer: "You can import PDF files, Word documents (.docx), and plain text files. Additionally, you can use our OCR scanning feature to capture text from images or physical documents using your camera."
    },
    {
      id: 7,
      category: "Import & Scanning",
      question: "How does OCR scanning work?",
      answer: "OCR (Optical Character Recognition) scanning lets you capture text from images or physical documents. Use your camera to take a photo, and our system will extract the text automatically. You can choose from multiple languages and enable image enhancement for better accuracy."
    },
    {
      id: 8,
      category: "Study Sessions",
      question: "Can I track my study sessions?",
      answer: "Yes! Start a study session from your dashboard or notes page to track your study time. The system records your session duration, subjects studied, and provides analytics to help you understand your study patterns and progress."
    },
    {
      id: 9,
      category: "Study Sessions",
      question: "How do study analytics work?",
      answer: "Study analytics track your daily and weekly study time, show progress by subject, identify your most productive study periods, and provide insights into your learning patterns. Access detailed analytics from your dashboard or progress page."
    },
    {
      id: 10,
      category: "Reminders",
      question: "How do I set up reminders?",
      answer: "Create reminders from the reminders section in your navigation. You can set reminders for study sessions, goal deadlines, flashcard reviews, or custom tasks. Choose your reminder time and the system will notify you when it's due."
    },
    {
      id: 11,
      category: "Reminders",
      question: "What types of reminders can I create?",
      answer: "You can create reminders for study events, goal deadlines, flashcard reviews, and general todos. Each reminder can be customized with specific times, descriptions, and priority levels to help you stay organized."
    },
    {
      id: 12,
      category: "Organization",
      question: "How do I organize my content?",
      answer: "Use subjects to categorize your notes and flashcards by topic (e.g., Math, History, Science). You can also add tags for more detailed organization and use the search function to quickly find specific content."
    },
    {
      id: 13,
      category: "Organization",
      question: "Can I search through my notes?",
      answer: "Yes, use the search bar to find notes by title, content, subject, or tags. You can also filter notes by date, subject, source type, and other criteria to quickly locate what you need."
    },
    {
      id: 14,
      category: "Study Tools",
      question: "How do I study with flashcards?",
      answer: "Select a flashcard set and choose your study mode. You can study in order or randomly, mark cards as easy/hard to adjust review frequency, and track your progress. The system uses spaced repetition to optimize your learning."
    },
    {
      id: 15,
      category: "Study Tools",
      question: "What study modes are available?",
      answer: "Available study modes include flashcard review, quiz taking, note reading with AI chat assistance, and timed study sessions. Each mode is designed to help you learn and retain information effectively."
    },
    {
      id: 16,
      category: "Progress Tracking",
      question: "How can I track my progress?",
      answer: "View your progress through the analytics dashboard, which shows study time, subjects covered, flashcard mastery levels, quiz scores, goal completion rates, and learning trends over time."
    },
    {
      id: 17,
      category: "Progress Tracking",
      question: "What are study goals and how do they work?",
      answer: "Study goals help you set and track specific learning objectives. Create goals with target study hours, deadlines, and subjects. The system tracks your progress and sends reminders to help you stay on track."
    },
    {
      id: 18,
      category: "Account & Settings",
      question: "How do I customize my study preferences?",
      answer: "Go to Settings to customize your study preferences, notification settings, subjects, timezone, and other personal preferences. You can also manage your account details and subscription from the settings page."
    },
    {
      id: 19,
      category: "Account & Settings",
      question: "What notification options do I have?",
      answer: "You can customize notifications for study reminders, goal deadlines, flashcard reviews, and other study events. Choose your preferred notification timing and delivery methods in the settings."
    },
    {
      id: 20,
      category: "Troubleshooting",
      question: "What if my imported content doesn't look right?",
      answer: "If imported content appears garbled or incomplete, try re-importing with different settings. For OCR scans, ensure good lighting and clear text. For files, make sure they're in a supported format and not password-protected."
    },
    {
      id: 21,
      category: "Troubleshooting",
      question: "How do I get help if I'm stuck?",
      answer: "Use the help button (?) in the top navigation for contextual help, search our help documentation, or contact support through the help section. We also provide video tutorials for common tasks."
    }
  ];

  const categories = [
    "Getting Started",
    "AI Features", 
    "Import & Scanning",
    "Study Sessions",
    "Reminders",
    "Organization",
    "Study Tools",
    "Progress Tracking",
    "Account & Settings",
    "Troubleshooting"
  ];

  return (
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
                      <div key={faq.id} className="border-l-4 border-mint-300 pl-4">
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
  );
};

export default FAQPage;
