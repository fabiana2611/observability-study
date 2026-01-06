# Tasks: Photo Album Organizer

**Input**: Design documents from `/specs/001-photo-album-organizer/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Per the Zero Testing Policy, NO automated tests are created. Manual verification in browser across viewports is required instead.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a Next.js App Router application with TypeScript:
- **Pages**: `app/page.tsx`, `app/album/[id]/page.tsx`, `app/photo/[id]/page.tsx`
- **API Routes**: `app/api/albums/route.ts`, `app/api/photos/[id]/route.ts`
- **Components**: `app/components/`
- **Utilities**: `app/lib/`
- **Static files**: `public/`
- **NO tests/ directory** - Zero Testing Policy (manual verification only)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Verify Next.js 16.1.1, React 19.2.3, Tailwind CSS v4 are installed (from existing package.json)
- [X] T002 [P] Install better-sqlite3 dependency for SQLite database
- [X] T003 [P] Create TypeScript types file in app/lib/types.ts (Album, Photo, AlbumListItem, etc.)
- [X] T004 Create database setup module in app/lib/db.ts with SQLite schema
- [X] T005 Create sample data seed script in scripts/seed-data.ts
- [X] T006 [P] Create localStorage wrapper utility in app/lib/storage.ts for album order persistence
- [X] T007 Add seed script to package.json scripts section
- [X] T008 [P] Configure Tailwind with custom breakpoints in tailwind.config if needed
- [X] T009 Update app/globals.css with base styles and CSS variables

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T010 Implement SQLite database schema in app/lib/db.ts (albums and photos tables with indexes)
- [X] T011 [P] Implement GET /api/albums route in app/api/albums/route.ts (returns all albums with preview)
- [X] T012 [P] Implement GET /api/albums/[id] route in app/api/albums/[id]/route.ts (returns album with photos)
- [X] T013 [P] Implement GET /api/photos/[id] route in app/api/photos/[id]/route.ts (returns photo with album context)
- [X] T014 [P] Implement GET /api/health route in app/api/health/route.ts
- [X] T015 Implement seed data script in scripts/seed-data.ts (8 cities, 15 photos each, downloads to public/sample-photos/)
- [X] T016 Run seed script to populate database and download sample photos
- [X] T017 [P] Create base layout.tsx if not exists with proper metadata
- [X] T018 [P] Update app/globals.css with Tailwind directives and responsive utility classes

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View City Albums (Priority: P1) 🎯 MVP

**Goal**: Display all city-based albums on main page with photo previews and responsive layout

**Independent Test**: Open app at localhost:3000, view main page on mobile (375px), tablet (768px), and desktop (1440px) viewports, verify albums display with city names and photo previews

### Implementation for User Story 1

- [X] T019 [P] [US1] Create AlbumCard component in app/components/AlbumCard.tsx with TypeScript types
- [X] T020 [P] [US1] Create AlbumGrid client component in app/components/AlbumGrid.tsx with album ordering logic
- [X] T021 [US1] Implement main page in app/page.tsx that fetches albums and renders AlbumGrid
- [X] T022 [US1] Add Tailwind CSS for album card styles (city name, preview image) in AlbumCard.tsx
- [X] T023 [US1] Add responsive grid layout using Tailwind (mobile: stack, tablet: grid-cols-2/3, desktop: grid-cols-3/4) in app/globals.css or AlbumGrid.tsx
- [X] T024 [US1] Implement album ordering from localStorage in AlbumGrid.tsx (client component)
- [X] T025 [US1] Add empty state for no albums in AlbumGrid.tsx
- [X] T026 [US1] Add empty album placeholder (no photos) in AlbumCard.tsx
- [X] T027 [US1] Add loading state using Suspense and loading.tsx in app/
- [X] T028 [US1] Add error boundary using error.tsx in app/ for API failure handling
- [X] T029 [US1] Ensure preview images use Next.js Image component with lazy loading

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

**Manual Verification for US1**:
1. ✅ Open localhost:3000 → Albums display grouped by city name
2. ✅ Resize to 375px → Albums stack vertically with readable city names
3. ✅ Resize to 1440px → Albums display in responsive grid layout
4. ✅ Verify preview thumbnails visible for albums with photos
5. ✅ Verify empty state placeholder shown for albums without photos

---

## Phase 4: User Story 2 - Reorder Albums via Drag and Drop (Priority: P2)

**Goal**: Enable drag-and-drop reordering of albums with persistence in localStorage

**Independent Test**: Open app at localhost:3000, drag an album to new position using mouse (desktop) or touch (mobile/tablet), verify album moves and new order persists after refresh

### Implementation for User Story 2

- [X] T030 [P] [US2] Add 'use client' directive to AlbumGrid.tsx for client-side interactivity
- [X] T031 [P] [US2] Add HTML5 Drag and Drop event listeners to AlbumCard.tsx (dragstart, dragover, drop)
- [X] T032 [P] [US2] Add Touch Events listeners for mobile drag support in AlbumGrid.tsx
- [X] T033 [US2] Implement dragstart handler with state management in AlbumGrid.tsx
- [X] T034 [US2] Implement dragover handler with visual drop zone feedback in AlbumGrid.tsx
- [X] T035 [US2] Implement drop handler (calculate new order, save to localStorage) in AlbumGrid.tsx
- [X] T036 [US2] Implement touchstart/touchmove/touchend handlers for mobile in AlbumGrid.tsx
- [X] T037 [US2] Add Tailwind CSS for dragging state visual feedback (opacity, transform) in AlbumCard.tsx
- [X] T038 [US2] Add Tailwind CSS for drop zone highlighting in AlbumGrid.tsx
- [X] T039 [US2] Ensure minimum 44×44px touch targets using Tailwind (min-h-[44px] min-w-[44px])
- [X] T040 [US2] Add drag handle icon with adequate padding for mobile grip in AlbumCard.tsx
- [X] T041 [US2] Implement invalid drop handling (revert to original position) in AlbumGrid.tsx
- [X] T042 [US2] Implement ESC key listener to cancel drag operation in AlbumGrid.tsx
- [X] T043 [US2] Test localStorage persistence and state synchronization on page refresh

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

**Manual Verification for US2**:
1. ✅ Drag album card and drop at new position → Album moves to that position
2. ✅ Hover during drag → Visual feedback indicates where album will be placed
3. ✅ Refresh page → New order is preserved (localStorage)
4. ✅ Test on mobile (375px) with touch → Drag interaction works with touch input
5. ✅ Verify touch targets are minimum 44×44px
6. ✅ Drop outside valid zone → Album returns to original position

---

## Phase 5: User Story 3 - Browse Photos Within Album (Priority: P3)

**Goal**: Navigate into albums to view photo grids, and click photos to view full-size on dedicated pages

**Independent Test**: Open app at localhost:3000, click an album, verify photos display in responsive tile grid (375px, 768px, 1440px), click a photo to navigate to detail view with back button

### Implementation for User Story 3

- [X] T044 [P] [US3] Create PhotoGrid component in app/components/PhotoGrid.tsx with TypeScript
- [X] T045 [P] [US3] Create PhotoDetail component in app/components/PhotoDetail.tsx with TypeScript
- [X] T046 [US3] Create album detail page in app/album/[id]/page.tsx that fetches album photos
- [X] T047 [US3] Create photo detail page in app/photo/[id]/page.tsx that fetches photo detail
- [X] T048 [US3] Implement PhotoGrid with responsive Tailwind grid (grid-cols-2 md:grid-cols-3 lg:grid-cols-4-6)
- [X] T049 [US3] Add Next.js Image component with lazy loading to photo tiles in PhotoGrid.tsx
- [X] T050 [US3] Add Tailwind CSS for photo tile styles (aspect-square, object-cover, hover effects)
- [X] T051 [US3] Implement click navigation from AlbumCard to album detail page using Next.js Link
- [X] T052 [US3] Implement click navigation from photo tile to photo detail page using Next.js Link
- [X] T053 [US3] Add PhotoDetail full-size image display with album breadcrumb navigation
- [X] T054 [US3] Add back button using Next.js router.back() in PhotoDetail.tsx
- [X] T055 [US3] Add loading states using loading.tsx in app/album/[id]/ and app/photo/[id]/
- [X] T056 [US3] Add error handling using error.tsx in app/album/[id]/ and app/photo/[id]/
- [X] T057 [US3] Implement 404 handling for non-existent albums/photos using not-found.tsx
- [X] T058 [US3] Optimize photo loading performance with Next.js Image priority for above-fold images
- [X] T059 [US3] Test browser back button navigation between pages

**Checkpoint**: All user stories should now be independently functional

**Manual Verification for US3**:
1. ✅ Click album card → Navigates to album detail view with all photos
2. ✅ Album detail view → Photos appear in tile/grid layout
3. ✅ View on mobile (375px) → Tiles adapt to single or two-column grid
4. ✅ View on desktop (1440px) → Tiles display in multi-column responsive grid (4-6 columns)
5. ✅ Click photo tile → Navigates to photo detail page showing full-size photo
6. ✅ Click back button → Returns to album detail view
7. ✅ Click back again → Returns to main page with albums displayed
8. ✅ Scroll in album with many photos → Photos load and display smoothly

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and edge cases

- [X] T060 [P] Add Tailwind CSS for long city names (truncate, ellipsis) with hover tooltip in AlbumCard.tsx
- [X] T061 [P] Add loading spinner/skeleton components using Tailwind in app/components/
- [X] T062 [P] Add smooth scrolling behavior to photo grids using Tailwind scroll-smooth
- [X] T063 [P] Optimize Next.js Image component sizes and quality settings
- [X] T064 Add global not-found.tsx for 404 handling with redirect to home
- [X] T065 Test edge case: empty database (no albums) shows empty state
- [X] T066 Test edge case: album with zero photos shows placeholder
- [X] T067 Test edge case: only one album (drag-drop still works but no reorder effect)
- [X] T068 Test localStorage unavailable (falls back to default order)
- [X] T069 Add ARIA labels and keyboard navigation support (Tab, Enter, Escape)
- [X] T070 Run ESLint with TypeScript rules and fix all issues
- [X] T071 Verify performance targets (SC-001: <2s album load, SC-005: <1s photo load)
- [X] T072 Run through all acceptance scenarios from spec.md manually
- [X] T073 Test responsive design at 375px, 768px, and 1440px viewports
- [X] T074 Create production build with `npm run build` and verify output
- [X] T075 [P] Update README.md with project description and quickstart instructions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Enhances US1 but US1 must exist first (albums to drag)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Extends US1 (clicks on albums) but independently testable

### Within Each User Story

**User Story 1**:
- T026-T027 (CSS + API module) can run in parallel
- T028-T036 sequential (rendering → order → cards → layout → states → integration)

**User Story 2**:
- T037-T038 (desktop + mobile event listeners) can run in parallel
- T039-T042 sequential (drag handlers in order)
- T043-T046 (CSS styles) can run in parallel after handlers exist
- T047-T049 (edge cases + persistence) sequential after core drag-drop works

**User Story 3**:
- T050-T052 (CSS + modules) can run in parallel
- T053-T056 (album detail view) sequential
- T057-T058 (navigation integration) sequential after view exists
- T059-T063 (photo detail page) sequential
- T064-T067 (back button + error handling) sequential after pages exist

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2 constraints)
- Once Foundational phase completes:
  - US1, US2, US3 can be developed in parallel by different team members
  - Within each story, tasks marked [P] can run in parallel
- All Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch in parallel:
T026 [P] [US1] Create albums.css with album card styles
T027 [P] [US1] Create albums.js module with fetchAlbums function

# Then sequential:
T028 [US1] Implement album list rendering (depends on T027)
T029 [US1] Apply custom album order (depends on T028)
# ... and so on
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T009)
2. Complete Phase 2: Foundational (T010-T025) ⚠️ CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T026-T036)
4. **STOP and VALIDATE**: Manual test User Story 1 per acceptance scenarios
5. Deploy/demo if ready (basic photo album viewer works!)

**Estimated MVP**: ~36 tasks

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (T001-T025)
2. Add User Story 1 → Test independently → Deploy/Demo (MVP! - T026-T036)
3. Add User Story 2 → Test independently → Deploy/Demo (drag-drop! - T037-T049)
4. Add User Story 3 → Test independently → Deploy/Demo (photo browsing! - T050-T067)
5. Polish phase → Final refinements (T068-T083)

**Each story adds value without breaking previous stories.**

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T025)
2. Once Foundational is done:
   - Developer A: User Story 1 (T026-T036)
   - Developer B: User Story 2 (T037-T049) *waits for US1 T036 completion*
   - Developer C: User Story 3 (T050-T067) *waits for US1 T036 completion*
3. Stories complete and integrate independently
4. Team tackles Polish together (T068-T083)

---

## Summary

**Total Tasks**: 75 tasks
- **Phase 1 (Setup)**: 9 tasks
- **Phase 2 (Foundational)**: 9 tasks (BLOCKING)
- **Phase 3 (US1)**: 11 tasks 🎯 MVP
- **Phase 4 (US2)**: 14 tasks
- **Phase 5 (US3)**: 16 tasks
- **Phase 6 (Polish)**: 16 tasks

**Parallel Opportunities**: 22 tasks marked [P] can run in parallel within their phases

**MVP Scope**: Phases 1-3 (29 tasks) delivers working photo album viewer

**Story Distribution**:
- User Story 1: 11 tasks (view albums)
- User Story 2: 14 tasks (drag-drop reorder)
- User Story 3: 16 tasks (browse photos + detail view)

**Tech Stack**: Next.js 16.1.1 + React 19.2.3 + TypeScript 5 + Tailwind CSS v4 + better-sqlite3

**Independent Testing**: Each user story has clear verification steps that can be manually tested in browser

**Suggested Next Steps**:
1. Review tasks with team
2. Assign tasks to developers
3. Start with Phase 1 (Setup)
4. Complete Phase 2 (Foundational) before any user story work
5. Implement User Story 1 first (MVP)
6. Test independently before moving to US2/US3

---

## Notes

- No automated tests per Zero Testing Policy - manual verification in browser required
- All [P] tasks = different files, no dependencies within that parallel set
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Stop at any checkpoint to validate story independently before continuing
- Commit after each task or logical group of tasks
- Use Next.js App Router patterns (Server Components for data, Client Components for interactivity)
- Leverage Tailwind CSS utility classes for all styling
- Use TypeScript strict mode for type safety
- Verify responsive design at 375px, 768px, and 1440px viewports
