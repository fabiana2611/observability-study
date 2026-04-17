import { NextResponse } from 'next/server';
import { db, initializeDatabase } from '@/app/lib/db';
import { createHttpSpan, emitApiMetricEvent, emitEndpointLogEvent, resolveDurationMs, SpanStatusCode, startRequestTimer } from '@/app/lib/tracing';
import { ATTR_HTTP_REQUEST_METHOD, ATTR_HTTP_ROUTE, ATTR_HTTP_RESPONSE_STATUS_CODE } from '@opentelemetry/semantic-conventions';

/**
 * GET /api/health
 * Health check endpoint to verify database connectivity
 */
export async function GET() {
  const method = 'GET';
  const route = '/api/health';
  const startedAt = startRequestTimer();
  let statusCode = 500;
  let errorMessage: string | null = null;

  // Create manual trace span for this endpoint
  const span = createHttpSpan('GET /api/health');
  
  // Add HTTP semantic convention attributes
  span.setAttribute(ATTR_HTTP_REQUEST_METHOD, method);
  span.setAttribute(ATTR_HTTP_ROUTE, route);
  span.setAttribute('instrumentation', 'manual');
  
  try {
    // Initialize database if needed
    initializeDatabase();
    
    // Test database connection with a simple query
    const result = db.prepare('SELECT 1 as health').get() as { health: number };
    
    if (result.health === 1) {
      statusCode = 200;
      span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, statusCode);
      span.setStatus({ code: SpanStatusCode.OK });
      return NextResponse.json({
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString(),
      });
    }
    
    statusCode = 500;
    errorMessage = 'Database query failed';
    span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, statusCode);
    span.setStatus({ code: SpanStatusCode.ERROR, message: errorMessage });
    return NextResponse.json(
      { status: 'unhealthy', database: 'error', message: errorMessage },
      { status: statusCode }
    );
  } catch (error) {
    console.error('Health check failed:', error);
    statusCode = 500;
    errorMessage = error instanceof Error ? error.message : 'Unknown error';
    span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, statusCode);
    span.setStatus({ code: SpanStatusCode.ERROR, message: errorMessage });
    span.recordException(error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      {
        status: 'unhealthy',
        database: 'disconnected',
        message: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    );
  } finally {
    const durationMs = resolveDurationMs(startedAt);
    const metricErrorMessage = statusCode >= 400 ? errorMessage : undefined;
    emitApiMetricEvent({
      method,
      route,
      status_code: statusCode,
      span,
      duration_ms: durationMs,
      error_message: metricErrorMessage,
    });
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
