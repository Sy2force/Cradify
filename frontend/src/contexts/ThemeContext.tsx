import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Theme } from '@/types';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    // Récupérer le thème depuis localStorage ou utiliser 'system' par défaut
    try {
      const storedTheme = localStorage.getItem('cardify_theme') as Theme;
      if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
        setTheme(storedTheme);
      }
    } catch (error) {
      // Fallback si localStorage n'est pas disponible (SSR, etc.)
      console.warn('Cannot access localStorage:', error);
    }
  }, []);

  useEffect(() => {
    // Vérifier que nous sommes côté client
    if (typeof window === 'undefined') return;
    
    // Appliquer le thème au document
    const root = window.document.documentElement;
    
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Sauvegarder dans localStorage
    try {
      localStorage.setItem('cardify_theme', theme);
    } catch (error) {
      console.warn('Cannot save theme to localStorage:', error);
    }
  }, [theme]);

  // Écouter les changements de préférence système
  useEffect(() => {
    // Vérifier que nous sommes côté client
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        const root = window.document.documentElement;
        if (e.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    // Utiliser la méthode moderne avec fallback
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Fallback pour les anciens navigateurs
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [theme]);

  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const value = {
    theme,
    setTheme,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
