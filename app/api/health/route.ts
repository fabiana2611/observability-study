import { NextResponse } from 'next/server';
import { db, initializeDatabase } from '@/app/lib/db';

/**
 * GET /api/health
 * Health check endpoint to verify database connectivity
 */
export async function GET() {
  try {
    // Initialize database if needed
    initializeDatabase();
    
    // Test database connection with a simple query
    const result = db.prepare('SELECT 1 as health').get() as { health: number };
    
    if (result.health === 1) {
      return NextResponse.json({
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString(),
      });
    }
    
    return NextResponse.json(
      { status: 'unhealthy', database: 'error', message: 'Database query failed' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        database: 'disconnected',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
