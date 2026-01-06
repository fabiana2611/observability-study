'use client';

import { useEffect, useState, useRef } from 'react';
import AlbumCard from './AlbumCard';
import { applyAlbumOrder, loadAlbumOrder, saveAlbumOrder } from '@/app/lib/storage';
import type { AlbumListItem } from '@/app/lib/types';

interface AlbumGridProps {
  albums: AlbumListItem[];
}

/**
 * AlbumGrid Component (Client Component)
 * Displays albums in a responsive grid with drag-and-drop reordering
 * Supports both mouse and touch interactions
 */
export default function AlbumGrid({ albums }: AlbumGridProps) {
  // Apply custom album order from localStorage immediately during initialization
  const getInitialAlbums = () => {
    const savedOrder = loadAlbumOrder();
    if (savedOrder && savedOrder.length > 0) {
      return applyAlbumOrder(albums, savedOrder);
    }
    return albums;
  };

  const [orderedAlbums, setOrderedAlbums] = useState<AlbumListItem[]>(getInitialAlbums);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingTouch, setIsDraggingTouch] = useState(false);
  const touchMoveThreshold = 10; // pixels to move before considering it a drag
  const gridRef = useRef<HTMLDivElement>(null);

  // Update ordered albums when albums prop changes
  useEffect(() => {
    const savedOrder = loadAlbumOrder();
    if (savedOrder && savedOrder.length > 0) {
      const ordered = applyAlbumOrder(albums, savedOrder);
      // Only update if the order actually changed to avoid unnecessary re-renders
      if (JSON.stringify(ordered) !== JSON.stringify(orderedAlbums)) {
        setOrderedAlbums(ordered);
      }
    } else if (JSON.stringify(albums) !== JSON.stringify(orderedAlbums)) {
      setOrderedAlbums(albums);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [albums]);

  // ESC key to cancel drag
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && draggedIndex !== null) {
        setDraggedIndex(null);
        setDragOverIndex(null);
        setIsDraggingTouch(false);
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [draggedIndex]);

  const handleDragStart = (index: number) => (e: React.DragEvent<HTMLDivElement>) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (index: number) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (dropIndex: number) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Reorder albums
    const newAlbums = [...orderedAlbums];
    const [draggedAlbum] = newAlbums.splice(draggedIndex, 1);
    newAlbums.splice(dropIndex, 0, draggedAlbum);
    
    setOrderedAlbums(newAlbums);
    
    // Save new order to localStorage
    const newOrder = newAlbums.map(album => album.id);
    saveAlbumOrder(newOrder);
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Touch event handlers for mobile
  const handleTouchStart = (index: number) => (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
    setDraggedIndex(index);
  };

  const handleTouchMove = () => (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartPos || draggedIndex === null) return;

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartPos.x);
    const deltaY = Math.abs(touch.clientY - touchStartPos.y);

    // Only start dragging if moved beyond threshold
    if (deltaX > touchMoveThreshold || deltaY > touchMoveThreshold) {
      setIsDraggingTouch(true);
      e.preventDefault(); // Prevent scrolling

      // Find which album we're over
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      if (element) {
        const albumCards = gridRef.current?.querySelectorAll('[data-album-index]');
        albumCards?.forEach((card, cardIndex) => {
          if (card.contains(element) && cardIndex !== draggedIndex) {
            setDragOverIndex(cardIndex);
          }
        });
      }
    }
  };

  const handleTouchEnd = () => {
    if (isDraggingTouch && draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      // Reorder albums
      const newAlbums = [...orderedAlbums];
      const [draggedAlbum] = newAlbums.splice(draggedIndex, 1);
      newAlbums.splice(dragOverIndex, 0, draggedAlbum);
      
      setOrderedAlbums(newAlbums);
      
      // Save new order to localStorage
      const newOrder = newAlbums.map(album => album.id);
      saveAlbumOrder(newOrder);
    }

    // Reset all drag state
    setDraggedIndex(null);
    setDragOverIndex(null);
    setTouchStartPos(null);
    setIsDraggingTouch(false);
  };

  // Empty state
  if (orderedAlbums.length === 0) {
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
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
          />
        </svg>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          No Albums Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          There are no photo albums to display. Run the seed script to populate sample data.
        </p>
        <code className="mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
          npm run seed
        </code>
      </div>
    );
  }

  return (
    <div 
      ref={gridRef}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      role="list"
      aria-label="City photo albums"
    >
      {orderedAlbums.map((album, index) => (
        <div key={album.id} data-album-index={index} role="listitem">
          <AlbumCard 
            album={album} 
            isDragging={draggedIndex === index}
            isOver={dragOverIndex === index}
            onDragStart={handleDragStart(index)}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver(index)}
            onDrop={handleDrop(index)}
            onTouchStart={handleTouchStart(index)}
            onTouchMove={handleTouchMove()}
            onTouchEnd={handleTouchEnd}
          />
        </div>
      ))}
    </div>
  );
}
