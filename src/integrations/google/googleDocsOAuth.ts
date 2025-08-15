// Stub file for missing integration
export const useGoogleDocsAuth = () => ({
  isConnected: false,
  connect: () => Promise.resolve(),
  disconnect: () => Promise.resolve(),
  isLoading: false,
  isAuthenticated: false,
  accessToken: null,
  userName: null,
  loading: false,
  error: null,
});

export const googleDocsOAuth = {
  getAuthUrl: () => '',
  handleCallback: () => Promise.resolve(null),
};