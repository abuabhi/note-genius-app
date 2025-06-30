
import React, { useState, useMemo } from 'react';
import Layout from "@/components/layout/Layout";
import { HelpFloatingButton } from "@/components/help/HelpFloatingButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  BookOpen, 
  Video, 
  Lightbulb, 
  ArrowRight,
  Star,
  Clock,
  Brain,
  FileText,
  Zap,
  Bell,
  BarChart3,
  Download,
  Settings,
  HelpCircle,
  TrendingUp,
  Users
} from 'lucide-react';
import { useHelp } from '@/contexts/HelpContext';
import { helpContent, getHelpByCategory, getFeaturedHelp, getPopularHelp, searchHelp } from '@/data/helpContent';
import { HelpCategory } from '@/types/help';

const categoryIcons: Record<HelpCategory, React.ReactNode> = {
  'getting-started': <BookOpen className="h-5 w-5" />,
  'notes': <FileText className="h-5 w-5" />,
  'flashcards': <Brain className="h-5 w-5" />,
  'study-sessions': <Clock className="h-5 w-5" />,
  'ai-features': <Zap className="h-5 w-5" />,
  'reminders': <Bell className="h-5 w-5" />,
  'analytics': <BarChart3 className="h-5 w-5" />,
  'import-export': <Download className="h-5 w-5" />,
  'progress': <TrendingUp className="h-5 w-5" />,
  'settings': <Settings className="h-5 w-5" />,
  'advanced': <Users className="h-5 w-5" />
};

const categoryLabels: Record<HelpCategory, string> = {
  'getting-started': 'Getting Started',
  'notes': 'Notes & Content',
  'flashcards': 'Flashcards',
  'study-sessions': 'Study Sessions',
  'ai-features': 'AI Features',
  'reminders': 'Reminders',
  'analytics': 'Analytics & Progress',
  'import-export': 'Import & Export',
  'progress': 'Progress Tracking',
  'settings': 'Settings',
  'advanced': 'Advanced Features'
};

const HelpPage = () => {
  const { openHelp } = useHelp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory | null>(null);
  const [activeTab, setActiveTab] = useState('browse');

  const filteredContent = useMemo(() => {
    if (searchTerm) {
      return searchHelp(searchTerm);
    }
    if (selectedCategory) {
      return getHelpByCategory(selectedCategory);
    }
    return helpContent;
  }, [searchTerm, selectedCategory]);

  const featuredContent = getFeaturedHelp();
  const popularContent = getPopularHelp();

  const handleContentClick = (content: any) => {
    openHelp(content);
  };

  const HelpCard = ({ content, featured = false }: { content: any; featured?: boolean }) => (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
        featured ? 'border-mint-200 bg-mint-50/30' : ''
      }`}
      onClick={() => handleContentClick(content)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {categoryIcons[content.category]}
              <CardTitle className="text-lg">{content.title}</CardTitle>
              {featured && (
                <Badge variant="secondary" className="bg-mint-100 text-mint-700">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
            <CardDescription className="text-sm leading-relaxed">
              {content.description}
            </CardDescription>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400 ml-4 flex-shrink-0" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {categoryLabels[content.category]}
            </Badge>
            {content.videoContent && (
              <Badge variant="secondary" className="text-xs">
                <Video className="h-3 w-3 mr-1" />
                {content.videoContent.duration}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>Updated {new Date(content.lastUpdated).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-mint-50/50 via-white to-blue-50/30">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-mint-100 rounded-full">
                <HelpCircle className="h-8 w-8 text-mint-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">
                PrepGenie Help Center
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to master PrepGenie and supercharge your studying
            </p>
          </div>

          {/* Search */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search help articles, features, and guides..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 text-lg rounded-xl border-2 border-gray-200 focus:border-mint-400"
              />
            </div>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-7xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-8">
              <TabsTrigger value="browse" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Browse
              </TabsTrigger>
              <TabsTrigger value="featured" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Featured
              </TabsTrigger>
              <TabsTrigger value="popular" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Popular
              </TabsTrigger>
            </TabsList>

            {/* Browse Tab */}
            <TabsContent value="browse" className="space-y-8">
              {/* Category Filters */}
              {!searchTerm && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Browse by Category</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <Button
                      variant={selectedCategory === null ? "default" : "outline"}
                      onClick={() => setSelectedCategory(null)}
                      className="justify-start h-auto p-4"
                    >
                      <HelpCircle className="h-4 w-4 mr-2" />
                      All Topics
                    </Button>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <Button
                        key={key}
                        variant={selectedCategory === key ? "default" : "outline"}
                        onClick={() => setSelectedCategory(key as HelpCategory)}
                        className="justify-start h-auto p-4"
                      >
                        {categoryIcons[key as HelpCategory]}
                        <span className="ml-2 text-sm">{label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Results / Filtered Content */}
              <div className="space-y-4">
                {searchTerm && (
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Search Results for "{searchTerm}"
                    </h3>
                    <Badge variant="secondary">
                      {filteredContent.length} {filteredContent.length === 1 ? 'result' : 'results'}
                    </Badge>
                  </div>
                )}
                
                {selectedCategory && !searchTerm && (
                  <h3 className="text-lg font-semibold text-gray-800">
                    {categoryLabels[selectedCategory]} Articles
                  </h3>
                )}

                {filteredContent.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 mb-2">
                        No articles found
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Try different keywords or browse our categories
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedCategory(null);
                        }}
                      >
                        Clear Search
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredContent.map((content) => (
                      <HelpCard key={content.id} content={content} />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Featured Tab */}
            <TabsContent value="featured" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Featured Guides</h2>
                <p className="text-gray-600">Essential guides to get you started with PrepGenie</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredContent.map((content) => (
                  <HelpCard key={content.id} content={content} featured />
                ))}
              </div>
            </TabsContent>

            {/* Popular Tab */}
            <TabsContent value="popular" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Popular Articles</h2>
                <p className="text-gray-600">Most accessed help articles by the community</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {popularContent.map((content) => (
                  <HelpCard key={content.id} content={content} />
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Quick Links Section */}
          <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Quick Actions</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-mint-100 rounded-full flex items-center justify-center mb-3">
                    <Video className="h-6 w-6 text-mint-600" />
                  </div>
                  <CardTitle className="text-lg">Video Tutorials</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">
                    Watch step-by-step video guides for all features
                  </p>
                  <Button variant="outline" size="sm">
                    Browse Videos
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                    <Lightbulb className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">Quick Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">
                    Get instant tips and tricks for better studying
                  </p>
                  <Button variant="outline" size="sm">
                    View Tips
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                    <HelpCircle className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg">Contact Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">
                    Can't find what you're looking for? We're here to help
                  </p>
                  <Button variant="outline" size="sm">
                    Get Help
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <HelpFloatingButton />
    </Layout>
  );
};

export default HelpPage;
