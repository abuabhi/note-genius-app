// Stub file for missing integration
export const useNotionAuth = () => ({
  isConnected: false,
  connect: () => Promise.resolve(),
  disconnect: () => Promise.resolve(),
  isLoading: false,
  isAuthenticated: false,
  accessToken: null,
  workspaceName: null,
  loading: false,
  error: null,
});

export const notionOAuth = {
  getAuthUrl: () => '',
  handleCallback: () => Promise.resolve(null),
};