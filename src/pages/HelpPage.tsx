import React, { useState } from 'react';
import { HelpSearch } from '@/components/help/HelpSearch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  BookOpen, 
  Video, 
  MessageCircle, 
  FileText, 
  ChevronDown, 
  ChevronRight,
  Play,
  Clock,
  Lightbulb,
  Search
} from 'lucide-react';
import { helpContent } from '@/data/helpContent';

const HelpPage = () => {
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const categories = [
    { id: 'all', label: 'All Topics', icon: BookOpen },
    { id: 'getting-started', label: 'Getting Started', icon: BookOpen },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'flashcards', label: 'Flashcards', icon: MessageCircle },
    { id: 'ai-features', label: 'AI Features', icon: MessageCircle },
    { id: 'reminders', label: 'Reminders', icon: MessageCircle },
    { id: 'import-export', label: 'Import & Export', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: MessageCircle }
  ];

  const filteredContent = helpContent.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.textContent.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Help Center</h1>
        <p className="text-lg text-gray-600 mb-6">
          Comprehensive guides, tutorials, and tips to master PrepGenie
        </p>
        
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search help articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mint-500 focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
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
                <IconComponent className="h-4 w-4" />
                {category.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Help Content */}
      <div className="space-y-6">
        {filteredContent.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <Collapsible 
              open={openSections.includes(item.id)} 
              onOpenChange={() => toggleSection(item.id)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-mint-100 rounded-lg">
                        <BookOpen className="h-6 w-6 text-mint-600" />
                      </div>
                      <div>
                        <CardTitle className="text-left flex items-center gap-2">
                          {item.title}
                          <Badge variant="secondary" className="ml-2">
                            {item.category.replace('-', ' ').toUpperCase()}
                          </Badge>
                        </CardTitle>
                        <p className="text-gray-600 mt-1">{item.description}</p>
                      </div>
                    </div>
                    {openSections.includes(item.id) ? 
                      <ChevronDown className="h-5 w-5 text-gray-500" /> : 
                      <ChevronRight className="h-5 w-5 text-gray-500" />
                    }
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="pt-0">
                  {/* Text Content */}
                  <div className="prose max-w-none mb-6">
                    <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                      {item.textContent}
                    </div>
                  </div>

                  {/* Video Content */}
                  {item.videoContent && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Video className="h-5 w-5 text-mint-600" />
                        Video Tutorial
                      </h4>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Play className="h-4 w-4" />
                          <span className="font-medium">{item.videoContent.title}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>{item.videoContent.duration}</span>
                        </div>
                      </div>
                      
                      {/* Video Chapters */}
                      <div className="space-y-2">
                        {item.videoContent.chapters.map((chapter, index) => (
                          <div key={index} className="text-sm text-gray-600 pl-4 border-l-2 border-mint-200">
                            <span className="font-medium">{Math.floor(chapter.time / 60)}:{(chapter.time % 60).toString().padStart(2, '0')}</span>
                            {' - '}
                            <span className="font-medium">{chapter.title}</span>
                            <p className="text-gray-500">{chapter.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Tips */}
                  {item.quickTips && item.quickTips.length > 0 && (
                    <div className="p-4 bg-mint-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-mint-600" />
                        Quick Tips
                      </h4>
                      <ul className="space-y-2">
                        {item.quickTips.map((tip, index) => (
                          <li key={index} className="text-gray-700 flex items-start gap-2">
                            <span className="text-mint-600 font-bold">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>

      {/* Quick Access Section */}
      <div className="mt-12 bg-mint-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <BookOpen className="h-8 w-8 text-mint-600 mx-auto mb-2" />
            <h3 className="font-medium mb-1">Start with Notes</h3>
            <p className="text-sm text-gray-600">Create and organize your study materials</p>
          </div>
          <div className="text-center">
            <FileText className="h-8 w-8 text-mint-600 mx-auto mb-2" />
            <h3 className="font-medium mb-1">Convert to Flashcards</h3>
            <p className="text-sm text-gray-600">Turn your notes into study cards</p>
          </div>
          <div className="text-center">
            <Video className="h-8 w-8 text-mint-600 mx-auto mb-2" />
            <h3 className="font-medium mb-1">Track Progress</h3>
            <p className="text-sm text-gray-600">Monitor your learning journey</p>
          </div>
        </div>
      </div>

      {/* No Results */}
      {filteredContent.length === 0 && (
        <div className="text-center py-12">
          <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No help articles found</h3>
          <p className="text-gray-600">Try adjusting your search terms or category filter</p>
        </div>
      )}
    </div>
  );
};

export default HelpPage;