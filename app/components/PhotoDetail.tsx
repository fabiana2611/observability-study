'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { PhotoDetail as PhotoDetailType } from '@/app/lib/types';

interface PhotoDetailProps {
  photo: PhotoDetailType;
}

/**
 * PhotoDetail Component
 * Displays a full-size photo with album breadcrumb and back button
 */
export default function PhotoDetail({ photo }: PhotoDetailProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with breadcrumb */}
      <header className="border-b border-border-color bg-card-bg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm" aria-label="Breadcrumb navigation">
              <Link 
                href="/" 
                className="text-gray-600 dark:text-gray-400 hover:text-accent transition-colors"
              >
                Albums
              </Link>
              <span className="text-gray-400" aria-hidden="true">/</span>
              <Link 
                href={`/album/${photo.album.id}`}
                className="text-gray-600 dark:text-gray-400 hover:text-accent transition-colors"
              >
                {photo.album.city_name}
              </Link>
              <span className="text-gray-400" aria-hidden="true">/</span>
              <span className="text-foreground font-medium" aria-current="page">
                Photo
              </span>
            </nav>

            {/* Back button */}
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
              aria-label="Go back to previous page"
            >
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                />
              </svg>
              Back
            </button>
          </div>
        </div>
      </header>

      {/* Photo display */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center">
          <div className="relative w-full max-w-4xl aspect-[4/3] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
            <Image
              src={photo.file_path}
              alt={`Photo from ${photo.album.city_name}`}
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Photo info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Photo from {photo.album.city_name}
          </p>
        </div>
      </main>
    </div>
  );
}
