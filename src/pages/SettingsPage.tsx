import React, { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../stores/appStore';
import { Button } from '../components/common/Button';
import type { AppSettings } from '../types';

// Keyboard shortcuts reference
const SHORTCUTS = [
  { key: 'Space / K', action: 'Play/Pause' },
  { key: '← / J', action: 'Rewind 10 seconds' },
  { key: '→ / L', action: 'Forward 10 seconds' },
  { key: '↑', action: 'Volume up' },
  { key: '↓', action: 'Volume down' },
  { key: 'M', action: 'Mute/Unmute' },
  { key: 'F', action: 'Toggle fullscreen' },
  { key: 'P', action: 'Picture-in-Picture' },
  { key: 'C', action: 'Toggle subtitles' },
  { key: 'S', action: 'Open subtitles menu' },
  { key: 'A', action: 'Open audio menu' },
  { key: '/', action: 'Open search' },
  { key: 'Esc', action: 'Close/Back' },
];

export const SettingsPage: React.FC = () => {
  const { 
    mediaLibrary, 
    selectMediaFolder, 
    clearMediaLibrary,
    loadMediaLibrary,
    getSettings,
    updateSettings,
    isScanning,
    scanProgress
  } = useAppStore();
  
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load settings on mount
  useEffect(() => {
    getSettings().then(setSettings);
  }, [getSettings]);

  const handleSaveSettings = useCallback(async (newSettings: Partial<AppSettings>) => {
    if (!settings) return;
    setIsSaving(true);
    try {
      await updateSettings(newSettings);
      setSettings({ ...settings, ...newSettings });
    } finally {
      setIsSaving(false);
    }
  }, [settings, updateSettings]);

  const handleScanFolder = useCallback(async () => {
    await selectMediaFolder();
    await loadMediaLibrary();
  }, [selectMediaFolder, loadMediaLibrary]);

  const handleClearLibrary = useCallback(async () => {
    if (confirm('Are you sure you want to clear your media library? This will remove all cached metadata.')) {
      await clearMediaLibrary();
    }
  }, [clearMediaLibrary]);

  const toggleSetting = (key: keyof AppSettings) => {
    if (!settings) return;
    handleSaveSettings({ [key]: !settings[key] });
  };

  if (!settings) {
    return (
      <div className="min-h-screen bg-netflix-background pt-20 flex items-center justify-center">
        <div className="text-white">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-background pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="font-heading text-3xl text-white mb-8">Settings</h1>

        <div className="space-y-6">
          {/* Playback Settings */}
          <section className="bg-netflix-dark rounded-lg p-6">
            <h2 className="text-xl text-white mb-4 font-medium">Playback</h2>
            
            <div className="space-y-4">
              <SettingToggle
                label="Autoplay"
                description="Automatically play the next episode or video"
                enabled={settings.autoplay}
                onToggle={() => toggleSetting('autoplay')}
              />
              
              <SettingToggle
                label="Autoplay Next"
                description="Automatically play the next episode in a series"
                enabled={settings.autoplayNext}
                onToggle={() => toggleSetting('autoplayNext')}
              />
              
              <SettingToggle
                label="Keyboard Shortcuts"
                description="Enable keyboard shortcuts for video player control"
                enabled={settings.keyboardShortcuts}
                onToggle={() => toggleSetting('keyboardShortcuts')}
              />
            </div>
          </section>

          {/* Appearance Settings */}
          <section className="bg-netflix-dark rounded-lg p-6">
            <h2 className="text-xl text-white mb-4 font-medium">Appearance</h2>
            
            <div className="space-y-4">
              <SettingToggle
                label="Reduce Motion"
                description="Minimize animations throughout the app"
                enabled={settings.reduceMotion}
                onToggle={() => toggleSetting('reduceMotion')}
              />
              
              <SettingToggle
                label="Subtitles"
                description="Show subtitles by default when available"
                enabled={settings.subtitles}
                onToggle={() => toggleSetting('subtitles')}
              />
            </div>
          </section>

          {/* Media Library Settings */}
          <section className="bg-netflix-dark rounded-lg p-6">
            <h2 className="text-xl text-white mb-4 font-medium">Media Library</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">Library Size</p>
                  <p className="text-netflix-gray text-sm">{mediaLibrary.length} items</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button
                  onClick={handleScanFolder}
                  isLoading={isScanning}
                >
                  {isScanning ? `Scanning... (${scanProgress})` : 'Scan Folder'}
                </Button>
                
                <Button
                  variant="secondary"
                  onClick={handleClearLibrary}
                  disabled={mediaLibrary.length === 0}
                >
                  Clear Library
                </Button>
              </div>
            </div>
          </section>

          {/* Keyboard Shortcuts */}
          <section className="bg-netflix-dark rounded-lg p-6">
            <h2 className="text-xl text-white mb-4 font-medium">Keyboard Shortcuts</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {SHORTCUTS.map(shortcut => (
                <div key={shortcut.action} className="flex items-center justify-between py-2 px-3 bg-black/20 rounded">
                  <span className="text-netflix-gray text-sm">{shortcut.action}</span>
                  <kbd className="px-2 py-1 bg-black/50 text-white text-xs rounded font-mono">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>
            
            <p className="text-netflix-gray text-sm mt-4">
              Shortcuts work when the video player is in focus
            </p>
          </section>

          {/* About */}
          <section className="bg-netflix-dark rounded-lg p-6">
            <h2 className="text-xl text-white mb-4 font-medium">About</h2>
            
            <div className="space-y-2 text-netflix-gray">
              <p><span className="text-white">VFlix</span> - Your Personal Local Media Player</p>
              <p>Version 1.0.0</p>
              <p className="text-sm">
                Supports: .mp4, .mkv, .webm, .avi, .mov
              </p>
              <p className="text-sm mt-4">
                VFlix runs entirely in your browser. No data is sent to any server.
                Your media stays on your device.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

// Setting Toggle Component
interface SettingToggleProps {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}

const SettingToggle: React.FC<SettingToggleProps> = ({ label, description, enabled, onToggle }) => (
  <div className="flex items-center justify-between">
    <div>
      <p className="text-white">{label}</p>
      <p className="text-netflix-gray text-sm">{description}</p>
    </div>
    <button
      onClick={onToggle}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        enabled ? 'bg-netflix-red' : 'bg-netflix-gray/50'
      }`}
    >
      <span
        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
);

export default SettingsPage;
