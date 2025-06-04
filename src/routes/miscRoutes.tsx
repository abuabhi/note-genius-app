import React from 'react';
import NoteToFlashcardPage from "@/pages/NoteToFlashcardPage";
import OnboardingPage from "@/pages/OnboardingPage";
import NotFoundPage from "@/pages/NotFoundPage";
import { RouteConfig } from './publicRoutes';

// Other miscellaneous routes
export const miscRoutes: RouteConfig[] = [
  { path: "/note-to-flashcard", element: <NoteToFlashcardPage /> },
  { path: "/onboarding", element: <OnboardingPage /> },
  { path: "*", element: <NotFoundPage /> },
];
