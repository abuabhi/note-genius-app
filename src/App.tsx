
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import NotFoundPage from "@/pages/NotFoundPage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import DashboardPage from "@/pages/DashboardPage";
import NotesPage from "@/pages/NotesPage";
import FlashcardsPage from "@/pages/FlashcardsPage";
import NoteToFlashcardPage from "@/pages/NoteToFlashcardPage";
import SchedulePage from "@/pages/SchedulePage";
import QuizPage from "@/pages/QuizPage";
import ProgressPage from "@/pages/ProgressPage";
import SettingsPage from "@/pages/SettingsPage";
import CollaborationPage from "@/pages/CollaborationPage";
import PricingPage from "@/pages/PricingPage";
import FAQPage from "@/pages/FAQPage";
import FlashcardLibraryPage from "@/pages/FlashcardLibraryPage";
import AdminFlashcardPage from "@/pages/AdminFlashcardPage";
import StudyPage from "@/pages/StudyPage";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

function App() {
  return (
    <Router>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AuthProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/flashcards" element={<FlashcardsPage />} />
            <Route path="/flashcard-library" element={<FlashcardLibraryPage />} />
            <Route path="/admin/flashcards" element={<AdminFlashcardPage />} />
            <Route path="/study/:setId" element={<StudyPage />} />
            <Route path="/note-to-flashcard" element={<NoteToFlashcardPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/collaborate" element={<CollaborationPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
