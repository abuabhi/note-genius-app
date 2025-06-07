
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader } from "lucide-react";
import { TierLimit } from "./TierLimitsManagement";

const tierLimitSchema = z.object({
  tier: z.string(),
  max_notes: z.number().int().min(-1),
  max_flashcard_sets: z.number().int().min(-1),
  max_storage_mb: z.number().int().min(-1),
  note_enrichment_limit_per_month: z.number().int().min(-1).nullable(),
  max_cards_per_set: z.number().int().min(-1),
  max_ai_flashcard_generations_per_month: z.number().int().min(-1),
  max_collaborations: z.number().int().min(-1),
  ai_features_enabled: z.boolean(),
  ai_flashcard_generation: z.boolean(),
  note_enrichment_enabled: z.boolean(),
  ocr_enabled: z.boolean(),
  collaboration_enabled: z.boolean(),
  priority_support: z.boolean(),
  chat_enabled: z.boolean(),
});

type TierLimitFormData = z.infer<typeof tierLimitSchema>;

interface EditTierLimitDialogProps {
  tierLimit: TierLimit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (tierLimit: TierLimit) => void;
  isLoading: boolean;
}

export const EditTierLimitDialog = ({
  tierLimit,
  open,
  onOpenChange,
  onSave,
  isLoading,
}: EditTierLimitDialogProps) => {
  const form = useForm<TierLimitFormData>({
    resolver: zodResolver(tierLimitSchema),
    defaultValues: {
      tier: "",
      max_notes: 0,
      max_flashcard_sets: 0,
      max_storage_mb: 0,
      note_enrichment_limit_per_month: 0,
      max_cards_per_set: 0,
      max_ai_flashcard_generations_per_month: 0,
      max_collaborations: 0,
      ai_features_enabled: false,
      ai_flashcard_generation: false,
      note_enrichment_enabled: false,
      ocr_enabled: false,
      collaboration_enabled: false,
      priority_support: false,
      chat_enabled: false,
    },
  });

  useEffect(() => {
    if (tierLimit) {
      form.reset(tierLimit);
    }
  }, [tierLimit, form]);

  const onSubmit = (data: TierLimitFormData) => {
    onSave(data as TierLimit);
  };

  const getTierBadgeVariant = (tier: string) => {
    switch (tier) {
      case 'SCHOLAR': return 'outline';
      case 'GRADUATE': return 'secondary';
      case 'MASTER': return 'default';
      case 'DEAN': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Edit Tier Limits
            {tierLimit && (
              <Badge variant={getTierBadgeVariant(tierLimit.tier) as any}>
                {tierLimit.tier}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Configure usage limits and feature access. Use -1 for unlimited values.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="max_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Notes</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>-1 for unlimited</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_flashcard_sets"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Flashcard Sets</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>-1 for unlimited</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_cards_per_set"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Cards per Set</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>-1 for unlimited</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_storage_mb"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Storage (MB)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>-1 for unlimited</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="note_enrichment_limit_per_month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AI Enrichments per Month</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value || 0}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>-1 for unlimited</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_ai_flashcard_generations_per_month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AI Generations per Month</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>-1 for unlimited</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_collaborations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Collaborations</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>-1 for unlimited</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Feature Access</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ai_features_enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>AI Features</FormLabel>
                        <FormDescription>Enable AI-powered features</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ai_flashcard_generation"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>AI Flashcard Generation</FormLabel>
                        <FormDescription>Generate flashcards with AI</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="note_enrichment_enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Note Enrichment</FormLabel>
                        <FormDescription>AI note enhancement features</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ocr_enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>OCR</FormLabel>
                        <FormDescription>Optical Character Recognition</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="collaboration_enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Collaboration</FormLabel>
                        <FormDescription>Team collaboration features</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="chat_enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Chat</FormLabel>
                        <FormDescription>In-app messaging</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority_support"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Priority Support</FormLabel>
                        <FormDescription>Enhanced customer support</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
