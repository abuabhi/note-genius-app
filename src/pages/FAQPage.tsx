
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MessageCircle } from "lucide-react";
import { useState } from "react";

const FAQPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const faqs = [
    {
      id: "1",
      question: "What is PrepGenie?",
      answer: "PrepGenie is an AI-powered educational platform that helps students create, organize, and study their notes and learning materials. It features intelligent note enhancement, flashcard generation, study analytics, and personalized learning recommendations.",
      category: "General"
    },
    {
      id: "2",
      question: "How do I create my first note?",
      answer: "To create a note, click the 'Add Note' button on your dashboard or notes page. You can create notes manually by typing, scan documents using your camera, or import files like PDFs. Choose your subject, add tags for organization, and start writing!",
      category: "Getting Started"
    },
    {
      id: "3",
      question: "What file types can I import?",
      answer: "PrepGenie supports importing PDF files, Word documents (.docx), and images (JPG, PNG). You can also scan physical documents using your device's camera for OCR text recognition.",
      category: "Notes"
    },
    {
      id: "4",
      question: "How does AI flashcard generation work?",
      answer: "Our AI analyzes your notes and automatically generates relevant flashcards based on key concepts, definitions, and important information. You can review and edit these flashcards before adding them to your study sets.",
      category: "Flashcards"
    },
    {
      id: "5",
      question: "Can I study offline?",
      answer: "While PrepGenie is primarily a web-based platform, some features like viewing downloaded notes and flashcards may be available offline. However, AI features and syncing require an internet connection.",
      category: "Study"
    },
    {
      id: "6",
      question: "How is my study progress tracked?",
      answer: "PrepGenie tracks various metrics including study time, flashcard performance, quiz scores, and learning velocity. You can view detailed analytics on your progress page to understand your learning patterns and identify areas for improvement.",
      category: "Progress"
    },
    {
      id: "7",
      question: "Is my data secure?",
      answer: "Yes, we take data security seriously. All data is encrypted in transit and at rest. We follow industry best practices for security and privacy. Your notes and personal information are never shared with third parties without your consent.",
      category: "Privacy"
    },
    {
      id: "8",
      question: "What subscription plans are available?",
      answer: "We offer different subscription tiers including a free plan with basic features, and premium plans with advanced AI features, unlimited storage, and priority support. Check our pricing page for current plans and features.",
      category: "Billing"
    },
    {
      id: "9",
      question: "Can I collaborate with classmates?",
      answer: "Yes! PrepGenie offers collaboration features that allow you to share flashcard sets, join study groups, and work together on learning materials. These features may vary by subscription tier.",
      category: "Collaboration"
    },
    {
      id: "10",
      question: "How do I contact support?",
      answer: "You can reach our support team by visiting the Contact page and sending us a message. We typically respond within 24 hours during business days. You can also access our help center for immediate answers to common questions.",
      category: "Support"
    },
    {
      id: "11",
      question: "Can I export my notes and flashcards?",
      answer: "Yes, you can export your notes in various formats including PDF and text files. Flashcard sets can also be exported for use in other applications or as backup files.",
      category: "Data"
    },
    {
      id: "12",
      question: "What happens if I cancel my subscription?",
      answer: "If you cancel your subscription, you'll retain access to premium features until the end of your billing period. After that, your account will revert to the free tier with basic features. Your data will be preserved.",
      category: "Billing"
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = Array.from(new Set(faqs.map(faq => faq.category)));

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-white via-mint-50/30 to-mint-50/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Frequently Asked Questions
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Find quick answers to common questions about PrepGenie
            </p>
          </div>

          {/* Search */}
          <div className="mb-12">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-3"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map(category => (
              <span key={category} className="px-3 py-1 bg-mint-100 text-mint-700 rounded-full text-sm">
                {category}
              </span>
            ))}
          </div>

          {/* FAQ Accordion */}
          <Card className="border-mint-200 mb-12">
            <CardContent className="p-6">
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600">
                    Try searching with different keywords or contact support for help.
                  </p>
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqs.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id} className="border-b border-mint-100">
                      <AccordionTrigger className="text-left hover:text-mint-600">
                        <div className="flex items-center gap-3">
                          <span className="text-sm bg-mint-100 text-mint-700 px-2 py-1 rounded">
                            {faq.category}
                          </span>
                          <span className="font-medium">{faq.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-700 pt-4 pb-6">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>

          {/* Contact Support Section */}
          <Card className="border-mint-200 bg-mint-50">
            <CardHeader className="text-center">
              <MessageCircle className="h-12 w-12 text-mint-600 mx-auto mb-4" />
              <CardTitle className="text-xl text-gray-900">Still have questions?</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                Can't find the answer you're looking for? Our support team is here to help you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-mint-600 hover:bg-mint-700" asChild>
                  <a href="/contact">Contact Support</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/help">Browse Help Center</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default FAQPage;
