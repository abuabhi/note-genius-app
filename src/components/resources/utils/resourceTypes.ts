import { ResourceType, ResourceTypeInfo } from '@/types/resource';

export const RESOURCE_TYPES: ResourceTypeInfo[] = [
  {
    type: 'youtube',
    label: 'YouTube Video',
    icon: '📺',
    description: 'Educational videos and tutorials',
    urlPatterns: [/youtube\.com\/watch/, /youtu\.be\//]
  },
  {
    type: 'article',
    label: 'Article',
    icon: '📰',
    description: 'Blog posts, articles, and written content',
    urlPatterns: [/medium\.com/, /dev\.to/, /blog/, /article/]
  },
  {
    type: 'pdf',
    label: 'PDF Document',
    icon: '📄',
    description: 'PDF files and documents',
    urlPatterns: [/\.pdf$/]
  },
  {
    type: 'website',
    label: 'Website',
    icon: '🌐',
    description: 'General web resources',
    urlPatterns: []
  },
  {
    type: 'research_paper',
    label: 'Research Paper',
    icon: '🔬',
    description: 'Academic papers and research',
    urlPatterns: [/arxiv\.org/, /researchgate\.net/, /scholar\.google/]
  },
  {
    type: 'lecture',
    label: 'Lecture Recording',
    icon: '🎧',
    description: 'Audio and video lectures',
    urlPatterns: [/\.mp3$/, /\.mp4$/, /\.wav$/]
  },
  {
    type: 'textbook',
    label: 'Textbook',
    icon: '📚',
    description: 'Digital textbooks and references',
    urlPatterns: [/isbn/, /textbook/, /ebook/]
  },
  {
    type: 'reference',
    label: 'Reference Site',
    icon: '📖',
    description: 'Reference materials and documentation',
    urlPatterns: [/wikipedia\.org/, /docs\./, /reference/]
  },
  {
    type: 'dictionary',
    label: 'Dictionary',
    icon: '📝',
    description: 'Dictionaries and glossaries',
    urlPatterns: [/dictionary/, /dict/, /define/]
  },
  {
    type: 'calculator',
    label: 'Calculator Tool',
    icon: '🧮',
    description: 'Online calculators and tools',
    urlPatterns: [/calculator/, /calc/, /tool/]
  },
  {
    type: 'syllabus',
    label: 'Syllabus',
    icon: '📋',
    description: 'Course syllabuses',
    urlPatterns: [/syllabus/, /curriculum/]
  },
  {
    type: 'assignment',
    label: 'Assignment',
    icon: '📑',
    description: 'Assignment sheets and instructions',
    urlPatterns: [/assignment/, /homework/, /task/]
  },
  {
    type: 'rubric',
    label: 'Rubric',
    icon: '✅',
    description: 'Grading rubrics and criteria',
    urlPatterns: [/rubric/, /grading/, /criteria/]
  }
];

export const detectResourceType = (url: string): ResourceType => {
  const lowerUrl = url.toLowerCase();
  
  for (const resourceType of RESOURCE_TYPES) {
    if (resourceType.urlPatterns) {
      for (const pattern of resourceType.urlPatterns) {
        if (pattern.test(lowerUrl)) {
          return resourceType.type;
        }
      }
    }
  }
  
  return 'website'; // Default fallback
};

export const getResourceTypeInfo = (type: ResourceType): ResourceTypeInfo => {
  return RESOURCE_TYPES.find(rt => rt.type === type) || RESOURCE_TYPES[3]; // Default to website
};

export const getResourceTypeIcon = (type: ResourceType): string => {
  return getResourceTypeInfo(type).icon;
};

export const getResourceTypeLabel = (type: ResourceType): string => {
  return getResourceTypeInfo(type).label;
};