/**
 * 📊 Système de Monitoring Avancé - Cardify
 * Auteur: Shaya Coca
 * Description: Monitoring en temps réel des performances, erreurs et métriques utilisateur
 */

// Types pour le monitoring
export interface ErrorReport {
  id: string;
  timestamp: number;
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  userId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
}

export interface PerformanceReport {
  id: string;
  timestamp: number;
  metrics: {
    fcp: number;
    lcp: number;
    fid: number;
    cls: number;
    ttfb: number;
  };
  navigation: {
    loadTime: number;
    domContentLoaded: number;
    firstByte: number;
  };
  resources: Array<{
    name: string;
    duration: number;
    size: number;
    type: string;
  }>;
  memory?: {
    used: number;
    total: number;
    limit: number;
  };
}

export interface UserActivity {
  id: string;
  timestamp: number;
  event: string;
  page: string;
  userId?: string;
  sessionId: string;
  duration?: number;
  metadata?: Record<string, any>;
}

/**
 * Gestionnaire d'erreurs global
 */
export class ErrorMonitor {
  private errors: ErrorReport[] = [];
  private maxErrors = 100;
  private reportUrl?: string;

  constructor(reportUrl?: string) {
    this.reportUrl = reportUrl;
    this.setupGlobalHandlers();
  }

  /**
   * Configuration des gestionnaires d'erreurs globaux
   */
  private setupGlobalHandlers(): void {
    // Erreurs JavaScript non gérées
    window.addEventListener('error', (event) => {
      this.captureError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename || window.location.href,
        line: event.lineno,
        column: event.colno
      });
    });

    // Promesses rejetées non gérées
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href
      });
    });

    // Erreurs de ressources (images, scripts, etc.)
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.captureError({
          message: `Resource loading error: ${(event.target as any)?.src || (event.target as any)?.href}`,
          url: window.location.href,
          severity: 'medium'
        });
      }
    }, true);
  }

  /**
   * Capturer une erreur
   */
  captureError(error: Partial<ErrorReport>): void {
    const errorReport: ErrorReport = {
      id: this.generateId(),
      timestamp: Date.now(),
      message: error.message || 'Unknown error',
      stack: error.stack,
      url: error.url || window.location.href,
      userAgent: navigator.userAgent,
      userId: this.getCurrentUserId(),
      severity: error.severity || 'medium',
      context: {
        ...error.context,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        connection: (navigator as any).connection ? {
          effectiveType: (navigator as any).connection.effectiveType,
          downlink: (navigator as any).connection.downlink
        } : undefined
      }
    };

    this.errors.push(errorReport);
    
    // Limiter le nombre d'erreurs stockées
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Envoyer au serveur si configuré
    if (this.reportUrl) {
      this.sendErrorReport(errorReport);
    }

    // Log en console pour le développement
    if (process.env.NODE_ENV === 'development') {
      console.error('Error captured:', errorReport);
    }
  }

  /**
   * Envoyer un rapport d'erreur au serveur
   */
  private async sendErrorReport(error: ErrorReport): Promise<void> {
    try {
      await fetch(this.reportUrl!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(error)
      });
    } catch (err) {
      console.warn('Failed to send error report:', err);
    }
  }

  /**
   * Obtenir l'ID utilisateur actuel
   */
  private getCurrentUserId(): string | undefined {
    try {
      const token = localStorage.getItem('cardify-auth-token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId || payload._id;
      }
    } catch {
      return undefined;
    }
  }

  /**
   * Générer un ID unique
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Obtenir toutes les erreurs
   */
  getErrors(): ErrorReport[] {
    return [...this.errors];
  }

  /**
   * Obtenir les erreurs par sévérité
   */
  getErrorsBySeverity(severity: ErrorReport['severity']): ErrorReport[] {
    return this.errors.filter(error => error.severity === severity);
  }

  /**
   * Vider les erreurs
   */
  clearErrors(): void {
    this.errors = [];
  }
}

/**
 * Moniteur de performance
 */
export class PerformanceMonitor {
  private reports: PerformanceReport[] = [];
  private maxReports = 50;
  private reportUrl?: string;
  private observer?: PerformanceObserver;

  constructor(reportUrl?: string) {
    this.reportUrl = reportUrl;
    this.setupPerformanceObserver();
  }

