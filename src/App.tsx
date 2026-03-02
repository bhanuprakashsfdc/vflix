import { useState, useCallback, useEffect } from 'react';
import { useAppStore } from './stores/appStore';
import { Navbar } from './components/layout/Navbar';
import { SearchOverlay } from './components/layout/SearchOverlay';
import { VideoPlayer } from './components/player/VideoPlayer';
import { HomePage } from './pages/HomePage';
import type { MediaFile } from './types';

function App() {
  const { 
    currentView, 
    setCurrentView, 
    currentPlayingMedia,
    setCurrentPlayingMedia,
    loadMediaLibrary,
    mediaLibrary,
  } = useAppStore();

  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);

  // Load media library on mount
  useEffect(() => {
    loadMediaLibrary();
  }, [loadMediaLibrary]);

  // Handle search
  const handleSearchOpen = useCallback(() => {
    setIsSearchOverlayOpen(true);
  }, []);

  const handleSearchClose = useCallback(() => {
    setIsSearchOverlayOpen(false);
  }, []);

  // Handle play media
  const handlePlay = useCallback((media: MediaFile) => {
    setCurrentPlayingMedia(media);
  }, [setCurrentPlayingMedia]);

  // Handle close player
  const handleClosePlayer = useCallback(() => {
    setCurrentPlayingMedia(null);
    setCurrentView('home');
  }, [setCurrentPlayingMedia, setCurrentView]);

  // Render main content
  const renderContent = () => {
    switch (currentView) {
      case 'home':
      default:
        return <HomePage />;
      case 'browse':
        return <HomePage />; // For now, browse uses home
      case 'settings':
        return (
          <div className="min-h-screen bg-netflix-background pt-24 px-4">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-heading text-white mb-8">Settings</h1>
              
              <div className="space-y-6">
                {/* Media Library */}
                <div className="bg-netflix-dark rounded-lg p-6">
                  <h2 className="text-xl text-white mb-4">Media Library</h2>
                  <p className="text-netflix-gray mb-4">
                    {mediaLibrary.length} items in your library
                  </p>
                  <button
                    onClick={() => useAppStore.getState().selectMediaFolder()}
                    className="px-4 py-2 bg-netflix-red text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Scan Folder
                  </button>
                </div>

                {/* About */}
                <div className="bg-netflix-dark rounded-lg p-6">
                  <h2 className="text-xl text-white mb-4">About</h2>
                  <p className="text-netflix-gray">
                    Netflix Clone - Your personal local media player
                  </p>
                  <p className="text-netflix-gray text-sm mt-2">
                    Supports: .mp4, .mkv, .webm, .avi, .mov
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-netflix-background">
      {/* Navbar */}
      <Navbar onSearchOpen={handleSearchOpen} />

      {/* Main content */}
      {renderContent()}

      {/* Search overlay */}
      <SearchOverlay
        isOpen={isSearchOverlayOpen}
        onClose={handleSearchClose}
        onPlay={handlePlay}
      />

      {/* Video player */}
      {currentPlayingMedia && (
        <VideoPlayer
          media={currentPlayingMedia}
          onClose={handleClosePlayer}
        />
      )}
    </div>
  );
}

export default App;
