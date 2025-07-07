import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useCleanupExpansions } from '@/hooks/useCleanupExpansions';

interface ExpansionCleanupButtonProps {
  className?: string;
}

export const ExpansionCleanupButton = ({ className = "" }: ExpansionCleanupButtonProps) => {
  const { cleanupContaminatedExpansions, isCleaningUp } = useCleanupExpansions();

  const handleCleanup = async () => {
    if (window.confirm('This will clean up all contaminated content expansions. Continue?')) {
      await cleanupContaminatedExpansions();
    }
  };

  // Only show in development or when explicitly needed
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCleanup}
      disabled={isCleaningUp}
      className={`${className} opacity-70 hover:opacity-100`}
      title="Clean up contaminated content expansions (Debug)"
    >
      <Trash2 className="h-4 w-4 mr-1" />
      {isCleaningUp ? 'Cleaning...' : 'Cleanup'}
    </Button>
  );
};