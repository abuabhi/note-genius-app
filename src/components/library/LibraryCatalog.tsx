
import { useState, useEffect } from "react";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { FlashcardSet } from "@/types/flashcard";
import { UserTier } from "@/hooks/useRequireAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LibrarySetCard } from "./LibrarySetCard";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface LibraryCatalogProps {
  filters: {
    subject: string;
    gradeLevel: string;
    difficulty: string;
  };
  userTier: UserTier;
}

export function LibraryCatalog({ filters, userTier }: LibraryCatalogProps) {
  const { fetchBuiltInSets } = useFlashcards();
  const [loading, setLoading] = useState(true);
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [filteredSets, setFilteredSets] = useState<FlashcardSet[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const { toast } = useToast();
  
  // Fetch built-in sets
  useEffect(() => {
    const loadSets = async () => {
      setLoading(true);
      try {
        const builtInSets = await fetchBuiltInSets();
        setSets(builtInSets);
      } catch (error) {
        console.error("Error fetching library sets:", error);
        toast({
          title: "Failed to load flashcard library",
          description: "Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadSets();
  }, [fetchBuiltInSets, toast]);
  
  // Apply filters
  useEffect(() => {
    let result = [...sets];
    
    if (filters.subject) {
      result = result.filter(set => set.subject === filters.subject);
    }
    
    if (filters.gradeLevel) {
      // Assume we have a 'grade_level' field or derive it from metadata
      result = result.filter(set => {
        const metadata = set.description?.includes(filters.gradeLevel);
        return metadata;
      });
    }
    
    if (filters.difficulty) {
      // Filter by difficulty (could be derived from average card difficulty)
      result = result.filter(set => {
        const difficulty = set.description?.includes(filters.difficulty);
        return difficulty;
      });
    }
    
    setFilteredSets(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [sets, filters]);
  
  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSets.length / itemsPerPage);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading flashcard library...</span>
      </div>
    );
  }
  
  if (filteredSets.length === 0) {
    return (
      <Card className="h-64">
        <CardContent className="flex flex-col items-center justify-center h-full">
          <p className="text-lg text-center text-muted-foreground mb-4">
            No flashcard sets found with the selected filters.
          </p>
          <Button onClick={() => window.location.reload()}>Reset Filters</Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentItems.map(set => (
          <LibrarySetCard 
            key={set.id} 
            set={set} 
            userTier={userTier} 
          />
        ))}
      </div>
      
      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage(prev => Math.max(prev - 1, 1));
                }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(page);
                  }}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage(prev => Math.min(prev + 1, totalPages));
                }}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
