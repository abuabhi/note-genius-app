export type PixabayTrack = {
  id: number;
  previewURL: string;
  tags: string;
  user: string;
  duration: number;
  downloads: number;
  likes: number;
  webformatURL: string;
  [key: string]: any;
};

export type PixabayResponse = {
  total: number;
  totalHits: number;
  hits: PixabayTrack[];
};

// Using Supabase edge function to access API key from secrets
import { supabase } from '@/integrations/supabase/client';

export async function searchMusic(
  query: string,
  options: {
    category?: 'music';
    audioType?: 'all' | 'music' | 'sound_effect';
    perPage?: number;
    page?: number;
  } = {}
): Promise<PixabayResponse> {
  const {
    category = 'music',
    audioType = 'music',
    perPage = 20,
    page = 1
  } = options;

  try {
    // Use Supabase edge function to make API call with secret
    const { data, error } = await supabase.functions.invoke('pixabay-music', {
      body: {
        query,
        category,
        audioType,
        perPage,
        page
      }
    });

    if (error) {
      throw new Error(`Supabase function error: ${error.message}`);
    }

    return data as PixabayResponse;
  } catch (error) {
    console.error('Error fetching Pixabay music:', error);
    throw error;
  }
}

export async function getPopularStudyMusic(): Promise<PixabayResponse> {
  return searchMusic('study music ambient focus', {
    audioType: 'music',
    perPage: 10
  });
}

export async function getMusicByCategory(category: string): Promise<PixabayResponse> {
  const categoryQueries: Record<string, string> = {
    'study': 'study music ambient focus concentration',
    'relaxing': 'relaxing calm peaceful meditation',
    'upbeat': 'upbeat energetic motivational',
    'classical': 'classical piano orchestral',
    'electronic': 'electronic ambient chill',
    'nature': 'nature sounds rain forest'
  };

  const query = categoryQueries[category] || category;
  return searchMusic(query, {
    audioType: 'music',
    perPage: 15
  });
}