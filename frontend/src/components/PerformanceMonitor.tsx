/**
 * 📊 Composant de Monitoring de Performance - Cardify
 * Auteur: Shaya Coca
 * Description: Composant React pour afficher les métriques de performance en temps réel
 */

import React, { useState } from 'react';
import { Activity, Zap, Database, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { usePerformance } from '../hooks/usePerformance';

interface PerformanceMonitorProps {
  className?: string;
  showDetails?: boolean;
  onMetricsUpdate?: (metrics: any) => void;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  minimized?: boolean;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  className = '',
  showDetails = false,
  onMetricsUpdate,
  position = 'bottom-right',
  minimized = false
}) => {
  const [isExpanded, setIsExpanded] = useState(!minimized);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const {
    metrics,
    memoryUsage,
    cacheHitRate,
    performanceScore,
    memoryStatus,
    cacheEfficiency,
    isLoading
  } = usePerformance();

  const getPositionClasses = (pos: string) => {
    const classes = {
      'top-left': 'fixed top-4 left-4 z-50',
      'top-right': 'fixed top-4 right-4 z-50',
      'bottom-left': 'fixed bottom-4 left-4 z-50',
      'bottom-right': 'fixed bottom-4 right-4 z-50'
    };
    return classes[pos as keyof typeof classes] || classes['bottom-right'];
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getMemoryColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getCacheColor = (efficiency: string) => {
    switch (efficiency) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className={`performance-monitor ${getPositionClasses(position)} ${className}`}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 animate-pulse" />
            <span className="text-sm">Chargement des métriques...</span>
          </div>
        </div>
      </div>
    );
  }

  onMetricsUpdate?.({
    ...metrics,
    memoryUsage,
    cacheHitRate,
    renderCount: 0
  });

  return (
    <div className={`performance-monitor ${getPositionClasses(position)} ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div 
          className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">Performance</span>
            <div className={`w-2 h-2 rounded-full ${getScoreColor(performanceScore)}`} />
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-xs font-bold ${getScoreColor(performanceScore)}`}>
              {performanceScore}
            </span>
            <button className="text-gray-400 hover:text-gray-600">
              {isExpanded ? '−' : '+'}
            </button>
          </div>
        </div>

        {/* Content */}
        {isExpanded && (
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            {/* Métriques principales */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Zap className="w-3 h-3 text-yellow-500 mr-1" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">FCP</span>
                </div>
                <div className="text-sm font-mono">
                  {metrics?.fcp ? `${Math.round(metrics.fcp)}ms` : '--'}
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Clock className="w-3 h-3 text-blue-500 mr-1" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">LCP</span>
                </div>
                <div className="text-sm font-mono">
                  {metrics?.lcp ? `${Math.round(metrics.lcp)}ms` : '--'}
                </div>
              </div>
            </div>

            {/* Mémoire et Cache */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Database className={`w-3 h-3 mr-1 ${getMemoryColor(memoryStatus)}`} />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Mémoire</span>
                </div>
                <div className="text-sm font-mono">
                  {memoryUsage.toFixed(1)}%
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <TrendingUp className={`w-3 h-3 mr-1 ${getCacheColor(cacheEfficiency)}`} />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Cache</span>
                </div>
                <div className="text-sm font-mono">
                  {cacheHitRate.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex space-x-2">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex-1 px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                {showAdvanced ? 'Masquer' : 'Détails'}
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-2 py-1 text-xs bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                Actualiser
              </button>
            </div>

            {/* Métriques avancées */}
            {(showDetails || showAdvanced) && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-2">
                  {metrics?.fid && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">FID:</span>
                      <span className="font-mono">{Math.round(metrics.fid)}ms</span>
                    </div>
                  )}
                  {metrics?.cls && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">CLS:</span>
                      <span className="font-mono">{metrics.cls.toFixed(3)}</span>
                    </div>
                  )}
                  {metrics?.ttfb && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">TTFB:</span>
                      <span className="font-mono">{Math.round(metrics.ttfb)}ms</span>
                    </div>
                  )}
                </div>

                {/* Alertes de performance */}
                {(performanceScore < 70 || memoryStatus === 'critical') && (
                  <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                    <div className="flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3 text-red-500" />
                      <span className="text-xs text-red-600 dark:text-red-400">
                        Performance dégradée
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceMonitor;
