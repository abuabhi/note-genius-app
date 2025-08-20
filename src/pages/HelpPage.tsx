import React, { useState } from 'react';
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
  Lightbulb,
  Search,
  Edit,
  Settings,
  Trash2,
  Plus
} from 'lucide-react';
import { useHelpTopics, HelpTopic, useDeleteHelpTopic } from '@/hooks/help/useHelpTopics';
import { useRequireAuth, UserTier } from '@/hooks/useRequireAuth';
import { YouTubeComingSoonPlaceholder } from '@/components/help/YouTubeComingSoonPlaceholder';
import { HelpTopicEditDialog } from '@/components/help/HelpTopicEditDialog';
import { HelpTopicCreateDialog } from '@/components/help/HelpTopicCreateDialog';
import { YouTubePlayer } from '@/components/help/video/YouTubePlayer';
import ImageGallery from '@/components/help/ImageGallery';
import { processContentForDisplay } from '@/utils/markdownConverter';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Layout from '@/components/layout/Layout';

const HelpPage = () => {
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTopic, setEditingTopic] = useState<HelpTopic | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: helpContent = [], isLoading } = useHelpTopics();
  const deleteTopic = useDeleteHelpTopic();
  const { userProfile } = useRequireAuth();
  const isAdmin = userProfile?.user_tier === UserTier.DEAN;

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const getYouTubeIdFromUrl = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('youtu.be')) {
        return urlObj.pathname.slice(1);
      }
      if (urlObj.searchParams.get('v')) {
        return urlObj.searchParams.get('v');
      }
      const match = url.match(/(?:embed\/|v\/)([\w-]{11})/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  };

  const categories = [
    { id: 'all', label: 'All Topics', icon: BookOpen },
    { id: 'getting-started', label: 'Getting Started', icon: BookOpen },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'flashcards', label: 'Flashcards', icon: MessageCircle },
    { id: 'quiz', label: 'Quiz', icon: FileText },
    { id: 'study-sessions', label: 'Study Sessions', icon: BookOpen },
    { id: 'goals', label: 'Goals', icon: BookOpen },
    { id: 'todos', label: 'Todo', icon: MessageCircle },
    { id: 'progress', label: 'Progress', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'ai-features', label: 'AI Features', icon: MessageCircle },
    { id: 'reminders', label: 'Reminders', icon: MessageCircle },
    { id: 'import-export', label: 'Import & Export', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: MessageCircle },
    { id: 'upgrade', label: 'Upgrade', icon: BookOpen }
  ];

  const filteredContent = helpContent.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const lower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(lower) ||
      item.description.toLowerCase().includes(lower) ||
      (item.sections && item.sections.some(section => 
        section.title.toLowerCase().includes(lower) || 
        section.content.toLowerCase().includes(lower)
      )) ||
      (Array.isArray(item.tags) && item.tags.some(tag => tag.toLowerCase().includes(lower)));
    return matchesCategory && matchesSearch;
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>Help Center | PrepGenie</title>
        <meta name="description" content="Guides, tutorials, and FAQs to help you get the most out of PrepGenie." />
        <link rel="canonical" href={typeof window !== 'undefined' ? `${window.location.origin}/help` : '/help'} />
      </Helmet>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Help Center</h1>
          <div className="flex items-center justify-between">
            <p className="text-lg text-gray-600 mb-6">
              Comprehensive guides, tutorials, and tips to master PrepGenie
            </p>
            {isAdmin && (
              <Link to="/admin/help">
                <Button variant="outline" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Manage Help Topics
                </Button>
              </Link>
            )}
          </div>
          
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
                      <div className="flex items-center gap-4 flex-1">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`p-2 bg-mint-100 rounded-lg ${item.image_url ? 'hidden' : ''}`}>
                          <BookOpen className="h-6 w-6 text-mint-600" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-left flex items-center gap-2">
                            {item.title}
                            <Badge variant="secondary" className="ml-2">
                              {item.category.replace('-', ' ').toUpperCase()}
                            </Badge>
                          </CardTitle>
                          <p className="text-gray-600 mt-1">{item.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTopic(item);
                            }}
                            className="hover:bg-mint-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {openSections.includes(item.id) ? 
                          <ChevronDown className="h-5 w-5 text-gray-500" /> : 
                          <ChevronRight className="h-5 w-5 text-gray-500" />
                        }
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-8">
                      {item.sections && item.sections.length > 0 ? (
                        item.sections.map((section, index) => (
                          <div key={section.id} className="help-section">
                            <h4 className="text-lg font-semibold text-gray-900">{section.title}</h4>
                            <div 
                              className="help-content"
                              dangerouslySetInnerHTML={{ __html: processContentForDisplay(section.content) }}
                            />
                            {(section.image_urls && section.image_urls.length > 0) || section.image_url ? (
                              <div className="help-images">
                                <ImageGallery 
                                  images={section.image_urls && section.image_urls.length > 0 
                                    ? section.image_urls 
                                    : (section.image_url ? [section.image_url] : [])
                                  }
                                />
                              </div>
                            ) : null}
                            </div>
                        ))
                      ) : (
                        <div className="text-gray-500 text-center py-8">
                          No sections available for this topic.
                        </div>
                      )}
                      
                      {/* Video Content - Admin controlled per topic */}
                      {item.show_video && (item.video_url || item.video_title) && (
                        <div className="mb-6">
                          {item.video_url && getYouTubeIdFromUrl(item.video_url) ? (
                            <YouTubePlayer
                              video={{
                                youtubeId: getYouTubeIdFromUrl(item.video_url) || '',
                                title: item.video_title || item.title,
                                duration: item.video_duration || '0:00'
                              }}
                              contentId={item.id}
                              className="w-full"
                            />
                          ) : (
                            <YouTubeComingSoonPlaceholder
                              title={item.video_title || 'Video Tutorial'}
                              duration={item.video_duration || '0:00'}
                              className="w-full"
                            />
                          )}

                          {/* Video Chapters */}
                          {item.video_chapters && item.video_chapters.length > 0 && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                              <h5 className="font-medium text-gray-900 mb-3">Video Chapters</h5>
                              <div className="space-y-2">
                                {item.video_chapters.map((chapter, index) => (
                                  <div key={index} className="text-sm text-gray-600 pl-4 border-l-2 border-mint-200">
                                    <span className="font-medium">{Math.floor(chapter.time / 60)}:{(chapter.time % 60).toString().padStart(2, '0')}</span>
                                    {' - '}
                                    <span className="font-medium">{chapter.title}</span>
                                    {chapter.description && <p className="text-gray-500">{chapter.description}</p>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Quick Tips */}
                      {item.quick_tips && item.quick_tips.length > 0 && (
                        <div className="p-4 bg-mint-50 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-mint-600" />
                            Quick Tips
                          </h4>
                          <ul className="space-y-2">
                            {item.quick_tips.map((tip, index) => (
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
                    </div>
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

        {/* Edit Dialog */}
        {editingTopic && (
          <HelpTopicEditDialog
            topic={editingTopic}
            open={!!editingTopic}
            onOpenChange={(open) => !open && setEditingTopic(null)}
          />
        )}
      </div>
    </Layout>
  );
};

export default HelpPage;