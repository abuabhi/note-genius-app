import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/components/layout/AdminLayout';
import { useVideoSettings, useUpdateVideoSettings } from '@/hooks/admin/useAdminSettings';
import { Play, Save, RotateCcw, ExternalLink, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const AdminVideoManagementPage = () => {
  const { data: videoSettings, isLoading } = useVideoSettings();
  const updateVideoSettings = useUpdateVideoSettings();
  const [editedSettings, setEditedSettings] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const videoSections = [
    { key: 'video_hero_url', label: 'Hero Section Video', description: 'Main video on the landing page hero' },
    { key: 'video_notes_import_url', label: 'Notes Import & AI Enhancement', description: 'Demonstrates note importing and AI features' },
    { key: 'video_flashcard_generation_url', label: 'AI Flashcard Generation', description: 'Shows flashcard creation process' },
    { key: 'video_smart_quizzes_url', label: 'Smart Quizzes', description: 'Demonstrates adaptive quiz functionality' },
    { key: 'video_ai_chat_url', label: 'AI Chat with Notes', description: 'Shows chat interface with study materials' },
    { key: 'video_study_plans_url', label: 'Personalized Study Plans', description: 'Demonstrates study planning features' },
    { key: 'video_todo_focus_url', label: 'To-do & Focus Tools', description: 'Shows task management and focus features' },
    { key: 'video_analytics_url', label: 'Learning Analytics', description: 'Demonstrates progress tracking and insights' },
    { key: 'video_timer_url', label: 'Study Timer', description: 'Shows Pomodoro timer functionality' },
    { key: 'video_goals_progress_url', label: 'Goals & Progress', description: 'Demonstrates goal setting and tracking' },
    { key: 'video_resources_url', label: 'Resources Management', description: 'Shows resource organization features' }
  ];

  const validateVideoUrl = (url: string): boolean => {
    if (!url.trim()) return false;
    
    const youtubeRegex = /^https:\/\/(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)/;
    const vimeoRegex = /^https:\/\/(www\.)?vimeo\.com\/\d+/;
    
    return youtubeRegex.test(url) || vimeoRegex.test(url);
  };

  const handleInputChange = (key: string, value: string) => {
    setEditedSettings(prev => ({ ...prev, [key]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[key]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const handleSave = async () => {
    // Validate all edited URLs
    const errors: Record<string, string> = {};
    
    Object.entries(editedSettings).forEach(([key, value]) => {
      if (value && !validateVideoUrl(value)) {
        errors[key] = 'Please enter a valid YouTube or Vimeo URL';
      }
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      await updateVideoSettings.mutateAsync(editedSettings);
      setEditedSettings({});
    } catch (error) {
      console.error('Failed to update video settings:', error);
    }
  };

  const handleReset = () => {
    setEditedSettings({});
    setValidationErrors({});
  };

  const openVideoPreview = (url: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const getDisplayUrl = (key: string) => {
    return editedSettings[key] ?? videoSettings?.[key as keyof typeof videoSettings] ?? '';
  };

  const hasUnsavedChanges = Object.keys(editedSettings).length > 0;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-mint-100 rounded mb-4 w-1/3"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-mint-50 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Video Management</h1>
            <p className="text-gray-600 mt-2">
              Manage video URLs for all sections on the landing page. Changes will be reflected immediately.
            </p>
          </div>
          
          {hasUnsavedChanges && (
            <div className="flex gap-2">
              <Button onClick={handleReset} variant="outline" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
              <Button 
                onClick={handleSave} 
                className="gap-2"
                disabled={updateVideoSettings.isPending}
              >
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-6">
          {videoSections.map((section) => {
            const currentUrl = getDisplayUrl(section.key);
            const hasChanges = section.key in editedSettings;
            const hasError = validationErrors[section.key];
            const isValid = currentUrl && validateVideoUrl(currentUrl);

            return (
              <Card key={section.key} className={`transition-all ${hasChanges ? 'ring-2 ring-mint-500' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {section.label}
                        {hasChanges && <Badge variant="secondary" className="text-xs">Modified</Badge>}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {isValid ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-amber-500" />
                      )}
                      
                      {currentUrl && isValid && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openVideoPreview(currentUrl)}
                          className="gap-2"
                        >
                          <Play className="h-4 w-4" />
                          Preview
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor={section.key} className="text-sm font-medium">
                      Video URL
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id={section.key}
                        value={currentUrl}
                        onChange={(e) => handleInputChange(section.key, e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                        className={hasError ? 'border-red-300 focus:border-red-500' : ''}
                      />
                      {currentUrl && isValid && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openVideoPreview(currentUrl)}
                          className="px-3"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    {hasError && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {hasError}
                      </p>
                    )}
                    
                    {!hasError && currentUrl && !isValid && (
                      <p className="text-sm text-amber-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        Please enter a valid YouTube or Vimeo URL
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {hasUnsavedChanges && (
          <div className="fixed bottom-6 right-6 flex gap-2">
            <Button onClick={handleReset} variant="outline" size="lg" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button 
              onClick={handleSave} 
              size="lg"
              className="gap-2"
              disabled={updateVideoSettings.isPending}
            >
              <Save className="h-4 w-4" />
              {updateVideoSettings.isPending ? 'Saving...' : 'Save All Changes'}
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminVideoManagementPage;