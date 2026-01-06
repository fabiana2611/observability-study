import Link from 'next/link';

/**
 * 404 Not Found page for album detail
 * Displays when album ID doesn't exist in database
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <svg 
          className="w-24 h-24 text-gray-400 mx-auto mb-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
        
        <h1 className="text-4xl font-bold text-foreground mb-2">
          404
        </h1>
        
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          Album Not Found
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The album you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium"
        >
          Back to Albums
        </Link>
      </div>
    </div>
  );
}
