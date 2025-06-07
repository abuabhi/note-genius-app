import { useState } from 'react';
import { Note } from '@/types/note';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StudyViewHeader } from '@/components/notes/StudyViewHeader';
import { NoteSummary } from '@/components/notes/NoteSummary';
import { NoteKeyPoints } from '@/components/notes/NoteKeyPoints';
import { NoteEnhancedView } from '@/components/notes/NoteEnhancedView';
import { Skeleton } from '@/components/ui/skeleton';
import { NoteStudyTracker } from './NoteStudyTracker';

interface NoteStudyViewProps {
  note: Note;
  isLoading?: boolean;
}

export const NoteStudyView = ({ note }: NoteStudyViewProps) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [studyStarted, setStudyStarted] = useState(false);

  const handleTabChange = (value: string) => {
    // Start study session when user switches to study-focused tabs
    if (['summary', 'key-points', 'enhanced'].includes(value) && !studyStarted) {
      setStudyStarted(true);
    }
    
    setActiveTab(value);
  };

  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center h-48">
        <Skeleton className="w-32 h-8 mb-4" />
        <Skeleton className="w-48 h-6" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Study Time Tracker */}
      {studyStarted && (
        <NoteStudyTracker
          noteId={note.id}
          noteName={note.title}
          subject={note.subject || undefined}
          triggerStudyActivity={studyStarted}
          showDonutCounter={true}
          donutSize="small"
          donutPosition="top"
        />
      )}

      {/* StudyViewHeader */}
      <StudyViewHeader
        title={note.title}
        subject={note.subject}
        createdAt={note.created_at}
        updatedAt={note.updated_at}
      />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="key-points">Key Points</TabsTrigger>
          <TabsTrigger value="enhanced">Enhanced View</TabsTrigger>
        </TabsList>
        <TabsContent value="summary" className="space-y-4">
          <NoteSummary noteContent={note.content} />
        </TabsContent>
        <TabsContent value="key-points" className="space-y-4">
          <NoteKeyPoints noteContent={note.content} />
        </TabsContent>
        <TabsContent value="enhanced" className="space-y-4">
          <NoteEnhancedView noteContent={note.content} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
