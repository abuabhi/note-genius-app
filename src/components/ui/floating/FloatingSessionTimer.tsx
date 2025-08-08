import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SessionTimer } from '@/components/ui/sidebar/SessionTimer';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface FloatingSessionTimerProps {
  isCollapsed: boolean;
}

// Persisted position type
interface Position { x: number; y: number }

const STORAGE_KEY = 'sessionTimer.position';

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

      {/* Timer body */}
      <div className="rounded-b-md border border-t-0 border-border bg-background shadow-xl ring-1 ring-primary/20 backdrop-blur">
        <SessionTimer isCollapsed={isCollapsed} />
      </div>
    </div>
  );
};
