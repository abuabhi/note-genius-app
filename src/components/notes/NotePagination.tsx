
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNotes } from '@/contexts/NoteContext';

export const NotePagination = () => {
  const { currentPage, setCurrentPage, totalPages, notesPerPage, setNotesPerPage } = useNotes();

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleNotesPerPageChange = (value: string) => {
    setNotesPerPage(parseInt(value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  if (totalPages <= 1) {
    return null;
  }

  // Generate array of page numbers for pagination display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesShown = 5; // Maximum number of page buttons to show
    
    if (totalPages <= maxPagesShown) {
      // If total pages is less than max, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(1);
      
      // Determine start and end of page range to show
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust range if at the beginning or end
      if (currentPage <= 2) {
        endPage = 4;
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 3;
      }
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push('ellipsis-start');
      }
      
      // Add middle page numbers
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push('ellipsis-end');
      }
      
      // Always include last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-wrap justify-center items-center gap-2 mt-8 mb-4">
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="border-purple-200 hover:bg-purple-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {pageNumbers.map((page, index) => {
          if (page === 'ellipsis-start' || page === 'ellipsis-end') {
            return <div key={`ellipsis-${index}`} className="px-2">...</div>;
          }
          
          return (
            <Button
              key={index}
              variant={currentPage === page ? "default" : "outline"}
              onClick={() => handlePageChange(page as number)}
              className={currentPage === page 
                ? "bg-purple-600 hover:bg-purple-700" 
                : "border-purple-200 hover:bg-purple-50"
              }
            >
              {page}
            </Button>
          );
        })}
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="border-purple-200 hover:bg-purple-50"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex items-center gap-2 ml-2">
        <span className="text-sm text-muted-foreground">Notes per page:</span>
        <Select
          value={notesPerPage.toString()}
          onValueChange={handleNotesPerPageChange}
        >
          <SelectTrigger className="w-[70px] h-8 border-purple-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[3, 6, 9, 12, 15, 21].map((number) => (
              <SelectItem key={number} value={number.toString()}>
                {number}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
