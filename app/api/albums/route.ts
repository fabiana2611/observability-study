import { NextResponse } from 'next/server';
import { getAlbums, initializeDatabase } from '@/app/lib/db';
import { createHttpSpan, SpanStatusCode } from '@/app/lib/tracing';
import { ATTR_HTTP_REQUEST_METHOD, ATTR_HTTP_ROUTE, ATTR_HTTP_RESPONSE_STATUS_CODE } from '@opentelemetry/semantic-conventions';

/**
 * GET /api/albums
 * Returns all albums with photo count and preview image
 */
export async function GET() {
  // Create manual trace span for this endpoint
  const span = createHttpSpan('GET /api/albums');
  
  // Add HTTP semantic convention attributes
  span.setAttribute(ATTR_HTTP_REQUEST_METHOD, 'GET');
  span.setAttribute(ATTR_HTTP_ROUTE, '/api/albums');
  span.setAttribute('instrumentation', 'manual');
  
  try {
    // Initialize database if needed
    initializeDatabase();
    
    // Get all albums
    const albums = getAlbums();
    
    span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, 200);
    span.setStatus({ code: SpanStatusCode.OK });
    return NextResponse.json(albums);
  } catch (error) {
    console.error('Error fetching albums:', error);
    span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, 500);
    span.setStatus({ code: SpanStatusCode.ERROR, message: error instanceof Error ? error.message : 'Unknown error' });
    span.recordException(error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to fetch albums', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    span.end();
  }
}
