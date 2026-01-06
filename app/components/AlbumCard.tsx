'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { AlbumListItem } from '@/app/lib/types';

interface AlbumCardProps {
  album: AlbumListItem;
  isDragging?: boolean;
  isOver?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
  onTouchStart?: (e: React.TouchEvent<HTMLDivElement>) => void;
  onTouchMove?: (e: React.TouchEvent<HTMLDivElement>) => void;
  onTouchEnd?: (e: React.TouchEvent<HTMLDivElement>) => void;
}

/**
 * AlbumCard Component
 * Displays a city album with preview photo and photo count
 * Supports drag-and-drop reordering with touch support
 */
export default function AlbumCard({ 
  album, 
  isDragging = false,
  isOver = false,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}: AlbumCardProps) {
  const router = useRouter();
  const hasPhotos = album.photo_count > 0;
  const previewSrc = album.preview_photo || '/placeholder.jpg';

  const handleClick = (e: React.MouseEvent) => {
    // Only navigate if not dragging
    if (!isDragging) {
      e.preventDefault();
      router.push(`/album/${album.id}`);
    }
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClick={handleClick}
      tabIndex={0}
      role="button"
      aria-label={`View ${album.city_name} album with ${album.photo_count} ${album.photo_count === 1 ? 'photo' : 'photos'}. Draggable to reorder.`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const mouseEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          handleClick(mouseEvent as unknown as React.MouseEvent);
        }
      }}
      className={`
        group cursor-move bg-card-bg border border-border-color rounded-lg overflow-hidden 
        hover:border-accent transition-all duration-200 relative
        min-h-[44px] min-w-[44px]
        ${isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
        ${isOver ? 'ring-2 ring-accent ring-offset-2' : ''}
      `}
    >
      {/* Drag Handle */}
      <div 
        className="absolute top-2 right-2 z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        aria-hidden="true"
      >
        <svg 
          className="w-5 h-5 text-gray-600 dark:text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 8h16M4 16h16" 
          />
        </svg>
      </div>

      {/* Preview Image */}
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 pointer-events-none">
        {hasPhotos ? (
          <Image
            src={previewSrc}
            alt={`${album.city_name} preview`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <svg 
              className="w-16 h-16" 
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
          </div>
        )}
      </div>

      {/* Album Info */}
      <div className="p-4 pointer-events-none">
        <h3 
          className="text-lg font-semibold text-foreground truncate group-hover:text-accent transition-colors"
          title={album.city_name}
        >
          {album.city_name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {album.photo_count} {album.photo_count === 1 ? 'photo' : 'photos'}
        </p>
      </div>
    </div>
  );
}
