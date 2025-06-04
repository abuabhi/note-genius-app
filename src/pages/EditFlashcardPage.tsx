
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Flashcard, FlashcardDifficulty } from "@/types/flashcard";

const EditFlashcardPage = () => {
  useRequireAuth();
  const { setId, cardId } = useParams<{ setId: string; cardId: string }>();
  const navigate = useNavigate();
  const { fetchFlashcardsInSet, updateFlashcard } = useFlashcards();
  
  const [flashcard, setFlashcard] = useState<Flashcard | null>(null);
  const [frontContent, setFrontContent] = useState("");
  const [backContent, setBackContent] = useState("");
  const [difficulty, setDifficulty] = useState<FlashcardDifficulty>(3);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Helper function to ensure difficulty is a valid FlashcardDifficulty
  const getValidDifficulty = (value: number | undefined): FlashcardDifficulty => {
    if (value && value >= 1 && value <= 5) {
      return value as FlashcardDifficulty;
    }
    return 3; // Default fallback
  };

  useEffect(() => {
    const loadFlashcard = async () => {
      if (!setId || !cardId) return;
      
      try {
        setLoading(true);
        const cards = await fetchFlashcardsInSet(setId);
        const card = cards?.find(c => c.id === cardId);
        
        if (card) {
          setFlashcard(card);
          setFrontContent(card.front_content || card.front || "");
          setBackContent(card.back_content || card.back || "");
          setDifficulty(getValidDifficulty(card.difficulty));
        } else {
          toast.error("Flashcard not found");
          navigate(`/flashcards/${setId}`);
        }
      } catch (error) {
        console.error("Error loading flashcard:", error);
        toast.error("Failed to load flashcard");
      } finally {
        setLoading(false);
      }
    };

    loadFlashcard();
  }, [setId, cardId, fetchFlashcardsInSet, navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!frontContent.trim() || !backContent.trim()) {
      toast.error("Please fill in both sides of the flashcard.");
      return;
    }
    
    if (!cardId) return;
    
    setSaving(true);
    
    try {
      await updateFlashcard(cardId, {
        front_content: frontContent.trim(),
        back_content: backContent.trim(),
        difficulty,
      });
      
      toast.success("Flashcard updated successfully");
      navigate(`/flashcards/${setId}`);
    } catch (error) {
      console.error("Error updating flashcard:", error);
      toast.error("Failed to update flashcard");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate(`/flashcards/${setId}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Set
          </Button>
          <h1 className="text-3xl font-bold text-mint-900">Edit Flashcard</h1>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Edit Flashcard</CardTitle>
            </CardHeader>
            <form onSubmit={handleSave}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="front">Front</Label>
                  <Textarea 
                    id="front"
                    placeholder="Enter the question or prompt"
                    value={frontContent}
                    onChange={(e) => setFrontContent(e.target.value)}
                    className="min-h-[100px]"
                    disabled={saving}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="back">Back</Label>
                  <Textarea 
                    id="back"
                    placeholder="Enter the answer or explanation"
                    value={backContent}
                    onChange={(e) => setBackContent(e.target.value)}
                    className="min-h-[100px]"
                    disabled={saving}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select 
                    value={difficulty.toString()} 
                    onValueChange={(value) => setDifficulty(parseInt(value) as FlashcardDifficulty)}
                    disabled={saving}
                  >
                    <SelectTrigger id="difficulty">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Very Easy (1)</SelectItem>
                      <SelectItem value="2">Easy (2)</SelectItem>
                      <SelectItem value="3">Medium (3)</SelectItem>
                      <SelectItem value="4">Hard (4)</SelectItem>
                      <SelectItem value="5">Very Hard (5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleBack} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default EditFlashcardPage;
