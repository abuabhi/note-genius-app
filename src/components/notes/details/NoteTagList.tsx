
import { Badge } from '@/components/ui/badge';
import { getBestTextColor } from '@/utils/colorUtils';
import { Tag } from 'lucide-react';

interface TagItem {
  id?: string;
  name: string;
  color: string;
}

interface NoteTagListProps {
  tags?: TagItem[];
  maxTags?: number;
  showTagIcon?: boolean;
}

export const NoteTagList = ({ 
  tags, 
  maxTags = Infinity, 
  showTagIcon = false 
}: NoteTagListProps) => {
  if (!tags || tags.length === 0) {
    return null;
  }

  const displayTags = tags.slice(0, maxTags);

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {displayTags.map((tag) => (
        <Badge
          key={tag.id || tag.name}
          style={{
            backgroundColor: tag.color,
            color: getBestTextColor(tag.color)
          }}
          className="flex items-center gap-1 text-xs"
        >
          {showTagIcon && <Tag className="h-2.5 w-2.5" />}
          {tag.name}
        </Badge>
      ))}
    </div>
  );
};
