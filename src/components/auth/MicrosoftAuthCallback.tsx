
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export const MicrosoftAuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing authentication...');
  
  useEffect(() => {
    // Get the hash fragment from the URL
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');
    const errorDescription = params.get('error_description');
    
    if (error) {
      setStatus('error');
      setMessage(errorDescription || error || 'Authentication failed');
      
      // Send error back to opener window
      if (window.opener) {
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
      setStatus('success');
      setMessage('Authentication successful! Redirecting...');
      
      // Send success data back to the opener window
      if (window.opener) {
        window.opener.postMessage({
          type: 'microsoft_oauth_callback',
          code,
          state
        }, window.location.origin);
        
        // Close this popup window after a brief delay
        setTimeout(() => window.close(), 1000);
      } else {
        // If opener is not available (e.g., redirect flow)
        // Redirect back to the app
        setTimeout(() => navigate('/notes'), 2000);
      }
    } else {
      setStatus('error');
      setMessage('Invalid authentication response');
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
