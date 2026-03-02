import React, { useState, useEffect, useCallback } from 'react';
import type { MediaFile } from '../../types';
import { Icon } from '../common/Icon';
import { Button } from '../common/Button';

interface HeroProps {
  media: MediaFile | null;
  onPlay: (media: MediaFile) => void;
}

export const Hero: React.FC<HeroProps> = ({ media, onPlay }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
  }, [media?.id]);

  const handlePlay = useCallback(() => {
    if (media) {
      onPlay(media);
    }
  }, [media, onPlay]);

  if (!media) {
    return (
      <div className="relative h-[56.25vw] min-h-[300px] max-h-[80vh] bg-netflix-dark animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-netflix-dark via-transparent to-transparent z-10" />
      </div>
    );
  }

  return (
    <div className="relative h-[56.25vw] min-h-[300px] max-h-[80vh] overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-netflix-dark via-netflix-dark/50 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-netflix-background via-transparent to-transparent z-10" />
      
      {/* Animated gradient background */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br from-netflix-secondary via-netflix-primary to-black transition-opacity duration-700 ${
          isLoaded ? 'opacity-100' : 'opacity-50'
        }`}
      >
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-netflix-red/30 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-netflix-secondary rounded-full blur-3xl" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col justify-center px-4 md:px-8 lg:px-16 max-w-7xl mx-auto">
        <div className={`transition-all duration-700 transform ${isLoaded ? 'translate-y-0 opacity-translate-y-8100' : ' opacity-0'}`}>
          {/* Featured badge */}
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-netflix-red text-white text-xs font-bold uppercase tracking-wider rounded">
              Featured
            </span>
            {media.type === 'series' && (
              <span className="px-2 py-1 bg-netflix-gray/30 text-netflix-light text-xs rounded">
                TV Series
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="font-heading text-4xl md:text-5xl lg:text-7xl text-white mb-4 leading-tight">
            {media.title}
          </h1>

          {/* Meta info */}
          <div className="flex items-center gap-4 mb-6 text-sm text-netflix-gray">
            <span className="text-netflix-success font-medium">New</span>
            <span>{media.category}</span>
            {media.seriesName && (
              <>
                <span>•</span>
                <span>Season {media.season}</span>
                <span>•</span>
                <span>Episode {media.episode}</span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="hidden md:block text-netflix-light text-lg max-w-xl mb-8 leading-relaxed">
            Watch {media.title} from your local library. 
            {media.seriesName && ` Part of the ${media.seriesName} series.`}
          </p>

          {/* Buttons */}
          <div className="flex items-center gap-4">
            <Button
              size="lg"
              leftIcon={<Icon name="play" size={24} />}
              onClick={handlePlay}
              className="bg-white text-netflix-dark hover:bg-netflix-light"
            >
              Play
            </Button>
            <Button
              size="lg"
              variant="secondary"
              leftIcon={<Icon name="info" size={24} />}
            >
              More Info
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
