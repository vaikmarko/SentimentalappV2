# 🚀 Development Guide - Clean Sentimental Codebase

## Overview

This guide covers the newly organized codebase structure and development workflows for both Sentimental (production) and MentalOS (spinoff).

## 🏗️ Architecture

### Backend (`/api/`)
- **Single Flask App**: `app.py` serves both Sentimental and MentalOS APIs
- **Modular Engines**: AI and story generation engines in `/api/engines/`
- **Shared Utilities**: Common functions in `/api/utils/`
- **Clean Imports**: All imports updated to use new structure

### Frontend (`/apps/`)
- **Sentimental**: Production app with story generation
- **MentalOS**: Self-discovery spinoff using same backend
- **Shared Components**: Common UI elements in `/apps/shared/`

## 🔧 Development Commands

### Backend Development
```bash
# Start Flask server (serves both apps)
python app.py

# Backend runs on http://localhost:5000
# Serves APIs for both Sentimental and MentalOS
```

### MentalOS Development (Recommended)
```bash
cd apps/mental-os
npm run dev

# Frontend runs on http://localhost:5173
# Proxies API calls to Flask backend on :5000
```

### Sentimental Development
```bash
cd apps/sentimental
# Currently uses direct JSX loading
# Modern Vite build system available for future enhancement
```

## 📁 File Organization

### Adding New Features

**Backend APIs:**
```bash
# Add routes to app.py or create new route modules
# Import engines from api.engines.*
# Use utilities from api.utils.*
```

**Frontend Components:**
```bash
# MentalOS: apps/mental-os/src/
# Sentimental: apps/sentimental/
# Shared: apps/shared/
```

**Shared Resources:**
```bash
# Assets: shared/assets/
# Styles: shared/styles/
# Config: shared/config/
```

## 🚀 Deployment

### Quick Deploy
```bash
./deploy/scripts/deploy-production.sh
```

### Manual Steps
```bash
# Build apps
./deploy/scripts/build.sh

# Deploy backend
gcloud run deploy sentimentalapp --source .

# Deploy frontend
firebase deploy --only hosting
```

## 🔄 Migration from Old Structure

The cleanup process:
1. ✅ Moved AI engines to `/api/engines/`
2. ✅ Consolidated duplicate static files
3. ✅ Updated import paths in `app.py`
4. ✅ Created modern build system for apps
5. ✅ Streamlined deployment process

## 🎯 MentalOS Focus

With clean structure, you can now focus on MentalOS development:

**Key Files:**
- `apps/mental-os/src/App.jsx` - Main MentalOS interface
- `apps/mental-os/user_data/` - User mental model files
- Backend APIs already handle MentalOS endpoints

**Development Flow:**
1. Work in `apps/mental-os/`
2. Backend APIs available via Flask
3. Hot reload with `npm run dev`
4. Deploy when ready to replace production

## 🛠️ Troubleshooting

**Import Errors:**
- Check that engines import from `api.engines.*`
- Verify utilities import from `api.utils.*`

**Frontend Issues:**
- Ensure backend is running on `:5000`
- Check proxy configuration in `vite.config.js`

**Deployment Problems:**
- Verify Firebase and gcloud CLI are configured
- Check environment variables are set

The kitchen is clean! 🧹 Ready for focused MentalOS development! 🚀
