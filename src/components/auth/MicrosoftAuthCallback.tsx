
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export const MicrosoftAuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing authentication...');
  
  useEffect(() => {
    console.log('Microsoft callback component loaded');
    console.log('Current URL:', window.location.href);
    console.log('Hash:', window.location.hash);
    console.log('Search:', window.location.search);
    
    // Check both hash and search params for the OAuth response
    let params: URLSearchParams;
    
    // First try to get from hash (fragment)
    if (window.location.hash) {
      const hash = window.location.hash.substring(1);
      console.log('Processing hash params:', hash);
      params = new URLSearchParams(hash);
    } else if (window.location.search) {
      // Fallback to search params
      console.log('Processing search params:', window.location.search);
      params = new URLSearchParams(window.location.search);
    } else {
      console.log('No params found in URL');
      params = new URLSearchParams();
    }
    
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');
    const errorDescription = params.get('error_description');
    
    console.log('Parsed params:', { code: code?.substring(0, 20) + '...', state, error, errorDescription });
    
    if (error) {
      console.error('OAuth error:', error, errorDescription);
      setStatus('error');
      setMessage(errorDescription || error || 'Authentication failed');
      
      // Send error back to opener window
      if (window.opener) {
        console.log('Sending error to opener window');
        window.opener.postMessage({
          type: 'microsoft_oauth_callback',
          error,
          errorDescription
        }, window.location.origin);
        
        setTimeout(() => window.close(), 2000);
      } else {
        setTimeout(() => navigate('/notes'), 3000);
      }
      return;
    }
    
    if (code && state) {
      console.log('OAuth success, sending data to opener');
      setStatus('success');
      setMessage('Authentication successful! Redirecting...');
      
      // Send success data back to the opener window
      if (window.opener) {
        console.log('Posting message to opener window');
        window.opener.postMessage({
          type: 'microsoft_oauth_callback',
          code,
          state
        }, window.location.origin);
        
        // Close this popup window after a brief delay
        setTimeout(() => {
          console.log('Closing popup window');
          window.close();
        }, 1000);
      } else {
        // If opener is not available (e.g., redirect flow)
        console.log('No opener window, redirecting to notes');
        setTimeout(() => navigate('/notes'), 2000);
      }
    } else {
      console.error('Missing required parameters:', { code: !!code, state: !!state });
      setStatus('error');
      setMessage('Invalid authentication response - missing code or state parameter');
      setTimeout(() => {
        if (window.opener) {
          window.close();
        } else {
          navigate('/notes');
        }
      }, 3000);
    }
  }, [navigate]);
  
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
        <div className="mb-4">
          {status === 'processing' && (
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
          )}
          {status === 'success' && (
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
          )}
          {status === 'error' && (
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          )}
        </div>
        
        <h1 className="text-xl font-semibold mb-2">
          {status === 'processing' && 'Authenticating with Microsoft...'}
          {status === 'success' && 'Authentication Successful!'}
          {status === 'error' && 'Authentication Failed'}
        </h1>
        
        <p className="text-muted-foreground">
          {message}
        </p>
        
        {status !== 'processing' && (
          <div className="mt-4 text-sm text-gray-500">
            {window.opener ? 'This window will close automatically.' : 'You will be redirected shortly.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default MicrosoftAuthCallback;
