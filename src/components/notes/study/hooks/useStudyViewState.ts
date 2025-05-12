
import { useState, useCallback } from "react";

export type TextAlignType = "center" | "justify";

export const useStudyViewState = () => {
  // State for font size
  const [fontSize, setFontSize] = useState(16);
  
  // State for text alignment
  const [textAlign, setTextAlign] = useState<TextAlignType>("center");
  
  // State for full width
  const [isFullWidth, setIsFullWidth] = useState(false);
  
  // State for full screen
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Handlers for font size
  const handleIncreaseFontSize = useCallback(() => {
    setFontSize(prev => Math.min(prev + 1, 24));
  }, []);
  
  const handleDecreaseFontSize = useCallback(() => {
    setFontSize(prev => Math.max(prev - 1, 12));
  }, []);
  
  // Handler for text alignment
  const handleTextAlign = useCallback((align: TextAlignType) => {
    setTextAlign(align);
  }, []);
  
  // Handler for toggling width
  const toggleWidth = useCallback(() => {
    setIsFullWidth(prev => !prev);
  }, []);
  
  // Handler for toggling full screen
  const toggleFullScreen = useCallback(() => {
    setIsFullScreen(prev => !prev);
  }, []);

  return {
    fontSize,
    textAlign,
    isFullWidth,
    isFullScreen,
    handleIncreaseFontSize,
    handleDecreaseFontSize,
    handleTextAlign,
    toggleWidth,
    toggleFullScreen
  };
};

export default useStudyViewState;
