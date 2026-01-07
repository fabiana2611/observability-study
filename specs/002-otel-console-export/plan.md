# Implementation Plan: Zero-Code OpenTelemetry Observability with Console Export

**Branch**: `002-otel-console-export` | **Date**: January 7, 2026 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from [specs/002-otel-console-export/spec.md](spec.md)

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Enable automatic zero-code observability for the Next.js photo album application by integrating OpenTelemetry instrumentation. The system will automatically capture traces from API routes and Server Components, then export telemetry data to the console in default OpenTelemetry format for development debugging and performance analysis.

## Technical Context

**Language/Version**: TypeScript 5, Next.js 16.1.1, React 19.2.3  
**Primary Dependencies**: 
- Existing: Tailwind CSS v4, better-sqlite3 ^12.5.0
- New (Required): @opentelemetry/sdk-node, @opentelemetry/auto-instrumentations-node (minimal set for zero-code behavior)  
**Storage**: better-sqlite3 (existing data layer - telemetry will observe database operations)  
**Testing**: N/A (Zero Testing Policy - manual verification only)  
**Target Platform**: Web browsers (mobile-first responsive) + Node.js server runtime  
**Project Type**: Web (Next.js App Router with server-side rendering)  
**Performance Goals**: Telemetry overhead <5% of request time (SC-006), telemetry export latency <1 second (SC-001)  
**Constraints**: 
- **TRUE zero-code**: No custom code files for developers to manage (study purpose - observe default OpenTelemetry behavior)
- 100% capture rate without sampling (FR-011)
- Accept default OpenTelemetry console output format (verbose JSON, not human-optimized)
- Use environment variables for configuration instead of code
- No custom filtering (study purpose - observe default SDK behavior)  
**Scale/Scope**: Single Next.js application, ~10 API routes, ~5 page components, development/study environment (not production-scale)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Initial Evaluation** (Pre-Research):
- [x] **Code Quality**: Uses TypeScript with strict types, follows Next.js/React/Tailwind conventions
  - *Status*: PASS - OpenTelemetry SDK provides TypeScript types, configuration will use TypeScript
- [ ] **Simple UX**: Interface is immediately understandable, minimal clicks, familiar patterns
  - *Status*: N/A - This is backend/infrastructure feature with no UI impact
- [x] **Responsive Design**: Works mobile-first across 320px-2560px+ viewports
  - *Status*: N/A - No UI changes, telemetry is server-side only and exports to console
- [ ] **Minimal Dependencies**: No unnecessary packages beyond Next.js/React/Tailwind/TypeScript stack
  - *Status*: NEEDS EVALUATION (deferred to Phase 0 research)
  - *Justification Preview*: OpenTelemetry is the feature requirement (not optional)
- [x] **Zero Testing**: NO test files, test frameworks, or test scripts (manual verification only)
  - *Status*: PASS - No tests will be added, manual verification via console output inspection

**Post-Design Evaluation** (After Phase 1):
- [x] **Code Quality**: PASS ✓
  - TypeScript configuration uses strict types
  - Follows Next.js instrumentation hook conventions (`instrumentation.ts` / `instrumentation.node.ts`)
  - OpenTelemetry SDK fully typed with @opentelemetry/api types
- [ ] **Simple UX**: N/A (no UI changes)
- [x] **Responsive Design**: N/A (no UI changes)
- [x] **Minimal Dependencies**: JUSTIFIED VIOLATION ✓
  - **Violation**: Adds 5 new packages (@opentelemetry/sdk-node, auto-instrumentations-node, sdk-trace-node, resources, semantic-conventions)
  - **Justification**: OpenTelemetry is the core feature requirement (FR-001 requires zero-code instrumentation which necessitates auto-instrumentation packages). Cannot achieve observability without these dependencies. Research phase confirmed this is the minimal viable package set.
  - **Alternatives Rejected**: Manual instrumentation (violates FR-001), custom HTTP middleware (incomplete coverage), proprietary solutions (not open source)
- [x] **Zero Testing**: PASS ✓
  - No test files created
  - Manual verification checklist defined in quickstart.md
  - Validation via console output inspection

**GATE STATUS**: ✅ PASS (1 justified violation, all others pass or N/A)

## Project Structure

### Documentation (this feature)

```text
specs/002-otel-console-export/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output - OpenTelemetry package evaluation
├── data-model.md        # Phase 1 output - Telemetry data structures
├── quickstart.md        # Phase 1 output - Developer setup guide
├── contracts/           # Phase 1 output - Console output format schemas
│   └── telemetry-output.yaml  # Expected console output structure
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Observability Infrastructure (MINIMAL - 1 file only)
instrumentation.ts       # Next.js hook - barebone import only (~5 lines, no logic)

# Existing Next.js App Router Structure (NO CHANGES to application code)
app/
├── api/                # Existing API routes (auto-instrumented)
│   ├── albums/
│   │   ├── route.ts   # Traced automatically (no code changes)
│   │   └── [id]/route.ts
│   ├── photos/
│   │   └── [id]/route.ts
│   └── health/route.ts
├── album/[id]/page.tsx # Server Component (auto-instrumented)
├── photo/[id]/page.tsx # Server Component (auto-instrumented)
├── components/         # Client components (NOT instrumented per scope)
├── lib/
│   ├── db.ts          # Database operations (auto-instrumented)
│   ├── storage.ts
│   └── types.ts
├── layout.tsx         # Root layout
└── page.tsx           # Home page (Server Component, auto-instrumented)

# Configuration
package.json            # Updated with OpenTelemetry dependencies
next.config.ts          # Enable instrumentation hook
.env.local              # OpenTelemetry configuration via environment variables

# NO instrumentation.node.ts - using default SDK behavior
# NO lib/telemetry/ directory - zero custom code
# NO custom exporters, processors, or formatters
# NO tests/ directory - Zero Testing Policy
```

