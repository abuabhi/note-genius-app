
import React, { useState, useMemo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useHelp } from '@/contexts/HelpContext';
import { searchHelp, getHelpByCategory, helpContent } from '@/data/helpContent';
import { Search, Video, BookOpen, ArrowRight } from 'lucide-react';
import { HelpCategory } from '@/types/help';
import { useHelpAnalytics } from '@/hooks/help/useHelpAnalytics';

const categoryLabels: Record<HelpCategory, string> = {
  'getting-started': 'Getting Started',
  'notes': 'Notes',
  'flashcards': 'Flashcards',
  'study-sessions': 'Study Sessions',
  'progress': 'Progress',
  'settings': 'Settings',
  'advanced': 'Advanced'
};

export const HelpSearch: React.FC = () => {
  const { openHelp, getContextualHelp } = useHelp();
  const analytics = useHelpAnalytics();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory | null>(null);

  const contextualHelp = getContextualHelp();
  
  const filteredContent = useMemo(() => {
    if (searchTerm) {
      return searchHelp(searchTerm);
    }
    if (selectedCategory) {
      return getHelpByCategory(selectedCategory);
    }
    return helpContent.slice(0, 6); // Show popular content
  }, [searchTerm, selectedCategory]);

  // Track search when search term changes
  React.useEffect(() => {
    if (searchTerm) {
      const delayedSearch = setTimeout(() => {
        analytics.trackSearch(searchTerm, filteredContent.length);
      }, 500); // Debounce search tracking

      return () => clearTimeout(delayedSearch);
    }
  }, [searchTerm, filteredContent.length, analytics]);

  const handleContentClick = useCallback((content: any) => {
    // Track search result click if there was a search term
    if (searchTerm) {
      analytics.trackSearchResultClick(searchTerm, content.id);
    }
    
    openHelp(content);
  }, [searchTerm, analytics, openHelp]);

  const categories = Object.keys(categoryLabels) as HelpCategory[];

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search help articles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory(null)}
        >
          All Topics
        </Button>
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {categoryLabels[category]}
          </Button>
        ))}
      </div>

      {/* Contextual Help */}
      {contextualHelp.length > 0 && !searchTerm && !selectedCategory && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Help for this page</h3>
          <div className="grid gap-2">
            {contextualHelp.slice(0, 3).map(content => (
              <Card 
                key={content.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleContentClick(content)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{content.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{content.description}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {content.videoContent && (
                        <Video className="h-4 w-4 text-mint-600" />
                      )}
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Search Results / Browse Content */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">
          {searchTerm ? 'Search Results' : selectedCategory ? categoryLabels[selectedCategory] : 'Popular Articles'}
        </h3>
        
        {filteredContent.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-600">No help articles found for "{searchTerm}"</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => setSearchTerm('')}
              >
                Browse all articles
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {filteredContent.map(content => (
              <Card 
                key={content.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleContentClick(content)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{content.title}</h4>
                        {content.videoContent && (
                          <Badge variant="secondary" className="text-xs">
                            <Video className="h-3 w-3 mr-1" />
                            Video
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{content.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {categoryLabels[content.category]}
                        </Badge>
                        {content.videoContent && (
                          <span className="text-xs text-gray-500">
                            {content.videoContent.duration}
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 ml-4 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
