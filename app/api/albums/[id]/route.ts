import { NextResponse } from 'next/server';
import { getAlbumById, initializeDatabase } from '@/app/lib/db';

/**
 * GET /api/albums/[id]
 * Returns album detail with all photos
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Initialize database if needed
    initializeDatabase();
    
    const { id } = await params;
    const albumId = parseInt(id, 10);
    
    if (isNaN(albumId)) {
      return NextResponse.json(
        { error: 'Invalid album ID', message: 'Album ID must be a number' },
        { status: 400 }
      );
    }
    
    const album = getAlbumById(albumId);
    
    if (!album) {
      return NextResponse.json(
        { error: 'Album not found', message: `No album found with ID ${albumId}` },
        { status: 404 }
      );
    }
    
    return NextResponse.json(album);
  } catch (error) {
    console.error('Error fetching album:', error);
    return NextResponse.json(
      { error: 'Failed to fetch album', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
