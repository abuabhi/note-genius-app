
import React from "react";
import { Helmet } from "react-helmet";

interface QAItem {
  q: string;
  a: string;
}

const faqs: QAItem[] = [
  {
    q: "Which plan is right for me?",
    a: "Scholar is great to explore core features. Graduate adds larger limits and AI enhancements for regular study. Master unlocks the highest limits and priority support for power users.",
  },
  {
    q: "What limits are included in each plan?",
    a: "Each tier includes limits for notes, flashcard sets, cards per set, storage, AI enhancements/generations, and quizzes. See the plan cards above for a quick overview; detailed limits are enforced in-app with counters and banners.",
  },
  {
    q: "When do my monthly limits reset?",
    a: "Monthly usage counters reset on your billing renewal date. We’ll show your renewal date in-app and send cues as you approach limits.",
  },
  {
    q: "What happens if I hit a limit?",
    a: "Actions pause for that feature (e.g., enhancements) and explain why. You can free up usage by deleting content or upgrade anytime to increase limits.",
  },
  {
    q: "Can I switch between monthly and yearly billing?",
    a: "Yes. You can upgrade/downgrade or switch billing frequency anytime from the customer portal. Changes apply immediately or at the next billing cycle depending on your provider settings.",
  },
  {
    q: "Do you offer refunds or trials?",
    a: "We don’t generally offer refunds once a period starts, but you can cancel anytime to stop future renewals. Promotional trials or coupons may apply occasionally.",
  },
  {
    q: "How do I cancel?",
    a: "Open the customer portal from your account settings to manage or cancel your subscription. You’ll retain access until the end of your billing period.",
  },
  {
    q: "Do unused limits roll over?",
    a: "No, unused monthly quotas don’t roll over. They refresh on your renewal date.",
  },
  {
    q: "What payment methods are supported?",
    a: "Major debit/credit cards are supported. Taxes may be added based on your location.",
  },
  {
    q: "Is my data secure?",
    a: "We use Supabase authentication and row‑level security to protect your data. You can export your notes anytime.",
  },
  {
    q: "Does AI training use my content?",
    a: "Your private content isn’t used to train public models. We may use anonymized telemetry to improve product quality as described in our privacy policy.",
  },
  {
    q: "Do you offer student or team discounts?",
    a: "We occasionally offer coupons and can discuss team/education pricing. Contact support for details.",
  },
];

export const PricingFAQ: React.FC = () => {
  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <section id="pricing-faq" className="container py-16">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqStructuredData)}</script>
      </Helmet>

      <div className="max-w-3xl mx-auto text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">Pricing & Subscription FAQ</h2>
        <p className="mt-4 text-gray-600">Answers to the most common questions before subscribing.</p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {faqs.map((item, idx) => (
          <article key={idx} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">{item.q}</h3>
            <p className="mt-3 text-gray-700 leading-relaxed">{item.a}</p>
          </article>
        ))}
      </div>
    </section>
  );
};
