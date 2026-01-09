import { NextResponse } from 'next/server';
import { db, initializeDatabase } from '@/app/lib/db';
import { createHttpSpan, SpanStatusCode } from '@/app/lib/tracing';
import { ATTR_HTTP_REQUEST_METHOD, ATTR_HTTP_ROUTE, ATTR_HTTP_RESPONSE_STATUS_CODE } from '@opentelemetry/semantic-conventions';

/**
 * GET /api/health
 * Health check endpoint to verify database connectivity
 */
export async function GET() {
  // Create manual trace span for this endpoint
  const span = createHttpSpan('GET /api/health');
  
  // Add HTTP semantic convention attributes
  span.setAttribute(ATTR_HTTP_REQUEST_METHOD, 'GET');
  span.setAttribute(ATTR_HTTP_ROUTE, '/api/health');
  span.setAttribute('instrumentation', 'manual');
  
  try {
    // Initialize database if needed
    initializeDatabase();
    
    // Test database connection with a simple query
    const result = db.prepare('SELECT 1 as health').get() as { health: number };
    
    if (result.health === 1) {
      span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, 200);
      span.setStatus({ code: SpanStatusCode.OK });
      return NextResponse.json({
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString(),
      });
    }
    
    span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, 500);
    span.setStatus({ code: SpanStatusCode.ERROR, message: 'Database query failed' });
    return NextResponse.json(
      { status: 'unhealthy', database: 'error', message: 'Database query failed' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Health check failed:', error);
    span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, 500);
    span.setStatus({ code: SpanStatusCode.ERROR, message: error instanceof Error ? error.message : 'Unknown error' });
    span.recordException(error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      {
        status: 'unhealthy',
        database: 'disconnected',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  } finally {
    span.end();
  }
}
