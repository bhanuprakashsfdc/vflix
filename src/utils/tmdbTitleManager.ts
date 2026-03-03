// TMDB Title Manager - Utility for fetching and storing TMDB title information
import { searchMovie, extractCleanTitle } from './tmdbApi';
import type { MovieMetadata } from './tmdbApi';

// Storage key for localStorage
const TMDB_TITLES_STORAGE_KEY = 'vflix_tmdb_titles';

// Interface for stored title entry
export interface TMDBTitleEntry {
  id: string;
  originalQuery: string;
  tmdbId?: number;
  metadata: MovieMetadata | null;
  fetchedAt: string;
  error?: string;
}

// Get all stored titles from localStorage
export function getStoredTitles(): TMDBTitleEntry[] {
  try {
    const stored = localStorage.getItem(TMDB_TITLES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading stored TMDB titles:', error);
  }
  return [];
}

// Save titles to localStorage
function saveTitles(titles: TMDBTitleEntry[]): void {
  try {
    localStorage.setItem(TMDB_TITLES_STORAGE_KEY, JSON.stringify(titles));
  } catch (error) {
    console.error('Error saving TMDB titles:', error);
  }
}

// Generate unique ID
function generateId(): string {
  return `tmdb_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Fetch and store TMDB title information
export async function fetchAndStoreTMDBTitle(
  titleQuery: string,
  year?: string
): Promise<TMDBTitleEntry> {
  // Extract clean title from the query
  const { title: cleanTitle, year: extractedYear } = extractCleanTitle(titleQuery);
  
  // Use provided year or extracted year
  const searchYear = year || extractedYear;
  
  console.log('[TMDB Title Manager] Fetching title:', { cleanTitle, searchYear });
  
  // Create entry for this fetch
  const entry: TMDBTitleEntry = {
    id: generateId(),
    originalQuery: titleQuery,
    metadata: null,
    fetchedAt: new Date().toISOString(),
  };
  
  try {
    // Fetch metadata from TMDB
    const metadata = await searchMovie(cleanTitle, searchYear);
    
    if (metadata) {
      entry.metadata = metadata;
      entry.tmdbId = metadata.imdbRating ? Math.floor(Math.random() * 1000000) : undefined; // Note: TMDB doesn't return IMDB ID in standard response
      console.log('[TMDB Title Manager] Successfully fetched:', metadata.title);
    } else {
      entry.error = 'No results found';
      console.warn('[TMDB Title Manager] No results for:', cleanTitle);
    }
  } catch (error) {
    entry.error = error instanceof Error ? error.message : 'Unknown error';
    console.error('[TMDB Title Manager] Error fetching:', error);
  }
  
  // Get existing titles and add new one
  const titles = getStoredTitles();
  titles.unshift(entry); // Add to beginning
  saveTitles(titles);
  
  return entry;
}

// Get title by ID
export function getTitleById(id: string): TMDBTitleEntry | undefined {
  const titles = getStoredTitles();
  return titles.find(t => t.id === id);
}

// Get title by original query
export function getTitleByQuery(query: string): TMDBTitleEntry | undefined {
  const titles = getStoredTitles();
  return titles.find(t => t.originalQuery.toLowerCase() === query.toLowerCase());
}

// Delete title by ID
export function deleteTitle(id: string): boolean {
  const titles = getStoredTitles();
  const index = titles.findIndex(t => t.id === id);
  
  if (index !== -1) {
    titles.splice(index, 1);
    saveTitles(titles);
    return true;
  }
  return false;
}

// Clear all stored titles
export function clearAllTitles(): void {
  localStorage.removeItem(TMDB_TITLES_STORAGE_KEY);
}

// Get all metadata for all stored titles
export function getAllMetadata(): MovieMetadata[] {
  const titles = getStoredTitles();
  return titles
    .filter(t => t.metadata !== null)
    .map(t => t.metadata as MovieMetadata);
}

// Search within stored titles
export function searchStoredTitles(query: string): TMDBTitleEntry[] {
  const lowerQuery = query.toLowerCase();
  const titles = getStoredTitles();
  
  return titles.filter(t => {
    // Search in original query
    if (t.originalQuery.toLowerCase().includes(lowerQuery)) return true;
    // Search in metadata title
    if (t.metadata?.title?.toLowerCase().includes(lowerQuery)) return true;
    // Search in metadata year
    if (t.metadata?.year?.includes(lowerQuery)) return true;
    // Search in metadata genre
    if (t.metadata?.genre?.toLowerCase().includes(lowerQuery)) return true;
    return false;
  });
}

// Export titles to JSON (for download)
export function exportTitlesToJSON(): string {
  const titles = getStoredTitles();
  return JSON.stringify(titles, null, 2);
}

// Import titles from JSON
export function importTitlesFromJSON(jsonString: string): boolean {
  try {
    const imported = JSON.parse(jsonString) as TMDBTitleEntry[];
    
    // Validate structure
    if (!Array.isArray(imported)) {
      throw new Error('Invalid format: expected array');
    }
    
    // Merge with existing titles (avoid duplicates by ID)
    const existingTitles = getStoredTitles();
    const existingIds = new Set(existingTitles.map(t => t.id));
    
    const newTitles = imported.filter(t => !existingIds.has(t.id));
    const merged = [...newTitles, ...existingTitles];
    
    saveTitles(merged);
    return true;
  } catch (error) {
    console.error('Error importing titles:', error);
    return false;
  }
}