  /**
   * Configuration de l'observateur de performance
   */
  private setupPerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            this.captureNavigationMetrics(entry as PerformanceNavigationTiming);
          }
        }
      });

      this.observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
    }
  }

  /**
   * Capturer les métriques de navigation
   */
  private captureNavigationMetrics(entry: PerformanceNavigationTiming): void {
    const report: PerformanceReport = {
      id: this.generateId(),
      timestamp: Date.now(),
      metrics: {
        fcp: this.getFCP(),
        lcp: this.getLCP(),
        fid: this.getFID(),
        cls: this.getCLS(),
        ttfb: entry.responseStart - entry.requestStart
      },
      navigation: {
        loadTime: entry.loadEventEnd - entry.loadEventStart,
        domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
        firstByte: entry.responseStart - entry.requestStart
      },
      resources: this.getResourceMetrics(),
      memory: this.getMemoryMetrics()
    };

    this.reports.push(report);
    
    if (this.reports.length > this.maxReports) {
      this.reports = this.reports.slice(-this.maxReports);
    }

    if (this.reportUrl) {
      this.sendPerformanceReport(report);
    }
  }

  /**
   * Obtenir First Contentful Paint
   */
  private getFCP(): number {
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
    return fcpEntry ? fcpEntry.startTime : 0;
  }

  /**
   * Obtenir Largest Contentful Paint
   */
  private getLCP(): number {
    return new Promise((resolve) => {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry ? lastEntry.startTime : 0);
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    }) as any;
  }

  /**
   * Obtenir First Input Delay
   */
  private getFID(): number {
    return new Promise((resolve) => {
      new PerformanceObserver((entryList) => {
        const firstEntry = entryList.getEntries()[0] as any;
        resolve(firstEntry ? firstEntry.processingStart - firstEntry.startTime : 0);
      }).observe({ entryTypes: ['first-input'] });
    }) as any;
  }

  /**
   * Obtenir Cumulative Layout Shift
   */
  private getCLS(): number {
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
    }).observe({ entryTypes: ['layout-shift'] });
    return clsValue;
  }

  /**
   * Obtenir les métriques des ressources
   */
  private getResourceMetrics(): Array<{ name: string; duration: number; size: number; type: string }> {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    return resources.slice(-20).map(resource => ({
      name: resource.name.split('/').pop() || resource.name,
      duration: resource.duration,
      size: resource.transferSize || 0,
      type: this.getResourceType(resource.name)
    }));
  }

  /**
   * Obtenir les métriques mémoire
   */
  private getMemoryMetrics(): { used: number; total: number; limit: number } | undefined {
    const memory = (performance as any).memory;
    if (memory) {
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      };
    }
    return undefined;
  }

  /**
   * Déterminer le type de ressource
   */
  private getResourceType(url: string): string {
    if (url.match(/\.(css)$/)) return 'CSS';
    if (url.match(/\.(js)$/)) return 'JavaScript';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'Image';
    if (url.match(/\.(woff|woff2|ttf|otf)$/)) return 'Font';
    if (url.includes('/api/')) return 'API';
    return 'Other';
  }

  /**
   * Envoyer un rapport de performance
   */
  private async sendPerformanceReport(report: PerformanceReport): Promise<void> {
    try {
      await fetch(this.reportUrl!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(report)
      });
    } catch (err) {
      console.warn('Failed to send performance report:', err);
    }
  }

  /**
   * Générer un ID unique
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Obtenir tous les rapports
   */
  getReports(): PerformanceReport[] {
    return [...this.reports];
  }

  /**
   * Nettoyer l'observateur
   */
  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

/**
 * Moniteur d'activité utilisateur
 */
export class UserActivityMonitor {
  private activities: UserActivity[] = [];
  private sessionId: string;
  private maxActivities = 200;
  private reportUrl?: string;
  private currentPage: string;
  private pageStartTime: number;

  constructor(reportUrl?: string) {
    this.reportUrl = reportUrl;
    this.sessionId = this.generateSessionId();
    this.currentPage = window.location.pathname;
    this.pageStartTime = Date.now();
    this.setupEventListeners();
  }

