
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share, Copy, Check, AlertCircle } from "lucide-react";
import { FlashcardSet } from "@/types/flashcard";
import { useToast } from "@/hooks/use-toast";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { isCollaborationEnabled } from "@/utils/premiumFeatures";
import { supabase } from "@/integrations/supabase/client";

interface ShareFlashcardSetProps {
  set: FlashcardSet;
}

export const ShareFlashcardSet = ({ set }: ShareFlashcardSetProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSending, setSending] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const { userProfile } = useRequireAuth();
  
  const isCollaborationFeatureEnabled = isCollaborationEnabled(userProfile?.user_tier);
  
  const shareableLink = `${window.location.origin}/share/flashcard-set/${set.id}`;
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink);
      setIsCopied(true);
      
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      
      toast({
        title: "Link Copied",
        description: "Share link has been copied to clipboard.",
      });
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast({
        title: "Copy Failed",
        description: "Failed to copy link to clipboard.",
        variant: "destructive",
      });
    }
  };
  
  const handleShareByEmail = async () => {
    if (!isCollaborationFeatureEnabled) {
      toast({
        title: "Dean Tier Feature",
        description: "Sharing flashcard sets is only available for Dean tier users.",
        variant: "destructive",
      });
      return;
    }
    
    if (!email.trim() || !email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    
    setSending(true);
    try {
      // In a real app, we'd use a proper sharing API
      // For now, we'll just log it
      console.log(`Sharing ${set.name} with ${email}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Share Successful",
        description: `Flashcard set "${set.name}" has been shared with ${email}.`,
      });
      
      setEmail("");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error sharing flashcard set:", error);
      toast({
        title: "Share Failed",
        description: "Failed to share the flashcard set. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };
  
  if (!isCollaborationFeatureEnabled) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="flex items-center text-muted-foreground"
        onClick={() => {
          toast({
            title: "Dean Tier Feature",
            description: "Sharing flashcard sets is only available for Dean tier users.",
            variant: "destructive",
          });
        }}
      >
        <Share className="h-4 w-4 mr-2" />
        Share
      </Button>
    );
  }
  
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center">
          <Share className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share "{set.name}"</DialogTitle>
          <DialogDescription>
            Share this flashcard set with others to collaborate on studying.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shareLink">Shareable Link</Label>
            <div className="flex space-x-2">
              <Input
                id="shareLink"
                value={shareableLink}
                readOnly
                className="flex-1"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={handleCopyLink}
              >
                {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="shareEmail">Share by Email</Label>
            <div className="flex space-x-2">
              <Input
                id="shareEmail"
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleShareByEmail}
                disabled={isSending}
              >
                {isSending ? "Sending..." : "Send"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
