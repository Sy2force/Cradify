import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import type { Notification, NotificationContextType } from './NotificationTypes';
import { NotificationContext } from './NotificationContextDefinition';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const stored = localStorage.getItem('cardify_notifications');
    return stored ? JSON.parse(stored) : [];
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  // Persist notifications to localStorage
  useEffect(() => {
    localStorage.setItem('cardify_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep max 50 notifications

    // Show toast notification
    const toastOptions = {
      duration: 4000,
      position: 'top-right' as const,
    };

    switch (notification.type) {
      case 'success':
        toast.success(notification.title, toastOptions);
        break;
      case 'error':
        toast.error(notification.title, toastOptions);
        break;
      case 'warning':
        toast.error(notification.title, toastOptions); // Use error styling for warnings
        break;
      default:
        toast(notification.title, toastOptions);
    }
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Simulate real-time notifications (in a real app, this would be WebSocket/SSE)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random notifications for demo purposes
      const notifications = [
        {
          type: 'info' as const,
          title: '🎉 Nouvelle carte créée !',
          message: 'Un utilisateur vient de créer une nouvelle carte business',
        },
        {
          type: 'success' as const,
          title: '👍 Votre carte a reçu un like !',
          message: 'Votre carte "Consultant Marketing" a été aimée',
          actionUrl: '/cards',
          actionText: 'Voir mes cartes'
        },
        {
          type: 'info' as const,
          title: '📈 Statistiques mises à jour',
          message: 'Vos stats de la semaine sont disponibles',
          actionUrl: '/stats',
          actionText: 'Voir les stats'
        },
        {
          type: 'warning' as const,
          title: '⚠️ Profil incomplet',
          message: 'Complétez votre profil pour améliorer votre visibilité',
          actionUrl: '/profile',
          actionText: 'Compléter'
        }
      ];

      // Add notification randomly (20% chance every 30 seconds)
      if (Math.random() < 0.2) {
        const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
        addNotification(randomNotification);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [addNotification]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
