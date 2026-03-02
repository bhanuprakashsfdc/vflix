import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../../stores/appStore';
import { Icon } from '../common/Icon';
import type { MediaFile } from '../../types';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onPlay: (media: MediaFile) => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose, onPlay }) => {
  const { searchQuery, setSearchQuery, searchResults } = useAppStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [localQuery, setLocalQuery] = useState(searchQuery);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setLocalQuery(query);
    setSearchQuery(query);
  }, [setSearchQuery]);

  const handleClose = useCallback(() => {
    setLocalQuery('');
    setSearchQuery('');
    onClose();
  }, [onClose, setSearchQuery]);

  const handlePlay = useCallback((media: MediaFile) => {
    onPlay(media);
    handleClose();
  }, [onPlay, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-netflix-background/95 backdrop-blur-sm animate-fade-in">
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 p-2 text-netflix-gray hover:text-white transition-colors"
        aria-label="Close search"
      >
        <Icon name="close" size={28} />
      </button>

      {/* Search content */}
      <div className="max-w-4xl mx-auto px-4 pt-20">
        {/* Search input */}
        <div className="relative">
          <Icon 
            name="search" 
            size={24} 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-netflix-gray" 
          />
          <input
            ref={inputRef}
            type="text"
            value={localQuery}
            onChange={handleQueryChange}
            placeholder="Search titles, categories..."
            className="w-full bg-netflix-dark/50 border-2 border-netflix-gray/30 rounded-lg py-4 pl-14 pr-4 text-xl text-white placeholder-netflix-gray focus:border-netflix-red focus:outline-none transition-colors"
          />
        </div>

        {/* Results */}
        <div className="mt-8 max-h-[60vh] overflow-y-auto">
          {searchQuery && searchResults.length === 0 && (
            <div className="text-center text-netflix-gray py-12">
              <Icon name="search" size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">No results found for "{searchQuery}"</p>
              <p className="text-sm mt-2">Try searching for different keywords</p>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {searchResults.map((media) => (
                <button
                  key={media.id}
                  onClick={() => handlePlay(media)}
                  className="group relative aspect-[2/3] rounded-md overflow-hidden bg-netflix-dark text-left transition-transform duration-200 hover:scale-105 hover:z-10"
                >
                  {/* Thumbnail placeholder */}
                  <div className="absolute inset-0 bg-gradient-to-br from-netflix-secondary to-netflix-dark flex items-center justify-center">
                    <Icon name="play" size={24} className="text-netflix-gray opacity-30" />
                  </div>
                  
                  {/* Info overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-sm font-medium text-white truncate">
                      {media.title}
                    </h3>
                    <p className="text-xs text-netflix-gray truncate">
                      {media.category}
                    </p>
                  </div>

                  {/* Play button on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60">
                    <Icon name="play" size={32} className="text-white" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick tips */}
        {!searchQuery && (
          <div className="mt-12 text-center text-netflix-gray">
            <p className="text-sm">Start typing to search your media library</p>
            <p className="text-xs mt-2">Search by title, category, or series name</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchOverlay;
