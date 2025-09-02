
import React, { Suspense } from "react";
import { Helmet } from "react-helmet";
import Layout from "@/components/layout/Layout";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import CTA from "@/components/landing/CTA";
import StickyMobileCTA from "@/components/landing/StickyMobileCTA";
import { Logos3 } from "@/components/ui/logos3";

const EnhancedInteractiveDemo = React.lazy(() =>
  import("@/components/landing/EnhancedInteractiveDemo").then((m) => ({
    default: m.EnhancedInteractiveDemo,
  }))
);
const Testimonials = React.lazy(() => import("@/components/landing/Testimonials"));

const HomePage = () => {
  const canonicalUrl = typeof window !== 'undefined' ? `${window.location.origin}/` : undefined;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "PrepGenie - AI Study App",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "AI-powered study tools including smart flashcards, personalized study plans, quiz generation, and learning analytics. Transform your study routine with artificial intelligence.",
    featureList: [
      "AI Flashcard Generation from any content",
      "Personalized Study Planning and Scheduling", 
      "Intelligent Quiz Generator with multiple formats",
      "Advanced Learning Analytics and Progress Tracking",
      "OCR Document Scanning and Note Enhancement",
      "AI Study Assistant Chat Support"
    ],
    keywords: [
      "AI flashcards generator",
      "study planner app",
      "quiz generator online",
      "learning analytics",
      "study scheduler",
      "AI study tools"
    ],
    author: {
      "@type": "Organization",
      "name": "PrepGenie",
      "url": typeof window !== 'undefined' ? window.location.origin : ""
    },
    aggregateRating: {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "2847"
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>AI Study App: Notes, Flashcards, Quizzes</title>
        <meta name="description" content="Turn notes into flashcards and quizzes with AI. Plans, analytics, timer, and goals to study smarter." />
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
        <link rel="preload" as="image" href="/lovable-uploads/hero.png?v=5" />
        <meta property="og:title" content="AI Study App: Notes, Flashcards, Quizzes" />
        <meta property="og:description" content="Turn notes into flashcards and quizzes with AI. Plans, analytics, timer, and goals to study smarter." />
        <meta name="twitter:card" content="summary" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30 overflow-x-hidden">
        <Hero />
        <Logos3 heading="Trusted by students at" count={17} />
        <Features />

        <Suspense fallback={<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"><div className="h-40 rounded-2xl bg-white/60 border border-mint-100 animate-pulse" /></div>}>
          <EnhancedInteractiveDemo />
        </Suspense>

        <Suspense fallback={<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"><div className="h-72 rounded-2xl bg-white/60 border border-mint-100 animate-pulse" /></div>}>
          <Testimonials />
        </Suspense>

        <CTA />
        <StickyMobileCTA />
      </div>
    </Layout>
  );
};

export default HomePage;
