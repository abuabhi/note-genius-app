
import { useState } from "react";
import { Note } from "@/types/note";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  TextAlignLeft, 
  TextAlignCenter, 
  TextAlignJustify,
  Minus,
  Plus,
  Moon,
  Sun,
  ArrowLeftRight,
  Maximize,
  Minimize,
} from "lucide-react";
import { NoteContentDisplay } from "./NoteContentDisplay";

interface NoteStudyViewProps {
  note: Note;
}

export const NoteStudyView = ({ note }: NoteStudyViewProps) => {
  const [fontSize, setFontSize] = useState<number>(16);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [textAlign, setTextAlign] = useState<string>("left");
  const [isFullWidth, setIsFullWidth] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  const handleIncreaseFontSize = () => {
    if (fontSize < 24) {
      setFontSize(fontSize + 2);
    }
  };

  const handleDecreaseFontSize = () => {
    if (fontSize > 12) {
      setFontSize(fontSize - 2);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleTextAlign = (align: string) => {
    setTextAlign(align);
  };

  const toggleWidth = () => {
    setIsFullWidth(!isFullWidth);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };

  return (
    <div className={`min-h-[calc(100vh-200px)] transition-colors ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white'}`}>
      <Card className={`border-0 shadow-none ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white'}`}>
        <div className="sticky top-0 z-10 p-4 backdrop-blur-md border-b border-mint-100 bg-opacity-90 bg-inherit">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">{note.title}</h1>
              <div className="flex items-center mt-1 text-sm text-muted-foreground">
                <span className="mr-2">{note.date}</span>
                <span className="mr-2">·</span>
                <span className="text-mint-600">{note.category}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="icon"
                variant="outline"
                onClick={handleDecreaseFontSize}
                title="Decrease font size"
                className={`${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : ''}`}
                disabled={fontSize <= 12}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                size="icon" 
                variant="outline"
                onClick={handleIncreaseFontSize}
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
                onClick={() => handleTextAlign("left")}
                title="Align left"
                className={`${textAlign === "left" ? "bg-mint-100 hover:bg-mint-200" : ""} ${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : ''}`}
              >
                <TextAlignLeft className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => handleTextAlign("center")}
                title="Align center"
                className={`${textAlign === "center" ? "bg-mint-100 hover:bg-mint-200" : ""} ${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : ''}`}
              >
                <TextAlignCenter className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => handleTextAlign("justify")}
                title="Justify text"
                className={`${textAlign === "justify" ? "bg-mint-100 hover:bg-mint-200" : ""} ${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : ''}`}
              >
                <TextAlignJustify className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button
                size="icon"
                variant="outline"
                onClick={toggleWidth}
                title={isFullWidth ? "Narrow width" : "Full width"}
                className={`${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : ''}`}
              >
                <ArrowLeftRight className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={toggleFullScreen}
                title={isFullScreen ? "Exit fullscreen" : "Fullscreen"}
                className={`${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : ''}`}
              >
                {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={toggleDarkMode}
                title={isDarkMode ? "Light mode" : "Dark mode"}
                className={`${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : ''}`}
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {note.tags.map((tag) => (
                <Badge
                  key={tag.id || tag.name}
                  style={{
                    backgroundColor: isDarkMode ? `${tag.color}80` : tag.color,
                    color: getBestTextColor(tag.color)
                  }}
                  className="text-xs"
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <CardContent className="p-0">
          <div className={`py-6 ${isFullWidth ? 'px-4' : 'container max-w-3xl mx-auto px-4 md:px-0'}`}>
            <div className="mb-6">
              {note.description && (
                <p className={`text-lg mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {note.description}
                </p>
              )}
            </div>

            <NoteContentDisplay 
              content={note.content || ""} 
              fontSize={fontSize}
              textAlign={textAlign}
              isDarkMode={isDarkMode}
              showScannedImage={note.sourceType === 'scan' && !!note.scanData?.originalImageUrl}
              scannedImageUrl={note.scanData?.originalImageUrl}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function to determine text color based on background color
function getBestTextColor(bgColor: string): string {
  // Remove the hash if it exists
  const color = bgColor.startsWith('#') ? bgColor.slice(1) : bgColor;
  
  // Convert to RGB
  let r, g, b;
  if (color.length === 3) {
    r = parseInt(color[0] + color[0], 16);
    g = parseInt(color[1] + color[1], 16);
    b = parseInt(color[2] + color[2], 16);
  } else {
    r = parseInt(color.slice(0, 2), 16);
    g = parseInt(color.slice(2, 4), 16);
    b = parseInt(color.slice(4, 6), 16);
  }
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return white for dark backgrounds, black for light backgrounds
  return luminance > 0.5 ? 'black' : 'white';
}
