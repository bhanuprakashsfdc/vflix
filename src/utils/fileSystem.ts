/* eslint-disable @typescript-eslint/no-explicit-any */
import type { MediaFile, ScanResult } from '../types';
import { SUPPORTED_VIDEO_FORMATS } from '../types';
import { detectLanguage, extractCleanTitle } from './omdbApi';
import { searchMovie as tmdbSearchMovie } from './tmdbApi';

// Type for File System Access API
interface FileSystemHandle {
  kind: 'file' | 'directory';
  name: string;
}

interface FileSystemFileHandle extends FileSystemHandle {
  kind: 'file';
  getFile(): Promise<File>;
}

interface FileSystemDirectoryHandle extends FileSystemHandle {
  kind: 'directory';
  values(): AsyncIterableIterator<FileSystemHandle>;
}

interface ShowDirectoryPickerOptions {
  mode?: 'read' | 'readwrite';
}

// Extended window type for File System Access API
declare global {
  interface Window {
    showDirectoryPicker(options?: ShowDirectoryPickerOptions): Promise<FileSystemDirectoryHandle>;
  }
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Extract title from filename
export function extractTitle(filename: string): string {
  // Remove extension
  let title = filename.replace(/\.[^/.]+$/, '');
  // Remove common patterns like year, quality, etc.
  title = title
    .replace(/\s*\(\d{4}\)\s*/g, ' ')
    .replace(/\s*\d{4}\s*/g, ' ')
    .replace(/\s*\[.*?\]\s*/g, ' ')
    .replace(/\s*\(.*?\)\s*/g, ' ')
    .replace(/\s*1080p\s*/gi, ' ')
    .replace(/\s*720p\s*/gi, ' ')
    .replace(/\s*480p\s*/gi, ' ')
    .replace(/\s*2160p\s*/gi, ' ')
    .replace(/\s*4k\s*/gi, ' ')
    .replace(/\s*hdr\s*/gi, ' ')
    .replace(/\s*bluray\s*/gi, ' ')
    .replace(/\s*webrip\s*/gi, ' ')
    .replace(/\s*web-dl\s*/gi, ' ')
    .replace(/\s*dvdrip\s*/gi, ' ')
    .replace(/\s*hdtv\s*/gi, ' ')
    .replace(/\./g, ' ')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return title || filename;
}

// Detect if file is a series episode
export function detectSeriesInfo(filename: string): { isSeries: boolean; seriesName?: string; season?: number; episode?: number } {
  // Patterns for series: "Show Name S01E01", "Show Name 1x01", etc.
  const seasonEpisodePattern = /[Ss](\d{1,2})[Ee](\d{1,2})/;
  const numberPattern = /(\d{1,2})x(\d{1,2})/;

  const match = filename.match(seasonEpisodePattern) || filename.match(numberPattern);
  
  if (match) {
    const season = parseInt(match[1], 10);
    const episode = parseInt(match[2], 10);
    let seriesName = filename
      .replace(seasonEpisodePattern, '')
      .replace(numberPattern, '')
      .replace(/\.[^/.]+$/, '')
      .replace(/_/g, ' ')
      .replace(/\./g, ' ')
      .trim();
    
    return {
      isSeries: true,
      seriesName: extractTitle(seriesName),
      season,
      episode,
    };
  }

  return { isSeries: false };
}

// Check if file extension is supported
export function isSupportedVideo(filename: string): boolean {
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
  return SUPPORTED_VIDEO_FORMATS.includes(ext);
}

// Get file extension
export function getFileExtension(filename: string): string {
  return filename.substring(filename.lastIndexOf('.')).toLowerCase();
}

// Select folder using File System Access API
export async function selectFolder(): Promise<FileSystemDirectoryHandle | null> {
  try {
    // Check if API is supported
    if (!('showDirectoryPicker' in window)) {
      throw new Error('File System Access API is not supported in this browser. Please use Chrome or Edge.');
    }

    const handle = await window.showDirectoryPicker({
      mode: 'read',
    });
    
    return handle as unknown as FileSystemDirectoryHandle;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      return null;
    }
    throw error;
  }
}

