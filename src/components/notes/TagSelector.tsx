
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Plus, Tag, Check } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { getBestTextColor } from './study/utils/colorUtils';

export interface TagSelectorProps {
  selectedTags: { id?: string; name: string; color: string }[];
  onTagsChange: (tags: { id?: string; name: string; color: string }[]) => void;
  availableTags: { id: string; name: string; color: string }[];
}

// Generate a random color in hex format
const getRandomColor = () => {
  // Generate HSL color with good saturation and lightness
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 60%)`;
};

export const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTags,
  onTagsChange,
  availableTags,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3dc087'); // Default mint color

  const handleTagSelect = (tag: { id: string; name: string; color: string }) => {
    // Check if tag is already selected by ID or name
    if (selectedTags.some((selectedTag) => 
      (selectedTag.id && tag.id && selectedTag.id === tag.id) || 
      selectedTag.name === tag.name
    )) {
      console.log("Tag already selected, skipping:", tag);
      return;
    }
    
    console.log("Adding tag:", tag);
    const newTags = [...selectedTags, tag];
    onTagsChange(newTags);
  };

  const handleNewTagCreate = () => {
    if (!newTagName.trim()) return;
    
    // Create new tag with random color if not specified
    const newTag = {
      name: newTagName.trim(),
      color: newTagColor || getRandomColor(),
    };
    
    // Add to selected tags
    const newTags = [...selectedTags, newTag];
    onTagsChange(newTags);
    
    // Reset form
    setNewTagName('');
    setNewTagColor('#3dc087');
    setIsOpen(false);
  };

  const handleTagRemove = (tagToRemove: { id?: string; name: string; color: string }) => {
    console.log("Removing tag:", tagToRemove);
    // Fix: Create a deep copy of the selected tags to prevent reference issues
    const updatedTags = selectedTags
      .filter((tag) => {
        // If both tags have IDs, compare the IDs
        if (tag.id && tagToRemove.id) {
          return tag.id !== tagToRemove.id;
        }
        // If no IDs (or one doesn't have an ID), compare by name
        return tag.name !== tagToRemove.name;
      })
      .map(tag => ({...tag})); // Create new objects to ensure reference integrity
      
    console.log("Tags after removal:", updatedTags);
    onTagsChange(updatedTags);
  };

  // Filter out tags that are already selected
  const availableUnselectedTags = availableTags.filter(
    (tag) => !selectedTags.some((selectedTag) => 
      (selectedTag.id && tag.id && selectedTag.id === tag.id) || 
      selectedTag.name === tag.name
    )
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
            type="button"
            variant="ghost" 
            size="icon" 
            onClick={() => handleTagRemove(tag)}
            className="h-4 w-4 ml-1 p-0 hover:bg-black/10 rounded-full"
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            className="border-mint-200 hover:bg-mint-50 hover:text-mint-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Tag
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 bg-white">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Select or create a tag</h4>
            
            {availableUnselectedTags.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Available tags:</p>
                <div className="grid gap-2">
                  {availableUnselectedTags.map((tag) => (
                    <div 
                      key={tag.id}
                      className="flex items-center justify-between hover:bg-mint-50 p-2 rounded-md cursor-pointer"
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
              </div>
            )}
            
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Create a new tag:</p>
              <div className="grid gap-3">
                <Input
                  placeholder="Tag name"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="border-mint-200 focus-visible:ring-mint-500"
                />
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    className="w-12 h-8 p-1 cursor-pointer"
                  />
                  <span className="text-xs text-muted-foreground">Tag color</span>
                </div>
                <Button 
                  type="button"
                  onClick={handleNewTagCreate}
                  disabled={!newTagName.trim()}
                  className="bg-mint-500 hover:bg-mint-600 text-white"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Create Tag
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
