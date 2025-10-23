# 🔧 Environment Setup - Complete Guide

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

The backend environment is already configured in `launch_app_fms/env copy`. Copy this to `.env`:

```bash
# Copy the content from launch_app_fms/env copy to launch_app_fms/.env
cp launch_app_fms/env\ copy launch_app_fms/.env
```

## CORS Configuration Update

Update the backend CORS configuration to include the frontend URL:

```bash
# In launch_app_fms/.env, update ALLOWED_ORIGINS:
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5173,https://yourdomain.com
```

## Development Setup Instructions

1. **Backend Setup**:
   ```bash
   cd launch_app_fms
   cp "env copy" .env
   # Edit .env to update ALLOWED_ORIGINS
   npm install
   npm run dev
   ```

2. **Frontend Setup**:
   ```bash
   cd fms-dev
   # Create .env file with above configuration
   npm install
   npm run dev
   ```

3. **Verify Connection**:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000
   - Test API: http://localhost:3000/fms/api/v0/otp-auth/send-otp

## Testing Authentication

Run the authentication test:

```bash
cd fms-dev
node test-scripts/auth-integration-test.js
```

## Next Steps

1. ✅ Environment files created
2. ✅ Authentication API updated for OTP flow
3. ✅ Login component updated for OTP authentication
4. ✅ Test scripts created
5. 🔄 Ready for testing and integration
