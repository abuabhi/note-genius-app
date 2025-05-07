
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const EvernoteAuthCallback = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Get the query parameters from the URL
    const params = new URLSearchParams(window.location.search);
    
    const oauth_token = params.get('oauth_token');
    const oauth_verifier = params.get('oauth_verifier');
    const state = params.get('state');
    const error = params.get('error');
    
    // Verify state parameter to prevent CSRF attacks
    const storedState = localStorage.getItem('evernote_auth_state');
    
    // Send data back to the opener window
    if (window.opener) {
      window.opener.postMessage({
        type: 'evernote_oauth_callback',
        code: oauth_verifier || oauth_token, // Either verifier or token depending on OAuth version
        state,
        error,
        stateValid: state === storedState
      }, window.location.origin);
      
      // Clean up the stored state
      localStorage.removeItem('evernote_auth_state');
      
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
        <h1 className="text-xl font-semibold mb-2">Authenticating with Evernote...</h1>
        <p className="text-muted-foreground">Please wait, you will be redirected automatically.</p>
      </div>
    </div>
  );
};

export default EvernoteAuthCallback;
