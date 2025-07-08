import React, { useState, useRef, useMemo, useCallback } from 'react';
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
        
        // Clean the expanded content - remove markdown formatting and bold text
        const cleanExpandedContent = expansion.expandedContent
          .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
          .replace(/\*(.*?)\*/g, '$1')     // Remove italic markdown
          .replace(/#{1,6}\s*/g, '')       // Remove headers
          .replace(/^\s*[-*+]\s*/gm, '')   // Remove bullet points
          .replace(/^\s*\d+\.\s*/gm, '')   // Remove numbered lists
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .join('\n\n');

        const expansionBlock = `

---

<div class="ai-expansion-header">🧠 AI Expanded Content</div>

<div class="ai-expansion-content">
${cleanExpandedContent}
</div>

<div class="expansion-remove-wrapper" data-expansion-id="${expansion.id}">
  <button class="expansion-remove-btn" onclick="window.removeExpansion('${expansion.id}')">×</button>
</div>

`;
        
        processedText = beforeText + expansionBlock + afterText;
      }
    }

    return processedText;
  }, [content, expansions]);

  // DEBOUNCED selection handler to prevent multiple rapid calls
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const selectionRef = useRef<Range | null>(null);

  const handleTextSelection = React.useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    // Prevent event from bubbling up
    event.stopPropagation();
    
    console.log("🎯 SELECTION: Text selection handler triggered");
    
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Debounce to prevent rapid calls
    debounceTimeoutRef.current = setTimeout(() => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        console.log("❌ SELECTION: No selection or range");
        setIsMenuVisible(false);
        selectionRef.current = null;
        return;
      }

      const text = selection.toString().trim();
      console.log("📝 SELECTION: Selected text:", `"${text}"`, "Length:", text.length);
      
      if (text.length < 5) {
        console.log("⚠️ SELECTION: Text too short, hiding menu");
        setIsMenuVisible(false);
        selectionRef.current = null;
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      console.log("📍 SELECTION: Position rect:", rect);
      
      // Store the actual range to preserve selection
      selectionRef.current = range.cloneRange();
      
      // Calculate position next to the selection (to the right, or below if no space)
      const viewportWidth = window.innerWidth;
      const menuWidth = 320; // Approximate menu width
      
      let x = rect.right + 10; // Position to the right of selection
      let y = rect.top + window.scrollY;
      
      // If menu would go off-screen on the right, position it to the left
      if (x + menuWidth > viewportWidth) {
        x = rect.left - menuWidth - 10;
      }
      
      // If still off-screen on the left, position it below the selection
      if (x < 16) {
        x = Math.max(16, rect.left);
        y = rect.bottom + window.scrollY + 10;
      }
      
      const menuPosition = { x, y };
      
      setSelectedText(text);
      setMenuPosition(menuPosition);
      setIsMenuVisible(true);
      
      console.log("✅ SELECTION: Menu positioned at:", menuPosition, "Selection preserved");
    }, 100); // 100ms debounce
  }, []);

  const handleExpand = async (text: string) => {
    // Use preserved selection from ref
    const range = selectionRef.current;
    if (!range) return;

    const startOffset = range.startOffset;
    
    await expandContent(text, startOffset);
    setIsMenuVisible(false);
    
    // Clear the selection after expansion
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }
    selectionRef.current = null;
  };

  const handleCloseMenu = () => {
    setIsMenuVisible(false);
    setSelectedText('');
    selectionRef.current = null;
    
    // Clear browser selection
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }
  };

  // Expose removeExpansion function globally for button clicks
  React.useEffect(() => {
    (window as any).removeExpansion = (expansionId: string) => {
      removeExpansion(expansionId);
    };
    
    // Cleanup timeout on unmount
    return () => {
      delete (window as any).removeExpansion;
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [removeExpansion]);

  return (
    <>
      <div
        ref={contentRef}
        className={`expandable-content ${className}`}
        style={{
          userSelect: 'text',
          position: 'relative'
        }}
        onMouseUp={handleTextSelection}
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
        .ai-expansion-header {
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
          margin: 1.5rem 0 0.75rem 0;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        
        .ai-expansion-content {
          background: linear-gradient(to right, #f0fdf4, #ecfdf5);
          border-left: 3px solid #22c55e;
          padding: 1rem 1.25rem;
          margin: 0.5rem 0 1.5rem 0;
          border-radius: 0 0.5rem 0.5rem 0;
          font-style: normal;
          font-weight: normal;
          color: #166534;
          line-height: 1.6;
          position: relative;
        }
        
        .ai-expansion-content::before {
          content: '';
          position: absolute;
          left: -3px;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(to bottom, #22c55e, #16a34a);
          border-radius: 0 0 0 0.125rem;
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