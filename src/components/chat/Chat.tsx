
import { useState, useEffect } from "react";
import { MobileChat } from "./MobileChat";
import { DesktopChat } from "./DesktopChat";
import { useChat } from "@/hooks/useChat";
import { useRequireAuth, UserTier } from "@/hooks/useRequireAuth";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { LockIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Chat = () => {
  const { tierLimits, userProfile, loading } = useRequireAuth();
  const navigate = useNavigate();
  const [isFeatureEnabled, setIsFeatureEnabled] = useState(false);

  useEffect(() => {
    if (!loading && tierLimits) {
      // Check if the user has chat_enabled in tierLimits or if user is DEAN
      setIsFeatureEnabled(
        tierLimits.chat_enabled || 
        tierLimits.collaboration_enabled || 
        userProfile?.user_tier === UserTier.DEAN
      );
    }
  }, [loading, tierLimits, userProfile]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isFeatureEnabled) {
    return (
      <div className="container mx-auto p-6">
        <Alert className="max-w-xl mx-auto my-8">
          <LockIcon className="h-5 w-5" />
          <AlertTitle>Premium Feature</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-4">Chat with other users is available to higher tier members only.</p>
            <Button onClick={() => navigate('/pricing')}>Upgrade Now</Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <MobileChat />
      <DesktopChat />
    </>
  );
};
