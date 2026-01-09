# Implementation Plan: Manual OpenTelemetry Trace Instrumentation

**Branch**: `003-otel-manual-traces` | **Date**: January 9, 2026 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-otel-manual-traces/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

**Co-Existence Approach**: This feature adds manual OpenTelemetry trace instrumentation alongside existing auto-instrumentation (both will run simultaneously). Manual spans will be distinguished by the "instrumentation": "manual" attribute.

Add manual trace instrumentation to all Next.js API endpoints to track HTTP requests with detailed context (method, URL, status code, timing). Export trace data as structured JSON logs to console for educational/study purposes. Manual spans will be enriched with resource attributes (service name, version, environment, hostname) and follow OpenTelemetry semantic conventions. Include full error stack traces when endpoints fail. Console output will display both auto-instrumented and manually-instrumented spans.

## Technical Context

**Language/Version**: TypeScript 5, Next.js 16.1.1, React 19.2.3  
**Primary Dependencies**: OpenTelemetry SDK Node (^0.208.0), already installed  
**Storage**: SQLite (better-sqlite3) for application data, not relevant to tracing  
**Testing**: N/A (Zero Testing Policy - manual verification only)  
**Target Platform**: Web browsers (mobile-first responsive) + Node.js server  
**Project Type**: Web (Next.js App Router)  
**Performance Goals**: N/A - Study project focused on observability learning  
**Constraints**: Console export only, manual instrumentation required, JSON output format, ISO 8601 timestamps  
**Scale/Scope**: 5 API endpoints (albums, albums/[id], photos/[id], health), educational scope

**Existing OpenTelemetry Setup**:
- Already has @opentelemetry/sdk-node and @opentelemetry/auto-instrumentations-node installed
- Current instrumentation.ts uses auto-instrumentation
- Need to ADD manual instrumentation alongside auto-instrumentation (both will co-exist)
- Add console exporter to capture both auto and manual spans

**API Endpoints to Instrument**:
- GET /api/albums (list all albums)
- GET /api/albums/[id] (get album by ID)
- GET /api/photos/[id] (get photo by ID)
- GET /api/health (health check)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Initial Check (Before Phase 0)**: ✅ PASS

- [x] **Code Quality**: Uses TypeScript with strict types, follows Next.js/React/Tailwind conventions
- [x] **Simple UX**: No UX changes - backend instrumentation only
- [x] **Responsive Design**: No frontend changes - backend instrumentation only
- [x] **Minimal Dependencies**: Uses existing @opentelemetry packages, may add console exporter only
- [x] **Zero Testing**: NO test files, test frameworks, or test scripts (manual verification only)

**Post-Design Check (After Phase 1)**: ✅ PASS

- [x] **Code Quality**: Uses TypeScript, follows Next.js conventions, adds `app/lib/tracing.ts` utility module
- [x] **Simple UX**: No UX changes - backend instrumentation only
- [x] **Responsive Design**: No frontend changes - backend instrumentation only  
- [x] **Minimal Dependencies**: Reuses installed @opentelemetry/sdk-node, no additional packages required
- [x] **Zero Testing**: Manual verification checklist in quickstart.md, no test files

## Project Structure

### Documentation (this feature)

```text
specs/003-otel-manual-traces/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── telemetry-output.yaml  # JSON console output schema
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── api/                # API route handlers (instrumentation targets)
│   ├── albums/
│   │   ├── route.ts   # GET /api/albums - to be instrumented
│   │   └── [id]/
│   │       └── route.ts  # GET /api/albums/:id - to be instrumented
│   ├── photos/
│   │   └── [id]/
│   │       └── route.ts  # GET /api/photos/:id - to be instrumented
│   └── health/
│       └── route.ts   # GET /api/health - to be instrumented
├── lib/
│   ├── db.ts         # Database utilities (no changes)
│   ├── storage.ts    # Storage utilities (no changes)
│   ├── types.ts      # Type definitions (no changes)
│   └── tracing.ts    # NEW: Manual tracing utilities
└── ...

instrumentation.ts      # MODIFY: Replace auto-instrumentation with manual setup

# NO tests/ directory - Zero Testing Policy
```

**Structure Decision**: Using Next.js App Router structure with API routes under `app/api/`. All endpoints will be manually instrumented by wrapping handler logic with OpenTelemetry span creation/completion. New `app/lib/tracing.ts` module will provide reusable utilities for span management and console export configuration.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. Feature aligns with all constitution principles:
- Uses existing TypeScript/Next.js stack
- No UI changes (backend only)
- Reuses installed OpenTelemetry packages
- No tests required per Zero Testing Policy

---

## Planning Complete

**Status**: ✅ Ready for Implementation

### Phase 0: Research - COMPLETE ✅
- [research.md](./research.md) generated with technology decisions
- All NEEDS CLARIFICATION items resolved
- No constitution violations identified

### Phase 1: Design - COMPLETE ✅
- [data-model.md](./data-model.md) generated with telemetry entities
- [contracts/telemetry-output.yaml](./contracts/telemetry-output.yaml) generated with JSON schema
- [quickstart.md](./quickstart.md) generated with usage instructions
- Agent context updated via `update-agent-context.sh`
- Constitution re-validated post-design: ✅ PASS

### Phase 2: Tasks - PENDING ⏸️
- Execute `/speckit.tasks` to generate [tasks.md](./tasks.md)
- Tasks command creates implementation checklist from this plan

### Generated Artifacts

| Artifact | Status | Description |
|----------|--------|-------------|
| plan.md | ✅ | This file - complete implementation plan |
| research.md | ✅ | Technology decisions and alternatives |
| data-model.md | ✅ | Telemetry data structures (Trace, Span, Attributes, Events) |
| contracts/telemetry-output.yaml | ✅ | OpenAPI schema for JSON console output |
| quickstart.md | ✅ | How to run and observe traces manually |
| tasks.md | ⏸️ | Implementation checklist (run `/speckit.tasks`) |

### Key Implementation Details

**Files to Create**:
- `app/lib/tracing.ts` - Tracing utility functions and console exporter setup

**Files to Modify**:
- `instrumentation.ts` - Add console exporter while keeping auto-instrumentation
- `app/api/albums/route.ts` - Add manual span instrumentation
- `app/api/albums/[id]/route.ts` - Add manual span instrumentation  
- `app/api/photos/[id]/route.ts` - Add manual span instrumentation
- `app/api/health/route.ts` - Add manual span instrumentation

**Dependencies**:
- Reuse existing @opentelemetry/sdk-node (^0.208.0)
- Keep existing @opentelemetry/auto-instrumentations-node (both auto and manual will co-exist)
- No new packages required (all needed packages bundled with SDK)

**Configuration**:
- Resource attributes: service.name, service.version, deployment.environment, host.name
- Span processor: SimpleSpanProcessor for immediate export
- Exporter: ConsoleSpanExporter for JSON output to stdout
- Semantic conventions: Use constants from @opentelemetry/semantic-conventions

**Manual Verification**:
- Start app with `npm run dev`
- Trigger each API endpoint via browser or curl
- Verify console shows JSON trace output
- Confirm all required attributes present
- Test error handling with invalid requests
- Verify concurrent requests have unique trace IDs

### Next Command

```bash
/speckit.tasks
```

This will generate the implementation task checklist in [tasks.md](./tasks.md).
