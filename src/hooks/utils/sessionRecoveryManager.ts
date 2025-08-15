// Singleton Session Recovery Manager to prevent multiple recovery attempts
export class SessionRecoveryManager {
  private static instance: SessionRecoveryManager;
  private isRecovering = false;
  private recoveryPromise: Promise<any> | null = null;
  private lastRecoveryTime = 0;
  private readonly RECOVERY_DEBOUNCE_MS = 2000;

  static getInstance(): SessionRecoveryManager {
    if (!SessionRecoveryManager.instance) {
      SessionRecoveryManager.instance = new SessionRecoveryManager();
    }
    return SessionRecoveryManager.instance;
  }

  async attemptRecovery(recoveryFn: () => Promise<any>): Promise<any> {
    const now = Date.now();
    
    // Debounce recovery attempts
    if (now - this.lastRecoveryTime < this.RECOVERY_DEBOUNCE_MS) {
      console.log('🔄 [RECOVERY MANAGER] Recovery attempt debounced');
      return this.recoveryPromise;
    }

    // Return existing promise if recovery is in progress
    if (this.isRecovering && this.recoveryPromise) {
      console.log('🔄 [RECOVERY MANAGER] Recovery already in progress, returning existing promise');
      return this.recoveryPromise;
    }

    this.isRecovering = true;
    this.lastRecoveryTime = now;
    
    this.recoveryPromise = recoveryFn()
      .finally(() => {
        this.isRecovering = false;
        this.recoveryPromise = null;
      });

    return this.recoveryPromise;
  }

  reset() {
    this.isRecovering = false;
    this.recoveryPromise = null;
    this.lastRecoveryTime = 0;
  }

  get isInProgress() {
    return this.isRecovering;
  }
}