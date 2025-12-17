# Frame.io & Vimeo-Inspired Features

This document describes the professional video review and collaboration features added to sync-ops, inspired by Frame.io and Vimeo's industry-leading tools.

## Overview

The following features have been implemented across three tiers of priority, transforming sync-ops into a professional-grade video production platform.

---

## Tier 1: Core Differentiators

### 1. Drawing Annotations on Video Frames

**Files:** `VideoAnnotationCanvas.tsx`, `AnnotationToolbar.tsx`

Draw directly on video frames to provide precise visual feedback. Annotations are linked to specific timecodes and saved with review comments.

**Features:**
- Freehand drawing/pencil tool
- Arrow annotations for pointing
- Circle/ellipse highlights
- Rectangle/box highlights
- Text labels on frames
- Blur tool for sensitive content
- Customizable stroke color, width, and opacity
- Undo/redo support
- Canvas scaling for different video resolutions

**Usage:**
1. Start a review session
2. Click "Draw on Frame" button
3. Select a tool from the toolbar
4. Draw on the paused video frame
5. Click "Save" to attach annotations to a comment

---

### 2. Side-by-Side Version Comparison

**Files:** `VersionComparison.tsx`, `SyncedVideoPlayer.tsx`

Compare two versions of a video simultaneously with synchronized playback controls.

**Features:**
- Dual video player with sync controls
- Version selector dropdowns (v1 vs v2)
- Sync modes:
  - **Play Together**: Both videos play simultaneously
  - **Wipe Slider**: Drag slider to reveal differences
  - **A/B Toggle**: Quick switch between versions
- Per-version comment display
- Visual diff indicators for new/resolved comments

---

### 3. Branded Client Screening Rooms

**Files:** `ClientScreeningRoom.tsx`, `app/share/[token]/page.tsx`

Password-protected share links for external clients with organization branding.

**Features:**
- Unique shareable URLs with token-based access
- Optional password protection (hashed storage)
- Expiration dates and view limits
- Organization branding (logo, colors, welcome message)
- Permission controls:
  - Allow/disallow downloads
  - Allow/disallow comments
  - Require approval workflow
- View tracking and analytics
- Watermark overlay option

**Data Model:** `ShareLink`

---

### 4. Transcript Search Across Footage

**Files:** `TranscriptSearch.tsx`, `TranscriptViewer.tsx`

Search through AI-generated transcripts from AWS Transcribe.

**Features:**
- Full-text search across all transcripts
- Highlighted matching segments
- Click-to-jump to specific timecodes
- Speaker label filtering
- Search results with asset thumbnails
- Integration with universal search

---

## Tier 2: Professional Polish

### 5. Forensic Watermarking

**Files:** `WatermarkConfig.tsx`

Configurable watermarks for leak prevention and tracking.

**Features:**
- Dynamic watermark templates:
  - Viewer email address
  - Timestamp
  - IP address
  - Custom text
- Position options (corner, center, tiled)
- Opacity and size controls
- Client-side preview overlay
- Server-side burning (ffmpeg Lambda)
- Audit logging of watermarked downloads

---

### 6. Multi-Resolution Encoding

**Files:** `EncodingStatus.tsx`, `mediaProcessor/handler.ts`

Automatic video transcoding via AWS MediaConvert for adaptive streaming.

**Features:**
- Automatic encoding on upload:
  - 1080p HD (5 Mbps)
  - 720p SD (2.5 Mbps)
- Progress tracking with status badges
- Quality selector in video player
- ProxyFile records for each resolution
- H.264 codec with AAC audio
- Progressive download optimization

**AWS Services:** MediaConvert, S3

**Data Model:** `ProxyFile`

---

### 7. Auto-Generated Captions

**Files:** `CaptionEditor.tsx`, `CaptionOverlay.tsx`

AI-powered captions from AWS Transcribe with manual editing capabilities.

**Features:**
- Automatic caption generation from audio
- Manual text editing and timing adjustments
- Speaker label support
- Export formats:
  - SRT (SubRip)
  - VTT (WebVTT)
  - Plain text
- Caption styling options:
  - Font size and color
  - Background opacity
  - Position (bottom, top)
- Keyboard shortcut (C) to toggle

---

### 8. Version Switcher on Review Pages

**Files:** `VersionSwitcher.tsx`

Quick dropdown to switch between asset versions during review.

**Features:**
- Compact dropdown in review header
- Version metadata display:
  - Version number and label
  - Change description
  - Upload timestamp
  - File size
- "Current" version badge
- Smooth video source switching
- Comment filtering by version

---

## Tier 3: Advanced Features

### 9. Presentation Mode

**Files:** `PresentationMode.tsx`

