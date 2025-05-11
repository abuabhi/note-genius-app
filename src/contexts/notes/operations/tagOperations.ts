
import { fetchTagsFromDatabase } from './';
import { toast } from 'sonner';

export const useTagOperations = () => {
  // Get all available tags
  const getAllTags = async () => {
    try {
      return await fetchTagsFromDatabase();
    } catch (error) {
      console.error('Error fetching tags:', error);
      toast.error("Failed to fetch tags");
      return [];
    }
  };

  // Filter notes by a specific tag
  const filterByTag = (tagName: string, setSearchTerm: (term: string) => void) => {
    setSearchTerm(tagName);
  };

  return {
    getAllTags,
    filterByTag
  };
};
