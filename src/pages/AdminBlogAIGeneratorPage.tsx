import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Helmet } from 'react-helmet';
import { ArrowLeft, Bot, Sparkles, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface GenerationJob {
  id: string;
  topic: string;
  target_keywords: string[];
  content_type: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  generated_post_id?: string;
  error_message?: string;
  created_at: string;
  processed_at?: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

const CONTENT_TEMPLATES = [
  {
    value: 'study-tips',
    label: 'Study Tips & Techniques',
    description: 'Practical advice for effective studying',
    keywords: ['study techniques', 'learning methods', 'exam preparation', 'memory improvement']
  },
  {
    value: 'productivity',
    label: 'Productivity & Time Management',
    description: 'Tips for better time management and productivity',
    keywords: ['productivity', 'time management', 'focus', 'goal setting']
  },
  {
    value: 'technology',
    label: 'Educational Technology',
    description: 'Latest trends in educational technology',
    keywords: ['edtech', 'learning apps', 'digital tools', 'online learning']
  },
  {
    value: 'motivation',
    label: 'Student Motivation',
    description: 'Content to inspire and motivate students',
    keywords: ['motivation', 'inspiration', 'student success', 'mindset']
  },
  {
    value: 'subject-guide',
    label: 'Subject-Specific Guide',
    description: 'Deep dive into specific academic subjects',
    keywords: ['subject mastery', 'academic success', 'learning strategies']
  }
];

const AdminBlogAIGeneratorPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [generationJobs, setGenerationJobs] = useState<GenerationJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [formData, setFormData] = useState({
    topic: '',
    contentType: '',
    categoryId: '',
    keywords: '',
    customPrompt: ''
  });

  useEffect(() => {
    fetchCategories();
    fetchGenerationJobs();
    
    // Poll for job updates every 5 seconds
    const interval = setInterval(fetchGenerationJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }

      setCategories(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchGenerationJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_generation_queue')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching generation jobs:', error);
        return;
      }

      setGenerationJobs((data || []) as GenerationJob[]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      toast.error('Topic is required');
      return;
    }

    if (!formData.contentType) {
      toast.error('Content type is required');
      return;
    }

    try {
      setGenerating(true);

      const template = CONTENT_TEMPLATES.find(t => t.value === formData.contentType);
      const keywords = formData.keywords 
        ? formData.keywords.split(',').map(k => k.trim()).filter(k => k)
        : template?.keywords || [];

      // Add to generation queue
      const { data: queueJob, error: queueError } = await supabase
        .from('blog_generation_queue')
        .insert([{
          topic: formData.topic,
          target_keywords: keywords,
          content_type: formData.contentType,
          status: 'pending'
        }])
        .select()
        .single();

      if (queueError) {
        console.error('Error adding to queue:', queueError);
        toast.error('Failed to queue generation job');
        return;
      }

      // Call the AI generation function
      const { data, error } = await supabase.functions.invoke('generate-blog-post', {
        body: {
          queueId: queueJob.id,
          topic: formData.topic,
          contentType: formData.contentType,
          keywords: keywords,
          categoryId: formData.categoryId,
          customPrompt: formData.customPrompt
        }
      });

      if (error) {
        console.error('Error generating post:', error);
        toast.error('Failed to generate post');
        return;
      }

      toast.success('Post generation started! Check the status below.');
      
      // Reset form
      setFormData({
        topic: '',
        contentType: '',
        categoryId: '',
        keywords: '',
        customPrompt: ''
      });

      // Refresh jobs
      fetchGenerationJobs();
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred');
    } finally {
      setGenerating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'generating':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'generating':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>AI Content Generator - Blog Management</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/admin/blog')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Bot className="h-8 w-8 text-primary" />
                AI Content Generator
              </h1>
              <p className="text-muted-foreground mt-1">
                Generate high-quality blog posts using AI
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Generation Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Generate New Post
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="topic">Topic *</Label>
                  <Input
                    id="topic"
                    value={formData.topic}
                    onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                    placeholder="e.g., 'How to improve memory retention while studying'"
                  />
                </div>

                <div>
                  <Label htmlFor="contentType">Content Type *</Label>
                  <Select 
                    value={formData.contentType} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, contentType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTENT_TEMPLATES.map(template => (
                        <SelectItem key={template.value} value={template.value}>
                          <div>
                            <div className="font-medium">{template.label}</div>
                            <div className="text-xs text-muted-foreground">{template.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.contentType && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground mb-2">Default keywords:</p>
                      <div className="flex flex-wrap gap-1">
                        {CONTENT_TEMPLATES.find(t => t.value === formData.contentType)?.keywords.map(keyword => (
                          <Badge key={keyword} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.categoryId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="keywords">Additional Keywords (comma-separated)</Label>
                  <Input
                    id="keywords"
                    value={formData.keywords}
                    onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                    placeholder="keyword1, keyword2, keyword3"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Add specific keywords to target beyond the default template keywords
                  </p>
                </div>

                <div>
                  <Label htmlFor="customPrompt">Custom Instructions (optional)</Label>
                  <Textarea
                    id="customPrompt"
                    value={formData.customPrompt}
                    onChange={(e) => setFormData(prev => ({ ...prev, customPrompt: e.target.value }))}
                    placeholder="Any specific instructions or requirements for the content..."
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleGenerate} 
                  disabled={generating || !formData.topic || !formData.contentType}
                  className="w-full"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Bot className="h-4 w-4 mr-2" />
                      Generate Post
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Generation Status */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generation History</CardTitle>
              </CardHeader>
              <CardContent>
                {generationJobs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No generation jobs yet. Create your first AI-generated post!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {generationJobs.map((job) => (
                      <div key={job.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">{job.topic}</h4>
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusIcon(job.status)}
                              <Badge className={getStatusColor(job.status)}>
                                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              <div>Created: {format(new Date(job.created_at), 'MMM dd, yyyy HH:mm')}</div>
                              {job.processed_at && (
                                <div>Processed: {format(new Date(job.processed_at), 'MMM dd, yyyy HH:mm')}</div>
                              )}
                            </div>
                          </div>
                        </div>

                        {job.target_keywords && job.target_keywords.length > 0 && (
                          <div className="mb-2">
                            <div className="flex flex-wrap gap-1">
                              {job.target_keywords.map(keyword => (
                                <Badge key={keyword} variant="outline" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {job.status === 'failed' && job.error_message && (
                          <div className="bg-red-50 border border-red-200 rounded p-2 mt-2">
                            <p className="text-red-800 text-sm">{job.error_message}</p>
                          </div>
                        )}

                        {job.status === 'completed' && job.generated_post_id && (
                          <div className="flex gap-2 mt-3">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => navigate(`/admin/blog/edit/${job.generated_post_id}`)}
                            >
                              Edit Post
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => {
                                // Navigate to the blog post
                                window.open(`/blog/${job.generated_post_id}`, '_blank');
                              }}
                            >
                              View Post
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Generation Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <h5 className="font-medium mb-1">📝 Topic Guidelines</h5>
                  <p className="text-muted-foreground">Be specific and actionable. Instead of "Study Tips", try "5 Proven Memory Techniques for Exam Success"</p>
                </div>
                <Separator />
                <div className="text-sm">
                  <h5 className="font-medium mb-1">🎯 Keywords</h5>
                  <p className="text-muted-foreground">Include 3-5 relevant keywords to improve SEO and content focus</p>
                </div>
                <Separator />
                <div className="text-sm">
                  <h5 className="font-medium mb-1">⚡ Processing Time</h5>
                  <p className="text-muted-foreground">AI generation typically takes 1-3 minutes depending on content length and complexity</p>
                </div>
                <Separator />
                <div className="text-sm">
                  <h5 className="font-medium mb-1">✏️ Post-Generation</h5>
                  <p className="text-muted-foreground">Always review and edit AI-generated content before publishing</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBlogAIGeneratorPage;