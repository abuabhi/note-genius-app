import { useCallback, useRef, useEffect } from 'react';
import { Note } from '@/types/note';
import { useBackgroundProcessor } from './useBackgroundProcessor';
import { useMultiLevelCache } from './useMultiLevelCache';

interface UserBehavior {
  viewedNotes: string[];
  searchTerms: string[];
  timeSpentPerNote: Map<string, number>;
  commonPatterns: string[];
  lastActions: Array<{
    type: 'view' | 'search' | 'edit' | 'create';
    noteId?: string;
    timestamp: number;
  }>;
}

interface PrefetchStrategy {
  relatedNotes: boolean;
  recentlyViewed: boolean;
  similarContent: boolean;
  userPatterns: boolean;
  searchPrediction: boolean;
}

export const useIntelligentPrefetching = (notes: Note[]) => {
  const behaviorRef = useRef<UserBehavior>({
    viewedNotes: [],
    searchTerms: [],
    timeSpentPerNote: new Map(),
    commonPatterns: [],
    lastActions: []
  });
  
  const { addJob, registerWorker } = useBackgroundProcessor();
  const cache = useMultiLevelCache();
  
  // Track user behavior
  const trackAction = useCallback((
    type: 'view' | 'search' | 'edit' | 'create',
    noteId?: string,
    metadata?: any
  ) => {
    const action = {
      type,
      noteId,
      timestamp: Date.now(),
      ...metadata
    };
    
    behaviorRef.current.lastActions.push(action);
    
    // Keep only last 100 actions
    if (behaviorRef.current.lastActions.length > 100) {
      behaviorRef.current.lastActions = behaviorRef.current.lastActions.slice(-100);
    }
    
    // Track viewed notes
    if (type === 'view' && noteId) {
      if (!behaviorRef.current.viewedNotes.includes(noteId)) {
        behaviorRef.current.viewedNotes.push(noteId);
      }
    }
    
    // Track search terms
    if (type === 'search' && metadata?.searchTerm) {
      behaviorRef.current.searchTerms.push(metadata.searchTerm);
      if (behaviorRef.current.searchTerms.length > 50) {
        behaviorRef.current.searchTerms = behaviorRef.current.searchTerms.slice(-50);
      }
    }
    
    console.log('📊 User action tracked:', action);
    
    // Trigger prefetching based on action
    triggerIntelligentPrefetch(action);
  }, []);

  // Analyze user patterns
  const analyzePatterns = useCallback(() => {
    const actions = behaviorRef.current.lastActions;
    const patterns: string[] = [];
    
    // Find sequential patterns
    for (let i = 0; i < actions.length - 2; i++) {
      const sequence = actions.slice(i, i + 3);
      const pattern = sequence.map(a => `${a.type}:${a.noteId || 'none'}`).join('->');
      patterns.push(pattern);
    }
    
    // Find most common patterns
    const patternCounts = patterns.reduce((acc, pattern) => {
      acc[pattern] = (acc[pattern] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    behaviorRef.current.commonPatterns = Object.entries(patternCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([pattern]) => pattern);
    
    console.log('🧠 User patterns analyzed:', behaviorRef.current.commonPatterns);
  }, []);

  // Predict next actions
  const predictNextActions = useCallback((currentAction: any) => {
    const predictions: Array<{ type: string; noteId?: string; confidence: number }> = [];
    
    // Pattern-based prediction
    behaviorRef.current.commonPatterns.forEach(pattern => {
      const steps = pattern.split('->');
      const currentStep = `${currentAction.type}:${currentAction.noteId || 'none'}`;
      
      const stepIndex = steps.findIndex(step => step === currentStep);
      if (stepIndex >= 0 && stepIndex < steps.length - 1) {
        const nextStep = steps[stepIndex + 1];
        const [type, noteId] = nextStep.split(':');
        
        predictions.push({
          type,
          noteId: noteId !== 'none' ? noteId : undefined,
          confidence: 0.7
        });
      }
    });
    
    // Content similarity prediction
    if (currentAction.type === 'view' && currentAction.noteId) {
      const currentNote = notes.find(n => n.id === currentAction.noteId);
      if (currentNote) {
        const similarNotes = findSimilarNotes(currentNote, notes);
        similarNotes.forEach(note => {
          predictions.push({
            type: 'view',
            noteId: note.id,
            confidence: 0.5
          });
        });
      }
    }
    
    return predictions.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
  }, [notes]);

  // Find similar notes based on content
  const findSimilarNotes = useCallback((note: Note, allNotes: Note[]) => {
    const noteWords = new Set(
      (note.title + ' ' + (note.content || '')).toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 3)
    );
    
    return allNotes
      .filter(n => n.id !== note.id)
      .map(n => {
        const otherWords = new Set(
          (n.title + ' ' + (n.content || '')).toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 3)
        );
        
        const intersection = new Set([...noteWords].filter(x => otherWords.has(x)));
        const union = new Set([...noteWords, ...otherWords]);
        const similarity = intersection.size / union.size;
        
        return { note: n, similarity };
      })
      .filter(({ similarity }) => similarity > 0.1)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3)
      .map(({ note }) => note);
  }, []);

  // Intelligent prefetching trigger
  const triggerIntelligentPrefetch = useCallback(async (action: any) => {
    const predictions = predictNextActions(action);
    
    predictions.forEach(prediction => {
      if (prediction.confidence > 0.6) {
        addJob('prefetch_content', {
          type: prediction.type,
          noteId: prediction.noteId,
          confidence: prediction.confidence
        }, 'low');
      }
    });
    
    // Prefetch related content based on current action
    if (action.type === 'view' && action.noteId) {
      const note = notes.find(n => n.id === action.noteId);
      if (note) {
        // Prefetch similar notes
        const similarNotes = findSimilarNotes(note, notes);
        similarNotes.forEach(similarNote => {
          addJob('prefetch_note', { noteId: similarNote.id }, 'low');
        });
        
        // Prefetch notes in same subject
        const sameSubjectNotes = notes.filter(n => 
          n.subject === note.subject && n.id !== note.id
        ).slice(0, 3);
        
        sameSubjectNotes.forEach(subjectNote => {
          addJob('prefetch_note', { noteId: subjectNote.id }, 'low');
        });
      }
    }
  }, [predictNextActions, addJob, notes, findSimilarNotes]);

  // Register prefetch workers
  useEffect(() => {
    registerWorker('prefetch_content', async ({ type, noteId, confidence }) => {
      console.log(`🚀 Prefetching ${type} content for note ${noteId} (confidence: ${confidence})`);
      
      if (noteId) {
        const note = notes.find(n => n.id === noteId);
        if (note) {
          // Cache the note data
          cache.set(`note_${noteId}`, note, {
            levels: ['memory'],
            ttl: 10 * 60 * 1000 // 10 minutes
          });
          
          // Prefetch related data
          if (note.subject) {
            cache.set(`subject_${note.subject}`, note.subject, {
              levels: ['memory'],
              ttl: 15 * 60 * 1000
            });
          }
        }
      }
    });
    
    registerWorker('prefetch_note', async ({ noteId }) => {
      console.log(`📄 Prefetching note: ${noteId}`);
      
      const note = notes.find(n => n.id === noteId);
      if (note) {
        cache.set(`note_${noteId}`, note, {
          levels: ['memory'],
          ttl: 10 * 60 * 1000
        });
      }
    });
    
    registerWorker('analyze_user_patterns', async () => {
      analyzePatterns();
    });
  }, [registerWorker, notes, cache, analyzePatterns]);

  // Periodic pattern analysis
  useEffect(() => {
    const interval = setInterval(() => {
      addJob('analyze_user_patterns', {}, 'low');
    }, 5 * 60 * 1000); // Every 5 minutes
    
    return () => clearInterval(interval);
  }, [addJob]);

  return {
    trackAction,
    analyzePatterns,
    predictNextActions,
    findSimilarNotes,
    behaviorData: behaviorRef.current
  };
};
