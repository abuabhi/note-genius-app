
import { Badge } from '@/components/ui/badge';

interface Tag {
  id?: string;
  name: string;
  color: string;
}

interface NoteTagListProps {
  tags?: Tag[];
}

export const NoteTagList = ({ tags }: NoteTagListProps) => {
  if (!tags || tags.length === 0) {
    return null;
  }

  // Helper function to determine text color based on background color
  const getBestTextColor = (bgColor: string): string => {
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

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {tags.map((tag) => (
        <Badge
          key={tag.id || tag.name}
          style={{
            backgroundColor: tag.color,
            color: getBestTextColor(tag.color)
          }}
          className="text-xs"
        >
          {tag.name}
        </Badge>
      ))}
    </div>
  );
};
