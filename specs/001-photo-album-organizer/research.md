# Research: Photo Album Organizer

**Feature**: Photo Album Organizer | **Date**: 2026-01-06  
**Purpose**: Resolve technical unknowns and establish best practices for implementation

---

## 1. Drag-and-Drop Implementation (Vanilla JavaScript)

**Question**: What's the best approach for drag-and-drop with vanilla JS that works on both desktop and mobile?

**Decision**: Use native HTML5 Drag and Drop API for desktop + Touch Events API for mobile

**Rationale**:
- HTML5 Drag and Drop API (`dragstart`, `dragover`, `drop`) provides built-in desktop support
- Touch Events API (`touchstart`, `touchmove`, `touchend`) required for mobile devices
- Avoids heavy libraries (e.g., SortableJS, dragula) keeping bundle minimal
- Both APIs are well-supported across modern browsers

**Alternatives Considered**:
- **Pointer Events API**: Unified API for mouse/touch/pen, but requires polyfill for Safari < 13
- **Third-party library (SortableJS)**: Handles both inputs but adds ~20KB, violates minimal dependencies principle
- **CSS-only approaches**: Cannot persist order or provide complex feedback

**Implementation Pattern**:
```javascript
// Desktop: HTML5 Drag and Drop
element.draggable = true;
element.addEventListener('dragstart', handleDragStart);
element.addEventListener('dragover', handleDragOver);
element.addEventListener('drop', handleDrop);

// Mobile: Touch Events
element.addEventListener('touchstart', handleTouchStart);
element.addEventListener('touchmove', handleTouchMove);
element.addEventListener('touchend', handleTouchEnd);
```

**References**:
- MDN: HTML5 Drag and Drop API
- MDN: Touch Events API
- CSS-Tricks: "Drag and Drop with Vanilla JS"

---

## 2. Next.js App Router Navigation

**Question**: How to handle navigation between album list, photo grid, and photo detail in Next.js?

**Decision**: Use Next.js App Router with dynamic routes and Server/Client Components

**Rationale**:
- Next.js App Router provides file-based routing with zero configuration
- Dynamic routes (`[id]`) automatically parse parameters
- Server Components for data fetching, Client Components for interactivity
- Built-in prefetching and caching improves performance
- No custom router needed - leverages Next.js conventions

**Alternatives Considered**:
- **Pages Router**: Older Next.js pattern, less optimal for server-first architecture
- **Client-side routing library**: Unnecessary with Next.js built-in routing
- **Hash-based routing**: Not needed with Next.js server-side capabilities

**Implementation Pattern**:
```typescript
// app/page.tsx (Server Component for homepage)
export default async function Home() {
  const albums = await fetchAlbums();
  return <AlbumGrid albums={albums} />;
}

// app/album/[id]/page.tsx (Dynamic route for album detail)
export default async function AlbumPage({ params }: { params: { id: string } }) {
  const album = await fetchAlbum(params.id);
  return <PhotoGrid album={album} />;
}

// app/photo/[id]/page.tsx (Dynamic route for photo detail)
export default async function PhotoPage({ params }: { params: { id: string } }) {
  const photo = await fetchPhoto(params.id);
  return <PhotoDetail photo={photo} />;
}
```

**References**:
- Next.js Documentation: App Router
- Next.js Documentation: Dynamic Routes
- Next.js Documentation: Server and Client Components

---

## 3. SQLite Setup and Schema Design

**Question**: How to structure SQLite database for albums and photos with optimal query performance?

**Decision**: Use better-sqlite3 (Node.js) with normalized schema (albums + photos tables with foreign key)

**Rationale**:
- better-sqlite3 is fastest synchronous SQLite library for Node.js
- Normalized design allows independent photo queries and album metadata
- Foreign keys ensure referential integrity (photos belong to albums)
- Simple schema supports future features (e.g., tags, dates)

**Alternatives Considered**:
- **Single table (denormalized)**: Duplicates album data per photo, harder to reorder albums
- **JSON column for photos**: Non-standard queries, poor indexing
- **sql.js (browser SQLite)**: Requires loading entire DB into browser memory, overkill for 200 photos

