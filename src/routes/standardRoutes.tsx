
import React from 'react';
import DashboardPage from "@/pages/DashboardPage";
import NotesPage from "@/pages/NotesPage";
import NoteStudyPage from "@/pages/NoteStudyPage";
import FlashcardsPage from "@/pages/FlashcardsPage";
import FlashcardSetPage from "@/pages/FlashcardSetPage";
import CreateFlashcardPage from "@/pages/CreateFlashcardPage";
import EditFlashcardPage from "@/pages/EditFlashcardPage";
import { StudyPageContent } from "@/pages/study/StudyPageContent";
import Layout from "@/components/layout/Layout";
import SettingsPage from "@/pages/SettingsPage";
import FlashcardLibraryPage from "@/pages/FlashcardLibraryPage";
import EditNotePage from "@/pages/EditNotePage";
import { RouteConfig } from './publicRoutes';

// Standard protected routes - always available to authenticated users
export const standardRoutes: RouteConfig[] = [
  { path: "/dashboard", element: <DashboardPage /> },
  { path: "/notes", element: <NotesPage /> },
  { path: "/notes/study/:noteId", element: <NoteStudyPage /> },
  { path: "/flashcards", element: <FlashcardsPage /> },
  { path: "/flashcards/:setId", element: <FlashcardSetPage /> },
  { path: "/flashcards/:setId/create", element: <CreateFlashcardPage /> },
  { path: "/flashcards/:setId/card/:cardId/edit", element: <EditFlashcardPage /> },
  { path: "/study", element: <Layout><StudyPageContent /></Layout> },
  { path: "/study/:setId", element: <Layout><StudyPageContent /></Layout> },
  { path: "/settings", element: <SettingsPage /> },
  { path: "/library", element: <FlashcardLibraryPage /> },
  { path: "/notes/edit/:noteId", element: <EditNotePage /> },
];
