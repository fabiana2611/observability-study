import { NextResponse } from 'next/server';
import { getAlbums, initializeDatabase } from '@/app/lib/db';

/**
 * GET /api/albums
 * Returns all albums with photo count and preview image
 */
export async function GET() {
  try {
    // Initialize database if needed
    initializeDatabase();
    
    // Get all albums
    const albums = getAlbums();
    
    return NextResponse.json(albums);
  } catch (error) {
    console.error('Error fetching albums:', error);
    return NextResponse.json(
      { error: 'Failed to fetch albums', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
