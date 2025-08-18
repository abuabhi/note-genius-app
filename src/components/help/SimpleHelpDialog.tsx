import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Search, 
  MessageCircle,
  FileText,
  Settings,
  X
} from 'lucide-react';
import { useHelpTopics } from '@/hooks/help/useHelpTopics';
import { HelpTopicCard } from './HelpTopicCard';

interface SimpleHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SimpleHelpDialog: React.FC<SimpleHelpDialogProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openSections, setOpenSections] = useState<string[]>([]);
  
  const { data: helpTopics = [], isLoading } = useHelpTopics();

  const categories = [
    { id: 'all', label: 'All Topics', icon: BookOpen },
    { id: 'getting-started', label: 'Getting Started', icon: BookOpen },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'flashcards', label: 'Flashcards', icon: MessageCircle },
    { id: 'ai-features', label: 'AI Features', icon: MessageCircle },
    { id: 'reminders', label: 'Reminders', icon: MessageCircle },
    { id: 'study-sessions', label: 'Study Sessions', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const filteredContent = helpTopics.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const lower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(lower) ||
      item.description.toLowerCase().includes(lower) ||
      item.content.toLowerCase().includes(lower) ||
      (Array.isArray(item.tags) && item.tags.some(tag => tag.toLowerCase().includes(lower)));
    return matchesCategory && matchesSearch;
  });

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Auto-open first item if none are open and we have content
  React.useEffect(() => {
    if (filteredContent.length > 0 && openSections.length === 0) {
      setOpenSections([filteredContent[0].id]);
    }
  }, [filteredContent.length]);

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              PrepGenie Help
            </DialogTitle>
          </DialogHeader>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              PrepGenie Help Center
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onOpenChange(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            💡 Click on any topic below to expand and view detailed guides
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search help topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2"
                >
                  <IconComponent className="h-3 w-3" />
                  {category.label}
                </Button>
              );
            })}
          </div>

          {/* Help Content */}
          <div className="space-y-3">
            {filteredContent.length > 0 ? (
              filteredContent.map((topic) => (
                <HelpTopicCard
                  key={topic.id}
                  topic={topic}
                  isOpen={openSections.includes(topic.id)}
                  onToggle={() => toggleSection(topic.id)}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-medium mb-2">No help topics found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or category filter
                </p>
              </div>
            )}
          </div>

          {/* Quick Access Footer */}
          <div className="mt-6 pt-6 border-t">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Need more help? Contact our support team
              </p>
              <Button variant="outline" size="sm">
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};