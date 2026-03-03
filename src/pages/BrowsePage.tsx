import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useAppStore } from '../stores/appStore';
import { MediaCard } from '../components/media/MediaCard';
import { Icon } from '../components/common/Icon';
import type { MediaFile, MediaFilter } from '../types';

type ViewMode = 'grid' | 'list';
type SortOption = 'name' | 'date' | 'size' | 'lastPlayed';

export const BrowsePage: React.FC = () => {
  const { mediaLibrary, setCurrentPlayingMedia, selectMediaFolder, loadMediaLibrary, isScanning, scanProgress } = useAppStore();
  
  // Filter state
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'video' | 'series'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Load media on mount
  useEffect(() => {
    loadMediaLibrary();
  }, [loadMediaLibrary]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(mediaLibrary.map(m => m.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [mediaLibrary]);

  // Filter and sort media
  const filteredMedia = useMemo(() => {
    let result = [...mediaLibrary];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(m => 
        m.title.toLowerCase().includes(query) ||
        m.name.toLowerCase().includes(query) ||
        (m.seriesName && m.seriesName.toLowerCase().includes(query))
      );
    }

    // Filter by type
    if (typeFilter !== 'all') {
      result = result.filter(m => m.type === typeFilter);
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      result = result.filter(m => m.category === categoryFilter);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'date':
          comparison = a.addedAt - b.addedAt;
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'lastPlayed':
          comparison = (a.lastPlayed || 0) - (b.lastPlayed || 0);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [mediaLibrary, searchQuery, typeFilter, categoryFilter, sortBy, sortOrder]);

  const handlePlay = useCallback((media: MediaFile) => {
    setCurrentPlayingMedia(media);
  }, [setCurrentPlayingMedia]);

  const handleSelectFolder = useCallback(async () => {
    await selectMediaFolder();
  }, [selectMediaFolder]);

  // Show welcome screen if no media
  if (mediaLibrary.length === 0) {
    return (
      <div className="min-h-screen bg-netflix-background flex items-center justify-center pt-16">
        <div className="text-center px-4 max-w-lg">
          <h1 className="font-heading text-4xl md:text-5xl text-netflix-red mb-6">
            Browse Library
          </h1>
          <p className="text-netflix-light text-lg md:text-xl mb-8">
            Your media library is empty. Select a folder to add movies and shows.
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
    <div className="min-h-screen bg-netflix-background pt-20 pb-20">
      {/* Header */}
      <div className="px-4 md:px-8 mb-6">
        <h1 className="font-heading text-3xl text-white mb-4">Browse Library</h1>
        
        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Icon 
              name="search" 
              size={18} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-netflix-gray" 
            />
            <input
              type="text"
              placeholder="Search movies and shows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-netflix-dark/80 border border-netflix-gray/30 rounded-md text-white placeholder-netflix-gray focus:outline-none focus:border-netflix-red transition-colors"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
            className="px-4 py-2 bg-netflix-dark/80 border border-netflix-gray/30 rounded-md text-white focus:outline-none focus:border-netflix-red"
          >
            <option value="all">All Types</option>
            <option value="video">Movies</option>
            <option value="series">TV Shows</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 bg-netflix-dark/80 border border-netflix-gray/30 rounded-md text-white focus:outline-none focus:border-netflix-red"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [by, order] = e.target.value.split('-') as [SortOption, 'asc' | 'desc'];
              setSortBy(by);
              setSortOrder(order);
            }}
            className="px-4 py-2 bg-netflix-dark/80 border border-netflix-gray/30 rounded-md text-white focus:outline-none focus:border-netflix-red"
          >
            <option value="date-desc">Recently Added</option>
            <option value="date-asc">Oldest First</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="size-desc">Largest</option>
            <option value="size-asc">Smallest</option>
            <option value="lastPlayed-desc">Recently Played</option>
          </select>

          {/* View Toggle */}
          <div className="flex rounded-md overflow-hidden border border-netflix-gray/30">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-netflix-red text-white' : 'bg-netflix-dark/80 text-netflix-gray hover:text-white'}`}
              aria-label="Grid view"
            >
              <Icon name="grid" size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-netflix-red text-white' : 'bg-netflix-dark/80 text-netflix-gray hover:text-white'}`}
              aria-label="List view"
            >
              <Icon name="list" size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="px-4 md:px-8 mb-4">
        <p className="text-netflix-gray">
          Showing {filteredMedia.length} of {mediaLibrary.length} items
        </p>
      </div>

      {/* Grid/List View */}
      {filteredMedia.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Icon name="search" size={48} className="text-netflix-gray mb-4" />
          <p className="text-netflix-gray text-lg">No media found</p>
          <p className="text-netflix-gray text-sm">Try adjusting your filters</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="px-4 md:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredMedia.map(media => (
              <MediaCard
                key={media.id}
                media={media}
                onPlay={handlePlay}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="px-4 md:px-8 space-y-2">
          {filteredMedia.map(media => (
            <div
              key={media.id}
              onClick={() => handlePlay(media)}
              className="flex items-center gap-4 p-3 bg-netflix-dark/50 rounded-lg hover:bg-netflix-dark cursor-pointer transition-colors"
            >
              {/* Thumbnail */}
              <div className="w-24 h-14 bg-netflix-gray/20 rounded overflow-hidden flex-shrink-0">
                {media.thumbnail ? (
                  <img src={media.thumbnail} alt={media.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon name="play" size={20} className="text-netflix-gray" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium truncate">{media.title}</h3>
                <p className="text-netflix-gray text-sm">
                  {media.type === 'series' ? 'TV Show' : 'Movie'}
                  {media.category && ` • ${media.category}`}
                </p>
              </div>

              {/* Duration */}
              <div className="text-netflix-gray text-sm flex-shrink-0">
                {media.duration ? `${Math.floor(media.duration / 60)}m` : '--'}
              </div>

              {/* Play indicator */}
              <button className="p-2 text-netflix-gray hover:text-netflix-red transition-colors">
                <Icon name="play" size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowsePage;
