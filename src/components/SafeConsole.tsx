'use client';

import { useEffect } from 'react';

// Safely stringify objects with circular references
function safeStringify(obj: any) {
  const cache = new Set();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) {
        return '[Circular]';
      }
      cache.add(value);
    }
    return value;
  });
}

export function SafeConsole() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const originalWarn = console.warn;
    const originalError = console.error;

    console.warn = (...args: any[]) => {
      try {
        // Try to serialize args to catch cyclic objects before they reach the iframe wrapper
        const safeArgs = args.map(arg => {
          if (typeof arg === 'object' && arg !== null) {
            try {
              JSON.stringify(arg);
              return arg;
            } catch (e) {
              return JSON.parse(safeStringify(arg));
            }
          }
          return arg;
        });
        originalWarn.apply(console, safeArgs);
      } catch (e) {
        originalWarn('Warning logged with un-serializable arguments');
      }
    };

    console.error = (...args: any[]) => {
      try {
        const safeArgs = args.map(arg => {
          if (typeof arg === 'object' && arg !== null) {
            try {
              JSON.stringify(arg);
              return arg;
            } catch (e) {
              return JSON.parse(safeStringify(arg));
            }
          }
          return arg;
        });
        originalError.apply(console, safeArgs);
      } catch (e) {
        originalError('Error logged with un-serializable arguments');
      }
    };

    return () => {
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  return null;
}
