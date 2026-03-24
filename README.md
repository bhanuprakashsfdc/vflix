<div align="center">

  <!-- Logo / Banner -->
  <img src="public/vflix-logo.png" alt="VFlix Logo" width="120" />

  <h1>🎬 VFlix</h1>

  <p>
    <b>Your private OTT — stream your own media, your way.</b><br/>
    A Netflix-inspired media browser that reads directly from your local storage.<br/>
    <i>No subscriptions. No cloud. No tracking. Just your content.</i>
  </p>

  <!-- Badges -->
  ![Live Demo](https://img.shields.io/badge/Demo-Live%20on%20Vercel-black?style=flat-square&logo=vercel&logoColor=white)
  ![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
  ![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)
  ![TailwindCSS](https://img.shields.io/badge/Tailwind%20CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
  ![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
  ![Privacy](https://img.shields.io/badge/Privacy-100%25%20Local-green?style=flat-square&logo=shield&logoColor=white)
  ![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
  ![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)

</div>

---

<div align="center">
  <a href="https://vflix-five.vercel.app/">🚀 Live Demo</a> &nbsp;·&nbsp;
  <a href="#-installation">📦 Install Locally</a> &nbsp;·&nbsp;
  <a href="#️-roadmap">🗺️ Roadmap</a> &nbsp;·&nbsp;
  <a href="#-contributing">🤝 Contribute</a>
</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Demo](#-demo)
- [Features](#-features)
- [How It Works](#-how-it-works)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Usage Guide](#-usage-guide)
- [Keyboard Shortcuts](#-keyboard-shortcuts)
- [Privacy & Security](#-privacy--security)
- [Roadmap](#️-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 About

**VFlix** is a frontend-only media browser built with a modern OTT look and feel — think Netflix UI, but powered entirely by **your own local video files**. No server, no database, no account required. Open the app, point it at your media folder, and start watching.

It solves a real problem: most media players are either too bare-bones or too heavyweight. VFlix sits in the sweet spot — a polished, browseable, searchable interface for your personal video library that respects your privacy completely.

> **Zero bytes of your data leave your device.** Ever.

---

## 🎥 Demo

![VFlix Screenshot](docs/screenshot.png)

> 🔗 **Try it live:** [vflix-five.vercel.app](https://vflix-five.vercel.app/)
>
> Load the demo with your own local video files — the app never uploads anything.

---

## ✨ Features

- 🗂️ **Local Media Library** — browse and play videos directly from your device's file system using the File System Access API
- 🎨 **Netflix-Style OTT UI** — hero banner, horizontal scrollable rows, hover previews, and cinematic dark theme
- 🔍 **Search & Filter** — instant search across your entire library by title, genre, or file name
- 📁 **Folder-Based Organisation** — auto-groups your media into categories based on folder structure
- 🎬 **Built-In Video Player** — HTML5 player with custom controls: play/pause, seek, volume, fullscreen, playback speed
- 📌 **Watchlist** — bookmark titles to watch later, stored in `localStorage`
- ▶️ **Resume Watching** — remembers playback position for every video, even after refresh
- 🖼️ **Auto Thumbnail Generation** — extracts video frame thumbnails client-side using Canvas API
- 📱 **Fully Responsive** — works on desktop, tablet, and mobile browsers
- ⚡ **Offline Ready** — once your folder is loaded, works without internet connection
- 🔒 **100% Private** — no analytics, no external API calls, no data collection

---

## ⚙️ How It Works

VFlix uses the browser's **File System Access API** to read your local media folder — no upload, no backend, no cloud sync.

```
User selects local folder
        ↓
File System Access API reads directory contents (browser-native, sandboxed)
        ↓
VFlix scans for supported video formats (.mp4, .mkv, .webm, .mov, .avi)
        ↓
Canvas API extracts thumbnail frames client-side
        ↓
React renders the Netflix-style browseable grid
        ↓
HTML5 <video> player streams files directly from disk
        ↓
localStorage persists watchlist + resume positions
```

**Everything runs in the browser tab — no data ever leaves your machine.**

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| UI Framework | React 18 | Component-based OTT interface |
| Build Tool | Vite 5 | Fast dev server & optimised build |
| Styling | Tailwind CSS 3 | Cinematic dark-themed UI |
| Routing | React Router v6 | SPA navigation (browse, detail, player) |
| State Management | React Context + hooks | Watchlist, playback state, library |
| File Access | File System Access API | Read local media folders (browser-native) |
| Thumbnail Engine | Canvas API | Client-side video frame extraction |
| Video Playback | HTML5 `<video>` | Native browser video player |
| Persistence | localStorage / sessionStorage | Watchlist, resume positions |
| Deployment | Vercel | Zero-config static hosting |

---

## 📁 Project Structure

```
vflix/
├── public/
│   ├── vflix-logo.png
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Navbar/
│   │   │   └── Navbar.jsx              # Top navigation with search
│   │   ├── Hero/
│   │   │   └── HeroBanner.jsx          # Featured title banner
│   │   ├── MediaRow/
│   │   │   ├── MediaRow.jsx            # Horizontal scrollable row
│   │   │   └── MediaCard.jsx           # Individual video thumbnail card
│   │   ├── Player/
│   │   │   ├── VideoPlayer.jsx         # Custom HTML5 video player
│   │   │   └── PlayerControls.jsx      # Playback controls UI
│   │   ├── Library/
│   │   │   ├── LibraryBrowser.jsx      # Folder picker + file scanner
│   │   │   └── ThumbnailGenerator.jsx  # Canvas-based frame extractor
│   │   └── Watchlist/
│   │       └── Watchlist.jsx           # Saved / bookmarked titles
│   ├── pages/
│   │   ├── Home.jsx                    # Main browsing page
│   │   ├── Browse.jsx                  # Full library grid view
│   │   ├── Watch.jsx                   # Video player page
│   │   └── Detail.jsx                  # Title detail / info modal
│   ├── context/
│   │   ├── LibraryContext.jsx          # Global media library state
│   │   └── PlayerContext.jsx           # Playback position & resume state
│   ├── hooks/
│   │   ├── useFileSystem.js            # File System Access API wrapper
│   │   ├── useLocalStorage.js          # localStorage hook
│   │   └── useVideoThumbnail.js        # Canvas thumbnail extraction
│   ├── utils/
│   │   ├── fileScanner.js              # Scans folders for video files
│   │   ├── formatDuration.js           # HH:MM:SS formatter
│   │   └── groupByFolder.js            # Auto-categorisation logic
│   ├── styles/
│   │   └── globals.css
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
├── tailwind.config.js
├── package.json
└── .gitignore
```

---

## 🔧 Prerequisites

Before running VFlix locally, make sure you have:

- **Node.js** v18 or higher — [Download](https://nodejs.org/)
- **npm** v9+ or **yarn** v1.22+
- A **modern browser** that supports the File System Access API:
  - ✅ Chrome / Edge 86+
  - ✅ Opera 72+
  - ⚠️ Firefox — partial support (use Chrome for best experience)
  - ❌ Safari — File System Access API not supported

---

## 📦 Installation

```bash
# 1. Clone the repository
git clone https://github.com/bhanuprakashkollireddy/vflix.git
cd vflix

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
# → App running at http://localhost:5173
```

### Build for production

```bash
# Build optimised static output
npm run build

# Preview the production build locally
npm run preview
```

### Deploy to Vercel

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

---

## 🎮 Usage Guide

### Step 1 — Open VFlix

Visit [vflix-five.vercel.app](https://vflix-five.vercel.app/) or run locally at `http://localhost:5173`.

### Step 2 — Load Your Media Folder

1. Click **"Open Media Folder"** on the home screen
2. A native file picker opens — select the folder containing your videos
3. Grant browser permission to read the folder (one-time per session)
4. VFlix scans all subfolders and detects supported video files

> **Supported formats:** `.mp4` · `.mkv` · `.webm` · `.mov` · `.avi` · `.m4v` · `.ogv`

### Step 3 — Browse Your Library

- Videos are auto-grouped into rows by folder name (e.g. `Movies/`, `Series/S01/`)
- Hover over any card to see the auto-generated thumbnail and title
- Use the **search bar** to filter by file name or folder

### Step 4 — Watch

- Click any title to open the detail view
- Click **Play** to launch the full-screen video player
- Use the custom controls or keyboard shortcuts below

### Step 5 — Build Your Watchlist

- Click the **＋ Watchlist** button on any title card
- Access your saved list from the **My List** row on the home screen
- Watchlist persists in localStorage — survives page refreshes

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|---|---|
| `Space` | Play / Pause |
| `F` | Toggle fullscreen |
| `M` | Toggle mute |
| `←` / `→` | Seek backward / forward 10s |
| `↑` / `↓` | Volume up / down |
| `Escape` | Exit fullscreen / close modal |
| `1` – `9` | Jump to 10% – 90% of video |
| `Shift + <` / `>` | Decrease / increase playback speed |

---

## 🔒 Privacy & Security

VFlix is architected from the ground up with privacy as a core constraint — not an afterthought.

| Principle | Implementation |
|---|---|
| **No file uploads** | Files are read in-browser via File System Access API — never sent to any server |
| **No backend** | 100% frontend — no database, no user accounts, no session tracking |
| **No analytics** | Zero third-party tracking scripts or telemetry |
| **No cloud dependency** | Works fully offline once a folder is loaded |
| **Sandboxed access** | Browser enforces strict per-session read-only folder permissions |
| **No persistent file access** | Folder permission resets when the browser tab is closed |

> The only data that persists between sessions is your **watchlist** and **resume positions**, stored exclusively in your browser's own `localStorage`.

---

## 🗺️ Roadmap

- [x] Local folder media scanning via File System Access API
- [x] Netflix-style UI — hero banner, horizontal rows, cards
- [x] Built-in HTML5 video player with custom controls
- [x] Auto-thumbnail extraction using Canvas API
- [x] Watchlist (add/remove, localStorage persistence)
- [x] Resume watching — playback position memory
- [x] Search and filter
- [x] Responsive layout (mobile + desktop)
- [ ] Subtitle support (`.srt`, `.vtt` sidecar files)
- [ ] Manual metadata editor (title, genre, poster image)
- [ ] Keyboard-navigable browse mode (TV remote UX)
- [ ] Continue Watching row (sorted by last played)
- [ ] Multi-profile watchlists (per user, stored locally)
- [ ] PWA support — install as desktop/mobile app
- [ ] Playlist / queue mode — auto-play next episode
- [ ] Export watchlist as JSON / import backup
- [ ] Video chapters support (via WebVTT)
- [ ] Picture-in-Picture (PiP) player mode

---

## 🤝 Contributing

VFlix is open source and contributions are very welcome!

```bash
# Fork and clone
git clone https://github.com/your-username/vflix.git
cd vflix
npm install

# Create a feature branch
git checkout -b feature/subtitle-support

# Make changes, then commit
git commit -m 'feat: add .srt subtitle sidecar file support'

# Push and open a Pull Request
git push origin feature/subtitle-support
```

### Contribution Ideas

- 🌐 Browser compatibility improvements (Firefox, Safari fallbacks)
- 🎨 New UI themes (light mode, AMOLED dark)
- 🌍 Internationalisation / i18n support
- 🧪 Unit tests for utility functions
- 📖 Documentation improvements
- 🐛 Bug fixes and performance optimisations

Please open an issue before starting major feature work so we can align on design direction.

---

## 📝 License

Distributed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Built with ❤️ and 🍿 by <a href="https://bhanuprakashsfdc.com">Bhanu Prakash Kollireddy</a></p>
  <p>
    <a href="https://vflix-five.vercel.app/">🎬 Live Demo</a> &nbsp;·&nbsp;
    <a href="https://github.com/bhanuprakashkollireddy">🐙 GitHub</a> &nbsp;·&nbsp;
    <a href="https://www.linkedin.com/in/bhanuprakashsfdc">💼 LinkedIn</a> &nbsp;·&nbsp;
    <a href="https://bhanuprakashsfdc.com">🌐 Portfolio</a>
  </p>
  <br/>
  <sub>⭐ Star this repo if VFlix gave your local media collection a glow-up!</sub>
</div>
