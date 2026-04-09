# observability-study Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-06

## Active Technologies
- TypeScript 5, Next.js 16.1.1, React 19.2.3 (002-otel-console-export)
- better-sqlite3 (existing data layer - telemetry will observe database operations) (002-otel-console-export)
- TypeScript 5, Next.js 16.1.1, React 19.2.3 + OpenTelemetry SDK Node (^0.208.0), already installed (003-otel-manual-traces)
- SQLite (better-sqlite3) for application data, not relevant to tracing (003-otel-manual-traces)
- TypeScript 5, Next.js 16.1.1, React 19.2.3 + Existing OpenTelemetry packages in package.json, Next.js runtime APIs (004-trace-correlated-logs)
- SQLite (better-sqlite3) for app data only; endpoint logs are not persisted (004-trace-correlated-logs)

- JavaScript ES6+ (vanilla), HTML5, CSS3 + Vite (build tool), SQLite (better-sqlite3 for Node.js backend) (001-photo-album-organizer)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

JavaScript ES6+ (vanilla), HTML5, CSS3: Follow standard conventions

## Recent Changes
- 004-trace-correlated-logs: Added TypeScript 5, Next.js 16.1.1, React 19.2.3 + Existing OpenTelemetry packages in package.json, Next.js runtime APIs
- 003-otel-manual-traces: Added TypeScript 5, Next.js 16.1.1, React 19.2.3 + OpenTelemetry SDK Node (^0.208.0), already installed
- 002-otel-console-export: Added TypeScript 5, Next.js 16.1.1, React 19.2.3


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
