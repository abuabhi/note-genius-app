
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
 * @param str Input string to generate color from
 * @returns HSL color string
 */
export const generateColorFromString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 60%)`;
};
