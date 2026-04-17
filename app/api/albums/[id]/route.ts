import { NextResponse } from 'next/server';
import { getAlbumById, initializeDatabase } from '@/app/lib/db';
import { createHttpSpan, emitApiMetricEvent, emitEndpointLogEvent, resolveDurationMs, SpanStatusCode, startRequestTimer } from '@/app/lib/tracing';
import { ATTR_HTTP_REQUEST_METHOD, ATTR_HTTP_ROUTE, ATTR_HTTP_RESPONSE_STATUS_CODE } from '@opentelemetry/semantic-conventions';

/**
 * GET /api/albums/[id]
 * Returns album detail with all photos
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const method = 'GET';
  const normalizedRoutePattern = '/api/albums/[id]';
  const metricRoutePattern = '/api/albums/[id]';
  const startedAt = startRequestTimer();
  let statusCode = 500;
  let errorMessage: string | null = null;

  // Create manual trace span for this endpoint
  const span = createHttpSpan('GET /api/albums/[id]');
  
  // Add HTTP semantic convention attributes
  span.setAttribute(ATTR_HTTP_REQUEST_METHOD, method);
  span.setAttribute(ATTR_HTTP_ROUTE, normalizedRoutePattern);
  span.setAttribute('instrumentation', 'manual');
  
  try {
    // Initialize database if needed
    initializeDatabase();
    
    const { id } = await params;
    const albumId = parseInt(id, 10);
    
    if (isNaN(albumId)) {
      statusCode = 400;
      errorMessage = 'Invalid album ID';
      span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, statusCode);
      span.setStatus({ code: SpanStatusCode.ERROR, message: errorMessage });
      return NextResponse.json(
        { error: 'Invalid album ID', message: 'Album ID must be a number' },
        { status: statusCode }
      );
    }
    
    const album = getAlbumById(albumId);
    
    if (!album) {
      statusCode = 404;
      errorMessage = 'Album not found';
      span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, statusCode);
      span.setStatus({ code: SpanStatusCode.ERROR, message: errorMessage });
      return NextResponse.json(
        { error: 'Album not found', message: `No album found with ID ${albumId}` },
        { status: statusCode }
      );
    }
    
    statusCode = 200;
    span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, statusCode);
    span.setStatus({ code: SpanStatusCode.OK });
    return NextResponse.json(album);
  } catch (error) {
    console.error('Error fetching album:', error);
    statusCode = 500;
    errorMessage = error instanceof Error ? error.message : 'Unknown error';
    span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, statusCode);
    span.setStatus({ code: SpanStatusCode.ERROR, message: errorMessage });
    span.recordException(error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to fetch album', message: errorMessage },
      { status: statusCode }
    );
  } finally {
    const durationMs = resolveDurationMs(startedAt);
    const metricErrorMessage = statusCode >= 400 ? errorMessage : undefined;
    emitApiMetricEvent({
      method,
      route: metricRoutePattern,
      status_code: statusCode,
      span,
      duration_ms: durationMs,
      error_message: metricErrorMessage,
    });
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
