import { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  ArrowLeft,
  Filter,
  MoreVertical,
  BookOpen,
  Clock,
  Target,
  TrendingUp
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { Flashcard } from "@/types/flashcard";
import { useLearningProgress } from "@/hooks/useLearningProgress";

const EnhancedFlashcardSetView = () => {
  const { setId } = useParams<{ setId: string }>();
  const navigate = useNavigate();
  const { currentSet, fetchFlashcardsInSet, deleteFlashcard, setCurrentSet } = useFlashcards();
  const { progressMap, fetchLearningProgress, isLoading: progressLoading } = useLearningProgress();
  
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("position");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [filterReviewStatus, setFilterReviewStatus] = useState("all");
  const [deletingCard, setDeletingCard] = useState<string | null>(null);

  // Function to get card progress from learning progress data
  const getCardProgress = (cardId: string) => {
    const progress = progressMap.get(cardId);
    
    if (!progress) {
      return {
        lastReviewed: null,
        timesReviewed: 0,
        correctPercentage: 0,
        needsReview: true
      };
    }
    
    const correctPercentage = progress.times_seen > 0 
      ? Math.round((progress.times_correct / progress.times_seen) * 100) 
      : 0;
      
    return {
      lastReviewed: progress.last_seen_at ? new Date(progress.last_seen_at) : null,
      timesReviewed: progress.times_seen || 0,
      correctPercentage: correctPercentage,
      needsReview: progress.is_difficult || correctPercentage < 70 || !progress.last_seen_at
    };
  };

  useEffect(() => {
    const loadFlashcards = async () => {
      if (!setId) return;
      
      try {
        setLoading(true);
        const cards = await fetchFlashcardsInSet(setId);
        setFlashcards(cards || []);
        
        // Fetch learning progress for these cards
        if (cards && cards.length > 0) {
          await fetchLearningProgress(cards.map(card => card.id));
        }
      } catch (error) {
        console.error("Error loading flashcards:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFlashcards();
  }, [setId, fetchFlashcardsInSet, fetchLearningProgress]);

  // Filter and sort flashcards
  const filteredAndSortedCards = useMemo(() => {
    let filtered = flashcards.filter(card => {
      const matchesSearch = 
        card.front_content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.back_content?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDifficulty = filterDifficulty === "all" || 
        (filterDifficulty === "easy" && (card.difficulty || 1) <= 2) ||
        (filterDifficulty === "medium" && (card.difficulty || 1) === 3) ||
        (filterDifficulty === "hard" && (card.difficulty || 1) >= 4);
      
      const progress = getCardProgress(card.id);
      const matchesReviewStatus = filterReviewStatus === "all" ||
        (filterReviewStatus === "needs_review" && progress.needsReview) ||
        (filterReviewStatus === "reviewed" && !progress.needsReview);
      
      return matchesSearch && matchesDifficulty && matchesReviewStatus;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "front":
          return (a.front_content || "").localeCompare(b.front_content || "");
        case "difficulty":
          return (a.difficulty || 1) - (b.difficulty || 1);
        case "created_at":
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        case "review_status":
          // Sort by review status (needs review first)
          const aNeeds = getCardProgress(a.id).needsReview;
          const bNeeds = getCardProgress(b.id).needsReview;
          return bNeeds === aNeeds ? 0 : bNeeds ? 1 : -1;
        case "position":
        default:
          return (a.position || 0) - (b.position || 0);
      }
    });
  }, [flashcards, searchQuery, sortBy, filterDifficulty, filterReviewStatus, progressMap]);

  const handleDeleteCard = async (cardId: string) => {
    setDeletingCard(cardId);
    try {
      await deleteFlashcard(cardId);
      setFlashcards(prev => prev.filter(card => card.id !== cardId));
    } catch (error) {
      console.error("Error deleting flashcard:", error);
    } finally {
      setDeletingCard(null);
    }
  };

  // Calculate set statistics based on real progress data
  const setStats = useMemo(() => {
    const totalCards = flashcards.length;
    const reviewedCards = flashcards.filter(card => {
      const progress = progressMap.get(card.id);
      return progress && progress.last_seen_at;
    }).length;
    
    const needsReviewCards = flashcards.filter(card => {
      const progress = getCardProgress(card.id);
      return progress.needsReview;
    }).length;
    
    const totalProgress = flashcards.reduce((sum, card) => {
      return sum + getCardProgress(card.id).correctPercentage;
    }, 0);
    
    const avgProgress = totalCards > 0 ? Math.round(totalProgress / totalCards) : 0;
    
    return {
      totalCards,
      reviewedCards,
      needsReviewCards,
      averageProgress: avgProgress,
      completionRate: totalCards > 0 ? Math.round((reviewedCards / totalCards) * 100) : 0
    };
  }, [flashcards, progressMap]);

  if (!setId) {
    return <div>Set not found</div>;
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/flashcards")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sets
        </Button>
        
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-mint-900">
            {currentSet?.name || "Flashcard Set"}
          </h1>
          {currentSet?.description && (
            <p className="text-mint-700 mt-1">{currentSet.description}</p>
          )}
        </div>

        <div className="flex gap-2">
          <Button asChild>
            <Link to={`/study/${setId}`}>
              <Play className="h-4 w-4 mr-2" />
              Study Flashcards
            </Link>
          </Button>
          
          <Button variant="outline" asChild>
            <Link to={`/flashcards/${setId}/create`}>
              <Plus className="h-4 w-4 mr-2" />
              Add Card
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <Card className="border-mint-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-mint-700">Total Cards</CardTitle>
            <BookOpen className="h-4 w-4 text-mint-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-mint-900">{setStats.totalCards}</div>
          </CardContent>
        </Card>
        
        <Card className="border-mint-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-mint-700">Reviewed</CardTitle>
            <Target className="h-4 w-4 text-mint-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-mint-900">{setStats.reviewedCards}</div>
            <p className="text-xs text-mint-600">{setStats.completionRate}% complete</p>
          </CardContent>
        </Card>
        
        <Card className="border-mint-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-mint-700">Needs Review</CardTitle>
            <Clock className="h-4 w-4 text-mint-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-mint-900">{setStats.needsReviewCards}</div>
          </CardContent>
        </Card>
        
        <Card className="border-mint-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-mint-700">Avg. Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-mint-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-mint-900">{setStats.averageProgress}%</div>
            <Progress value={setStats.averageProgress} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search flashcards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterReviewStatus} onValueChange={setFilterReviewStatus}>
          <SelectTrigger className="w-48">
            <Clock className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Review status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cards</SelectItem>
            <SelectItem value="needs_review">Needs Review</SelectItem>
            <SelectItem value="reviewed">Already Reviewed</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            <SelectItem value="easy">Easy (1-2)</SelectItem>
            <SelectItem value="medium">Medium (3)</SelectItem>
            <SelectItem value="hard">Hard (4-5)</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="position">Position</SelectItem>
            <SelectItem value="front">Front Text</SelectItem>
            <SelectItem value="difficulty">Difficulty</SelectItem>
            <SelectItem value="created_at">Date Created</SelectItem>
            <SelectItem value="review_status">Review Status</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          {filteredAndSortedCards.length} of {flashcards.length} cards
        </p>
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery("")}
            className="text-gray-500"
          >
            Clear search
          </Button>
        )}
      </div>

      {/* Loading State */}
      {(loading || progressLoading) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-48">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !progressLoading && flashcards.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gradient-to-br from-mint-50 to-mint-100 rounded-xl p-8 max-w-md mx-auto">
            <BookOpen className="h-16 w-16 text-mint-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-mint-900 mb-2">No flashcards yet</h3>
            <p className="text-mint-700 mb-6">Add your first flashcard to start studying!</p>
            <Button asChild>
              <Link to={`/flashcards/${setId}/create`}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Card
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Flashcards Grid */}
      {!loading && !progressLoading && filteredAndSortedCards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedCards.map((card) => {
            const progress = getCardProgress(card.id);
            const isDeleting = deletingCard === card.id;

            return (
              <Card key={card.id} className="group hover:shadow-lg transition-all duration-200 border-mint-100">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge 
                          variant={card.difficulty && card.difficulty >= 4 ? "destructive" : 
                                  card.difficulty === 3 ? "default" : "secondary"}
                          className="text-xs"
                        >
                          Level {card.difficulty || 1}
                        </Badge>
                        {progress.needsReview && (
                          <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                            Needs Review
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-medium text-mint-900 line-clamp-2 text-sm">
                        {card.front_content || card.front}
                      </h3>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/flashcards/${setId}/card/${card.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Flashcard</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this flashcard? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteCard(card.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {isDeleting ? "Deleting..." : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {card.back_content || card.back}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Progress</span>
                        <span>{progress.correctPercentage}%</span>
                      </div>
                      <Progress value={progress.correctPercentage} className="h-1" />
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Reviews: {progress.timesReviewed}</span>
                        {progress.lastReviewed && (
                          <span>Last: {progress.lastReviewed.toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* No Results State */}
      {!loading && !progressLoading && filteredAndSortedCards.length === 0 && flashcards.length > 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cards found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or filter criteria
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setFilterDifficulty("all");
                setFilterReviewStatus("all");
              }}
            >
              Clear all filters
            </Button>
          </div>
        </div>
      )}

      {/* Study Button for Needs Review Cards */}
      {setStats.needsReviewCards > 0 && (
        <div className="mt-6 flex justify-center">
          <Button size="lg" asChild className="bg-orange-600 hover:bg-orange-700">
            <Link to={`/study/${setId}?mode=review`}>
              <Clock className="h-4 w-4 mr-2" />
              Review {setStats.needsReviewCards} Cards That Need Practice
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default EnhancedFlashcardSetView;
