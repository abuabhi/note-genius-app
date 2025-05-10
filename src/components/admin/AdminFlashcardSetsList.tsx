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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";

export function AdminFlashcardSetsList() {
  const { fetchBuiltInSets, updateFlashcardSet } = useFlashcards();
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [countries, setCountries] = useState<{ id: string; name: string; code: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [countryMap, setCountryMap] = useState<Record<string, string>>({});
  const [filters, setFilters] = useState({
    country: "all",
    subject: "all",
    search: ""
  });
  const { toast } = useToast();

  // Fetch countries for mapping IDs to names
  useEffect(() => {
    const fetchCountries = async () => {
      const { data } = await supabase
        .from('countries')
        .select('id, name, code');
      
      if (data) {
        const map: Record<string, string> = {};
        data.forEach(country => {
          map[country.id] = `${country.name} (${country.code})`;
        });
        setCountryMap(map);
        setCountries(data);
      }
    };
    
    fetchCountries();
  }, []);

  // Fetch flashcard sets with additional data
  useEffect(() => {
    const loadSets = async () => {
      setLoading(true);
      try {
        // Fetch the sets first
        const builtInSets = await fetchBuiltInSets();
        
        // Now get additional data about countries and subjects
        const setsWithDetails = await Promise.all(
          builtInSets.map(async (set) => {
            if (set.country_id) {
              // Country info is already available via the countryMap
              return set;
            } else {
              return set;
            }
          })
        );
        
        setSets(setsWithDetails || []);
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

  // Apply filters to the sets
  const filteredSets = sets.filter(set => {
    // Filter by country
    if (filters.country !== "all" && (!set.country_id || set.country_id !== filters.country)) {
      return false;
    }
    
    // Filter by subject
    if (filters.subject !== "all" && (!set.subject || !set.subject.toLowerCase().includes(filters.subject.toLowerCase()))) {
      return false;
    }
    
    // Filter by search term (name or description)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const nameMatch = set.name.toLowerCase().includes(searchTerm);
      const descMatch = set.description ? set.description.toLowerCase().includes(searchTerm) : false;
      if (!nameMatch && !descMatch) {
        return false;
      }
    }
    
    return true;
  });

  if (loading) {
    return <div className="text-center p-4">Loading sets...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flashcard Sets Management</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or description"
              className="pl-8"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
          <Select
            value={filters.country}
            onValueChange={(value) => setFilters(prev => ({ ...prev, country: value }))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map((country) => (
                <SelectItem key={country.id} value={country.id}>
                  {country.name} ({country.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={filters.subject}
            onValueChange={(value) => setFilters(prev => ({ ...prev, subject: value }))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {/* Get unique subjects from sets */}
              {Array.from(new Set(sets.map(set => set.subject).filter(Boolean))).map((subject) => (
                <SelectItem key={subject} value={subject as string}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Cards</TableHead>
                <TableHead>Public</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No flashcard sets found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSets.map((set) => (
                  <TableRow key={set.id}>
                    <TableCell>{set.name}</TableCell>
                    <TableCell>{set.subject || "N/A"}</TableCell>
                    <TableCell>{set.topic || "N/A"}</TableCell>
                    <TableCell>{set.country_id ? countryMap[set.country_id] || "Unknown" : "Global"}</TableCell>
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
