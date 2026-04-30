# Project Overview

A React + Vite frontend application scaffold. The app uses React Router for navigation and includes placeholder pages for a multi-role platform (student, trainer, admin) with auth flows.

## Tech Stack

- React 19 + Vite 8
- React Router DOM 7
- Zustand for state, Axios for HTTP
- Recharts, lucide-react, clsx, tailwind-merge

## Project Structure

- `frontend/` - Vite React app
  - `src/pages/` - Route-level pages (auth, student, trainer, admin)
  - `src/components/` - Layout (Navbar, Sidebar) and cards
  - `src/services/` - API client
  - `src/store/` - Zustand stores

## Replit Setup

- Workflow `Start application` runs `npm --prefix frontend run dev` on port 5000.
- Vite is configured with `host: 0.0.0.0`, `port: 5000`, and `allowedHosts: true` so the Replit preview proxy can reach it.
- Deployment is configured as `static`: build command `npm --prefix frontend run build`, public dir `frontend/dist`.

## Recent Changes

- 2026-04-30: Initial Replit import. Configured Vite for the proxy, added the dev workflow on port 5000, created stub pages for routes that were referenced in `App.jsx` but missing on disk (Register, Coding, Github, Leaderboard, Profile, Notifications, trainer/Dashboard, admin/Dashboard, NotFound), and configured static deployment.
