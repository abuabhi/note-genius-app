// Stub file for missing integration
export const useEvernoteAuth = () => ({
  isConnected: false,
  connect: () => Promise.resolve(),
  disconnect: () => Promise.resolve(),
  isLoading: false,
});

export const evernoteOAuth = {
  getAuthUrl: () => '',
  handleCallback: () => Promise.resolve(null),
};