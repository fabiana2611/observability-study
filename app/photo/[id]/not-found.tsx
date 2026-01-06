import Link from 'next/link';

/**
 * 404 Not Found page for photo detail
 * Displays when photo ID doesn't exist in database
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
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
        
        <h1 className="text-4xl font-bold text-foreground mb-2">
          404
        </h1>
        
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          Photo Not Found
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The photo you&apos;re looking for doesn&apos;t exist or has been removed.
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
