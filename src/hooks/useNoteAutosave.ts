import { useEffect, useRef } from 'react';

const KEY = (noteId: string) => `note-autosave:${noteId}`;
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24h

export interface NoteAutosaveSnapshot {
  title: string;
  content: string;
  description?: string;
  savedAt: number;
}

/**
 * Lightweight localStorage autosave for the note editor.
 * Writes a snapshot every 5s when content changes; older than 24h is ignored.
 */
export const useNoteAutosave = (
  noteId: string | undefined,
  snapshot: Omit<NoteAutosaveSnapshot, 'savedAt'>,
  enabled = true,
) => {
  const lastSerialized = useRef<string>('');

  useEffect(() => {
    if (!enabled || !noteId) return;
    const serialized = JSON.stringify(snapshot);
    if (serialized === lastSerialized.current) return;
    const handle = setTimeout(() => {
      try {
        localStorage.setItem(
          KEY(noteId),
          JSON.stringify({ ...snapshot, savedAt: Date.now() }),
        );
        lastSerialized.current = serialized;
      } catch {
        // quota — ignore
      }
    }, 5000);
    return () => clearTimeout(handle);
  }, [noteId, snapshot, enabled]);
};

export const readNoteAutosave = (noteId: string): NoteAutosaveSnapshot | null => {
  try {
    const raw = localStorage.getItem(KEY(noteId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as NoteAutosaveSnapshot;
    if (!parsed?.savedAt || Date.now() - parsed.savedAt > MAX_AGE_MS) {
      localStorage.removeItem(KEY(noteId));
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const clearNoteAutosave = (noteId: string) => {
  try { localStorage.removeItem(KEY(noteId)); } catch { /* noop */ }
};
