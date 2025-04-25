
import Layout from "@/components/layout/Layout";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Testimonials from "@/components/landing/Testimonials";
import CTA from "@/components/landing/CTA";

const HomePage = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-mint-50 via-purple-50/30 to-white">
        <Hero />
        <Features />
        <Testimonials />
        <CTA />
      </div>
    </Layout>
  );
};

export default HomePage;
