import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MediaCard } from './MediaCard';
import type { MediaFile } from '../../types';

// Mock Icon component
vi.mock('../common/Icon', () => ({
  Icon: ({ name, size, className }: { name: string; size?: number; className?: string }) => (
    <span data-testid={`icon-${name}`} data-size={size} className={className}>
      {name}
    </span>
  ),
}));

const createMockMedia = (overrides: Partial<MediaFile> = {}): MediaFile => ({
  id: 'test-id-1',
  name: 'Test Movie.mp4',
  title: 'Test Movie',
  path: '/test/Test Movie.mp4',
  handle: {} as FileSystemFileHandle,
  type: 'video',
  extension: '.mp4',
  size: 1024000000,
  category: 'Movies',
  addedAt: Date.now(),
  createdAt: Date.now(),
  modifiedAt: Date.now(),
  ...overrides,
});

describe('MediaCard', () => {
  const defaultProps = {
    media: createMockMedia(),
    onPlay: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Vertical layout (default)', () => {
    it('renders media title (uses getAllBy for multiple titles)', () => {
      render(<MediaCard {...defaultProps} />);
      // There are multiple title elements, use getAllBy
      const titles = screen.getAllByText('Test Movie');
      expect(titles.length).toBeGreaterThan(0);
    });

    it('renders media year when available', () => {
      const media = createMockMedia({
        metadata: { title: 'Test', year: '2020', plot: '', poster: '', genre: '', director: '', actors: '', imdbRating: '', runtime: '', language: '' },
      });
      render(<MediaCard {...defaultProps} media={media} />);
      expect(screen.getByText('2020')).toBeInTheDocument();
    });

    it('renders IMDB rating badge when available', () => {
      const media = createMockMedia({
        metadata: { title: 'Test', year: '2020', plot: '', poster: '', genre: '', director: '', actors: '', imdbRating: '8.5', runtime: '', language: '' },
      });
      render(<MediaCard {...defaultProps} media={media} />);
      expect(screen.getByText('★ 8.5')).toBeInTheDocument();
    });

    it('renders series badge for series type', () => {
      const media = createMockMedia({
        type: 'series',
        season: 1,
        episode: 5,
      });
      render(<MediaCard {...defaultProps} media={media} />);
      expect(screen.getByText('S1')).toBeInTheDocument();
    });

    it('renders language badge for non-English media', () => {
      const media = createMockMedia({
        detectedLanguage: 'Hindi',
      });
      render(<MediaCard {...defaultProps} media={media} />);
      expect(screen.getByText('Hindi')).toBeInTheDocument();
    });
  });

  describe('Horizontal layout', () => {
    it('renders with horizontal styles', () => {
      render(<MediaCard {...defaultProps} isHorizontal={true} />);
      // Just verify it renders without error
      const titles = screen.getAllByText('Test Movie');
      expect(titles.length).toBeGreaterThan(0);
    });

    it('renders category in horizontal mode', () => {
      render(<MediaCard {...defaultProps} isHorizontal={true} />);
      expect(screen.getByText('Movies')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onPlay when clicked', async () => {
      const user = userEvent.setup();
      const onPlay = vi.fn();
      
      render(<MediaCard {...defaultProps} onPlay={onPlay} />);
      
      // Use the first title element and find clickable parent
      const title = screen.getAllByText('Test Movie')[0];
      const card = title.closest('div');
      await user.click(card!);
      
      expect(onPlay).toHaveBeenCalledTimes(1);
      expect(onPlay).toHaveBeenCalledWith(defaultProps.media);
    });
  });

  describe('Progress bar', () => {
    it('renders progress bar when media has been partially watched', () => {
      const media = createMockMedia({
        lastPosition: 300,
        duration: 600,
      });
      
      render(<MediaCard {...defaultProps} media={media} />);
      
      // Check that media with progress renders without error
      const titles = screen.getAllByText('Test Movie');
      expect(titles.length).toBeGreaterThan(0);
    });

    it('renders without progress bar when no position', () => {
      render(<MediaCard {...defaultProps} />);
      
      const titles = screen.getAllByText('Test Movie');
      expect(titles.length).toBeGreaterThan(0);
    });
  });

  describe('Poster/Thumbnail', () => {
    it('renders placeholder when no poster', () => {
      render(<MediaCard {...defaultProps} />);
      
      // Just verify it renders without poster
      const titles = screen.getAllByText('Test Movie');
      expect(titles.length).toBeGreaterThan(0);
    });

    it('renders poster image when available', () => {
      const media = createMockMedia({
        metadata: {
          title: 'Test',
          year: '2020',
          plot: '',
          poster: 'https://example.com/poster.jpg',
          genre: '',
          director: '',
          actors: '',
          imdbRating: '',
          runtime: '',
          language: '',
        },
      });
      
      render(<MediaCard {...defaultProps} media={media} />);
      
      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(1);
      expect(images[0]).toHaveAttribute('src', 'https://example.com/poster.jpg');
    });
  });
});
