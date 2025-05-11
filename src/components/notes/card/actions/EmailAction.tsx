
import React, { useState } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmailActionProps {
  noteTitle: string;
  noteContent: string;
}

export const EmailAction = ({ noteTitle, noteContent }: EmailActionProps) => {
  const [open, setOpen] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  const handleOpenEmailDialog = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(true);
  };

  const handleSendEmail = async () => {
    if (!recipient || !recipient.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    setIsSending(true);
    toast.loading("Sending email...");
    
    try {
      // Use edge function for sending email
      const { data, error } = await supabase.functions.invoke("send-note-email", {
        body: { 
          noteTitle, 
          noteContent,
          recipient
        }
      });
      
      if (error) {
        throw new Error(error.message || "Failed to send email");
      }
      
      toast.dismiss();
      toast.success("Email sent successfully");
      setOpen(false);
    } catch (error) {
      console.error("Error sending email:", error);
      toast.dismiss();
      toast.error("Failed to send email. Trying fallback method...");
      
      // Fallback to mailto for short content
      tryMailtoFallback(noteTitle, noteContent, recipient);
    } finally {
      setIsSending(false);
    }
  };
  
  const tryMailtoFallback = (title: string, content: string, to: string = "") => {
    try {
      // Create a mailto link with the note content
      const subject = encodeURIComponent(`Note: ${title}`);
      const body = encodeURIComponent(`${title}\n\n${content}`);
      const recipient = to ? encodeURIComponent(to) : "";
      window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
      toast.success("Email client opened");
    } catch (error) {
      toast.error("Failed to open email client");
    }
  };

  return (
    <>
      <DropdownMenuItem 
        className="flex items-center cursor-pointer" 
        onClick={handleOpenEmailDialog}
      >
        <Mail className="mr-2 h-4 w-4" />
        <span>Email</span>
      </DropdownMenuItem>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Email Note</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="recipient">Recipient Email</Label>
              <Input 
                id="recipient" 
                type="email"
                placeholder="email@example.com"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Note</Label>
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <div className="font-medium">{noteTitle}</div>
                <div className="text-sm text-slate-500 mt-1 line-clamp-2">{noteContent.substring(0, 100)}{noteContent.length > 100 ? '...' : ''}</div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button 
              type="button" 
              onClick={handleSendEmail} 
              disabled={isSending}
              className="bg-mint-600 hover:bg-mint-700"
            >
              {isSending ? "Sending..." : "Send Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
