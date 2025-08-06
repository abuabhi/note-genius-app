// Bundle size optimization utilities

/**
 * Check current bundle size and recommend optimizations
 */
export const analyzeBundleSize = (): {
  estimatedSize: number;
  recommendations: string[];
  isWithinBudget: boolean;
} => {
  // Estimate bundle size based on loaded scripts
  const scripts = document.querySelectorAll('script[src]');
  let totalSize = 0;
  
  scripts.forEach(script => {
    // Rough estimation based on script tags
    totalSize += 200; // KB per script (rough estimate)
  });
  
  const recommendations: string[] = [];
  const BUDGET_KB = 1000; // 1MB budget
  
  if (totalSize > BUDGET_KB) {
    recommendations.push('Consider lazy loading admin components');
    recommendations.push('Implement code splitting for routes');
    recommendations.push('Optimize image assets');
    recommendations.push('Remove unused dependencies');
  }
  
  if (totalSize > BUDGET_KB * 1.5) {
    recommendations.push('CRITICAL: Bundle size exceeds 1.5MB');
    recommendations.push('Implement aggressive tree shaking');
    recommendations.push('Use dynamic imports for large libraries');
  }
  
  return {
    estimatedSize: totalSize,
    recommendations,
    isWithinBudget: totalSize <= BUDGET_KB
  };
};

/**
 * Monitor and log bundle performance
 */
export const monitorBundlePerformance = (): void => {
  if (process.env.NODE_ENV === 'production') return;
  
  const { estimatedSize, recommendations, isWithinBudget } = analyzeBundleSize();
  
  console.group('📦 Bundle Analysis');
  console.log(`Estimated size: ${estimatedSize}KB`);
  console.log(`Within budget: ${isWithinBudget ? '✅' : '❌'}`);
  
  if (recommendations.length > 0) {
    console.warn('Recommendations:');
    recommendations.forEach(rec => console.log(`  • ${rec}`));
  }
  
  console.groupEnd();
};

/**
 * Preload critical resources
 */
export const preloadCriticalResources = (): void => {
  // Preload critical CSS
  const criticalCSS = document.querySelector('link[rel="stylesheet"]');
  if (criticalCSS) {
    const preload = document.createElement('link');
    preload.rel = 'preload';
    preload.as = 'style';
    preload.href = criticalCSS.getAttribute('href') || '';
    document.head.appendChild(preload);
  }
  
  // Preload critical fonts (if any)
  const fonts = [
    // Add your critical fonts here
  ];
  
  fonts.forEach(font => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.href = font;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};