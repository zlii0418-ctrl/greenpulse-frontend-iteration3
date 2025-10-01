# API Connection Fix for Production

## Problem
The application was getting 405 Method Not Allowed errors when making API calls in production because:
1. The frontend was trying to make API calls to the same domain (`greenpulse-frontend-v.vercel.app`)
2. No API routes were defined in the frontend project
3. The `VITE_API_URL` environment variable was not set in production

## Solution Applied

### 1. Created `vercel.json` Configuration
Added a `vercel.json` file to set the environment variable in production:
```json
{
  "env": {
    "VITE_API_URL": "https://gp-backend-iter2.vercel.app"
  }
}
```

### 2. Updated API Service Configuration
Modified `src/services/api.js` to:
- Use a fallback URL when `VITE_API_URL` is not set
- Use the configured axios instance consistently across all API calls

### 3. Fixed API Call Consistency
Updated all API functions to use the configured `api` instance instead of the default `axios` instance.

## Deployment Steps

1. **Commit and push the changes:**
   ```bash
   git add .
   git commit -m "Fix API connection for production deployment"
   git push
   ```

2. **Redeploy on Vercel:**
   - The `vercel.json` file will automatically set the environment variable
   - Vercel will redeploy with the new configuration

3. **Alternative: Set Environment Variable Manually**
   If you prefer to set the environment variable manually in Vercel Dashboard:
   - Go to your project in Vercel Dashboard
   - Navigate to Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://gp-backend-iter2.vercel.app`
   - Redeploy the project

## Verification
After deployment, the API calls should work correctly and you should no longer see 405 errors in the browser console.

## Files Modified
- `vercel.json` (new file)
- `src/services/api.js` (updated to use configured axios instance)
