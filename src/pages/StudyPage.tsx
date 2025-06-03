
import Layout from "@/components/layout/Layout";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { StudyPageContent } from "./study/StudyPageContent";

// Re-export the StudyMode type for backward compatibility
export type { StudyMode } from "./study/types";

const StudyPage = () => {
  useRequireAuth();
  
  return (
    <Layout>
      <StudyPageContent />
    </Layout>
  );
};

export default StudyPage;
