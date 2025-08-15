// Stub file for missing integration
export const useGoogleDocsAuth = () => ({
  isConnected: false,
  connect: () => Promise.resolve(),
  disconnect: () => Promise.resolve(),
  isLoading: false,
});

export const googleDocsOAuth = {
  getAuthUrl: () => '',
  handleCallback: () => Promise.resolve(null),
};