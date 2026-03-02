import { create } from 'zustand';
import type { MediaFile, Profile, AppSettings, AppState, Category } from '../types';
import { db } from '../utils/indexedDb';
import { scanFolder, selectFolder, isFileSystemSupported } from '../utils/fileSystem';

interface AppStore extends AppState {
  // Actions
  setCurrentProfile: (profile: Profile | null) => void;
  addProfile: (profile: Profile) => Promise<void>;
  removeProfile: (id: string) => Promise<void>;
  loadProfiles: () => Promise<void>;
  
  selectMediaFolder: () => Promise<void>;
  scanMediaFolder: () => Promise<void>;
  loadMediaLibrary: () => Promise<void>;
  clearMediaLibrary: () => Promise<void>;
  
  setSearchQuery: (query: string) => void;
  toggleSearch: (isOpen?: boolean) => void;
  
  setCurrentView: (view: AppState['currentView']) => void;
  setCurrentPlayingMedia: (media: MediaFile | null) => void;
  toggleFullscreen: () => void;
  toggleSidebar: (isOpen?: boolean) => void;
  
  updatePlaybackPosition: (mediaId: string, position: number) => Promise<void>;
  getContinueWatching: () => Promise<MediaFile[]>;
  getRecentlyAdded: () => MediaFile[];
  getMovies: () => MediaFile[];
  getSeries: () => MediaFile[];
  getCategories: () => Category[];
  
  getSettings: () => Promise<AppSettings>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
}

const defaultSettings: AppSettings = {
  autoplay: true,
  autoplayNext: true,
  defaultQuality: 'auto',
  subtitles: false,
  reduceMotion: false,
  keyboardShortcuts: true,
};

export const useAppStore = create<AppStore>((set, get) => ({
  // Initial state
  currentProfile: null,
  profiles: [],
  mediaLibrary: [],
  isScanning: false,
  scanProgress: 0,
  selectedFolderHandle: null,
  searchQuery: '',
  searchResults: [],
  isSearchOpen: false,
  currentView: 'home',
  currentPlayingMedia: null,
  isPlayerFullscreen: false,
  isSidebarOpen: true,
  selectedSeries: null,

  // Profile actions
  setCurrentProfile: (profile) => set({ currentProfile: profile }),

  addProfile: async (profile) => {
    await db.addProfile(profile);
    set((state) => ({ profiles: [...state.profiles, profile] }));
  },

  removeProfile: async (id) => {
    await db.deleteProfile(id);
    set((state) => ({
      profiles: state.profiles.filter((p) => p.id !== id),
      currentProfile: state.currentProfile?.id === id ? null : state.currentProfile,
    }));
  },

  loadProfiles: async () => {
    const profiles = await db.getAllProfiles();
    set({ profiles });
  },

  // Media folder actions
  selectMediaFolder: async () => {
    if (!isFileSystemSupported()) {
      alert('File System Access API is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const handle = await selectFolder();
    if (handle) {
      set({ selectedFolderHandle: handle as any });
      await get().scanMediaFolder();
    }
  },

  scanMediaFolder: async () => {
    const { selectedFolderHandle } = get();
    if (!selectedFolderHandle) return;

    set({ isScanning: true, scanProgress: 0 });

    try {
      const result = await scanFolder(selectedFolderHandle, (progress) => {
        set({ scanProgress: progress });
      });

      // Save to IndexedDB
      await db.clearAllMedia();
      await db.addMediaBatch(result.mediaFiles);

      set({
        mediaLibrary: result.mediaFiles,
        isScanning: false,
        scanProgress: result.totalFiles,
      });
    } catch (error) {
      console.error('Error scanning folder:', error);
      set({ isScanning: false });
    }
  },

  loadMediaLibrary: async () => {
    const mediaLibrary = await db.getAllMedia();
    set({ mediaLibrary });
  },

  clearMediaLibrary: async () => {
    await db.clearAllMedia();
    set({ mediaLibrary: [] });
  },

  // Search actions
  setSearchQuery: (query) => {
    const { mediaLibrary } = get();
    if (!query.trim()) {
      set({ searchQuery: '', searchResults: [] });
      return;
    }

    const results = mediaLibrary.filter(
      (media) =>
        media.title.toLowerCase().includes(query.toLowerCase()) ||
        media.name.toLowerCase().includes(query.toLowerCase()) ||
        media.category.toLowerCase().includes(query.toLowerCase()) ||
        (media.seriesName && media.seriesName.toLowerCase().includes(query.toLowerCase()))
    );

    set({ searchQuery: query, searchResults: results });
  },

  toggleSearch: (isOpen) => {
    const current = get().isSearchOpen;
    set({
      isSearchOpen: isOpen !== undefined ? isOpen : !current,
      searchQuery: isOpen === false ? '' : get().searchQuery,
      searchResults: isOpen === false ? [] : get().searchResults,
    });
  },

  // Navigation actions
  setCurrentView: (view) => set({ currentView: view }),
  
  setCurrentPlayingMedia: (media) => set({ 
    currentPlayingMedia: media,
    currentView: media ? 'player' : get().currentView,
  }),
  
  toggleFullscreen: () => set((state) => ({ isPlayerFullscreen: !state.isPlayerFullscreen })),
  
  toggleSidebar: (isOpen) => set((state) => ({ 
    isSidebarOpen: isOpen !== undefined ? isOpen : !state.isSidebarOpen 
  })),

  // Playback actions
  updatePlaybackPosition: async (mediaId, position) => {
    await db.savePlaybackPosition(mediaId, position);
    
    set((state) => ({
      mediaLibrary: state.mediaLibrary.map((media) =>
        media.id === mediaId
          ? { ...media, lastPlayed: Date.now(), lastPosition: position }
          : media
      ),
    }));
  },

  getContinueWatching: async () => {
    const recentlyPlayed = await db.getRecentlyPlayed(20);
    const { mediaLibrary } = get();
    
    return recentlyPlayed
      .map((rp) => mediaLibrary.find((m) => m.id === rp.mediaId))
      .filter((m): m is MediaFile => m !== undefined && m.lastPosition !== undefined && m.lastPosition > 0)
      .slice(0, 10);
  },

  getRecentlyAdded: () => {
    const { mediaLibrary } = get();
    return [...mediaLibrary]
      .sort((a, b) => b.addedAt - a.addedAt)
      .slice(0, 20);
  },

  getMovies: () => {
    const { mediaLibrary } = get();
    return mediaLibrary.filter((m) => m.type === 'video');
  },

  getSeries: () => {
    const { mediaLibrary } = get();
    return mediaLibrary.filter((m) => m.type === 'series');
  },

  getCategories: () => {
    const { mediaLibrary } = get();
    const categoryMap = new Map<string, MediaFile[]>();

    mediaLibrary.forEach((media) => {
      const category = media.category;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(media);
    });

    return Array.from(categoryMap.entries()).map(([name, media]) => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      media,
      type: 'custom' as const,
    }));
  },

  // Settings actions
  getSettings: async () => {
    const settings = await db.getSettings();
    return settings || defaultSettings;
  },

  updateSettings: async (newSettings) => {
    const currentSettings = await get().getSettings();
    const updatedSettings = { ...currentSettings, ...newSettings };
    await db.saveSettings(updatedSettings);
  },
}));

export default useAppStore;
