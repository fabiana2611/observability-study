import type { Span } from '@opentelemetry/api';

// Database Entity Types

export interface Album {
  id: number;
  city_name: string;
  created_at: string;
}

export interface Photo {
  id: number;
  album_id: number;
  file_path: string;
  display_order: number;
  created_at: string;
}

// API Response Types

export interface AlbumListItem {
  id: number;
  city_name: string;
  photo_count: number;
  preview_photo: string | null;
}

export interface AlbumDetail {
  id: number;
  city_name: string;
  photos: PhotoInAlbum[];
}

export interface PhotoInAlbum {
  id: number;
  file_path: string;
  display_order: number;
}

export interface PhotoDetail {
  id: number;
  file_path: string;
  album: {
    id: number;
    city_name: string;
  };
}

// Client-Side State Types

export type AlbumOrder = number[];

export interface UIState {
  currentRoute: string;
  draggedAlbumId: number | null;
  albums: AlbumListItem[];
  currentAlbum: AlbumDetail | null;
  currentPhoto: PhotoDetail | null;
}

// Error Types

export interface ApiError {
  error: string;
  message: string;
  status: number;
}

// Endpoint Logging Types

export type EndpointLogLevel = 'info' | 'error';

export type EndpointLogOutcome = 'success' | 'error';

export type EndpointLogCorrelationState = 'present' | 'missing';

export type EndpointLogEventName = 'endpoint.request.completed';

export interface EndpointLogEvent {
  timestamp: string;
  level: EndpointLogLevel;
  event_name: EndpointLogEventName;
  service_name: string;
  environment: string;
  method: string;
  route: string;
  status_code: number;
  outcome: EndpointLogOutcome;
  correlation_state: EndpointLogCorrelationState;
  trace_id?: string | null;
  span_id?: string | null;
  duration_ms?: number;
  error_message?: string | null;
}

// API Metric Event Types

export type ApiMetricEventName = 'api.request.metric.completed';

export type ApiMetricOutcome = 'success' | 'error';

export type ApiMetricCorrelationState = 'present' | 'missing';

export type ApiMetricStatusClass = '1xx' | '2xx' | '3xx' | '4xx' | '5xx';

export interface ApiMetricEvent {
  timestamp: string;
  event_name: ApiMetricEventName;
  service_name: string;
  environment: string;
  method: string;
  route: string;
  status_code: number;
  status_class: ApiMetricStatusClass;
  outcome: ApiMetricOutcome;
  duration_ms: number;
  correlation_state: ApiMetricCorrelationState;
  trace_id?: string | null;
  span_id?: string | null;
  request_id?: string | null;
  error_message?: string | null;
}

export interface EmitApiMetricEventParams {
  method: string;
  route: string;
  status_code: number;
  duration_ms: number;
  span?: Span | null;
  status_class?: ApiMetricStatusClass;
  outcome?: ApiMetricOutcome;
  trace_id?: string | null;
  span_id?: string | null;
  request_id?: string | null;
  correlation_state?: ApiMetricCorrelationState;
  error_message?: string | null;
  service_name?: string;
  environment?: string;
  timestamp?: string;
}
