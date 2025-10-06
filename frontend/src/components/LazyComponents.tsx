'use client';

import { lazy, Suspense } from 'react';
import dynamic from 'next/dynamic';

// Lazy load heavy components
export const LazyCollaborativeEditor = lazy(() => import('./CollaborativeEditor'));
export const LazyHistorySidebar = lazy(() => import('./HistorySidebar'));

// Dynamic imports with custom loading
export const DynamicCollaborativeEditor = dynamic(
  () => import('./CollaborativeEditor'),
  {
    loading: () => (
      <div className="flex items-center justify-center h-48 sm:h-64 border rounded-lg sm:rounded-xl bg-gray-50 dark:bg-gray-800">
        <div className="text-center px-4">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading collaborative editor...</p>
        </div>
      </div>
    ),
    ssr: false, // Disable SSR for editor to avoid hydration issues
  }
);

export const DynamicHistorySidebar = dynamic(
  () => import('./HistorySidebar'),
  {
    loading: () => (
      <div className="w-64 bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
        <div className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    ),
    ssr: false,
  }
);

// Wrapper component with Suspense for lazy-loaded components
export function SuspenseWrapper({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const defaultFallback = (
    <div className="flex items-center justify-center h-32 text-gray-500">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
      Loading...
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
}

// Image component with lazy loading and optimization
export function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  ...props
}: {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  [key: string]: any;
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={`${className} transition-opacity duration-300`}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      {...props}
      onLoad={(e) => {
        (e.target as HTMLImageElement).style.opacity = '1';
      }}
      onError={(e) => {
        (e.target as HTMLImageElement).style.opacity = '0.5';
      }}
      style={{ opacity: 0, ...props.style }}
    />
  );
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver() {
  const observerMap = new Map();

  const observe = (element: Element, callback: (isVisible: boolean) => void) => {
    if (!element || observerMap.has(element)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        callback(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    observer.observe(element);
    observerMap.set(element, observer);

    return () => {
      observer.disconnect();
      observerMap.delete(element);
    };
  };

  const unobserve = (element: Element) => {
    const observer = observerMap.get(element);
    if (observer) {
      observer.disconnect();
      observerMap.delete(element);
    }
  };

  return { observe, unobserve };
}

export default {
  LazyCollaborativeEditor,
  LazyHistorySidebar,
  DynamicCollaborativeEditor,
  DynamicHistorySidebar,
  SuspenseWrapper,
  OptimizedImage,
  useIntersectionObserver,
};