Clean, full-screen client-facing view for screenings and presentations.

**Features:**
- Distraction-free full-screen player
- Organization branding (logo, colors)
- Auto-hiding controls after inactivity
- Timecoded comment panel
- Keyboard shortcuts:
  - `F` - Toggle fullscreen
  - `C` - Toggle comment panel
  - `I` - Toggle info panel
  - `Esc` - Exit presentation
- "Presented by [Organization]" watermark

---

### 10. View Analytics & Heatmaps

**Files:** `ViewAnalytics.tsx`

Track viewer engagement and display visual analytics.

**Features:**
- Statistics dashboard:
  - Total views
  - Unique viewers
  - Average watch time
  - Completion rate
- Engagement heatmap visualization
- Time range filtering (24h, 7d, 30d, all)
- Recent viewers list with:
  - Device type
  - Location
  - Completion percentage
- Auto-refresh during playback

---

### 11. Platform Delivery Presets

**Files:** `DeliveryPresets.tsx`

One-click export presets optimized for social media platforms.

**Supported Platforms:**
| Platform | Resolution | Aspect Ratio | Max Duration |
|----------|------------|--------------|--------------|
| YouTube | 1920x1080 | 16:9 | 12 hours |
| Instagram Feed | 1080x1080 | 1:1 | 60 seconds |
| Instagram Reels | 1080x1920 | 9:16 | 90 seconds |
| TikTok | 1080x1920 | 9:16 | 10 minutes |
| Twitter/X | 1280x720 | 16:9 | 2 min 20 sec |
| LinkedIn | 1920x1080 | 16:9 | 10 minutes |
| Facebook | 1280x720 | 16:9 | 4 hours |
| Vimeo | 1920x1080 | 16:9 | Unlimited |

**Features:**
- Full spec display (codec, bitrate, frame rate)
- Duration warning for platform limits
- Export status tracking
- Platform-specific icons and colors

---

## Data Models

### ReviewAnnotation

Stores drawing annotation data linked to review comments.

```typescript
{
  organizationId: string;
  reviewCommentId: string;
  assetId: string;
  timecode: float;
  annotationType: 'FREEHAND' | 'ARROW' | 'CIRCLE' | 'RECTANGLE' | 'TEXT' | 'BLUR';
  pathData: string; // JSON serialized
  strokeColor: string;
  strokeWidth: float;
  fillColor?: string;
  opacity: float;
  textContent?: string;
  fontSize: number;
  canvasWidth: number;
  canvasHeight: number;
  createdBy: string;
  createdByEmail: string;
}
```

### ShareLink

External review links for client screening rooms.

```typescript
{
  organizationId: string;
  token: string;
  type: 'REVIEW' | 'DOWNLOAD' | 'PRESENTATION' | 'APPROVAL';
  password?: string; // Hashed
  expiresAt?: datetime;
  maxViews?: number;
  currentViews: number;
  allowDownload: boolean;
  allowComments: boolean;
  brandingEnabled: boolean;
  customLogo?: string;
  customColor?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
}
```

### ProxyFile

Tracks multi-resolution encoding jobs.

```typescript
{
  organizationId: string;
  assetId: string;
  proxyType: 'STREAMING_HD' | 'STREAMING_SD';
  resolution: string;
  bitrate: number;
  codec: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number;
  s3Key: string;
  jobId?: string;
}
```

---

## Integration Points

All features are accessible through the main **AssetReview** component:

- **Header Section:**
  - Version Switcher dropdown
  - Presentation Mode button

- **Video Player Area:**
  - Annotation mode toggle
  - Caption overlay
  - Drawing canvas overlay

- **Collapsible Sections:**
  - Transcript viewer
  - Caption editor
  - Video Quality (encoding status)
  - View Analytics
  - Export Presets

---

## AWS Services Used

| Service | Purpose |
|---------|---------|
| **S3** | Asset storage, proxy files |
| **MediaConvert** | Multi-resolution encoding |
| **Transcribe** | Speech-to-text for captions |
| **Rekognition** | Video analysis (existing) |
| **Cognito** | User authentication |
| **AppSync** | GraphQL API |
| **Lambda** | Media processing pipeline |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Space` | Play/Pause |
| `J` | Skip back 10s |
| `L` | Skip forward 10s |
| `M` | Toggle mute |
| `F` | Toggle fullscreen |
| `C` | Toggle captions |
| `Esc` | Exit presentation/modal |

---

## Future Enhancements

- Real-time collaborative annotations
- Live streaming support
- Advanced analytics dashboard
- Integration with editing software (Premiere, DaVinci)
- Mobile app support
- Slack/Teams notifications
