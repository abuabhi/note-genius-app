
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { LightweightPerformanceOverlay } from '@/components/performance/LightweightPerformanceOverlay';
import { useOptimizedSessionTracker } from '@/hooks/session/useOptimizedSessionTracker';
import { useOptimizedCache } from '@/hooks/performance/useOptimizedCache';
import { SessionDock } from '@/components/ui/floating/SessionDock';

interface OptimizedLayoutProps {
  children?: React.ReactNode;
}

export const OptimizedLayout = ({ children }: OptimizedLayoutProps) => {
  // Initialize optimized systems
  useOptimizedCache();
  const sessionTracker = useOptimizedSessionTracker();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {children || <Outlet />}
        </main>
      </div>
      
      {/* Optimized floating components */}
      {sessionTracker.isActive && <SessionDock />}
      
      {/* Lightweight performance monitoring */}
      <LightweightPerformanceOverlay />
    </div>
  );
};