**Structure Decision**: TRUE zero-code approach for study purposes. Only `instrumentation.ts` is required (Next.js framework requirement), containing ~5 lines of barebone import with no custom logic. All configuration via environment variables. Output uses default OpenTelemetry format (verbose but complete). This allows studying pure OpenTelemetry behavior without custom code layers.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Minimal Dependencies (4+ new packages) | OpenTelemetry requires SDK + auto-instrumentation + exporters as separate packages per its architecture | Cannot achieve zero-code observability without OpenTelemetry's auto-instrumentation packages; manual instrumentation would violate FR-001 |

---

## Planning Summary

**Status**: ✅ COMPLETE

### Phases Completed

**Phase 0: Research** → [research.md](research.md)
- ✓ Evaluated OpenTelemetry package selection for Next.js
- ✓ Designed console output format (default OTLP JSON)
- ✓ Determined Server Component instrumentation strategy (HTTP-level auto-instrumentation)
- ✓ Validated performance budget approach

**Phase 1: Design & Contracts** → [data-model.md](data-model.md), [contracts/](contracts/), [quickstart.md](quickstart.md)
- ✓ Documented telemetry entity structure (Trace, Span, SpanAttributes, SpanEvent, Resource)
- ✓ Created console output contract schema (telemetry-output.yaml)
- ✓ Wrote developer quickstart guide with setup instructions
- ✓ Updated agent context with OpenTelemetry knowledge

**Phase 2: Task Breakdown** → NOT STARTED
- Use `/speckit.tasks` command to generate [tasks.md](tasks.md) with implementation checklist

### Key Decisions Made

1. **TRUE Zero-Code**: Only 1 file (instrumentation.ts, 12 lines) with no custom logic
2. **Package Selection**: Minimal 2 packages (sdk-node, auto-instrumentations-node) 
3. **Console Format**: Default OTLP JSON (verbose but standard-compliant)
4. **Configuration**: Environment variables only (no code-based config)
5. **Coverage Scope**: API routes + Server Components via HTTP auto-instrumentation

### Architecture Overview

```
Application Start → instrumentation.ts (12 lines)
       ↓
OpenTelemetry SDK Init (default settings)
   - Environment variable configuration
   - Auto-instrumentation enabled
   - Default console exporter
       ↓
Application Execution (Zero Code Changes in app/)
   - HTTP requests → Auto-traced
   - Server Components → Auto-traced (part of HTTP span)
   - Database queries → Auto-traced
       ↓
Default Console Export
   - OTLP JSON format (OpenTelemetry standard)
   - Full metadata included
   - Minimal filtering (Authorization header only)
       ↓
Terminal Output (Verbose but Complete)
```

### Success Metrics Alignment

| Success Criteria | How Addressed |
|------------------|---------------|
| SC-001: <1s export latency | Console export is synchronous |
| SC-002: Zero manual instrumentation | Auto-instrumentation only, no manual spans |
| SC-003: 100% HTTP request capture | No sampling, always_on sampler |
| SC-004: 3+ layer correlation | HTTP → Server Component → Database linked by traceId |
| SC-005: Error context | Exception events automatic in SDK |
| SC-006: <5% overhead | SDK defaults ~1-3%, within budget |
| SC-007: 1-hour readability | JSON format (verbose, requires parsing tools) |

### Files Created

```
specs/002-otel-console-export/
├── plan.md (this file)          220 lines
├── research.md                   263 lines (zero-code approach)
├── data-model.md                 245 lines (default OTLP format)
├── quickstart.md                  95 lines (minimal setup guide)
├── contracts/
│   └── telemetry-output.yaml    335 lines (default output schema)
└── checklists/
    └── requirements.md            45 lines

Total: ~1,203 lines of planning documentation
```

### Implementation Preview

**NEW**: 1 file only
- `instrumentation.ts` (~12 lines, no logic)

**MODIFIED**: 2 files
- `package.json` (add 2 OpenTelemetry dependencies)
- `next.config.ts` (enable instrumentation hook)
- `.env.local` (add OTEL_* environment variables)

**UNCHANGED**: All application code in `app/` and `lib/`

### Next Steps

**Ready for Implementation**: Run `/speckit.tasks` to generate task breakdown

Expected tasks:
- Install 2 npm packages
- Create 12-line instrumentation.ts file
- Add environment variables to .env.local
- Enable instrumentation hook in next.config.ts
- Manual verification via console output inspection

**Estimated Implementation Time**: 10-15 minutes