  /**
   * Configuration des écouteurs d'événements
   */
  private setupEventListeners(): void {
    // Navigation
    window.addEventListener('popstate', () => {
      this.trackPageChange();
    });

    // Clics
    document.addEventListener('click', (event) => {
      this.trackClick(event);
    });

    // Soumission de formulaires
    document.addEventListener('submit', (event) => {
      this.trackFormSubmit(event);
    });

    // Temps passé sur la page
    window.addEventListener('beforeunload', () => {
      this.trackPageDuration();
    });

    // Visibilité de la page
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackActivity('page_hidden');
      } else {
        this.trackActivity('page_visible');
      }
    });
  }

  /**
   * Suivre un changement de page
   */
  private trackPageChange(): void {
    this.trackPageDuration();
    
    const newPage = window.location.pathname;
    this.trackActivity('page_view', {
      from: this.currentPage,
      to: newPage
    });
    
    this.currentPage = newPage;
    this.pageStartTime = Date.now();
  }

  /**
   * Suivre la durée sur une page
   */
  private trackPageDuration(): void {
    const duration = Date.now() - this.pageStartTime;
    this.trackActivity('page_duration', {
      page: this.currentPage,
      duration
    });
  }

  /**
   * Suivre un clic
   */
  private trackClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const tagName = target.tagName.toLowerCase();
    const className = target.className;
    const id = target.id;
    const text = target.textContent?.slice(0, 50);

    this.trackActivity('click', {
      tagName,
      className,
      id,
      text,
      x: event.clientX,
      y: event.clientY
    });
  }

  /**
   * Suivre une soumission de formulaire
   */
  private trackFormSubmit(event: SubmitEvent): void {
    const form = event.target as HTMLFormElement;
    const formId = form.id;
    const formClass = form.className;
    const action = form.action;

    this.trackActivity('form_submit', {
      formId,
      formClass,
      action
    });
  }

  /**
   * Suivre une activité générique
   */
  trackActivity(event: string, metadata?: Record<string, any>): void {
    const activity: UserActivity = {
      id: this.generateId(),
      timestamp: Date.now(),
      event,
      page: this.currentPage,
      userId: this.getCurrentUserId(),
      sessionId: this.sessionId,
      metadata
    };

    this.activities.push(activity);
    
    if (this.activities.length > this.maxActivities) {
      this.activities = this.activities.slice(-this.maxActivities);
    }

    if (this.reportUrl) {
      this.sendActivityReport(activity);
    }
  }

  /**
   * Envoyer un rapport d'activité
   */
  private async sendActivityReport(activity: UserActivity): Promise<void> {
    try {
      await fetch(this.reportUrl!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(activity)
      });
    } catch (err) {
      console.warn('Failed to send activity report:', err);
    }
  }

  /**
   * Obtenir l'ID utilisateur actuel
   */
  private getCurrentUserId(): string | undefined {
    try {
      const token = localStorage.getItem('cardify-auth-token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId || payload._id;
      }
    } catch {
      return undefined;
    }
  }

  /**
   * Générer un ID de session
   */
  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Générer un ID unique
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Obtenir toutes les activités
   */
  getActivities(): UserActivity[] {
    return [...this.activities];
  }

  /**
   * Obtenir les activités par type
   */
  getActivitiesByEvent(event: string): UserActivity[] {
    return this.activities.filter(activity => activity.event === event);
  }
}

/**
 * Gestionnaire de monitoring global
 */
export class MonitoringManager {
  private errorMonitor: ErrorMonitor;
  private performanceMonitor: PerformanceMonitor;
  private activityMonitor: UserActivityMonitor;

  constructor(options: {
    errorReportUrl?: string;
    performanceReportUrl?: string;
    activityReportUrl?: string;
  } = {}) {
    this.errorMonitor = new ErrorMonitor(options.errorReportUrl);
    this.performanceMonitor = new PerformanceMonitor(options.performanceReportUrl);
    this.activityMonitor = new UserActivityMonitor(options.activityReportUrl);
  }

  /**
   * Capturer une erreur manuellement
   */
  captureError(error: Partial<ErrorReport>): void {
    this.errorMonitor.captureError(error);
  }

  /**
   * Suivre une activité utilisateur
   */
  trackActivity(event: string, metadata?: Record<string, any>): void {
    this.activityMonitor.trackActivity(event, metadata);
  }

  /**
   * Obtenir toutes les métriques
   */
  getAllMetrics(): {
    errors: ErrorReport[];
    performance: PerformanceReport[];
    activities: UserActivity[];
  } {
    return {
      errors: this.errorMonitor.getErrors(),
      performance: this.performanceMonitor.getReports(),
      activities: this.activityMonitor.getActivities()
    };
  }

  /**
   * Nettoyer tous les moniteurs
   */
  cleanup(): void {
    this.performanceMonitor.disconnect();
  }
}

// Instance globale du monitoring
export const monitoring = new MonitoringManager({
  errorReportUrl: '/api/monitoring/errors',
  performanceReportUrl: '/api/monitoring/performance',
  activityReportUrl: '/api/monitoring/activities'
});

export default monitoring;
