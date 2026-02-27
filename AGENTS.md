# AGENTS.md

## Cursor Cloud specific instructions

小红书账号运营系统 — React SPA with optional Express backend for Xiaohongshu API integration. Frontend data persisted in browser `localStorage`; backend manages OAuth and API proxy.

### Quick reference

| Action | Command |
|--------|---------|
| Install frontend deps | `npm install` |
| Install backend deps | `cd server && npm install` |
| Frontend dev server | `npm run dev` (Vite, default port 5173) |
| Backend API server | `npm run dev:server` (Express, port 3001) |
| Lint | `npm run lint` |
| Build | `npm run build` (`tsc -b && vite build`) |

### Architecture

- **Frontend**: React 19 + Vite 7, proxies `/api/*` to backend (see `vite.config.ts`)
- **Backend** (`server/`): Express.js with OAuth flow, request signing (MD5), and API proxy to `https://ark.xiaohongshu.com`
- **Dual mode**: Works fully without backend (local mode); when backend is running with credentials, enables real Xiaohongshu API integration
- Backend has its own `package.json` in `server/` — dependencies must be installed separately

### Notes

- **No test framework** is configured. Manual browser testing is the only option.
- ESLint has 2 pre-existing errors and 1 warning in `src/store/useStore.tsx`. These are in existing code and do not block the build.
- The dev server should be started with `--host 0.0.0.0` for access within the cloud VM: `npm run dev -- --host 0.0.0.0`.
- Real Xiaohongshu API requires credentials (`XHS_APP_KEY`, `XHS_APP_SECRET`) in `.env` — see `.env.example`.
- Backend sessions stored in memory (restart clears all sessions).
