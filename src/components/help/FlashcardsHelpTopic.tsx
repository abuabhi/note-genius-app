import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Brain, 
  Upload, 
  Zap, 
  Target, 
  BarChart3, 
  Settings, 
  Users,
  Clock,
  Star,
  TrendingUp,
  FileText,
  Camera,
  Download,
  Share2,
  Lightbulb
} from 'lucide-react';

export const FlashcardsHelpTopic = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Brain className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Flashcards Help Guide</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Master any subject with our intelligent spaced repetition system
        </p>
      </div>

      <Tabs defaultValue="getting-started" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
          <TabsTrigger value="creation">Creation</TabsTrigger>
          <TabsTrigger value="studying">Study Modes</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="tips">Tips</TabsTrigger>
        </TabsList>

        {/* Getting Started Tab */}
        <TabsContent value="getting-started" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                First Time Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">What you'll see:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Clean, welcoming interface with gentle prompts</li>
                    <li>• "Create Your First Flashcard Set" call-to-action</li>
                    <li>• "Browse Library" option for built-in content</li>
                    <li>• "Import Content" for existing materials</li>
                    <li>• Helpful tips about spaced repetition learning</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Getting Started Actions:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Badge variant="secondary" className="justify-center p-2">
                      <FileText className="h-3 w-3 mr-1" />
                      Create Manual Set
                    </Badge>
                    <Badge variant="secondary" className="justify-center p-2">
                      <BookOpen className="h-3 w-3 mr-1" />
                      Browse Library
                    </Badge>
                    <Badge variant="secondary" className="justify-center p-2">
                      <Upload className="h-3 w-3 mr-1" />
                      Import Files
                    </Badge>
                    <Badge variant="secondary" className="justify-center p-2">
                      <Zap className="h-3 w-3 mr-1" />
                      AI Generation
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Creation Tab */}
        <TabsContent value="creation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Manual Creation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Flashcard Set Fields:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Name*</span>
                      <Badge variant="outline">Required</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Subject*</span>
                      <Badge variant="outline">Required</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Description</span>
                      <Badge variant="secondary">Optional</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Difficulty Level</span>
                      <Badge variant="secondary">Optional</Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Individual Card Components:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Front Side* - Question or term</li>
                    <li>• Back Side* - Answer or definition</li>
                    <li>• Hints - Additional context</li>
                    <li>• Images - Visual aids</li>
                    <li>• Audio - Pronunciation guides</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Import Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 border rounded-lg">
                    <FileText className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                    <div className="text-sm font-medium">File Import</div>
                    <div className="text-xs text-muted-foreground">CSV, TXT, JSON</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <Zap className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                    <div className="text-sm font-medium">AI Generate</div>
                    <div className="text-xs text-muted-foreground">From topics</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <BookOpen className="h-6 w-6 mx-auto mb-2 text-green-500" />
                    <div className="text-sm font-medium">Library Copy</div>
                    <div className="text-xs text-muted-foreground">Built-in sets</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <Download className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                    <div className="text-sm font-medium">Anki Import</div>
                    <div className="text-xs text-muted-foreground">.apkg files</div>
                  </div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <h5 className="font-medium text-sm mb-2">CSV Format Example:</h5>
                  <code className="text-xs bg-background p-2 rounded block">
                    Front,Back,Hint,Tags<br/>
                    "What is photosynthesis?","Process converting light to energy","Plant food","biology"
                  </code>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Study Modes Tab */}
        <TabsContent value="studying" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Spaced Repetition System
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Mastery Levels:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-sm">Level 1: New (daily)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span className="text-sm">Level 2: Learning (2-3 days)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-sm">Level 3: Familiar (1 week)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm">Level 4: Known (2 weeks)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">Level 5: Mastered (1+ month)</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Difficulty Ratings:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Badge variant="destructive">Again (1)</Badge>
                    <Badge variant="secondary">Hard (2)</Badge>
                    <Badge variant="default">Good (3)</Badge>
                    <Badge variant="secondary">Easy (4)</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Study Modes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-medium flex items-center gap-2 mb-2">
                      <BookOpen className="h-4 w-4" />
                      Classic Study
                    </h5>
                    <p className="text-sm text-muted-foreground">
                      Traditional flashcard review with spaced repetition
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-medium flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4" />
                      Test Mode
                    </h5>
                    <p className="text-sm text-muted-foreground">
                      Timed tests with multiple choice or typed answers
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-medium flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4" />
                      Quick Review
                    </h5>
                    <p className="text-sm text-muted-foreground">
                      Rapid-fire review with keyboard shortcuts
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Progress Tracking & Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <h4 className="font-semibold">Set-Level Analytics</h4>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• Completion percentage</li>
                    <li>• Study time tracking</li>
                    <li>• Card accuracy rates</li>
                    <li>• Mastery distribution</li>
                  </ul>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Target className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <h4 className="font-semibold">Subject Analytics</h4>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• Subject completion</li>
                    <li>• Study patterns</li>
                    <li>• Strength areas</li>
                    <li>• Learning velocity</li>
                  </ul>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Star className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <h4 className="font-semibold">Global Statistics</h4>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• Total cards studied</li>
                    <li>• Study streaks</li>
                    <li>• Mastery achievements</li>
                    <li>• Efficiency metrics</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  AI-Powered Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
                    <h5 className="font-medium text-sm mb-1">Smart Suggestions</h5>
                    <p className="text-xs text-muted-foreground">AI recommends related cards and optimal difficulty</p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border">
                    <h5 className="font-medium text-sm mb-1">Content Generation</h5>
                    <p className="text-xs text-muted-foreground">Auto-create additional cards from topics</p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border">
                    <h5 className="font-medium text-sm mb-1">Performance Insights</h5>
                    <p className="text-xs text-muted-foreground">AI analysis of your study patterns</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Customization & Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Visual Customization:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span>• Card themes</span>
                    <span>• Font options</span>
                    <span>• Color schemes</span>
                    <span>• Layout preferences</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Study Integration:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span>• Session tracking</span>
                    <span>• Goal integration</span>
                    <span>• Notes linking</span>
                    <span>• Calendar sync</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Sharing Features:</h4>
                  <div className="flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    <span className="text-sm">Public sets, private sharing, export options</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tips Tab */}
        <TabsContent value="tips" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Card Creation Tips:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Keep questions specific and focused</li>
                    <li>• Use clear, concise language</li>
                    <li>• Include visual aids when helpful</li>
                    <li>• Add context for difficult concepts</li>
                    <li>• Test cards before extensive study</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Study Habits:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Study consistently, avoid cramming</li>
                    <li>• Rate difficulty honestly</li>
                    <li>• Mix different subjects</li>
                    <li>• Try to answer before revealing</li>
                    <li>• Follow algorithm suggestions</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Optimization Strategies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Performance Improvement:</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <Badge variant="outline" className="justify-start p-2">
                      <Target className="h-3 w-3 mr-2" />
                      Focus on low-mastery cards
                    </Badge>
                    <Badge variant="outline" className="justify-start p-2">
                      <Settings className="h-3 w-3 mr-2" />
                      Adjust card difficulty as needed
                    </Badge>
                    <Badge variant="outline" className="justify-start p-2">
                      <BarChart3 className="h-3 w-3 mr-2" />
                      Monitor analytics regularly
                    </Badge>
                    <Badge variant="outline" className="justify-start p-2">
                      <Star className="h-3 w-3 mr-2" />
                      Set realistic mastery targets
                    </Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Time Management:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Use focused study sessions</li>
                    <li>• Prioritize due cards first</li>
                    <li>• Batch create multiple cards</li>
                    <li>• Schedule regular reviews</li>
                    <li>• Study during short breaks</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Getting Help
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <FileText className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                  <div className="text-sm font-medium">Documentation</div>
                  <div className="text-xs text-muted-foreground">Comprehensive guides</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <Camera className="h-6 w-6 mx-auto mb-2 text-green-500" />
                  <div className="text-sm font-medium">Video Tutorials</div>
                  <div className="text-xs text-muted-foreground">Step-by-step videos</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <Users className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                  <div className="text-sm font-medium">Community</div>
                  <div className="text-xs text-muted-foreground">User discussions</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <Share2 className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                  <div className="text-sm font-medium">Support</div>
                  <div className="text-xs text-muted-foreground">Direct assistance</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};