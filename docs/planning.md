# VFlix - Planning Document

> **Note:** This document outlines tasks for Phase 1 development - focusing on frontend-only features with no backend dependency.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Current Status](#current-status)
3. [Task Categories](#task-categories)
4. [Priority Roadmap](#priority-roadmap)
5. [Detailed Task List](#detailed-task-list)

---

## Project Overview

**VFlix** is a Netflix-style local media streaming web application that allows users to browse, search, and play movies and TV shows stored on their local hard drive - running entirely in the browser with **zero backend dependency**.

- **Tech Stack:** React 19 + TypeScript + Vite + Tailwind CSS + Zustand
- **Storage:** IndexedDB (client-side only)
- **File Access:** File System Access API (browser-native)

---

## Current Status

### ✅ Already Implemented
| Feature | Status |
|---------|--------|
| Folder selection via File System Access API | Complete |
| Recursive media scanning (.mp4, .mkv, .webm, .avi, .mov) | Complete |
| IndexedDB persistence for media metadata | Complete |
| IndexedDB persistence for playback progress | Complete |
| Basic video player with controls | Complete |
| Resume playback from last position | Complete |
| Home page with Hero banner | Complete |
| Continue Watching row | Complete |
| Recently Added row | Complete |
| Movies & Series rows | Complete |
| Series grouping by name | Complete |
| Search functionality (client-side) | Complete |
| Profile management (create/delete) | Complete |
| Basic settings page | Complete |
| OMDb API integration for metadata | Complete |

### ❌ Not Yet Implemented (Phase 1 Tasks)
| Feature | Priority |
|---------|----------|
| Subtitle support (.srt, .vtt) | High |
| Browse/Grid view for all media | High |
| Enhanced settings page | High |
| Profile switcher UI | Medium |
| Watch statistics dashboard | Medium |
| Keyboard navigation | Medium |
| Loading skeletons | Low |
| Picture-in-Picture mode | Low |
| Enhanced thumbnail generation | Low |
| Responsive design improvements | Low |

---

## Task Categories

### 🎬 Media Playback
### 📺 UI/UX Enhancement  
### 👤 User Profiles
### ⚙️ Settings & Preferences
### 📊 Analytics & Stats
### ♿ Accessibility
### 🚀 Performance

---

## Priority Roadmap

### Phase 1A: High Priority (Core Experience)
1. [T1] Subtitle Support (.srt, .vtt)
2. [T2] Browse/Grid View
3. [T3] Enhanced Settings Page
4. [T4] Profile Switcher UI

### Phase 1B: Medium Priority (Better UX)
5. [T5] Watch Statistics Dashboard
6. [T6] Keyboard Navigation
7. [T7] Loading States & Skeletons

### Phase 1C: Low Priority (Polish)
8. [T8] Picture-in-Picture Mode
9. [T9] Enhanced Thumbnail Generation
10. [T10] Responsive Design Improvements

---

## Detailed Task List

### T1: Subtitle Support (.srt, .vtt)
**Priority:** High | **Estimated Effort:** 3-4 days

**Description:** Add support for loading and displaying subtitle files (`.srt`, `.vtt`) that exist alongside video files in the same folder.

**Sub-tasks:**
- [ ] Create subtitle parser utility (srt → vtt conversion)
- [ ] Auto-detect subtitle files matching video filename
- [ ] Add subtitle toggle in video player controls
- [ ] Implement subtitle rendering overlay
- [ ] Add subtitle settings (font size, color, background)
- [ ] Support multiple subtitle tracks selection

**Technical Notes:**
- Use HTML5 `<track>` element for subtitle rendering
- Parse SRT format and convert to WebVTT for browser compatibility

---

### T2: Browse/Grid View
**Priority:** High | **Estimated Effort:** 2-3 days

**Description:** Create a grid/browse view that shows all media in a filterable, sortable grid layout.

**Sub-tasks:**
- [ ] Create new `BrowsePage` component
- [ ] Implement filterable grid (by type, category, genre)
- [ ] Add sort options (name, date added, recently played)
- [ ] Implement view toggle (grid/list)
- [ ] Add lazy loading for large libraries
- [ ] Create category filter sidebar

**Technical Notes:**
- Use CSS Grid for responsive layout
- Implement virtualization for 1000+ items using `react-window`

---

### T3: Enhanced Settings Page
**Priority:** High | **Estimated Effort:** 2 days

**Description:** Expand the basic settings page with all configurable options.

**Sub-tasks:**
- [ ] Add playback settings (autoplay, autoplay next, default quality)
- [ ] Add appearance settings (reduce motion, theme)
- [ ] Add keyboard shortcuts toggle
- [ ] Add subtitle preferences
- [ ] Add media library management (rescan, clear)
- [ ] Add storage usage display
- [ ] Add about section with version info

---

### T4: Profile Switcher UI
**Priority:** Medium | **Estimated Effort:** 2-3 days

**Description:** Create a polished profile selection screen and manage multiple profiles.

**Sub-tasks:**
- [ ] Create profile selection landing page
- [ ] Add avatar selection with predefined options
- [ ] Add profile color themes
- [ ] Implement profile edit functionality
- [ ] Add profile deletion with confirmation
- [ ] Persist last active profile

---

### T5: Watch Statistics Dashboard
**Priority:** Medium | **Estimated Effort:** 3-4 days

**Description:** Add a stats page showing watch history and statistics.

**Sub-tasks:**
- [ ] Create stats page component
- [ ] Show total watch time
- [ ] Show items watched per category
- [ ] Show most watched media
- [ ] Show watch streak (days)
- [ ] Add visual charts/graphs
- [ ] Filter stats by profile

**Technical Notes:**
- Store watch events in IndexedDB with timestamps
- Calculate stats on-the-fly from stored data

---

### T6: Keyboard Navigation
**Priority:** Medium | **Estimated Effort:** 2 days

**Description:** Add comprehensive keyboard shortcuts for power users.

**Sub-tasks:**
- [ ] Define keyboard shortcut map
- [ ] Implement global shortcuts (search, navigation)
- [ ] Implement player shortcuts (play/pause, seek, volume)
- [ ] Add keyboard shortcuts settings page
- [ ] Add visual shortcut hints

**Default Shortcuts:**
| Key | Action |
|-----|--------|
| Space | Play/Pause |
| ←/→ | Seek -10s/+10s |
| ↑/↓ | Volume |
| F | Fullscreen |
| M | Mute |
| S | Subtitle toggle |
| / | Open search |
| Esc | Close/Back |

---

### T7: Loading States & Skeletons
**Priority:** Medium | **Estimated Effort:** 1-2 days

**Description:** Add skeleton loaders and loading states for better UX.

**Sub-tasks:**
- [ ] Create skeleton component variants
- [ ] Add skeletons to HomePage rows
- [ ] Add skeletons to BrowsePage grid
- [ ] Add loading spinner for video player
- [ ] Add scanning progress UI improvements

---

### T8: Picture-in-Picture Mode
**Priority:** Low | **Estimated Effort:** 1 day

**Description:** Allow video to play in PiP mode.

**Sub-tasks:**
- [ ] Add PiP button to player controls
- [ ] Handle PiP enter/exit events
- [ ] Preserve playback position when switching

---

### T9: Enhanced Thumbnail Generation
**Priority:** Low | **Estimated Effort:** 2-3 days

**Description:** Improve thumbnail generation using video frames.

**Sub-tasks:**
- [ ] Generate thumbnails at multiple sizes
- [ ] Extract frame from 10% of video duration (more interesting frame)
- [ ] Add thumbnail caching in IndexedDB
- [ ] Add fallback placeholder images
- [ ] Implement background thumbnail generation

---

### T10: Responsive Design Improvements
**Priority:** Low | **Estimated Effort:** 2-3 days

**Description:** Ensure app works well on different screen sizes.

**Sub-tasks:**
- [ ] Optimize navbar for mobile
- [ ] Make player controls responsive
- [ ] Adjust grid columns for tablet/mobile
- [ ] Add touch-friendly controls for tablet
- [ ] Test and fix layout on 1024px/768px breakpoints

---

## Future Considerations (Phase 2)

These items are out of scope for Phase 1 but should be documented:

- **Electron Desktop App** - Wrap as native desktop application
- **Android TV/Remote UI** - TV-friendly interface
- **Watch Party** - Local network sharing (future consideration)
- **Plugin System** - Extensible subtitle parsers
- **Hardware Acceleration** - Improve playback performance

---

## Implementation Notes

### IndexedDB Schema (Current)
```
- profiles: Profile[]
- media: MediaFile[]
- playback_positions: { mediaId, position, timestamp }[]
- settings: AppSettings
- recently_played: { mediaId, profileId, timestamp }[]
```

### File Naming Convention
- Components: `PascalCase` (e.g., `VideoPlayer.tsx`)
- Utilities: `camelCase` (e.g., `fileSystem.ts`)
- Types: `camelCase` with `.ts` (e.g., `index.ts`)
- Pages: `PascalCase` + `Page` suffix (e.g., `HomePage.tsx`)

### Code Organization
```
src/
├── components/
│   ├── common/        # Reusable UI components
│   ├── layout/        # Layout components (Navbar, etc.)
│   ├── media/         # Media-specific components
│   └── player/        # Video player components
├── pages/             # Page components
├── stores/            # Zustand stores
├── utils/             # Utility functions
├── hooks/             # Custom React hooks
├── types/             # TypeScript types
└── styles/            # Global styles
```

---

## Getting Started

To start implementing any task:

1. Check the current branch is up to date
2. Create a new branch: `git checkout -b feature/T1-subtitle-support`
3. Implement the feature following the sub-tasks
4. Test thoroughly in Chrome/Edge
5. Create PR for review

---

*Document Version: 1.0*  
*Last Updated: 2026-03-02*  
*Author: VFlix Development Team*
