
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const MicrosoftAuthCallback = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Get the hash fragment from the URL
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');
    const errorDescription = params.get('error_description');
    
    // Send data back to the opener window
    if (window.opener) {
      window.opener.postMessage({
        type: 'microsoft_oauth_callback',
        code,
        state,
        error,
        errorDescription
      }, window.location.origin);
      
      // Close this popup window
      window.close();
    } else {
      // If opener is not available (e.g., redirect flow)
      // Redirect back to the app
      navigate('/notes');
    }
  }, [navigate]);
  
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-xl font-semibold mb-2">Authenticating with Microsoft...</h1>
        <p className="text-muted-foreground">Please wait, you will be redirected automatically.</p>
      </div>
    </div>
  );
};

export default MicrosoftAuthCallback;
