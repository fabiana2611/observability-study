/**
 * Manual OpenTelemetry Tracing Utilities
 * 
 * This module provides manual tracing infrastructure for educational purposes.
 * It configures OpenTelemetry with console export and provides helper functions
 * for creating HTTP spans with semantic conventions.
 * 
 * Co-exists with auto-instrumentation configured in instrumentation.ts
 */

import { context, trace, Span, SpanStatusCode, Tracer, SpanKind } from '@opentelemetry/api';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import type { SpanExporter, ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { ExportResult, ExportResultCode } from '@opentelemetry/core';
import { hostname } from 'os';
import type {
  EndpointLogCorrelationState,
  EndpointLogEvent,
  EndpointLogLevel,
  EndpointLogOutcome,
} from '@/app/lib/types';

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

const INVALID_TRACE_ID = '00000000000000000000000000000000';
const INVALID_SPAN_ID = '0000000000000000';
const ENDPOINT_LOG_EVENT_NAME = 'endpoint.request.completed';
const FORBIDDEN_LOG_FIELD_PATTERN = /(?:^|_)(payload|body)$/i;
const DEFAULT_SERVICE_NAME = 'observability-study';
const DEFAULT_ENVIRONMENT = 'development';
const PREFIX_FLAG_ENV_VAR = 'ENDPOINT_LOG_PREFIX_ENABLED';

function readNonEmptyEnvValue(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function resolveServiceName(): string {
  return readNonEmptyEnvValue(process.env.OTEL_SERVICE_NAME) ?? DEFAULT_SERVICE_NAME;
}

function resolveEnvironment(): string {
  return readNonEmptyEnvValue(process.env.NODE_ENV) ?? DEFAULT_ENVIRONMENT;
}

export interface TraceCorrelationContext {
  trace_id: string | null;
  span_id: string | null;
  correlation_state: EndpointLogCorrelationState;
}

export interface EmitEndpointLogParams {
  method: string;
  route: string;
  status_code: number;
  span?: Span | null;
  duration_ms?: number;
  error_message?: string | null;
  timestamp?: string;
}

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
      [ATTR_SERVICE_NAME]: resolveServiceName(),
      [ATTR_SERVICE_VERSION]: '0.1.0',
      [ATTR_DEPLOYMENT_ENVIRONMENT]: resolveEnvironment(),
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
 * Extract trace/span identifiers for endpoint log correlation.
 * Falls back to the active context span when no explicit span is provided.
 */
export function extractTraceCorrelation(span?: Span | null): TraceCorrelationContext {
  const sourceSpan = span ?? trace.getSpan(context.active()) ?? null;

  if (!sourceSpan) {
    return {
      trace_id: null,
      span_id: null,
      correlation_state: 'missing',
    };
  }

  const spanContext = sourceSpan.spanContext();
  const hasValidContext =
    spanContext.traceId !== INVALID_TRACE_ID &&
    spanContext.spanId !== INVALID_SPAN_ID;

  if (!hasValidContext) {
    return {
      trace_id: null,
      span_id: null,
      correlation_state: 'missing',
    };
  }

  return {
    trace_id: spanContext.traceId,
    span_id: spanContext.spanId,
    correlation_state: 'present',
  };
}

function resolveEndpointOutcome(statusCode: number): EndpointLogOutcome {
  return statusCode >= 400 ? 'error' : 'success';
}

function resolveEndpointLevel(outcome: EndpointLogOutcome): EndpointLogLevel {
  return outcome === 'error' ? 'error' : 'info';
}

function normalizeEndpointLogFields(event: EndpointLogEvent): EndpointLogEvent {
  const normalizedMethod = event.method.trim().toUpperCase();
  const routeWithoutQuery = event.route.trim().split('?')[0] || '/';
  const normalizedRoute = routeWithoutQuery.startsWith('/')
    ? routeWithoutQuery
    : `/${routeWithoutQuery}`;

  const normalizedStatusCode = Number.isFinite(event.status_code)
    ? Math.max(100, Math.min(599, Math.trunc(event.status_code)))
    : 500;

  const normalizedEvent: EndpointLogEvent = {
    ...event,
    method: normalizedMethod,
    route: normalizedRoute,
    status_code: normalizedStatusCode,
  };

  if (typeof event.duration_ms === 'number') {
    normalizedEvent.duration_ms = Math.max(0, event.duration_ms);
  }

  if (typeof event.error_message === 'string') {
    const sanitizedError = event.error_message.trim();
    normalizedEvent.error_message = sanitizedError.length > 0 ? sanitizedError : null;
  }

  return normalizedEvent;
}

function alignEndpointLogEventKeys(event: EndpointLogEvent): EndpointLogEvent {
  const hasValidCorrelationIds =
    typeof event.trace_id === 'string' &&
    event.trace_id.length > 0 &&
    typeof event.span_id === 'string' &&
    event.span_id.length > 0;

  const effectiveCorrelationState: EndpointLogCorrelationState =
    event.correlation_state === 'present' && hasValidCorrelationIds
      ? 'present'
      : 'missing';

  const alignedEvent: EndpointLogEvent = {
    timestamp: event.timestamp,
    level: event.level,
    event_name: event.event_name,
    service_name: event.service_name,
    environment: event.environment,
    method: event.method,
    route: event.route,
    status_code: event.status_code,
    outcome: event.outcome,
    trace_id: effectiveCorrelationState === 'present' ? event.trace_id ?? null : null,
    span_id: effectiveCorrelationState === 'present' ? event.span_id ?? null : null,
    correlation_state: effectiveCorrelationState,
  };

  if (typeof event.duration_ms === 'number' && Number.isFinite(event.duration_ms)) {
    alignedEvent.duration_ms = event.duration_ms;
  }

  if (typeof event.error_message === 'string') {
    alignedEvent.error_message = event.error_message;
  } else if (event.error_message === null) {
    alignedEvent.error_message = null;
  }

  return alignedEvent;
}

function safeSerializeEndpointLog(event: EndpointLogEvent): string {
  const seen = new WeakSet<object>();

  return JSON.stringify(event, (key, value: unknown) => {
    // Defensive guard: never emit payload/body fields if they are accidentally introduced.
    if (key && FORBIDDEN_LOG_FIELD_PATTERN.test(key)) {
      return undefined;
    }

    if (typeof value === 'bigint') {
      return value.toString();
    }

    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }

    return value;
  });
}

function formatEndpointLogPrefix(level: EndpointLogLevel): string {
  return `[LOG ${level.toUpperCase()}]`;
}

function isEndpointLogPrefixEnabled(): boolean {
  const rawFlag = readNonEmptyEnvValue(process.env[PREFIX_FLAG_ENV_VAR]);

  if (rawFlag === null) {
    return true;
  }

  const normalizedFlag = rawFlag.toLowerCase();
  return !['0', 'false', 'no', 'off'].includes(normalizedFlag);
}

/**
 * Emit a structured endpoint completion event to stdout.
 * Returns the event object to support route-level composition and testing.
 */
export function emitEndpointLogEvent(params: EmitEndpointLogParams): EndpointLogEvent {
  const correlation = extractTraceCorrelation(params.span);
  const outcome = resolveEndpointOutcome(params.status_code);
  const level = resolveEndpointLevel(outcome);

  const event: EndpointLogEvent = {
    timestamp: params.timestamp ?? new Date().toISOString(),
    level,
    event_name: ENDPOINT_LOG_EVENT_NAME,
    service_name: resolveServiceName(),
    environment: resolveEnvironment(),
    method: params.method,
    route: params.route,
    status_code: params.status_code,
    outcome,
    correlation_state: correlation.correlation_state,
    trace_id: correlation.trace_id,
    span_id: correlation.span_id,
  };

  if (typeof params.duration_ms === 'number' && Number.isFinite(params.duration_ms)) {
    event.duration_ms = params.duration_ms;
  }

  if (typeof params.error_message === 'string' && params.error_message.length > 0) {
    event.error_message = params.error_message;
  }

  const normalizedEvent = normalizeEndpointLogFields(event);
  const alignedEvent = alignEndpointLogEventKeys(normalizedEvent);
  const serializedEvent = safeSerializeEndpointLog(alignedEvent);

  if (isEndpointLogPrefixEnabled()) {
    const logPrefix = formatEndpointLogPrefix(alignedEvent.level);
    console.log(`${logPrefix} ${serializedEvent}`);
  } else {
    console.log(serializedEvent);
  }

  return alignedEvent;
}

/**
 * Re-export SpanStatusCode and SpanKind for convenience in route handlers
 */
export { SpanStatusCode, SpanKind };
