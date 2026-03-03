// Media file types
export interface MediaFile {
  id: string;
  name: string;
  title: string;
  path: string;
  handle: FileSystemFileHandle;
  type: 'video' | 'series';
  extension: string;
  size: number;
  category: string;
  seriesName?: string;
  season?: number;
  episode?: number;
  thumbnail?: string;
  duration?: number;
  lastPlayed?: number;
  lastPosition?: number;
  addedAt: number;
  createdAt: number;
  modifiedAt: number;
  // Metadata from OMDb
  metadata?: MovieMetadata;
  detectedLanguage?: string;
}

export interface MovieMetadata {
  title: string;
  year: string;
  plot: string;
  poster: string;
  genre: string;
  director: string;
  actors: string;
  imdbRating: string;
  runtime: string;
  language: string;
}

// Grouped series (one entry per series)
export interface SeriesGroup {
  id: string;
  name: string;
  episodes: MediaFile[];
  poster?: string;
  rating?: string;
  year?: string;
  plot?: string;
}

// Profile types
export interface Profile {
  id: string;
  name: string;
  avatar: string;
  color: string;
  isAdult: boolean;
  createdAt: number;
}

// App state types
export interface AppState {
  currentProfile: Profile | null;
  profiles: Profile[];
  mediaLibrary: MediaFile[];
  isScanning: boolean;
  scanProgress: number;
  selectedFolderHandle: any;
  searchQuery: string;
  searchResults: MediaFile[];
  isSearchOpen: boolean;
  currentView: 'home' | 'browse' | 'profiles' | 'stats' | 'player' | 'settings';
  currentPlayingMedia: MediaFile | null;
  isPlayerFullscreen: boolean;
  isSidebarOpen: boolean;
}

// Playback state
export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  playbackRate: number;
  quality: 'auto' | '1080p' | '720p' | '480p';
}

// Folder scan result
export interface ScanResult {
  totalFiles: number;
  scannedFiles: number;
  mediaFiles: MediaFile[];
  errors: string[];
}

// Category types
export interface Category {
  id: string;
  name: string;
  media: MediaFile[];
  type: 'continue-watching' | 'recently-added' | 'movies' | 'series' | 'custom';
}

// Settings types
export interface AppSettings {
  autoplay: boolean;
  autoplayNext: boolean;
  defaultQuality: 'auto' | '1080p' | '720p' | '480p';
  subtitles: boolean;
  reduceMotion: boolean;
  keyboardShortcuts: boolean;
}

// Video player controls
export interface PlayerControls {
  showControls: boolean;
  controlsTimeout: ReturnType<typeof setTimeout> | null;
}

// Media filter types
export interface MediaFilter {
  type?: 'video' | 'series';
  category?: string;
  seriesName?: string;
  searchQuery?: string;
  sortBy: 'name' | 'date' | 'size' | 'lastPlayed';
  sortOrder: 'asc' | 'desc';
}

// Supported video formats
export const SUPPORTED_VIDEO_FORMATS = ['.mp4', '.mkv', '.webm', '.avi', '.mov'];

// Video format MIME types
export const VIDEO_MIME_TYPES: Record<string, string> = {
  '.mp4': 'video/mp4',
  '.mkv': 'video/x-matroska',
  '.webm': 'video/webm',
  '.avi': 'video/x-msvideo',
  '.mov': 'video/quicktime',
};
