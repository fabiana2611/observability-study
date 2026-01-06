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
