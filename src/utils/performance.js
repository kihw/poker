// src/utils/performance.js
import { memo } from 'react';

/**
 * Memoize components to prevent unnecessary re-renders
 * @param {React.FC} Component - React functional component
 * @param {Function} [areEqual] - Optional custom comparison function
 * @returns {React.FC} Memoized component
 */
export function memoize(Component, areEqual) {
  return memo(Component, areEqual);
}

/**
 * Debounce function to limit rate of function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit rate of function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Wait time in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit = 300) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Create a performance-optimized selector with memoization
 * @param {Function} selector - Selector function
 * @returns {Function} Memoized selector
 */
export function createOptimizedSelector(selector) {
  let lastArgs = null;
  let lastResult = null;

  return (state) => {
    if (!lastArgs || !areEqual(lastArgs, state)) {
      lastArgs = state;
      lastResult = selector(state);
    }
    return lastResult;
  };
}

/**
 * Deep comparison for object equality
 * @param {*} a - First value to compare
 * @param {*} b - Second value to compare
 * @returns {boolean} Whether the values are deeply equal
 */
function areEqual(a, b) {
  if (a === b) return true;
  
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (let key of keysA) {
    if (!keysB.includes(key)) return false;
    
    if (typeof a[key] === 'object' && typeof b[key] === 'object') {
      if (!areEqual(a[key], b[key])) return false;
    } else if (a[key] !== b[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Performance logging decorator
 * @param {Function} target - Function to wrap
 * @param {string} [name] - Optional name for logging
 * @returns {Function} Wrapped function with performance logging
 */
export function performanceLog(target, name) {
  return function(...args) {
    const start = performance.now();
    const result = target.apply(this, args);
    const end = performance.now();

    console.log(`Performance: ${name || target.name} took ${end - start}ms`);
    return result;
  };
}

// Export utility types and constants for performance tracking
export const PerformanceMarkers = {
  RENDER_START: 'render_start',
  RENDER_END: 'render_end',
  COMBAT_CALCULATION: 'combat_calculation',
};

export const performanceObserver = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    console.log(`Performance: ${entry.name} - ${entry.duration}ms`);
  });
});

// Start observing performance entries
performanceObserver.observe({ entryTypes: ['measure'] });
