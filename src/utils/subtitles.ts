// Subtitle parsing and loading utilities
// Supports .srt and .vtt subtitle files

export interface SubtitleCue {
  startTime: number;
  endTime: number;
  text: string;
}

export interface SubtitleTrack {
  label: string;
  language: string;
  format: 'srt' | 'vtt';
  url?: string;
  cues?: SubtitleCue[];
}

// Supported subtitle formats
export const SUPPORTED_SUBTITLE_FORMATS = ['.srt', '.vtt', '.sub', '.ass'];

// Parse SRT timestamp (e.g., "00:01:23,456" -> seconds)
function parseSRTTime(timeStr: string): number {
  const match = timeStr.match(/(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/);
  if (!match) return 0;
  
  const [, hours, minutes, seconds, ms] = match;
  return (
    parseInt(hours) * 3600 +
    parseInt(minutes) * 60 +
    parseInt(seconds) +
    parseInt(ms) / 1000
  );
}

// Parse WebVTT timestamp (e.g., "00:01:23.456" -> seconds)
function parseVTTTime(timeStr: string): number {
  const match = timeStr.match(/(\d{2}):(\d{2}):(\d{2})\.(\d{3})/);
  if (!match) {
    // Try shorter format "01:23.456"
    const shortMatch = timeStr.match(/(\d{2}):(\d{2})\.(\d{3})/);
    if (shortMatch) {
      const [, minutes, seconds, ms] = shortMatch;
      return (
        parseInt(minutes) * 60 +
        parseInt(seconds) +
        parseInt(ms) / 1000
      );
    }
    return 0;
  }
  
  const [, hours, minutes, seconds, ms] = match;
  return (
    parseInt(hours) * 3600 +
    parseInt(minutes) * 60 +
    parseInt(seconds) +
    parseInt(ms) / 1000
  );
}

// Parse SRT file content
export function parseSRT(content: string): SubtitleCue[] {
  const cues: SubtitleCue[] = [];
  // Normalize line endings
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalized.split('\n\n');
  
  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 3) continue;
    
    // Find the timing line (contains -->)
    let timingLineIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('-->')) {
        timingLineIndex = i;
        break;
      }
    }
    
    if (timingLineIndex === -1) continue;
    
    const timingLine = lines[timingLineIndex];
    const timeMatch = timingLine.match(/([\d:,\.]+)\s*-->\s*([\d:,\.]+)/);
    if (!timeMatch) continue;
    
    const startTime = parseSRTTime(timeMatch[1]);
    const endTime = parseSRTTime(timeMatch[2]);
    
    // Get text (everything after timing line)
    const text = lines.slice(timingLineIndex + 1).join('\n');
    
    if (text.trim()) {
      cues.push({
        startTime,
        endTime,
        text: text.trim(),
      });
    }
  }
  
  return cues;
}

// Parse VTT file content
export function parseVTT(content: string): SubtitleCue[] {
  const cues: SubtitleCue[] = [];
  // Normalize line endings
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Remove WEBVTT header and metadata
  let lines = normalized.split('\n');
  
  // Skip header
  let startIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('WEBVTT')) {
      startIndex = i + 1;
      // Skip any header metadata
      while (startIndex < lines.length && lines[startIndex].trim() === '') {
        startIndex++;
      }
      break;
    }
  }
  
  // Find cue blocks
  const blocks: string[] = [];
  let currentBlock: string[] = [];
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    
    // New block starts with timing or empty line after content
    if (line.includes('-->') || (line.trim() === '' && currentBlock.length > 0)) {
      if (currentBlock.length > 0) {
        blocks.push(currentBlock.join('\n'));
        currentBlock = [];
      }
    }
    
    if (line.trim() !== '') {
      currentBlock.push(line);
    }
  }
  
  // Add last block
  if (currentBlock.length > 0) {
    blocks.push(currentBlock.join('\n'));
  }
  
  for (const block of blocks) {
    const lines = block.split('\n');
    if (lines.length < 1) continue;
    
    // Find timing line
    let timingLineIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('-->')) {
        timingLineIndex = i;
        break;
      }
    }
    
    if (timingLineIndex === -1) continue;
    
    const timingLine = lines[timingLineIndex];
    const timeMatch = timingLine.match(/([\d:\.]+)\s*-->\s*([\d:\.]+)/);
    if (!timeMatch) continue;
    
    const startTime = parseVTTTime(timeMatch[1]);
    const endTime = parseVTTTime(timeMatch[2]);
    
    // Get text (everything after timing line)
    const text = lines.slice(timingLineIndex + 1).join('\n');
    
    if (text.trim()) {
      cues.push({
        startTime,
        endTime,
        text: text.trim(),
      });
    }
  }
  
  return cues;
}

