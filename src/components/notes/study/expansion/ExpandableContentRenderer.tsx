import React, { useState, useRef, useMemo, useCallback } from 'react';
import { ContentExpansionContextMenu } from './ContentExpansionContextMenu';
import { ExpansionPreviewDialog } from './ExpansionPreviewDialog';
import { useContentExpansion } from './useContentExpansion';
import { TextAlignType } from '../hooks/useStudyViewState';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { SimpleContentRenderer } from '../SimpleContentRenderer';
import { processContentForDisplay } from '@/utils/markdownConverter';

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
    // Pre-process the original content to convert AI-enhanced tags to HTML
    // This ensures consistent formatting before combining with expansions
    const baseProcessedContent = processContentForDisplay(content);
    
    if (expansions.length === 0) return baseProcessedContent;

    let processedText = baseProcessedContent;
    
    // Sort expansions by position to process them in order
    // For HTML content, we need to find text positions more carefully
    const sortedExpansions = [...expansions].sort((a, b) => {
      // Create a temporary div to find text positions in HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = processedText;
      const textContent = tempDiv.textContent || tempDiv.innerText || '';
      
      const aPos = textContent.indexOf(a.originalText);
      const bPos = textContent.indexOf(b.originalText);
      return aPos - bPos;
    });

    // Insert expansions from end to beginning to maintain position accuracy
    for (let i = sortedExpansions.length - 1; i >= 0; i--) {
      const expansion = sortedExpansions[i];
      
      // For HTML content, we need to find and replace the text more carefully
      // We'll look for the original text in the HTML and insert after it
      const textToFind = expansion.originalText;
      const textIndex = processedText.indexOf(textToFind);
      
      if (textIndex !== -1) {
        const beforeText = processedText.substring(0, textIndex + textToFind.length);
        const afterText = processedText.substring(textIndex + textToFind.length);
        
        // Clean the expanded content - keep as plain text but format for italics
        const cleanExpandedContent = expansion.expandedContent
          .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
          .replace(/#{1,6}\s*/g, '')       // Remove headers
          .replace(/^\s*[-*+]\s*/gm, '')   // Remove bullet points
          .replace(/^\s*\d+\.\s*/gm, '')   // Remove numbered lists
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .join('\n\n');

        const expansionBlock = `

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
  }, [content, expansions, contentType]);

  // DEBOUNCED selection handler to prevent multiple rapid calls
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const selectionRef = useRef<Range | null>(null);

  const handleTextSelection = React.useCallback((event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
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
      
      // Calculate position using viewport coordinates (for fixed positioning)
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const menuWidth = 320; // Approximate menu width
      const menuHeight = 120; // Approximate menu height
      
      // Position menu below selection by default
      let x = Math.min(
        Math.max(10, rect.left + rect.width / 2 - menuWidth / 2), // Center menu on selection
        viewportWidth - menuWidth - 10 // Keep within right edge
      );
      
      let y = rect.bottom + 10; // Position below selection
      
      // If menu would go off bottom of viewport, position above
      if (y + menuHeight > viewportHeight) {
        y = rect.top - menuHeight - 10;
      }
      
      // If still off top of viewport, position in center
      if (y < 10) {
        y = Math.max(10, viewportHeight / 2 - menuHeight / 2);
      }
      
      const menuPosition = { x, y };
      
      setSelectedText(text);
      setMenuPosition(menuPosition);
      setIsMenuVisible(true);
      
      console.log("✅ SELECTION: Menu positioned at:", menuPosition, "Selection preserved");
    }, 50); // 50ms debounce for faster response
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
        onTouchEnd={handleTextSelection as any}
      >
        {/* Use SimpleContentRenderer with dynamic font size */}
        <SimpleContentRenderer
          content={processedContent}
          fontSize={fontSize} // Use dynamic font size from props
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
        .ai-expansion-content {
          background: hsl(48, 100%, 96%);
          border-left: 3px solid #d97706;
          padding: 12px 16px;
          margin: 12px 0;
          font-style: italic !important;
          font-weight: normal !important;
          line-height: 1.6;
          position: relative;
          font-size: 16px !important;
          font-family: inherit !important;
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