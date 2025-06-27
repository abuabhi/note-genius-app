
import React from 'react';
import { useFlashcards } from '@/contexts/FlashcardContext';
import { FlashcardSetGrid } from '@/components/flashcards/components/FlashcardSetGrid';
import { LoadingState } from '@/components/notes/page/LoadingState';
import { ErrorState } from '@/components/notes/page/ErrorState';
import { EmptyState } from '@/components/ui/empty-state';
import { Plus, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useUnifiedSessionTracker } from '@/hooks/useUnifiedSessionTracker';
import { toast } from 'sonner';

export const FlashcardsContent = () => {
  const navigate = useNavigate();
  const { 
    flashcardSets, 
    loading, 
    error,
    viewMode 
  } = useFlashcards();
  
  const { startSession, isActive } = useUnifiedSessionTracker();

  const handleTestSession = async () => {
    try {
      await startSession({
        title: 'Test Study Session',
        subject: 'General',
        activityType: 'flashcard_study'
      });
      toast.success('Test session started! Timer should now be visible.');
    } catch (error) {
      console.error('Failed to start test session:', error);
      toast.error('Failed to start test session');
    }
  };

  if (loading.sets) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!flashcardSets || flashcardSets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <EmptyState
          icon={BookOpen}
          title="No flashcard sets yet"
          description="Create your first flashcard set to get started with studying"
          action={{
            label: "Create Flashcard Set",
            onClick: () => navigate('/flashcards/create')
          }}
        />
        
        {/* Test Session Button */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700 mb-2">Test the floating timer:</p>
          <Button
            onClick={handleTestSession}
            disabled={isActive}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isActive ? 'Session Active' : 'Start Test Session'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Test Session Button - Only show if no active session */}
      {!isActive && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-900">Test Floating Timer</h3>
              <p className="text-sm text-blue-700">Start a test session to see the floating timer</p>
            </div>
            <Button
              onClick={handleTestSession}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Start Test Session
            </Button>
          </div>
        </div>
      )}
      
      <FlashcardSetGrid
        flashcardSets={flashcardSets}
        viewMode={viewMode}
      />
    </div>
  );
};
