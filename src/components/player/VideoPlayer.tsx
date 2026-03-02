import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { MediaFile, PlaybackState } from '../../types';
import { useAppStore } from '../../stores/appStore';
import { getVideoURL, revokeVideoURL, formatDuration } from '../../utils/fileSystem';
import { Icon } from '../common/Icon';
import { Button } from '../common/Button';

interface VideoPlayerProps {
  media: MediaFile;
  onClose: () => void;
}

type AspectRatio = '16:9' | '2.35:1' | '4:3' | 'original';

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ media, onClose }) => {
  const { updatePlaybackPosition } = useAppStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    isFullscreen: false,
    playbackRate: 1,
    quality: 'auto',
  });
  const [showControls, setShowControls] = useState(true);
  
  // New features state
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [subtitles, setSubtitles] = useState<TextTrack[]>([]);
  const [activeAudioTrack, setActiveAudioTrack] = useState<number>(0);
  const [activeSubtitle, setActiveSubtitle] = useState<number>(-1); // -1 = off
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [showAspectMenu, setShowAspectMenu] = useState(false);
  const [videoZoom, setVideoZoom] = useState<number>(100);
  const [showZoomMenu, setShowZoomMenu] = useState(false);

  interface AudioTrack {
    kind: string;
    label: string;
    language: string;
    index: number;
  }

  interface TextTrack {
    kind: string;
    label: string;
    language: string;
    index: number;
  }

  // Auto-fullscreen on large screens
  useEffect(() => {
    const enterFullscreen = async () => {
      if (!containerRef.current) return;
      
      // Auto-fullscreen on screens wider than 1024px
      if (window.innerWidth > 1024 && !document.fullscreenElement) {
        try {
          await containerRef.current.requestFullscreen();
          setPlaybackState(prev => ({ ...prev, isFullscreen: true }));
        } catch (err) {
          console.log('Auto-fullscreen failed:', err);
        }
      }
    };

    // Delay fullscreen to allow video to load
    const timeout = setTimeout(enterFullscreen, 500);
    return () => clearTimeout(timeout);
  }, []);

  // Load video URL
  useEffect(() => {
    let mounted = true;

    const loadVideo = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const url = await getVideoURL(media.handle as any);
        
        if (mounted) {
          setVideoUrl(url);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to load video file');
          setIsLoading(false);
        }
      }
    };

    loadVideo();

    return () => {
      mounted = false;
      if (videoUrl) {
        revokeVideoURL(videoUrl);
      }
    };
  }, [media.handle]);

  // Set initial position from last watched
  useEffect(() => {
    if (videoRef.current && media.lastPosition) {
      videoRef.current.currentTime = media.lastPosition;
    }
  }, [videoUrl, media.lastPosition]);

  // Save position periodically
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (videoRef.current && playbackState.isPlaying) {
        updatePlaybackPosition(media.id, videoRef.current.currentTime);
      }
    }, 10000);

    return () => clearInterval(saveInterval);
  }, [media.id, playbackState.isPlaying, updatePlaybackPosition]);

  // Extract available audio tracks and subtitles from video
  const handleVideoCanPlay = useCallback(() => {
    if (!videoRef.current) return;

    // Auto-play when video is ready
    videoRef.current.play().catch(console.log);

    const video = videoRef.current;
    const tracks: AudioTrack[] = [];
    const subs: TextTrack[] = [];

    // Get audio tracks
    if ((video as any).audioTracks) {
      for (let i = 0; i < (video as any).audioTracks.length; i++) {
        const track = (video as any).audioTracks[i];
        tracks.push({
          kind: track.kind || 'alternative',
          label: track.label || `Audio ${i + 1}`,
          language: track.language || 'unknown',
          index: i,
        });
      }
    }

    // Get text tracks (subtitles)
    if (video.textTracks) {
      for (let i = 0; i < video.textTracks.length; i++) {
        const track = video.textTracks[i];
        if (track.kind === 'subtitles' || track.kind === 'captions') {
          subs.push({
            kind: track.kind,
            label: track.label || `Subtitle ${i + 1}`,
            language: track.language || 'unknown',
            index: i,
          });
        }
      }
    }

    setAudioTracks(tracks);
    setSubtitles(subs);

    // Auto-detect language from filename and set active tracks
    const langMatch = media.title.match(/\b(english|hindi|tamil|telugu|malayalam|kannada|japanese|korean|chinese|spanish|french|german|italian|portuguese|arabic|rusian)\b/i);
    if (langMatch) {
      const detectedLang = langMatch[1].toLowerCase();
      
      // Set matching audio track
      const audioIndex = tracks.findIndex(t => 
        t.language.toLowerCase().startsWith(detectedLang.substring(0, 2))
      );
      if (audioIndex >= 0) {
        setActiveAudioTrack(audioIndex);
        if ((video as any).audioTracks && (video as any).audioTracks[audioIndex]) {
          (video as any).audioTracks[audioIndex].enabled = true;
        }
      }

      // Set matching subtitle
      const subIndex = subs.findIndex(s => 
        s.language.toLowerCase().startsWith(detectedLang.substring(0, 2))
      );
      if (subIndex >= 0) {
        setActiveSubtitle(subIndex);
      }
    }
  }, [media.title]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return;

      // Close menus on Escape
      if (showAudioMenu || showSubtitleMenu || showAspectMenu) {
        if (e.key === 'Escape') {
          setShowAudioMenu(false);
          setShowSubtitleMenu(false);
          setShowAspectMenu(false);
          return;
        }
      }

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
        case 'j':
          e.preventDefault();
          seek(-10);
          break;
        case 'ArrowRight':
        case 'l':
          e.preventDefault();
          seek(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          adjustVolume(0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          adjustVolume(-0.1);
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'c':
          e.preventDefault();
          setShowSubtitleMenu(prev => !prev);
          setShowAudioMenu(false);
          setShowAspectMenu(false);
          break;
        case 'a':
          e.preventDefault();
          setShowAudioMenu(prev => !prev);
          setShowSubtitleMenu(false);
          setShowAspectMenu(false);
          break;
        case 'Escape':
          if (!showAudioMenu && !showSubtitleMenu && !showAspectMenu) {
            e.preventDefault();
            handleClose();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAudioMenu, showSubtitleMenu, showAspectMenu]);

  // Control functions
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    
    if (playbackState.isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  }, [playbackState.isPlaying]);

  const seek = useCallback((seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(
      videoRef.current.currentTime + seconds,
      videoRef.current.duration
    ));
  }, []);

  const adjustVolume = useCallback((delta: number) => {
    if (!videoRef.current) return;
    const newVolume = Math.max(0, Math.min(1, playbackState.volume + delta));
    videoRef.current.volume = newVolume;
    setPlaybackState(prev => ({ ...prev, volume: newVolume, isMuted: newVolume === 0 }));
  }, [playbackState.volume]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !playbackState.isMuted;
    setPlaybackState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  }, [playbackState.isMuted]);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setPlaybackState(prev => ({ ...prev, isFullscreen: true }));
    } else {
      await document.exitFullscreen();
      setPlaybackState(prev => ({ ...prev, isFullscreen: false }));
    }
  }, []);

  const handleClose = useCallback(async () => {
    if (videoRef.current) {
      await updatePlaybackPosition(media.id, videoRef.current.currentTime);
    }
    onClose();
  }, [media.id, onClose, updatePlaybackPosition]);

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    if (playbackState.isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [playbackState.isPlaying]);

  // Video event handlers
  const handlePlay = useCallback(() => {
    setPlaybackState(prev => ({ ...prev, isPlaying: true }));
    showControlsTemporarily();
  }, [showControlsTemporarily]);

  const handlePause = useCallback(() => {
    setPlaybackState(prev => ({ ...prev, isPlaying: false }));
    setShowControls(true);
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    setPlaybackState(prev => ({
      ...prev,
      currentTime: videoRef.current!.currentTime,
    }));
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (!videoRef.current) return;
    setPlaybackState(prev => ({
      ...prev,
      duration: videoRef.current!.duration,
    }));
  }, []);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = parseFloat(e.target.value);
    videoRef.current.currentTime = time;
    setPlaybackState(prev => ({ ...prev, currentTime: time }));
  }, []);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const volume = parseFloat(e.target.value);
    videoRef.current.volume = volume;
    setPlaybackState(prev => ({ ...prev, volume, isMuted: volume === 0 }));
  }, []);

  // Handle audio track change
  const handleAudioTrackChange = useCallback((index: number) => {
    if (!videoRef.current || !(videoRef.current as any).audioTracks) return;
    
    const video = videoRef.current as any;
    // Disable all tracks first
    for (let i = 0; i < video.audioTracks.length; i++) {
      video.audioTracks[i].enabled = false;
    }
    
    // Enable selected track
    video.audioTracks[index].enabled = true;
    setActiveAudioTrack(index);
    setShowAudioMenu(false);
  }, []);

  // Handle subtitle change
  const handleSubtitleChange = useCallback((index: number) => {
    if (!videoRef.current || !videoRef.current.textTracks) return;
    
    // Disable all subtitles first
    for (let i = 0; i < videoRef.current.textTracks.length; i++) {
      videoRef.current.textTracks[i].mode = 'disabled';
    }
    
    // Enable selected subtitle
    if (index >= 0 && videoRef.current.textTracks[index]) {
      videoRef.current.textTracks[index].mode = 'showing';
    }
    
    setActiveSubtitle(index);
    setShowSubtitleMenu(false);
  }, []);

  // Handle aspect ratio change
  const handleAspectRatioChange = useCallback((ratio: AspectRatio) => {
    setAspectRatio(ratio);
    setShowAspectMenu(false);
  }, []);

  // Handle zoom change
  const handleZoomChange = useCallback((zoom: number) => {
    setVideoZoom(zoom);
    setShowZoomMenu(false);
  }, []);

  // Get aspect ratio style
  const getAspectRatioStyle = () => {
    switch (aspectRatio) {
      case '16:9':
        return 'aspect-video';
      case '2.35:1':
        return 'aspect-[2.35/1]';
      case '4:3':
        return 'aspect-[4/3]';
      case 'original':
        return '';
    }
  };

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setPlaybackState(prev => ({ 
        ...prev, 
        isFullscreen: !!document.fullscreenElement 
      }));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowAudioMenu(false);
      setShowSubtitleMenu(false);
      setShowAspectMenu(false);
    };

    if (showAudioMenu || showSubtitleMenu || showAspectMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showAudioMenu, showSubtitleMenu, showAspectMenu]);

  // Render dropdown menu
  const renderDropdownMenu = (
    items: { label: string; value: string | number }[],
    activeValue: string | number,
    onSelect: (value: string | number) => void,
    _onClose: () => void
  ) => (
    <div className="absolute bottom-16 right-4 bg-black/90 border border-netflix-gray/30 rounded-lg overflow-hidden min-w-[200px] z-20">
      {items.map((item, index) => (
        <button
          key={index}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(item.value);
          }}
          className={`w-full text-left px-4 py-2 text-white hover:bg-netflix-red/80 transition-colors flex items-center justify-between ${
            activeValue === item.value ? 'text-netflix-red' : ''
          }`}
        >
          {item.label}
          {activeValue === item.value && <Icon name="check" size={16} />}
        </button>
      ))}
    </div>
  );

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex flex-col"
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => playbackState.isPlaying && setShowControls(false)}
    >
      {/* Top bar */}
      <div className={`absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Icon name="back" size={24} />}
              onClick={handleClose}
              className="text-white"
            >
              Back
            </Button>
            
            <h1 className="text-white font-medium text-lg truncate max-w-md">
              {media.title}
            </h1>
          </div>

          {/* Aspect ratio indicator */}
          <div className="flex items-center gap-2">
            <span className="text-white/60 text-sm">{aspectRatio}</span>
          </div>
        </div>
      </div>

      {/* Video element */}
      <div className="flex-1 flex items-center justify-center">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-netflix-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-netflix-gray">Loading video...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center p-8">
            <Icon name="info" size={48} className="text-netflix-red mx-auto mb-4" />
            <p className="text-netflix-red text-lg mb-4">{error}</p>
            <Button onClick={handleClose} variant="secondary">
              Go Back
            </Button>
          </div>
        )}

        {videoUrl && !error && (
          <video
            ref={videoRef}
            src={videoUrl || undefined}
            className={`${aspectRatio !== 'original' ? getAspectRatioStyle() : ''} max-w-full max-h-full transition-all duration-300`}
            style={{ transform: `scale(${videoZoom / 100})` }}
            onPlay={handlePlay}
            onPause={handlePause}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onCanPlay={handleVideoCanPlay}
            onClick={togglePlay}
          />
        )}
      </div>

      {/* Bottom controls - compact */}
      <div className={`absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Progress bar */}
        <div className="px-2">
          <input
            type="range"
            min={0}
            max={playbackState.duration || 100}
            value={playbackState.currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-netflix-gray/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-netflix-red [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
          />
        </div>

        {/* Controls - compact row */}
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="text-white hover:text-netflix-red transition-colors p-1"
              aria-label={playbackState.isPlaying ? 'Pause' : 'Play'}
            >
              <Icon name={playbackState.isPlaying ? 'pause' : 'play'} size={20} />
            </button>

            {/* Seek buttons */}
            <button
              onClick={() => seek(-10)}
              className="text-white hover:text-netflix-red transition-colors p-1"
              aria-label="Rewind 10 seconds"
            >
              <Icon name="chevronLeft" size={18} />
            </button>

            <button
              onClick={() => seek(10)}
              className="text-white hover:text-netflix-red transition-colors p-1"
              aria-label="Forward 10 seconds"
            >
              <Icon name="chevronRight" size={18} />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1">
              <button
                onClick={toggleMute}
                className="text-white hover:text-netflix-red transition-colors p-1"
                aria-label={playbackState.isMuted ? 'Unmute' : 'Mute'}
              >
                <Icon name={playbackState.isMuted ? 'volumeMute' : 'volume'} size={18} />
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={playbackState.isMuted ? 0 : playbackState.volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-netflix-gray/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
              />
            </div>

            {/* Time */}
            <span className="text-white text-xs">
              {formatDuration(playbackState.currentTime)} / {formatDuration(playbackState.duration)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Subtitles */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSubtitleMenu(prev => !prev);
                  setShowAudioMenu(false);
                  setShowAspectMenu(false);
                  setShowZoomMenu(false);
                }}
                className={`text-white hover:text-netflix-red transition-colors px-2 py-1 rounded ${activeSubtitle >= 0 ? 'text-netflix-red' : ''}`}
                aria-label="Subtitles"
              >
                <span className="text-xs font-medium">CC</span>
              </button>
              {showSubtitleMenu && renderDropdownMenu(
                [
                  { label: 'Off', value: -1 },
                  ...subtitles.map(s => ({ label: s.label, value: s.index }))
                ],
                activeSubtitle,
                (val) => handleSubtitleChange(val as number),
                () => setShowSubtitleMenu(false)
              )}
            </div>

            {/* Audio Tracks */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAudioMenu(prev => !prev);
                  setShowSubtitleMenu(false);
                  setShowAspectMenu(false);
                  setShowZoomMenu(false);
                }}
                className="text-white hover:text-netflix-red transition-colors px-2 py-1 rounded flex items-center gap-1"
                aria-label="Audio tracks"
              >
                <Icon name="volume" size={16} />
              </button>
              {showAudioMenu && renderDropdownMenu(
                audioTracks.length > 0 
                  ? audioTracks.map(a => ({ label: `${a.label} (${a.language})`, value: a.index }))
                  : [{ label: 'No audio tracks available', value: -1 }],
                activeAudioTrack,
                (val) => handleAudioTrackChange(val as number),
                () => setShowAudioMenu(false)
              )}
            </div>

            {/* Aspect Ratio */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAspectMenu(prev => !prev);
                  setShowAudioMenu(false);
                  setShowSubtitleMenu(false);
                  setShowZoomMenu(false);
                }}
                className="text-white hover:text-netflix-red transition-colors px-2 py-1 rounded"
                aria-label="Aspect ratio"
              >
                <Icon name="settings" size={18} />
              </button>
              {showAspectMenu && renderDropdownMenu(
                [
                  { label: '16:9 (Widescreen)', value: '16:9' },
                  { label: '2.35:1 (Cinema)', value: '2.35:1' },
                  { label: '4:3 (Standard)', value: '4:3' },
                  { label: 'Original', value: 'original' },
                ],
                aspectRatio,
                (val) => handleAspectRatioChange(val as AspectRatio),
                () => setShowAspectMenu(false)
              )}
            </div>

            {/* Zoom */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowZoomMenu(prev => !prev);
                  setShowAudioMenu(false);
                  setShowSubtitleMenu(false);
                  setShowAspectMenu(false);
                }}
                className="text-white hover:text-netflix-red transition-colors px-2 py-1 rounded flex items-center gap-1"
                aria-label="Zoom"
              >
                <Icon name="search" size={16} />
                <span className="text-xs">{videoZoom}%</span>
              </button>
              {showZoomMenu && renderDropdownMenu(
                [
                  { label: '50% (Small)', value: 50 },
                  { label: '75%', value: 75 },
                  { label: '100% (Normal)', value: 100 },
                  { label: '125%', value: 125 },
                  { label: '150% (Large)', value: 150 },
                  { label: '175%', value: 175 },
                  { label: '200% (Zoom)', value: 200 },
                ],
                videoZoom,
                (val) => handleZoomChange(val as number),
                () => setShowZoomMenu(false)
              )}
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-netflix-red transition-colors p-1"
              aria-label={playbackState.isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              <Icon name={playbackState.isFullscreen ? 'fullscreenExit' : 'fullscreen'} size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
