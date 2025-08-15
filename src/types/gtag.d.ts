// Google Analytics Global Site Tag (gtag) type declarations

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'set' | 'event' | 'js',
      targetIdOrEventName: string | Date,
      parameters?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }
}

export {};