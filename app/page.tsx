import AlbumGrid from './components/AlbumGrid';
import { initializeDatabase } from './lib/db';
import type { AlbumListItem } from './lib/types';

/**
 * Home Page (Server Component)
 * Fetches all albums from the API to demonstrate manual instrumentation
 */
export default async function Home() {
  // Initialize database first
  initializeDatabase();
  
  // Fetch albums through API route to trigger manual instrumentation
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/albums`, { 
    cache: 'no-store' // Disable caching to ensure fresh data
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch albums');
  }
  
  const albums: AlbumListItem[] = await response.json();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border-color bg-card-bg">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <h1 className="text-3xl font-bold text-foreground">
            Photo Album Organizer
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Browse your city photo albums
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <AlbumGrid albums={albums} />
      </main>
    </div>
  );
}

