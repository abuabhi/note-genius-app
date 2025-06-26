
/**
 * Consistent color mapping for different subjects
 */
const SUBJECT_COLOR_MAPPING: Record<string, string> = {
  // Academic subjects
  'mathematics': 'bg-blue-100 text-blue-800 border-blue-200',
  'math': 'bg-blue-100 text-blue-800 border-blue-200',
  'english': 'bg-green-100 text-green-800 border-green-200',
  'science': 'bg-purple-100 text-purple-800 border-purple-200',
  'physics': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'chemistry': 'bg-cyan-100 text-cyan-800 border-cyan-200',
  'biology': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'history': 'bg-amber-100 text-amber-800 border-amber-200',
  'geography': 'bg-teal-100 text-teal-800 border-teal-200',
  'literature': 'bg-rose-100 text-rose-800 border-rose-200',
  'art': 'bg-pink-100 text-pink-800 border-pink-200',
  'music': 'bg-violet-100 text-violet-800 border-violet-200',
  'technology': 'bg-slate-100 text-slate-800 border-slate-200',
  'computer science': 'bg-gray-100 text-gray-800 border-gray-200',
  'programming': 'bg-gray-100 text-gray-800 border-gray-200',
  'languages': 'bg-orange-100 text-orange-800 border-orange-200',
  'french': 'bg-orange-100 text-orange-800 border-orange-200',
  'spanish': 'bg-orange-100 text-orange-800 border-orange-200',
  'german': 'bg-orange-100 text-orange-800 border-orange-200',
  
  // Default categories
  'general': 'bg-mint-100 text-mint-800 border-mint-200',
  'other': 'bg-neutral-100 text-neutral-800 border-neutral-200',
  'uncategorized': 'bg-neutral-100 text-neutral-800 border-neutral-200',
};

/**
 * Get consistent color classes for a subject
 */
export const getSubjectColorClasses = (subjectName: string): string => {
  if (!subjectName) return SUBJECT_COLOR_MAPPING['general'];
  
  const normalizedSubject = subjectName.toLowerCase().trim();
  
  // Direct match
  if (SUBJECT_COLOR_MAPPING[normalizedSubject]) {
    return SUBJECT_COLOR_MAPPING[normalizedSubject];
  }
  
  // Partial match
  for (const [key, colorClass] of Object.entries(SUBJECT_COLOR_MAPPING)) {
    if (normalizedSubject.includes(key) || key.includes(normalizedSubject)) {
      return colorClass;
    }
  }
  
  // Default fallback
  return SUBJECT_COLOR_MAPPING['general'];
};
