
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Loader2, Gift } from "lucide-react";
import { ReferralHeroSection } from "@/components/referrals/ReferralHeroSection";
import { ReferralStatsSection } from "@/components/referrals/ReferralStatsSection";
import { ReferralSharingSection } from "@/components/referrals/ReferralSharingSection";
import { ReferralPrizesSection } from "@/components/referrals/ReferralPrizesSection";
import { ReferralFAQSection } from "@/components/referrals/ReferralFAQSection";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";
import { Suspense } from "react";

const ReferralsPageContent = () => {
  console.log('🎯 ReferralsPage component rendering');
  
  const { user, loading } = useRequireAuth();
  
  if (loading) {
    console.log('⏳ Referrals page is loading...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-mint-50">
        <div className="max-w-7xl mx-auto p-6 flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-mint-500" />
            <p className="mt-2 text-gray-600">Loading referrals...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!user) {
    console.log("❌ Not authorized, redirecting via useRequireAuth");
    return null;
  }

  console.log('✅ Referrals page rendering main content');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-mint-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <PageBreadcrumb pageName="Refer & Win" pageIcon={<Gift className="h-4 w-4" />} />
        
        <ReferralHeroSection />
        <Suspense fallback={
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-mint-500" />
            <span className="ml-2 text-gray-600">Loading stats...</span>
          </div>
        }>
          <ReferralStatsSection />
        </Suspense>
        <Suspense fallback={
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-mint-500" />
            <span className="ml-2 text-gray-600">Loading sharing options...</span>
          </div>
        }>
          <ReferralSharingSection />
        </Suspense>
        <ReferralPrizesSection />
        <ReferralFAQSection />
      </div>
    </div>
  );
};

const ReferralsPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-mint-50">
        <div className="max-w-7xl mx-auto p-6 flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-mint-500" />
            <p className="mt-2 text-gray-600">Loading referrals...</p>
          </div>
        </div>
      </div>
    }>
      <ReferralsPageContent />
    </Suspense>
  );
};

export default ReferralsPage;