// Recursively scan folder for video files
export async function scanFolder(
  handle: FileSystemDirectoryHandle,
  onProgress?: (scanned: number) => void
): Promise<ScanResult> {
  const mediaFiles: MediaFile[] = [];
  const errors: string[] = [];
  let scannedFiles = 0;
  const rootName = handle.name;

  async function scanDirectory(dirHandle: any, category: string): Promise<void> {
    try {
      for await (const entry of (dirHandle as any).values()) {
        if ((entry as any).kind === 'file') {
          scannedFiles++;
          if (onProgress) {
            onProgress(scannedFiles);
          }

          const entryName = (entry as any).name;
          if (isSupportedVideo(entryName)) {
            try {
              const fileHandle = entry as FileSystemFileHandle;
              const file = await fileHandle.getFile();
              const extension = getFileExtension(entryName);
              const seriesInfo = detectSeriesInfo(entryName);
              
              // Detect language from filename
              const detectedLanguage = detectLanguage(entryName);
              
              // Use clean title from filename for API search
              const cleanTitleInfo = extractCleanTitle(entryName);
              
              // Title is extracted from filename, no external API calls during scan
              // Metadata (including posters) is fetched lazily when cards are displayed
              const media: MediaFile = {
                id: generateId(),
                name: entryName,
                title: seriesInfo.isSeries 
                  ? `${seriesInfo.seriesName} - S${String(seriesInfo.season).padStart(2, '0')}E${String(seriesInfo.episode).padStart(2, '0')}`
                  : cleanTitleInfo.title,
                path: `${category}/${entryName}`,
                handle: fileHandle as any,
                type: seriesInfo.isSeries ? 'series' : 'video',
                extension,
                size: file.size,
                category: category || rootName,
                seriesName: seriesInfo.seriesName,
                season: seriesInfo.season,
                episode: seriesInfo.episode,
                thumbnail: undefined,
                addedAt: Date.now(),
                createdAt: file.lastModified,
                modifiedAt: file.lastModified,
                metadata: undefined,
                detectedLanguage,
              };

              mediaFiles.push(media);
            } catch (fileError) {
              errors.push(`Error reading file ${entryName}: ${fileError}`);
            }
          }
        } else if ((entry as any).kind === 'directory') {
          // Skip hidden directories and common non-media folders
          const entryName = (entry as any).name;
          if (!entryName.startsWith('.') && !['node_modules', 'System Volume Information', '$RECYCLE.BIN'].includes(entryName)) {
            await scanDirectory(entry, category ? `${category}/${entryName}` : entryName);
          }
        }
      }
    } catch (dirError) {
      errors.push(`Error scanning directory ${(dirHandle as any).name}: ${dirError}`);
    }
  }

  await scanDirectory(handle, rootName);

  return {
    totalFiles: mediaFiles.length,
    scannedFiles,
    mediaFiles,
    errors,
  };
}

// Get video URL from file handle
export async function getVideoURL(handle: any): Promise<string> {
  const file = await (handle as FileSystemFileHandle).getFile();
  return URL.createObjectURL(file);
}

// Revoke video URL to free memory
export function revokeVideoURL(url: string): void {
  URL.revokeObjectURL(url);
}

// Fetch and cache movie metadata from TMDB API
export async function fetchMediaMetadata(title: string, year?: string): Promise<MediaFile['metadata']> {
  try {
    const result = await tmdbSearchMovie(title, year);
    if (result) {
      return {
        title: result.title,
        year: result.year,
        plot: result.plot,
        poster: result.poster,
        genre: result.genre,
        director: result.director,
        actors: result.actors,
        imdbRating: result.imdbRating,
        runtime: result.runtime,
        language: result.language,
      };
    }
  } catch (error) {
    console.error('Error fetching media metadata:', error);
  }
  return undefined;
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Format duration
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

// Check if File System Access API is supported
export function isFileSystemSupported(): boolean {
  return 'showDirectoryPicker' in window;
}
