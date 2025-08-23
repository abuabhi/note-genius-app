import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Resource, ResourceFormData, DifficultyLevel, ResourceType } from '@/types/resource';
import { useUserSubjects } from '@/hooks/useUserSubjects';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { extractMetadataFromUrl, validateUrl } from '@/components/resources/utils/metadataExtractor';
import { getResourceTypeInfo, getResourceTypeLabel, RESOURCE_TYPES } from '@/components/resources/utils/resourceTypes';
import { toast } from 'sonner';
import { Loader2, Link2, AlertCircle, Youtube, FileText, Globe, GraduationCap, Presentation, Book, BookOpen, Calculator, Calendar, ClipboardList, CheckSquare } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CreateResourceFormProps {
  onSave: (formData: ResourceFormData) => Promise<{ success: boolean; resource?: Resource; error?: string }>;
  initialData?: Resource;
}

const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

const RESOURCE_TYPE_ICONS: Record<ResourceType, React.ComponentType<any>> = {
  youtube: Youtube,
  article: FileText,
  pdf: FileText,
  website: Globe,
  research_paper: GraduationCap,
  lecture: Presentation,
  textbook: Book,
  reference: BookOpen,
  dictionary: BookOpen,
  calculator: Calculator,
  syllabus: Calendar,
  assignment: ClipboardList,
  rubric: CheckSquare,
};

