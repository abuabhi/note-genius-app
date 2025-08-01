import { Note } from '@/types/note';

export interface SubjectDistribution {
  subjectName: string;
  subjectId: string;
  count: number;
}

export interface SubjectAnalysis {
  totalSubjects: number;
  distributions: SubjectDistribution[];
  primarySubject: SubjectDistribution | null;
  hasMultipleSubjects: boolean;
}

export const analyzeSelectedNotesSubjects = (selectedNotes: Note[]): SubjectAnalysis => {
  if (selectedNotes.length === 0) {
    return {
      totalSubjects: 0,
      distributions: [],
      primarySubject: null,
      hasMultipleSubjects: false
    };
  }

  // Count subjects by both name and ID
  const subjectCounts = selectedNotes.reduce((acc: Record<string, { name: string; id: string; count: number }>, note) => {
    const key = note.subject || 'Unknown';
    const id = note.subject_id || 'unknown';
    
    if (!acc[key]) {
      acc[key] = { name: key, id, count: 0 };
    }
    acc[key].count++;
    return acc;
  }, {});

  const distributions: SubjectDistribution[] = Object.values(subjectCounts)
    .map(({ name, id, count }) => ({
      subjectName: name,
      subjectId: id,
      count
    }))
    .sort((a, b) => {
      // Sort by count descending, then alphabetically
      if (b.count !== a.count) return b.count - a.count;
      return a.subjectName.localeCompare(b.subjectName);
    });

  const primarySubject = distributions[0] || null;
  const hasMultipleSubjects = distributions.length > 1;

  return {
    totalSubjects: distributions.length,
    distributions,
    primarySubject,
    hasMultipleSubjects
  };
};