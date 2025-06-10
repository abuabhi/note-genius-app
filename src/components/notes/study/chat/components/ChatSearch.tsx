
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';
import { ChatUIMessage } from '../types/noteChat';

interface ChatSearchProps {
  messages: ChatUIMessage[];
  onMessageHighlight?: (messageId: string | null) => void;
}

export const ChatSearch = ({ messages, onMessageHighlight }: ChatSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(0);

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    return messages.filter(message => 
      message.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [messages, searchTerm]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentMatch(0);
    if (term.trim() && searchResults.length > 0) {
      onMessageHighlight?.(searchResults[0].id);
    } else {
      onMessageHighlight?.(null);
    }
  };

  const navigateMatches = (direction: 'up' | 'down') => {
    if (searchResults.length === 0) return;
    
    let newIndex;
    if (direction === 'up') {
      newIndex = currentMatch > 0 ? currentMatch - 1 : searchResults.length - 1;
    } else {
      newIndex = currentMatch < searchResults.length - 1 ? currentMatch + 1 : 0;
    }
    
    setCurrentMatch(newIndex);
    onMessageHighlight?.(searchResults[newIndex].id);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setCurrentMatch(0);
    onMessageHighlight?.(null);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => setIsOpen(true)}
      >
        <Search className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-white border rounded-md px-2 py-1 shadow-sm">
      <Search className="h-4 w-4 text-gray-400" />
      <Input
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search messages..."
        className="border-0 p-0 h-6 text-sm focus-visible:ring-0"
        autoFocus
      />
      
      {searchResults.length > 0 && (
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">
            {currentMatch + 1}/{searchResults.length}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => navigateMatches('up')}
          >
            <ChevronUp className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => navigateMatches('down')}
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
      )}
      
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={clearSearch}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};
