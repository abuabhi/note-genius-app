// Stub file for missing integration
export const useEvernoteAuth = () => ({
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

export const evernoteOAuth = {
  getAuthUrl: () => '',
  handleCallback: () => Promise.resolve(null),
};