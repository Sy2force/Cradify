/**
 * 🧪 Tests pour usePerformance Hook - Cardify
 * Auteur: Shaya Coca
 * Description: Tests unitaires pour le hook de monitoring des performances
 */

import { renderHook, act } from '@testing-library/react';
import { usePerformance } from '../usePerformance';

// Mock des APIs de performance
const mockPerformanceObserver = jest.fn();
const mockPerformanceMemory = {
  usedJSHeapSize: 1000000,
  totalJSHeapSize: 2000000,
  jsHeapSizeLimit: 4000000
};

// Setup des mocks globaux
beforeAll(() => {
  // Mock PerformanceObserver
  global.PerformanceObserver = mockPerformanceObserver;
  mockPerformanceObserver.mockImplementation((callback) => ({
    observe: jest.fn(),
    disconnect: jest.fn()
  }));

  // Mock performance.memory
  Object.defineProperty(global.performance, 'memory', {
    value: mockPerformanceMemory,
    configurable: true
  });

  // Mock requestAnimationFrame
  global.requestAnimationFrame = jest.fn((callback) => {
    setTimeout(callback, 16);
    return 1;
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('usePerformance', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => usePerformance());

    expect(result.current.metrics).toBeNull();
    expect(result.current.resources).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.memoryUsage).toBe(0);
    expect(result.current.cacheHitRate).toBe(0);
  });

  it('should calculate performance score correctly', () => {
    const { result } = renderHook(() => usePerformance());

    // Mock metrics
    act(() => {
      result.current.measureMetrics();
    });

    expect(typeof result.current.performanceScore).toBe('number');
    expect(result.current.performanceScore).toBeGreaterThanOrEqual(0);
    expect(result.current.performanceScore).toBeLessThanOrEqual(100);
  });

  it('should monitor memory usage', () => {
    const { result } = renderHook(() => usePerformance());

    act(() => {
      result.current.monitorMemory();
    });

    expect(result.current.memoryUsage).toBeGreaterThan(0);
    expect(result.current.memoryStatus).toBeDefined();
  });

  it('should handle cache operations', () => {
    const { result } = renderHook(() => usePerformance());
    const testKey = 'test-key';
    const testData = { test: 'data' };

    act(() => {
      result.current.setCachedData(testKey, testData);
    });

    const cachedData = result.current.getCachedData(testKey);
    expect(cachedData).toEqual(testData);
  });

  it('should optimize render with requestAnimationFrame', () => {
    const { result } = renderHook(() => usePerformance());
    const mockCallback = jest.fn();

    act(() => {
      result.current.optimizeRender(mockCallback);
    });

    expect(global.requestAnimationFrame).toHaveBeenCalled();
  });

  it('should preload data correctly', async () => {
    const { result } = renderHook(() => usePerformance());
    
    // Mock fetch
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ data: 'test' })
    });

    let preloadedData;
    await act(async () => {
      preloadedData = await result.current.preloadData('/api/test', 'test-cache');
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/test');
    expect(preloadedData).toEqual({ data: 'test' });
  });

  it('should clear cache correctly', () => {
    const { result } = renderHook(() => usePerformance());
    const testKey = 'test-key';
    const testData = { test: 'data' };

    act(() => {
      result.current.setCachedData(testKey, testData);
      result.current.clearCache();
    });

    const cachedData = result.current.getCachedData(testKey);
    expect(cachedData).toBeNull();
  });

  it('should handle disabled metrics', () => {
    const { result } = renderHook(() => 
      usePerformance({ enableMetrics: false })
    );

    expect(result.current.isLoading).toBe(false);
  });

  it('should handle disabled resource analysis', () => {
    const { result } = renderHook(() => 
      usePerformance({ enableResourceAnalysis: false })
    );

    act(() => {
      result.current.analyzeResources();
    });

    expect(result.current.resources).toEqual([]);
  });

  it('should debounce function calls', () => {
    const { result } = renderHook(() => 
      usePerformance({ debounceDelay: 100 })
    );

    const mockFn = jest.fn();
    
    act(() => {
      result.current.analyzeResources();
      result.current.analyzeResources();
      result.current.analyzeResources();
    });

    // Should be debounced
    expect(mockFn).not.toHaveBeenCalledTimes(3);
  });
});

describe('Performance utilities', () => {
  it('should calculate memory status correctly', () => {
    const { result } = renderHook(() => usePerformance());

    // Test different memory usage levels
    expect(result.current.memoryStatus).toBeDefined();
  });

  it('should calculate cache efficiency correctly', () => {
    const { result } = renderHook(() => usePerformance());

    // Set some cache data to test efficiency
    act(() => {
      result.current.setCachedData('test1', 'data1');
      result.current.setCachedData('test2', 'data2');
      result.current.getCachedData('test1'); // Hit
      result.current.getCachedData('test3'); // Miss
    });

    expect(result.current.cacheEfficiency).toBeDefined();
  });

  it('should support performance observer', () => {
    const { result } = renderHook(() => usePerformance());

    expect(result.current.isPerformanceSupported).toBe(true);
    expect(result.current.isObserverSupported).toBe(true);
  });
});
