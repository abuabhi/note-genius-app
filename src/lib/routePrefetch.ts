// Map of route paths -> dynamic import function for the page chunk.
// Used by sidebar nav links to warm the JS chunk on hover/focus so that
// clicking the link feels instant in production.
//
// Keep these imports identical to the ones in src/routes/standardRoutes.tsx
// so Vite/Rollup deduplicates them into the same chunk.

type Importer = () => Promise<unknown>;

const importers: Record<string, Importer> = {
  '/dashboard': () => import('@/pages/DashboardPage'),
  '/notes': () => import('@/pages/NotesPage'),
  '/flashcards': () => import('@/pages/FlashcardsPage'),
  '/quizzes': () => import('@/pages/QuizPage'),
  '/quiz': () => import('@/pages/QuizPage'),
  '/schedule': () => import('@/pages/SchedulePage'),
  '/goals': () => import('@/pages/GoalsPage'),
  '/exam-prep': () => import('@/pages/ExamPrepPage'),
  '/analytics': () => import('@/pages/AnalyticsPage'),
  '/resources': () => import('@/pages/ResourcesPage'),
  '/referrals': () => import('@/pages/ReferralsPage'),
  '/feedback': () => import('@/pages/FeedbackPage'),
  '/settings': () => import('@/pages/SettingsPage'),
};

const prefetched = new Set<string>();

export const prefetchRoute = (path: string) => {
  if (prefetched.has(path)) return;
  const importer = importers[path];
  if (!importer) return;
  prefetched.add(path);
  // Fire and forget; failures are harmless and just mean the click path
  // will load the chunk normally.
  importer().catch(() => {
    prefetched.delete(path);
  });
};
