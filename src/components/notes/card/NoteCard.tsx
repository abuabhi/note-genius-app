
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
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  
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
      
      // Format as markdown and truncate if too long
      const markdownSummary = summaryContent.length > 250 
        ? summaryContent.substring(0, 247) + '...'
        : summaryContent;
        
      // Update the note with the generated summary
      await updateNoteInDatabase(note.id, {
        summary: markdownSummary,
        summary_generated_at: new Date().toISOString(),
        summary_status: 'completed'
      });
      
      // Update local state
      note.summary = markdownSummary;
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

  const handleGoToStudyMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/notes/study/${note.id}`);
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
        {/* Card actions positioned absolutely */}
        <NoteCardActions 
          noteId={note.id} 
          isPinned={!!note.pinned} 
          onPin={onPin} 
          onDelete={onDelete}
          isConfirmingDelete={confirmDelete === note.id}
        />
        
        <div className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl text-mint-800 pr-8"> {/* Add padding-right to avoid overlap with pin */}
            {note.title}
          </CardTitle>
        </div>
        
        {/* Date and Category in same row */}
        <div className="flex items-center justify-between mt-1">
          <span className="text-sm text-mint-600">{note.date}</span>
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3 text-mint-700" />
            <span 
              className="text-sm font-bold italic"
              style={{
                color: generateColorFromString(note.category),
              }}
            >
              {note.category}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {/* Display Summary */}
        <NoteSummary
          summary={note.summary}
          description={note.description}
          status={isGeneratingSummary ? 'generating' : note.summary_status}
          onGenerateSummary={handleGenerateSummary}
        />
      </CardContent>
      <CardFooter className="p-4 pt-2 flex justify-between">
        {/* Tags at bottom left */}
        <div className="flex-1">
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 items-center">
              <Tag className="h-3 w-3 text-mint-700" />
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
          )}
          
          <div className="flex flex-wrap mt-1 gap-2">
            {note.sourceType === 'scan' && (
              <div className="flex items-center">
                <Camera className="h-3 w-3 text-mint-500 mr-1" />
                <span className="text-xs text-mint-500">Scanned</span>
              </div>
            )}
            {note.archived && (
              <div className="flex items-center">
                <Archive className="h-3 w-3 text-mint-500 mr-1" />
                <span className="text-xs text-mint-500">Archived</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Study Mode button at bottom right */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 text-xs text-mint-600 hover:text-mint-800"
          onClick={handleGoToStudyMode}
        >
          Study Mode
        </Button>
      </CardFooter>
    </Card>
  );
};
