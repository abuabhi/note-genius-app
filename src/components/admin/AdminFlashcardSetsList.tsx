
import { useState, useEffect } from "react";
import { useFlashcards } from "@/contexts/FlashcardContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { FlashcardSet } from "@/types/flashcard";
import { Card, CardContent } from "@/components/ui/card";

export function AdminFlashcardSetsList() {
  const { fetchBuiltInSets, updateFlashcardSet } = useFlashcards();
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadSets = async () => {
      setLoading(true);
      try {
        const builtInSets = await fetchBuiltInSets();
        setSets(builtInSets || []);
      } catch (error) {
        console.error("Error loading sets:", error);
        toast({
          title: "Error",
          description: "Failed to load flashcard sets",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadSets();
  }, [fetchBuiltInSets, toast]);

  const handleToggleBuiltIn = async (setId: string, isBuiltIn: boolean) => {
    try {
      await updateFlashcardSet(setId, { is_built_in: !isBuiltIn });
      setSets(prevSets => 
        prevSets.map(set => 
          set.id === setId ? { ...set, is_built_in: !isBuiltIn } : set
        )
      );
      
      toast({
        title: "Success",
        description: `Set is now ${!isBuiltIn ? "public" : "private"}`,
      });
    } catch (error) {
      console.error("Error updating set:", error);
      toast({
        title: "Error",
        description: "Failed to update set",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading sets...</div>;
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Cards</TableHead>
                <TableHead>Public</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No flashcard sets found
                  </TableCell>
                </TableRow>
              ) : (
                sets.map((set) => (
                  <TableRow key={set.id}>
                    <TableCell>{set.name}</TableCell>
                    <TableCell>{set.subject || "N/A"}</TableCell>
                    <TableCell>{set.topic || "N/A"}</TableCell>
                    <TableCell>{set.card_count || 0}</TableCell>
                    <TableCell>
                      <Switch 
                        checked={!!set.is_built_in} 
                        onCheckedChange={() => handleToggleBuiltIn(set.id, !!set.is_built_in)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
