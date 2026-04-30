# Project Overview

A React + Vite student dashboard for the **UTPT** platform. The UI tracks coding progress (problem counts, difficulty distribution, daily/weekly streaks), GitHub commit history, leaderboard ranking, recent activity, and notifications.

The frontend is fully functional with hardcoded data shaped like future MongoDB documents. The service / hooks layer is set up so a MERN backend (Node/Express + MongoDB) can be plugged in by replacing one file (`src/services/student.service.js`) without touching components.

## Tech Stack

- React 19 + Vite 8
- React Router DOM 7
- Tailwind CSS 3 + shadcn-style UI primitives (Card, Button, Badge, Avatar, Progress) built on Radix
- Recharts 3 (area chart) + custom SVG donut
- lucide-react icons + a small inline GitHub mark
- Zustand for state, Axios for HTTP, clsx + tailwind-merge utilities
- class-variance-authority for component variants

## Project Structure

```
frontend/
  src/
    App.jsx                  # Routes
    main.jsx                 # Entry
    index.css                # Tailwind + base styles
    lib/utils.js             # cn(), formatNumber(), timeAgo()
    components/
      ui/                    # Reusable shadcn-style primitives
      icons/GithubIcon.jsx   # GitHub brand SVG (lucide removed it)
      layout/
        Layout.jsx           # Sidebar + Topbar shell, exposes useLayoutData()
        Sidebar.jsx
        Topbar.jsx
      dashboard/             # Dashboard widgets
        StatCard.jsx
        CodingProgressCard.jsx
        DonutChart.jsx       # Custom SVG donut
        GithubActivityCard.jsx
        RecentActivityCard.jsx
        LeaderboardCard.jsx
        NotificationsCard.jsx
        QuickActions.jsx
    pages/
      auth/   (Login, Register stubs)
      student/ (Dashboard, Coding, Github, Leaderboard, Profile, Notifications, Settings)
      trainer/Dashboard.jsx
      admin/Dashboard.jsx
      NotFound.jsx
    data/student.mock.js     # Hardcoded data shaped like MongoDB docs
    services/
      api.js                 # Axios instance, baseURL from VITE_API_BASE_URL
      student.service.js     # Returns Promises; swap mock → api.get(...) later
    hooks/
      useDashboard.js        # Roll-up loader for the dashboard page
    store/authStore.js
```

## Backend Integration Plan

When the Express + MongoDB backend is ready:

1. Add `VITE_API_BASE_URL` (e.g. `http://localhost:4000/api`) to the env.
2. In `src/services/student.service.js`, replace each `simulate(...)` call with the matching `api.get('/student/...')` call. The mock data already uses Mongo `_id` fields and ISO timestamps so the React components stay unchanged.
3. The `getDashboard()` function can be backed by a single `/api/student/dashboard` aggregate endpoint to reduce round-trips.

## Replit Setup

- Workflow `Start application` runs `npm --prefix frontend run dev` on port 5000.
- Vite is configured with `host: 0.0.0.0`, `port: 5000`, and `allowedHosts: true` so the Replit preview proxy can reach it.
- Path alias `@/` → `frontend/src`, `@assets/` → `attached_assets/` (in vite.config.js + jsconfig.json).
- Deployment is `static`: `npm --prefix frontend run build` → `frontend/dist`.

## Recent Changes

- 2026-04-30: Built the student dashboard UI (sidebar + topbar shell, 6 stat cards, coding progress with custom SVG donut + recharts area chart, GitHub activity heatmap with stats and recent repos, recent activity, leaderboard snapshot with podium, notifications, quick actions). Added Tailwind + shadcn-style primitives. Wired data via a hooks/services layer that returns Promises with mock MongoDB-shaped data — ready for backend swap. Upgraded `lucide-react` and added a custom GitHub icon since the brand was removed in newer versions.
- 2026-04-30: Initial Replit import. Configured Vite for the proxy, added the dev workflow on port 5000, created stub pages, set up static deployment.
