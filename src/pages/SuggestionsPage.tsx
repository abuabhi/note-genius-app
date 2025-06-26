
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { TopicSuggestionsCard } from '@/components/suggestions/TopicSuggestionsCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useNavigate } from 'react-router-dom';

const SuggestionsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialSubject = searchParams.get('subject') || 'Mathematics';
  const [selectedSubject, setSelectedSubject] = useState(initialSubject);

  // Get available subjects
  const { data: availableSubjects } = useQuery({
    queryKey: ['available-subjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('curriculum_topics')
        .select('subject_name')
        .order('subject_name');
      
      if (error) throw error;
      
      const uniqueSubjects = [...new Set(data.map(item => item.subject_name))];
      return uniqueSubjects;
    },
  });

  const handleCreateResource = (topic: string, resourceType: 'note' | 'flashcard' | 'quiz') => {
    switch (resourceType) {
      case 'note':
        navigate(`/notes/new?subject=${encodeURIComponent(selectedSubject)}&topic=${encodeURIComponent(topic)}`);
        break;
      case 'flashcard':
        navigate(`/flashcards/create?subject=${encodeURIComponent(selectedSubject)}&topic=${encodeURIComponent(topic)}`);
        break;
      case 'quiz':
        navigate(`/quiz/create?subject=${encodeURIComponent(selectedSubject)}&topic=${encodeURIComponent(topic)}`);
        break;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Topic Suggestions</h1>
          <p className="text-gray-600">
            Discover new topics to study based on your learning progress and curriculum.
          </p>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Subject:</label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {availableSubjects?.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="max-w-4xl">
          <TopicSuggestionsCard
            subjectName={selectedSubject}
            onCreateResource={handleCreateResource}
          />
        </div>
      </div>
    </Layout>
  );
};

export default SuggestionsPage;