**Schema**:
```sql
CREATE TABLE albums (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  city_name TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  album_id INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
);

CREATE INDEX idx_photos_album_id ON photos(album_id);
CREATE INDEX idx_photos_display_order ON photos(album_id, display_order);
```

**References**:
- better-sqlite3 documentation
- SQLite optimization guide (indexing best practices)

---

## 4. Album Order Persistence

**Question**: Where to store user's custom album ordering (localStorage vs database)?

**Decision**: Store in browser localStorage as array of album IDs

**Rationale**:
- Spec explicitly mentions "browser localStorage as reasonable default" (FR-006)
- Per-browser customization (different users on same device can have different orders)
- No backend changes needed for order updates (instant UI response)
- Falls back to default order (alphabetical by city) if localStorage unavailable

**Alternatives Considered**:
- **Database column (display_order)**: Requires server round-trip on every reorder, slower UX
- **Cookies**: Limited size (4KB), overkill for simple array
- **IndexedDB**: Over-engineered for single key-value pair

**Implementation Pattern**:
```javascript
// storage.js
const STORAGE_KEY = 'album-order';

export function saveAlbumOrder(albumIds) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(albumIds));
}

export function loadAlbumOrder() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : null;
}

// Merge with fetched albums
function applyCustomOrder(albums, customOrder) {
  if (!customOrder) return albums; // Default order
  const orderMap = new Map(albums.map(a => [a.id, a]));
  return customOrder.map(id => orderMap.get(id)).filter(Boolean);
}
```

**References**:
- MDN: Web Storage API (localStorage)
- Spec: FR-006, FR-007

---

## 5. Responsive Image Loading

**Question**: How to optimize photo loading for different viewport sizes and slow connections?

**Decision**: Use native `<img>` with `loading="lazy"` + CSS responsive sizing (no server-side resizing yet)

**Rationale**:
- Native lazy loading supported in all modern browsers (Chrome 76+, Firefox 75+, Safari 15.4+)
- Automatically defers off-screen images, improves initial load time
- CSS `object-fit: cover` handles aspect ratio without distortion
- Server-side image resizing can be added later if needed (out of MVP scope)

**Alternatives Considered**:
- **Intersection Observer API**: Manual lazy loading, more complex, unnecessary with native support
- **Responsive images (`srcset`)**: Requires generating multiple image sizes, adds complexity
- **Progressive JPEGs**: Requires image processing pipeline, out of scope

**Implementation Pattern**:
```css
/* PhotoGrid.tsx */
<Image 
  src={`/sample-photos/${photo.file_path}`}
  alt={photo.caption}
  width={200}
  height={200}
  loading="lazy"
  className="object-cover"
/>

/* Responsive grid with Tailwind */
<div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4 md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
  {photos.map(photo => <PhotoCard key={photo.id} photo={photo} />)}
</div>
```

**References**:
- Next.js Documentation: Image Optimization
- Next.js Documentation: `next/image` component
- Spec: SC-005 (load within 1 second)

---

## 6. Next.js API Routes Development

**Question**: How to structure API routes in Next.js App Router for albums and photos?

**Decision**: Use Next.js API Routes with Route Handlers (`app/api/*/route.ts`) and better-sqlite3

**Rationale**:
- Route Handlers provide file-based API routing with zero configuration
- Supports HTTP methods (GET, POST, etc.) through named exports
- Runs in same process as Next.js server (no separate backend needed)
- better-sqlite3 works in Node.js environment (API routes run server-side)
- Type-safe with TypeScript interfaces

**Implementation Pattern**:
```typescript
// app/api/albums/route.ts
import { NextResponse } from 'next/server';
import { getAlbums } from '@/lib/db';

export async function GET() {
  const albums = await getAlbums();
  return NextResponse.json(albums);
}

// app/api/albums/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const album = await getAlbumById(params.id);
  if (!album) {
    return NextResponse.json({ error: 'Album not found' }, { status: 404 });
  }
  return NextResponse.json(album);
}
```

