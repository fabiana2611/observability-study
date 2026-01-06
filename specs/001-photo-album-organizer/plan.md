# Implementation Plan: Photo Album Organizer

**Branch**: `001-photo-album-organizer` | **Date**: 2026-01-06 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-photo-album-organizer/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a responsive photo album organizer that displays city-based albums with drag-and-drop reordering capability. Users can browse photos in tile grids and view full-size photos on dedicated pages. Technical approach uses Next.js App Router with TypeScript for the full-stack application, local file system for photo storage, and SQLite for metadata persistence. No upload functionality - sample data provided for prototype testing (8 city albums with 15 photos each, 120 total).

## Technical Context

**Language/Version**: TypeScript 5, Next.js 16.1.1, React 19.2.3  
**Primary Dependencies**: Tailwind CSS v4, better-sqlite3 (for SQLite database)  
**Storage**: SQLite database for album/photo metadata; local file system for photo files  
**Testing**: N/A (Zero Testing Policy - manual verification only)  
**Target Platform**: Web browsers (mobile-first responsive: 320px-2560px+)  
**Project Type**: Next.js App Router web application with API routes for file/DB access  
**Performance Goals**: <2s album list load (8 albums), <1s album detail load (15 photos per album), <5s drag-drop operation  
**Constraints**: No photo upload, no external cloud services, localStorage for album order persistence, React Server Components for data fetching  
**Scale/Scope**: Prototype with 8 city albums, 15 photos per album (120 total photos)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Code Quality**: Uses TypeScript with strict types, follows Next.js 16.1.1/React 19.2.3/Tailwind CSS v4 conventions
- [x] **Simple UX**: Interface is immediately understandable, minimal clicks, familiar drag-drop patterns
- [x] **Responsive Design**: Works mobile-first across 320px-2560px+ viewports (375px, 768px, 1440px tested)
- [x] **Minimal Dependencies**: Only better-sqlite3 beyond Next.js/React/Tailwind/TypeScript core stack
- [x] **Zero Testing**: NO test files, test frameworks, or test scripts (manual verification only)

**Note**: This feature fully aligns with constitution. Using Next.js App Router for server-side data fetching and API routes for database access.

## Project Structure

### Documentation (this feature)

```text
specs/001-photo-album-organizer/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (generated below)
├── data-model.md        # Phase 1 output (generated below)
├── quickstart.md        # Phase 1 output (generated below)
├── contracts/           # Phase 1 output (generated below)
│   └── api.yaml        # API endpoints specification
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── page.tsx                    # Main page - album list
├── album/
│   └── [id]/
│       └── page.tsx            # Album detail page - photo grid
├── photo/
│   └── [id]/
│       └── page.tsx            # Photo detail page - full size view
├── api/
│   ├── albums/
│   │   ├── route.ts            # GET /api/albums - list all albums
│   │   └── [id]/
│   │       └── route.ts        # GET /api/albums/:id - album with photos
│   ├── photos/
│   │   └── [id]/
│   │       └── route.ts        # GET /api/photos/:id - photo detail
│   └── health/
│       └── route.ts            # GET /api/health - health check
├── components/
│   ├── AlbumCard.tsx           # Album card component
│   ├── AlbumGrid.tsx           # Album grid with drag-drop
│   ├── PhotoGrid.tsx           # Photo tile grid
│   └── PhotoDetail.tsx         # Full-size photo display
├── lib/
│   ├── db.ts                   # SQLite database setup
│   ├── seed.ts                 # Sample data generator script
│   ├── storage.ts              # localStorage wrapper for album order
│   └── types.ts                # TypeScript type definitions
├── globals.css                 # Global Tailwind styles
└── layout.tsx                  # Root layout

public/
└── sample-photos/              # Sample photo files (served statically)

scripts/
└── seed-data.ts                # CLI script to populate database

# NO tests/ directory - Zero Testing Policy
```

**Structure Decision**: Next.js App Router with TypeScript for full-stack application. API routes handle database queries and file system access. React Server Components fetch data server-side. Client components handle interactive features (drag-drop, localStorage). Tailwind CSS for styling.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - feature fully aligns with constitution principles.

---

## Phase 0: Research & Technical Decisions

**Status**: ✅ Complete

See [research.md](research.md) for detailed findings on:
1. Drag-and-Drop Implementation (HTML5 DnD + Touch Events)
2. Next.js App Router Navigation (Dynamic routes with Server/Client Components)
3. SQLite Setup and Schema Design (better-sqlite3 with normalized schema)
4. Album Order Persistence (localStorage)
5. Responsive Image Loading (next/image with lazy loading)
6. Next.js API Routes Development (Route Handlers for database access)
7. Sample Data Generation (Unsplash photos, 8 cities)
8. Touch Target Accessibility (44×44px minimum with Tailwind)

