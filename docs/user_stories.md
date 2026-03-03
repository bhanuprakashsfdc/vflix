# VFlix User Stories

This document defines the user requirements for VFlix, a local media streaming application.
**Note:** The application operates entirely client-side using browser-native APIs (File System Access, IndexedDB) with **no database and no backend**.

---

## 🎬 Media Library Management
- **US.1: Scan Local Folders**
  As a user, I want to select a local folder so that the application can automatically index my movies and TV shows.
- **US.2: Persistent Library**
  As a user, I want my library to be saved locally so that I don't have to rescan my folders every time I open the app.
- **US.3: Rescan Folders**
  As a user, I want to trigger a rescan of my local folders so that newly added media files appear in my library.

## 📺 Browsing & Discovery
- **US.4: Home Page Experience**
  As a user, I want a Netflix-style home page with a featured hero banner so that I can see highlighted content.
- **US.5: Content Categorization**
  As a user, I want to see rows for "Continue Watching," "Recently Added," and specific genres so that I can easily find what to watch.
- **US.6: Series Grouping**
  As a user, I want TV show episodes to be grouped by series so that my library remains organized and uncluttered.
- **US.7: Browse All Media**
  As a user, I want a grid view of all my media with filtering and sorting options so that I can explore my entire collection.

## 🔍 Search & Filtering
- **US.8: Instant Search**
  As a user, I want to search for titles instantly so that I can quickly find a specific movie or show.
- **US.9: Metadata Enrichment**
  As a user, I want media titles to automatically fetch posters, ratings, and descriptions from OMDb so that my library looks professional.

## 📽️ Media Consumption
- **US.10: Seamless Playback**
  As a user, I want a high-performance video player that supports multiple formats (.mp4, .mkv, .webm) so that I can watch my content without issues.
- **US.11: Resume Playback**
  As a user, I want the application to remember where I left off so that I can continue watching from the exact same spot.
- **US.12: Subtitle Support**
  As a user, I want to load and customize subtitle files (.srt, .vtt) so that I can watch content in different languages or in noisy environments.
- **US.13: Picture-in-Picture**
  As a user, I want to watch my media in PiP mode so that I can multitask while viewing.

## 👤 User Profiles & personalization
- **US.14: Multiple Profiles**
  As a user, I want to create multiple profiles so that different family members can have their own "Continue Watching" lists and statistics.
- **US.15: Profile Customization**
  As a user, I want to pick an avatar and a color theme for my profile so that it feels personalized.

## ⚙️ Settings & Performance
- **US.16: Customizable Shortcuts**
  As a user, I want to use keyboard shortcuts (Space for pause, Arrows for seek) so that I can control playback efficiently.
- **US.17: Appearance & Accessibility**
  As a user, I want to toggle themes and reduce motion settings so that the app matches my preferences and accessibility needs.

## 📊 Analytics
- **US.18: Watch Statistics**
  As a user, I want to see my total watch time and streaks so that I can track my viewing habits over time.
