
import Layout from "@/components/layout/Layout";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import InteractiveDemo from "@/components/landing/InteractiveDemo";
import Testimonials from "@/components/landing/Testimonials";
import CTA from "@/components/landing/CTA";

const HomePage = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-white via-mint-50/30 to-mint-50/10">
        <Hero />
        <Features />
        <InteractiveDemo />
        <Testimonials />
        <CTA />
      </div>
    </Layout>
  );
};

export default HomePage;
