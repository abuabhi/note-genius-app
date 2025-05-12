
import React from "react";
import { Button } from "@/components/ui/button";
import {
  AlignCenter,
  AlignJustify,
  Maximize,
  Minimize,
  LayoutGrid,
  LayoutTemplate,
  Plus,
  Minus,
  Edit,
  Save
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TextAlignType } from "../hooks/useStudyViewState";

interface StudyViewControlsProps {
  fontSize: number;
  textAlign: TextAlignType;
  isFullWidth: boolean;
  isFullScreen: boolean;
  isEditing?: boolean;
  isSaving?: boolean;
  hideAlignment?: boolean; // Added option to hide alignment controls
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  onChangeTextAlign: (align: TextAlignType) => void;
  onToggleWidth: () => void;
  onToggleFullScreen: () => void;
  onToggleEditing?: () => void;
  onSave?: () => void;
}

export const StudyViewControls: React.FC<StudyViewControlsProps> = ({
  fontSize,
  textAlign,
  isFullWidth,
  isFullScreen,
  isEditing = false,
  isSaving = false,
  hideAlignment = false, // Default to showing the alignment control
  onIncreaseFontSize,
  onDecreaseFontSize,
  onChangeTextAlign,
  onToggleWidth,
  onToggleFullScreen,
  onToggleEditing,
  onSave
}) => {
  // Get the right alignment icon based on the current alignment
  const getAlignmentIcon = () => {
    switch (textAlign) {
      case "center":
        return <AlignCenter className="h-4 w-4" />;
      case "justify":
        return <AlignJustify className="h-4 w-4" />;
      default:
        return <AlignCenter className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex flex-wrap justify-end gap-1 mt-2 sm:mt-0">
      <div className="flex items-center shadow-sm border rounded-md">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-none rounded-l-md"
          onClick={onDecreaseFontSize}
          title="Decrease font size"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <div className="px-2 flex items-center justify-center min-w-[24px] text-sm border-l border-r">
          {fontSize}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-none rounded-r-md"
          onClick={onIncreaseFontSize}
          title="Increase font size"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Edit/Save Button */}
      {onToggleEditing && onSave && (
        isEditing ? (
          <Button
            variant="default"
            size="sm"
            onClick={onSave}
            disabled={isSaving}
            className="h-8 flex items-center gap-1 bg-mint-600 hover:bg-mint-700"
            title="Save changes"
          >
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">Save</span>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleEditing}
            className="h-8 flex items-center gap-1"
            title="Edit note"
          >
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
        )
      )}

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onToggleWidth}
        title={isFullWidth ? "Narrow width" : "Full width"}
      >
        {isFullWidth ? (
          <LayoutTemplate className="h-4 w-4" />
        ) : (
          <LayoutGrid className="h-4 w-4" />
        )}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onToggleFullScreen}
        title={isFullScreen ? "Exit full screen" : "Full screen"}
      >
        {isFullScreen ? (
          <Minimize className="h-4 w-4" />
        ) : (
          <Maximize className="h-4 w-4" />
        )}
      </Button>
      
      {/* Only render alignment control if not hidden */}
      {!hideAlignment && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="Text alignment"
            >
              {getAlignmentIcon()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onChangeTextAlign("center")}>
              <AlignCenter className="h-4 w-4 mr-2" />
              <span>Align Center</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onChangeTextAlign("justify")}>
              <AlignJustify className="h-4 w-4 mr-2" />
              <span>Justify</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};
