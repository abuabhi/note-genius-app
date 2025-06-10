
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Plus, BookOpen, ArrowRight } from 'lucide-react';
import { Note } from '@/types/note';
import { useFlashcards } from '@/contexts/flashcards';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface FlashcardGenerationProps {
  note: Note;
  selectedText?: string;
  conversationContext?: string;
  onFlashcardCreated?: () => void;
}

export const FlashcardGeneration = ({ 
  note, 
  selectedText, 
  conversationContext,
  onFlashcardCreated 
}: FlashcardGenerationProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { createFlashcard, flashcardSets } = useFlashcards();
  const navigate = useNavigate();

  const handleQuickGeneration = async () => {
    if (!selectedText && !conversationContext) {
      toast.error('No content selected for flashcard generation');
      return;
    }

    setIsGenerating(true);
    try {
      const content = selectedText || conversationContext || note.content || '';
      
      // Find a default set or use the first available set
      const defaultSet = flashcardSets.find(set => 
        set.subject === note.category || set.name.includes(note.title)
      ) || flashcardSets[0];

      if (!defaultSet) {
        toast.error('Please create a flashcard set first');
        return;
      }
      
      // Create a simple flashcard from the content
      const question = `What is the key point about "${content.slice(0, 50)}..."?`;
      const answer = content;

      await createFlashcard({
        front_content: question,
        back_content: answer,
        set_id: defaultSet.id,
        subject: note.category
      });

      toast.success('Flashcard created successfully!');
      onFlashcardCreated?.();
    } catch (error) {
      console.error('Error creating flashcard:', error);
      toast.error('Failed to create flashcard');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAdvancedGeneration = () => {
    const params = new URLSearchParams({
      noteId: note.id,
      fromChat: 'true'
    });
    
    if (selectedText) {
      params.append('selectedText', selectedText);
    }
    
    navigate(`/note-to-flashcard?${params.toString()}`);
  };

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          Generate Flashcards
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Generation */}
        {(selectedText || conversationContext) && (
          <div className="p-3 bg-white rounded-lg border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary" className="text-xs">
                {selectedText ? 'Selected Text' : 'From Conversation'}
              </Badge>
              <Button
                size="sm"
                onClick={handleQuickGeneration}
                disabled={isGenerating}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isGenerating ? (
                  <Zap className="h-3 w-3 animate-pulse" />
                ) : (
                  <Plus className="h-3 w-3" />
                )}
                Quick Create
              </Button>
            </div>
            <p className="text-sm text-slate-600 line-clamp-2">
              "{selectedText || conversationContext?.slice(0, 100) + '...'}"
            </p>
          </div>
        )}

        {/* Advanced Generation */}
        <div className="space-y-3">
          <Button
            onClick={handleAdvancedGeneration}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-center gap-3">
              <BookOpen className="h-5 w-5" />
              <ArrowRight className="h-4 w-4" />
              <Zap className="h-5 w-5" />
              <span>Advanced Generation</span>
            </div>
          </Button>

          <div className="text-xs text-slate-500 text-center">
            Open full flashcard generation with AI-powered options
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
