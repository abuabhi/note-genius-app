
import { useFetchSections } from "./sections/useFetchSections";
import { useSectionMutations } from "./sections/useSectionMutations";
import { useSectionCSVImport } from "./sections/useSectionCSVImport";

export const useSections = () => {
  const { sections, isLoading } = useFetchSections();
  const { createSection, updateSection, deleteSection } = useSectionMutations();
  const { loading, importSectionsFromCSV } = useSectionCSVImport();

  return {
    sections,
    isLoading,
    loading,
    createSection,
    updateSection,
    deleteSection,
    importSectionsFromCSV
  };
};
