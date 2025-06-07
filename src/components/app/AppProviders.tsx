
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/auth';
import { QueryProvider } from './QueryProvider';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { ReactNode } from 'react';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <QueryProvider>
      <BrowserRouter>
        <AuthProvider>
          {children}
          <Toaster />
          <SonnerToaster />
        </AuthProvider>
      </BrowserRouter>
    </QueryProvider>
  );
};
