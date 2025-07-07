import React, { useState, useRef, useCallback } from 'react';
import { UnifiedContentRenderer } from '../enhancements/UnifiedContentRenderer';
import { ContentExpansionContextMenu } from './ContentExpansionContextMenu';
import { useContentExpansion, ContentExpansion } from './useContentExpansion';
import { Button } from '@/components/ui/button';
import { X, Undo2 } from 'lucide-react';
import { TextAlignType } from '../hooks/useStudyViewState';

interface ExpandableContentRendererProps {
  content: string;
  fontSize?: number;
  textAlign?: TextAlignType;
  className?: string;
  contentType: string;
  noteTitle?: string;
}

export const ExpandableContentRenderer = ({
  content,
  fontSize = 16,
  textAlign = 'left',
  className = '',
  contentType,
  noteTitle
}: ExpandableContentRendererProps) => {
  const [selectedText, setSelectedText] = useState('');
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [showContextMenu, setShowContextMenu] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const { expansions, isExpanding, expandContent, removeExpansion, clearAllExpansions } = 
    useContentExpansion(content, contentType, noteTitle);

  // Insert expansions into content
  const getContentWithExpansions = useCallback(() => {
    if (expansions.length === 0) return content;

    // Sort expansions by position (descending) so we can insert from end to beginning
    const sortedExpansions = [...expansions].sort((a, b) => b.position - a.position);
    
    let modifiedContent = content;
    
    sortedExpansions.forEach((expansion) => {
      const expansionHtml = `
        <div class="content-expansion bg-green-50 border-l-4 border-green-500 pl-4 my-4 rounded-r-md" data-expansion-id="${expansion.id}">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                AI Expanded
              </span>
              <span class="text-xs text-gray-500">${expansion.timestamp.toLocaleTimeString()}</span>
            </div>
            <button class="expansion-remove-btn text-gray-400 hover:text-red-500 p-1" data-expansion-id="${expansion.id}">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div class="expanded-content text-sm">
            ${expansion.expandedContent}
          </div>
        </div>
      `;

      // Insert after the original text position
      const beforeText = modifiedContent.substring(0, expansion.position);
      const afterText = modifiedContent.substring(expansion.position);
      modifiedContent = beforeText + expansionHtml + afterText;
    });

    return modifiedContent;
  }, [content, expansions]);

  const handleTextSelection = useCallback((event: React.MouseEvent) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setShowContextMenu(false);
      return;
    }

    const selectedText = selection.toString().trim();
    if (!selectedText || selectedText.length < 3) {
      setShowContextMenu(false);
      return;
    }

    // Don't show context menu for selections within existing expansions
    const range = selection.getRangeAt(0);
    const expansionElement = range.commonAncestorContainer.parentElement?.closest('.content-expansion');
    if (expansionElement) {
      setShowContextMenu(false);
      return;
    }

    setSelectedText(selectedText);
    setMenuPosition({ x: event.clientX, y: event.clientY });
    setShowContextMenu(true);
  }, []);

  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    handleTextSelection(event);
  }, [handleTextSelection]);

  const handleExpand = useCallback(async (text: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectionPosition = range.startOffset;
    
    await expandContent(text, selectionPosition);
    setShowContextMenu(false);
    
    // Clear selection
    selection.removeAllRanges();
  }, [expandContent]);

  const handleRemoveExpansion = useCallback((event: React.MouseEvent) => {
    const button = event.target as HTMLElement;
    const expansionId = button.closest('[data-expansion-id]')?.getAttribute('data-expansion-id');
    if (expansionId) {
      removeExpansion(expansionId);
    }
  }, [removeExpansion]);

  // Handle clicks on remove buttons within expansions
  React.useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const button = (event.target as HTMLElement).closest('.expansion-remove-btn');
      if (button) {
        const expansionId = button.getAttribute('data-expansion-id');
        if (expansionId) {
          removeExpansion(expansionId);
        }
      }
    };

    if (contentRef.current) {
      contentRef.current.addEventListener('click', handleClick);
    }

    return () => {
      if (contentRef.current) {
        contentRef.current.removeEventListener('click', handleClick);
      }
    };
  }, [removeExpansion]);

  return (
    <div className={`relative ${className}`}>
      {/* Expansion controls */}
      {expansions.length > 0 && (
        <div className="flex items-center gap-2 mb-4 p-2 bg-green-50 rounded-md border border-green-200">
          <span className="text-sm text-green-700 font-medium">
            {expansions.length} expansion{expansions.length > 1 ? 's' : ''} added
          </span>
          <Button
            onClick={clearAllExpansions}
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-green-600 hover:text-green-800"
          >
            <Undo2 className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        </div>
      )}

      {/* Content with expansions */}
      <div
        ref={contentRef}
        onMouseUp={handleTextSelection}
        onContextMenu={handleContextMenu}
        className="select-text cursor-text"
      >
        <UnifiedContentRenderer
          content={getContentWithExpansions()}
          fontSize={fontSize}
          textAlign={textAlign}
          className="expandable-content"
        />
      </div>

      {/* Context menu */}
      <ContentExpansionContextMenu
        selectedText={selectedText}
        position={menuPosition}
        onExpand={handleExpand}
        onClose={() => setShowContextMenu(false)}
        isVisible={showContextMenu}
      />

      {/* Custom CSS classes are handled via Tailwind */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .expandable-content .content-expansion {
            animation: fadeIn 0.3s ease-in-out;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .expandable-content .expansion-remove-btn {
            transition: all 0.2s ease;
          }

          .expandable-content .expansion-remove-btn:hover {
            transform: scale(1.1);
          }
        `
      }} />
    </div>
  );
};