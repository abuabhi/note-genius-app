
import Layout from "@/components/layout/Layout";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import { EnhancedInteractiveDemo } from "@/components/landing/EnhancedInteractiveDemo";
import Testimonials from "@/components/landing/Testimonials";
import CTA from "@/components/landing/CTA";

const HomePage = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        <Hero />
        <Features />
        <EnhancedInteractiveDemo />
        <Testimonials />
        <CTA />
      </div>
    </Layout>
  );
};

export default HomePage;
