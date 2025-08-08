
import { useState } from "react";
import { CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Note } from "@/types/note";
import { StudyViewControls } from "../controls/StudyViewControls";
import { TextAlignType } from "../hooks/useStudyViewState";
type EnhancementFunction = string;
import { toast } from "sonner";
import { StudyViewTitleSection } from "./StudyViewTitleSection";

import { StudyViewExportDropdown } from "./StudyViewExportDropdown";
import { StudyViewConversionDropdown } from "./StudyViewConversionDropdown";
import { StudyViewYouTubeButton } from "./StudyViewYouTubeButton";
import { supabase } from "@/integrations/supabase/client";


interface StudyViewHeaderProps {
  note: Note;
  fontSize: number;
  textAlign: TextAlignType;
  isFullWidth: boolean;
  isFullScreen: boolean;
  isEditing: boolean;
  isSaving: boolean;
  editableTitle: string;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  onChangeTextAlign: (align: TextAlignType) => void;
  onToggleWidth: () => void;
  onToggleFullScreen: () => void;
  onToggleEditing: () => void;
  onSave: () => void;
  onTitleChange: (title: string) => void;
  onEnhance: (enhancedContent: string, enhancementType?: EnhancementFunction) => void;
  onEnhancementProcessing?: (enhancementType: string) => void;
  onActiveContentTypeChange?: (type: string) => void;
  // Progress tracking props
  isEnhancing?: boolean;
}

export const StudyViewHeader = ({
  note,
  fontSize,
  textAlign,
  isFullWidth,
  isFullScreen,
  isEditing,
  isSaving,
  editableTitle,
  onIncreaseFontSize,
  onDecreaseFontSize,
  onChangeTextAlign,
  onToggleWidth,
  onToggleFullScreen,
  onToggleEditing,
  onSave,
  onTitleChange,
  onEnhance,
  onEnhancementProcessing,
  onActiveContentTypeChange,
  isEnhancing = false,
}: StudyViewHeaderProps) => {

  // Derive a usable YouTube URL if the stored one is missing
  const extractYouTubeUrl = (text?: string | null): string | null => {
    if (!text) return null;
    const regex = /(?:https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/))([\w-]{11})/;
    const match = text.match(regex);
    if (match?.[1]) {
      return `https://www.youtube.com/watch?v=${match[1]}`;
    }
    return null;
  };

  const getYouTubeUrl = (): string | null => {
    if (note.video_url) return note.video_url;
    return (
      extractYouTubeUrl(note.content) ||
      extractYouTubeUrl(note.markdown_content) ||
      null
    );
  };

  const youtubeUrl = getYouTubeUrl();

  return (
    <CardHeader className="border-b p-4 bg-card">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex-1 w-full sm:w-auto">
          <StudyViewTitleSection
            note={note}
            isEditing={isEditing}
            editableTitle={editableTitle}
            onTitleChange={onTitleChange}
          />
        </div>

        <div className="flex items-center gap-2">
          {!isEditing && (
            <>
              <StudyViewConversionDropdown note={note} />
              <StudyViewExportDropdown note={note} />
              
{note.sourceType === 'youtube' && youtubeUrl && (
                <StudyViewYouTubeButton videoUrl={youtubeUrl} />
              )}
            </>
          )}

          <StudyViewControls
            fontSize={fontSize}
            textAlign={textAlign}
            isFullWidth={isFullWidth}
            isFullScreen={isFullScreen}
            isEditing={isEditing}
            isSaving={isSaving}
            hideAlignment={true}
            onIncreaseFontSize={onIncreaseFontSize}
            onDecreaseFontSize={onDecreaseFontSize}
            onChangeTextAlign={onChangeTextAlign}
            onToggleWidth={onToggleWidth}
            onToggleFullScreen={onToggleFullScreen}
            onToggleEditing={onToggleEditing}
            onSave={onSave}
          />
        </div>
      </div>
    </CardHeader>
  );
};
