
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Video, Lightbulb, MessageCircle, Mail } from "lucide-react";
import { useState } from "react";
import { useHelp } from "@/contexts/HelpContext";
import { helpContent } from "@/data/helpContent";

const HelpPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { openHelp } = useHelp();

  const filteredContent = helpContent.filter(content =>
    content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    content.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    content.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const categories = {
    'getting-started': 'Getting Started',
    'notes': 'Notes & Study Materials',
    'flashcards': 'Flashcards',
    'study-sessions': 'Study Sessions',
    'progress': 'Progress & Analytics',
    'settings': 'Settings & Account',
    'advanced': 'Advanced Features'
  };

  const handleContentClick = (content: any) => {
    openHelp(content);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-white via-mint-50/30 to-mint-50/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Help Center
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Find answers to your questions and learn how to make the most of PrepGenie
            </p>
          </div>

          {/* Search */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search help articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-3 text-lg"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="border-mint-200 hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <BookOpen className="h-12 w-12 text-mint-600 mx-auto mb-4" />
                <CardTitle className="text-xl">Browse Guides</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Explore our comprehensive guides and tutorials
                </p>
              </CardContent>
            </Card>

            <Card className="border-mint-200 hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <MessageCircle className="h-12 w-12 text-mint-600 mx-auto mb-4" />
                <CardTitle className="text-xl">Contact Support</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  Get personalized help from our support team
                </p>
                <Button variant="outline" asChild>
                  <a href="/contact">Contact Us</a>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-mint-200 hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <Lightbulb className="h-12 w-12 text-mint-600 mx-auto mb-4" />
                <CardTitle className="text-xl">FAQ</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  Quick answers to common questions
                </p>
                <Button variant="outline" asChild>
                  <a href="/faq">View FAQ</a>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Help Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Categories Sidebar */}
            <div className="lg:col-span-1">
              <Card className="border-mint-200">
                <CardHeader>
                  <CardTitle className="text-lg">Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(categories).map(([key, label]) => {
                    const count = helpContent.filter(content => content.category === key).length;
                    return (
                      <div key={key} className="flex items-center justify-between p-2 rounded hover:bg-mint-50 cursor-pointer">
                        <span className="text-gray-700">{label}</span>
                        <Badge variant="secondary" className="text-xs">{count}</Badge>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Help Articles */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {filteredContent.length === 0 ? (
                  <Card className="border-mint-200">
                    <CardContent className="text-center py-12">
                      <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                      <p className="text-gray-600">
                        Try searching with different keywords or browse our categories.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredContent.map((content) => (
                    <Card 
                      key={content.id} 
                      className="border-mint-200 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => handleContentClick(content)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg text-gray-900 hover:text-mint-600">
                              {content.title}
                            </CardTitle>
                            <p className="text-gray-600 mt-2">{content.description}</p>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            {content.videoContent && (
                              <Video className="h-4 w-4 text-mint-600" />
                            )}
                            {content.quickTips && (
                              <Lightbulb className="h-4 w-4 text-amber-500" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="text-xs">
                              {categories[content.category as keyof typeof categories]}
                            </Badge>
                            {content.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <Button variant="ghost" size="sm" className="text-mint-600">
                            Read More →
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Additional Help Section */}
          <div className="mt-16 bg-mint-50 rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Still need help?</h2>
              <p className="text-gray-600 mb-6">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-mint-600 hover:bg-mint-700" asChild>
                  <a href="/contact">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Support
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/faq">View FAQ</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HelpPage;
