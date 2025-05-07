
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const GoogleDocsAuthCallback = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Get the query parameters from the URL
    const params = new URLSearchParams(window.location.search);
    
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');
    const errorDescription = params.get('error_description');
    
    // Verify state parameter to prevent CSRF attacks
    const storedState = localStorage.getItem('googleDocs_auth_state');
    
    // Send data back to the opener window
    if (window.opener) {
      window.opener.postMessage({
        type: 'googledocs_oauth_callback',
        code,
        state,
        error,
        errorDescription,
        stateValid: state === storedState
      }, window.location.origin);
      
      // Clean up the stored state
      localStorage.removeItem('googleDocs_auth_state');
      
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
        <h1 className="text-xl font-semibold mb-2">Authenticating with Google...</h1>
        <p className="text-muted-foreground">Please wait, you will be redirected automatically.</p>
      </div>
    </div>
  );
};

export default GoogleDocsAuthCallback;
