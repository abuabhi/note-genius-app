
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Check, Plus, Tag, X } from "lucide-react";
import { fetchTagsFromDatabase } from "@/contexts/notes/noteOperations";

interface TagSelectorProps {
  selectedTags: { id?: string; name: string; color: string }[];
  onTagsChange: (tags: { id?: string; name: string; color: string }[]) => void;
  className?: string;
}

export const TagSelector = ({ selectedTags, onTagsChange, className }: TagSelectorProps) => {
  const [availableTags, setAvailableTags] = useState<{ id: string; name: string; color: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  
  // Fetch available tags
  useEffect(() => {
    const loadTags = async () => {
      const tags = await fetchTagsFromDatabase();
      setAvailableTags(tags);
    };
    
    loadTags();
  }, []);

  // Remove a tag
  const removeTag = (tagName: string) => {
    onTagsChange(selectedTags.filter(tag => tag.name !== tagName));
  };

  // Add a new tag
  const addNewTag = () => {
    if (inputValue.trim() && !selectedTags.some(tag => tag.name === inputValue)) {
      // Generate a random color if creating a new tag
      // Limited to soothing colors
      const colors = [
        '#94a3b8', // slate-400
        '#a1a1aa', // zinc-400
        '#a3a3a3', // neutral-400
        '#9ca3af', // gray-400
        '#f87171', // red-400
        '#fb923c', // orange-400
        '#fbbf24', // amber-400
        '#facc15', // yellow-400
        '#a3e635', // lime-400
        '#4ade80', // green-400
        '#34d399', // emerald-400
        '#2dd4bf', // teal-400
        '#22d3ee', // cyan-400
        '#38bdf8', // sky-400
        '#60a5fa', // blue-400
        '#818cf8', // indigo-400
        '#a78bfa', // violet-400
        '#c084fc', // purple-400
        '#e879f9', // fuchsia-400
        '#f472b6', // pink-400
        '#fb7185', // rose-400
      ];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      onTagsChange([...selectedTags, { name: inputValue, color: randomColor }]);
      setInputValue("");
    }
  };

  // Select an existing tag
  const selectTag = (tag: { id: string; name: string; color: string }) => {
    if (!selectedTags.some(t => t.name === tag.name)) {
      onTagsChange([...selectedTags, tag]);
    }
    setOpen(false);
    setInputValue("");
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor="tags" className="text-sm font-medium">Tags</label>
      
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedTags.map(tag => (
          <Badge 
            key={tag.name}
            style={{ 
              backgroundColor: tag.color,
              color: getBestTextColor(tag.color)
            }}
            className="flex items-center gap-1 px-2 py-0.5"
          >
            <Tag className="h-3 w-3" />
            {tag.name}
            <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => removeTag(tag.name)} />
          </Badge>
        ))}
      </div>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative w-full">
            <Input
              id="tags"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Add or select tags..."
              className="w-full pr-10"
            />
            <Plus 
              className="absolute right-3 top-2.5 h-5 w-5 cursor-pointer text-muted-foreground"
              onClick={addNewTag}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          <Command>
            <CommandInput placeholder="Search tags..." />
            <CommandList>
              <CommandEmpty>
                <div className="flex items-center justify-between p-2">
                  <span className="text-sm">No tags found.</span>
                  <button 
                    className="text-xs bg-primary text-primary-foreground rounded px-2 py-1"
                    onClick={() => {
                      addNewTag();
                      setOpen(false);
                    }}
                  >
                    Create "{inputValue}"
                  </button>
                </div>
              </CommandEmpty>
              <CommandGroup>
                {availableTags
                  .filter(tag => !selectedTags.some(t => t.name === tag.name))
                  .map(tag => (
                    <CommandItem 
                      key={tag.id} 
                      onSelect={() => selectTag(tag)}
                      className="flex items-center gap-2"
                    >
                      <div 
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      {tag.name}
                      <Check 
                        className={`ml-auto h-4 w-4 ${selectedTags.some(t => t.name === tag.name) ? 'opacity-100' : 'opacity-0'}`}
                      />
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

// Helper function to determine if black or white text will be more readable against a background color
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