**Alternatives Considered**:
- **Separate Express backend**: Requires running two servers, more complex deployment
- **tRPC**: Overkill for simple REST API, adds ~50KB bundle size
- **GraphQL**: Too complex for 4 endpoints, increases learning curve

**References**:
- Next.js Documentation: Route Handlers
- Next.js Documentation: Server Actions
- better-sqlite3 Documentation

---

## 7. Sample Data Generation

**Question**: What sample photos and cities to use for prototype testing?

**Decision**: Use public domain placeholder images from Unsplash Source API + 8 cities with 15 photos each

**Rationale**:
- Unsplash Source provides free, high-quality photos by category (city, landscape)
- 8 cities × 15 photos = 120 photos (within 50-200 target range)
- Diverse cities demonstrate responsive layout across name lengths
- Seed script can fetch and cache images locally for offline development

**Sample Cities**:
- Paris, Tokyo, New York, Barcelona, Sydney, Amsterdam, Rio, Dubai

**Alternatives Considered**:
- **Lorem Picsum**: Generic placeholders, less thematic for city albums
- **Local photos**: Requires sourcing/licensing, complicates repo size
- **CSS gradients**: Not realistic for photo app prototype

**Seed Script Pattern**:
```typescript
// scripts/seed.ts
const cities = ['Paris', 'Tokyo', 'New York', ...];
const PHOTOS_PER_ALBUM = 15;

cities.forEach((city, cityIndex) => {
  const albumId = db.prepare('INSERT INTO albums (city_name) VALUES (?)').run(city).lastInsertRowid;
  
  for (let i = 0; i < PHOTOS_PER_ALBUM; i++) {
    const filePath = `/sample-photos/${city.toLowerCase().replace(' ', '-')}-${i + 1}.jpg`;
    db.prepare('INSERT INTO photos (album_id, file_path, display_order) VALUES (?, ?, ?)').run(albumId, filePath, i);
  }
});
```

**References**:
- Unsplash Source API
- Spec: FR-016 (8 city albums with 15 photos each, 120 total)

---

## 8. Touch Target Accessibility

**Question**: How to ensure 44×44px minimum touch targets on mobile without breaking desktop layout?

**Decision**: Use Tailwind utilities for responsive touch targets + padding adjustments

**Rationale**:
- WCAG 2.1 Level AAA recommends 44×44px for touch targets
- Tailwind responsive modifiers (sm:, md:) simplify mobile-first approach
- Padding increases clickable area without affecting visual size
- Desktop can use smaller visual elements with adequate spacing
- Drag handles need extra padding on mobile for grip area

**Implementation Pattern**:
```tsx
/* Base touch target with Tailwind */
<button className="min-h-[44px] p-3 cursor-pointer md:min-h-0 md:p-2">
  Album Card
</button>

/* Mobile drag handle */
<div className="min-w-[44px] min-h-[44px] p-3 md:p-2">
  ⋮⋮
</div>
```

**References**:
- WCAG 2.1: Success Criterion 2.5.5 (Target Size)
- Apple HIG: Touch targets
- Spec: FR-008, SC-009

---

## Summary of Technical Stack

| Layer | Technology | Justification |
|-------|------------|---------------|
| **Frontend** | Next.js 16.1.1 + React 19.2.3 | File-based routing, Server Components, built-in API routes |
| **Language** | TypeScript 5 | Type safety, constitution requirement, better DX |
| **Styling** | Tailwind CSS v4 | Utility-first, responsive design, minimal custom CSS |
| **Database** | SQLite (better-sqlite3) | Embedded, no separate server, perfect for local app |
| **API** | Next.js API Routes | Integrated with app, no separate backend needed |
| **Drag-Drop** | HTML5 DnD + Touch Events | Native APIs, no library needed |
| **State** | localStorage + React hooks | Album order persists, useState for client state |
| **Images** | next/image | Automatic optimization, lazy loading, responsive images |

**All unknowns from Technical Context resolved. Ready for Phase 1 implementation.**