export const CreateResourceForm = ({ onSave, initialData }: CreateResourceFormProps) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel | ''>('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [detectedType, setDetectedType] = useState<ResourceType | ''>('');
  const [selectedResourceType, setSelectedResourceType] = useState<ResourceType | ''>('');
  const [urlError, setUrlError] = useState('');
  
  const { subjects: userSubjects, isLoading: subjectsLoading } = useUserSubjects();

  // Initialize form with existing data when editing
  useEffect(() => {
    if (initialData) {
      setUrl(initialData.url || '');
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setAuthor(initialData.author || '');
      // Find subject name from user_subjects if available, otherwise use subject_id to find it
      const subjectFromData = userSubjects.find(s => s.id === initialData.subject_id);
      setSelectedSubject(subjectFromData?.name || '');
      setDifficulty((initialData.difficulty_level as DifficultyLevel) || '');
      setTags(initialData.tags?.join(', ') || '');
      setDetectedType(initialData.resource_type || '');
      setSelectedResourceType(initialData.resource_type || '');
    }
  }, [initialData, userSubjects]);

  const handleUrlChange = async (newUrl: string) => {
    setUrl(newUrl);
    setUrlError('');
    
    if (!newUrl.trim()) {
      setDetectedType('');
      return;
    }

    // Basic URL validation
    if (!validateUrl(newUrl)) {
      setUrlError('Please enter a valid URL');
      return;
    }

    // Extract metadata if not editing
    if (!initialData && newUrl.trim().length > 0) {
      setIsExtracting(true);
      try {
        const metadata = await extractMetadataFromUrl(newUrl);
        
        // Auto-fill form fields only if they're empty
        if (!title && metadata.title) {
          setTitle(metadata.title);
        }
        if (!description && metadata.description) {
          setDescription(metadata.description);
        }
        if (!author && metadata.author) {
          setAuthor(metadata.author);
        }
        
        setDetectedType(metadata.resource_type);
        // Auto-select the detected type if no manual selection has been made
        if (!selectedResourceType) {
          setSelectedResourceType(metadata.resource_type);
        }
      } catch (error) {
        console.error('Error extracting metadata:', error);
      } finally {
        setIsExtracting(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!url.trim()) {
      toast.error('URL is required');
      return;
    }
    
    if (!validateUrl(url)) {
      toast.error('Please enter a valid URL');
      return;
    }

    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    
    if (!selectedSubject || selectedSubject.trim() === '') {
      toast.error('Please select a subject');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Find the subject_id for the selected subject name
      const selectedSubjectObj = userSubjects.find(s => s.name === selectedSubject);
      
      const formData: ResourceFormData = {
        url: url.trim(),
        title: title.trim(),
        description: description.trim() || undefined,
        resource_type: selectedResourceType || detectedType || 'website',
        author: author.trim() || undefined,
        subject_id: selectedSubjectObj?.id,
        difficulty_level: difficulty || undefined,
        tags: tags.trim() ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      };

      console.log('Submitting resource form data:', formData);
      const result = await onSave(formData);
      console.log('Form submission result:', result);
      
      if (result.success) {
        toast.success(initialData ? 'Resource updated successfully!' : 'Resource added successfully!');
        if (!initialData) {
        // Reset form only for new resources (not when editing)
        setUrl('');
        setTitle('');
        setDescription('');
        setAuthor('');
        setSelectedSubject('');
        setDifficulty('');
        setTags('');
        setDetectedType('');
        setSelectedResourceType('');
        }
      } else if (result.error) {
        toast.error(`Failed to ${initialData ? 'update' : 'add'} resource: ${result.error}`);
      }
    } catch (error) {
      console.error('Error saving resource:', error);
      toast.error(`Failed to ${initialData ? 'update' : 'add'} resource. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="url">URL <span className="text-destructive">*</span></Label>
        <div className="relative">
          <Input
            id="url"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://example.com/resource"
            className={urlError ? 'border-destructive' : ''}
            disabled={!!initialData} // Disable URL editing when editing existing resource
          />
          {isExtracting && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
        {urlError && (
          <p className="text-sm text-destructive mt-1 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {urlError}
          </p>
        )}
        {detectedType && (
          <div className="mt-2 flex items-center gap-2">
            <Link2 className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="text-xs">
              {getResourceTypeLabel(detectedType as ResourceType)} auto-detected
            </Badge>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="resource-type">Resource Type</Label>
        <Select 
          value={selectedResourceType} 
          onValueChange={(value) => setSelectedResourceType(value as ResourceType)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select resource type...">
              {selectedResourceType && (
                <div className="flex items-center gap-2">
                  {React.createElement(RESOURCE_TYPE_ICONS[selectedResourceType], { className: "h-4 w-4" })}
                  <span>{getResourceTypeLabel(selectedResourceType)}</span>
                  {detectedType && detectedType === selectedResourceType && (
                    <Badge variant="outline" className="text-xs ml-auto">Auto-detected</Badge>
                  )}
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-64">
            {RESOURCE_TYPES.map(resourceType => {
              const Icon = RESOURCE_TYPE_ICONS[resourceType.type];
              const isDetected = detectedType === resourceType.type;
              return (
                <SelectItem key={resourceType.type} value={resourceType.type}>
                  <div className="flex items-center gap-2 w-full">
                    <Icon className="h-4 w-4" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{resourceType.label}</span>
                        {isDetected && (
                          <Badge variant="outline" className="text-xs">Detected</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{resourceType.description}</p>
                    </div>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          Resource type is auto-detected from URL, but you can override it manually
        </p>
      </div>

      <div>
        <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter resource title..."
          maxLength={200}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="subject">Subject <span className="text-destructive">*</span></Label>
        <Select 
          value={selectedSubject} 
          onValueChange={setSelectedSubject}
          required
        >
          <SelectTrigger className={!selectedSubject ? 'border-destructive/50' : ''}>
            <SelectValue placeholder="Select a subject (required)" />
          </SelectTrigger>
          <SelectContent>
            {subjectsLoading ? (
              <SelectItem value="_loading" disabled>Loading subjects...</SelectItem>
            ) : userSubjects.length > 0 ? (
              userSubjects.map(subject => (
                <SelectItem key={subject.id} value={subject.name}>
                  {subject.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="_none" disabled>No subjects found</SelectItem>
            )}
          </SelectContent>
        </Select>
        {!selectedSubject && (
          <p className="text-sm text-destructive mt-1">Please select a subject</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the resource..."
          maxLength={500}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="author">Author/Creator</Label>
          <Input
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Author name..."
            maxLength={100}
          />
        </div>

        <div>
          <Label htmlFor="difficulty">Difficulty Level</Label>
          <Select value={difficulty} onValueChange={(value) => setDifficulty(value as DifficultyLevel)}>
            <SelectTrigger>
              <SelectValue placeholder="Select difficulty..." />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTY_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Enter tags separated by commas..."
          maxLength={200}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Separate multiple tags with commas (e.g., mathematics, algebra, equations)
        </p>
      </div>

      {isExtracting && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Extracting resource information from URL...
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="submit"
          disabled={!url.trim() || !title.trim() || !selectedSubject || isSubmitting || isExtracting}
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? 
            (initialData ? 'Updating...' : 'Adding...') : 
            (initialData ? 'Update Resource' : 'Add Resource')
          }
        </Button>
      </div>
    </form>
  );
};