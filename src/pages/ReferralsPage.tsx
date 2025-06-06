
import Layout from "@/components/layout/Layout";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Loader2, Gift } from "lucide-react";
import { ReferralHeroSection } from "@/components/referrals/ReferralHeroSection";
import { ReferralStatsSection } from "@/components/referrals/ReferralStatsSection";
import { ReferralSharingSection } from "@/components/referrals/ReferralSharingSection";
import { ReferralPrizesSection } from "@/components/referrals/ReferralPrizesSection";
import { ReferralFAQSection } from "@/components/referrals/ReferralFAQSection";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";

const ReferralsPage = () => {
  console.log('🎯 ReferralsPage component rendering');
  
  const { user, loading } = useRequireAuth();
  
  if (loading) {
    console.log('⏳ Referrals page is loading...');
    return (
      <Layout>
        <div className="container mx-auto p-6 flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-mint-500" />
            <p className="mt-2 text-gray-600">Loading referrals...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!user) {
    console.log("❌ Not authorized, redirecting via useRequireAuth");
    return null;
  }

  console.log('✅ Referrals page rendering main content');
  
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-6 space-y-8">
          <PageBreadcrumb pageName="Refer & Win" pageIcon={<Gift className="h-4 w-4" />} />
          
          <ReferralHeroSection />
          <ReferralStatsSection />
          <ReferralSharingSection />
          <ReferralPrizesSection />
          <ReferralFAQSection />
        </div>
      </div>
    </Layout>
  );
};

export default ReferralsPage;
