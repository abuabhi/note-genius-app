
import Layout from "@/components/layout/Layout";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Testimonials from "@/components/landing/Testimonials";
import CTA from "@/components/landing/CTA";

const HomePage = () => {
  return (
    <Layout>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-purple-600 via-purple-900 to-indigo-900" />
        <div className="relative z-10">
          <Hero />
          <Features />
          <Testimonials />
          <CTA />
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
