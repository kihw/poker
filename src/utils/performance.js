// src/utils/performance.js - Enhanced Performance Utilities
import { memo, useState, useCallback, useMemo } from 'react';
import { DESIGN_TOKENS } from '../components/ui/DesignSystem';

/**
 * Performance markers for tracking key application events
 */
export const PerformanceMarkers = {
  RENDER_START: 'render_start',
  RENDER_END: 'render_end',
  COMPONENT_MOUNT: 'component_mount',
  COMPONENT_UPDATE: 'component_update',
  DATA_FETCH: 'data_fetch',
  INTERACTION: 'interaction',
};

/**
 * Performance tracking decorator
 * @param {Function} target - Function to wrap
 * @param {string} [name] - Optional name for logging
 * @returns {Function} Performance-tracked function
 */
export function performanceTrack(name = 'Function') {
  return function(target, key, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function(...args) {
      const start = performance.now();
      const result = originalMethod.apply(this, args);
      const end = performance.now();

      console.log(`Performance: ${name} took ${end - start}ms`);
      
      // Optional: Add mark and measure for more detailed tracking
      performance.mark(`${name}_end`);
      performance.measure(
        `${name}_measure`, 
        `${name}_start`, 
        `${name}_end`
      );

      return result;
    };

    return descriptor;
  };
}

/**
 * Performance-aware memoization hook
 * @param {Function} computeFunction - Function to memoize
 * @param {Array} dependencies - Dependencies array
 * @returns {any} Memoized value
 */
export function usePerformanceMemo(computeFunction, dependencies) {
  const startTime = performance.now();
  const memoizedValue = useMemo(computeFunction, dependencies);
  const endTime = performance.now();

  if (endTime - startTime > 10) {
    console.warn(
      `Performance Warning: Memoized computation took ${endTime - startTime}ms`
    );
  }

  return memoizedValue;
}

/**
 * Enhanced debounce utility with performance tracking
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function performanceDebounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const context = this;
    const later = () => {
      clearTimeout(timeout);
      const start = performance.now();
      func.apply(context, args);
      const end = performance.now();
      
      if (end - start > wait) {
        console.warn(
          `Performance Warning: Debounced function took ${end - start}ms`
        );
      }
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Performance tracking hook for component rendering
 * @returns {Object} Performance tracking utilities
 */
export function usePerformanceTracking() {
  const [renderCount, setRenderCount] = useState(0);
  const [lastRenderTime, setLastRenderTime] = useState(null);

  const trackRender = useCallback(() => {
    const currentTime = performance.now();
    
    if (lastRenderTime) {
      const renderDuration = currentTime - lastRenderTime;
      
      if (renderDuration > 16) { // More than one frame (60fps)
        console.warn(
          `Slow Render: ${renderDuration.toFixed(2)}ms (Frame dropped)`
        );
      }
    }

    setRenderCount(prev => prev + 1);
    setLastRenderTime(currentTime);
  }, [lastRenderTime]);

  return {
    renderCount,
    trackRender,
  };
}

/**
 * Performance Observer for detailed tracking
 */
export const performanceObserver = new PerformanceObserver((list) => {
  const entries = list.getEntries();
  entries.forEach((entry) => {
    const color = entry.duration > 50 
      ? DESIGN_TOKENS.colors.danger.main 
      : DESIGN_TOKENS.colors.success.main;

    console.log(
      `%c Performance: ${entry.name} - ${entry.duration.toFixed(2)}ms`, 
      `color: ${color}; font-weight: bold;`
    );
  });
});

// Start observing performance entries
performanceObserver.observe({ 
  entryTypes: ['measure', 'mark'] 
});

export default {
  performanceTrack,
  usePerformanceMemo,
  performanceDebounce,
  usePerformanceTracking,
  PerformanceMarkers,
};
