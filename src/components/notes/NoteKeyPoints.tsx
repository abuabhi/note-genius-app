
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

interface NoteKeyPointsProps {
  noteContent: string;
}

export const NoteKeyPoints = ({ noteContent }: NoteKeyPointsProps) => {
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate key points generation
    const timer = setTimeout(() => {
      setKeyPoints([
        'Main concept or topic discussed in the note',
        'Important details and supporting information',
        'Key takeaways and conclusions',
        'Action items or next steps if applicable'
      ]);
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [noteContent]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Key Points</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Points</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {keyPoints.map((point, index) => (
            <li key={index} className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{point}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
