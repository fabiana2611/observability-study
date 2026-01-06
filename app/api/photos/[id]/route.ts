import { NextResponse } from 'next/server';
import { getPhotoById, initializeDatabase } from '@/app/lib/db';

/**
 * GET /api/photos/[id]
 * Returns photo detail with album context
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Initialize database if needed
    initializeDatabase();
    
    const { id } = await params;
    const photoId = parseInt(id, 10);
    
    if (isNaN(photoId)) {
      return NextResponse.json(
        { error: 'Invalid photo ID', message: 'Photo ID must be a number' },
        { status: 400 }
      );
    }
    
    const photo = getPhotoById(photoId);
    
    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found', message: `No photo found with ID ${photoId}` },
        { status: 404 }
      );
    }
    
    return NextResponse.json(photo);
  } catch (error) {
    console.error('Error fetching photo:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photo', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
