import React, { useState, useRef, useMemo } from 'react';
import { ContentExpansionContextMenu } from './ContentExpansionContextMenu';
import { ExpansionPreviewDialog } from './ExpansionPreviewDialog';
import { useContentExpansion } from './useContentExpansion';
import { TextAlignType } from '../hooks/useStudyViewState';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { NuclearContentRenderer } from '../enhancements/NuclearContentRenderer';

interface ExpandableContentRendererProps {
  content: string;
  fontSize: number;
  textAlign: TextAlignType;
  contentType: string;
  noteTitle: string;
  noteId: string;
  className?: string;
}

export const ExpandableContentRenderer = ({
  content,
  fontSize,
  textAlign,
  contentType,
  noteTitle,
  noteId,
  className = ""
}: ExpandableContentRendererProps) => {
  const [selectedText, setSelectedText] = useState('');
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const {
    expansions,
    pendingExpansion,
    isExpanding,
    isRegenerating,
    expandContent,
    regenerateExpansion,
    confirmExpansion,
    cancelExpansion,
    removeExpansion
  } = useContentExpansion(noteId, content, contentType, noteTitle);

  // Process content with expansions inserted at correct positions
  const processedContent = useMemo(() => {
    if (expansions.length === 0) return content;

    let processedText = content;
    
    // Sort expansions by position to process them in order
    const sortedExpansions = [...expansions].sort((a, b) => {
      // Find position using position marker
      const aPos = processedText.indexOf(a.originalText);
      const bPos = processedText.indexOf(b.originalText);
      return aPos - bPos;
    });

    // Insert expansions from end to beginning to maintain position accuracy
    for (let i = sortedExpansions.length - 1; i >= 0; i--) {
      const expansion = sortedExpansions[i];
      const position = processedText.indexOf(expansion.originalText);
      
      if (position !== -1) {
        const beforeText = processedText.substring(0, position + expansion.originalText.length);
        const afterText = processedText.substring(position + expansion.originalText.length);
        
        const expansionBlock = `

---

<div class="ai-expansion-indicator">🧠 AI Expanded Content</div>

*${expansion.expandedContent.split('\n').map(line => line.trim()).join(' ')}*

<div class="expansion-remove-wrapper" data-expansion-id="${expansion.id}">
  <button class="expansion-remove-btn" onclick="window.removeExpansion('${expansion.id}')">×</button>
</div>

`;
        
        processedText = beforeText + expansionBlock + afterText;
      }
    }

    return processedText;
  }, [content, expansions]);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const text = selection.toString().trim();
    if (text.length < 10) { // Minimum selection length
      setIsMenuVisible(false);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    setSelectedText(text);
    setMenuPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom + window.scrollY + 5
    });
    setIsMenuVisible(true);
  };

  const handleExpand = async (text: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const startOffset = range.startOffset;
    
    await expandContent(text, startOffset);
    setIsMenuVisible(false);
    selection.removeAllRanges();
  };

  const handleCloseMenu = () => {
    setIsMenuVisible(false);
    setSelectedText('');
  };

  // Expose removeExpansion function globally for button clicks
  React.useEffect(() => {
    (window as any).removeExpansion = (expansionId: string) => {
      removeExpansion(expansionId);
    };
    
    return () => {
      delete (window as any).removeExpansion;
    };
  }, [removeExpansion]);

  return (
    <>
      <div
        ref={contentRef}
        className={`expandable-content ${className}`}
        style={{
          userSelect: 'text'
        }}
        onMouseUp={handleTextSelection}
        onTouchEnd={handleTextSelection}
      >
        {/* FIXED: Use NuclearContentRenderer for consistent, beautiful formatting */}
        <NuclearContentRenderer
          content={processedContent}
          fontSize={fontSize}
          textAlign={textAlign}
          className="w-full"
        />
      </div>

      <ContentExpansionContextMenu
        selectedText={selectedText}
        position={menuPosition}
        onExpand={handleExpand}
        onClose={handleCloseMenu}
        isVisible={isMenuVisible}
      />

      <ExpansionPreviewDialog
        isOpen={!!pendingExpansion}
        expansion={pendingExpansion ? {
          originalText: pendingExpansion.originalText,
          expandedContent: pendingExpansion.expandedContent,
          contentType
        } : null}
        isRegenerating={isRegenerating}
        onConfirm={confirmExpansion}
        onRegenerate={regenerateExpansion}
        onCancel={cancelExpansion}
      />

      <style dangerouslySetInnerHTML={{
        __html: `
        .ai-expansion-indicator {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #059669;
          background: linear-gradient(to right, #ecfdf5, #d1fae5);
          border: 1px solid #a7f3d0;
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          margin: 1rem 0 0.5rem 0;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        
        .expansion-remove-wrapper {
          position: absolute;
          top: 8px;
          right: 8px;
        }
        
        .expansion-remove-btn {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: none;
          background: hsl(var(--destructive));
          color: white;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.7;
          transition: all 0.2s ease;
        }
        
        .expansion-remove-btn:hover {
          opacity: 1;
          transform: scale(1.1);
        }
        
        .content-expansion {
          animation: expansion-fadeIn 0.4s ease-out forwards;
        }
        
        @keyframes expansion-fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        `
      }} />
    </>
  );
};