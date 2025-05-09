
import { useState } from "react";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export function AdminFlashcardCreate() {
  const { categories, createFlashcardSet, createFlashcard } = useFlashcards();
  const [isCreatingSet, setIsCreatingSet] = useState(true);
  const { toast } = useToast();
  
  // Set state
  const [setName, setSetName] = useState("");
  const [setDescription, setSetDescription] = useState("");
  const [setSubject, setSetSubject] = useState("");
  const [setTopic, setSetTopic] = useState("");
  const [isBuiltIn, setIsBuiltIn] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  
  // Card state
  const [frontContent, setFrontContent] = useState("");
  const [backContent, setBackContent] = useState("");
  const [difficulty, setDifficulty] = useState<string>("1");
  const [selectedSetId, setSelectedSetId] = useState("");

  const handleCreateSet = async () => {
    if (!setName.trim()) {
      toast({
        title: "Error",
        description: "Set name is required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const newSet = await createFlashcardSet({
        name: setName.trim(),
        description: setDescription.trim(),
        subject: setSubject.trim(),
        topic: setTopic.trim(),
        category_id: selectedCategory || undefined
      });
      
      if (newSet) {
        // Update the set to be built-in if needed
        await updateSetBuiltInStatus(newSet.id, isBuiltIn);
        
        toast({
          title: "Success",
          description: "Flashcard set created successfully",
        });
        
        // Reset form
        setSetName("");
        setSetDescription("");
        setSetSubject("");
        setSetTopic("");
        setSelectedCategory("");
      }
    } catch (error) {
      console.error("Error creating set:", error);
      toast({
        title: "Error",
        description: "Failed to create flashcard set",
        variant: "destructive"
      });
    }
  };

  const updateSetBuiltInStatus = async (setId: string, isBuiltIn: boolean) => {
    try {
      const { error } = await supabase
        .from('flashcard_sets')
        .update({ is_built_in: isBuiltIn })
        .eq('id', setId);
      
      if (error) throw error;
    } catch (error) {
      console.error("Error updating built-in status:", error);
      throw error;
    }
  };

  const handleCreateCard = async () => {
    if (!frontContent.trim() || !backContent.trim()) {
      toast({
        title: "Error",
        description: "Both front and back content are required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const newCard = await createFlashcard(
        {
          front_content: frontContent.trim(),
          back_content: backContent.trim(),
          difficulty: parseInt(difficulty) as 1 | 2 | 3 | 4 | 5
        },
        selectedSetId || undefined
      );
      
      if (newCard) {
        // Update the card to be built-in if needed
        if (isBuiltIn) {
          await updateCardBuiltInStatus(newCard.id, true);
        }
        
        toast({
          title: "Success",
          description: "Flashcard created successfully",
        });
        
        // Reset form
        setFrontContent("");
        setBackContent("");
        setDifficulty("1");
      }
    } catch (error) {
      console.error("Error creating card:", error);
      toast({
        title: "Error",
        description: "Failed to create flashcard",
        variant: "destructive"
      });
    }
  };

  const updateCardBuiltInStatus = async (cardId: string, isBuiltIn: boolean) => {
    try {
      const { error } = await supabase
        .from('flashcards')
        .update({ is_built_in: isBuiltIn })
        .eq('id', cardId);
      
      if (error) throw error;
    } catch (error) {
      console.error("Error updating built-in status:", error);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-4">
        <Button 
          variant={isCreatingSet ? "default" : "outline"} 
          onClick={() => setIsCreatingSet(true)}
        >
          Create Flashcard Set
        </Button>
        <Button 
          variant={!isCreatingSet ? "default" : "outline"} 
          onClick={() => setIsCreatingSet(false)}
        >
          Create Flashcard
        </Button>
      </div>
      
      {isCreatingSet ? (
        <Card>
          <CardHeader>
            <CardTitle>Create New Flashcard Set</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="set-name">Set Name</Label>
                <Input
                  id="set-name"
                  value={setName}
                  onChange={(e) => setSetName(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="set-description">Description</Label>
                <Textarea
                  id="set-description"
                  value={setDescription}
                  onChange={(e) => setSetDescription(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="set-subject">Subject</Label>
                  <Input
                    id="set-subject"
                    value={setSubject}
                    onChange={(e) => setSetSubject(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="set-topic">Topic</Label>
                  <Input
                    id="set-topic"
                    value={setTopic}
                    onChange={(e) => setSetTopic(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">None</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Label htmlFor="is-built-in">Public Library Set</Label>
                <Switch
                  id="is-built-in"
                  checked={isBuiltIn}
                  onCheckedChange={setIsBuiltIn}
                />
              </div>
              
              <Button onClick={handleCreateSet}>Create Set</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Create New Flashcard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="front-content">Front Content</Label>
                <Textarea
                  id="front-content"
                  value={frontContent}
                  onChange={(e) => setFrontContent(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="back-content">Back Content</Label>
                <Textarea
                  id="back-content"
                  value={backContent}
                  onChange={(e) => setBackContent(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={difficulty}
                    onValueChange={setDifficulty}
                  >
                    <SelectTrigger id="difficulty">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Easy</SelectItem>
                      <SelectItem value="2">2 - Basic</SelectItem>
                      <SelectItem value="3">3 - Intermediate</SelectItem>
                      <SelectItem value="4">4 - Advanced</SelectItem>
                      <SelectItem value="5">5 - Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="set">Assign to Set</Label>
                  <Select
                    value={selectedSetId}
                    onValueChange={setSelectedSetId}
                  >
                    <SelectTrigger id="set">
                      <SelectValue placeholder="Select set" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">None</SelectItem>
                      {/* We should display sets here */}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Label htmlFor="card-is-built-in">Public Library Card</Label>
                <Switch
                  id="card-is-built-in"
                  checked={isBuiltIn}
                  onCheckedChange={setIsBuiltIn}
                />
              </div>
              
              <Button onClick={handleCreateCard}>Create Flashcard</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { supabase } from "@/integrations/supabase/client";

