
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import { publicRoutes } from '@/routes/publicRoutes';
import { standardRoutes } from '@/routes/standardRoutes';
import { adminRoutes } from '@/routes/adminRoutes';
import { authCallbackRoutes } from '@/routes/authCallbackRoutes';
import { miscRoutes } from '@/routes/miscRoutes';
import { Suspense } from 'react';
import { useAuth } from '@/contexts/auth';
import { SidebarProvider } from '@/components/ui/sidebar';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { useRequireAuth, UserTier } from '@/hooks/useRequireAuth';
import { FlashcardProvider } from '@/contexts/flashcards/index.tsx';
import { OptimizedNotesProvider } from '@/contexts/OptimizedNotesContext';

// Minimal, non-flashing fallback. A full skeleton on every navigation made
// transitions feel like a 1-2s reload even when chunks are cached.
const RouteFallback = () => (
  <div className="min-h-[40vh] flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mint-600" />
  </div>
);

const FullPageLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-600" />
  </div>
);

const AppRoutes = () => {
  const { user, loading } = useAuth();

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (loading) return <FullPageLoader />;
    return user ? (
      <SidebarProvider>
        {/* Hoisted providers: keep their cache alive across page navigations
            so revisiting /flashcards or /notes is instant instead of refetching. */}
        <FlashcardProvider>
          <OptimizedNotesProvider>
            <SidebarLayout>{children}</SidebarLayout>
          </OptimizedNotesProvider>
        </FlashcardProvider>
      </SidebarProvider>
    ) : <Navigate to="/login" />;
  };

  const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { userProfile, loading } = useRequireAuth();
    if (loading) return <FullPageLoader />;
    return userProfile?.user_tier === UserTier.DEAN ? <>{children}</> : <Navigate to="/dashboard" />;
  };

  if (loading) return <FullPageLoader />;

  return (
    <Routes>
      {/* Public routes */}
      {publicRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={<Suspense fallback={<RouteFallback />}>{route.element}</Suspense>}
        />
      ))}

      {/* Login */}
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />

      {/* Auth callbacks */}
      {authCallbackRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={<Suspense fallback={<RouteFallback />}>{route.element}</Suspense>}
        />
      ))}

      {/* Protected standard routes */}
      {standardRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <ProtectedRoute>
              <Suspense fallback={<RouteFallback />}>{route.element}</Suspense>
            </ProtectedRoute>
          }
        />
      ))}

      {/* Protected admin routes */}
      {adminRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <ProtectedRoute>
              <AdminProtectedRoute>
                <Suspense fallback={<RouteFallback />}>{route.element}</Suspense>
              </AdminProtectedRoute>
            </ProtectedRoute>
          }
        />
      ))}

      {/* Misc */}
      {miscRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            route.path === '*' ? route.element : (
              <ProtectedRoute>
                <Suspense fallback={<RouteFallback />}>{route.element}</Suspense>
              </ProtectedRoute>
            )
          }
        />
      ))}
    </Routes>
  );
};

export default AppRoutes;
