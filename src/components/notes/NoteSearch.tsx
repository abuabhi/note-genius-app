
import { useNotes } from "@/contexts/NoteContext";
import { Input } from "@/components/ui/input";
import { Search, Tag, X } from "lucide-react";
import { NoteSorter } from "./NoteSorter";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { fetchTagsFromDatabase } from "@/contexts/notes/noteOperations";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const NoteSearch = () => {
  const { searchTerm, setSearchTerm, notes, filteredNotes } = useNotes();
  const [availableTags, setAvailableTags] = useState<{ id: string; name: string; color: string }[]>([]);
  const [selectedTags, setSelectedTags] = useState<{ id: string; name: string; color: string }[]>([]);
  
  useEffect(() => {
    const loadTags = async () => {
      const tags = await fetchTagsFromDatabase();
      setAvailableTags(tags);
    };
    
    loadTags();
  }, []);

  const handleTagSelect = (tag: { id: string; name: string; color: string }) => {
    if (!selectedTags.some(t => t.id === tag.id)) {
      const newSelectedTags = [...selectedTags, tag];
      setSelectedTags(newSelectedTags);
      
      // Update search term to include tags
      const tagTerms = newSelectedTags.map(t => t.name).join(' ');
      const baseSearchTerm = searchTerm.replace(/#\w+/g, '').trim();
      setSearchTerm(`${baseSearchTerm} ${tagTerms}`.trim());
    }
  };

  const handleTagRemove = (tagId: string) => {
    const tag = selectedTags.find(t => t.id === tagId);
    const newSelectedTags = selectedTags.filter(t => t.id !== tagId);
    setSelectedTags(newSelectedTags);
    
    // Update search term to remove the tag
    if (tag) {
      const newSearchTerm = searchTerm.replace(tag.name, '').trim();
      setSearchTerm(newSearchTerm);
    }
  };
  
  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            // Clear selected tags if search is cleared
            if (!e.target.value.trim()) {
              setSelectedTags([]);
            }
          }}
          placeholder="Search notes..."
          className="pl-9 w-full"
        />
        {searchTerm.trim() && (
          <div className="text-xs text-muted-foreground mt-1">
            Found {filteredNotes.length} of {notes.length} notes
          </div>
        )}
        
        {/* Selected tag badges */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {selectedTags.map(tag => (
              <Badge 
                key={tag.id}
                style={{ 
                  backgroundColor: tag.color,
                  color: getBestTextColor(tag.color)
                }}
                className="flex items-center gap-1"
              >
                <Tag className="h-3 w-3" />
                {tag.name}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => handleTagRemove(tag.id)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      {/* Tag selector */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Tag className="h-4 w-4" />
            <span>Filter by Tags</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="end">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Select tags</h4>
            <div className="max-h-60 overflow-y-auto space-y-1">
              {availableTags.map(tag => (
                <div 
                  key={tag.id} 
                  onClick={() => handleTagSelect(tag)}
                  className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted cursor-pointer"
                >
                  <div 
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="text-sm">{tag.name}</span>
                </div>
              ))}
              {availableTags.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-2">
                  No tags available
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      <NoteSorter />
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

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  children: React.ReactNode;
}

const Button = ({ 
  variant = 'default', 
  size = 'default', 
  children, 
  className = '', 
  ...props 
}: ButtonProps) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
  
  const variantStyles = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input hover:bg-accent hover:text-accent-foreground'
  };
  
  const sizeStyles = {
    default: 'h-10 py-2 px-4',
    sm: 'h-9 px-3 rounded-md text-sm',
    lg: 'h-11 px-8 rounded-md'
  };
  
  const classes = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;
  
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};
