
import { useState, useRef, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { TextSelectionToFlashcard } from "./TextSelectionToFlashcard";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface TextSelectionPopoverProps {
  containerRef: React.RefObject<HTMLDivElement>;
  disabled?: boolean;
}

export const TextSelectionPopover = ({ containerRef, disabled = false }: TextSelectionPopoverProps) => {
  const [selectedText, setSelectedText] = useState("");
  const [showPopover, setShowPopover] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleDocumentMouseUp = (e: MouseEvent) => {
    if (disabled) return;
    
    const selection = window.getSelection();
    
    if (selection && selection.toString().trim() !== "") {
      // Make sure the selection is inside our container
      if (containerRef.current && containerRef.current.contains(selection.anchorNode as Node)) {
        const selectedContent = selection.toString().trim();
        
        if (selectedContent.length > 0) {
          setSelectedText(selectedContent);
          
          // Calculate position for the popover
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          
          setPosition({
            top: rect.bottom + window.scrollY,
            left: rect.left + (rect.width / 2) + window.scrollX,
          });
          
          setShowPopover(true);
          return;
        }
      }
    }
    
    // If we get here, there's no valid selection
    setShowPopover(false);
  };
  
  const handleClickOutside = (e: MouseEvent) => {
    if (
      popoverRef.current && 
      !popoverRef.current.contains(e.target as Node) &&
      showPopover
    ) {
      setShowPopover(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mouseup", handleDocumentMouseUp);
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.removeEventListener("mouseup", handleDocumentMouseUp);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [containerRef, disabled]);

  const handleConvertClick = () => {
    setShowDialog(true);
    setShowPopover(false);
  };

  return (
    <>
      {showPopover && (
        <div 
          ref={popoverRef}
          style={{
            position: 'absolute',
            top: position.top + 'px',
            left: position.left + 'px',
            transform: 'translate(-50%, 8px)',
            zIndex: 100
          }}
        >
          <div className="bg-white rounded-lg shadow-lg border p-2">
            <Button size="sm" onClick={handleConvertClick}>
              Convert to Flashcard
            </Button>
          </div>
        </div>
      )}
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <TextSelectionToFlashcard 
            selectedText={selectedText}
            onClose={() => setShowDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
