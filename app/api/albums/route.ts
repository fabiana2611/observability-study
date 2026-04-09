import { NextResponse } from 'next/server';
import { getAlbums, initializeDatabase } from '@/app/lib/db';
import { createHttpSpan, emitEndpointLogEvent, SpanStatusCode } from '@/app/lib/tracing';
import { ATTR_HTTP_REQUEST_METHOD, ATTR_HTTP_ROUTE, ATTR_HTTP_RESPONSE_STATUS_CODE } from '@opentelemetry/semantic-conventions';

/**
 * GET /api/albums
 * Returns all albums with photo count and preview image
 */
export async function GET() {
  const method = 'GET';
  const route = '/api/albums';
  const startedAtMs = Date.now();
  let statusCode = 500;
  let errorMessage: string | null = null;

  // Create manual trace span for this endpoint
  const span = createHttpSpan('GET /api/albums');
  
  // Add HTTP semantic convention attributes
  span.setAttribute(ATTR_HTTP_REQUEST_METHOD, method);
  span.setAttribute(ATTR_HTTP_ROUTE, route);
  span.setAttribute('instrumentation', 'manual');
  
  try {
    // Initialize database if needed
    initializeDatabase();
    
    // Get all albums
    const albums = getAlbums();
    
    statusCode = 200;
    span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, statusCode);
    span.setStatus({ code: SpanStatusCode.OK });
    return NextResponse.json(albums);
  } catch (error) {
    console.error('Error fetching albums:', error);
    statusCode = 500;
    errorMessage = error instanceof Error ? error.message : 'Unknown error';
    span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, statusCode);
    span.setStatus({ code: SpanStatusCode.ERROR, message: errorMessage });
    span.recordException(error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to fetch albums', message: errorMessage },
      { status: statusCode }
    );
  } finally {
    const durationMs = Date.now() - startedAtMs;
    emitEndpointLogEvent({
      method,
      route,
      status_code: statusCode,
      span,
      duration_ms: durationMs,
      error_message: errorMessage,
    });
    span.end();
  }
}
