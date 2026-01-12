import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { Resource, ResourceFormData, AddResourceResponse, ResourceType } from "@/types/resource";
import { extractMetadataFromUrl, normalizeUrl, validateUrl } from "@/components/resources/utils/metadataExtractor";
import { toast } from "sonner";
import { useFilteredResources, ResourceFilters } from './useFilteredResources';

interface UseResourcesOptions {
  filters?: ResourceFilters;
}

export const useResources = (options: UseResourcesOptions = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const { filters } = options;

  const { data: allResources = [], isLoading, error, refetch } = useQuery({
    queryKey: ["resources", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return [];
      }
      
      const { data, error } = await supabase
        .from("resources")
        .select(`
          *,
          user_subjects!resources_subject_id_fkey (
            id,
            name
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100); // Limit initial fetch for performance

      if (error) {
        throw error;
      }
      
      // Ensure proper typing for resources
      return (data || []).map(resource => ({
        ...resource,
        resource_type: resource.resource_type as ResourceType,
        tags: resource.tags || [],
        metadata: resource.metadata || {},
      })) as Resource[];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Apply client-side filtering if filters are provided
  const filteredResources = useFilteredResources(
    allResources,
    filters || {
      search: '',
      subject: 'all',
      resourceType: 'all',
      difficultyLevel: 'all',
      isFavorite: false,
      sort: 'newest'
    }
  );

  // Use filtered resources when filters are active, otherwise use all resources
  const resources = filters ? filteredResources : allResources;

  const addResourceMutation = useMutation({
    mutationFn: async (formData: ResourceFormData): Promise<AddResourceResponse> => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      
      // Validate URL
      if (!validateUrl(formData.url)) {
        return {
          success: false,
          error: "Invalid URL format"
        };
      }

      const normalizedUrl = normalizeUrl(formData.url);
      
      // Prepare resource data
      const resourceData = {
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        url: normalizedUrl,
        resource_type: formData.resource_type,
        author: formData.author,
        language: 'en',
        difficulty_level: formData.difficulty_level,
        tags: formData.tags || [],
        subject_id: formData.subject_id,
        is_favorite: false,
        metadata: {},
        access_count: 0
      };
      
      const { data, error } = await supabase
        .from("resources")
        .insert([resourceData])
        .select()
        .single();
        
      if (error) {
        console.error("Add resource error:", error);
        return {
          success: false,
          error: error.message
        };
      }
      
      return {
        success: true,
        resource: {
          ...data,
          resource_type: data.resource_type as ResourceType,
          tags: data.tags || [],
          metadata: data.metadata || {},
        } as Resource
      };
    },
    onSuccess: (response) => {
      if (response.success && user?.id) {
        queryClient.invalidateQueries({ queryKey: ["resources", user.id] });
      }
    },
    onError: (error: Error) => {
      console.error("Error adding resource:", error);
    },
  });

  const updateResourceMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Resource> }) => {
      const { error } = await supabase
        .from("resources")
        .update(updates)
        .eq("id", id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ["resources", user.id] });
      }
    },
    onError: (error: Error) => {
      console.error("Error updating resource:", error);
    },
  });

  const deleteResourceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("resources")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ["resources", user.id] });
        toast.success("Resource deleted successfully!");
      }
    },
    onError: (error: Error) => {
      console.error("Error deleting resource:", error);
      toast.error(`Error deleting resource: ${error.message}`);
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
      const { error } = await supabase
        .from("resources")
        .update({ is_favorite: !isFavorite })
        .eq("id", id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ["resources", user.id] });
      }
    },
    onError: (error: Error) => {
      console.error("Error toggling favorite:", error);
      toast.error(`Error updating favorite: ${error.message}`);
    },
  });

  const addResource = async (formData: ResourceFormData): Promise<AddResourceResponse> => {
    return addResourceMutation.mutateAsync(formData);
  };

  const updateResource = async (id: string, updates: Partial<Resource>): Promise<void> => {
    return updateResourceMutation.mutateAsync({ id, updates });
  };

  const deleteResource = async (id: string): Promise<void> => {
    return deleteResourceMutation.mutateAsync(id);
  };

  const toggleFavorite = async (id: string, isFavorite: boolean): Promise<void> => {
    return toggleFavoriteMutation.mutateAsync({ id, isFavorite });
  };

  return {
    resources,
    isLoading,
    error,
    addResource,
    updateResource,
    deleteResource,
    toggleFavorite,
    refetch,
    isAddingResource: addResourceMutation.isPending,
    isUpdatingResource: updateResourceMutation.isPending,
    isDeletingResource: deleteResourceMutation.isPending,
  };
};