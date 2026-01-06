import Link from 'next/link';
import { notFound } from 'next/navigation';
import PhotoGrid from '@/app/components/PhotoGrid';
import { initializeDatabase, getAlbumById } from '@/app/lib/db';
import type { AlbumDetail } from '@/app/lib/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Album Detail Page (Server Component)
 * Displays all photos in an album with responsive grid
 */
export default async function AlbumPage({ params }: PageProps) {
  const { id } = await params;
  const albumId = parseInt(id, 10);

  if (isNaN(albumId)) {
    notFound();
  }

  // Initialize database and fetch album with photos
  initializeDatabase();
  const album: AlbumDetail | null = getAlbumById(albumId);

  if (!album) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border-color bg-card-bg">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <nav className="flex items-center space-x-2 text-sm mb-4">
            <Link 
              href="/" 
              className="text-gray-600 dark:text-gray-400 hover:text-accent transition-colors"
            >
              ← Back to Albums
            </Link>
          </nav>
          <h1 className="text-3xl font-bold text-foreground">
            {album.city_name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {album.photos.length} {album.photos.length === 1 ? 'photo' : 'photos'}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <PhotoGrid photos={album.photos} />
      </main>
    </div>
  );
}
