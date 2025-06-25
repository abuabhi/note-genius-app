
import { useParams, Navigate } from "react-router-dom";
import { SimplifiedStudyPage } from "./SimplifiedStudyPage";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export const StudyPageContent = () => {
  // Ensure user is authenticated before showing study content
  useRequireAuth();
  
  const { id } = useParams<{ id: string }>();
  
  console.log("StudyPageContent: Redirecting to simplified study page with id:", id);
  
  if (!id) {
    console.log("StudyPageContent: No id provided, redirecting to flashcards");
    return <Navigate to="/flashcards" />;
  }

  // Use the new simplified study page component
  return <SimplifiedStudyPage />;
};
