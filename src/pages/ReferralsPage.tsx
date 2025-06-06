
import { startTransition } from 'react';
import Layout from "@/components/layout/Layout";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Loader2 } from "lucide-react";
import { ReferralCard } from "@/components/referrals/ReferralCard";

const ReferralsPage = () => {
  console.log('🎯 ReferralsPage component rendering');
  
  const { user, loading } = useRequireAuth();
  
  if (loading) {
    console.log('⏳ Referrals page is loading...');
    return (
      <Layout>
        <div className="container mx-auto p-6 flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-2 text-muted-foreground">Loading referrals...</p>
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
      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        <div className="container mx-auto p-6 space-y-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-mint-800 mb-4">Refer & Win</h1>
            <p className="text-lg text-mint-700 max-w-2xl mx-auto">
              Share StudyBuddy with your friends and earn amazing rewards! The more you refer, the more you win.
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <ReferralCard />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ReferralsPage;
