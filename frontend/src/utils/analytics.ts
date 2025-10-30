/**
 * 📊 Système d'Analytics Avancé - Cardify
 * Auteur: Shaya Coca
 * Description: Analytics et tracking des événements utilisateur avec respect de la vie privée
 */

// Types pour les événements analytics
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
}

export interface UserProperties {
  userId?: string;
  email?: string;
  plan?: 'free' | 'premium' | 'business';
  signupDate?: string;
  lastActive?: string;
  preferences?: Record<string, any>;
}

export interface PageViewEvent {
  page: string;
  title?: string;
  referrer?: string;
  duration?: number;
}

/**
 * Gestionnaire d'analytics avec respect de la vie privée
 */
export class Analytics {
  private events: AnalyticsEvent[] = [];
  private userProperties: UserProperties = {};
  private sessionId: string;
  private isEnabled: boolean = true;
  private apiEndpoint?: string;
  private maxEvents: number = 1000;
  private flushInterval: number = 30000; // 30 secondes
  private flushTimer?: NodeJS.Timeout;

  constructor(options: {
    apiEndpoint?: string;
    maxEvents?: number;
    flushInterval?: number;
    respectDoNotTrack?: boolean;
  } = {}) {
    this.apiEndpoint = options.apiEndpoint;
    this.maxEvents = options.maxEvents || 1000;
    this.flushInterval = options.flushInterval || 30000;
    this.sessionId = this.generateSessionId();

    // Respecter Do Not Track
    if (options.respectDoNotTrack && navigator.doNotTrack === '1') {
      this.isEnabled = false;
      console.log('Analytics désactivé: Do Not Track détecté');
      return;
    }

    // Vérifier le consentement RGPD
    this.checkGDPRConsent();
    
    // Démarrer le flush automatique
    this.startAutoFlush();
    
    // Écouter les événements de navigation
    this.setupNavigationTracking();
  }

  /**
   * Vérifier le consentement RGPD
   */
  private checkGDPRConsent(): void {
    const consent = localStorage.getItem('cardify-analytics-consent');
    if (consent === 'false') {
      this.isEnabled = false;
      console.log('Analytics désactivé: Consentement refusé');
    }
  }

  /**
   * Demander le consentement RGPD
   */
  requestConsent(): Promise<boolean> {
    return new Promise((resolve) => {
      // En production, afficher une vraie modal de consentement
      const consent = confirm(
        'Acceptez-vous que Cardify collecte des données d\'usage anonymes pour améliorer l\'expérience utilisateur ?'
      );
      
      localStorage.setItem('cardify-analytics-consent', consent.toString());
      this.isEnabled = consent;
      
      resolve(consent);
    });
  }

