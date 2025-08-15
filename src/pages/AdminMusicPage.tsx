import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';
import { AdminMusicBreadcrumb } from '@/components/admin/music/AdminMusicBreadcrumb';
import { TrackCard } from '@/components/admin/music/TrackCard';

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
    console.log(`🔄 Uploading ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) to ${bucket}/${path}`);
    
    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB (max 50MB)`);
    }

    // Generate unique path to prevent conflicts
    const uniquePath = `${path.split('/')[0]}/${Date.now()}-${crypto.randomUUID()}-${file.name}`;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(uniquePath, file, {
        cacheControl: '3600',
        upsert: false // Don't overwrite existing files
      });

    if (error) {
      console.error(`❌ Upload failed for ${file.name}:`, error);
      throw new Error(`Upload failed: ${error.message}`);
    }
    
    console.log(`✅ Successfully uploaded ${file.name} to ${data.path}`);
    return data.path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 Starting track upload process...');
    
    // Validation
    if (!formData.audio_file) {
      toast.error('Please select an audio file');
      return;
    }

    if (!formData.name.trim() || !formData.artist.trim()) {
      toast.error('Please fill in track name and artist');
      return;
    }

    // Validate audio file type
    const validAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
    if (!validAudioTypes.includes(formData.audio_file.type)) {
      toast.error('Please select a valid audio file (.mp3, .wav, .ogg)');
      return;
    }

    console.log('📋 Form validation passed:', {
      name: formData.name,
      artist: formData.artist,
      category: formData.category,
      audioFile: `${formData.audio_file.name} (${(formData.audio_file.size / 1024 / 1024).toFixed(2)}MB)`,
      thumbnailFile: formData.thumbnail_file ? `${formData.thumbnail_file.name} (${(formData.thumbnail_file.size / 1024 / 1024).toFixed(2)}MB)` : 'None'
    });

    setUploading(true);
    
    try {
      console.log('🎵 Step 1: Uploading audio file...');
      const audioPath = await uploadFile(formData.audio_file, 'study-music', 'tracks/placeholder');

      let thumbnailPath = null;
      if (formData.thumbnail_file) {
        console.log('🖼️ Step 2: Uploading thumbnail...');
        thumbnailPath = await uploadFile(formData.thumbnail_file, 'study-music', 'thumbnails/placeholder');
      } else {
        console.log('⏭️ Step 2: Skipping thumbnail upload (no file selected)');
      }

      console.log('⏱️ Step 3: Getting audio duration...');
      const audioDuration = await getAudioDuration(formData.audio_file);
      console.log(`✅ Audio duration: ${audioDuration} seconds`);

      console.log('💾 Step 4: Creating database record...');
      const insertData = {
        name: formData.name.trim(),
        artist: formData.artist.trim(),
        audio_file_path: audioPath,
        thumbnail_path: thumbnailPath,
        duration_seconds: Math.round(audioDuration),
        category: formData.category,
        tags: [],
        sort_order: tracks.length,
        created_by: user?.id
      };
      
      console.log('📝 Insert data:', insertData);

      const { data, error } = await supabase
        .from('study_music_tracks')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Database insert failed:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('✅ Track created successfully:', data);
      setTracks([...tracks, data]);
      resetForm();
      setIsCreating(false);
      toast.success('Track uploaded successfully!');
      
    } catch (error: any) {
      console.error('❌ Upload process failed:', error);
      const errorMessage = error?.message || 'Unknown error occurred';
      toast.error(`Upload failed: ${errorMessage}`);
    } finally {
      setUploading(false);
      console.log('🏁 Upload process completed');
    }
  };

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      let isResolved = false;
      
      // Timeout after 10 seconds
      const timeout = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          console.warn('⚠️ Audio duration detection timed out, using default');
          URL.revokeObjectURL(audio.src);
          resolve(300); // Default 5 minutes
        }
      }, 10000);
      
      audio.addEventListener('loadedmetadata', () => {
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timeout);
          console.log(`📏 Audio duration detected: ${audio.duration} seconds`);
          URL.revokeObjectURL(audio.src);
          resolve(audio.duration);
        }
      });
      
      audio.addEventListener('error', (e) => {
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timeout);
          console.warn('⚠️ Audio duration detection failed:', e);
          URL.revokeObjectURL(audio.src);
          resolve(300); // Default 5 minutes
        }
      });
      
      try {
        audio.src = URL.createObjectURL(file);
      } catch (error) {
        console.error('❌ Failed to create audio object URL:', error);
        clearTimeout(timeout);
        resolve(300);
      }
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

  const getThumbnailUrl = async (thumbnailPath?: string): Promise<string | null> => {
    if (!thumbnailPath) return null;
    
    try {
      // Try to get a signed URL for better reliability
      const { data, error } = await supabase.storage
        .from('study-music')
        .createSignedUrl(thumbnailPath, 3600); // 1 hour expiry
      
      if (error) {
        console.warn('Failed to create signed URL, falling back to public URL:', error);
        // Fallback to public URL
        const { data: publicData } = supabase.storage
          .from('study-music')
          .getPublicUrl(thumbnailPath);
        return publicData.publicUrl;
      }
      
      return data.signedUrl;
    } catch (error) {
      console.error('Error getting thumbnail URL:', error);
      return null;
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tracks.map((track) => (
            <TrackCard 
              key={track.id} 
              track={track} 
              onEdit={handleEdit} 
              onDelete={deleteTrack} 
              onToggleStatus={toggleTrackStatus} 
              onToggleDefault={toggleDefaultTrack} 
            />
          ))}

          {tracks.length === 0 && (
            <div className="col-span-full">
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No tracks yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload your first study music track to get started
                  </p>
                  <Button onClick={() => setIsCreating(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Upload Track
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMusicPage;