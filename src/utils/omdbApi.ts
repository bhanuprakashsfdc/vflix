// OMDb API Service for fetching movie metadata
// Get a free API key from http://www.omdbapi.com/apikey.aspx

const OMDB_API_KEY = (import.meta.env.VITE_OMDB_API_KEY as string) || '';
const OMDB_BASE_URL = 'https://www.omdbapi.com/';

export interface OMDBMovie {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: Array<{ Source: string; Value: string }>;
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: string;
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

// Language detection patterns from filename
const LANGUAGE_PATTERNS: Record<string, RegExp> = {
  'English': /\b(english|eng|subtitle)\b/i,
  'Hindi': /\b(hindi|hindi|bollywood)\b/i,
  'Tamil': /\b(tamil|tam)\b/i,
  'Telugu': /\b(telugu|tel)\b/i,
  'Malayalam': /\b(malayalam|mal)\b/i,
  'Kannada': /\b(kannada|kan)\b/i,
  'Japanese': /\b(japanese|jap|jp)\b/i,
  'Korean': /\b(korean|kor|kr)\b/i,
  'Chinese': /\b(chinese|chin|zh)\b/i,
  'Spanish': /\b(spanish|esp|spa)\b/i,
  'French': /\b(french|fr)\b/i,
  'German': /\b(german|ger|de)\b/i,
  'Arabic': /\b(arabic|arb)\b/i,
  'Portuguese': /\b(portuguese|por)\b/i,
  'Italian': /\b(italian|ita)\b/i,
  'Russian': /\b(russian|rus)\b/i,
  'Polish': /\b(polish|pol)\b/i,
  'Turkish': /\b(turkish|tur)\b/i,
  'Thai': /\b(thai|tha)\b/i,
  'Vietnamese': /\b(vietnamese|vie)\b/i,
  'Indonesian': /\b(indonesian|ind)\b/i,
  'Filipino': /\b(filipino|fil|tagalog)\b/i,
  'Dual Audio': /\b(dual\s*audio)\b/i,
};

// Detect language from filename
export function detectLanguage(filename: string): string {
  for (const [lang, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
    if (pattern.test(filename)) {
      return lang;
    }
  }
  return 'English'; // Default
}

// Search for movie metadata
export async function searchMovie(
  title: string,
  year?: string
): Promise<MovieMetadata | null> {
  try {
    const params = new URLSearchParams({
      apikey: OMDB_API_KEY,
      t: title,
    });

    if (year) {
      params.append('y', year);
    }

    const response = await fetch(`${OMDB_BASE_URL}?${params}`);
    
    if (!response.ok) {
      console.error('OMDb API error:', response.status);
      return null;
    }

    const data: OMDBMovie = await response.json();

    if (data.Response === 'False' || data.imdbRating === 'N/A') {
      return null;
    }

    return {
      title: data.Title,
      year: data.Year,
      plot: data.Plot,
      poster: data.Poster !== 'N/A' ? data.Poster : '',
      genre: data.Genre,
      director: data.Director,
      actors: data.Actors,
      imdbRating: data.imdbRating,
      runtime: data.Runtime,
      language: data.Language,
    };
  } catch (error) {
    console.error('Error fetching movie metadata:', error);
    return null;
  }
}

// Search by IMDB ID
export async function searchMovieById(imdbId: string): Promise<MovieMetadata | null> {
  try {
    const params = new URLSearchParams({
      apikey: OMDB_API_KEY,
      i: imdbId,
    });

    const response = await fetch(`${OMDB_BASE_URL}?${params}`);
    
    if (!response.ok) {
      return null;
    }

    const data: OMDBMovie = await response.json();

    if (data.Response === 'False') {
      return null;
    }

    return {
      title: data.Title,
      year: data.Year,
      plot: data.Plot,
      poster: data.Poster !== 'N/A' ? data.Poster : '',
      genre: data.Genre,
      director: data.Director,
      actors: data.Actors,
      imdbRating: data.imdbRating,
      runtime: data.Runtime,
      language: data.Language,
    };
  } catch (error) {
    console.error('Error fetching movie by ID:', error);
    return null;
  }
}

// Extract clean title for API search
export function extractCleanTitle(filename: string): { title: string; year?: string } {
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

  return { title, year };
}
