import { useState, useEffect } from "react";
import { MobileChat } from "./MobileChat";
import { DesktopChat } from "./DesktopChat";
import { useChat } from "@/hooks/chat";
import { useRequireAuth, UserTier } from "@/hooks/useRequireAuth";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { LockIcon, AlertCircle, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const Chat = () => {
  const { tierLimits, userProfile, loading } = useRequireAuth();
  const { error: chatError, resetErrors } = useChat();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isFeatureEnabled, setIsFeatureEnabled] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

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
      console.error("Chat error detected:", chatError);
      toast({
        title: "Chat Error",
        description: "There was an error loading your conversations. Please try again.",
        variant: "destructive"
      });
    }
  }, [chatError, toast]);

  const handleRetry = () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    console.log("Retrying chat connection...", { retryCount: retryCount + 1 });
    resetErrors();
    
    // Add a small delay for UI feedback
    setTimeout(() => {
      setIsRetrying(false);
    }, 2000);
  };

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
            <p className="mb-4">
              We encountered an issue loading your conversations. 
              {retryCount > 2 ? " This might be due to a database permission issue." : " This might be due to a temporary server problem."}
            </p>
            <Button 
              onClick={handleRetry} 
              disabled={isRetrying || retryCount > 5}
              className="flex items-center gap-2"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Try Again {retryCount > 0 ? `(${retryCount}/5)` : ''}
                </>
              )}
            </Button>
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
