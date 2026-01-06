import { notFound } from 'next/navigation';
import PhotoDetail from '@/app/components/PhotoDetail';
import { initializeDatabase, getPhotoById } from '@/app/lib/db';
import type { PhotoDetail as PhotoDetailType } from '@/app/lib/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Photo Detail Page (Server Component)
 * Displays a single photo in full size with navigation
 */
export default async function PhotoPage({ params }: PageProps) {
  const { id } = await params;
  const photoId = parseInt(id, 10);

  if (isNaN(photoId)) {
    notFound();
  }

  // Initialize database and fetch photo detail
  initializeDatabase();
  const photo: PhotoDetailType | null = getPhotoById(photoId);

  if (!photo) {
    notFound();
  }

  return <PhotoDetail photo={photo} />;
}
