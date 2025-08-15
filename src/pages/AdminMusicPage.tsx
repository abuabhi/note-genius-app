import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Upload, Music, Edit, Trash2, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';

interface StudyMusicTrack {
  id: string;
  name: string;
  artist: string;
  audio_file_path: string;
  thumbnail_path?: string;
  duration_seconds?: number;
  category: string;
  tags: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const AdminMusicPage = () => {
  const { user } = useAuth();
  const [tracks, setTracks] = useState<StudyMusicTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingTrack, setEditingTrack] = useState<StudyMusicTrack | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    artist: '',
    category: 'lofi',
    tags: '',
    audio_file: null as File | null,
    thumbnail_file: null as File | null,
  });

  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    try {
      const { data, error } = await supabase
        .from('study_music_tracks')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setTracks(data || []);
    } catch (error) {
      console.error('Error loading tracks:', error);
      toast.error('Failed to load tracks');
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File, bucket: string, path: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;
    return data.path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.audio_file) {
      toast.error('Please select an audio file');
      return;
    }

    setUploading(true);
    try {
      // Upload audio file
      const audioPath = `tracks/${Date.now()}-${formData.audio_file.name}`;
      await uploadFile(formData.audio_file, 'study-music', audioPath);

      // Upload thumbnail if provided
      let thumbnailPath = null;
      if (formData.thumbnail_file) {
        thumbnailPath = `thumbnails/${Date.now()}-${formData.thumbnail_file.name}`;
        await uploadFile(formData.thumbnail_file, 'study-music', thumbnailPath);
      }

      // Get audio duration (basic implementation)
      const audioDuration = await getAudioDuration(formData.audio_file);

      // Create track record
      const { data, error } = await supabase
        .from('study_music_tracks')
        .insert({
          name: formData.name,
          artist: formData.artist,
          audio_file_path: audioPath,
          thumbnail_path: thumbnailPath,
          duration_seconds: Math.round(audioDuration),
          category: formData.category,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          sort_order: tracks.length,
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      setTracks([...tracks, data]);
      resetForm();
      setIsCreating(false);
      toast.success('Track uploaded successfully');
    } catch (error) {
      console.error('Error uploading track:', error);
      toast.error('Failed to upload track');
    } finally {
      setUploading(false);
    }
  };

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.addEventListener('loadedmetadata', () => {
        resolve(audio.duration);
      });
      audio.addEventListener('error', () => {
        resolve(300); // Default 5 minutes if can't determine
      });
      audio.src = URL.createObjectURL(file);
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      artist: '',
      category: 'lofi',
      tags: '',
      audio_file: null,
      thumbnail_file: null,
    });
  };

  const handleEdit = (track: StudyMusicTrack) => {
    setEditingTrack(track);
    setFormData({
      name: track.name,
      artist: track.artist,
      category: track.category,
      tags: track.tags.join(', '),
      audio_file: null,
      thumbnail_file: null,
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrack) return;

    setUploading(true);
    try {
      let updateData: any = {
        name: formData.name,
        artist: formData.artist,
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      };

      // Upload new audio file if provided
      if (formData.audio_file) {
        const audioPath = `tracks/${Date.now()}-${formData.audio_file.name}`;
        await uploadFile(formData.audio_file, 'study-music', audioPath);
        updateData.audio_file_path = audioPath;
        updateData.duration_seconds = Math.round(await getAudioDuration(formData.audio_file));
      }

      // Upload new thumbnail if provided
      if (formData.thumbnail_file) {
        const thumbnailPath = `thumbnails/${Date.now()}-${formData.thumbnail_file.name}`;
        await uploadFile(formData.thumbnail_file, 'study-music', thumbnailPath);
        updateData.thumbnail_path = thumbnailPath;
      }

      const { data, error } = await supabase
        .from('study_music_tracks')
        .update(updateData)
        .eq('id', editingTrack.id)
        .select()
        .single();

      if (error) throw error;

      setTracks(tracks.map(t => t.id === editingTrack.id ? data : t));
      setEditingTrack(null);
      resetForm();
      toast.success('Track updated successfully');
    } catch (error) {
      console.error('Error updating track:', error);
      toast.error('Failed to update track');
    } finally {
      setUploading(false);
    }
  };

  const toggleTrackStatus = async (track: StudyMusicTrack) => {
    try {
      const { data, error } = await supabase
        .from('study_music_tracks')
        .update({ is_active: !track.is_active })
        .eq('id', track.id)
        .select()
        .single();

      if (error) throw error;

      setTracks(tracks.map(t => t.id === track.id ? data : t));
      toast.success(`Track ${data.is_active ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error toggling track status:', error);
      toast.error('Failed to update track status');
    }
  };

  const deleteTrack = async (track: StudyMusicTrack) => {
    if (!confirm('Are you sure you want to delete this track?')) return;

    try {
      // Delete files from storage
      if (track.audio_file_path) {
        await supabase.storage.from('study-music').remove([track.audio_file_path]);
      }
      if (track.thumbnail_path) {
        await supabase.storage.from('study-music').remove([track.thumbnail_path]);
      }

      // Delete database record
      const { error } = await supabase
        .from('study_music_tracks')
        .delete()
        .eq('id', track.id);

      if (error) throw error;

      setTracks(tracks.filter(t => t.id !== track.id));
      toast.success('Track deleted successfully');
    } catch (error) {
      console.error('Error deleting track:', error);
      toast.error('Failed to delete track');
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Study Music Management</h1>
            <p className="text-muted-foreground">Manage study music tracks and uploads</p>
          </div>
          <Button onClick={() => setIsCreating(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Track
          </Button>
        </div>

        {(isCreating || editingTrack) && (
          <Card>
            <CardHeader>
              <CardTitle>{editingTrack ? 'Edit Track' : 'Upload New Track'}</CardTitle>
              <CardDescription>
                {editingTrack ? 'Update track details' : 'Upload audio files and set metadata'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={editingTrack ? handleUpdate : handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Track Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="artist">Artist</Label>
                    <Input
                      id="artist"
                      value={formData.artist}
                      onChange={(e) => setFormData({...formData, artist: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full h-10 px-3 py-2 text-sm ring-offset-background border border-input bg-background rounded-md"
                    >
                      <option value="lofi">Lo-Fi</option>
                      <option value="classical">Classical</option>
                      <option value="ambient">Ambient</option>
                      <option value="nature">Nature</option>
                      <option value="piano">Piano</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData({...formData, tags: e.target.value})}
                      placeholder="chill, focus, study"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="audio">Audio File (.mp3, .wav, .ogg)</Label>
                    <Input
                      id="audio"
                      type="file"
                      accept=".mp3,.wav,.ogg"
                      onChange={(e) => setFormData({...formData, audio_file: e.target.files?.[0] || null})}
                      required={!editingTrack}
                    />
                  </div>
                  <div>
                    <Label htmlFor="thumbnail">Thumbnail (optional)</Label>
                    <Input
                      id="thumbnail"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormData({...formData, thumbnail_file: e.target.files?.[0] || null})}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={uploading} className="gap-2">
                    {uploading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {editingTrack ? 'Update' : 'Upload'} Track
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false);
                      setEditingTrack(null);
                      resetForm();
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {tracks.map((track) => (
            <Card key={track.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Music className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{track.name}</h3>
                      <p className="text-sm text-muted-foreground">{track.artist}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={track.is_active ? "default" : "secondary"}>
                          {track.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">{track.category}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDuration(track.duration_seconds)}
                        </span>
                      </div>
                      {track.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {track.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={track.is_active}
                      onCheckedChange={() => toggleTrackStatus(track)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(track)}
                      className="gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteTrack(track)}
                      className="gap-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {tracks.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tracks yet</h3>
                <p className="text-muted-foreground mb-4">
                  Upload your first study music track to get started
                </p>
                <Button onClick={() => setIsCreating(true)} className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Track
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMusicPage;