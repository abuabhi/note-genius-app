
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Plus, Tag } from 'lucide-react';
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
    // Check if tag is already selected
    if (selectedTags.some((selectedTag) => selectedTag.id === tag.id)) {
      return;
    }
    
    console.log("Adding tag:", tag);
    const newTags = [...selectedTags, tag];
    console.log("Updated tags:", newTags);
    onTagsChange(newTags);
  };

  const handleTagRemove = (tagToRemove: { id?: string; name: string; color: string }) => {
    console.log("Removing tag:", tagToRemove);
    const updatedTags = selectedTags.filter((tag) => {
      // If both tags have IDs, compare the IDs
      if (tag.id && tagToRemove.id) {
        return tag.id !== tagToRemove.id;
      }
      // If no IDs (or one doesn't have an ID), compare by name
      return tag.name !== tagToRemove.name;
    });
    console.log("Tags after removal:", updatedTags);
    onTagsChange(updatedTags);
  };

  // Filter out tags that are already selected
  const availableUnselectedTags = availableTags.filter(
    (tag) => !selectedTags.some((selectedTag) => selectedTag.id === tag.id)
  );

  return (
    <div className="flex flex-wrap gap-2">
      {selectedTags.map((tag) => (
        <Badge 
          key={tag.id || tag.name} 
          className="gap-1 items-center"
          style={{
            backgroundColor: tag.color,
            color: getBestTextColor(tag.color)
          }}
        >
          <Tag className="h-3 w-3 mr-1" />
          {tag.name}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handleTagRemove(tag)}
            className="h-4 w-4 ml-1 p-0 hover:bg-black/10 rounded-full"
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="border-purple-200 hover:bg-purple-50 hover:text-purple-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Tag
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Select tags</h4>
            {availableUnselectedTags.length === 0 ? (
              <p className="text-sm text-muted-foreground">No available tags to select.</p>
            ) : (
              <div className="grid gap-2">
                {availableUnselectedTags.map((tag) => (
                  <div 
                    key={tag.id}
                    className="flex items-center justify-between hover:bg-purple-50 p-2 rounded-md cursor-pointer"
                    onClick={() => handleTagSelect(tag)}
                  >
                    <span className="flex items-center">
                      <span 
                        className="h-3 w-3 rounded-full mr-2" 
                        style={{ backgroundColor: tag.color }}
                      ></span>
                      {tag.name}
                    </span>
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

// Helper function to determine text color based on background color
function getBestTextColor(bgColor: string): string {
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
}
