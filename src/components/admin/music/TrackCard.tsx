import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Music, Edit, Trash2, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

interface TrackCardProps {
  track: StudyMusicTrack;
  onEdit: (track: StudyMusicTrack) => void;
  onDelete: (track: StudyMusicTrack) => void;
  onToggleStatus: (track: StudyMusicTrack) => void;
  onToggleDefault: (track: StudyMusicTrack) => void;
}

export const TrackCard = ({ track, onEdit, onDelete, onToggleStatus, onToggleDefault }: TrackCardProps) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const loadThumbnail = async () => {
      if (!track.thumbnail_path) return;
      
      try {
        // Try signed URL first
        const { data, error } = await supabase.storage
          .from('study-music')
          .createSignedUrl(track.thumbnail_path, 3600);
        
        if (error) {
          // Fallback to public URL
          const { data: publicData } = supabase.storage
            .from('study-music')
            .getPublicUrl(track.thumbnail_path);
          setThumbnailUrl(publicData.publicUrl);
        } else {
          setThumbnailUrl(data.signedUrl);
        }
      } catch (error) {
        console.error('Error loading thumbnail:', error);
        setImageError(true);
      }
    };

    loadThumbnail();
  }, [track.thumbnail_path]);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-200 border-border/50 hover:border-border">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Thumbnail */}
          <div className="relative flex-shrink-0">
            {thumbnailUrl && !imageError ? (
              <img 
                src={thumbnailUrl} 
                alt={track.name}
                className="w-20 h-20 rounded-lg object-cover border border-border/20"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center border border-border/20">
                <Music className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            {track.is_default && (
              <Badge className="absolute -top-1 -right-1 h-5 px-1 bg-primary text-primary-foreground border-0">
                <Star className="h-3 w-3" />
              </Badge>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground truncate">{track.name}</h3>
                <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
              </div>
              <div className="flex items-center gap-1">
                <Switch
                  checked={track.is_active}
                  onCheckedChange={() => onToggleStatus(track)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <Badge variant={track.is_active ? "default" : "secondary"} className="text-xs">
                {track.is_active ? 'Active' : 'Inactive'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {track.category}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDuration(track.duration_seconds)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={track.is_default ? "default" : "outline"}
                size="sm"
                onClick={() => onToggleDefault(track)}
                className="flex-1 h-8 text-xs"
              >
                <Star className="h-3 w-3 mr-1" />
                {track.is_default ? 'Default' : 'Set Default'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(track)}
                className="h-8 px-2"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(track)}
                className="h-8 px-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};