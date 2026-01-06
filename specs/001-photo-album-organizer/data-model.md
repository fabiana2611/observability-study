# Data Model: Photo Album Organizer

**Feature**: Photo Album Organizer | **Date**: 2026-01-06  
**Purpose**: Define all entities, attributes, relationships, and state transitions

---

## 1. Database Entities (SQLite)

### Album

Represents a collection of photos associated with a single city.

**Table**: `albums`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique album identifier |
| `city_name` | TEXT | NOT NULL UNIQUE | Name of city (e.g., "Paris", "Tokyo") |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Album creation timestamp |

**Indexes**:
- Primary key on `id` (automatic)
- Unique constraint on `city_name` (prevents duplicate cities)

**Validation Rules**:
- `city_name`: 1-50 characters, non-empty, trimmed whitespace
- One album per city (enforced by UNIQUE constraint)

**Relationships**:
- One album has many photos (one-to-many)

---

### Photo

Represents an individual photo within an album.

**Table**: `photos`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique photo identifier |
| `album_id` | INTEGER | NOT NULL, FOREIGN KEY → albums(id) | Parent album reference |
| `file_path` | TEXT | NOT NULL | Relative path to photo file (e.g., "/sample-photos/paris-1.jpg") |
| `display_order` | INTEGER | NOT NULL DEFAULT 0 | Order within album (0-based index) |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Photo creation timestamp |

**Indexes**:
- Primary key on `id` (automatic)
- `idx_photos_album_id` on `album_id` (optimize album photo lookups)
- `idx_photos_display_order` on `(album_id, display_order)` (optimize ordered queries)

**Validation Rules**:
- `album_id`: Must reference existing album
- `file_path`: Valid relative path, non-empty
- `display_order`: Non-negative integer

**Relationships**:
- Many photos belong to one album (many-to-one)
- Foreign key `ON DELETE CASCADE` (deleting album removes photos)

---

## 2. Client-Side State (Browser)

### AlbumOrder

Represents user's custom ordering of albums (persisted in localStorage).

**Storage**: `localStorage` key `"album-order"`

**Structure**:
```javascript
// Stored as JSON array of album IDs
["3", "1", "7", "2", "5", "4", "6", "8"]
```

**Behavior**:
- If key doesn't exist: Use default order (alphabetical by city_name)
- If album IDs don't match DB: Filter out invalid IDs, append new albums
- Updated on every drag-drop operation

**Validation**:
- Must be valid JSON array
- Elements must be numeric strings or numbers
- Duplicates removed on load

---

### UIState (In-Memory)

Transient state not persisted between sessions.

| State Variable | Type | Description |
|----------------|------|-------------|
| `currentRoute` | String | Current page: `"/"`, `"/album/:id"`, `"/photo/:id"` |
| `draggedAlbumId` | Number\|null | ID of album currently being dragged (null if no drag) |
| `albums` | Array\<Album\> | Cached album list (fetched once on load) |
| `currentAlbum` | Object\|null | Currently viewed album with photos |
| `currentPhoto` | Object\|null | Currently viewed photo detail |

**Initialization**:
- All values null/empty on page load
- `albums` loaded via API call on app start
- Other values populated on navigation

---

## 3. API Response Models

### AlbumListItem

Returned by `GET /api/albums`

```javascript
{
  "id": 1,
  "city_name": "Paris",
  "photo_count": 15,  // Computed: COUNT(photos)
  "preview_photo": "/sample-photos/paris-1.jpg"  // First photo file_path
}
```

**Usage**: Display on main page (album grid)

---

### AlbumDetail

Returned by `GET /api/albums/:id`

```javascript
{
  "id": 1,
  "city_name": "Paris",
  "photos": [
    {
      "id": 101,
      "file_path": "/sample-photos/paris-1.jpg",
      "display_order": 0
    },
    {
      "id": 102,
      "file_path": "/sample-photos/paris-2.jpg",
      "display_order": 1
    }
    // ... 13 more photos
  ]
}
```

**Usage**: Display on album detail page (photo grid)

---

### PhotoDetail

Returned by `GET /api/photos/:id`

