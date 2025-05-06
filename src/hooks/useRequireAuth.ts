
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const useRequireAuth = (redirectTo = '/login') => {
  const { user, loading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && !user) {
      navigate(redirectTo);
    } else if (!loading && user) {
      setIsAuthorized(true);
    }
  }, [user, loading, navigate, redirectTo]);

  return { isAuthorized, loading, user };
};
