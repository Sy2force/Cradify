/**
 * 🔄 Lazy Load Wrapper - Cardify
 * Auteur: Shaya Coca
 * Description: Composant wrapper pour le lazy loading intelligent avec Intersection Observer
 */

import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import styles from './LazyLoadWrapper.module.css';

interface LazyLoadWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  threshold?: number;
  triggerOnce?: boolean;
  onLoad?: () => void;
  className?: string;
  minHeight?: number;
}

const LazyLoadWrapper: React.FC<LazyLoadWrapperProps> = ({
  children,
  fallback,
  rootMargin = '50px',
  threshold = 0.1,
  triggerOnce = true,
  onLoad,
  className = '',
  minHeight: _minHeight = 200
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  // Détecter le mode sombre
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    // Observer les changements de classe sur l'élément html
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          onLoad?.();
          
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        rootMargin,
        threshold
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [rootMargin, threshold, triggerOnce, onLoad]);

  useEffect(() => {
    if (isVisible && !isLoaded) {
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isVisible, isLoaded]);

  const defaultFallback = (
    <div 
      className={`${styles.fallbackContainer} ${isDarkMode ? styles.dark : ''}`}
    >
      <div className={styles.fallbackContent}>
        <Loader2 className={styles.fallbackSpinner} />
        <p className={`${styles.fallbackText} ${isDarkMode ? styles.dark : ''}`}>
          Chargement...
        </p>
      </div>
    </div>
  );

  return (
    <div 
      ref={elementRef}
      className={`${styles.lazyLoadWrapper} ${className}`}
      data-visible={isVisible}
    >
      {isVisible ? (
        <div className={`${styles.contentWrapper} ${isLoaded ? styles.contentVisible : styles.contentHidden}`}>
          {children}
        </div>
      ) : (
        fallback || defaultFallback
      )}
    </div>
  );
};

export default LazyLoadWrapper;
