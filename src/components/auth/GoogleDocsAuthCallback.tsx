
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const GoogleDocsAuthCallback = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log('🔄 GoogleDocsAuthCallback: Starting OAuth callback processing');
    
    // Get the query parameters from the URL
    const params = new URLSearchParams(window.location.search);
    
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');
    const errorDescription = params.get('error_description');
    
    console.log('📝 OAuth params:', { 
      hasCode: !!code, 
      hasState: !!state, 
      error, 
      errorDescription,
      currentUrl: window.location.href
    });
    
    // Verify state parameter to prevent CSRF attacks
    const storedState = localStorage.getItem('googleDocs_auth_state');
    console.log('🔐 State verification:', { 
      receivedState: state, 
      storedState: storedState, 
      stateValid: state === storedState 
    });
    
    const authData = {
      type: 'googledocs_oauth_callback',
      code,
      state,
      error,
      errorDescription,
      stateValid: state === storedState
    };
    
    // Try to send data back to the opener window
    if (window.opener && !window.opener.closed) {
      console.log('✅ Popup communication: Sending auth data to parent window');
      try {
        window.opener.postMessage(authData, window.location.origin);
        
        // Clean up the stored state
        localStorage.removeItem('googleDocs_auth_state');
        
        // Close this popup window after a small delay to ensure message is received
        setTimeout(() => {
          console.log('🔒 Closing popup window');
          window.close();
        }, 500);
        
      } catch (err) {
        console.error('❌ Failed to send message to parent window:', err);
        // Still try to close the popup
        setTimeout(() => window.close(), 1000);
      }
    } else {
      console.log('⚠️ No valid opener window found - storing auth data for retrieval');
      
      // Store auth result for parent window to retrieve
      const authResult = {
        ...authData,
        timestamp: Date.now()
      };
      
      try {
        localStorage.setItem('googleDocs_auth_result', JSON.stringify(authResult));
        console.log('💾 Stored auth result in localStorage for parent retrieval');
        
        // Clean up the stored state
        localStorage.removeItem('googleDocs_auth_state');
        
        // Instead of navigating (which would refresh the page and close dialogs),
        // show a message and attempt to close
        setTimeout(() => {
          console.log('🔒 Attempting to close callback window');
          if (window.close) {
            window.close();
          } else {
            // If we can't close, show instructions
            document.body.innerHTML = `
              <div style="text-align: center; padding: 40px; font-family: system-ui;">
                <h2>Authentication Complete</h2>
                <p>You can close this window and return to the application.</p>
                <button onclick="window.close()" style="padding: 10px 20px; margin-top: 20px;">Close Window</button>
              </div>
            `;
          }
        }, 1000);
        
      } catch (storageErr) {
        console.error('❌ Failed to store auth result:', storageErr);
        // Last resort - show completion message
        setTimeout(() => {
          document.body.innerHTML = `
            <div style="text-align: center; padding: 40px; font-family: system-ui;">
              <h2>Authentication Complete</h2>
              <p>Please close this window and try the import again.</p>
              <button onclick="window.close()" style="padding: 10px 20px; margin-top: 20px;">Close Window</button>
            </div>
          `;
        }, 1000);
      }
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
