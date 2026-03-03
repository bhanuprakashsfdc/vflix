import { useState, useCallback, useEffect } from 'react';
import { useAppStore } from './stores/appStore';
import { Navbar } from './components/layout/Navbar';
import { SearchOverlay } from './components/layout/SearchOverlay';
import { VideoPlayer } from './components/player/VideoPlayer';
import { HomePage } from './pages/HomePage';
import { BrowsePage } from './pages/BrowsePage';
import { ProfilesPage } from './pages/ProfilesPage';
import { SettingsPage } from './pages/SettingsPage';
import { StatsPage } from './pages/StatsPage';
import type { MediaFile } from './types';

function App() {
  const { 
    currentView, 
    setCurrentView, 
    currentPlayingMedia,
    setCurrentPlayingMedia,
    loadMediaLibrary,
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
        return <BrowsePage />;
      case 'profiles':
        return <ProfilesPage />;
      case 'settings':
        return <SettingsPage />;
      case 'stats':
        return <StatsPage />;
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
