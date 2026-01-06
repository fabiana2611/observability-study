/**
 * Loading UI for the main page
 * Displays while albums are being fetched from the database
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <header className="border-b border-border-color bg-card-bg">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="h-9 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded mt-2 animate-pulse" />
        </div>
      </header>

      {/* Loading Grid */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-card-bg border border-border-color rounded-lg overflow-hidden">
              {/* Image Skeleton */}
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 animate-pulse" />
              {/* Text Skeleton */}
              <div className="p-4">
                <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mt-2 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
