import { notFound } from 'next/navigation';
import PhotoDetail from '@/app/components/PhotoDetail';
import { initializeDatabase } from '@/app/lib/db';
import type { PhotoDetail as PhotoDetailType } from '@/app/lib/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Photo Detail Page (Server Component)
 * Fetches photo through API to demonstrate manual instrumentation
 */
export default async function PhotoPage({ params }: PageProps) {
  const { id } = await params;
  const photoId = parseInt(id, 10);

  if (isNaN(photoId)) {
    notFound();
  }

  // Initialize database first
  initializeDatabase();
  
  // Fetch photo through API route to trigger manual instrumentation
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/photos/${photoId}`, {
    cache: 'no-store'
  });

  if (!response.ok) {
    if (response.status === 404) {
      notFound();
    }
    throw new Error('Failed to fetch photo');
  }
  
  const photo: PhotoDetailType = await response.json();

  if (!photo) {
    notFound();
  }

  return <PhotoDetail photo={photo} />;
}
