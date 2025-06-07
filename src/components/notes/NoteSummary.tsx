
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';

interface NoteSummaryProps {
  noteContent: string;
}

export const NoteSummary = ({ noteContent }: NoteSummaryProps) => {
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate summary generation
    const timer = setTimeout(() => {
      setSummary(`This is a summary of the note content. Key points and main ideas are highlighted here for quick review and study.`);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [noteContent]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 leading-relaxed">{summary}</p>
      </CardContent>
    </Card>
  );
};
