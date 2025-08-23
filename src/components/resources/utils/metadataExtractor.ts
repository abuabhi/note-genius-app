import { ResourceType } from '@/types/resource';
import { detectResourceType } from './resourceTypes';

export interface ExtractedMetadata {
  title?: string;
  description?: string;
  author?: string;
  thumbnail_url?: string;
  duration_minutes?: number;
  resource_type: ResourceType;
  domain?: string;
}

export const extractMetadataFromUrl = async (url: string): Promise<ExtractedMetadata> => {
  try {
    const cleanUrl = url.trim();
    const urlObj = new URL(cleanUrl);
    const domain = urlObj.hostname;
    
    // Auto-detect resource type
    const resource_type = detectResourceType(cleanUrl);
    
    const metadata: ExtractedMetadata = {
      resource_type,
      domain,
    };
    
    // Extract basic info from URL
    if (resource_type === 'youtube_video') {
      metadata.title = extractYouTubeTitle(cleanUrl);
      metadata.thumbnail_url = extractYouTubeThumbnail(cleanUrl);
    } else if (resource_type === 'pdf_document') {
      metadata.title = extractPDFTitle(cleanUrl);
    } else {
      // For general websites, try to extract title from URL path
      metadata.title = extractTitleFromPath(urlObj.pathname);
    }
    
    return metadata;
  } catch (error) {
    console.error('Error extracting metadata:', error);
    return {
      resource_type: 'website',
      title: url,
    };
  }
};

const extractYouTubeTitle = (url: string): string => {
  // Extract video ID and create a basic title
  const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  if (videoIdMatch) {
    return `YouTube Video (${videoIdMatch[1]})`;
  }
  return 'YouTube Video';
};

const extractYouTubeThumbnail = (url: string): string | undefined => {
  const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  if (videoIdMatch) {
    return `https://img.youtube.com/vi/${videoIdMatch[1]}/mqdefault.jpg`;
  }
  return undefined;
};

const extractPDFTitle = (url: string): string => {
  const filename = url.split('/').pop();
  if (filename && filename.endsWith('.pdf')) {
    return filename.replace('.pdf', '').replace(/[-_]/g, ' ');
  }
  return 'PDF Document';
};

const extractTitleFromPath = (pathname: string): string => {
  // Extract title from URL path
  const segments = pathname.split('/').filter(segment => segment && segment.length > 0);
  const lastSegment = segments[segments.length - 1];
  
  if (lastSegment) {
    return lastSegment
      .replace(/[-_]/g, ' ')
      .replace(/\.[^.]+$/, '') // Remove file extension
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  return 'Web Resource';
};

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const normalizeUrl = (url: string): string => {
  try {
    const urlObj = new URL(url.trim());
    return urlObj.href;
  } catch {
    // If URL is invalid, try adding protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      try {
        const urlObj = new URL(`https://${url.trim()}`);
        return urlObj.href;
      } catch {
        return url.trim();
      }
    }
    return url.trim();
  }
};