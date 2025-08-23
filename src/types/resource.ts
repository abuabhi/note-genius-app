export interface Resource {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  url: string;
  resource_type: ResourceType;
  thumbnail_url?: string;
  author?: string;
  language?: string;
  difficulty_level?: DifficultyLevel;
  tags: string[];
  subject_id?: string;
  is_favorite: boolean;
  duration_minutes?: number;
  file_size_mb?: number;
  metadata: Record<string, any>;
  access_count: number;
  last_accessed_at?: string;
  created_at: string;
  updated_at: string;
}

export type ResourceType = 
  | 'youtube'
  | 'article' 
  | 'pdf'
  | 'website'
  | 'research_paper'
  | 'lecture'
  | 'textbook'
  | 'reference'
  | 'dictionary'
  | 'calculator'
  | 'syllabus'
  | 'assignment'
  | 'rubric';

export type DifficultyLevel = 
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'expert';

export interface ResourceTypeInfo {
  type: ResourceType;
  label: string;
  icon: string;
  description: string;
  urlPatterns?: RegExp[];
}

export interface ResourceFormData {
  title: string;
  description?: string;
  url: string;
  resource_type?: ResourceType;
  subject_id?: string;
  author?: string;
  difficulty_level?: DifficultyLevel;
  tags: string[];
}

export interface ResourceFilters {
  search: string;
  subject: string;
  resourceType: string;
  difficultyLevel: string;
  isFavorite?: boolean;
  sort: string;
}

export interface AddResourceResponse {
  success: boolean;
  resource?: Resource;
  error?: string;
}