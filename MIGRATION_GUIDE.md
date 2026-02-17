# Repository Refactoring Migration Guide

This document outlines the refactoring from a monorepo structure to separate `frontend/` and `backend/` directories.

## ✅ Completed

### Frontend Structure
- ✅ Created `frontend/` directory
- ✅ Created `frontend/src/` with core files:
  - `main.jsx` (updated paths)
  - `routes.jsx`
  - `index.css`
  - `Actions.js`
  - `store.js`
  - `SidebarData.js`
  - `hooks/useGlobalReducer.jsx`
  - `components/BackendURL.jsx`
  - `navbar.css`
- ✅ Created `frontend/package.json`
- ✅ Created `frontend/vite.config.js`
- ✅ Created `frontend/index.html` (updated script path)
- ✅ Created `frontend/.env` with `VITE_BACKEND_URL`

### Backend Structure
- ✅ Created `backend/` directory
- ✅ Created `backend/src/` with:
  - `app.py` (removed static file serving)
  - `wsgi.py`
  - `api/` directory with all API modules:
    - `__init__.py`
    - `models.py`
    - `routes.py`
    - `utils.py`
    - `admin.py`
    - `commands.py`
- ✅ Created `backend/Pipfile` (updated reset_db path)
- ✅ Created `backend/requirements.txt`
- ✅ Created `backend/runtime.txt`
- ✅ Created `backend/Procfile`
- ✅ Created `backend/api/index.py` (for Vercel)

### Configuration Updates
- ✅ Updated `vercel.json`:
  - Build command: `cd frontend && npm run build`
  - Output directory: `frontend/dist`
  - API path: `backend/api/index.py`

## 🔄 Remaining Tasks

### Frontend Files to Copy

1. **Components** (copy from `src/front/components/` to `frontend/src/components/`):
   - `Carousel.jsx`
   - `CartContext.jsx`
   - `Cartitems.jsx`
   - `Footer.jsx`
   - `GameCard.jsx`
   - `Navbar.jsx`
   - `RawgGameCard.jsx`
   - `RawgGameCarousel.jsx`
   - `ScrollToTop.jsx`

2. **Pages** (copy from `src/front/pages/` to `frontend/src/pages/`):
   - `Checkout.jsx`
   - `Demo.jsx`
   - `Games.jsx`
   - `GamesDetail.jsx`
   - `Home.jsx`
   - `Layout.jsx`
   - `Login.jsx`
   - `Merch.jsx`
   - `MustLogin.jsx`
   - `Profile.jsx`
   - `RetroGameDetail.jsx`
   - `Retrogames.jsx`
   - `Signup.jsx`
   - `Single.jsx`

3. **Assets** (copy from `src/front/assets/` to `frontend/src/assets/`):
   - `img/fallback.jpg`
   - `img/projectimage1.png`
   - `img/rigo-baby.jpg`

4. **Other Files**:
   - Copy `public/` folder to `frontend/public/` (if exists)
   - Copy `dist/` folder to `frontend/dist/` (if exists)
   - Copy `node_modules/` to `frontend/node_modules/` (or run `npm install` in frontend/)
   - Copy `package-lock.json` to `frontend/`

### Backend Files to Copy

1. **Migrations**:
   - Copy `migrations/` folder to `backend/migrations/`
   - Update `alembic.ini` if it references paths

2. **Other Backend Files** (optional):
   - `pycodestyle.cfg` → `backend/pycodestyle.cfg`
   - `render_build.sh` → `backend/render_build.sh` (update paths)
   - `render.yaml` → `backend/render.yaml` (update paths)
   - `Dockerfile.render` → `backend/Dockerfile.render` (update paths)

### Path Updates Needed

1. **BackendURL.jsx**: Update image path from `../../../docs/assets/env-file.png` to `../../../../docs/assets/env-file.png`

2. **FLASK_APP Environment Variable**: 
   - Update any scripts/deployment configs to use `FLASK_APP=src/app.py` from `backend/` directory
   - Or set `FLASK_APP=backend/src/app.py` from root

3. **Migrations Path**: 
   - Update `alembic.ini` in `backend/migrations/` if it references `../src`
   - Should reference `../src` (which is now `backend/src`)

## 🚀 Running the Applications

### Frontend (from `frontend/` directory):
```bash
cd frontend
npm install
npm run dev
```

### Backend (from `backend/` directory):
```bash
cd backend
pipenv install
pipenv run start
```

Or from root:
```bash
cd backend && pipenv install && pipenv run start
```

## 📝 Notes

- Environment variables are preserved in `frontend/.env`
- Both apps can run independently
- Vercel deployment is configured for the new structure
- Backend no longer serves static files (frontend handles its own build)
- Import paths within each app remain the same (relative imports work within their directories)

## ⚠️ Important

Before deleting old files:
1. Test that frontend runs: `cd frontend && npm run dev`
2. Test that backend runs: `cd backend && pipenv run start`
3. Verify API connectivity from frontend
4. Run migrations: `cd backend && pipenv run upgrade`
