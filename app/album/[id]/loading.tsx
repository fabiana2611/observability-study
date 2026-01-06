/**
 * Loading UI for album detail page
 * Displays while photos are being fetched from the database
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <header className="border-b border-border-color bg-card-bg">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
          <div className="h-9 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded mt-2 animate-pulse" />
        </div>
      </header>

      {/* Loading Grid */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      </main>
    </div>
  );
}
