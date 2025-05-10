
import React from "react";
import { Button } from "@/components/ui/button";
import {
  AlignLeft,
  AlignCenter,
  AlignJustify,
  Maximize,
  Minimize,
  LayoutGrid,
  LayoutTemplate,
  Plus,
  Minus,
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
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  onChangeTextAlign: (align: TextAlignType) => void;
  onToggleWidth: () => void;
  onToggleFullScreen: () => void;
}

export const StudyViewControls: React.FC<StudyViewControlsProps> = ({
  fontSize,
  textAlign,
  isFullWidth,
  isFullScreen,
  onIncreaseFontSize,
  onDecreaseFontSize,
  onChangeTextAlign,
  onToggleWidth,
  onToggleFullScreen,
}) => {
  // Get the right alignment icon based on the current alignment
  const getAlignmentIcon = () => {
    switch (textAlign) {
      case "left":
        return <AlignLeft className="h-4 w-4" />;
      case "center":
        return <AlignCenter className="h-4 w-4" />;
      case "justify":
        return <AlignJustify className="h-4 w-4" />;
      default:
        return <AlignLeft className="h-4 w-4" />;
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
          <DropdownMenuItem onClick={() => onChangeTextAlign("left")}>
            <AlignLeft className="h-4 w-4 mr-2" />
            <span>Align Left</span>
          </DropdownMenuItem>
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
    </div>
  );
};
