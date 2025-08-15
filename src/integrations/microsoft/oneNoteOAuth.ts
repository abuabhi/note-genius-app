// Stub file for missing integration
export const useOneNoteAuth = () => ({
  isConnected: false,
  connect: () => Promise.resolve(),
  disconnect: () => Promise.resolve(),
  isLoading: false,
});

export const oneNoteOAuth = {
  getAuthUrl: () => '',
  handleCallback: () => Promise.resolve(null),
};