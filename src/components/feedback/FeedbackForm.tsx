
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RatingFeedback } from './RatingFeedback';
import { FeatureRequestForm } from './FeatureRequestForm';
import { BugReportForm } from './BugReportForm';
import { Heart, Lightbulb, Bug } from 'lucide-react';

export const FeedbackForm = () => {
  const [activeTab, setActiveTab] = useState('rating');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Heart className="h-8 w-8 text-orange-500 animate-pulse" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
            Share Your Feedback
          </h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Help us make your learning experience even better! Your thoughts and suggestions matter to us.
        </p>
      </div>

      {/* Feedback Form */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-orange-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-700">
            <Heart className="h-5 w-5" />
            What would you like to share?
          </CardTitle>
          <CardDescription>
            Choose the type of feedback you'd like to provide and help us improve your experience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-orange-100">
              <TabsTrigger 
                value="rating" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white"
              >
                <Heart className="h-4 w-4" />
                Rate Experience
              </TabsTrigger>
              <TabsTrigger 
                value="feature" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white"
              >
                <Lightbulb className="h-4 w-4" />
                Suggest Feature
              </TabsTrigger>
              <TabsTrigger 
                value="bug" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white"
              >
                <Bug className="h-4 w-4" />
                Report Issue
              </TabsTrigger>
            </TabsList>

            <TabsContent value="rating" className="mt-6">
              <RatingFeedback />
            </TabsContent>

            <TabsContent value="feature" className="mt-6">
              <FeatureRequestForm />
            </TabsContent>

            <TabsContent value="bug" className="mt-6">
              <BugReportForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
