
import { Badge } from '@/components/ui/badge';
import { getBestTextColor } from '@/utils/colorUtils';

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
