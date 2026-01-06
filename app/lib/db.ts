import Database from 'better-sqlite3';
import path from 'path';
import { AlbumListItem, AlbumDetail, PhotoDetail } from './types';

const dbPath = path.join(process.cwd(), 'app', 'lib', 'database.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

/**
 * Initialize database schema
 * Creates albums and photos tables with proper constraints and indexes
 */
export function initializeDatabase(): void {
  // Create albums table
  db.exec(`
    CREATE TABLE IF NOT EXISTS albums (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city_name TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create photos table with foreign key
  db.exec(`
    CREATE TABLE IF NOT EXISTS photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      album_id INTEGER NOT NULL,
      file_path TEXT NOT NULL,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for optimized queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_photos_album_id ON photos(album_id)
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_photos_display_order ON photos(album_id, display_order)
  `);
}

/**
 * Get all albums with photo count and preview
 */
export function getAlbums(): AlbumListItem[] {
  const stmt = db.prepare(`
    SELECT 
      a.id,
      a.city_name,
      COUNT(p.id) as photo_count,
      (SELECT file_path FROM photos WHERE album_id = a.id ORDER BY display_order LIMIT 1) as preview_photo
    FROM albums a
    LEFT JOIN photos p ON a.id = p.album_id
    GROUP BY a.id
    ORDER BY a.city_name
  `);

  return stmt.all() as AlbumListItem[];
}

/**
 * Get album by ID with all photos
 */
export function getAlbumById(id: number): AlbumDetail | null {
  // Get album info
  const albumStmt = db.prepare(`
    SELECT id, city_name FROM albums WHERE id = ?
  `);
  const album = albumStmt.get(id) as { id: number; city_name: string } | undefined;

  if (!album) {
    return null;
  }

  // Get photos for album
  const photosStmt = db.prepare(`
    SELECT id, file_path, display_order
    FROM photos
    WHERE album_id = ?
    ORDER BY display_order
  `);
  const photos = photosStmt.all(id) as Array<{ id: number; file_path: string; display_order: number }>;

  return {
    id: album.id,
    city_name: album.city_name,
    photos,
  };
}

/**
 * Get photo by ID with album context
 */
export function getPhotoById(id: number): PhotoDetail | null {
  const stmt = db.prepare(`
    SELECT 
      p.id,
      p.file_path,
      a.id as album_id,
      a.city_name as album_city_name
    FROM photos p
    JOIN albums a ON p.album_id = a.id
    WHERE p.id = ?
  `);

  const result = stmt.get(id) as
    | { id: number; file_path: string; album_id: number; album_city_name: string }
    | undefined;

  if (!result) {
    return null;
  }

  return {
    id: result.id,
    file_path: result.file_path,
    album: {
      id: result.album_id,
      city_name: result.album_city_name,
    },
  };
}

/**
 * Create a new album
 */
export function createAlbum(cityName: string): number {
  const stmt = db.prepare('INSERT INTO albums (city_name) VALUES (?)');
  const result = stmt.run(cityName.trim());
  return result.lastInsertRowid as number;
}

/**
 * Create a new photo
 */
export function createPhoto(albumId: number, filePath: string, displayOrder: number): number {
  const stmt = db.prepare('INSERT INTO photos (album_id, file_path, display_order) VALUES (?, ?, ?)');
  const result = stmt.run(albumId, filePath, displayOrder);
  return result.lastInsertRowid as number;
}

/**
 * Delete all data (for testing/seeding)
 */
export function clearDatabase(): void {
  db.exec('DELETE FROM photos');
  db.exec('DELETE FROM albums');
  db.exec('DELETE FROM sqlite_sequence'); // Reset autoincrement
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
  db.close();
}

// Export database instance for direct access if needed
export { db };
