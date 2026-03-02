import React, { useRef, useState, useCallback } from 'react';
import type { MediaFile } from '../../types';
import { MediaCard } from './MediaCard';
import { Icon } from '../common/Icon';

interface MovieRowProps {
  title: string;
  media: MediaFile[];
  onPlay: (media: MediaFile) => void;
  showProgress?: boolean;
}

export const MovieRow: React.FC<MovieRowProps> = ({ title, media, onPlay, showProgress = false }) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (!rowRef.current) return;
    
    const { current } = rowRef;
    const scrollAmount = current.offsetWidth * 0.8;
    
    if (direction === 'left') {
      current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (!rowRef.current) return;
    
    const { current } = rowRef;
    const scrollLeft = current.scrollLeft;
    const scrollWidth = current.scrollWidth - current.offsetWidth;
    
    setShowLeftButton(scrollLeft > 0);
    setShowRightButton(scrollLeft < scrollWidth - 10);
  }, []);

  if (!media.length) return null;

  return (
    <div className="relative group -mt-4 md:-mt-8">
      {/* Title */}
      <h2 className="text-xl md:text-2xl font-medium text-netflix-light px-4 md:px-8 lg:px-16 mb-4">
        {title}
      </h2>

      {/* Left scroll button */}
      {showLeftButton && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/70 focus:outline-none"
          aria-label="Scroll left"
        >
          <Icon name="chevronLeft" size={32} className="text-white" />
        </button>
      )}

      {/* Right scroll button */}
      {showRightButton && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/70 focus:outline-none"
          aria-label="Scroll right"
        >
          <Icon name="chevronRight" size={32} className="text-white" />
        </button>
      )}

      {/* Scrollable row */}
      <div
        ref={rowRef}
        onScroll={handleScroll}
        className="flex gap-2 overflow-x-auto no-scrollbar px-4 md:px-8 lg:px-16 py-2 scroll-smooth"
        style={{ scrollBehavior: 'smooth' }}
      >
        {media.map((item) => (
          <MediaCard
            key={item.id}
            media={item}
            onPlay={onPlay}
            isHorizontal={showProgress}
          />
        ))}
      </div>
    </div>
  );
};

export default MovieRow;
