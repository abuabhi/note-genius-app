/**
 * Truncates text at word boundaries to prevent mid-word breaks
 * @param text - The text to truncate
 * @param maxLength - Maximum character length
 * @returns Truncated text with "..." if truncated
 */
export const truncateAtWord = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) {
    return text || '';
  }

  // Find the last space before maxLength
  const truncated = text.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');

  // If there's a space, cut at the word boundary
  if (lastSpaceIndex > maxLength * 0.5) {
    return truncated.substring(0, lastSpaceIndex).trim() + '...';
  }

  // If no suitable space found (very long word), just truncate
  return truncated.trim() + '...';
};

/**
 * Validates and constrains a position to viewport bounds
 * @param position - The position to validate
 * @param elementWidth - Width of the element
 * @param elementHeight - Height of the element
 * @returns Constrained position within viewport
 */
export const constrainToViewport = (
  position: { x: number; y: number },
  elementWidth: number,
  elementHeight: number
): { x: number; y: number } => {
  const maxX = Math.max(0, window.innerWidth - elementWidth);
  const maxY = Math.max(0, window.innerHeight - elementHeight);

  return {
    x: Math.max(0, Math.min(position.x, maxX)),
    y: Math.max(0, Math.min(position.y, maxY))
  };
};

/**
 * Checks if a position is within viewport bounds
 * @param position - The position to check
 * @param elementWidth - Width of the element
 * @param elementHeight - Height of the element
 * @returns Boolean indicating if position is valid
 */
export const isPositionInViewport = (
  position: { x: number; y: number },
  elementWidth: number,
  elementHeight: number
): boolean => {
  return (
    position.x >= 0 &&
    position.y >= 0 &&
    position.x + elementWidth <= window.innerWidth &&
    position.y + elementHeight <= window.innerHeight
  );
};
