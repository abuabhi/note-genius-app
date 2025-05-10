
import { Note } from "@/types/note";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Archive, Camera, FileText, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NoteCardActions } from "./NoteCardActions";
import { NoteTagList } from "../details/NoteTagList";
import { generateColorFromString } from "@/utils/colorUtils";
import { getBestTextColor } from "@/utils/colorUtils";
import { NoteSummary } from "./NoteSummary";
import { useState } from "react";
import { updateNoteInDatabase } from "@/contexts/notes/operations";
import { enrichNote } from "@/hooks/noteEnrichment/enrichmentService";

interface NoteCardProps {
  note: Note;
  onNoteClick: (note: Note) => void;
  onShowDetails: (note: Note, e: React.MouseEvent) => void;
  onPin: (id: string, isPinned: boolean, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  confirmDelete: string | null;
}

export const NoteCard = ({
  note,
  onNoteClick,
  onShowDetails,
  onPin,
  onDelete,
  confirmDelete
}: NoteCardProps) => {
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  
  const handleGenerateSummary = async () => {
    try {
      setIsGeneratingSummary(true);
      
      // Update note status to generating
      await updateNoteInDatabase(note.id, {
        summary_status: 'generating'
      });
      note.summary_status = 'generating';
      
      // Generate summary using the enrichment service
      const content = note.content || note.description;
      const summaryContent = await enrichNote(note, 'summarize');
      
      // Truncate to 150 characters if longer
      const truncatedSummary = summaryContent.length > 150 
        ? summaryContent.substring(0, 147) + '...'
        : summaryContent;
        
      // Update the note with the generated summary
      await updateNoteInDatabase(note.id, {
        summary: truncatedSummary,
        summary_generated_at: new Date().toISOString(),
        summary_status: 'completed'
      });
      
      // Update local state
      note.summary = truncatedSummary;
      note.summary_generated_at = new Date().toISOString();
      note.summary_status = 'completed';
    } catch (error) {
      console.error("Error generating summary:", error);
      // Update status to failed
      await updateNoteInDatabase(note.id, {
        summary_status: 'failed'
      });
      note.summary_status = 'failed';
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <Card 
      key={note.id}
      className={`
        hover:shadow-lg transition-shadow cursor-pointer border-mint-200 
        bg-white/50 backdrop-blur-sm hover:bg-mint-50/60
        ${note.pinned ? 'ring-2 ring-mint-400 shadow-md' : ''}
        ${note.archived ? 'opacity-75' : ''}
      `}
      onClick={() => onNoteClick(note)}
    >
      <CardHeader className="relative p-4 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl text-mint-800">
            {note.title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-mint-600">{note.date}</span>
            <NoteCardActions 
              noteId={note.id} 
              isPinned={!!note.pinned} 
              onPin={onPin} 
              onDelete={onDelete}
              isConfirmingDelete={confirmDelete === note.id}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {/* Display Category */}
        <div className="flex items-center gap-1 mb-2">
          <FileText className="h-3 w-3 text-mint-700" />
          <Badge 
            className="text-xs"
            style={{
              backgroundColor: generateColorFromString(note.category),
              color: getBestTextColor(generateColorFromString(note.category))
            }}
          >
            {note.category}
          </Badge>
        </div>

        {/* Display Summary */}
        <NoteSummary
          summary={note.summary}
          description={note.description}
          status={isGeneratingSummary ? 'generating' : note.summary_status}
          onGenerateSummary={handleGenerateSummary}
        />

        {/* Display Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex items-center gap-1 mt-3">
            <Tag className="h-3 w-3 text-mint-700" />
            <div className="flex-grow">
              <NoteTagList 
                tags={note.tags
                  .filter(tag => tag.name !== note.category) // Don't show category tag twice
                  .slice(0, 3)
                }
              />
              {note.tags.length > 4 && (
                <Badge variant="outline" className="text-xs mt-1">
                  +{note.tags.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 flex justify-between">
        <div className="flex items-center">
          {note.sourceType === 'scan' && (
            <div className="flex items-center">
              <Camera className="h-3 w-3 text-mint-500 mr-1" />
              <span className="text-xs text-mint-500">Scanned</span>
            </div>
          )}
          {note.archived && (
            <div className="flex items-center ml-2">
              <Archive className="h-3 w-3 text-mint-500 mr-1" />
              <span className="text-xs text-mint-500">Archived</span>
            </div>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 text-xs text-mint-600 hover:text-mint-800"
          onClick={(e) => onShowDetails(note, e)}
        >
          Details
        </Button>
      </CardFooter>
    </Card>
  );
};
