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

// Direct Pixabay API integration
const PIXABAY_API_KEY = '51793999-62d03dcfcc85d05a7208f73cf';
const PIXABAY_API_URL = 'https://pixabay.com/api/';

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
    const params = new URLSearchParams({
      key: PIXABAY_API_KEY,
      q: encodeURIComponent(query),
      category,
      audio_type: audioType,
      per_page: perPage.toString(),
      page: page.toString(),
      safesearch: 'true'
    });

    const response = await fetch(`${PIXABAY_API_URL}?${params}`);
    
    if (!response.ok) {
      throw new Error(`Pixabay API error: ${response.status} - ${response.statusText}`);
    }

    const data: PixabayResponse = await response.json();
    return data;
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