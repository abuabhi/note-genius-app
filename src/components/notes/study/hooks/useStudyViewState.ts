
import { useState, useCallback } from "react";
import { EnhancementContentType } from "../enhancements/EnhancementSelector";

export type TextAlignType = "left" | "center" | "justify";

export const useStudyViewState = () => {
  // State for font size
  const [fontSize, setFontSize] = useState(16);
  
  // State for text alignment, explicitly defaulting to left to ensure consistency
  const [textAlign, setTextAlign] = useState<TextAlignType>("left");
  
  // State for full width
  const [isFullWidth, setIsFullWidth] = useState(false);
  
  // State for full screen
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // State for active enhancement tab
  const [activeContentType, setActiveContentType] = useState<EnhancementContentType>('original');
  
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

  // Handler for setting active content type
  const setActiveContent = useCallback((contentType: EnhancementContentType) => {
    setActiveContentType(contentType);
  }, []);

  return {
    fontSize,
    textAlign,
    isFullWidth,
    isFullScreen,
    activeContentType,
    handleIncreaseFontSize,
    handleDecreaseFontSize,
    handleTextAlign,
    toggleWidth,
    toggleFullScreen,
    setActiveContentType: setActiveContent
  };
};

export default useStudyViewState;
