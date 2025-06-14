
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Import, Scan, BookOpen, Filter, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useOptimizedNotes } from '@/contexts/OptimizedNotesContext';
import { Badge } from "@/components/ui/badge";

interface OptimizedNotesHeaderProps {
  totalCount: number;
  onCreateNote: () => void;
  onOpenScanDialog: () => void;
  onOpenImportDialog: () => void;
  isCreating: boolean;
}

export const OptimizedNotesHeader = ({
  totalCount,
  onCreateNote,
  onOpenScanDialog,
  onOpenImportDialog,
  isCreating
}: OptimizedNotesHeaderProps) => {
  const { searchTerm, setSearchTerm } = useOptimizedNotes();

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="p-8 space-y-8">
      {/* Enhanced Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        {/* Title and Description */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-mint-500 to-mint-600 rounded-xl shadow-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                My Notes
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-gray-600">Organize and enhance your knowledge</p>
                {totalCount > 0 && (
                  <Badge variant="secondary" className="bg-mint-100 text-mint-700 border-mint-200">
                    {totalCount} notes
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={onCreateNote}
            disabled={isCreating}
            className="bg-gradient-to-r from-mint-600 to-mint-700 hover:from-mint-700 hover:to-mint-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 border-0 px-6"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            {isCreating ? 'Creating...' : 'New Note'}
          </Button>
          
          <Button
            onClick={onOpenScanDialog}
            variant="outline"
            className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200 px-6"
          >
            <Scan className="h-4 w-4 mr-2" />
            Scan
          </Button>
          
          <Button
            onClick={onOpenImportDialog}
            variant="outline"
            className="border-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 shadow-sm hover:shadow-md transition-all duration-200 px-6"
          >
            <Import className="h-4 w-4 mr-2" />
            Import
          </Button>
        </div>
      </div>

      {/* Enhanced Search Bar */}
      <div className="max-w-2xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 transition-colors group-focus-within:text-mint-500" />
          <Input
            type="text"
            placeholder="Search your notes by title, content, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-12 h-14 text-lg bg-white/90 backdrop-blur-sm border-2 border-gray-200 focus:border-mint-400 focus:ring-4 focus:ring-mint-100 transition-all duration-200 rounded-xl shadow-sm hover:shadow-md text-gray-700 placeholder:text-gray-400"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              onClick={clearSearch}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        {searchTerm && (
          <p className="text-sm text-gray-500 mt-2 ml-1">
            Searching for "{searchTerm}"
          </p>
        )}
      </div>
    </div>
  );
};
