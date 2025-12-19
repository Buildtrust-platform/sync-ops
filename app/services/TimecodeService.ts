/**
 * TIMECODE SERVICE - Unified timecode handling for post-production
 *
 * Design System v2.0
 * - SMPTE timecode support (24fps, 25fps, 29.97fps drop-frame, 30fps, 60fps)
 * - SRT/VTT subtitle format support
 * - Consistent formatting across all modules
 * - Parse and convert between formats
 */

// ============================================
// TYPES
// ============================================

export type FrameRate = 23.976 | 24 | 25 | 29.97 | 30 | 50 | 59.94 | 60;

export type TimecodeFormat =
  | 'smpte'      // HH:MM:SS:FF or HH:MM:SS;FF (drop-frame)
  | 'srt'        // HH:MM:SS,mmm
  | 'vtt'        // HH:MM:SS.mmm
  | 'simple'     // MM:SS
  | 'detailed'   // MM:SS.m
  | 'seconds'    // Raw seconds with decimals
  | 'frames';    // Raw frame count

export interface TimecodeOptions {
  frameRate?: FrameRate;
  dropFrame?: boolean;
  showHours?: boolean;
  showMilliseconds?: boolean;
  separator?: string;
}

// ============================================
// CONSTANTS
// ============================================

const DEFAULT_FRAME_RATE: FrameRate = 24;
const DROP_FRAME_RATES: FrameRate[] = [29.97, 59.94];

// SMPTE separators
const SMPTE_SEPARATOR = ':';
const SMPTE_DROP_FRAME_SEPARATOR = ';';

// ============================================
// CORE FORMATTING FUNCTIONS
// ============================================

/**
 * Format seconds to SMPTE timecode (HH:MM:SS:FF)
 */
export function formatSMPTE(
  seconds: number,
  frameRate: FrameRate = DEFAULT_FRAME_RATE,
  dropFrame: boolean = false
): string {
  if (!isFinite(seconds) || seconds < 0) return '00:00:00:00';

  const totalFrames = Math.floor(seconds * frameRate);
  const fps = Math.round(frameRate);

  let frames: number;
  let totalSeconds: number;

  if (dropFrame && DROP_FRAME_RATES.includes(frameRate)) {
    // Drop-frame calculation (29.97fps or 59.94fps)
    const dropFrames = frameRate === 59.94 ? 4 : 2;
    const framesPerMinute = fps * 60 - dropFrames;
    const framesPer10Minutes = framesPerMinute * 10 + dropFrames;

    const d = Math.floor(totalFrames / framesPer10Minutes);
    const m = totalFrames % framesPer10Minutes;

    let adjustedFrames = totalFrames;
    if (m > dropFrames) {
      adjustedFrames += dropFrames * (Math.floor((m - dropFrames) / framesPerMinute) + 1);
    }

    frames = adjustedFrames % fps;
    totalSeconds = Math.floor(adjustedFrames / fps);
  } else {
    frames = totalFrames % fps;
    totalSeconds = Math.floor(totalFrames / fps);
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const separator = dropFrame && DROP_FRAME_RATES.includes(frameRate)
    ? SMPTE_DROP_FRAME_SEPARATOR
    : SMPTE_SEPARATOR;

  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0'),
    frames.toString().padStart(2, '0'),
  ].join(':').replace(/:(\d{2})$/, `${separator}$1`);
}

/**
 * Format seconds to SRT format (HH:MM:SS,mmm)
 */
export function formatSRT(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '00:00:00,000';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}

/**
 * Format seconds to VTT format (HH:MM:SS.mmm)
 */
