import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Expand, Loader2 } from 'lucide-react';

interface ContentExpansionContextMenuProps {
  selectedText: string;
  position: { x: number; y: number };
  onExpand: (selectedText: string) => Promise<void>;
  onClose: () => void;
  isVisible: boolean;
}

export const ContentExpansionContextMenu = ({
  selectedText,
  position,
  onExpand,
  onClose,
  isVisible
}: ContentExpansionContextMenuProps) => {
  const [isExpanding, setIsExpanding] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isVisible, onClose]);

  const handleExpand = async () => {
    setIsExpanding(true);
    try {
      await onExpand(selectedText);
      onClose();
    } catch (error) {
      console.error('Failed to expand content:', error);
    } finally {
      setIsExpanding(false);
    }
  };

  if (!isVisible || !selectedText.trim() || selectedText.length < 10) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] bg-white rounded-xl shadow-2xl border-2 border-primary/20 p-4 min-w-64 max-w-80 animate-in fade-in-0 zoom-in-95 duration-200"
      style={{
        left: Math.max(16, Math.min(position.x - 160, window.innerWidth - 320)),
        top: Math.max(16, position.y - 20),
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(34, 197, 94, 0.1)'
      }}
    >
      <div className="text-sm text-muted-foreground mb-3 px-1 font-medium">
        Selected: "{selectedText.substring(0, 60)}{selectedText.length > 60 ? '...' : ''}"
      </div>
      
      <Button
        onClick={handleExpand}
        disabled={isExpanding}
        className="w-full justify-center text-base h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
        size="lg"
      >
        {isExpanding ? (
          <>
            <Loader2 className="h-5 w-5 mr-3 animate-spin" />
            Expanding content...
          </>
        ) : (
          <>
            <Expand className="h-5 w-5 mr-3" />
            Expand this topic
          </>
        )}
      </Button>
    </div>
  );
};