import { NextResponse } from 'next/server';
import { getPhotoById, initializeDatabase } from '@/app/lib/db';
import { createHttpSpan, SpanStatusCode } from '@/app/lib/tracing';
import { ATTR_HTTP_REQUEST_METHOD, ATTR_HTTP_ROUTE, ATTR_HTTP_RESPONSE_STATUS_CODE } from '@opentelemetry/semantic-conventions';

/**
 * GET /api/photos/[id]
 * Returns photo detail with album context
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Create manual trace span for this endpoint
  const span = createHttpSpan('GET /api/photos/[id]');
  
  // Add HTTP semantic convention attributes
  span.setAttribute(ATTR_HTTP_REQUEST_METHOD, 'GET');
  span.setAttribute(ATTR_HTTP_ROUTE, '/api/photos/[id]');
  span.setAttribute('instrumentation', 'manual');
  
  try {
    // Initialize database if needed
    initializeDatabase();
    
    const { id } = await params;
    const photoId = parseInt(id, 10);
    
    if (isNaN(photoId)) {
      span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, 400);
      span.setStatus({ code: SpanStatusCode.ERROR, message: 'Invalid photo ID' });
      return NextResponse.json(
        { error: 'Invalid photo ID', message: 'Photo ID must be a number' },
        { status: 400 }
      );
    }
    
    const photo = getPhotoById(photoId);
    
    if (!photo) {
      span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, 404);
      span.setStatus({ code: SpanStatusCode.ERROR, message: 'Photo not found' });
      return NextResponse.json(
        { error: 'Photo not found', message: `No photo found with ID ${photoId}` },
        { status: 404 }
      );
    }
    
    span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, 200);
    span.setStatus({ code: SpanStatusCode.OK });
    return NextResponse.json(photo);
  } catch (error) {
    console.error('Error fetching photo:', error);
    span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, 500);
    span.setStatus({ code: SpanStatusCode.ERROR, message: error instanceof Error ? error.message : 'Unknown error' });
    span.recordException(error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to fetch photo', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    span.end();
  }
}
