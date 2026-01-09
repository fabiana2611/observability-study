import { NextResponse } from 'next/server';
import { getAlbumById, initializeDatabase } from '@/app/lib/db';
import { createHttpSpan, SpanStatusCode } from '@/app/lib/tracing';
import { ATTR_HTTP_REQUEST_METHOD, ATTR_HTTP_ROUTE, ATTR_HTTP_RESPONSE_STATUS_CODE } from '@opentelemetry/semantic-conventions';

/**
 * GET /api/albums/[id]
 * Returns album detail with all photos
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Create manual trace span for this endpoint
  const span = createHttpSpan('GET /api/albums/[id]');
  
  // Add HTTP semantic convention attributes
  span.setAttribute(ATTR_HTTP_REQUEST_METHOD, 'GET');
  span.setAttribute(ATTR_HTTP_ROUTE, '/api/albums/[id]');
  span.setAttribute('instrumentation', 'manual');
  
  try {
    // Initialize database if needed
    initializeDatabase();
    
    const { id } = await params;
    const albumId = parseInt(id, 10);
    
    if (isNaN(albumId)) {
      span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, 400);
      span.setStatus({ code: SpanStatusCode.ERROR, message: 'Invalid album ID' });
      return NextResponse.json(
        { error: 'Invalid album ID', message: 'Album ID must be a number' },
        { status: 400 }
      );
    }
    
    const album = getAlbumById(albumId);
    
    if (!album) {
      span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, 404);
      span.setStatus({ code: SpanStatusCode.ERROR, message: 'Album not found' });
      return NextResponse.json(
        { error: 'Album not found', message: `No album found with ID ${albumId}` },
        { status: 404 }
      );
    }
    
    span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, 200);
    span.setStatus({ code: SpanStatusCode.OK });
    return NextResponse.json(album);
  } catch (error) {
    console.error('Error fetching album:', error);
    span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, 500);
    span.setStatus({ code: SpanStatusCode.ERROR, message: error instanceof Error ? error.message : 'Unknown error' });
    span.recordException(error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to fetch album', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    span.end();
  }
}
