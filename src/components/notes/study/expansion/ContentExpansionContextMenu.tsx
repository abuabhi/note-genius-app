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

  if (!isVisible || !selectedText.trim()) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] bg-white rounded-lg shadow-lg border border-gray-200 p-2 min-w-48"
      style={{
        left: Math.min(position.x, window.innerWidth - 200),
        top: Math.min(position.y, window.innerHeight - 100),
      }}
    >
      <div className="text-xs text-gray-500 mb-2 px-2 truncate max-w-44">
        "{selectedText.substring(0, 50)}{selectedText.length > 50 ? '...' : ''}"
      </div>
      
      <Button
        onClick={handleExpand}
        disabled={isExpanding}
        className="w-full justify-start text-sm h-8"
        variant="ghost"
      >
        {isExpanding ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Expand className="h-4 w-4 mr-2" />
        )}
        {isExpanding ? 'Expanding...' : 'Expand this topic'}
      </Button>
    </div>
  );
};