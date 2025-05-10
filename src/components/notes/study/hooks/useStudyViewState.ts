
import { useState, useEffect } from "react";

export type TextAlignType = "left" | "center" | "justify";

export const useStudyViewState = () => {
  const [fontSize, setFontSize] = useState(16);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [textAlign, setTextAlign] = useState<TextAlignType>("left");
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Load preferences from localStorage
  useEffect(() => {
    const savedFontSize = localStorage.getItem("studyViewFontSize");
    const savedDarkMode = localStorage.getItem("studyViewDarkMode");
    const savedTextAlign = localStorage.getItem("studyViewTextAlign");
    const savedFullWidth = localStorage.getItem("studyViewFullWidth");

    if (savedFontSize) setFontSize(parseInt(savedFontSize));
    if (savedDarkMode) setIsDarkMode(savedDarkMode === "true");
    if (savedTextAlign) setTextAlign(savedTextAlign as TextAlignType);
    if (savedFullWidth) setIsFullWidth(savedFullWidth === "true");
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem("studyViewFontSize", fontSize.toString());
    localStorage.setItem("studyViewDarkMode", isDarkMode.toString());
    localStorage.setItem("studyViewTextAlign", textAlign);
    localStorage.setItem("studyViewFullWidth", isFullWidth.toString());
  }, [fontSize, isDarkMode, textAlign, isFullWidth]);

  // Toggle fullscreen
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

  // Font size handlers
  const handleIncreaseFontSize = () => {
    setFontSize((prev) => Math.min(prev + 1, 24));
  };

  const handleDecreaseFontSize = () => {
    setFontSize((prev) => Math.max(prev - 1, 12));
  };

  // Dark mode toggle
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Text alignment
  const handleTextAlign = (align: TextAlignType) => {
    setTextAlign(align);
  };

  // Width toggle
  const toggleWidth = () => {
    setIsFullWidth((prev) => !prev);
  };

  // Fullscreen toggle
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
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
