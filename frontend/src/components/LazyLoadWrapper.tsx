/**
 * 🔄 Lazy Load Wrapper - Cardify
 * Auteur: Shaya Coca
 * Description: Composant wrapper pour le lazy loading intelligent avec Intersection Observer
 */

import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyLoadWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  threshold?: number;
  triggerOnce?: boolean;
  onLoad?: () => void;
  className?: string;
  minHeight?: string;
}

const LazyLoadWrapper: React.FC<LazyLoadWrapperProps> = ({
  children,
  fallback,
  rootMargin = '50px',
  threshold = 0.1,
  triggerOnce = true,
  onLoad,
  className = '',
  minHeight = '200px'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

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
      // Simuler un délai de chargement pour les animations
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isVisible, isLoaded]);

  const defaultFallback = (
    <div 
      className="flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg"
      style={{ minHeight }}
    >
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
        <p className="text-sm text-gray-600 dark:text-gray-400">Chargement...</p>
      </div>
    </div>
  );

  return (
    <div 
      ref={elementRef}
      className={`lazy-load-wrapper ${className}`}
      style={{ minHeight: isVisible ? 'auto' : minHeight }}
    >
      {isVisible ? (
        <div className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
          {children}
        </div>
      ) : (
        fallback || defaultFallback
      )}
    </div>
  );
};

export default LazyLoadWrapper;
