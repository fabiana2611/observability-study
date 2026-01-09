/**
 * Manual OpenTelemetry Tracing Utilities
 * 
 * This module provides manual tracing infrastructure for educational purposes.
 * It configures OpenTelemetry with console export and provides helper functions
 * for creating HTTP spans with semantic conventions.
 * 
 * Co-exists with auto-instrumentation configured in instrumentation.ts
 */

import { trace, Span, SpanStatusCode, Tracer, SpanKind } from '@opentelemetry/api';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import type { SpanExporter, ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { ExportResult, ExportResultCode } from '@opentelemetry/core';
import { hostname } from 'os';

// OpenTelemetry semantic convention attribute keys for resource attributes
// Using direct string constants instead of SEMRESATTRS_* which are deprecated
// Reference: https://opentelemetry.io/docs/specs/semconv/resource/
const ATTR_SERVICE_NAME = 'service.name';
const ATTR_SERVICE_VERSION = 'service.version';
const ATTR_DEPLOYMENT_ENVIRONMENT = 'deployment.environment';
const ATTR_HOST_NAME = 'host.name';

// Tracer provider instance for manual instrumentation
let providerInstance: NodeTracerProvider | null = null;

// Tracer instance for manual instrumentation
let tracerInstance: Tracer | null = null;

/**
 * Custom console span exporter that formats timestamps in ISO 8601 with millisecond precision
 * Converts OpenTelemetry's internal microsecond timestamps to human-readable ISO 8601 format
 */
class ISO8601ConsoleSpanExporter implements SpanExporter {
  export(spans: ReadableSpan[], resultCallback: (result: ExportResult) => void): void {
    for (const span of spans) {
      // Convert HrTime [seconds, nanoseconds] to milliseconds for ISO 8601 conversion
      const startTimeMs = span.startTime[0] * 1000 + span.startTime[1] / 1_000_000;
      const endTimeMs = span.endTime[0] * 1000 + span.endTime[1] / 1_000_000;
      // Duration is in HrTime format [seconds, nanoseconds]
      const durationNs = span.duration[0] * 1_000_000_000 + span.duration[1];
      
      // Format timestamps in ISO 8601 with millisecond precision
      const startTimeISO = new Date(startTimeMs).toISOString();
      const endTimeISO = new Date(endTimeMs).toISOString();
      
      // Build output object with ISO 8601 timestamps
      const output = {
        resource: {
          attributes: span.resource.attributes,
        },
        instrumentationScope: {
          name: span.instrumentationScope.name,
          version: span.instrumentationScope.version,
          schemaUrl: span.instrumentationScope.schemaUrl,
        },
        traceId: span.spanContext().traceId,
        parentSpanId: span.parentSpanContext?.spanId,
        traceState: span.spanContext().traceState?.serialize(),
        name: span.name,
        spanId: span.spanContext().spanId,
        kind: span.kind,
        startTime: startTimeISO,  // ISO 8601 format
        endTime: endTimeISO,      // ISO 8601 format
        duration: durationNs,     // Keep duration in nanoseconds as per spec
        attributes: span.attributes,
        status: span.status,
        events: span.events.map(event => ({
          name: event.name,
          time: new Date(event.time[0] * 1000 + event.time[1] / 1_000_000).toISOString(), // ISO 8601 for events too
          attributes: event.attributes,
        })),
        links: span.links,
      };
      
      console.log(JSON.stringify(output, null, 2));
    }
    
    resultCallback({ code: ExportResultCode.SUCCESS });
  }
  
  async shutdown(): Promise<void> {
    // No-op for console exporter
  }
}

/**
 * Initialize and configure the tracer provider with console exporter
 * This should be called once during application startup
 * 
 * @returns NodeTracerProvider instance
 */
export async function initializeTracerProvider(): Promise<NodeTracerProvider> {
  if (!providerInstance) {
    // Dynamic import to avoid Turbopack/ESM issues during instrumentation loading
    const { resourceFromAttributes } = await import('@opentelemetry/resources');
    
    // Resource attributes identifying this application
    const resource = resourceFromAttributes({
      [ATTR_SERVICE_NAME]: 'observability-study',
      [ATTR_SERVICE_VERSION]: '0.1.0',
      [ATTR_DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
      [ATTR_HOST_NAME]: hostname(),
    });
    
    // Configure custom console exporter with ISO 8601 timestamp formatting
    const consoleExporter = new ISO8601ConsoleSpanExporter();
    const spanProcessor = new SimpleSpanProcessor(consoleExporter);
    
    // Create tracer provider with resource attributes and span processor
    providerInstance = new NodeTracerProvider({
      resource,
      spanProcessors: [spanProcessor],
    });
  }
  
  return providerInstance;
}

/**
 * Get the tracer instance for manual span creation
 * This will be initialized after the OpenTelemetry SDK is registered
 */
export function getTracer(): Tracer {
  if (!tracerInstance) {
    tracerInstance = trace.getTracer('observability-study', '0.1.0');
  }
  return tracerInstance;
}

/**
 * Helper function to create HTTP span with semantic conventions
 * Sets span kind to SERVER for HTTP endpoint handlers
 * 
 * @param operationName - Name of the operation (e.g., "GET /api/albums")
 * @returns Span instance ready for enrichment with HTTP attributes
 */
export function createHttpSpan(operationName: string): Span {
  const tracer = getTracer();
  
  // Create span with SERVER span kind for HTTP endpoint handlers
  const span = tracer.startSpan(operationName, {
    kind: SpanKind.SERVER,
  });
  
  return span;
}

/**
 * Re-export SpanStatusCode and SpanKind for convenience in route handlers
 */
export { SpanStatusCode, SpanKind };
