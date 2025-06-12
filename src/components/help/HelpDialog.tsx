
import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useHelp } from '@/contexts/HelpContext';
import { YouTubePlayer } from './video/YouTubePlayer';
import { HelpContentText } from './HelpContentText';
import { HelpQuickTips } from './HelpQuickTips';
import { HelpSearch } from './HelpSearch';
import { BookOpen, Video, Lightbulb } from 'lucide-react';
import { useHelpAnalytics } from '@/hooks/help/useHelpAnalytics';

export const HelpDialog: React.FC = () => {
  const { 
    isOpen, 
    closeHelp, 
    currentContent, 
    viewMode, 
    setViewMode
  } = useHelp();
  const analytics = useHelpAnalytics();

  // Debug logging to track state changes
  useEffect(() => {
    console.log('HelpDialog state changed:', { isOpen, currentContent, viewMode });
  }, [isOpen, currentContent, viewMode]);

  const handleOpenChange = (open: boolean) => {
    console.log('HelpDialog handleOpenChange called with:', open);
    if (!open) {
      try {
        closeHelp();
      } catch (error) {
        console.error('Error closing help dialog:', error);
        // Don't rethrow the error to prevent it from bubbling up
      }
    }
  };

  const handleTabChange = (value: string) => {
    try {
      setViewMode(value as any);
      
      // Track tab interactions with error handling
      if (currentContent && analytics?.trackVideoEvent) {
        analytics.trackVideoEvent(
          currentContent, 
          'interaction' as any, 
          undefined, 
          `tab_switch_${value}`
        );
      }
    } catch (error) {
      console.error('Error handling tab change:', error);
      // Continue with tab change even if analytics fails
    }
  };

  console.log('HelpDialog rendering with isOpen:', isOpen);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-mint-600" />
            {currentContent ? currentContent.title : 'PrepGenie Help'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {currentContent ? (
            <Tabs value={viewMode} onValueChange={handleTabChange} className="h-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="text" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Guide
                </TabsTrigger>
                {currentContent.videoContent && (
                  <TabsTrigger value="video" className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Video
                  </TabsTrigger>
                )}
                {currentContent.quickTips && (
                  <TabsTrigger value="tips" className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Quick Tips
                  </TabsTrigger>
                )}
              </TabsList>

              <div className="mt-4 space-y-4">
                {/* Content metadata */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {currentContent.category.replace('-', ' ')}
                  </Badge>
                  {currentContent.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <TabsContent value="text" className="space-y-4 mt-0">
                  <HelpContentText content={currentContent} />
                </TabsContent>

                {currentContent.videoContent && (
                  <TabsContent value="video" className="mt-0">
                    <YouTubePlayer 
                      video={currentContent.videoContent}
                      contentId={currentContent.id}
                      className="w-full"
                    />
                  </TabsContent>
                )}

                {currentContent.quickTips && (
                  <TabsContent value="tips" className="mt-0">
                    <HelpQuickTips tips={currentContent.quickTips} />
                  </TabsContent>
                )}
              </div>
            </Tabs>
          ) : (
            <HelpSearch />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
