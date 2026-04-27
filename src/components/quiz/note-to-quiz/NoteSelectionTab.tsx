
import { useState } from 'react';
import { useOptimizedNotes } from '@/contexts/OptimizedNotesContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, Clock, Info, Sparkles } from 'lucide-react';
import { Note } from '@/types/note';
import { analyzeSelectedNotesSubjects } from '@/utils/subjectAnalyzer';

interface NoteSelectionTabProps {
  selectedNotes: Note[];
  onNotesChange: (notes: Note[]) => void;
  onNoteToggle?: (note: Note) => void;
  onGenerateQuiz?: () => Promise<void>;
  isGenerating?: boolean;
  numberOfQuestions?: number;
  onNumberOfQuestionsChange?: (count: number) => void;
  recommendedQuestions?: number;
  onUseRecommended?: () => void;
}

export const NoteSelectionTab = ({
  selectedNotes,
  onNotesChange,
  onNoteToggle,
  onGenerateQuiz,
  isGenerating,
  numberOfQuestions,
  onNumberOfQuestionsChange,
  recommendedQuestions,
  onUseRecommended,
}: NoteSelectionTabProps) => {
  const { notes } = useOptimizedNotes();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleNoteSelection = (note: Note) => {
    const isSelected = selectedNotes.some(n => n.id === note.id);
    if (isSelected) {
      onNotesChange(selectedNotes.filter(n => n.id !== note.id));
    } else {
      onNotesChange([...selectedNotes, note]);
    }
    
    // Call the optional onNoteToggle callback if provided
    onNoteToggle?.(note);
  };

  // Analyze selected notes for multiple subjects
  const subjectAnalysis = analyzeSelectedNotesSubjects(selectedNotes);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Multi-Subject Warning */}
      {subjectAnalysis.hasMultipleSubjects && selectedNotes.length > 0 && (
        <Alert className="border-amber-200 bg-amber-50">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <div className="space-y-1">
              <p className="font-medium">Multi-Subject Quiz</p>
              <p className="text-sm">
                You've selected notes from {subjectAnalysis.totalSubjects} different subjects: {' '}
                {subjectAnalysis.distributions.map((dist, index) => (
                  <span key={dist.subjectId}>
                    <span className="font-medium">{dist.subjectName}</span> ({dist.count} note{dist.count > 1 ? 's' : ''})
                    {index < subjectAnalysis.distributions.length - 1 && ', '}
                  </span>
                ))}
              </p>
              <p className="text-sm">
                The quiz will include questions from all notes, but will be categorized under{' '}
                <span className="font-medium">{subjectAnalysis.primarySubject?.subjectName}</span>{' '}
                since it has the most notes.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Quiz Generation Controls */}
      {(onGenerateQuiz && numberOfQuestions !== undefined && onNumberOfQuestionsChange) && (
        <div className="bg-mint-50 p-4 rounded-lg space-y-3">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm font-medium">Number of Questions:</label>
            <Input
              type="number"
              min={1}
              max={50}
              value={numberOfQuestions}
              onChange={(e) => onNumberOfQuestionsChange(parseInt(e.target.value) || 1)}
              className="w-20"
            />
          </div>
          {recommendedQuestions !== undefined && selectedNotes.length > 0 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Recommended: {recommendedQuestions} (based on note length)</span>
              {numberOfQuestions !== recommendedQuestions && onUseRecommended && (
                <button
                  type="button"
                  onClick={onUseRecommended}
                  className="text-mint-700 hover:text-mint-800 underline underline-offset-2"
                >
                  Use recommended
                </button>
              )}
            </div>
          )}
          <Button
            onClick={onGenerateQuiz}
            disabled={selectedNotes.length === 0 || isGenerating}
            className="w-full bg-gradient-to-r from-mint-600 to-mint-700 hover:from-mint-700 hover:to-mint-800 transition-all duration-200"
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span className="animate-pulse">Generating Quiz Questions...</span>
              </div>
            ) : (
              `Generate Quiz from ${selectedNotes.length} Notes`
            )}
          </Button>
        </div>
      )}

      <div className="grid gap-3 max-h-96 overflow-y-auto">
        {filteredNotes.map((note) => {
          const isSelected = selectedNotes.some(n => n.id === note.id);
          const enriched = !!(note as any)?.enriched_content?.trim();

          return (
            <Card
              key={note.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary bg-mint-50' : ''
              }`}
              onClick={() => toggleNoteSelection(note)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-medium text-sm">{note.title}</h3>
                      {enriched ? (
                        <Badge variant="secondary" className="bg-mint-100 text-mint-700 hover:bg-mint-100 gap-1 text-[10px] py-0 h-4">
                          <Sparkles className="h-2.5 w-2.5" /> Enriched
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] py-0 h-4 text-gray-600">
                          Original
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {note.description || note.content}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {note.subject}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {note.date}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleNoteSelection(note);
                    }}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredNotes.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No notes found matching your search.</p>
        </div>
      )}
    </div>
  );
};
