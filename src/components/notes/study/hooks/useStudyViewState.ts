
import { useState } from "react";

export type TextAlignType = 'left' | 'center' | 'justify';

export const useStudyViewState = () => {
  const [fontSize, setFontSize] = useState<number>(16);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [textAlign, setTextAlign] = useState<TextAlignType>("left");
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

  const handleTextAlign = (align: TextAlignType) => {
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

  return {
    fontSize,
    isDarkMode,
    textAlign,
    isFullWidth,
    isFullScreen,
    handleIncreaseFontSize,
    handleDecreaseFontSize,
    toggleDarkMode,
    handleTextAlign,
    toggleWidth,
    toggleFullScreen
  };
};
