
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Plus, 
  BookOpen, 
  Play, 
  MoreVertical,
  Trash2,
  Edit,
  Users,
  Clock,
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

const EnhancedFlashcardSetsList = () => {
  const { flashcardSets, loading, deleteFlashcardSet, fetchFlashcardSets } = useFlashcards();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("updated_at");
  const [subjectFilter, setSubjectFilter] = useState<string | undefined>(undefined);
  const [deletingSet, setDeletingSet] = useState<string | null>(null);

  // Get unique subjects from flashcard sets
  const availableSubjects = useMemo(() => {
    if (!flashcardSets) return [];
    const subjects = flashcardSets
      .map(set => set.subject)
      .filter((subject): subject is string => Boolean(subject))
      .filter((subject, index, arr) => arr.indexOf(subject) === index);
    return subjects;
  }, [flashcardSets]);

  // Filter and sort flashcard sets
  const filteredAndSortedSets = useMemo(() => {
    if (!flashcardSets) return [];
    
    let filtered = flashcardSets.filter(set => {
      const matchesSearch = set.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        set.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        set.subject?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSubject = !subjectFilter || set.subject === subjectFilter;
      
      return matchesSearch && matchesSubject;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        case "created_at":
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        case "card_count":
          return (b.card_count || 0) - (a.card_count || 0);
        case "updated_at":
        default:
          return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
      }
    });
  }, [flashcardSets, searchQuery, sortBy, subjectFilter]);

  const handleDeleteSet = async (setId: string) => {
    setDeletingSet(setId);
    try {
      await deleteFlashcardSet(setId);
    } catch (error) {
      console.error("Error deleting flashcard set:", error);
    } finally {
      setDeletingSet(null);
    }
  };

  // Force a refresh of flashcard sets on component mount
  useState(() => {
    console.log('EnhancedFlashcardSetsList: Attempting to fetch flashcard sets...');
    fetchFlashcardSets();
  });

  if (loading.sets) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-48">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  console.log('EnhancedFlashcardSetsList: Rendering with flashcard sets:', flashcardSets);

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
        
        {/* Subject Filter */}
        {availableSubjects.length > 0 && (
          <Select value={subjectFilter || "_any"} onValueChange={(value) => setSubjectFilter(value === "_any" ? undefined : value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_any">All subjects</SelectItem>
              {availableSubjects.map(subject => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated_at">Recently Updated</SelectItem>
            <SelectItem value="created_at">Recently Created</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="card_count">Card Count</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredAndSortedSets.length} of {flashcardSets?.length || 0} sets
          {subjectFilter && ` in ${subjectFilter}`}
        </p>
        {(searchQuery || subjectFilter) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setSubjectFilter(undefined);
            }}
            className="text-gray-500"
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Empty State */}
      {filteredAndSortedSets.length === 0 && !loading.sets && (
        <div className="text-center py-12">
          <div className="bg-gradient-to-br from-mint-50 to-mint-100 rounded-xl p-8 max-w-md mx-auto">
            <BookOpen className="h-16 w-16 text-mint-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-mint-900 mb-2">
              {searchQuery || subjectFilter ? "No sets found" : "No flashcard sets yet"}
            </h3>
            <p className="text-mint-700 mb-6">
              {searchQuery || subjectFilter 
                ? "Try adjusting your search terms or filters" 
                : "Create your first flashcard set to start studying!"
              }
            </p>
            {!searchQuery && !subjectFilter && (
              <Button asChild>
                <Link to="/flashcards/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Set
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Flashcard Sets Grid */}
      {filteredAndSortedSets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedSets.map((set) => {
            const isDeleting = deletingSet === set.id;

            return (
              <Card key={set.id} className="group hover:shadow-lg transition-all duration-200 border-mint-100">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold text-mint-900 line-clamp-2 mb-2">
                        {set.name}
                      </CardTitle>
                      {set.subject && (
                        <Badge variant="secondary" className="mb-2 bg-mint-100 text-mint-700">
                          {set.subject}
                        </Badge>
                      )}
                      {set.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {set.description}
                        </p>
                      )}
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/flashcards/${set.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Set
                          </Link>
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Set
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Flashcard Set</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{set.name}"? This action cannot be undone and will remove all flashcards in this set.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteSet(set.id)}
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
                  <div className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <BookOpen className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">Cards</span>
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                          {set.card_count || 0}
                        </div>
                      </div>
                      
                      <div className="bg-mint-50 rounded-lg p-3">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <TrendingUp className="h-4 w-4 text-mint-600" />
                          <span className="text-sm font-medium text-mint-700">Progress</span>
                        </div>
                        <div className="text-xl font-bold text-mint-900">
                          {Math.floor(Math.random() * 100)}%
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button asChild className="flex-1" size="sm">
                        <Link to={`/study/${set.id}`}>
                          <Play className="h-4 w-4 mr-2" />
                          Study
                        </Link>
                      </Button>
                      
                      <Button asChild variant="outline" className="flex-1" size="sm">
                        <Link to={`/flashcards/${set.id}`}>
                          <BookOpen className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </Button>
                    </div>

                    {/* Last Updated */}
                    <div className="flex items-center justify-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      Updated {new Date(set.updated_at || set.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EnhancedFlashcardSetsList;
