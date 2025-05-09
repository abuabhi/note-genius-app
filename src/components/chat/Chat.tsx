
import { useState, useEffect } from "react";
import { MobileChat } from "./MobileChat";
import { DesktopChat } from "./DesktopChat";
import { useChat } from "@/hooks/chat"; // Updated import path
import { useRequireAuth, UserTier } from "@/hooks/useRequireAuth";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { LockIcon, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const Chat = () => {
  const { tierLimits, userProfile, loading } = useRequireAuth();
  const { error: chatError } = useChat();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isFeatureEnabled, setIsFeatureEnabled] = useState(false);

  useEffect(() => {
    if (!loading && tierLimits) {
      // Check if the user has chat features enabled or is DEAN tier
      setIsFeatureEnabled(
        (tierLimits.chat_enabled !== undefined ? tierLimits.chat_enabled : false) || 
        tierLimits.collaboration_enabled || 
        userProfile?.user_tier === UserTier.DEAN
      );
    }
  }, [loading, tierLimits, userProfile]);

  useEffect(() => {
    // Show toast when there's a chat error
    if (chatError) {
      toast({
        title: "Chat Error",
        description: "There was an error loading your conversations. Please try again later.",
        variant: "destructive"
      });
    }
  }, [chatError, toast]);

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

  if (chatError) {
    return (
      <div className="container mx-auto p-6">
        <Alert className="max-w-xl mx-auto my-8" variant="destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Error Loading Chat</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-4">We encountered an issue loading your conversations. This might be due to a temporary server problem.</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
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
