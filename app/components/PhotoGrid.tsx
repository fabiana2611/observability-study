import Image from 'next/image';
import Link from 'next/link';
import type { PhotoInAlbum } from '@/app/lib/types';

interface PhotoGridProps {
  photos: PhotoInAlbum[];
}

/**
 * PhotoGrid Component
 * Displays photos in a responsive tile grid
 * Supports lazy loading and hover effects
 */
export default function PhotoGrid({ photos }: PhotoGridProps) {
  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <svg 
          className="w-24 h-24 text-gray-300 dark:text-gray-600 mb-4" 
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
        <h2 className="text-xl font-semibold text-foreground mb-2">
          No Photos Yet
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          This album doesn&apos;t have any photos yet.
        </p>
      </div>
    );
  }

  return (
    <div 
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 scroll-smooth"
      role="list"
      aria-label="Album photos"
    >
      {photos.map((photo, index) => (
        <Link
          key={photo.id}
          href={`/photo/${photo.id}`}
          className="group relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-accent transition-all duration-200"
          role="listitem"
          aria-label={`View photo ${photo.display_order + 1}`}
        >
          <Image
            src={photo.file_path}
            alt={`Photo ${photo.display_order + 1} from album`}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            loading={index < 6 ? 'eager' : 'lazy'}
            priority={index < 6}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
        </Link>
      ))}
    </div>
  );
}
