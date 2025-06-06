
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

export const ReferralFAQSection = () => {
  const faqs = [
    {
      question: "How does the referral program work?",
      answer: "Share your unique referral code with friends. When they sign up using your code and complete their onboarding, you both receive rewards. It's that simple!"
    },
    {
      question: "When do I receive my rewards?",
      answer: "Rewards are automatically added to your account within 24 hours of your friend completing their onboarding process. No manual claims needed."
    },
    {
      question: "Is there a limit to how many people I can refer?",
      answer: "No limits! You can refer as many friends as you'd like. The more successful referrals you make, the more rewards you'll earn."
    },
    {
      question: "What if my friend forgets to use my referral code?",
      answer: "If they mention your username during signup or within their first week, our support team can manually link the referral. Just contact us with both usernames."
    },
    {
      question: "Can I refer family members?",
      answer: "Absolutely! Family members, friends, classmates, or anyone who would benefit from StudyBuddy is welcome. Just ensure they're genuine users."
    },
    {
      question: "Do my referral points expire?",
      answer: "Never! Your referral points are permanent and will remain in your account indefinitely. You can redeem them whenever you choose."
    }
  ];

  return (
    <Card className="border-gray-200 bg-white shadow-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
          <HelpCircle className="h-6 w-6" />
          Frequently Asked Questions
        </CardTitle>
        <p className="text-gray-600">Everything you need to know about our referral program</p>
      </CardHeader>
      
      <CardContent>
        <Accordion type="single" collapsible className="w-full space-y-2">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-gray-50 rounded-lg border border-gray-200 px-4"
            >
              <AccordionTrigger className="text-left font-medium text-gray-900 hover:text-gray-700 [&[data-state=open]>svg]:rotate-180">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        
        <div className="mt-8 bg-mint-50 rounded-lg p-6 border border-mint-200 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Still have questions?</h3>
          <p className="text-gray-700">
            Our support team is here to help! Contact us and we'll get back to you promptly.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
