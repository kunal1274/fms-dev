# Vercel Deployment Guide

## Environment Variables for Production

Set these environment variables in your Vercel dashboard:

```
VITE_API_BASE=https://fms-qkmw.onrender.com/fms/api/v0
VITE_PROXY_TARGET=https://fms-qkmw.onrender.com
```

## Steps to Deploy:

1. **Fix Dependencies**: The package.json has been updated to fix the Vite version conflict
2. **Set Environment Variables**: Add the above environment variables in Vercel dashboard
3. **Deploy**: The deployment should now work without dependency conflicts

## Backend URL:
- **Production Backend**: https://fms-qkmw.onrender.com
- **API Base**: https://fms-qkmw.onrender.com/fms/api/v0

## Frontend URL:
- **Production Frontend**: https://launch-fms-test.vercel.app/

## Changes Made:

### 1. Fixed Vite Plugin Version
- Updated `@vitejs/plugin-react` from `^4.2.1` to `^5.0.0`
- This resolves the peer dependency conflict with Vite 7.1.10

### 2. Environment Variables
- Set `VITE_API_BASE` to production backend URL
- Set `VITE_PROXY_TARGET` to production backend URL

### 3. Authentication Persistence
- Fixed authentication persistence issue
- User data and token are now properly stored in localStorage
- No more redirects to login on browser refresh

## Testing:
1. Deploy to Vercel
2. Set environment variables
3. Test login flow
4. Test company data loading
5. Test browser refresh (should stay logged in)
