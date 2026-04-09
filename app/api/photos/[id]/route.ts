import { NextResponse } from 'next/server';
import { getPhotoById, initializeDatabase } from '@/app/lib/db';
import { createHttpSpan, emitEndpointLogEvent, SpanStatusCode } from '@/app/lib/tracing';
import { ATTR_HTTP_REQUEST_METHOD, ATTR_HTTP_ROUTE, ATTR_HTTP_RESPONSE_STATUS_CODE } from '@opentelemetry/semantic-conventions';

/**
 * GET /api/photos/[id]
 * Returns photo detail with album context
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const method = 'GET';
  const normalizedRoutePattern = '/api/photos/[id]';
  const startedAtMs = Date.now();
  let statusCode = 500;
  let errorMessage: string | null = null;

  // Create manual trace span for this endpoint
  const span = createHttpSpan('GET /api/photos/[id]');
  
  // Add HTTP semantic convention attributes
  span.setAttribute(ATTR_HTTP_REQUEST_METHOD, method);
  span.setAttribute(ATTR_HTTP_ROUTE, normalizedRoutePattern);
  span.setAttribute('instrumentation', 'manual');
  
  try {
    // Initialize database if needed
    initializeDatabase();
    
    const { id } = await params;
    const photoId = parseInt(id, 10);
    
    if (isNaN(photoId)) {
      statusCode = 400;
      errorMessage = 'Invalid photo ID';
      span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, statusCode);
      span.setStatus({ code: SpanStatusCode.ERROR, message: errorMessage });
      return NextResponse.json(
        { error: 'Invalid photo ID', message: 'Photo ID must be a number' },
        { status: statusCode }
      );
    }
    
    const photo = getPhotoById(photoId);
    
    if (!photo) {
      statusCode = 404;
      errorMessage = 'Photo not found';
      span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, statusCode);
      span.setStatus({ code: SpanStatusCode.ERROR, message: errorMessage });
      return NextResponse.json(
        { error: 'Photo not found', message: `No photo found with ID ${photoId}` },
        { status: statusCode }
      );
    }
    
    statusCode = 200;
    span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, statusCode);
    span.setStatus({ code: SpanStatusCode.OK });
    return NextResponse.json(photo);
  } catch (error) {
    console.error('Error fetching photo:', error);
    statusCode = 500;
    errorMessage = error instanceof Error ? error.message : 'Unknown error';
    span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, statusCode);
    span.setStatus({ code: SpanStatusCode.ERROR, message: errorMessage });
    span.recordException(error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to fetch photo', message: errorMessage },
      { status: statusCode }
    );
  } finally {
    const durationMs = Date.now() - startedAtMs;
    emitEndpointLogEvent({
      method,
      route: normalizedRoutePattern,
      status_code: statusCode,
      span,
      duration_ms: durationMs,
      error_message: errorMessage,
    });
    span.end();
  }
}
