# The Wired Studio Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a token-based React design system (“The Wired Studio”) sourced from Stitch HTML/DESIGN exports, with routed sample screens, light/dark theming, and responsive layouts matching desktop vs mobile references.

**Architecture:** CSS variables for semantic tokens drive Tailwind theme extensions; shared layout primitives (`AppTopNav`, `FloatingToolbar`, `MobileBottomNav`) compose Stitch-accurate pages; `react-router-dom` exposes a gallery home plus one route per major screen (`/dashboard`, `/canvas`, `/share`, `/syncing`, `/export`, `/loading`). Theme toggles `class="dark"` on `document.documentElement`.

**Tech Stack:** React 19, Vite 8, TypeScript, Tailwind CSS 3, PostCSS, react-router-dom, Material Symbols (Google Fonts), Inter + Manrope.

---

### Task 1: Tooling & entry

- [x] Add Tailwind, PostCSS, autoprefixer, react-router-dom
- [x] Wire `tailwind.config`, `postcss.config`, `index.css` @tailwind layers
- [x] Update `index.html` title, fonts (Inter, Manrope, Material Symbols)

### Task 2: Design tokens

- [x] Define `:root` and `.dark` CSS variables aligned with `project_dashboard` / `project_dashboard_dark` Stitch palettes
- [x] Map tokens to Tailwind `colors` + shadows + `fontFamily` (`sans`, `display`)

### Task 3: Design-system primitives

- [x] `ThemeProvider` + persistence (`localStorage`)
- [x] `Icon`, `Button`, `SearchField`, `GlassPanel`, `Skeleton` utilities
- [x] `AppTopNav`, `FloatingToolbar`, `MobileBottomNav`

### Task 4: Screens

- [x] Gallery (`/`) linking to all demos
- [x] Dashboard (`/dashboard`) — desktop + `md:` responsive mobile patterns
- [x] Collaborative canvas (`/canvas`)
- [x] Share & collaborate (`/share`)
- [x] Canvas syncing (`/syncing`) — saving/sync micro-interaction
- [x] Export & settings (`/export`)
- [x] Loading / skeleton (`/loading`)

### Task 5: QA

- [x] `npm run build` passes; fix ESLint issues in new files
