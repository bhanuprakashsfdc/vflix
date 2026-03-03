import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  detectLanguage,
  extractCleanTitle,
  searchMovie,
  searchMovieById,
} from './omdbApi';

// Mock fetch globally
vi.stubGlobal('fetch', vi.fn());

describe('omdbApi utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('detectLanguage', () => {
    it('should detect English', () => {
      expect(detectLanguage('Movie English.mp4')).toBe('English');
      expect(detectLanguage('Movie eng.mp4')).toBe('English');
      expect(detectLanguage('Movie subtitle.mp4')).toBe('English');
    });

    it('should detect Hindi', () => {
      expect(detectLanguage('Movie Hindi.mp4')).toBe('Hindi');
      expect(detectLanguage('Movie Bollywood Hindi.mp4')).toBe('Hindi');
    });

    it('should detect Tamil', () => {
      expect(detectLanguage('Movie Tamil.mp4')).toBe('Tamil');
      expect(detectLanguage('Movie tam.mp4')).toBe('Tamil');
    });

    it('should detect Telugu', () => {
      expect(detectLanguage('Movie Telugu.mp4')).toBe('Telugu');
      expect(detectLanguage('Movie tel.mp4')).toBe('Telugu');
    });

    it('should detect Japanese', () => {
      expect(detectLanguage('Movie Japanese.mp4')).toBe('Japanese');
      expect(detectLanguage('Movie jap.mp4')).toBe('Japanese');
      expect(detectLanguage('Movie jp.mp4')).toBe('Japanese');
    });

    it('should detect Korean', () => {
      expect(detectLanguage('Movie Korean.mp4')).toBe('Korean');
      expect(detectLanguage('Movie kor.mp4')).toBe('Korean');
    });

    it('should detect Chinese', () => {
      expect(detectLanguage('Movie Chinese.mp4')).toBe('Chinese');
      expect(detectLanguage('Movie zh.mp4')).toBe('Chinese');
    });

    it('should detect Dual Audio', () => {
      expect(detectLanguage('Movie Dual Audio.mp4')).toBe('Dual Audio');
      expect(detectLanguage('Movie dualaudio.mp4')).toBe('Dual Audio');
    });

    it('should return English as default for unknown languages', () => {
      expect(detectLanguage('Movie Unknown.mp4')).toBe('English');
      expect(detectLanguage('Movie.mp4')).toBe('English');
    });
  });

  describe('extractCleanTitle', () => {
    it('should extract clean title from simple filename', () => {
      const result = extractCleanTitle('Movie.mp4');
      expect(result.title).toBe('Movie');
    });

    it('should remove year in parentheses', () => {
      const result = extractCleanTitle('Movie (2020).mp4');
      expect(result.title).toBe('Movie');
      expect(result.year).toBe('2020');
    });

    it('should remove quality indicators', () => {
      expect(extractCleanTitle('Movie 1080p.mp4').title).toBe('Movie');
      expect(extractCleanTitle('Movie 720p.mp4').title).toBe('Movie');
      expect(extractCleanTitle('Movie 4k.mp4').title).toBe('Movie');
      expect(extractCleanTitle('Movie HDR.mp4').title).toBe('Movie');
      expect(extractCleanTitle('Movie BluRay.mp4').title).toBe('Movie');
      expect(extractCleanTitle('Movie WebRip.mp4').title).toBe('Movie');
    });

    it('should handle series format', () => {
      const result = extractCleanTitle('Breaking.Bad.S01E01.mp4');
      expect(result.title).toBe('Breaking Bad');
    });

    it('should extract year from filename', () => {
      const result = extractCleanTitle('Movie.2020.1080p.mp4');
      expect(result.year).toBe('2020');
    });

    it('should remove language patterns', () => {
      expect(extractCleanTitle('Movie English.mp4').title).toBe('Movie');
      expect(extractCleanTitle('Movie Hindi.mp4').title).toBe('Movie');
      expect(extractCleanTitle('Movie Dubbed.mp4').title).toBe('Movie');
      expect(extractCleanTitle('Movie Dual Audio.mp4').title).toBe('Movie');
    });

    it('should clean up separators', () => {
      const result = extractCleanTitle('Movie.Name.With.Dots.mp4');
      expect(result.title).toBe('Movie Name With Dots');
    });
  });

  describe('searchMovie', () => {
    it('should return null when API key is missing', async () => {
      const result = await searchMovie('Movie');
      expect(result).toBeNull();
    });

    it('should return movie metadata on success', async () => {
      const mockResponse = {
        Title: 'Test Movie',
        Year: '2020',
        Plot: 'A test movie plot',
        Poster: 'https://example.com/poster.jpg',
        Genre: 'Action, Drama',
        Director: 'Test Director',
        Actors: 'Actor 1, Actor 2',
        imdbRating: '8.5',
        Runtime: '120 min',
        Language: 'English',
        Response: 'True',
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await searchMovie('Test Movie');

      expect(result).toEqual({
        title: 'Test Movie',
        year: '2020',
        plot: 'A test movie plot',
        poster: 'https://example.com/poster.jpg',
        genre: 'Action, Drama',
        director: 'Test Director',
        actors: 'Actor 1, Actor 2',
        imdbRating: '8.5',
        runtime: '120 min',
        language: 'English',
      });
    });

    it('should return null on API error', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      const result = await searchMovie('Test Movie');
      expect(result).toBeNull();
    });

    it('should return null when movie not found', async () => {
      const mockResponse = {
        Response: 'False',
        Error: 'Movie not found!',
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await searchMovie('Nonexistent Movie');
      expect(result).toBeNull();
    });

    it('should return null when rating is N/A', async () => {
      const mockResponse = {
        Title: 'Test Movie',
        Year: '2020',
        imdbRating: 'N/A',
        Response: 'True',
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await searchMovie('Test Movie');
      expect(result).toBeNull();
    });
  });

  describe('searchMovieById', () => {
    it('should return null on API error', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      const result = await searchMovieById('tt1234567');
      expect(result).toBeNull();
    });

    it('should return movie metadata on success', async () => {
      const mockResponse = {
        Title: 'Test Movie',
        Year: '2020',
        Plot: 'A test movie plot',
        Poster: 'https://example.com/poster.jpg',
        Genre: 'Action',
        Director: 'Director',
        Actors: 'Actor',
        imdbRating: '7.5',
        Runtime: '100 min',
        Language: 'English',
        Response: 'True',
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await searchMovieById('tt1234567');

      expect(result).toEqual({
        title: 'Test Movie',
        year: '2020',
        plot: 'A test movie plot',
        poster: 'https://example.com/poster.jpg',
        genre: 'Action',
        director: 'Director',
        actors: 'Actor',
        imdbRating: '7.5',
        runtime: '100 min',
        language: 'English',
      });
    });
  });
});
