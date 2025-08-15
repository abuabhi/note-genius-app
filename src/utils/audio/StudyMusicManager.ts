// Study Music Manager for real audio tracks
export interface StudyMusicTrack {
  id: string;
  name: string;
  artist: string;
  url: string;
  duration: number;
  audio_file_path: string;
}

class StudyMusicManager {
  private static _instance: StudyMusicManager | null = null;
  private audio: HTMLAudioElement | null = null;
  private currentTrack: StudyMusicTrack | null = null;
  private volume = 0.6;
  private isPlaying = false;
  private tracks: StudyMusicTrack[] = [];

  static get instance() {
    if (!this._instance) this._instance = new StudyMusicManager();
    return this._instance;
  }

  setTracks(tracks: StudyMusicTrack[]) {
    this.tracks = tracks;
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.audio) {
      this.audio.volume = this.volume;
    }
  }

  async playTrack(trackId: string, fadeSeconds = 0.3) {
    const track = this.tracks.find(t => t.id === trackId);
    if (!track) {
      console.warn('Track not found:', trackId);
      return;
    }

    // Stop current track if playing
    if (this.audio) {
      this.stop(0.1);
    }

    try {
      // Get signed URL from Supabase using the actual audio file path
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from('study-music')
        .createSignedUrl(track.audio_file_path, 3600);

      if (urlError || !signedUrlData?.signedUrl) {
        console.error('Failed to get signed URL:', urlError);
        this.isPlaying = false;
        return;
      }

      // Create and configure audio element
      this.audio = new Audio();
      this.audio.crossOrigin = "anonymous";
      this.audio.preload = "auto";
      this.audio.volume = 0;
      this.audio.loop = true;
      this.currentTrack = track;

      // Set up event handlers
      this.audio.onended = () => {
        this.isPlaying = false;
      };

      this.audio.onerror = (error) => {
        console.error('Audio error:', error);
        this.isPlaying = false;
      };

      this.audio.oncanplaythrough = async () => {
        try {
          await this.audio!.play();
          
          // Fade in
          const startTime = Date.now();
          const fadeInterval = setInterval(() => {
            const elapsed = (Date.now() - startTime) / 1000;
            const progress = Math.min(elapsed / fadeSeconds, 1);
            
            if (this.audio) {
              this.audio.volume = progress * this.volume;
            }
            
            if (progress >= 1) {
              clearInterval(fadeInterval);
            }
          }, 50);

          this.isPlaying = true;
          
          // Media Session metadata
          try {
            if ('mediaSession' in navigator) {
              // @ts-ignore
              navigator.mediaSession.metadata = new MediaMetadata({
                title: track.name,
                artist: track.artist,
                album: 'Study Music',
              });
            }
          } catch {}
        } catch (playError) {
          console.error('Failed to play audio:', playError);
          this.isPlaying = false;
        }
      };

      // Load the audio source
      this.audio.src = signedUrlData.signedUrl;
      this.audio.load();
      
    } catch (error) {
      console.error('Failed to setup track:', error);
      this.isPlaying = false;
    }
  }

  stop(fadeSeconds = 0.3) {
    if (!this.audio) return;

    const startVolume = this.audio.volume;
    const startTime = Date.now();
    
    const fadeInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / fadeSeconds, 1);
      
      if (this.audio) {
        this.audio.volume = startVolume * (1 - progress);
      }
      
      if (progress >= 1) {
        clearInterval(fadeInterval);
        if (this.audio) {
          this.audio.pause();
          this.audio.remove();
        }
        this.audio = null;
        this.currentTrack = null;
      }
    }, 50);

    this.isPlaying = false;
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
    } else if (this.currentTrack) {
      this.playTrack(this.currentTrack.id);
    }
  }

  get playing() {
    return this.isPlaying;
  }

  get current() {
    return this.currentTrack;
  }

  get availableTracks() {
    return this.tracks;
  }
}

export default StudyMusicManager;