// Convert SRT to VTT format
export function convertSRTtoVTT(srtContent: string): string {
  const cues = parseSRT(srtContent);
  
  let vtt = 'WEBVTT\n\n';
  
  for (const cue of cues) {
    const start = formatVTTTime(cue.startTime);
    const end = formatVTTTime(cue.endTime);
    vtt += `${start} --> ${end}\n`;
    vtt += `${cue.text}\n\n`;
  }
  
  return vtt;
}

// Format seconds to VTT timestamp
function formatVTTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

// Get subtitle file path from video file path
export function getSubtitlePaths(videoPath: string, videoName: string): string[] {
  const basePath = videoPath.replace(videoName, '');
  const baseName = videoName.replace(/\.[^/.]+$/, '');
  
  // Common subtitle naming patterns
  const patterns = [
    // Same name with different extensions
    `${basePath}${baseName}.srt`,
    `${basePath}${baseName}.vtt`,
    // With language suffix
    `${basePath}${baseName}.en.srt`,
    `${basePath}${baseName}.en.vtt`,
    `${basePath}${baseName}.english.srt`,
    `${basePath}${baseName}.english.vtt`,
    // With language code prefix
    `${basePath}en.${baseName}.srt`,
    `${basePath}en.${baseName}.vtt`,
    // Common patterns
    `${basePath}subs/${baseName}.srt`,
    `${basePath}subs/${baseName}.vtt`,
    `${basePath}Subtitles/${baseName}.srt`,
    `${basePath}Subtitles/${baseName}.vtt`,
  ];
  
  return patterns;
}

// Detect subtitle format from filename
export function detectSubtitleFormat(filename: string): 'srt' | 'vtt' | null {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  
  switch (ext) {
    case '.srt':
      return 'srt';
    case '.vtt':
      return 'vtt';
    default:
      return null;
  }
}

// Detect language from subtitle filename
export function detectSubtitleLanguage(filename: string): string {
  const lower = filename.toLowerCase();
  
  const languageMap: Record<string, string> = {
    'english': 'en',
    'eng': 'en',
    'hindi': 'hi',
    'tam': 'ta',
    'tamil': 'ta',
    'telugu': 'te',
    'malayalam': 'ml',
    'kannada': 'kn',
    'japanese': 'ja',
    'jap': 'ja',
    'korean': 'ko',
    'kor': 'ko',
    'chinese': 'zh',
    'mandarin': 'zh',
    'spanish': 'es',
    'esp': 'es',
    'french': 'fr',
    'fre': 'fr',
    'german': 'de',
    'ger': 'de',
    'italian': 'it',
    'ita': 'it',
    'portuguese': 'pt',
    'brazilian': 'pt',
    'arabic': 'ar',
    'russian': 'ru',
    'rus': 'ru',
  };
  
  for (const [key, code] of Object.entries(languageMap)) {
    if (lower.includes(key)) {
      return code;
    }
  }
  
  return 'unknown';
}

// Get human-readable label for subtitle
export function getSubtitleLabel(filename: string, language: string): string {
  const langNames: Record<string, string> = {
    'en': 'English',
    'hi': 'Hindi',
    'ta': 'Tamil',
    'te': 'Telugu',
    'ml': 'Malayalam',
    'kn': 'Kannada',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ar': 'Arabic',
    'ru': 'Russian',
  };
  
  const detectedLang = detectSubtitleLanguage(filename);
  const name = langNames[detectedLang] || detectedLang;
  
  // Check if language was explicitly in filename
  if (language && language !== 'unknown' && language !== detectedLang) {
    return `${name} (${language})`;
  }
  
  return name;
}

// Check if filename is a subtitle file
export function isSubtitleFile(filename: string): boolean {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return SUPPORTED_SUBTITLE_FORMATS.includes(ext);
}

// Parse subtitle content based on format
export function parseSubtitle(content: string, format: 'srt' | 'vtt'): SubtitleCue[] {
  if (format === 'srt') {
    return parseSRT(content);
  }
  return parseVTT(content);
}
