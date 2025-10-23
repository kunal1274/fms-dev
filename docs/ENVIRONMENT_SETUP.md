# 🔧 Environment Setup Guide

## Frontend Environment Configuration

Create a `.env` file in the `fms-dev` directory with the following content:

```bash
# Frontend Environment Configuration
# Development Environment

# API Configuration
VITE_API_URL=http://localhost:3000/fms/api/v0
VITE_API_TIMEOUT=30000

# Authentication
VITE_JWT_SECRET=your_jwt_secret_here
VITE_REFRESH_TOKEN_KEY=refresh_token

# Application Settings
VITE_APP_NAME=FMS ERP System
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development

# File Upload
VITE_MAX_FILE_SIZE=31457280
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document

# Development Settings
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
```

## Backend Environment Configuration

The backend already has environment configuration. Ensure the following variables are set in `launch_app_fms/.env`:

```bash
# Backend Environment Configuration
PORT=3000
NODE_ENV=development

# Database
ATLAS_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# File Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=31457280
```

## Development Setup Instructions

1. **Frontend Setup**:
   ```bash
   cd fms-dev
   npm install
   # Create .env file with above configuration
   npm run dev
   ```

2. **Backend Setup**:
   ```bash
   cd launch_app_fms
   npm install
   # Ensure .env file is configured
   npm run dev
   ```

3. **Verify Connection**:
   - Frontend should run on http://localhost:5173
   - Backend should run on http://localhost:3000
   - Test API connection: http://localhost:3000/fms/api/v0/companies
