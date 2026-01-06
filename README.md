# Observability Study

## About

This project has as purpose study of observability. For that, the `observability/` folder has the first configuration for this goal, and a Photo Application was created using [GitHub Spec Kit](https://github.com/github/spec-kit/tree/main), to be used to produce metrics, traces and logs.

## Photo Album Organizer

A responsive photo album viewer built with Next.js 16, React 19, and TypeScript. View city-based photo albums, browse photos, and reorder albums with drag-and-drop.

## Features

- **📸 View Albums**: Browse city-based photo albums with preview thumbnails
- **🎯 Drag & Drop**: Reorder albums with mouse or touch (persists to localStorage)
- **🖼️ Photo Browsing**: Click albums to view photo grids, click photos for full-size view
- **📱 Responsive Design**: Optimized for mobile (375px), tablet (768px), and desktop (1440px+)
- **♿ Accessible**: ARIA labels, keyboard navigation (Tab, Enter, Space, Escape)
- **🌙 Dark Mode**: Automatic dark mode support via `prefers-color-scheme`

## Tech Stack

- **Next.js 16.1.1** - React framework with App Router
- **React 19.2.3** - UI library with Server and Client Components
- **TypeScript 5** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling
- **SQLite** (better-sqlite3) - Local database for albums and photos
- **Next.js Image** - Optimized image loading with AVIF/WebP

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd observability-study

# Install dependencies
npm install

# Seed the database with sample data (8 cities × 15 photos)
npm run seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

- `npm run dev` - Start development server (Turbopack)
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Populate database with sample photos

## Project Structure

```
app/
├── components/          # React components
│   ├── AlbumCard.tsx   # Album card with drag-drop
│   ├── AlbumGrid.tsx   # Album grid with ordering
│   ├── PhotoGrid.tsx   # Photo tile grid
│   ├── PhotoDetail.tsx # Full-size photo view
│   └── LoadingSpinner.tsx
├── lib/                # Core utilities
│   ├── db.ts          # SQLite database functions
│   ├── types.ts       # TypeScript interfaces
│   └── storage.ts     # localStorage wrapper
├── album/[id]/        # Album detail pages
├── photo/[id]/        # Photo detail pages
├── api/               # API routes
│   ├── albums/        # Album endpoints
│   ├── photos/        # Photo endpoints
│   └── health/        # Health check
├── page.tsx           # Home page
├── layout.tsx         # Root layout
├── globals.css        # Global styles
├── loading.tsx        # Loading states
├── error.tsx          # Error boundaries
└── not-found.tsx      # 404 page
```

## Usage

### Viewing Albums

- Open the app to see all city albums displayed in a responsive grid
- Albums show city name, preview image, and photo count

### Reordering Albums

- **Desktop**: Click and drag album cards to reorder
- **Mobile**: Touch and drag album cards
- **Keyboard**: Tab to album, press Space/Enter to select, use arrow keys (future enhancement)
- Press **ESC** to cancel drag operation
- Order persists in browser localStorage

### Browsing Photos

1. Click an album card to view all photos
2. Photos display in a responsive grid (2-6 columns)
3. Click a photo to view full-size
4. Use **Back** button or browser back to navigate

## Database

- **Location**: `app/lib/database.db`
- **Schema**: `albums` and `photos` tables with foreign key relationships
- **Sample Data**: 8 cities, 15 photos each (120 total)

### Resetting Data

```bash
rm app/lib/database.db
npm run seed
```

## Configuration

### Next.js Image Optimization

See `next.config.ts` for image settings:
- Formats: AVIF, WebP
- Device sizes: 640-1920px
- Lazy loading for below-fold images

### Tailwind Breakpoints

- Mobile: default (< 768px)
- Tablet: `md:` (≥ 768px)
- Desktop: `lg:` (≥ 1024px)
- Large: `xl:` (≥ 1280px)
- Extra Large: `2xl:` (≥ 1536px)

## Development

### Adding New Albums

Edit `scripts/seed-data.ts` and run `npm run seed`.

### Type Safety

All components use TypeScript interfaces from `app/lib/types.ts`. Run `npx tsc --noEmit` to check types.

### Linting

```bash
npm run lint
```

ESLint configured for Next.js, React, and TypeScript best practices.

## Performance

- **Album Load**: < 2 seconds (target)
- **Photo Load**: < 1 second (target)
- **Image Optimization**: Next.js automatic optimization with AVIF/WebP
- **Lazy Loading**: Photos load on demand
- **Server Components**: Data fetching happens on server

## Accessibility

- ✅ ARIA labels on interactive elements
- ✅ Keyboard navigation (Tab, Enter, Space, Escape)
- ✅ Focus visible styles
- ✅ Semantic HTML
- ✅ Screen reader friendly
- ✅ Minimum 44×44px touch targets

## Browser Support

Supports all modern browsers (Chrome, Firefox, Safari, Edge) with:
- ES2020+ JavaScript
- CSS Grid and Flexbox
- Touch Events API
- localStorage

## License

This project is for educational purposes.

## Specification

See `/specs/001-photo-album-organizer/` for complete feature specification:
- `spec.md` - Requirements and user stories
- `plan.md` - Technical architecture
- `tasks.md` - Implementation tasks
- `data-model.md` - Database schema
- `contracts/` - API specifications
