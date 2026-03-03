// TMDB API Service for fetching movie metadata
// Get a free API key from https://www.themoviedb.org/settings/api

const TMDB_API_KEY = (import.meta.env.VITE_TMDB_API_KEY as string) || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  runtime: number | null;
  genres: Array<{ id: number; name: string }>;
  production_countries: Array<{ name: string }>;
  spoken_languages: Array<{ english_name: string }>;
}

export interface TMDBSearchResult {
  page: number;
  results: Array<{
    id: number;
    title: string;
    name?: string;
    original_title: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string;
    vote_average: number;
    media_type: string;
  }>;
  total_pages: number;
  total_results: number;
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

// Get poster URL with size
export function getPosterUrl(path: string | null, size: 'w185' | 'w342' | 'w500' | 'original' = 'w342'): string {
  if (!path) return '';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

// Get backdrop URL
export function getBackdropUrl(path: string | null, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w780'): string {
  if (!path) return '';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

// Search for movie metadata
export async function searchMovie(
  title: string,
  year?: string
): Promise<MovieMetadata | null> {
  if (!TMDB_API_KEY) {
    console.warn('TMDB API key not configured');
    return null;
  }

  try {
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      query: title,
      include_adult: 'false',
    });

    if (year) {
      params.append('primary_release_year', year);
    }

    console.log('[TMDB] Searching for:', { title, year });
    
    const response = await fetch(`${TMDB_BASE_URL}/search/movie?${params}`);
    
    if (!response.ok) {
      console.error('TMDB API error:', response.status);
      return null;
    }

    const data: TMDBSearchResult = await response.json();

    console.log('[TMDB] Search results:', { title, totalResults: data.total_results, results: data.results?.slice(0, 3).map(r => ({ id: r.id, title: r.title, year: r.release_date })) });

    if (!data.results || data.results.length === 0) {
      console.warn('[TMDB] No results found for:', title);
      return null;
    }

    // Get the first result
    const movie = data.results[0];
    
    // Get full movie details
    return getMovieDetails(movie.id);
  } catch (error) {
    console.error('Error fetching movie metadata:', error);
    return null;
  }
}

// Get movie details by ID
export async function getMovieDetails(movieId: number): Promise<MovieMetadata | null> {
  if (!TMDB_API_KEY) {
    return null;
  }

  try {
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
    });

    console.log('[TMDB] Fetching details for movie ID:', movieId);
    
