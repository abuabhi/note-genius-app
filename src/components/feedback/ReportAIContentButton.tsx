import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Flag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

export type AIContentType = "quiz" | "note_enrichment" | "flashcard" | "explanation";

interface ReportAIContentButtonProps {
  contentType: AIContentType;
  contentId?: string;
  /** Optional snippet of the offending content saved with the report */
  contentSample?: string;
  variant?: "ghost" | "outline" | "default";
  size?: "sm" | "default" | "icon";
  label?: string;
}

const REASONS = [
  "Factually incorrect",
  "Irrelevant to my topic",
  "Confusing or unclear",
  "Inappropriate or unsafe",
  "Other",
] as const;

export const ReportAIContentButton: React.FC<ReportAIContentButtonProps> = ({
  contentType,
  contentId,
  contentSample,
  variant = "ghost",
  size = "sm",
  label = "Report",
}) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>(REASONS[0]);
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please sign in to report content.");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("feedback").insert({
        user_id: user.id,
        type: "ai_quality",
        title: `AI ${contentType} report: ${reason}`,
        description: [
          `Reason: ${reason}`,
          details && `Details: ${details}`,
          contentId && `Content ID: ${contentId}`,
          contentSample && `Sample: ${contentSample.slice(0, 500)}`,
        ]
          .filter(Boolean)
          .join("\n"),
        priority: "medium",
        severity: "low",
      });
      if (error) throw error;
      toast.success("Thanks — we'll review this AI output.");
      setOpen(false);
      setDetails("");
      setReason(REASONS[0]);
    } catch (e) {
      console.error("[report-ai]", e);
      toast.error("Couldn't submit your report. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className="text-muted-foreground hover:text-destructive">
          <Flag className="h-4 w-4 mr-1" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report this AI output</DialogTitle>
          <DialogDescription>
            Help us improve. Your report goes to the team and won't affect your account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="report-reason" className="text-sm font-medium">What's wrong?</label>
            <select
              id="report-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm bg-background"
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="report-details" className="text-sm font-medium">Details (optional)</label>
            <Textarea
              id="report-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="What did the AI get wrong?"
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Sending…" : "Send report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
