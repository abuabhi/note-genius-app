import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: string;
  label: string;
  description?: string;
}

interface CategoryManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const defaultCategories: Category[] = [
  { id: 'getting-started', label: 'Getting Started', description: 'Basic introduction and setup guides' },
  { id: 'notes', label: 'Notes', description: 'Note-taking and management features' },
  { id: 'flashcards', label: 'Flashcards', description: 'Flashcard creation and study tools' },
  { id: 'study-sessions', label: 'Study Sessions', description: 'Study session tracking and analytics' },
  { id: 'progress', label: 'Progress', description: 'Progress tracking and achievements' },
  { id: 'settings', label: 'Settings', description: 'Account and app settings' },
  { id: 'advanced', label: 'Advanced', description: 'Advanced features and customization' },
  { id: 'ai-features', label: 'AI Features', description: 'AI-powered tools and assistance' },
  { id: 'reminders', label: 'Reminders', description: 'Reminder system and notifications' },
  { id: 'import-export', label: 'Import & Export', description: 'Data import and export features' },
  { id: 'analytics', label: 'Analytics', description: 'Analytics and reporting tools' }
];

export const CategoryManagementDialog = ({ open, onOpenChange }: CategoryManagementDialogProps) => {
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({ id: '', label: '', description: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSaveEdit = (categoryId: string, updatedCategory: Partial<Category>) => {
    setCategories(prev => 
      prev.map(cat => 
        cat.id === categoryId ? { ...cat, ...updatedCategory } : cat
      )
    );
    setEditingCategory(null);
    toast.success('Category updated successfully');
  };

  const handleAddCategory = () => {
    if (!newCategory.id || !newCategory.label) {
      toast.error('Category ID and label are required');
      return;
    }

    if (categories.some(cat => cat.id === newCategory.id)) {
      toast.error('Category ID already exists');
      return;
    }

    setCategories(prev => [...prev, { ...newCategory }]);
    setNewCategory({ id: '', label: '', description: '' });
    setShowAddForm(false);
    toast.success('Category added successfully');
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      toast.success('Category deleted successfully');
    }
  };

  const generateIdFromLabel = (label: string) => {
    return label.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Help Categories</DialogTitle>
          <DialogDescription>
            Add, edit, or remove help topic categories. Categories help organize content for better discoverability.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add New Category Form */}
          {showAddForm && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium mb-3">Add New Category</h4>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="category-label">Category Label</Label>
                  <Input
                    id="category-label"
                    value={newCategory.label}
                    onChange={(e) => {
                      const label = e.target.value;
                      setNewCategory(prev => ({
                        ...prev,
                        label,
                        id: generateIdFromLabel(label)
                      }));
                    }}
                    placeholder="e.g., AI Features"
                  />
                </div>
                <div>
                  <Label htmlFor="category-id">Category ID</Label>
                  <Input
                    id="category-id"
                    value={newCategory.id}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, id: e.target.value }))}
                    placeholder="e.g., ai-features"
                  />
                </div>
              </div>
              <div className="mb-4">
                <Label htmlFor="category-description">Description (Optional)</Label>
                <Textarea
                  id="category-description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of what this category covers"
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddCategory} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowAddForm(false);
                    setNewCategory({ id: '', label: '', description: '' });
                  }}
                  size="sm"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Add Category Button */}
          {!showAddForm && (
            <Button 
              variant="outline" 
              onClick={() => setShowAddForm(true)}
              className="w-full border-dashed"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Category
            </Button>
          )}

          {/* Categories List */}
          <div className="space-y-2">
            {categories.map((category) => (
              <CategoryRow
                key={category.id}
                category={category}
                isEditing={editingCategory === category.id}
                onStartEdit={() => setEditingCategory(category.id)}
                onSaveEdit={(updates) => handleSaveEdit(category.id, updates)}
                onCancelEdit={() => setEditingCategory(null)}
                onDelete={() => handleDeleteCategory(category.id)}
              />
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface CategoryRowProps {
  category: Category;
  isEditing: boolean;
  onStartEdit: () => void;
  onSaveEdit: (updates: Partial<Category>) => void;
  onCancelEdit: () => void;
  onDelete: () => void;
}

const CategoryRow = ({ 
  category, 
  isEditing, 
  onStartEdit, 
  onSaveEdit, 
  onCancelEdit, 
  onDelete 
}: CategoryRowProps) => {
  const [editData, setEditData] = useState({ 
    label: category.label, 
    description: category.description || '' 
  });

  if (isEditing) {
    return (
      <div className="border rounded-lg p-3 bg-blue-50">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <Label htmlFor={`edit-label-${category.id}`}>Label</Label>
            <Input
              id={`edit-label-${category.id}`}
              value={editData.label}
              onChange={(e) => setEditData(prev => ({ ...prev, label: e.target.value }))}
            />
          </div>
          <div>
            <Badge variant="outline" className="mt-6">
              ID: {category.id}
            </Badge>
          </div>
        </div>
        <div className="mb-3">
          <Label htmlFor={`edit-desc-${category.id}`}>Description</Label>
          <Textarea
            id={`edit-desc-${category.id}`}
            value={editData.description}
            onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
            rows={2}
          />
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            onClick={() => onSaveEdit(editData)}
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onCancelEdit}
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-3 flex items-center justify-between hover:bg-gray-50">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium">{category.label}</h4>
          <Badge variant="outline" className="text-xs">
            {category.id}
          </Badge>
        </div>
        {category.description && (
          <p className="text-sm text-gray-600">{category.description}</p>
        )}
      </div>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onStartEdit}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};