  /**
   * Configuration du tracking de navigation
   */
  private setupNavigationTracking(): void {
    if (!this.isEnabled) return;

    let startTime = Date.now();
    let currentPage = window.location.pathname;

    // Page initiale
    this.trackPageView({
      page: currentPage,
      title: document.title,
      referrer: document.referrer
    });

    // Changements de page (SPA)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = (...args) => {
      this.trackPageDuration(currentPage, Date.now() - startTime);
      originalPushState.apply(history, args);
      
      currentPage = window.location.pathname;
      startTime = Date.now();
      
      this.trackPageView({
        page: currentPage,
        title: document.title
      });
    };

    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      
      currentPage = window.location.pathname;
      this.trackPageView({
        page: currentPage,
        title: document.title
      });
    };

    // Événement popstate (bouton retour)
    window.addEventListener('popstate', () => {
      this.trackPageDuration(currentPage, Date.now() - startTime);
      
      currentPage = window.location.pathname;
      startTime = Date.now();
      
      this.trackPageView({
        page: currentPage,
        title: document.title
      });
    });

    // Temps passé sur la page avant fermeture
    window.addEventListener('beforeunload', () => {
      this.trackPageDuration(currentPage, Date.now() - startTime);
      this.flush(); // Envoyer les données avant fermeture
    });
  }

  /**
   * Suivre une page vue
   */
  trackPageView(event: PageViewEvent): void {
    this.track('page_view', {
      page: event.page,
      title: event.title,
      referrer: event.referrer,
      url: window.location.href,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    });
  }

  /**
   * Suivre la durée sur une page
   */
  private trackPageDuration(page: string, duration: number): void {
    if (duration > 1000) { // Ignorer les durées très courtes
      this.track('page_duration', {
        page,
        duration,
        durationFormatted: this.formatDuration(duration)
      });
    }
  }

  /**
   * Suivre un événement générique
   */
  track(eventName: string, properties: Record<string, any> = {}): void {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        // Ajouter des propriétés contextuelles
        userAgent: navigator.userAgent,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screen: {
          width: screen.width,
          height: screen.height,
          colorDepth: screen.colorDepth
        },
        connection: (navigator as any).connection ? {
          effectiveType: (navigator as any).connection.effectiveType,
          downlink: (navigator as any).connection.downlink
        } : undefined
      },
      timestamp: Date.now(),
      userId: this.userProperties.userId,
      sessionId: this.sessionId
    };

    this.events.push(event);

    // Limiter le nombre d'événements en mémoire
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log en développement
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', eventName, properties);
    }
  }

  /**
   * Définir les propriétés utilisateur
   */
  setUserProperties(properties: UserProperties): void {
    this.userProperties = { ...this.userProperties, ...properties };
  }

  /**
   * Identifier un utilisateur
   */
  identify(userId: string, properties?: UserProperties): void {
    this.userProperties.userId = userId;
    if (properties) {
      this.setUserProperties(properties);
    }

    this.track('user_identified', {
      userId,
      ...properties
    });
  }

  /**
   * Suivre les événements de cartes
   */
  trackCardEvent(action: string, cardData?: any): void {
    this.track(`card_${action}`, {
      cardId: cardData?.id,
      cardType: cardData?.type,
      timestamp: Date.now()
    });
  }

  /**
   * Suivre les événements d'authentification
   */
  trackAuthEvent(action: 'login' | 'logout' | 'signup' | 'password_reset', data?: any): void {
    this.track(`auth_${action}`, {
      method: data?.method,
      provider: data?.provider,
      timestamp: Date.now()
    });
  }

  /**
   * Suivre les erreurs
   */
  trackError(error: Error, context?: Record<string, any>): void {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      context,
      url: window.location.href,
      timestamp: Date.now()
    });
  }

  /**
   * Suivre les performances
   */
  trackPerformance(metrics: Record<string, number>): void {
    this.track('performance', {
      ...metrics,
      timestamp: Date.now()
    });
  }

  /**
   * Démarrer le flush automatique
   */
  private startAutoFlush(): void {
    if (!this.isEnabled || !this.apiEndpoint) return;

    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * Envoyer les événements au serveur
   */
  async flush(): Promise<void> {
    if (!this.isEnabled || !this.apiEndpoint || this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = []; // Vider la queue

    try {
      await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          events: eventsToSend,
          userProperties: this.userProperties,
          sessionId: this.sessionId
        })
      });

      console.log(`📊 ${eventsToSend.length} événements analytics envoyés`);
    } catch (error) {
      console.warn('Erreur envoi analytics:', error);
      // Remettre les événements dans la queue
      this.events.unshift(...eventsToSend);
    }
  }

  /**
   * Obtenir les événements locaux
   */
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  /**
   * Obtenir les statistiques de session
   */
  getSessionStats(): {
    sessionId: string;
    eventsCount: number;
    userProperties: UserProperties;
    isEnabled: boolean;
  } {
    return {
      sessionId: this.sessionId,
      eventsCount: this.events.length,
      userProperties: this.userProperties,
      isEnabled: this.isEnabled
    };
  }

  /**
   * Désactiver le tracking
   */
  disable(): void {
    this.isEnabled = false;
    this.events = [];
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    localStorage.setItem('cardify-analytics-consent', 'false');
  }

  /**
   * Activer le tracking
   */
  enable(): void {
    this.isEnabled = true;
    localStorage.setItem('cardify-analytics-consent', 'true');
    this.startAutoFlush();
  }

  /**
   * Nettoyer les ressources
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush(); // Dernier envoi
  }

  /**
   * Générer un ID de session
   */
  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Formater une durée en millisecondes
   */
  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }
}

// Instance globale d'analytics
export const analytics = new Analytics({
  apiEndpoint: '/api/analytics/events',
  respectDoNotTrack: true,
  maxEvents: 500,
  flushInterval: 30000
});

// Utilitaires pour les événements courants
export const trackEvent = {
  // Navigation
  pageView: (page: string, title?: string) => 
    analytics.trackPageView({ page, title }),

  // Cartes
  cardCreated: (cardData: any) => 
    analytics.trackCardEvent('created', cardData),
  cardViewed: (cardData: any) => 
    analytics.trackCardEvent('viewed', cardData),
  cardShared: (cardData: any) => 
    analytics.trackCardEvent('shared', cardData),
  cardDeleted: (cardData: any) => 
    analytics.trackCardEvent('deleted', cardData),

  // Authentification
  login: (method?: string) => 
    analytics.trackAuthEvent('login', { method }),
  logout: () => 
    analytics.trackAuthEvent('logout'),
  signup: (method?: string) => 
    analytics.trackAuthEvent('signup', { method }),

  // Interactions
  buttonClick: (buttonName: string, context?: any) =>
    analytics.track('button_click', { buttonName, context }),
  formSubmit: (formName: string, success: boolean) =>
    analytics.track('form_submit', { formName, success }),
  search: (query: string, resultsCount: number) =>
    analytics.track('search', { query, resultsCount }),

  // Erreurs
  error: (error: Error, context?: any) =>
    analytics.trackError(error, context),

  // Performance
  performance: (metrics: Record<string, number>) =>
    analytics.trackPerformance(metrics)
};

export default analytics;
