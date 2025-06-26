
import { useCallback } from 'react';
import { useTopicSuggestions } from './useTopicSuggestions';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

export const useTopicProgressTracker = () => {
  const { user } = useAuth();
  const { trackProgress } = useTopicSuggestions();

  const trackNoteCreation = useCallback(async (noteContent: string, subject?: string, tags?: string[]) => {
    if (!user?.id || !subject) return;

    // Simple topic extraction from content and tags
    const potentialTopics = await extractTopicsFromContent(noteContent, subject, tags);
    
    for (const topic of potentialTopics) {
      try {
        await trackProgress(subject, topic, 'note');
      } catch (error) {
        console.error('Error tracking note progress:', error);
      }
    }
  }, [user?.id, trackProgress]);

  const trackFlashcardCreation = useCallback(async (setName: string, subject?: string) => {
    if (!user?.id || !subject || !setName) return;

    // Extract topic from flashcard set name
    const topic = extractTopicFromSetName(setName);
    if (topic) {
      try {
        await trackProgress(subject, topic, 'flashcard');
      } catch (error) {
        console.error('Error tracking flashcard progress:', error);
      }
    }
  }, [user?.id, trackProgress]);

  const trackQuizCreation = useCallback(async (quizTitle: string, subject?: string) => {
    if (!user?.id || !subject || !quizTitle) return;

    // Extract topic from quiz title
    const topic = extractTopicFromSetName(quizTitle);
    if (topic) {
      try {
        await trackProgress(subject, topic, 'quiz');
      } catch (error) {
        console.error('Error tracking quiz progress:', error);
      }
    }
  }, [user?.id, trackProgress]);

  return {
    trackNoteCreation,
    trackFlashcardCreation,
    trackQuizCreation,
  };
};

// Helper function to extract topics from content
async function extractTopicsFromContent(
  content: string, 
  subject: string, 
  tags?: string[]
): Promise<string[]> {
  const topics: string[] = [];
  
  // Get curriculum topics for the subject
  const { data: curriculumTopics } = await supabase
    .from('curriculum_topics')
    .select('topic_name')
    .eq('subject_name', subject);

  if (!curriculumTopics) return topics;

  const topicNames = curriculumTopics.map(t => t.topic_name.toLowerCase());
  
  // Check if any curriculum topics are mentioned in the content
  const contentLower = content.toLowerCase();
  for (const topicName of topicNames) {
    if (contentLower.includes(topicName.toLowerCase())) {
      const originalTopic = curriculumTopics.find(
        t => t.topic_name.toLowerCase() === topicName
      )?.topic_name;
      if (originalTopic) topics.push(originalTopic);
    }
  }
  
  // Check tags
  if (tags) {
    for (const tag of tags) {
      const matchingTopic = curriculumTopics.find(
        t => t.topic_name.toLowerCase() === tag.toLowerCase()
      );
      if (matchingTopic) {
        topics.push(matchingTopic.topic_name);
      }
    }
  }
  
  return [...new Set(topics)]; // Remove duplicates
}

// Helper function to extract topic from set/quiz name
function extractTopicFromSetName(name: string): string | null {
  // Simple heuristic: look for topic keywords in the name
  // This could be enhanced with more sophisticated NLP
  const cleanName = name.replace(/[^\w\s]/g, ' ').trim();
  const words = cleanName.split(' ');
  
  // Return the longest meaningful word as potential topic
  const meaningfulWords = words.filter(word => word.length > 3);
  if (meaningfulWords.length > 0) {
    // Capitalize first letter of each word
    return meaningfulWords
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  return null;
}
