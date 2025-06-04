
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import EnhancedFlashcardSetsList from "@/components/flashcards/EnhancedFlashcardSetsList";
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
import { Plus, BookOpen, Target, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FlashcardsPage = () => {
  // Make sure the user is authenticated
  useRequireAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <Layout>
      <div className="container mx-auto p-6">
        {/* Enhanced Header */}
        <div className="flex flex-col space-y-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-3xl font-bold text-mint-900 mb-2">Flashcards</h1>
              <p className="text-mint-700">Organize your study materials into effective learning sets</p>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-mint-600 hover:bg-mint-700">
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
                <Tabs defaultValue="set" className="mt-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="set">Flashcard Set</TabsTrigger>
                    <TabsTrigger value="flashcard">Single Flashcard</TabsTrigger>
                  </TabsList>
                  <TabsContent value="set" className="mt-4">
                    <CreateFlashcardSet onSuccess={() => setCreateDialogOpen(false)} />
                  </TabsContent>
                  <TabsContent value="flashcard" className="mt-4">
                    <CreateFlashcard onSuccess={() => setCreateDialogOpen(false)} />
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-mint-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-mint-700">Total Sets</CardTitle>
                <BookOpen className="h-4 w-4 text-mint-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-mint-900">12</div>
                <p className="text-xs text-mint-600">+2 from last week</p>
              </CardContent>
            </Card>
            
            <Card className="border-mint-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-mint-700">Study Streak</CardTitle>
                <Target className="h-4 w-4 text-mint-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-mint-900">7 days</div>
                <p className="text-xs text-mint-600">Keep it up!</p>
              </CardContent>
            </Card>
            
            <Card className="border-mint-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-mint-700">Avg. Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-mint-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-mint-900">78%</div>
                <p className="text-xs text-mint-600">+5% this week</p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <EnhancedFlashcardSetsList />
      </div>
    </Layout>
  );
};

export default FlashcardsPage;
