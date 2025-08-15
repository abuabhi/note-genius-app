import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Upload, Music, Edit, Trash2, Save, X, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';
import { AdminMusicBreadcrumb } from '@/components/admin/music/AdminMusicBreadcrumb';

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
  is_default: boolean;
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
          tags: [],
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

  const toggleDefaultTrack = async (track: StudyMusicTrack) => {
    try {
      // If setting as default, first unset current default
      if (!track.is_default) {
        await supabase
          .from('study_music_tracks')
          .update({ is_default: false })
          .eq('is_default', true);
      }

      const { data, error } = await supabase
        .from('study_music_tracks')
        .update({ is_default: !track.is_default })
        .eq('id', track.id)
        .select()
        .single();

      if (error) throw error;

      // Refresh tracks to get updated state
      loadTracks();
      toast.success(`Track ${data.is_default ? 'set as' : 'removed as'} default`);
    } catch (error) {
      console.error('Error toggling default track:', error);
      toast.error('Failed to update default track');
    }
  };

  const getThumbnailUrl = (thumbnailPath?: string) => {
    if (!thumbnailPath) return null;
    const { data } = supabase.storage
      .from('study-music')
      .getPublicUrl(thumbnailPath);
    return data.publicUrl;
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
        <AdminMusicBreadcrumb />
        
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tracks.map((track) => (
            <Card key={track.id} className="overflow-hidden">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex flex-col items-center text-center">
                  {/* Large thumbnail */}
                  <div className="relative mb-4">
                    {getThumbnailUrl(track.thumbnail_path) ? (
                      <img 
                        src={getThumbnailUrl(track.thumbnail_path)!} 
                        alt={track.name}
                        className="w-48 h-48 rounded-lg object-cover shadow-sm"
                      />
                    ) : (
                      <div className="w-48 h-48 bg-primary/10 rounded-lg flex items-center justify-center shadow-sm">
                        <Music className="h-12 w-12 text-primary" />
                      </div>
                    )}
                    {track.is_default && (
                      <Badge variant="default" className="absolute -top-2 -right-2 gap-1 bg-yellow-100 text-yellow-800 border-yellow-200">
                        <Star className="h-3 w-3" />
                        Default
                      </Badge>
                    )}
                  </div>
                  
                  {/* Title and artist */}
                  <div className="mb-4 w-full">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-2">{track.name}</h3>
                    <p className="text-muted-foreground text-sm mb-3">{track.artist}</p>
                    <div className="flex items-center justify-center gap-2">
                      <Badge variant={track.is_active ? "default" : "secondary"}>
                        {track.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">{track.category}</Badge>
                    </div>
                    <div className="mt-2">
                      <span className="text-sm text-muted-foreground">
                        {formatDuration(track.duration_seconds)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Action buttons at bottom */}
                <div className="mt-auto space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <Switch
                      checked={track.is_active}
                      onCheckedChange={() => toggleTrackStatus(track)}
                    />
                    <Label className="text-sm text-muted-foreground">
                      Active
                    </Label>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button
                      variant={track.is_default ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleDefaultTrack(track)}
                      className="w-full gap-2"
                    >
                      <Star className="h-4 w-4" />
                      {track.is_default ? 'Default' : 'Set Default'}
                    </Button>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(track)}
                        className="flex-1 gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteTrack(track)}
                        className="flex-1 gap-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
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