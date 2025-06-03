
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Note } from "@/types/note";
import { FileText, ArrowRight, Book, Sparkles, Zap, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface QuickConversionPanelProps {
  note: Note;
  selectedText?: string;
  onTextSelectionConvert?: (frontText: string, backText: string) => Promise<void>;
}

export const QuickConversionPanel = ({
  note,
  selectedText,
  onTextSelectionConvert
}: QuickConversionPanelProps) => {
  const navigate = useNavigate();
  const [isConverting, setIsConverting] = useState(false);

  const handleFullNoteConversion = () => {
    navigate(`/note-to-flashcard?noteId=${note.id}`, {
      state: { 
        selectedNotes: [note],
        fromStudyView: true 
      }
    });
  };

  const handleQuickSelectionConvert = async () => {
    if (!selectedText || !onTextSelectionConvert) return;
    
    setIsConverting(true);
    try {
      // Simple conversion: selected text as question, note title as context
      await onTextSelectionConvert(
        selectedText,
        `From "${note.title}"`
      );
      toast.success("Flashcard created from selection");
    } catch (error) {
      toast.error("Failed to create flashcard");
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <Card className="border-mint-200 bg-gradient-to-br from-mint-50/50 to-blue-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="w-8 h-8 bg-gradient-to-br from-mint-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          Quick Flashcard Creation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Text Selection Conversion */}
        {selectedText && (
          <div className="p-3 bg-white rounded-lg border border-mint-100">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary" className="text-xs">
                Selected Text
              </Badge>
              <Button
                size="sm"
                onClick={handleQuickSelectionConvert}
                disabled={isConverting}
                className="bg-mint-600 hover:bg-mint-700 text-white"
              >
                {isConverting ? (
                  <Zap className="h-3 w-3 animate-pulse" />
                ) : (
                  <Plus className="h-3 w-3" />
                )}
                Create Card
              </Button>
            </div>
            <p className="text-sm text-slate-600 line-clamp-2">
              "{selectedText}"
            </p>
          </div>
        )}

        {/* Full Note Conversion */}
        <div className="space-y-3">
          <Button
            onClick={handleFullNoteConversion}
            className="w-full bg-gradient-to-r from-mint-600 to-blue-600 hover:from-mint-700 hover:to-blue-700 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-center gap-3">
              <FileText className="h-5 w-5" />
              <ArrowRight className="h-4 w-4" />
              <Book className="h-5 w-5" />
              <span>Convert Full Note</span>
            </div>
          </Button>

          <div className="text-xs text-slate-500 text-center">
            Open advanced conversion options with AI-powered suggestions
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
