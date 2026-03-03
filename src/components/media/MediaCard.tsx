import React, { useState, useCallback, useEffect } from 'react';
import type { MediaFile } from '../../types';
import { Icon } from '../common/Icon';
import { useAppStore } from '../../stores/appStore';
import { extractCleanTitle } from '../../utils/tmdbApi';

interface MediaCardProps {
  media: MediaFile;
  onPlay: (media: MediaFile) => void;
  onHover?: (media: MediaFile) => void;
  isHorizontal?: boolean;
}

export const MediaCard: React.FC<MediaCardProps> = ({ media, onPlay, onHover, isHorizontal = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  
  const fetchMetadata = useAppStore((state) => state.fetchMetadata);

  // Fetch metadata from OMDB API when poster is missing
  useEffect(() => {
    console.log('[MediaCard] Checking metadata:', { 
      title: media.title, 
      hasMetadata: !!media.metadata, 
      isLoading: isLoadingMetadata 
    });
    
    if (!media.metadata && !isLoadingMetadata) {
      console.log('[MediaCard] Fetching metadata for:', media.title);
      setIsLoadingMetadata(true);
      const titleInfo = extractCleanTitle(media.title);
      console.log('[MediaCard] Clean title:', titleInfo);
      fetchMetadata(media.id, titleInfo.title, titleInfo.year)
        .then(() => console.log('[MediaCard] Fetch complete for:', media.title))
        .finally(() => setIsLoadingMetadata(false));
    }
  }, [media.id, media.metadata, media.title, fetchMetadata, isLoadingMetadata]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    onHover?.(media);
  }, [media, onHover]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handlePlay = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onPlay(media);
  }, [media, onPlay]);

  // Get poster URL (from metadata or placeholder)
  const posterUrl = media.metadata?.poster && !imageError 
    ? media.metadata.poster 
    : null;

  // Calculate progress percentage if partially watched
  const progress = media.lastPosition && media.duration
    ? Math.min((media.lastPosition / media.duration) * 100, 100)
    : 0;

  if (isHorizontal) {
    // Horizontal card style for Continue Watching
    return (
      <div
        className="group relative flex-shrink-0 w-64 md:w-72 lg:w-80 cursor-pointer transition-transform duration-300 hover:scale-105 hover:z-10"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handlePlay}
      >
        <div className="relative aspect-video rounded-md overflow-hidden bg-netflix-dark">
          {/* Poster/Thumbnail */}
          {posterUrl ? (
            <img 
              src={posterUrl} 
              alt={media.title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-netflix-secondary to-netflix-dark flex items-center justify-center">
              <Icon name="play" size={48} className="text-netflix-gray opacity-50" />
            </div>
          )}

          {/* Progress bar */}
          {progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-netflix-gray/30">
              <div
                className="h-full bg-netflix-red transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Hover overlay */}
          <div
            className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-200 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <button className="w-14 h-14 rounded-full bg-netflix-red flex items-center justify-center transition-transform duration-200 hover:scale-110">
              <Icon name="play" size={32} className="text-white ml-1" />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-2 px-1">
          <h3 className="text-sm font-medium text-netflix-light truncate group-hover:text-white transition-colors">
            {media.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-netflix-gray">
            <span>{media.category}</span>
            {media.detectedLanguage && media.detectedLanguage !== 'English' && (
              <span className="px-1.5 py-0.5 bg-netflix-gray/30 rounded text-netflix-light">
                {media.detectedLanguage}
              </span>
            )}
            {media.metadata?.imdbRating && media.metadata.imdbRating !== 'N/A' && (
              <span className="text-netflix-success">★ {media.metadata.imdbRating}</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Vertical/grid card style
  return (
    <div
      className="group relative flex-shrink-0 w-40 md:w-48 lg:w-56 cursor-pointer transition-all duration-300 hover:scale-105 hover:z-20"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handlePlay}
    >
      <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-netflix-dark shadow-lg group-hover:shadow-2xl group-hover:shadow-black/50">
        {/* Poster */}
        {posterUrl ? (
          <img 
            src={posterUrl} 
            alt={media.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-netflix-secondary via-netflix-dark to-black flex items-center justify-center">
            <div className="text-center p-4">
              <Icon name="play" size={32} className="text-netflix-gray opacity-30 mx-auto mb-2" />
              <p className="text-xs text-netflix-gray opacity-50 line-clamp-3">{media.title}</p>
            </div>
          </div>
        )}

        {/* Gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />

        {/* Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
          {media.metadata?.imdbRating && media.metadata.imdbRating !== 'N/A' && (
            <span className="px-2 py-0.5 bg-netflix-success/90 text-black text-xs font-bold rounded flex items-center gap-1">
              ★ {media.metadata.imdbRating}
            </span>
          )}
          {media.type === 'series' && (
            <span className="px-2 py-0.5 bg-netflix-red text-white text-xs font-bold rounded">
              S{media.season}
            </span>
          )}
        </div>

        {/* Language badge */}
        {media.detectedLanguage && media.detectedLanguage !== 'English' && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-0.5 bg-black/70 text-white text-xs rounded">
              {media.detectedLanguage}
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div
          className={`absolute inset-0 bg-black/80 flex flex-col items-center justify-center transition-all duration-200 ${
            isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <h3 className="text-sm font-medium text-white text-center px-3 mb-3 line-clamp-2">
            {media.title}
          </h3>

          {/* Metadata */}
          {media.metadata && (
            <div className="text-xs text-netflix-gray text-center px-3 mb-2">
              {media.metadata.genre?.split(',').slice(0, 2).join(', ')}
            </div>
          )}
          
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center transition-transform duration-200 hover:scale-110 hover:bg-netflix-light">
              <Icon name="play" size={20} className="text-netflix-dark ml-0.5" />
            </button>
            <button className="w-10 h-10 rounded-full border-2 border-netflix-gray text-netflix-gray flex items-center justify-center transition-colors duration-200 hover:border-white hover:text-white">
              <Icon name="add" size={20} />
            </button>
          </div>

          <div className="mt-3 text-xs text-netflix-gray">
            {media.category}
          </div>
        </div>
      </div>

      {/* Title below */}
      <div className="mt-2 px-1">
        <h3 className="text-sm font-medium text-netflix-light truncate group-hover:text-white transition-colors">
          {media.title}
        </h3>
        {media.metadata?.year && (
          <p className="text-xs text-netflix-gray">
            {media.metadata.year}
          </p>
        )}
      </div>
    </div>
  );
};

export default MediaCard;