export function formatVTT(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '00:00:00.000';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

/**
 * Format seconds to simple display (MM:SS)
 */
export function formatSimple(seconds: number, showHours: boolean = false): string {
  if (!isFinite(seconds) || seconds < 0) return showHours ? '0:00:00' : '0:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (showHours || hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format seconds to detailed display (MM:SS.m)
 */
export function formatDetailed(seconds: number, showHours: boolean = false): string {
  if (!isFinite(seconds) || seconds < 0) return showHours ? '0:00:00.0' : '0:00.0';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const tenths = Math.floor((seconds % 1) * 10);

  if (showHours || hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${tenths}`;
  }

  return `${minutes}:${secs.toString().padStart(2, '0')}.${tenths}`;
}

/**
 * Universal format function
 */
export function formatTimecode(
  seconds: number,
  format: TimecodeFormat = 'simple',
  options: TimecodeOptions = {}
): string {
  const {
    frameRate = DEFAULT_FRAME_RATE,
    dropFrame = false,
    showHours = false,
  } = options;

  switch (format) {
    case 'smpte':
      return formatSMPTE(seconds, frameRate, dropFrame);
    case 'srt':
      return formatSRT(seconds);
    case 'vtt':
      return formatVTT(seconds);
    case 'simple':
      return formatSimple(seconds, showHours);
    case 'detailed':
      return formatDetailed(seconds, showHours);
    case 'seconds':
      return seconds.toFixed(3);
    case 'frames':
      return Math.floor(seconds * frameRate).toString();
    default:
      return formatSimple(seconds, showHours);
  }
}

// ============================================
// PARSING FUNCTIONS
// ============================================

/**
 * Parse SMPTE timecode to seconds
 */
export function parseSMPTE(
  timecode: string,
  frameRate: FrameRate = DEFAULT_FRAME_RATE
): number {
  // Match patterns: HH:MM:SS:FF or HH:MM:SS;FF
  const match = timecode.match(/^(\d{1,2}):(\d{2}):(\d{2})[:;](\d{2})$/);
  if (!match) return 0;

  const [, hours, minutes, seconds, frames] = match.map(Number);
  const isDropFrame = timecode.includes(';');
  const fps = Math.round(frameRate);

  if (isDropFrame && DROP_FRAME_RATES.includes(frameRate)) {
    // Drop-frame calculation
    const dropFrames = frameRate === 59.94 ? 4 : 2;
    const totalMinutes = hours * 60 + minutes;
    const droppedFrames = dropFrames * (totalMinutes - Math.floor(totalMinutes / 10));
    const totalFrames = hours * 3600 * fps + minutes * 60 * fps + seconds * fps + frames - droppedFrames;
    return totalFrames / frameRate;
  }

  return hours * 3600 + minutes * 60 + seconds + frames / frameRate;
}

/**
 * Parse SRT timecode to seconds
 */
export function parseSRT(timecode: string): number {
  // Match pattern: HH:MM:SS,mmm
  const match = timecode.match(/^(\d{2}):(\d{2}):(\d{2}),(\d{3})$/);
  if (!match) return 0;

  const [, hours, minutes, seconds, ms] = match.map(Number);
  return hours * 3600 + minutes * 60 + seconds + ms / 1000;
}

/**
 * Parse VTT timecode to seconds
 */
export function parseVTT(timecode: string): number {
  // Match pattern: HH:MM:SS.mmm or MM:SS.mmm
  const fullMatch = timecode.match(/^(\d{2}):(\d{2}):(\d{2})\.(\d{3})$/);
  if (fullMatch) {
    const [, hours, minutes, seconds, ms] = fullMatch.map(Number);
    return hours * 3600 + minutes * 60 + seconds + ms / 1000;
  }

  const shortMatch = timecode.match(/^(\d{2}):(\d{2})\.(\d{3})$/);
  if (shortMatch) {
    const [, minutes, seconds, ms] = shortMatch.map(Number);
    return minutes * 60 + seconds + ms / 1000;
  }

  return 0;
}

/**
 * Parse simple timecode to seconds
 */
export function parseSimple(timecode: string): number {
  // Match patterns: H:MM:SS, MM:SS, M:SS
  const parts = timecode.split(':').map(Number);

  if (parts.some(isNaN)) return 0;

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }

  return 0;
}

/**
 * Universal parse function (auto-detect format)
 */
export function parseTimecode(
  timecode: string,
  format?: TimecodeFormat,
  options: TimecodeOptions = {}
): number {
  const { frameRate = DEFAULT_FRAME_RATE } = options;

  // Auto-detect if format not specified
  if (!format) {
    if (timecode.includes(';')) {
      return parseSMPTE(timecode, frameRate);
    }
    if (timecode.match(/^\d{2}:\d{2}:\d{2},\d{3}$/)) {
      return parseSRT(timecode);
    }
    if (timecode.match(/^\d{2}:\d{2}:\d{2}\.\d{3}$/)) {
      return parseVTT(timecode);
    }
    if (timecode.match(/^\d{1,2}:\d{2}:\d{2}:\d{2}$/)) {
      return parseSMPTE(timecode, frameRate);
    }
    return parseSimple(timecode);
  }

  switch (format) {
    case 'smpte':
      return parseSMPTE(timecode, frameRate);
    case 'srt':
      return parseSRT(timecode);
    case 'vtt':
      return parseVTT(timecode);
    case 'simple':
    case 'detailed':
      return parseSimple(timecode);
    case 'seconds':
      return parseFloat(timecode) || 0;
    case 'frames':
      return (parseInt(timecode) || 0) / frameRate;
    default:
      return parseSimple(timecode);
  }
}

// ============================================
// CONVERSION FUNCTIONS
// ============================================

/**
 * Convert seconds to frame number
 */
export function secondsToFrames(seconds: number, frameRate: FrameRate = DEFAULT_FRAME_RATE): number {
  return Math.floor(seconds * frameRate);
}

/**
 * Convert frame number to seconds
 */
export function framesToSeconds(frames: number, frameRate: FrameRate = DEFAULT_FRAME_RATE): number {
  return frames / frameRate;
}

/**
 * Convert between timecode formats
 */
export function convertTimecode(
  timecode: string,
  fromFormat: TimecodeFormat,
  toFormat: TimecodeFormat,
  options: TimecodeOptions = {}
): string {
  const seconds = parseTimecode(timecode, fromFormat, options);
  return formatTimecode(seconds, toFormat, options);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format duration for display (auto-select appropriate format)
 */
export function formatDuration(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';

  if (seconds < 60) {
    return `0:${Math.floor(seconds).toString().padStart(2, '0')}`;
  } else if (seconds < 3600) {
    return formatSimple(seconds, false);
  } else {
    return formatSimple(seconds, true);
  }
}

/**
 * Format duration with text labels
 */
export function formatDurationVerbose(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0 seconds';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  if (secs > 0 || parts.length === 0) {
    parts.push(`${secs}s`);
  }

  return parts.join(' ');
}

/**
 * Calculate progress percentage between two timecodes
 */
export function calculateProgress(current: number, total: number): number {
  if (!isFinite(current) || !isFinite(total) || total <= 0) return 0;
  return Math.min(100, Math.max(0, (current / total) * 100));
}

/**
 * Get frame rate display name
 */
export function getFrameRateLabel(frameRate: FrameRate): string {
  const labels: Record<FrameRate, string> = {
    23.976: '23.976 fps (Film)',
    24: '24 fps (Cinema)',
    25: '25 fps (PAL)',
    29.97: '29.97 fps (NTSC)',
    30: '30 fps',
    50: '50 fps (PAL HFR)',
    59.94: '59.94 fps (NTSC HFR)',
    60: '60 fps',
  };
  return labels[frameRate] || `${frameRate} fps`;
}

/**
 * Check if frame rate supports drop-frame
 */
export function supportsDropFrame(frameRate: FrameRate): boolean {
  return DROP_FRAME_RATES.includes(frameRate);
}

/**
 * Snap to nearest frame
 */
export function snapToFrame(seconds: number, frameRate: FrameRate = DEFAULT_FRAME_RATE): number {
  const frames = Math.round(seconds * frameRate);
  return frames / frameRate;
}

/**
 * Add frames to timecode
 */
export function addFrames(
  seconds: number,
  frameCount: number,
  frameRate: FrameRate = DEFAULT_FRAME_RATE
): number {
  return seconds + frameCount / frameRate;
}

/**
 * Get timecode difference in seconds
 */
export function getTimecodeDiff(
  startSeconds: number,
  endSeconds: number
): number {
  return Math.abs(endSeconds - startSeconds);
}

// ============================================
// SUBTITLE/CAPTION HELPERS
// ============================================

/**
 * Generate SRT file content from captions
 */
export function generateSRT(
  captions: Array<{ startTime: number; endTime: number; text: string; speaker?: string }>
): string {
  return captions
    .map((caption, index) => {
      const speaker = caption.speaker ? `[${caption.speaker}] ` : '';
      return `${index + 1}\n${formatSRT(caption.startTime)} --> ${formatSRT(caption.endTime)}\n${speaker}${caption.text}\n`;
    })
    .join('\n');
}

/**
 * Generate VTT file content from captions
 */
export function generateVTT(
  captions: Array<{ startTime: number; endTime: number; text: string; speaker?: string }>
): string {
  const cues = captions
    .map((caption) => {
      const speaker = caption.speaker ? `<v ${caption.speaker}>` : '';
      return `${formatVTT(caption.startTime)} --> ${formatVTT(caption.endTime)}\n${speaker}${caption.text}`;
    })
    .join('\n\n');

  return `WEBVTT\n\n${cues}`;
}

/**
 * Generate plain text transcript
 */
export function generateTranscript(
  captions: Array<{ startTime: number; text: string; speaker?: string }>
): string {
  return captions
    .map((caption) => {
      const speaker = caption.speaker ? `${caption.speaker}: ` : '';
      return `[${formatSimple(caption.startTime)}] ${speaker}${caption.text}`;
    })
    .join('\n');
}

// ============================================
// DEFAULT EXPORT
// ============================================

const TimecodeService = {
  // Format
  formatSMPTE,
  formatSRT,
  formatVTT,
  formatSimple,
  formatDetailed,
  formatTimecode,
  formatDuration,
  formatDurationVerbose,
  // Parse
  parseSMPTE,
  parseSRT,
  parseVTT,
  parseSimple,
  parseTimecode,
  // Convert
  secondsToFrames,
  framesToSeconds,
  convertTimecode,
  // Utils
  calculateProgress,
  getFrameRateLabel,
  supportsDropFrame,
  snapToFrame,
  addFrames,
  getTimecodeDiff,
  // Subtitles
  generateSRT,
  generateVTT,
  generateTranscript,
};

export default TimecodeService;
