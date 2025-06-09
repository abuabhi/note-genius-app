
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

  // Handle hex colors
  if (bgColor.startsWith('#')) {
    const color = bgColor.slice(1);
    
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
 * Custom subject color mapping
 */
const SUBJECT_COLOR_MAP: Record<string, string> = {
  'english': '#FF3CAC',        // Fuchsia Pink
  'mathematics': '#3A86FF',    // Royal Blue
  'science': '#FF6B6B',        // Coral
  'technologies': '#9B5DE5',   // Purple Grape
  'languages': '#FFD60A',      // Sunshine Yellow
  'arts': '#FFA500',           // Fresh Orange
  'other': '#98FF98',          // Mint Green
  'uncategorized': '#98FF98',  // Mint Green
  'general': '#98FF98'         // Mint Green
};

/**
 * Generate a color based on a string (for category tags)
 * Uses custom color mapping for specific subjects, falls back to predefined palette
 * @param str Input string to generate color from
 * @returns Hex color string
 */
export const generateColorFromString = (str: string): string => {
  if (!str) return SUBJECT_COLOR_MAP['other'];
  
  // Normalize the subject name for lookup
  const normalizedSubject = str.toLowerCase().trim();
  
  // Check if we have a custom color for this subject
  if (SUBJECT_COLOR_MAP[normalizedSubject]) {
    console.log(`🎨 Using custom color for "${str}": ${SUBJECT_COLOR_MAP[normalizedSubject]}`);
    return SUBJECT_COLOR_MAP[normalizedSubject];
  }
  
  // Check for partial matches
  for (const [subject, color] of Object.entries(SUBJECT_COLOR_MAP)) {
    if (normalizedSubject.includes(subject) || subject.includes(normalizedSubject)) {
      console.log(`🎨 Using partial match color for "${str}" (matched "${subject}"): ${color}`);
      return color;
    }
  }
  
  // Fallback to predefined color palette for other subjects
  const colorPalette = [
    '#10B981', // Mint-500 (default)
    '#8B5CF6', // Purple-500
    '#F59E0B', // Amber-500
    '#EF4444', // Red-500
    '#3B82F6', // Blue-500
    '#06B6D4', // Cyan-500
    '#84CC16', // Lime-500
    '#F97316', // Orange-500
    '#EC4899', // Pink-500
    '#6366F1', // Indigo-500
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
  
  console.log(`🎨 Using fallback color for "${str}": ${colorPalette[index]}`);
  
  return colorPalette[index];
};

/**
 * Get all available colors used in the palette
 * @returns Array of all predefined colors
 */
export const getAllAvailableColors = (): string[] => {
  return [
    ...Object.values(SUBJECT_COLOR_MAP),
    '#10B981', // Mint-500
    '#8B5CF6', // Purple-500
    '#F59E0B', // Amber-500
    '#EF4444', // Red-500
    '#3B82F6', // Blue-500
    '#06B6D4', // Cyan-500
    '#84CC16', // Lime-500
    '#F97316', // Orange-500
    '#EC4899', // Pink-500
    '#6366F1', // Indigo-500
  ];
};
