import { ResourceType, ResourceTypeInfo } from '@/types/resource';

export const RESOURCE_TYPES: ResourceTypeInfo[] = [
  {
    type: 'youtube',
    label: 'YouTube Video',
    icon: 'Youtube',
    description: 'Educational videos and tutorials',
    urlPatterns: [/youtube\.com\/watch/, /youtu\.be\//]
  },
  {
    type: 'article',
    label: 'Article',
    icon: 'FileText',
    description: 'Blog posts, articles, and written content',
    urlPatterns: [/medium\.com/, /dev\.to/, /blog/, /article/]
  },
  {
    type: 'pdf',
    label: 'PDF Document',
    icon: 'FileText',
    description: 'PDF files and documents',
    urlPatterns: [/\.pdf$/]
  },
  {
    type: 'website',
    label: 'Website',
    icon: 'Globe',
    description: 'Web pages and online resources',
    urlPatterns: []
  },
  {
    type: 'research_paper',
    label: 'Research Paper',
    icon: 'GraduationCap',
    description: 'Academic papers and research documents',
    urlPatterns: [/arxiv\.org/, /scholar\.google/, /researchgate/, /\.edu/]
  },
  {
    type: 'lecture',
    label: 'Lecture',
    icon: 'Presentation',
    description: 'Recorded lectures and presentations',
    urlPatterns: [/lecture/, /presentation/]
  },
  {
    type: 'textbook',
    label: 'Textbook',
    icon: 'Book',
    description: 'Digital textbooks and educational books',
    urlPatterns: [/textbook/, /ebook/]
  },
  {
    type: 'reference',
    label: 'Reference Material',
    icon: 'BookOpen',
    description: 'Reference guides and documentation',
    urlPatterns: [/reference/, /guide/, /docs/, /documentation/]
  },
  {
    type: 'dictionary',
    label: 'Dictionary',
    icon: 'BookOpen',
    description: 'Dictionaries and vocabulary resources',
    urlPatterns: [/dictionary/, /vocab/, /translate/]
  },
  {
    type: 'calculator',
    label: 'Calculator/Tool',
    icon: 'Calculator',
    description: 'Online calculators and tools',
    urlPatterns: [/calculator/, /tool/, /converter/]
  },
  {
    type: 'syllabus',
    label: 'Syllabus',
    icon: 'Calendar',
    description: 'Course syllabi and curricula',
    urlPatterns: [/syllabus/, /curriculum/, /course/]
  },
  {
    type: 'assignment',
    label: 'Assignment',
    icon: 'ClipboardList',
    description: 'Assignments and exercises',
    urlPatterns: [/assignment/, /homework/, /exercise/]
  },
  {
    type: 'rubric',
    label: 'Rubric',
    icon: 'CheckSquare',
    description: 'Grading rubrics and assessment criteria',
    urlPatterns: [/rubric/, /grading/, /assessment/]
  }
];

export const detectResourceType = (url: string): ResourceType => {
  for (const resourceType of RESOURCE_TYPES) {
    if (resourceType.urlPatterns?.some(pattern => pattern.test(url))) {
      return resourceType.type;
    }
  }
  return 'website';
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