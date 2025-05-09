import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface TagSelectorProps {
  selectedTags: { id?: string; name: string; color: string }[];
  onTagsChange: (tags: { id?: string; name: string; color: string }[]) => void;
  availableTags: { id: string; name: string; color: string }[];
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTags,
  onTagsChange,
  availableTags,
}) => {
  const handleTagSelect = (tag: { id: string; name: string; color: string }) => {
    if (selectedTags.find((selectedTag) => selectedTag.id === tag.id)) {
      return;
    }
    onTagsChange([...selectedTags, tag]);
  };

  const handleTagRemove = (tagToRemove: { id?: string; name: string; color: string }) => {
    const updatedTags = selectedTags.filter((tag) => tag.id !== tagToRemove.id);
    onTagsChange(updatedTags);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {selectedTags.map((tag) => (
        <Badge key={tag.id || tag.name} className="gap-1 items-center">
          {tag.name}
          <Button variant="ghost" size="icon" onClick={() => handleTagRemove(tag)}>
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Tag
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-2">
            {availableTags.map((tag) => (
              <Button
                key={tag.id}
                variant="ghost"
                className="justify-start"
                onClick={() => handleTagSelect(tag)}
              >
                {tag.name}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
