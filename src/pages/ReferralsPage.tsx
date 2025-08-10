
import { useAuth } from "@/contexts/auth";
import { Loader2, Gift } from "lucide-react";
import { SimplifiedReferralForm } from "@/components/referrals/SimplifiedReferralForm";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";
import { memo, useMemo } from "react";
import { Helmet } from "react-helmet";

const ReferralsPageContent = memo(() => {
  console.log('🎯 ReferralsPage component rendering');
  
  const { user } = useAuth();
  
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        <div className="max-w-4xl mx-auto p-6 h-[50vh] flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-gray-700">Please sign in to access referrals.</p>
            <a href="/auth" className="inline-flex items-center px-4 py-2 rounded-md bg-mint-600 text-white hover:bg-mint-700 transition">Sign in</a>
          </div>
        </div>
      </div>
    );
  }

  console.log('✅ Referrals page rendering main content');
  
  // Memoize breadcrumb props to prevent unnecessary re-renders
  const breadcrumbProps = useMemo(() => ({
    pageName: "Invite Friends & Earn Rewards",
    pageIcon: <Gift className="h-4 w-4" />
  }), []);
  
  return (
    <>
      <Helmet>
        <title>Invite Friends & Earn Rewards | PrepGenie</title>
        <meta name="description" content="Invite friends to PrepGenie with your referral link and earn rewards together." />
        <link rel="canonical" href={`${window.location.origin}/referrals`} />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        <div className="max-w-4xl mx-auto p-6 space-y-8">
          <PageBreadcrumb {...breadcrumbProps} />
          <SimplifiedReferralForm />
        </div>
      </div>
    </>
  );
});

const ReferralsPage = memo(() => {
  return (
    <ReferralsPageContent />
  );
});

ReferralsPage.displayName = 'ReferralsPage';
ReferralsPageContent.displayName = 'ReferralsPageContent';

export default ReferralsPage;
