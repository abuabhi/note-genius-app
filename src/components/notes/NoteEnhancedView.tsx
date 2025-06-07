
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';

interface NoteEnhancedViewProps {
  noteContent: string;
}

export const NoteEnhancedView = ({ noteContent }: NoteEnhancedViewProps) => {
  const [enhancedContent, setEnhancedContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate enhanced content generation
    const timer = setTimeout(() => {
      setEnhancedContent(`
        # Enhanced Note Content
        
        This is an enhanced and improved version of your original note with better formatting, structure, and clarity.
        
        ## Main Topics
        - Topic 1: Detailed explanation
        - Topic 2: Key insights
        - Topic 3: Important connections
        
        ## Detailed Analysis
        The enhanced content provides deeper insights and better organization of the material for improved learning and retention.
      `);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [noteContent]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Enhanced View</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enhanced View</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose max-w-none">
          <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed">
            {enhancedContent}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};
