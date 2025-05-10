
import React from 'react';
import { DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface PremiumFeatureNoticeProps {
  onClose: () => void;
}

export const PremiumFeatureNotice: React.FC<PremiumFeatureNoticeProps> = ({ onClose }) => {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Premium Feature</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col items-center gap-4 py-4">
        <AlertCircle className="h-12 w-12 text-amber-500" />
        <p className="text-center">
          Note enrichment is a premium feature. Please upgrade your account to access this feature.
        </p>
      </div>
      <DialogFooter className="sm:justify-center">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button asChild>
          <a href="/pricing">Upgrade Account</a>
        </Button>
      </DialogFooter>
    </>
  );
};
