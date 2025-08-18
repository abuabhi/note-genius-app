import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  BookOpen, 
  ChevronDown, 
  ChevronRight,
  Lightbulb,
  Video
} from 'lucide-react';
import { HelpTopic } from '@/hooks/help/useHelpTopics';
import { YouTubePlayer } from './video/YouTubePlayer';
import { YouTubeComingSoonPlaceholder } from './YouTubeComingSoonPlaceholder';
import { processContentForDisplay } from '@/utils/markdownConverter';
import { sanitizeHTML } from '@/utils/sanitize';

interface HelpTopicCardProps {
  topic: HelpTopic;
  isOpen: boolean;
  onToggle: () => void;
}

export const HelpTopicCard: React.FC<HelpTopicCardProps> = ({
  topic,
  isOpen,
  onToggle
}) => {
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

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <CardTitle className="text-base flex items-center gap-2">
                    {topic.title}
                    <Badge variant="secondary" className="text-xs">
                      {topic.category.replace('-', ' ').toUpperCase()}
                    </Badge>
                    {topic.video_url && (
                      <Video className="h-4 w-4 text-primary" />
                    )}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {topic.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {isOpen ? 'Click to collapse' : 'Click to expand'}
                </span>
                {isOpen ? 
                  <ChevronDown className="h-4 w-4 text-muted-foreground" /> : 
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                }
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-6">
            {/* Main Content */}
            <div 
              className="prose prose-sm max-w-none text-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: sanitizeHTML(processContentForDisplay(topic.content)) 
              }} 
            />

            {/* Video Content */}
            {(topic.video_url || topic.video_title) && (
              <div className="space-y-4">
                {topic.video_url && getYouTubeIdFromUrl(topic.video_url) ? (
                  <YouTubePlayer
                    video={{
                      youtubeId: getYouTubeIdFromUrl(topic.video_url) || '',
                      title: topic.video_title || topic.title,
                      duration: topic.video_duration || '0:00'
                    }}
                    contentId={topic.id}
                    className="w-full"
                  />
                ) : (
                  <YouTubeComingSoonPlaceholder
                    title={topic.video_title || 'Video Tutorial'}
                    duration={topic.video_duration || '0:00'}
                    className="w-full"
                  />
                )}

                {/* Video Chapters */}
                {topic.video_chapters && topic.video_chapters.length > 0 && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h5 className="font-medium mb-3">Video Chapters</h5>
                    <div className="space-y-2">
                      {topic.video_chapters.map((chapter, index) => (
                        <div key={index} className="text-sm pl-4 border-l-2 border-primary/20">
                          <span className="font-medium">
                            {Math.floor(chapter.time / 60)}:{(chapter.time % 60).toString().padStart(2, '0')}
                          </span>
                          {' - '}
                          <span className="font-medium">{chapter.title}</span>
                          {chapter.description && (
                            <p className="text-muted-foreground">{chapter.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Tips */}
            {topic.quick_tips && topic.quick_tips.length > 0 && (
              <div className="p-4 bg-primary/5 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  Quick Tips
                </h4>
                <ul className="space-y-2">
                  {topic.quick_tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span className="text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tags */}
            {topic.tags && topic.tags.length > 0 && (
              <div className="pt-4 border-t">
                <div className="flex flex-wrap gap-2">
                  {topic.tags.map((tag) => (
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
  );
};