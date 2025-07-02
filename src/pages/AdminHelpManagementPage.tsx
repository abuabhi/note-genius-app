import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Search, Eye } from 'lucide-react';
import { useAllHelpTopics, useDeleteHelpTopic, HelpTopic } from '@/hooks/help/useHelpTopics';
import { HelpTopicEditDialog } from '@/components/help/HelpTopicEditDialog';
import { toast } from 'sonner';

const AdminHelpManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingTopic, setEditingTopic] = useState<HelpTopic | null>(null);

  const { data: topics = [], isLoading } = useAllHelpTopics();
  const deleteTopic = useDeleteHelpTopic();

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'getting-started', label: 'Getting Started' },
    { id: 'notes', label: 'Notes' },
    { id: 'flashcards', label: 'Flashcards' },
    { id: 'ai-features', label: 'AI Features' },
    { id: 'reminders', label: 'Reminders' },
    { id: 'import-export', label: 'Import & Export' },
    { id: 'analytics', label: 'Analytics' }
  ];

  const filteredTopics = topics.filter(topic => {
    const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDelete = async (topic: HelpTopic) => {
    if (window.confirm(`Are you sure you want to delete "${topic.title}"?`)) {
      try {
        await deleteTopic.mutateAsync(topic.id);
        toast.success('Help topic deleted successfully');
      } catch (error) {
        console.error('Error deleting topic:', error);
        toast.error('Failed to delete help topic');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Help Topics Management</h1>
        <p className="text-lg text-gray-600 mb-6">
          Manage help content and documentation for PrepGenie users
        </p>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search help topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.label}
              </Button>
            ))}
          </div>

          {/* Add New Button */}
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Topic
          </Button>
        </div>
      </div>

      {/* Topics List */}
      <div className="space-y-4">
        {filteredTopics.map((topic) => (
          <Card key={topic.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">{topic.title}</CardTitle>
                    <Badge variant="secondary">
                      {topic.category.replace('-', ' ').toUpperCase()}
                    </Badge>
                    {!topic.is_active && (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                    <Badge variant="outline">Priority: {topic.priority}</Badge>
                  </div>
                  <p className="text-gray-600 mb-2">{topic.description}</p>
                  
                  {/* Tags */}
                  {topic.tags && topic.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {topic.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Video Info */}
                  {topic.video_title && (
                    <div className="text-sm text-gray-500 flex items-center gap-4">
                      <span>📹 {topic.video_title}</span>
                      {topic.video_duration && <span>⏱️ {topic.video_duration}</span>}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open('/help', '_blank')}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingTopic(topic)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(topic)}
                    disabled={deleteTopic.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Quick Tips Preview */}
            {topic.quick_tips && topic.quick_tips.length > 0 && (
              <CardContent className="pt-0">
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Quick Tips: </span>
                  <span className="text-gray-600">
                    {topic.quick_tips.slice(0, 2).join(' • ')}
                    {topic.quick_tips.length > 2 && ` • +${topic.quick_tips.length - 2} more`}
                  </span>
                </div>
              </CardContent>
            )}
          </Card>
        ))}

        {filteredTopics.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No help topics found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search terms or category filter'
                : 'Get started by adding your first help topic'
              }
            </p>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      {editingTopic && (
        <HelpTopicEditDialog
          topic={editingTopic}
          open={!!editingTopic}
          onOpenChange={(open) => !open && setEditingTopic(null)}
        />
      )}
    </div>
  );
};

export default AdminHelpManagementPage;