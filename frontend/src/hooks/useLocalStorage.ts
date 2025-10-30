/**
 * 🗄️ Hook de LocalStorage Avancé - Cardify
 * Auteur: Shaya Coca
 * Description: Hook React pour la gestion sécurisée du localStorage avec chiffrement
 */

import { useState, useEffect, useCallback } from 'react';

interface UseLocalStorageOptions {
  encrypt?: boolean;
  expirationTime?: number; // en millisecondes
  syncAcrossTabs?: boolean;
}

interface StorageItem<T> {
  value: T;
  timestamp: number;
  expiration?: number;
}

// Clé de chiffrement simple (en production, utiliser une vraie clé)
const ENCRYPTION_KEY = 'cardify-storage-key';

/**
 * Chiffrement simple XOR (pour la démo - utiliser crypto-js en production)
 */
const simpleEncrypt = (text: string): string => {
  return btoa(text.split('').map((char, i) => 
    String.fromCharCode(char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length))
  ).join(''));
};

const simpleDecrypt = (encryptedText: string): string => {
  try {
    return atob(encryptedText).split('').map((char, i) => 
      String.fromCharCode(char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length))
    ).join('');
  } catch {
    return '';
  }
};

export const useLocalStorage = <T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions = {}
) => {
  const {
    encrypt = false,
    expirationTime,
    syncAcrossTabs = true
  } = options;

  // État pour stocker la valeur
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;

      let parsedItem: StorageItem<T>;
      
      if (encrypt) {
        const decryptedItem = simpleDecrypt(item);
        parsedItem = JSON.parse(decryptedItem);
      } else {
        parsedItem = JSON.parse(item);
      }

      // Vérifier l'expiration
      if (parsedItem.expiration && Date.now() > parsedItem.expiration) {
        window.localStorage.removeItem(key);
        return initialValue;
      }

      return parsedItem.value;
    } catch (error) {
      console.warn(`Erreur lecture localStorage pour "${key}":`, error);
      return initialValue;
    }
  });

  // Fonction pour définir la valeur
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      const storageItem: StorageItem<T> = {
        value: valueToStore,
        timestamp: Date.now(),
        expiration: expirationTime ? Date.now() + expirationTime : undefined
      };

      let itemToStore = JSON.stringify(storageItem);
      
      if (encrypt) {
        itemToStore = simpleEncrypt(itemToStore);
      }

      window.localStorage.setItem(key, itemToStore);

      // Déclencher un événement personnalisé pour la synchronisation
      if (syncAcrossTabs) {
        window.dispatchEvent(new CustomEvent('cardify-storage-change', {
          detail: { key, value: valueToStore }
        }));
      }
    } catch (error) {
      console.error(`Erreur écriture localStorage pour "${key}":`, error);
    }
  }, [key, storedValue, encrypt, expirationTime, syncAcrossTabs]);

  // Fonction pour supprimer la valeur
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
      
      if (syncAcrossTabs) {
        window.dispatchEvent(new CustomEvent('cardify-storage-change', {
          detail: { key, value: null }
        }));
      }
    } catch (error) {
      console.error(`Erreur suppression localStorage pour "${key}":`, error);
    }
  }, [key, initialValue, syncAcrossTabs]);

  // Fonction pour vérifier si la valeur existe
  const hasValue = useCallback(() => {
    return window.localStorage.getItem(key) !== null;
  }, [key]);

  // Fonction pour obtenir les métadonnées
  const getMetadata = useCallback(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return null;

      let parsedItem: StorageItem<T>;
      
      if (encrypt) {
        const decryptedItem = simpleDecrypt(item);
        parsedItem = JSON.parse(decryptedItem);
      } else {
        parsedItem = JSON.parse(item);
      }

      return {
        timestamp: parsedItem.timestamp,
        expiration: parsedItem.expiration,
        age: Date.now() - parsedItem.timestamp,
        isExpired: parsedItem.expiration ? Date.now() > parsedItem.expiration : false
      };
    } catch {
      return null;
    }
  }, [key, encrypt]);

  // Écouter les changements de storage (synchronisation entre onglets)
  useEffect(() => {
    if (!syncAcrossTabs) return;

    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      if (e instanceof StorageEvent) {
        // Changement natif du localStorage
        if (e.key === key && e.newValue !== null) {
          try {
            let parsedItem: StorageItem<T>;
            
            if (encrypt) {
              const decryptedItem = simpleDecrypt(e.newValue);
              parsedItem = JSON.parse(decryptedItem);
            } else {
              parsedItem = JSON.parse(e.newValue);
            }

            setStoredValue(parsedItem.value);
          } catch (error) {
            console.warn(`Erreur synchronisation localStorage pour "${key}":`, error);
          }
        }
      } else {
        // Événement personnalisé
        const detail = (e as CustomEvent).detail;
        if (detail.key === key) {
          setStoredValue(detail.value || initialValue);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cardify-storage-change', handleStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cardify-storage-change', handleStorageChange as EventListener);
    };
  }, [key, initialValue, encrypt, syncAcrossTabs]);

  // Nettoyage automatique des éléments expirés
  useEffect(() => {
    const cleanup = () => {
      const metadata = getMetadata();
      if (metadata?.isExpired) {
        removeValue();
      }
    };

    // Vérifier immédiatement
    cleanup();

    // Vérifier périodiquement
    const interval = setInterval(cleanup, 60000); // Toutes les minutes

    return () => clearInterval(interval);
  }, [getMetadata, removeValue]);

  return {
    value: storedValue,
    setValue,
    removeValue,
    hasValue,
    getMetadata,
    // Utilitaires
    isExpired: getMetadata()?.isExpired || false,
    age: getMetadata()?.age || 0
  };
};

/**
 * Hook spécialisé pour les préférences utilisateur
 */
export const useUserPreferences = () => {
  return useLocalStorage('cardify-user-preferences', {
    theme: 'light' as 'light' | 'dark' | 'auto',
    language: 'fr' as 'fr' | 'en' | 'he',
    notifications: true,
    autoSave: true,
    compactMode: false,
    performanceMode: false
  }, {
    encrypt: false,
    syncAcrossTabs: true
  });
};

/**
 * Hook spécialisé pour le cache de session
 */
export const useSessionCache = <T>(key: string, initialValue: T) => {
  return useLocalStorage(key, initialValue, {
    encrypt: false,
    expirationTime: 24 * 60 * 60 * 1000, // 24 heures
    syncAcrossTabs: false
  });
};

/**
 * Hook spécialisé pour les données sensibles
 */
export const useSecureStorage = <T>(key: string, initialValue: T) => {
  return useLocalStorage(key, initialValue, {
    encrypt: true,
    expirationTime: 7 * 24 * 60 * 60 * 1000, // 7 jours
    syncAcrossTabs: true
  });
};

export default useLocalStorage;
