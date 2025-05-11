
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useFeatures } from '@/contexts/FeatureContext';

// All required features that should exist
const REQUIRED_FEATURES = [
  { key: "goals", description: "Goal setting and tracking" },
  { key: "todos", description: "Todo list management" },
  { key: "study_sessions", description: "Study session tracking" },
  { key: "progress", description: "Progress tracking and analytics" },
  { key: "quizzes", description: "Quiz creation and taking" },
  { key: "flashcards", description: "Flashcards creation and study" },
  { key: "schedule", description: "Calendar and scheduling" },
  { key: "chat", description: "Chat with other users and AI assistant" },
  { key: "collaboration", description: "Collaborate with other users on notes and flashcards" },
  { key: "import", description: "Import from external services" },
  { key: "ai_flashcard_generation", description: "AI-powered flashcard generation from notes" },
  { key: "note_enrichment", description: "AI-powered note enrichment features" },
  { key: "ocr_scanning", description: "Optical Character Recognition for scanning notes" }
];

export function RequiredFeaturesList() {
  const { features, refreshFeatures } = useFeatures();
  const [isSyncing, setSyncing] = React.useState(false);

  const getMissingFeatures = () => {
    const existingKeys = features.map(f => f.feature_key);
    return REQUIRED_FEATURES.filter(rf => !existingKeys.includes(rf.key)).length;
  };

  const syncRequiredFeatures = async () => {
    try {
      setSyncing(true);
      
      // Check each required feature
      for (const reqFeature of REQUIRED_FEATURES) {
        const { data: existing } = await supabase
          .from('app_features')
          .select('*')
          .eq('feature_key', reqFeature.key)
          .single();
          
        if (!existing) {
          // Feature doesn't exist, create it
          const { error } = await supabase
            .from('app_features')
            .insert([{
              feature_key: reqFeature.key,
              description: reqFeature.description,
              is_enabled: false,
              visibility_mode: 'visible'
            }]);
            
          if (error) throw error;
        }
      }
      
      toast.success("Features synchronized successfully");
      await refreshFeatures();
    } catch (err) {
      console.error("Error syncing features:", err);
      toast.error("Failed to sync features");
    } finally {
      setSyncing(false);
    }
  };

  const missingFeaturesCount = getMissingFeatures();
  
  if (missingFeaturesCount === 0) {
    return null;
  }
  
  return (
    <Button 
      variant="outline" 
      onClick={syncRequiredFeatures} 
      disabled={isSyncing}
      className="flex items-center gap-2"
    >
      {isSyncing ? <Loader className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
      Sync Missing Features ({missingFeaturesCount})
    </Button>
  );
}
