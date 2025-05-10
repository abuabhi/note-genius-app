
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  AlignLeft, 
  AlignCenter, 
  AlignJustify,
  Minus,
  Plus,
  Moon,
  Sun,
  ArrowLeftRight,
  Maximize,
  Minimize,
} from "lucide-react";

interface StudyViewControlsProps {
  fontSize: number;
  textAlign: string;
  isDarkMode: boolean;
  isFullWidth: boolean;
  isFullScreen: boolean;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  onToggleDarkMode: () => void;
  onChangeTextAlign: (align: string) => void;
  onToggleWidth: () => void;
  onToggleFullScreen: () => void;
}

export const StudyViewControls = ({
  fontSize,
  textAlign,
  isDarkMode,
  isFullWidth,
  isFullScreen,
  onIncreaseFontSize,
  onDecreaseFontSize,
  onToggleDarkMode,
  onChangeTextAlign,
  onToggleWidth,
  onToggleFullScreen
}: StudyViewControlsProps) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        size="icon"
        variant="outline"
        onClick={onDecreaseFontSize}
        title="Decrease font size"
        className={`${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : ''}`}
        disabled={fontSize <= 12}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Button
        size="icon" 
        variant="outline"
        onClick={onIncreaseFontSize}
        title="Increase font size"
        className={`${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : ''}`}
        disabled={fontSize >= 24}
      >
        <Plus className="h-4 w-4" />
      </Button>
      <Separator orientation="vertical" className="h-6" />
      <Button
        size="icon"
        variant="outline"
        onClick={() => onChangeTextAlign("left")}
        title="Align left"
        className={`${textAlign === "left" ? "bg-mint-100 hover:bg-mint-200" : ""} ${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : ''}`}
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="outline"
        onClick={() => onChangeTextAlign("center")}
        title="Align center"
        className={`${textAlign === "center" ? "bg-mint-100 hover:bg-mint-200" : ""} ${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : ''}`}
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="outline"
        onClick={() => onChangeTextAlign("justify")}
        title="Justify text"
        className={`${textAlign === "justify" ? "bg-mint-100 hover:bg-mint-200" : ""} ${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : ''}`}
      >
        <AlignJustify className="h-4 w-4" />
      </Button>
      <Separator orientation="vertical" className="h-6" />
      <Button
        size="icon"
        variant="outline"
        onClick={onToggleWidth}
        title={isFullWidth ? "Narrow width" : "Full width"}
        className={`${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : ''}`}
      >
        <ArrowLeftRight className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="outline"
        onClick={onToggleFullScreen}
        title={isFullScreen ? "Exit fullscreen" : "Fullscreen"}
        className={`${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : ''}`}
      >
        {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
      </Button>
      <Button
        size="icon"
        variant="outline"
        onClick={onToggleDarkMode}
        title={isDarkMode ? "Light mode" : "Dark mode"}
        className={`${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : ''}`}
      >
        {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
    </div>
  );
};
