import { useState, useEffect, useCallback } from 'react';
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import StudyMusicManager, { StudyMusicTrack } from '@/utils/audio/StudyMusicManager';

export const useStudyMusic = () => {
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<StudyMusicTrack | null>(null);
  const [volume, setVolume] = useState(0.6);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const manager = StudyMusicManager.instance;

  // Load user's selected track on mount
  useEffect(() => {
    if (user) {
      loadUserTrack();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Set up volume when it changes
  useEffect(() => {
    manager.setVolume(volume);
  }, [volume, manager]);

  const loadUserTrack = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user's selected track
      const { data: selectedTrack, error: selectError } = await supabase
        .from('user_selected_music_track')
        .select(`
          track_id,
          study_music_tracks (
            id,
            name,
            artist,
            audio_file_path,
            duration_seconds,
            category,
            tags
          )
        `)
        .eq('user_id', user!.id)
        .single();

      if (selectError) {
        console.error('Error loading user track:', selectError);
        setError('Failed to load your music');
        return;
      }

      if (selectedTrack?.study_music_tracks) {
        const track = selectedTrack.study_music_tracks as any;
        const musicTrack: StudyMusicTrack = {
          id: track.id,
          name: track.name,
          artist: track.artist,
          url: '', // Will be set when playing
          duration: track.duration_seconds || 0,
          audio_file_path: track.audio_file_path
        };
        
        setCurrentTrack(musicTrack);
        manager.setTracks([musicTrack]);
      } else {
        setError('No music track selected');
      }
    } catch (error) {
      console.error('Error in loadUserTrack:', error);
      setError('Failed to load music');
    } finally {
      setLoading(false);
    }
  };

  const play = useCallback(async () => {
    if (!currentTrack) {
      setError('No track selected');
      return;
    }

    try {
      setError(null);
      await manager.playTrack(currentTrack.id);
      setIsPlaying(true);
    } catch (error) {
      console.error('Play error:', error);
      setError('Failed to play music');
      setIsPlaying(false);
    }
  }, [currentTrack, manager]);

  const stop = useCallback(() => {
    manager.stop();
    setIsPlaying(false);
  }, [manager]);

  const toggle = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      play();
    }
  }, [isPlaying, play, stop]);

  return {
    isPlaying: manager.playing,
    currentTrack,
    volume,
    setVolume,
    loading,
    error,
    play,
    stop,
    toggle,
    reload: loadUserTrack
  };
};