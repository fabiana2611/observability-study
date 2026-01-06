import { AlbumOrder } from './types';

const ALBUM_ORDER_KEY = 'album-order';

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Load album order from localStorage
 * Returns null if not found or invalid
 */
export function loadAlbumOrder(): AlbumOrder | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }

  try {
    const stored = localStorage.getItem(ALBUM_ORDER_KEY);
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored);
    
    // Validate that it's an array of numbers
    if (!Array.isArray(parsed)) {
      return null;
    }

    // Convert to numbers and remove duplicates
    const order = [...new Set(parsed.map(Number))].filter((id) => !isNaN(id));
    
    return order.length > 0 ? order : null;
  } catch {
    return null;
  }
}

/**
 * Save album order to localStorage
 */
export function saveAlbumOrder(order: AlbumOrder): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    localStorage.setItem(ALBUM_ORDER_KEY, JSON.stringify(order));
    return true;
  } catch {
    return false;
  }
}

/**
 * Clear album order from localStorage
 */
export function clearAlbumOrder(): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    localStorage.removeItem(ALBUM_ORDER_KEY);
    return true;
  } catch {
    return false;
  }
}

/**
 * Apply custom order to albums array
 * Sorts albums based on stored order, appending unordered albums at the end
 */
export function applyAlbumOrder<T extends { id: number }>(albums: T[], order: AlbumOrder | null): T[] {
  if (!order || order.length === 0) {
    return albums;
  }

  // Create a map for quick lookup
  const albumMap = new Map(albums.map((album) => [album.id, album]));
  const ordered: T[] = [];
  const unordered: T[] = [];

  // Add albums in custom order
  order.forEach((id) => {
    const album = albumMap.get(id);
    if (album) {
      ordered.push(album);
      albumMap.delete(id);
    }
  });

  // Add remaining albums (new albums not in saved order)
  albumMap.forEach((album) => {
    unordered.push(album);
  });

  return [...ordered, ...unordered];
}
