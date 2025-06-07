
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Check, X } from "lucide-react";
import { TierLimit } from "./TierLimitsManagement";

interface TierLimitsTableProps {
  tierLimits: TierLimit[];
  onEditTier: (tier: TierLimit) => void;
}

export const TierLimitsTable = ({ tierLimits, onEditTier }: TierLimitsTableProps) => {
  const formatValue = (value: number | null) => {
    if (value === null) return "N/A";
    if (value === -1) return "Unlimited";
    return value.toString();
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
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tier</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Flashcard Sets</TableHead>
            <TableHead>Cards/Set</TableHead>
            <TableHead>Storage (MB)</TableHead>
            <TableHead>AI Enrichments/Month</TableHead>
            <TableHead>AI Generations/Month</TableHead>
            <TableHead>Collaborations</TableHead>
            <TableHead>AI Features</TableHead>
            <TableHead>OCR</TableHead>
            <TableHead>Chat</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tierLimits.map((limit) => (
            <TableRow key={limit.tier}>
              <TableCell>
                <Badge variant={getTierBadgeVariant(limit.tier) as any}>
                  {limit.tier}
                </Badge>
              </TableCell>
              <TableCell>{formatValue(limit.max_notes)}</TableCell>
              <TableCell>{formatValue(limit.max_flashcard_sets)}</TableCell>
              <TableCell>{formatValue(limit.max_cards_per_set)}</TableCell>
              <TableCell>{formatValue(limit.max_storage_mb)}</TableCell>
              <TableCell>{formatValue(limit.note_enrichment_limit_per_month)}</TableCell>
              <TableCell>{formatValue(limit.max_ai_flashcard_generations_per_month)}</TableCell>
              <TableCell>{formatValue(limit.max_collaborations)}</TableCell>
              <TableCell>
                {limit.ai_features_enabled ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
              </TableCell>
              <TableCell>
                {limit.ocr_enabled ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
              </TableCell>
              <TableCell>
                {limit.chat_enabled ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditTier(limit)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
