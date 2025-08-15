import { useCallback, useEffect, useMemo, useState } from 'react';
import AudioManager, { StudyPreset } from '@/utils/audio/AudioManager';

const VOL_KEY = 'studyAudio.volume';
const PRESET_KEY = 'studyAudio.preset';
const ENABLED_KEY = 'studyAudio.enabled';

export const useStudyAudio = () => {
  const [enabled, setEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem(ENABLED_KEY) === '1'; } catch { return false; }
  });
  const [preset, setPreset] = useState<StudyPreset>(() => {
    try { return (localStorage.getItem(PRESET_KEY) as StudyPreset) || 'pink-noise'; } catch { return 'pink-noise'; }
  });
  const [volume, setVolume] = useState<number>(() => {
    try { return Number(localStorage.getItem(VOL_KEY) ?? 0.6); } catch { return 0.6; }
  });

  // Memo to avoid re-renders
  const manager = useMemo(() => AudioManager.instance, []);

  useEffect(() => {
    try { localStorage.setItem(PRESET_KEY, preset); } catch {}
    manager.setPreset(preset);
  }, [preset, manager]);

  useEffect(() => {
    try { localStorage.setItem(VOL_KEY, String(volume)); } catch {}
    manager.setVolume(volume);
  }, [volume, manager]);

  useEffect(() => {
    try { localStorage.setItem(ENABLED_KEY, enabled ? '1' : '0'); } catch {}
    if (enabled) manager.play(); else manager.stop();
    // Cleanup on unmount
    return () => { manager.stop(0.2); };
  }, [enabled, manager]);

  const toggle = useCallback(() => setEnabled((e) => !e), []);

  return {
    enabled,
    toggle,
    preset,
    setPreset,
    volume,
    setVolume,
    audioState: manager.audioContextState,
    manager,
  } as const;
};