**Key Decisions**:
- Use native browser APIs (no drag-drop library)
- SQLite with better-sqlite3 for metadata storage
- Next.js App Router with file-based routing
- localStorage for album order (client-side only)

---

## Phase 1: Design & Contracts

**Status**: ✅ Complete

### Artifacts Generated

1. **Data Model** ([data-model.md](data-model.md))
   - Albums table schema (id, city_name, created_at)
   - Photos table schema (id, album_id, file_path, display_order)
   - Client-side state (AlbumOrder in localStorage, UIState in memory)
   - API response models (AlbumListItem, AlbumDetail, PhotoDetail)
   - State transition flows (reordering, navigation, error handling)

2. **API Contracts** ([contracts/api.yaml](contracts/api.yaml))
   - `GET /api/albums` - List all albums with preview
   - `GET /api/albums/:id` - Album detail with photos
   - `GET /api/photos/:id` - Photo detail with album context
   - `GET /api/health` - Health check endpoint
   - OpenAPI 3.0 specification with full schemas

3. **Quickstart Guide** ([quickstart.md](quickstart.md))
   - Prerequisites (Node.js 18+)
   - Setup instructions (install, seed, dev servers)
   - Manual testing procedures for P1/P2/P3 user stories
   - Troubleshooting guide
   - Development workflow

### Architecture Summary

**Full-Stack** (Next.js App Router):
- `app/page.tsx` → Homepage (Server Component)
- `app/album/[id]/page.tsx` → Album detail (Server Component)
- `app/photo/[id]/page.tsx` → Photo detail (Server Component)
- `app/components/` → AlbumGrid.tsx, PhotoGrid.tsx (Client Components for interactivity)
- `app/lib/` → db.ts (SQLite), storage.ts (localStorage wrapper), types.ts
- `app/globals.css` → Tailwind CSS with custom utilities

**API Layer** (Next.js API Routes):
- `app/api/albums/route.ts` → GET /api/albums
- `app/api/albums/[id]/route.ts` → GET /api/albums/:id
- `app/api/photos/[id]/route.ts` → GET /api/photos/:id
- `scripts/seed-data.ts` → Sample data generator (8 cities, 15 photos each)

**Data Flow**:
- Server Components → Direct database queries via app/lib/db.ts
- Client Components → Fetch from API routes for dynamic updates
- Static files: `public/sample-photos/` served by Next.js

### Constitution Re-Check (Post-Design)

- [x] **Code Quality**: TypeScript with strict types, Next.js patterns, clear component boundaries, self-documenting code
- [x] **Simple UX**: 3 routes (list/detail/photo), familiar patterns (card grid, tiles, back button)
- [x] **Responsive Design**: Tailwind utilities with mobile-first breakpoints (375px/768px/1440px)
- [x] **Minimal Dependencies**: Only 1 production dep (better-sqlite3) beyond Next.js/React/Tailwind core stack
- [x] **Zero Testing**: No test files, manual verification via quickstart guide

**All gates passed. Ready for Phase 2 (task breakdown via `/speckit.tasks` command).**

---

## Implementation Readiness

### What's Defined

✅ Technical stack (Next.js + TypeScript + Tailwind + SQLite)  
✅ Database schema (2 tables, indexed, validated)  
✅ API contracts (4 endpoints, OpenAPI spec)  
✅ Data model (entities, relationships, state transitions)  
✅ File structure (Next.js App Router organization)  
✅ Sample data (8 albums, 120 photos)  
✅ Development setup (scripts, commands, workflow)  
✅ Manual test procedures (P1/P2/P3 acceptance scenarios)

### What's Next

🔲 Run `/speckit.tasks` to generate tasks.md ✅ COMPLETE 
🔲 Install better-sqlite3 dependency
🔲 Create TypeScript types and database utilities  
🔲 Implement API routes (albums, photos, health)  
🔲 Implement pages and components (Server + Client)  
🔲 Manual verification against acceptance criteria  
🔲 Performance testing (SC-001 to SC-009)

---

## References

- **Specification**: [spec.md](spec.md) - User stories, requirements, success criteria
- **Research**: [research.md](research.md) - Technical decisions and alternatives
- **Data Model**: [data-model.md](data-model.md) - Schemas, entities, state flows
- **API Contracts**: [contracts/api.yaml](contracts/api.yaml) - OpenAPI specification
- **Quickstart**: [quickstart.md](quickstart.md) - Setup and testing guide
- **Constitution**: `/Users/fabiana.araujo/Development/studies/observability/observability-study/.specify/memory/constitution.md`

**Plan Status**: ✅ Complete (Phases 0-1 done)  
**Next Command**: `/speckit.tasks` to break down into implementation tasks  
**Branch**: `001-photo-album-organizer`
