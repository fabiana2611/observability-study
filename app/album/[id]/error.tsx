'use client';

import { useEffect } from 'react';
import Link from 'next/link';

/**
 * Error Boundary for album detail page
 * Displays when album or photo fetching fails
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Album detail error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <svg 
          className="w-24 h-24 text-red-500 mx-auto mb-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
          />
        </svg>
        
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Failed to Load Album
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We couldn&apos;t load the album details. Please try again.
        </p>
        
        {error.message && (
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-6 font-mono bg-gray-100 dark:bg-gray-800 p-3 rounded">
            {error.message}
          </p>
        )}
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-foreground rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            Back to Albums
          </Link>
        </div>
      </div>
    </div>
  );
}
