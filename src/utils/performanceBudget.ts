
interface PerformanceBudget {
  maxBundleSize: number; // in KB
  maxInitialLoad: number; // in ms
  maxTTI: number; // Time to Interactive in ms
  maxFCP: number; // First Contentful Paint in ms
  maxLCP: number; // Largest Contentful Paint in ms
  maxCLS: number; // Cumulative Layout Shift
  maxFID: number; // First Input Delay in ms
}

const PERFORMANCE_BUDGETS: PerformanceBudget = {
  maxBundleSize: 1000, // 1MB
  maxInitialLoad: 3000, // 3s
  maxTTI: 5000, // 5s
  maxFCP: 1800, // 1.8s
  maxLCP: 2500, // 2.5s
  maxCLS: 0.1, // 0.1 CLS score
  maxFID: 100, // 100ms
};

export class PerformanceBudgetMonitor {
  private violations: string[] = [];

  checkBundleSize(actualSize: number): boolean {
    const isWithinBudget = actualSize <= PERFORMANCE_BUDGETS.maxBundleSize;
    if (!isWithinBudget) {
      this.violations.push(`Bundle size ${actualSize}KB exceeds budget of ${PERFORMANCE_BUDGETS.maxBundleSize}KB`);
    }
    return isWithinBudget;
  }

  checkWebVitals(): void {
    if (typeof window === 'undefined') return;

    // Check LCP (Largest Contentful Paint)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry.startTime > PERFORMANCE_BUDGETS.maxLCP) {
        this.violations.push(`LCP ${Math.round(lastEntry.startTime)}ms exceeds budget of ${PERFORMANCE_BUDGETS.maxLCP}ms`);
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Check FCP (First Contentful Paint)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry && fcpEntry.startTime > PERFORMANCE_BUDGETS.maxFCP) {
        this.violations.push(`FCP ${Math.round(fcpEntry.startTime)}ms exceeds budget of ${PERFORMANCE_BUDGETS.maxFCP}ms`);
      }
    }).observe({ entryTypes: ['paint'] });

    // Check CLS (Cumulative Layout Shift)
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      if (clsValue > PERFORMANCE_BUDGETS.maxCLS) {
        this.violations.push(`CLS ${clsValue.toFixed(3)} exceeds budget of ${PERFORMANCE_BUDGETS.maxCLS}`);
      }
    }).observe({ entryTypes: ['layout-shift'] });

    // Check FID (First Input Delay)
    new PerformanceObserver((list) => {
      const firstInput = list.getEntries()[0];
      if (firstInput && (firstInput as any).processingStart - firstInput.startTime > PERFORMANCE_BUDGETS.maxFID) {
        const fid = (firstInput as any).processingStart - firstInput.startTime;
        this.violations.push(`FID ${Math.round(fid)}ms exceeds budget of ${PERFORMANCE_BUDGETS.maxFID}ms`);
      }
    }).observe({ entryTypes: ['first-input'] });
  }

  getBudgetReport(): {
    budgets: PerformanceBudget;
    violations: string[];
    isWithinBudget: boolean;
  } {
    return {
      budgets: PERFORMANCE_BUDGETS,
      violations: [...this.violations],
      isWithinBudget: this.violations.length === 0,
    };
  }

  clearViolations(): void {
    this.violations = [];
  }
}

export const performanceBudgetMonitor = new PerformanceBudgetMonitor();

// Auto-initialize Web Vitals monitoring
if (typeof window !== 'undefined') {
  performanceBudgetMonitor.checkWebVitals();
}
