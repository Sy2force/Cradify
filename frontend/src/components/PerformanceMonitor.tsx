import { useEffect } from 'react';

// Extension globale pour TypeScript
declare global {
  interface Window {
    cardifyAnalytics?: {
      track: (event: string, data: Record<string, unknown>) => void;
    };
    gtag?: (command: string, targetId: string, config?: Record<string, unknown>) => void;
  }
}

// Fonction utilitaire pour logger les métriques
const logMetric = (name: string, value: number): void => {
  if (typeof window !== 'undefined' && window.cardifyAnalytics) {
    window.cardifyAnalytics.track('performance_metric', {
      metric: name,
      value,
      timestamp: Date.now(),
    });
  }
  
  // Log en développement
  if (process.env.NODE_ENV === 'development') {
    console.log(`Performance Metric - ${name}:`, value);
  }
};

// Hook pour surveiller les performances
export function usePerformanceMonitor(): void {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Monitor page load performance
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        if (loadTime > 0) {
          logMetric('page_load_time', loadTime);
        }
      }

      // Monitor memory usage (if available)
      if ('memory' in performance) {
        const memory = (performance as unknown as { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
        if (memory) {
          logMetric('memory_used', memory.usedJSHeapSize);
          logMetric('memory_total', memory.totalJSHeapSize);
          logMetric('memory_limit', memory.jsHeapSizeLimit);
        }
      }

      // Monitor long tasks (if supported)
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
              if (entry.duration > 50) { // Tasks longer than 50ms
                logMetric('long_task', entry.duration);
              }
            });
          });
          observer.observe({ entryTypes: ['longtask'] });

          return () => observer.disconnect();
        } catch (error) {
          console.warn('Performance observer not supported:', error);
        }
      }

      // Basic analytics tracking
      if (typeof window.gtag !== 'undefined') {
        window.gtag('event', 'page_view', {
          page_title: document.title,
          page_location: window.location.href,
        });
      }
    }
    
    return undefined;
  }, []);
}

// Component to include in App.tsx
export default function PerformanceMonitor() {
  usePerformanceMonitor();
  return null;
}
