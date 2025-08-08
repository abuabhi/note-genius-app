import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SessionTimer } from '@/components/ui/sidebar/SessionTimer';
import { Button } from '@/components/ui/button';
import { RotateCcw, Maximize2, Minimize2 } from 'lucide-react';
import { useUnifiedSessionTracker } from '@/hooks/useUnifiedSessionTracker';
interface FloatingSessionTimerProps {
  isCollapsed: boolean;
}

// Persisted position type
interface Position { x: number; y: number }

const STORAGE_KEY = 'sessionTimer.position';
const DOCK_KEY = 'sessionTimer.docked';
const AWAY_TIP_KEY = 'sessionTimer.awayTip.dismissed';

export const FloatingSessionTimer: React.FC<FloatingSessionTimerProps> = ({ isCollapsed }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const dragOffsetRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  const getDefaultPosition = (): Position => {
    const marginLeft = 16;
    const bottomSafe = 120; // keep controls clear of bottom edge
    const approxHeight = isCollapsed ? 80 : 176; // estimated component height
    if (typeof window === 'undefined') {
      return { x: marginLeft, y: 16 };
    }
    const y = Math.max(16, window.innerHeight - approxHeight - bottomSafe);
    return { x: marginLeft, y };
  };

  const [pos, setPos] = useState<Position>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Position;
    } catch {}
    return getDefaultPosition();
  });

  const [docked, setDocked] = useState<boolean>(() => {
    try { return localStorage.getItem(DOCK_KEY) === '1'; } catch { return false; }
  });

  const [awayTipDismissed, setAwayTipDismissed] = useState<boolean>(() => {
    try { return localStorage.getItem(AWAY_TIP_KEY) === '1'; } catch { return false; }
  });

  const { isActive } = useUnifiedSessionTracker();

  const clampToViewport = useCallback((next: Position): Position => {
    const margin = 8;
    const width = containerRef.current?.offsetWidth ?? 260;
    const height = containerRef.current?.offsetHeight ?? (isCollapsed ? 80 : 160);
    const maxX = (window.innerWidth - width - margin);
    const maxY = (window.innerHeight - height - margin);
    return {
      x: Math.min(Math.max(next.x, margin), Math.max(maxX, margin)),
      y: Math.min(Math.max(next.y, margin), Math.max(maxY, margin)),
    };
  }, [isCollapsed]);

  // Save position
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
  }, [pos]);

  // Re-clamp on resize
  useEffect(() => {
    const onResize = () => setPos(p => clampToViewport(p));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [clampToViewport]);

  // Clamp on mount and when layout changes (e.g., sidebar collapse)
  useEffect(() => {
    setPos(p => clampToViewport(p));
  }, [clampToViewport, isCollapsed]);

  // Persist docked state
  useEffect(() => {
    localStorage.setItem(DOCK_KEY, docked ? '1' : '0');
  }, [docked]);

  // Persist away-tip dismissed state
  useEffect(() => {
    localStorage.setItem(AWAY_TIP_KEY, awayTipDismissed ? '1' : '0');
  }, [awayTipDismissed]);
  const onPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    const rect = containerRef.current?.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const offsetX = rect ? startX - rect.left : 0;
    const offsetY = rect ? startY - rect.top : 0;
    dragOffsetRef.current = { dx: offsetX, dy: offsetY };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const next = clampToViewport({ x: e.clientX - dragOffsetRef.current.dx, y: e.clientY - dragOffsetRef.current.dy });
    setPos(next);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    draggingRef.current = false;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  const resetPosition = () => setPos(getDefaultPosition());

  return (
    <>
      {docked ? (
        <div
          ref={containerRef}
          className="fixed inset-x-0 bottom-0 z-50 select-none drop-shadow-2xl"
        >
          {isActive && !awayTipDismissed && (
            <div className="mx-4 mb-2 rounded-md border border-border bg-background/95 shadow ring-1 ring-primary/20 px-3 py-2 text-xs flex items-start justify-between gap-3">
              <span className="text-foreground/80 leading-snug">
                <span className="font-medium">Away protection</span>: auto-pause after 30m<br />auto-stop after 60m when inactive.
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-foreground/70 hover:text-foreground"
                onClick={() => setAwayTipDismissed(true)}
                aria-label="Dismiss away tip"
              >
                Don't show again
              </Button>
            </div>
          )}
          <div className="mx-4 mb-4 rounded-md border border-border bg-background shadow-xl ring-1 ring-primary/20 backdrop-blur">
            <div className="flex items-center justify-between px-2 py-0.5">
              <span className="text-[11px] text-foreground/70">Study Session</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-foreground/70 hover:text-foreground"
                onClick={() => setDocked(false)}
                aria-label="Undock timer"
              >
                <Minimize2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="px-2 py-2">
              <SessionTimer isCollapsed={false} hideIcon stripStudyPlanPrefix hideSubject emphasizeTime />
            </div>
          </div>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="fixed z-50 select-none drop-shadow-2xl"
          style={{ left: pos.x, top: pos.y }}
        >
          {/* Drag handle and reset button */}
          <div
            className="flex items-center justify-between px-2 py-1 rounded-t-md bg-background border border-b-0 border-border cursor-move backdrop-blur shadow-md ring-1 ring-primary/20"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            <span className="text-xs text-foreground/70">Move</span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-foreground/70 hover:text-foreground"
                onClick={() => setDocked(true)}
                aria-label="Dock timer to bottom"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-foreground/70 hover:text-foreground"
                onClick={resetPosition}
                aria-label="Reset timer position"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isActive && !awayTipDismissed && (
            <div className="px-2 py-1 text-[11px] text-foreground/75 bg-background border-x border-border">
              Away protection: auto-pause after 30m and auto-stop after 60m when inactive.
              <button
                className="ml-2 underline hover:no-underline"
                onClick={() => setAwayTipDismissed(true)}
                aria-label="Dismiss away tip"
              >
                Don't show again
              </button>
            </div>
          )}

          {/* Timer body */}
          <div className="rounded-b-md border border-t-0 border-border bg-background shadow-xl ring-1 ring-primary/20 backdrop-blur">
            <SessionTimer isCollapsed={isCollapsed} hideIcon stripStudyPlanPrefix hideSubject emphasizeTime />
          </div>
        </div>
      )}
    </>
  );
};
