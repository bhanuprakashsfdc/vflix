import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAppStore } from '../stores/appStore';
import { Hero } from '../components/media/Hero';
import { MovieRow } from '../components/media/MovieRow';
import { SeriesDetail } from '../components/media/SeriesDetail';
import type { MediaFile, SeriesGroup } from '../types';

export const HomePage: React.FC = () => {
  const { 
    mediaLibrary, 
    getContinueWatching, 
    getRecentlyAdded, 
    getMovies, 
    setCurrentPlayingMedia,
    selectMediaFolder,
    loadMediaLibrary,
    isScanning,
    scanProgress,
  } = useAppStore();

  const [continueWatching, setContinueWatching] = useState<MediaFile[]>([]);
  const [recentlyAdded, setRecentlyAdded] = useState<MediaFile[]>([]);
  const [movies, setMovies] = useState<MediaFile[]>([]);
  const [seriesGroups, setSeriesGroups] = useState<SeriesGroup[]>([]);
  const [featuredMedia, setFeaturedMedia] = useState<MediaFile | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<SeriesGroup | null>(null);

  // Group media by language
  const languageGroups = useMemo(() => {
    const groups: Record<string, MediaFile[]> = {};
    mediaLibrary.forEach(media => {
      // Use detected language from filename or metadata
      const lang = media.detectedLanguage || media.metadata?.language || 'Unknown';
      const langName = lang.split(',')[0].trim();
      if (!groups[langName]) groups[langName] = [];
      groups[langName].push(media);
    });
    // Filter to only include languages with 3+ items
    return Object.entries(groups)
      .filter(([_, items]) => items.length >= 3)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 5);
  }, [mediaLibrary]);

  // Group media by year
  const yearGroups = useMemo(() => {
    const groups: Record<string, MediaFile[]> = {};
    mediaLibrary.forEach(media => {
      const year = media.metadata?.year || new Date(media.createdAt).getFullYear().toString();
      if (!groups[year]) groups[year] = [];
      groups[year].push(media);
    });
    return Object.entries(groups)
      .filter(([_, items]) => items.length >= 2)
      .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
      .slice(0, 6);
  }, [mediaLibrary]);

  // Extract top actors and group by them
  const actorGroups = useMemo(() => {
    const actorMap: Record<string, MediaFile[]> = {};
    mediaLibrary.forEach(media => {
      if (media.metadata?.actors) {
        const actors = media.metadata.actors.split(',').slice(0, 3); // Top 3 actors
        actors.forEach(actor => {
          const name = actor.trim();
          if (name && name !== 'N/A') {
            if (!actorMap[name]) actorMap[name] = [];
            actorMap[name].push(media);
          }
        });
      }
    });
    return Object.entries(actorMap)
      .filter(([_, items]) => items.length >= 3)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 5);
  }, [mediaLibrary]);

  // Load media library on mount
  useEffect(() => {
    loadMediaLibrary();
  }, [loadMediaLibrary]);

  // Update content when library changes
  useEffect(() => {
    if (mediaLibrary.length === 0) return;

    // Get continue watching
    getContinueWatching().then(setContinueWatching);

    // Get movies
    setMovies(getMovies());

    // Get recently added
    setRecentlyAdded(getRecentlyAdded());

    // Group series by seriesName
    const seriesMap = new Map<string, MediaFile[]>();
    mediaLibrary.filter(m => m.type === 'series').forEach(episode => {
      const name = episode.seriesName || 'Unknown Series';
      if (!seriesMap.has(name)) {
        seriesMap.set(name, []);
      }
      seriesMap.get(name)!.push(episode);
    });

    // Convert to SeriesGroup array
    const groups: SeriesGroup[] = Array.from(seriesMap.entries()).map(([name, episodes]) => {
      const sortedEpisodes = episodes.sort((a, b) => {
        if (a.season !== b.season) return (a.season || 1) - (b.season || 1);
        return (a.episode || 0) - (b.episode || 0);
      });
      
      const firstEp = sortedEpisodes[0];
      return {
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        episodes: sortedEpisodes,
        poster: firstEp.metadata?.poster,
        rating: firstEp.metadata?.imdbRating,
        year: firstEp.metadata?.year,
        plot: firstEp.metadata?.plot,
      };
    });

    setSeriesGroups(groups);

    // Get random featured media
    const randomIndex = Math.floor(Math.random() * mediaLibrary.length);
    setFeaturedMedia(mediaLibrary[randomIndex]);
  }, [mediaLibrary, getContinueWatching, getRecentlyAdded, getMovies]);

  const handlePlay = useCallback((media: MediaFile) => {
    setCurrentPlayingMedia(media);
  }, [setCurrentPlayingMedia]);

  const handleSelectFolder = useCallback(async () => {
    await selectMediaFolder();
  }, [selectMediaFolder]);

  const handleSeriesClick = useCallback((series: SeriesGroup) => {
    setSelectedSeries(series);
  }, []);

  const handleBackToHome = useCallback(() => {
    setSelectedSeries(null);
  }, []);

  // Show series detail if selected
  if (selectedSeries) {
    return (
      <SeriesDetail
        seriesName={selectedSeries.name}
        episodes={selectedSeries.episodes}
        onPlay={handlePlay}
        onBack={handleBackToHome}
      />
    );
  }

  // Show welcome screen if no media
  if (mediaLibrary.length === 0) {
    return (
      <div className="min-h-screen bg-netflix-background flex items-center justify-center pt-16">
        <div className="text-center px-4 max-w-lg">
          <h1 className="font-heading text-4xl md:text-5xl text-netflix-red mb-6">
            Netflix Clone
          </h1>
          <p className="text-netflix-light text-lg md:text-xl mb-8">
            Your personal streaming experience. Select a folder to start watching your local media files.
          </p>
          
          <button
            onClick={handleSelectFolder}
            disabled={isScanning}
            className="inline-flex items-center gap-3 px-8 py-4 bg-netflix-red text-white text-lg font-medium rounded-md transition-all duration-200 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isScanning ? (
              <>
                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Scanning... ({scanProgress} files)</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span>Select Media Folder</span>
              </>
            )}
          </button>

          <p className="mt-6 text-netflix-gray text-sm">
            Supports: .mp4, .mkv, .webm, .avi, .mov
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-background">
      {/* Hero section with top padding for navbar */}
      <div className="pt-16">
        <Hero media={featuredMedia} onPlay={handlePlay} />
      </div>

      {/* Content rows with proper spacing */}
      <div className="relative z-10 pb-20 space-y-8">
        {/* Continue Watching */}
        {continueWatching.length > 0 && (
          <MovieRow
            title="Continue Watching"
            media={continueWatching}
            onPlay={handlePlay}
            showProgress
          />
        )}

        {/* Recently Added */}
        {recentlyAdded.length > 0 && (
          <MovieRow
            title="Recently Added"
            media={recentlyAdded}
            onPlay={handlePlay}
          />
        )}

        {/* Movies */}
        {movies.length > 0 && (
          <MovieRow
            title="Movies"
            media={movies.slice(0, 20)}
            onPlay={handlePlay}
          />
        )}

        {/* TV Shows - grouped by series */}
        {seriesGroups.length > 0 && (
          <MovieRow
            title="TV Shows"
            media={seriesGroups.map(g => {
              const firstEp = g.episodes[0];
              return {
                ...firstEp,
                id: g.id,
                title: g.name,
                seriesName: g.name,
                metadata: firstEp.metadata ? {
                  ...firstEp.metadata,
                  title: g.name,
                  poster: g.poster || firstEp.metadata.poster,
                  imdbRating: g.rating || firstEp.metadata.imdbRating,
                } : undefined,
              };
            })}
            onPlay={(media) => {
              const group = seriesGroups.find(g => g.id === media.id || g.name === media.title);
              if (group) {
                handleSeriesClick(group);
              } else {
                handlePlay(media);
              }
            }}
          />
        )}

        {/* Language Rows */}
        {languageGroups.map(([language, items]) => (
          <MovieRow
            key={`lang-${language}`}
            title={`In ${language}`}
            media={items.slice(0, 20)}
            onPlay={handlePlay}
          />
        ))}

        {/* Year Rows */}
        {yearGroups.map(([year, items]) => (
          <MovieRow
            key={`year-${year}`}
            title={`From ${year}`}
            media={items.slice(0, 20)}
            onPlay={handlePlay}
          />
        ))}

        {/* Actor Rows */}
        {actorGroups.map(([actor, items]) => (
          <MovieRow
            key={`actor-${actor}`}
            title={`Featuring ${actor}`}
            media={items.slice(0, 20)}
            onPlay={handlePlay}
          />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
