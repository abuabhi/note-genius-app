
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RatingFeedback } from './RatingFeedback';
import { FeatureRequestForm } from './FeatureRequestForm';
import { BugReportForm } from './BugReportForm';
import { Heart, Lightbulb, Bug, Sparkles } from 'lucide-react';

export const FeedbackForm = () => {
  const [activeTab, setActiveTab] = useState('rating');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-gradient-to-br from-mint-400 to-mint-600 rounded-full shadow-lg">
            <Heart className="h-8 w-8 text-white animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-mint-600 to-mint-800 bg-clip-text text-transparent">
            Share Your Feedback
          </h1>
          <Sparkles className="h-6 w-6 text-mint-500 animate-pulse" />
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
          Help us make your learning experience even better! Your thoughts and suggestions matter to us and shape the future of our platform.
        </p>
      </div>

      {/* Feedback Form */}
      <Card className="shadow-xl border-mint-100 bg-gradient-to-br from-white to-mint-50/30">
        <CardHeader className="bg-gradient-to-r from-mint-500 to-mint-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-white text-xl">
            <Heart className="h-6 w-6" />
            What would you like to share?
          </CardTitle>
          <CardDescription className="text-mint-50">
            Choose the type of feedback you'd like to provide and help us improve your experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-mint-100 p-1 rounded-lg">
              <TabsTrigger 
                value="rating" 
                className="flex items-center gap-2 data-[state=active]:bg-mint-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
              >
                <Heart className="h-4 w-4" />
                Rate Experience
              </TabsTrigger>
              <TabsTrigger 
                value="feature" 
                className="flex items-center gap-2 data-[state=active]:bg-mint-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
              >
                <Lightbulb className="h-4 w-4" />
                Suggest Feature
              </TabsTrigger>
              <TabsTrigger 
                value="bug" 
                className="flex items-center gap-2 data-[state=active]:bg-mint-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
              >
                <Bug className="h-4 w-4" />
                Report Issue
              </TabsTrigger>
            </TabsList>

            <TabsContent value="rating" className="mt-8">
              <RatingFeedback />
            </TabsContent>

            <TabsContent value="feature" className="mt-8">
              <FeatureRequestForm />
            </TabsContent>

            <TabsContent value="bug" className="mt-8">
              <BugReportForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Info Section */}
      <div className="bg-gradient-to-r from-mint-50 to-mint-100 rounded-lg p-6 border border-mint-200">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-mint-500 rounded-lg">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-mint-800 mb-2">Where does your feedback go?</h3>
            <p className="text-mint-700 text-sm leading-relaxed">
              Your feedback is securely stored and reviewed by our development team. We use your input to prioritize new features, 
              fix issues, and improve the overall user experience. Thank you for helping us build a better learning platform!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
