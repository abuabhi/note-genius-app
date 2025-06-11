import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Plus, Check } from 'lucide-react';
import { useFlashcards } from '@/contexts/flashcards';

interface FlashcardSet {
  id: string;
  name: string;
  description?: string;
  subject?: string;
  flashcard_count?: number;
}

interface FlashcardSetSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSet: (setId: string) => void;
  noteTitle: string;
  noteCategory?: string;
  suggestedSetId?: string;
}

export const FlashcardSetSelectionModal = ({
  isOpen,
  onClose,
  onSelectSet,
  noteTitle,
  noteCategory,
  suggestedSetId
}: FlashcardSetSelectionModalProps) => {
  const { flashcardSets, createFlashcardSet } = useFlashcards();
  const [selectedSetId, setSelectedSetId] = useState<string | null>(suggestedSetId || null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Create new set form state
  const [newSetName, setNewSetName] = useState(`${noteTitle} Flashcards`);
  const [newSetDescription, setNewSetDescription] = useState(`Flashcards created from "${noteTitle}" note`);
  const [newSetSubject, setNewSetSubject] = useState(noteCategory || 'General');

  const handleSelectSet = () => {
    if (selectedSetId) {
      onSelectSet(selectedSetId);
      onClose();
    }
  };

  const handleCreateNewSet = async () => {
    if (!newSetName.trim()) return;
    
    setIsCreating(true);
    try {
      const newSet = await createFlashcardSet({
        name: newSetName,
        description: newSetDescription || undefined,
        subject: newSetSubject,
        topic: noteTitle
      });
      
      onSelectSet(newSet.id);
      onClose();
    } catch (error) {
      console.error('Failed to create flashcard set:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const suggestedSet = flashcardSets.find(set => set.id === suggestedSetId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Choose Flashcard Set
          </DialogTitle>
          <DialogDescription>
            Select an existing flashcard set or create a new one for your flashcard from "{noteTitle}".
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Suggested Set */}
          {suggestedSet && (
            <div>
              <Label className="text-sm font-medium text-green-700 mb-2 block">
                🎯 Recommended Set
              </Label>
              <Card 
                className={`cursor-pointer transition-all ${
                  selectedSetId === suggestedSet.id 
                    ? 'ring-2 ring-green-500 bg-green-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedSetId(suggestedSet.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{suggestedSet.name}</h4>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          Suggested
                        </Badge>
                      </div>
                      {suggestedSet.description && (
                        <p className="text-sm text-gray-600 mb-2">{suggestedSet.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {suggestedSet.subject && <span>Subject: {suggestedSet.subject}</span>}
                        <span>{suggestedSet.flashcard_count || 0} flashcards</span>
                      </div>
                    </div>
                    {selectedSetId === suggestedSet.id && (
                      <Check className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Existing Sets */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Existing Sets
            </Label>
            <div className="grid gap-2 max-h-60 overflow-y-auto">
              {flashcardSets
                .filter(set => set.id !== suggestedSetId)
                .map((set) => (
                <Card 
                  key={set.id}
                  className={`cursor-pointer transition-all ${
                    selectedSetId === set.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedSetId(set.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{set.name}</h4>
                        {set.description && (
                          <p className="text-xs text-gray-600 mt-1">{set.description}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          {set.subject && <span>{set.subject}</span>}
                          <span>{set.flashcard_count || 0} flashcards</span>
                        </div>
                      </div>
                      {selectedSetId === set.id && (
                        <Check className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Create New Set */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Create New Set</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="h-auto p-1"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {showCreateForm && (
              <Card className="border-dashed">
                <CardContent className="p-4 space-y-3">
                  <div>
                    <Label htmlFor="setName" className="text-xs">Set Name</Label>
                    <Input
                      id="setName"
                      value={newSetName}
                      onChange={(e) => setNewSetName(e.target.value)}
                      placeholder="Enter set name"
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="setDescription" className="text-xs">Description (optional)</Label>
                    <Textarea
                      id="setDescription"
                      value={newSetDescription}
                      onChange={(e) => setNewSetDescription(e.target.value)}
                      placeholder="Enter description"
                      className="h-16 text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="setSubject" className="text-xs">Subject</Label>
                    <Input
                      id="setSubject"
                      value={newSetSubject}
                      onChange={(e) => setNewSetSubject(e.target.value)}
                      placeholder="Enter subject"
                      className="h-8"
                    />
                  </div>
                  <Button
                    onClick={handleCreateNewSet}
                    disabled={!newSetName.trim() || isCreating}
                    size="sm"
                    className="w-full"
                  >
                    {isCreating ? 'Creating...' : 'Create and Use Set'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSelectSet}
            disabled={!selectedSetId}
          >
            Use Selected Set
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
