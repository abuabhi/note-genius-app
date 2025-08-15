// Stub file for missing integration
export const useNotionAuth = () => ({
  isConnected: false,
  connect: () => Promise.resolve(),
  disconnect: () => Promise.resolve(),
  isLoading: false,
});

export const notionOAuth = {
  getAuthUrl: () => '',
  handleCallback: () => Promise.resolve(null),
};