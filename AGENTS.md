# AGENTS.md

## Cursor Cloud specific instructions

小红书账号运营系统 — React SPA + Python FastAPI backend with ReaJason/xhs SDK for real Xiaohongshu integration.

### Quick reference

| Action | Command |
|--------|---------|
| Install frontend deps | `npm install` |
| Install backend deps | `pip install -r server/requirements.txt && python3 -m playwright install chromium` |
| Frontend dev server | `npm run dev` (Vite, default port 5173) |
| Backend API server | `npm run dev:server` (FastAPI/uvicorn, port 3001) |
| Lint | `npm run lint` |
| Build | `npm run build` (`tsc -b && vite build`) |
| Backend API docs | http://localhost:3001/docs (Swagger UI) |

### Architecture

- **Frontend**: React 19 + Vite 7, proxies `/api/*` to backend (see `vite.config.ts`)
- **Backend** (`server/`): Python FastAPI with [ReaJason/xhs](https://github.com/reajason/xhs) SDK (Cookie-based auth, no official API)
- **Dual mode**: Works without backend (local mode with localStorage); with backend + Cookie, enables real Xiaohongshu publishing and data
- Backend uses Playwright headless Chromium for xhs SDK's JS signature generation

### Notes

- **No test framework** is configured. Manual browser testing is the only option.
- ESLint has pre-existing lint errors in `src/store/useStore.tsx` and same pattern in `authStore.tsx`. These do not block the build.
- The dev server should be started with `--host 0.0.0.0` for cloud VM access: `npm run dev -- --host 0.0.0.0`.
- Real Xiaohongshu connection requires a Cookie from a logged-in browser session — paste it in the Account page.
- Backend sessions and Cookie stored in memory only — restart clears all auth state.
- The xhs SDK is a non-official reverse-engineered client; signing may break when Xiaohongshu updates their web client.
