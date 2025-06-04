
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import SimpleFlashcardSetsList from "@/components/flashcards/SimpleFlashcardSetsList";
import CreateFlashcard from "@/components/flashcards/CreateFlashcard";
import CreateFlashcardSet from "@/components/flashcards/CreateFlashcardSet";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FlashcardsPage = () => {
  // Make sure the user is authenticated
  useRequireAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-3xl font-bold mb-4 sm:mb-0">Flashcards</h1>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create New
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Create New</DialogTitle>
                <DialogDescription>
                  Create a new flashcard or flashcard set to help you study.
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="flashcard" className="mt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="flashcard">Flashcard</TabsTrigger>
                  <TabsTrigger value="set">Flashcard Set</TabsTrigger>
                </TabsList>
                <TabsContent value="flashcard" className="mt-4">
                  <CreateFlashcard onSuccess={() => setCreateDialogOpen(false)} />
                </TabsContent>
                <TabsContent value="set" className="mt-4">
                  <CreateFlashcardSet onSuccess={() => setCreateDialogOpen(false)} />
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
        
        <SimpleFlashcardSetsList />
      </div>
    </Layout>
  );
};

export default FlashcardsPage;
