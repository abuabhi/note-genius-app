export interface VersionInfo {
  version: string;
  buildTime: string;
  buildHash: string;
  environment: string;
  gitCommit?: string;
  fullVersion: string;
}

// Version information injected at build time by Vite
declare const __VERSION__: string;
declare const __BUILD_TIME__: string;
declare const __BUILD_HASH__: string;
declare const __GIT_COMMIT__: string | undefined;

/**
 * Get comprehensive version information for the application
 */
export const getVersionInfo = (): VersionInfo => {
  const version = typeof __VERSION__ !== 'undefined' ? __VERSION__ : '1.0.0';
  const buildTime = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : new Date().toISOString();
  const buildHash = typeof __BUILD_HASH__ !== 'undefined' ? __BUILD_HASH__ : 'dev-build';
  const gitCommit = typeof __GIT_COMMIT__ !== 'undefined' ? __GIT_COMMIT__ : undefined;
  
  const environment = import.meta.env.MODE || 'development';
  
  // Create full version string
  let fullVersion = `v${version}`;
  
  if (environment === 'development') {
    fullVersion += '-dev';
  } else if (environment === 'staging') {
    fullVersion += '-staging';
  }
  
  fullVersion += ` (${buildHash})`;
  
  if (gitCommit) {
    fullVersion += ` [${gitCommit.substring(0, 7)}]`;
  }
  
  return {
    version,
    buildTime,
    buildHash,
    environment,
    gitCommit,
    fullVersion
  };
};

/**
 * Log version information to console
 */
export const logVersionInfo = (): void => {
  const versionInfo = getVersionInfo();
  
  console.group('🚀 Application Version Information');
  console.log(`Version: ${versionInfo.version}`);
  console.log(`Environment: ${versionInfo.environment}`);
  console.log(`Build Time: ${new Date(versionInfo.buildTime).toLocaleString()}`);
  console.log(`Build Hash: ${versionInfo.buildHash}`);
  if (versionInfo.gitCommit) {
    console.log(`Git Commit: ${versionInfo.gitCommit}`);
  }
  console.log(`Full Version: ${versionInfo.fullVersion}`);
  console.groupEnd();
};

/**
 * Get a short version string for display in UI
 */
export const getShortVersion = (): string => {
  const versionInfo = getVersionInfo();
  return `v${versionInfo.version}`;
};

/**
 * Check if this is the latest version deployed
 */
export const checkVersionStatus = async (): Promise<{
  isLatest: boolean;
  currentVersion: string;
  deployedVersion?: string;
}> => {
  const currentVersion = getVersionInfo().fullVersion;
  
  // In a real implementation, this would check against a version endpoint
  // For now, we'll assume it's the latest version
  return {
    isLatest: true,
    currentVersion,
    deployedVersion: currentVersion
  };
};