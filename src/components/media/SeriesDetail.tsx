import React, { useState, useMemo } from 'react';
import type { MediaFile } from '../../types';
import { Icon } from '../common/Icon';
import { Button } from '../common/Button';

interface SeriesDetailProps {
  seriesName: string;
  episodes: MediaFile[];
  onPlay: (media: MediaFile) => void;
  onBack: () => void;
}

export const SeriesDetail: React.FC<SeriesDetailProps> = ({ 
  seriesName, 
  episodes, 
  onPlay, 
  onBack 
}) => {
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Group episodes by season
  const seasons = useMemo(() => {
    const seasonMap = new Map<number, MediaFile[]>();
    
    episodes.forEach((episode) => {
      const season = episode.season || 1;
      if (!seasonMap.has(season)) {
        seasonMap.set(season, []);
      }
      seasonMap.get(season)!.push(episode);
    });

    // Sort episodes within each season
    seasonMap.forEach((eps, season) => {
      seasonMap.set(season, eps.sort((a, b) => 
        sortOrder === 'asc' 
          ? (a.episode || 0) - (b.episode || 0)
          : (b.episode || 0) - (a.episode || 0)
      ));
    });

    return Array.from(seasonMap.entries()).sort((a, b) => a[0] - b[0]);
  }, [episodes, sortOrder]);

  // Get first season if none selected
  const activeSeason = selectedSeason ?? seasons[0]?.[0] ?? 1;
  
  const currentSeasonEpisodes = useMemo(() => {
    const seasonData = seasons.find(([s]) => s === activeSeason);
    return seasonData?.[1] || [];
  }, [seasons, activeSeason]);

  // Get series metadata from first episode
  const seriesMetadata = episodes[0]?.metadata;
  const seriesPoster = seriesMetadata?.poster;
  const seriesRating = seriesMetadata?.imdbRating;
  const seriesPlot = seriesMetadata?.plot;
  const seriesGenre = seriesMetadata?.genre;

  return (
    <div className="min-h-screen bg-netflix-background pt-16">
      {/* Back button */}
      <button
        onClick={onBack}
        className="fixed top-20 left-4 z-50 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
      >
        <Icon name="back" size={24} className="text-white" />
      </button>

      {/* Hero backdrop */}
      <div className="relative h-[50vh] min-h-[300px]">
        {seriesPoster && (
          <div className="absolute inset-0">
            <img 
              src={seriesPoster} 
              alt={seriesName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-netflix-background via-netflix-background/60 to-transparent" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-netflix-background/90 via-netflix-background/50 to-transparent" />
        
        {/* Series info */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="font-heading text-4xl md:text-5xl text-white mb-4">
              {seriesName}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-netflix-gray mb-4">
              {seriesRating && seriesRating !== 'N/A' && (
                <span className="text-netflix-success font-bold">★ {seriesRating}</span>
              )}
              {seriesMetadata?.year && (
                <span>{seriesMetadata.year}</span>
              )}
              <span>{episodes.length} Episodes</span>
              <span>{seasons.length} Seasons</span>
            </div>

            {seriesPlot && (
              <p className="text-netflix-light max-w-2xl mb-4 line-clamp-3">
                {seriesPlot}
              </p>
            )}

            {seriesGenre && (
              <div className="flex flex-wrap gap-2 mb-6">
                {seriesGenre.split(',').slice(0, 4).map((g) => (
                  <span 
                    key={g} 
                    className="px-3 py-1 bg-netflix-gray/20 rounded-full text-sm text-netflix-light"
                  >
                    {g.trim()}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4">
              <Button
                size="lg"
                leftIcon={<Icon name="play" size={24} />}
                onClick={() => currentSeasonEpisodes[0] && onPlay(currentSeasonEpisodes[0])}
                disabled={currentSeasonEpisodes.length === 0}
              >
                Play
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Season selector and episodes */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          {/* Season selector */}
          <div className="flex items-center gap-2">
            <span className="text-netflix-gray">Season:</span>
            <div className="flex gap-1">
              {seasons.map(([season]) => (
                <button
                  key={season}
                  onClick={() => setSelectedSeason(season)}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    activeSeason === season
                      ? 'bg-netflix-red text-white'
                      : 'bg-netflix-gray/20 text-netflix-light hover:bg-netflix-gray/30'
                  }`}
                >
                  {season}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-netflix-gray">Sort:</span>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-2 px-4 py-2 bg-netflix-gray/20 rounded-md text-netflix-light hover:bg-netflix-gray/30 transition-colors"
            >
              <Icon name={sortOrder === 'asc' ? 'chevronLeft' : 'chevronRight'} size={16} />
              {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </button>
          </div>
        </div>

        {/* Episodes grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {currentSeasonEpisodes.map((episode) => (
            <button
              key={episode.id}
              onClick={() => onPlay(episode)}
              className="group relative aspect-video rounded-md overflow-hidden bg-netflix-dark text-left transition-transform hover:scale-105"
            >
              {/* Episode thumbnail */}
              {seriesPoster ? (
                <img 
                  src={seriesPoster} 
                  alt={episode.title}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                />
              ) : (
                <div className="w-full h-full bg-netflix-secondary flex items-center justify-center">
                  <Icon name="play" size={24} className="text-netflix-gray" />
                </div>
              )}

              {/* Episode number overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60">
                <Icon name="play" size={32} className="text-white" />
              </div>

              {/* Episode info */}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white text-sm font-medium truncate">
                  E{episode.episode}: {episode.title}
                </p>
                {episode.detectedLanguage && episode.detectedLanguage !== 'English' && (
                  <span className="text-xs text-netflix-gray">
                    {episode.detectedLanguage}
                  </span>
                )}
              </div>

              {/* Progress bar */}
              {episode.lastPosition && episode.duration && episode.lastPosition > 0 && (
                <div className="absolute bottom-0 left-0 h-1 bg-netflix-gray/30">
                  <div 
                    className="h-full bg-netflix-red"
                    style={{ width: `${(episode.lastPosition / episode.duration) * 100}%` }}
                  />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeriesDetail;
