
import { useState, useMemo } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { useSimpleFlashcardSets } from "@/hooks/useSimpleFlashcardSets";
import { Search, Filter, Star, Clock, BookOpen, Trash2, Play } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const EnhancedFlashcardSetsList = () => {
  const { flashcardSets, loading, error, deleteFlashcardSet } = useSimpleFlashcardSets();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [filterSubject, setFilterSubject] = useState("all");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Get unique subjects for filtering
  const subjects = useMemo(() => {
    const uniqueSubjects = new Set(flashcardSets?.map(set => set.subject).filter(Boolean));
    return Array.from(uniqueSubjects);
  }, [flashcardSets]);

  // Filter and sort flashcard sets
  const filteredAndSortedSets = useMemo(() => {
    if (!flashcardSets) return [];

    let filtered = flashcardSets.filter(set => {
      const matchesSearch = set.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (set.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesSubject = filterSubject === "all" || set.subject === filterSubject;
      return matchesSearch && matchesSubject;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "card_count":
          return (b.card_count || 0) - (a.card_count || 0);
        case "created_at":
        default:
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
    });
  }, [flashcardSets, searchQuery, sortBy, filterSubject]);

  const handleDeleteSet = async (setId: string) => {
    setIsDeleting(setId);
    try {
      await deleteFlashcardSet(setId);
    } catch (error) {
      console.error('Error deleting set:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const toggleFavorite = (setId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(setId)) {
        newFavorites.delete(setId);
      } else {
        newFavorites.add(setId);
      }
      return newFavorites;
    });
  };

  const getProgressPercentage = (cardCount: number) => {
    // Mock progress calculation - in real app this would come from study progress
    return Math.min(100, Math.max(0, (cardCount || 0) * 10));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-64">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-2 w-full mt-4" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-600 font-medium mb-4">Error loading flashcard sets</p>
          <p className="text-red-500 text-sm mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!flashcardSets || flashcardSets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gradient-to-br from-mint-50 to-mint-100 rounded-xl p-8 max-w-md mx-auto">
          <BookOpen className="h-16 w-16 text-mint-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-mint-900 mb-2">No flashcard sets yet</h3>
          <p className="text-mint-700 mb-6">Create your first flashcard set to start studying!</p>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link to="/flashcards/create">Create Your First Set</Link>
            </Button>
            <p className="text-xs text-mint-600">
              💡 Tip: Start with 5-10 cards per set for effective learning
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search flashcard sets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterSubject} onValueChange={setFilterSubject}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map(subject => (
              <SelectItem key={subject} value={subject}>{subject}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">Recent</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="card_count">Card Count</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredAndSortedSets.length} of {flashcardSets.length} sets
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

      {/* Flashcard Sets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedSets.map((set) => {
          const progress = getProgressPercentage(set.card_count || 0);
          const isFavorite = favorites.has(set.id);

          return (
            <Card key={set.id} className="group hover:shadow-lg transition-all duration-200 border-mint-100">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-mint-900 truncate group-hover:text-mint-700">
                      {set.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {set.card_count || 0} cards
                      </Badge>
                      {set.subject && (
                        <Badge variant="outline" className="text-xs">
                          {set.subject}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(set.id)}
                    className={`h-8 w-8 p-0 ${isFavorite ? 'text-yellow-500' : 'text-gray-400'}`}
                  >
                    <Star className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="pb-4">
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {set.description || "No description provided"}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Study Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Created {new Date(set.created_at || '').toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-0 space-x-2">
                <Button asChild variant="default" size="sm" className="flex-1">
                  <Link to={`/study/${set.id}`}>
                    <Play className="h-4 w-4 mr-1" />
                    Study
                  </Link>
                </Button>
                
                <Button asChild variant="outline" size="sm">
                  <Link to={`/flashcards/${set.id}`}>Edit</Link>
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={isDeleting === set.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Flashcard Set</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{set.name}"? This action cannot be undone and will permanently remove all {set.card_count || 0} flashcards in this set.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteSet(set.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {isDeleting === set.id ? "Deleting..." : "Delete Set"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {filteredAndSortedSets.length === 0 && flashcardSets.length > 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sets found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or filter criteria
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setFilterSubject("all");
              }}
            >
              Clear all filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedFlashcardSetsList;
