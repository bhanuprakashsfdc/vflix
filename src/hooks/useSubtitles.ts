import { useState, useEffect, useCallback } from 'react';
import type { MediaFile } from '../types';
import {
  isSubtitleFile,
  detectSubtitleFormat,
  detectSubtitleLanguage,
  getSubtitleLabel,
  parseSubtitle,
  convertSRTtoVTT,
  type SubtitleTrack,
  type SubtitleCue,
} from '../utils/subtitles';

interface UseSubtitlesOptions {
  media: MediaFile;
  enabled?: boolean;
}

interface UseSubtitlesResult {
  tracks: SubtitleTrack[];
  isLoading: boolean;
  error: string | null;
  activeTrack: number;
  setActiveTrack: (index: number) => void;
  externalSubtitles: SubtitleTrack[];
}

export function useSubtitles({ media, enabled = true }: UseSubtitlesOptions): UseSubtitlesResult {
  const [tracks, setTracks] = useState<SubtitleTrack[]>([]);
  const [externalSubtitles, setExternalSubtitles] = useState<SubtitleTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTrack, setActiveTrack] = useState(-1);

  // Function to find and load external subtitle files
  const loadExternalSubtitles = useCallback(async () => {
    if (!enabled || !media.handle) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get the parent directory handle
      const fileHandle = media.handle as any;
      const parentDir = fileHandle.parent as FileSystemDirectoryHandle;
      
      if (!parentDir) {
        setIsLoading(false);
        return;
      }

      const subtitleTracks: SubtitleTrack[] = [];

      // Scan the parent directory for subtitle files
      try {
        for await (const entry of (parentDir as any).values()) {
          if ((entry as any).kind !== 'file') continue;

          const filename = (entry as any).name;
          if (!isSubtitleFile(filename)) continue;

          // Check if filename matches video filename
          const videoBaseName = media.name.replace(/\.[^/.]+$/, '');
          const subtitleBaseName = filename.replace(/\.[^/.]+$/, '');
          
          // Check if subtitle matches video (with or without language suffix)
          const isMatch = 
            subtitleBaseName === videoBaseName ||
            subtitleBaseName.startsWith(videoBaseName) ||
            subtitleBaseName.endsWith(videoBaseName) ||
            // Also check for language-specific files like "video.en.srt"
            subtitleBaseName.includes(videoBaseName);

          if (!isMatch) continue;

          // Get the subtitle file
          const subtitleFileHandle = entry as FileSystemFileHandle;
          const subtitleFile = await subtitleFileHandle.getFile();
          const content = await subtitleFile.text();

          const format = detectSubtitleFormat(filename);
          if (!format) continue;

          // Parse subtitles
          let cues: SubtitleCue[];
          if (format === 'srt') {
            // Convert SRT to VTT for browser compatibility
            const vttContent = convertSRTtoVTT(content);
            cues = parseSubtitle(vttContent, 'vtt');
          } else {
            cues = parseSubtitle(content, format);
          }

          if (cues.length === 0) continue;

          const language = detectSubtitleLanguage(filename);
          const label = getSubtitleLabel(filename, language);

          // Create a blob URL for the subtitle
          const vttContent = format === 'srt' ? convertSRTtoVTT(content) : content;
          const blob = new Blob([vttContent], { type: 'text/vtt' });
          const url = URL.createObjectURL(blob);

          subtitleTracks.push({
            label,
            language,
            format,
            url,
            cues,
          });
        }
      } catch (dirError) {
        console.log('Could not scan directory for subtitles:', dirError);
      }

      setExternalSubtitles(subtitleTracks);
      setTracks(subtitleTracks);

      // Auto-enable first subtitle track if available
      if (subtitleTracks.length > 0 && activeTrack === -1) {
        // Try to find matching language
        const langMatch = media.title.match(/\b(english|hindi|tamil|telugu|malayalam|kannada|japanese|korean|chinese|spanish|french|german|italian|portuguese|arabic|rusian)\b/i);
        
        if (langMatch) {
          const detectedLang = langMatch[1].toLowerCase();
          const langCode = detectedLang.substring(0, 2);
          const matchIndex = subtitleTracks.findIndex(t => 
            t.language.startsWith(langCode)
          );
          
          if (matchIndex >= 0) {
            setActiveTrack(matchIndex);
          }
        }
      }
    } catch (err) {
      console.error('Error loading external subtitles:', err);
      setError('Failed to load subtitles');
    } finally {
      setIsLoading(false);
    }
  }, [media, enabled, activeTrack]);

  // Load subtitles when media changes
  useEffect(() => {
    loadExternalSubtitles();

    // Cleanup blob URLs
    return () => {
      tracks.forEach(track => {
        if (track.url) {
          URL.revokeObjectURL(track.url);
        }
      });
    };
  }, [media.id, media.name]);

  // Update tracks when external subtitles change
  useEffect(() => {
    setTracks(prev => {
      // Keep embedded tracks, add external
      const embedded = prev.filter(t => !t.url);
      return [...embedded, ...externalSubtitles];
    });
  }, [externalSubtitles]);

  return {
    tracks,
    isLoading,
    error,
    activeTrack,
    setActiveTrack,
    externalSubtitles,
  };
}

export default useSubtitles;
