
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

export const ReferralFAQSection = () => {
  const faqs = [
    {
      question: "How does the referral program work? 🤔",
      answer: "It's super simple! Share your unique referral code with friends. When they sign up and complete their onboarding, you both get rewards! They get a great study platform, you get points and prizes. Everyone wins! 🎉"
    },
    {
      question: "When do I get my rewards? ⏰",
      answer: "Rewards are automatically added to your account within 24 hours of your friend completing their onboarding. No waiting around, no manual claims - we've got you covered! ⚡"
    },
    {
      question: "Is there a limit to how many friends I can refer? 🚀",
      answer: "Absolutely not! The sky's the limit! Refer 5 friends, 50 friends, or 500 friends - we love the enthusiasm! The more you refer, the more legendary rewards you unlock. Go wild! 🌟"
    },
    {
      question: "What if my friend doesn't use my code? 😅",
      answer: "No worries! As long as they mention your username during signup or within their first week, our team can manually link the referral. Just drop us a message with both usernames and we'll sort it out! 🛠️"
    },
    {
      question: "Can I refer family members? 👨‍👩‍👧‍👦",
      answer: "Of course! Family, friends, study buddies, that random person you met at the coffee shop who mentioned studying - everyone's welcome! Just make sure they're genuine users who'll actually use StudyBuddy. 📚"
    },
    {
      question: "Do referral points expire? 📅",
      answer: "Never! Your points are yours forever. Think of them as your study legacy - they'll be there whenever you want to redeem them for awesome rewards! 💎"
    }
  ];

  return (
    <Card className="border-mint-200 bg-gradient-to-br from-mint-50 to-white shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-mint-800 flex items-center justify-center gap-2">
          <HelpCircle className="h-6 w-6" />
          Got Questions? We've Got Answers! 💡
        </CardTitle>
        <p className="text-mint-600">Everything you need to know about becoming a referral rockstar!</p>
      </CardHeader>
      
      <CardContent>
        <Accordion type="single" collapsible className="w-full space-y-2">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-white/60 rounded-lg border border-mint-200 px-4"
            >
              <AccordionTrigger className="text-left font-medium text-mint-800 hover:text-mint-900">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-mint-700 pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        
        <div className="mt-8 bg-mint-100/50 rounded-lg p-6 border border-mint-200 text-center">
          <h3 className="text-lg font-semibold text-mint-800 mb-2">Still have questions? 🤷‍♀️</h3>
          <p className="text-mint-600">
            We're here to help! Reach out to our friendly support team and we'll get you sorted faster than you can say "referral bonus"! 
          </p>
          <div className="mt-3 text-2xl">📧✨</div>
        </div>
      </CardContent>
    </Card>
  );
};
