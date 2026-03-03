import React, { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../../stores/appStore';
import { Icon } from '../common/Icon';
import { Button } from '../common/Button';

interface NavbarProps {
  onSearchOpen: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearchOpen }) => {
  const { 
    currentView, 
    setCurrentView, 
    mediaLibrary,
    isScanning,
    selectMediaFolder 
  } = useAppStore();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSelectFolder = useCallback(async () => {
    await selectMediaFolder();
  }, [selectMediaFolder]);

  const navItems = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'browse', label: 'Browse', icon: 'browse' },
    { id: 'profiles', label: 'Profiles', icon: 'profile' },
    { id: 'stats', label: 'Stats', icon: 'info' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ] as const;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-netflix-dark/95 backdrop-blur-md shadow-lg' 
          : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <h1 
              className="font-heading text-2xl md:text-3xl text-netflix-red cursor-pointer hover:text-red-400 transition-colors"
              onClick={() => setCurrentView('home')}
            >
              NETFLIX
            </h1>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as any)}
                  className={`text-sm font-medium transition-colors ${
                    currentView === item.id 
                      ? 'text-white' 
                      : 'text-netflix-gray hover:text-netflix-light'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            {/* Search button */}
            <button
              onClick={onSearchOpen}
              className="p-2 text-netflix-gray hover:text-white transition-colors"
              aria-label="Search"
            >
              <Icon name="search" size={22} />
            </button>

            {/* Scan folder button */}
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Icon name="folder" size={18} />}
              onClick={handleSelectFolder}
              isLoading={isScanning}
              className="hidden sm:inline-flex"
            >
              {mediaLibrary.length > 0 ? 'Scan Again' : 'Add Media'}
            </Button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-netflix-gray hover:text-white"
              aria-label="Menu"
            >
              <Icon name={isMobileMenuOpen ? 'close' : 'menu'} size={24} />
            </button>

            {/* Profile avatar */}
            <div className="w-8 h-8 rounded bg-netflix-red flex items-center justify-center">
              <Icon name="profile" size={18} className="text-white" />
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-netflix-gray/20">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id as any);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 text-left rounded transition-colors ${
                    currentView === item.id 
                      ? 'bg-netflix-red/20 text-white' 
                      : 'text-netflix-gray hover:bg-netflix-gray/10'
                  }`}
                >
                  <Icon name={item.icon as any} size={20} />
                  {item.label}
                </button>
              ))}
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Icon name="folder" size={18} />}
                onClick={() => {
                  handleSelectFolder();
                  setIsMobileMenuOpen(false);
                }}
                isLoading={isScanning}
                className="mx-4 mt-2"
              >
                {mediaLibrary.length > 0 ? 'Scan Again' : 'Add Media'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