```javascript
{
  "id": 101,
  "file_path": "/sample-photos/paris-1.jpg",
  "album": {
    "id": 1,
    "city_name": "Paris"
  }
}
```

**Usage**: Display on photo detail page (full-size view + breadcrumb)

---

## 4. State Transitions

### Album Reordering Flow

```
[User drags album] 
  → draggedAlbumId = album.id
  
[User drops album at new position]
  → Calculate new order array
  → saveAlbumOrder(newOrder) // localStorage
  → Re-render album list with new order
  → draggedAlbumId = null
  
[User refreshes page]
  → loadAlbumOrder() from localStorage
  → Fetch albums from API
  → Apply custom order to fetched albums
  → Render sorted list
```

**Validation**:
- Drop position must be valid (within album list bounds)
- If drag cancelled (ESC key, invalid drop): Revert to original order

---

### Navigation Flow

```
[App loads]
  → currentRoute = "/"
  → Fetch GET /api/albums
  → Load album order from localStorage
  → Render album list

[User clicks album card]
  → currentRoute = "/album/:id"
  → Fetch GET /api/albums/:id
  → Render photo grid
  
[User clicks photo tile]
  → currentRoute = "/photo/:id"
  → Fetch GET /api/photos/:id
  → Render full-size photo

[User clicks back button]
  → Navigate to previous route
  → Re-render previous view (cached data if available)
```

---

### Error States

| Scenario | Behavior |
|----------|----------|
| API call fails | Display error message, retry button |
| Photo file missing (404) | Show placeholder image, log error |
| localStorage unavailable | Use default album order, show warning |
| Invalid route | Redirect to "/" |
| Empty database (no albums) | Display empty state: "No albums yet" |

---

## 5. Data Constraints & Validation

### Albums Table

```sql
-- Schema
CREATE TABLE albums (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  city_name TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Constraints
CHECK(LENGTH(TRIM(city_name)) > 0)  -- Non-empty city name
CHECK(LENGTH(city_name) <= 50)      -- Max 50 characters
```

### Photos Table

```sql
-- Schema
CREATE TABLE photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  album_id INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_photos_album_id ON photos(album_id);
CREATE INDEX idx_photos_display_order ON photos(album_id, display_order);

-- Constraints
CHECK(display_order >= 0)           -- Non-negative order
CHECK(LENGTH(file_path) > 0)        -- Non-empty path
```

---

## 6. Sample Data Volume

**Seed Data** (generated by seed script):

- **8 albums**: Paris, Tokyo, New York, Barcelona, Sydney, Amsterdam, Rio, Dubai
- **15 photos per album**: 120 total photos
- **Photo files**: Stored in `public/sample-photos/`
- **File naming**: `{city-name}-{1-15}.jpg` (e.g., `paris-1.jpg`, `new-york-15.jpg`)

**Size Constraints**:
- Total photos: 120 (within 50-200 target range from spec)
- Photo files: ~100-500KB each (compressed JPEGs)
- Total storage: ~12-60MB for sample photos
- Database size: ~20KB (metadata only)

---

## 7. Future Extensibility

**Not in MVP but schema supports**:

- **Photo captions**: Add `caption TEXT` column to photos table
- **Photo timestamps**: Add `taken_at DATETIME` column
- **Album descriptions**: Add `description TEXT` column to albums table
- **Photo tags**: New `tags` table with many-to-many relationship
- **User accounts**: New `users` table, add `user_id` foreign key to albums

**Schema designed for easy migration** (SQLite ALTER TABLE support).

---

## Summary

**Total Entities**: 2 database tables + 2 client-side state structures

**Key Relationships**:
- Albums → Photos (one-to-many, cascading delete)
- AlbumOrder → Albums (localStorage reference by ID)

**Data Flow**:
1. Server seeds database on first run
2. Client fetches albums via API
3. Client applies custom order from localStorage
4. User interactions update localStorage (album order) or navigate (route state)
5. Server provides read-only photo data (no mutations in MVP)

**All entities from spec (FR-001 to FR-019) represented. Ready for API contract design.**
