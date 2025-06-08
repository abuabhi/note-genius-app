
/**
 * Determines if text should be black or white based on background color
 * @param bgColor Background color in any valid CSS format (hex, rgb, hsl)
 * @returns 'black' or 'white' depending on which has better contrast
 */
export const getBestTextColor = (bgColor: string): string => {
  // Handle HSL format color
  if (bgColor.startsWith('hsl')) {
    const match = bgColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (match) {
      const [, , , lightness] = match;
      return parseInt(lightness) > 65 ? 'black' : 'white';
    }
  }

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
};

/**
 * Generate a color based on a string (for category tags)
 * Uses a predefined set of colors to ensure good distribution and avoid conflicts
 * @param str Input string to generate color from
 * @returns HSL color string
 */
export const generateColorFromString = (str: string): string => {
  // Predefined color palette with good contrast and distribution
  const colorPalette = [
    'hsl(210, 70%, 60%)', // Blue
    'hsl(150, 70%, 50%)', // Green
    'hsl(270, 70%, 60%)', // Purple
    'hsl(30, 80%, 55%)',  // Orange
    'hsl(340, 70%, 60%)', // Pink
    'hsl(190, 70%, 55%)', // Cyan
    'hsl(60, 70%, 50%)',  // Yellow
    'hsl(320, 70%, 60%)', // Magenta
    'hsl(120, 60%, 45%)', // Forest Green
    'hsl(240, 70%, 60%)', // Indigo
    'hsl(15, 75%, 55%)',  // Red-Orange
    'hsl(180, 60%, 50%)', // Teal
    'hsl(300, 70%, 60%)', // Violet
    'hsl(45, 80%, 55%)',  // Gold
    'hsl(200, 70%, 55%)', // Sky Blue
    'hsl(330, 70%, 60%)', // Rose
    'hsl(90, 60%, 50%)',  // Lime
    'hsl(250, 70%, 60%)', // Blue-Violet
    'hsl(20, 80%, 55%)',  // Coral
    'hsl(160, 70%, 50%)', // Sea Green
  ];

  // Create a more robust hash function
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Use absolute value and modulo to get a palette index
  const index = Math.abs(hash) % colorPalette.length;
  
  console.log(`🎨 Color generation for "${str}": index ${index}, color ${colorPalette[index]}`);
  
  return colorPalette[index];
};

/**
 * Get all available colors used in the palette
 * @returns Array of all predefined colors
 */
export const getAllAvailableColors = (): string[] => {
  return [
    'hsl(210, 70%, 60%)', // Blue
    'hsl(150, 70%, 50%)', // Green
    'hsl(270, 70%, 60%)', // Purple
    'hsl(30, 80%, 55%)',  // Orange
    'hsl(340, 70%, 60%)', // Pink
    'hsl(190, 70%, 55%)', // Cyan
    'hsl(60, 70%, 50%)',  // Yellow
    'hsl(320, 70%, 60%)', // Magenta
    'hsl(120, 60%, 45%)', // Forest Green
    'hsl(240, 70%, 60%)', // Indigo
    'hsl(15, 75%, 55%)',  // Red-Orange
    'hsl(180, 60%, 50%)', // Teal
    'hsl(300, 70%, 60%)', // Violet
    'hsl(45, 80%, 55%)',  // Gold
    'hsl(200, 70%, 55%)', // Sky Blue
    'hsl(330, 70%, 60%)', // Rose
    'hsl(90, 60%, 50%)',  // Lime
    'hsl(250, 70%, 60%)', // Blue-Violet
    'hsl(20, 80%, 55%)',  // Coral
    'hsl(160, 70%, 50%)', // Sea Green
  ];
};