    const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}?${params}`);
    
    if (!response.ok) {
      console.error('TMDB API error:', response.status);
      return null;
    }

    const data: TMDBMovie = await response.json();
    console.log('[TMDB] Got movie details:', { id: data.id, title: data.title, year: data.release_date });

    // Get credits for director and actors
    const creditsParams = new URLSearchParams({
      api_key: TMDB_API_KEY,
    });
    
    const creditsResponse = await fetch(`${TMDB_BASE_URL}/movie/${movieId}/credits?${creditsParams}`);
    let director = 'Unknown';
    let actors = 'Unknown';
    
    if (creditsResponse.ok) {
      const credits = await creditsResponse.json();
      
      // Get director
      const directorJob = credits.crew?.find((c: any) => c.job === 'Director');
      if (directorJob) {
        director = directorJob.name;
      }
      
      // Get top 3 actors
      if (credits.cast && credits.cast.length > 0) {
        actors = credits.cast.slice(0, 3).map((c: any) => c.name).join(', ');
      }
    }

    const year = data.release_date ? data.release_date.split('-')[0] : '';
    const runtime = data.runtime ? `${data.runtime} min` : 'N/A';
    const genre = data.genres?.map((g) => g.name).join(', ') || 'Unknown';
    const language = data.spoken_languages?.map((l) => l.english_name).join(', ') || 'Unknown';

    return {
      title: data.title,
      year,
      plot: data.overview || 'No plot available',
      poster: getPosterUrl(data.poster_path, 'w342'),
      genre,
      director,
      actors,
      imdbRating: data.vote_average > 0 ? data.vote_average.toFixed(1) : 'N/A',
      runtime,
      language,
    };
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return null;
  }
}

// Search by TMDB ID
export async function searchMovieById(tmdbId: number): Promise<MovieMetadata | null> {
  return getMovieDetails(tmdbId);
}

// Extract clean title for API search
export function extractCleanTitle(filename: string): { title: string; year?: string } {
  console.log('[TMDB] Extracting clean title from:', filename);
  
  // Remove extension
  let title = filename.replace(/\.[^/.]+$/, '');
  
  // Handle series format first - extract series name
  const seriesMatch = title.match(/([Ss](\d{1,2})[Ee](\d{1,2}))|(\d{1,2}x\d{1,2})/);
  if (seriesMatch) {
    title = title.replace(seriesMatch[0], '');
  }
  
  // Remove common release info patterns
  title = title
    .replace(/\s*\((\d{4})\)\s*/g, ' ')
    .replace(/\s*\[(\d{4})\]\s*/g, ' ')
    .replace(/\s*\{(\d{4})\}\s*/g, ' ')
    // Quality patterns
    .replace(/\s*1080p\s*/gi, ' ')
    .replace(/\s*720p\s*/gi, ' ')
    .replace(/\s*480p\s*/gi, ' ')
    .replace(/\s*2160p\s*/gi, ' ')
    .replace(/\s*4k\s*/gi, ' ')
    .replace(/\s*uhd\s*/gi, ' ')
    .replace(/\s*hdr\s*/gi, ' ')
    .replace(/\s*bluray\s*/gi, ' ')
    .replace(/\s*webrip\s*/gi, ' ')
    .replace(/\s*web-dl\s*/gi, ' ')
    .replace(/\s*dvdrip\s*/gi, ' ')
    .replace(/\s*hdtv\s*/gi, ' ')
    .replace(/\s*x264\s*/gi, ' ')
    .replace(/\s*x265\s*/gi, ' ')
    .replace(/\s*hevc\s*/gi, ' ')
    .replace(/\s*aac\s*/gi, ' ')
    .replace(/\s*ac3\s*/gi, ' ')
    .replace(/\s*dd\s*/gi, ' ')
    .replace(/\s*atmos\s*/gi, ' ')
    .replace(/\s*dts\s*/gi, ' ')
    .replace(/\s*truehd\s*/gi, ' ')
    .replace(/\s*remux\s*/gi, ' ')
    .replace(/\s*proper\s*/gi, ' ')
    .replace(/\s*repack\s*/gi, ' ')
    .replace(/\s*yify\s*/gi, ' ')
    .replace(/\s*yts\s*/gi, ' ')
    .replace(/\s*rarbg\s*/gi, ' ')
    .replace(/\s*evil\s*/gi, ' ')
    .replace(/\s*ev01\s*/gi, ' ')
    .replace(/\s*etrg\s*/gi, ' ')
    // Language patterns
    .replace(/\s*english\s*/gi, ' ')
    .replace(/\s*hindi\s*/gi, ' ')
    .replace(/\s*tamil\s*/gi, ' ')
    .replace(/\s*telugu\s*/gi, ' ')
    .replace(/\s*dubbed\s*/gi, ' ')
    .replace(/\s*subtitles?\s*/gi, ' ')
    .replace(/\s*dual\s*audio\s*/gi, ' ')
    // Release group patterns
    .replace(/\[.*?\]/g, ' ')
    .replace(/\(.*?\)/g, ' ')
    // Clean up separators
    .replace(/\./g, ' ')
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Try to extract year from original filename
  const yearMatch = filename.match(/(\d{4})/);
  const year = yearMatch ? yearMatch[1] : undefined;

  // If title is too short or just numbers, use the cleaned filename
  if (title.length < 2 || /^\d+$/.test(title)) {
    title = filename.replace(/\.[^/.]+$/, '')
      .replace(/\./g, ' ')
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  console.log('[TMDB] Cleaned title:', { original: filename, cleaned: title, year });

  return { title, year };
}
