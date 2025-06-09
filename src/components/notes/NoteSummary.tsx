
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect, useRef } from 'react';

interface NoteSummaryProps {
  noteContent: string;
}

export const NoteSummary = ({ noteContent }: NoteSummaryProps) => {
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false); // FIXED: Start with false to prevent auto-loading
  const timeoutRef = useRef<NodeJS.Timeout>();
  const hasGeneratedRef = useRef(false);

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // CRITICAL FIX: Don't auto-generate unless explicitly requested
    // This component is just for display, not auto-generation
    if (hasGeneratedRef.current || !noteContent) {
      return;
    }

    // Only show static content, no auto-generation
    const frameId = requestAnimationFrame(() => {
      setSummary('Click "Generate summary" to create an AI-powered summary of this note.');
      setIsLoading(false);
      hasGeneratedRef.current = true;
    });

    return () => {
      cancelAnimationFrame(frameId);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [noteContent]);

  // FIXED: Always show static message instead of auto-generating
  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500 text-sm italic">
          {summary || 'No summary available. Use the "Use AI" dropdown to generate one.'}
        </p>
      </CardContent>
    </Card>
  );
};
