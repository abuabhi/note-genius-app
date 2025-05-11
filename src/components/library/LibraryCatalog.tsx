
import { useState, useEffect } from "react";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { FlashcardSet } from "@/types/flashcard";
import { LibrarySetCard } from "./LibrarySetCard";

export const LibraryCatalog = () => {
  const { fetchBuiltInSets } = useFlashcards();
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadSets = async () => {
      setLoading(true);
      try {
        const builtInSets = await fetchBuiltInSets();
        setSets(builtInSets || []);
      } catch (error) {
        console.error("Error loading library sets:", error);
        setSets([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadSets();
  }, [fetchBuiltInSets]);
  
  if (loading) {
    return <div>Loading library sets...</div>;
  }
  
  if (sets.length === 0) {
    return <div>No library sets available.</div>;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sets.map((set) => (
        <LibrarySetCard key={set.id} set={set} />
      ))}
    </div>
  );
};
