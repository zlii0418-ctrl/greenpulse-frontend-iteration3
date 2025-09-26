# API Configuration Guide

This guide explains how to configure the API to work both locally and on the live website.

## Overview

The application uses a flexible API configuration that automatically adapts to different environments:

- **Local Development**: Uses Vite proxy to forward API calls to the production backend
- **Production**: Directly calls the production API endpoint
- **Custom Environment**: Can be overridden with environment variables

## Environment Configuration

### Local Development

For local development, the application automatically uses a proxy configuration that forwards all `/api/*` requests to the production backend (`https://gp-backend-iter3.vercel.app`).

**No additional setup required** - just run:
```bash
npm run dev
# or
pnpm dev
```

The proxy will handle all API calls automatically.

### Custom API URL

If you need to use a different API URL (e.g., for testing with a local backend), create a `.env.local` file in the project root:

```bash
# .env.local
VITE_API_URL=http://localhost:3000
```

Or for a different remote API:
```bash
# .env.local
VITE_API_URL=https://your-custom-api.com
```

### Production Deployment

The production deployment automatically uses the configured API URL from `vercel.json`. No additional configuration needed.

## How It Works

### API Configuration (`src/services/api.js`)

The API configuration automatically detects the environment:

1. **Development Mode**: Uses empty baseURL (relies on Vite proxy)
2. **Production Mode**: Uses `https://gp-backend-iter3.vercel.app`
3. **Custom Environment**: Uses `VITE_API_URL` if set

### Vite Proxy (`vite.config.ts`)

The Vite development server includes a proxy that:
- Intercepts all requests to `/api/*`
- Forwards them to the production backend
- Handles CORS and authentication
- Provides debugging information

### Vercel Configuration (`vercel.json`)

The Vercel configuration ensures:
- Environment variables are properly set during build
- The correct API URL is used in production
- Build process has access to required environment variables

## API Endpoints

The application uses the following API endpoints:

### Dropdown Data
- `GET /api/food-dropdown/fruits-vegetables`
- `GET /api/food-dropdown/poultry-redmeats-seafood`
- `GET /api/food-dropdown/staples-grain`
- `GET /api/food-dropdown/processed-dairy`
- `GET /api/shopping-dropdown/groceries-beverages`
- `GET /api/shopping-dropdown/home-garden-appliances-entertainment-general`
- `GET /api/shopping-dropdown/clothing-accessories-health-pharmacy`

### Calculator Endpoints
- `POST /api/calculate/travel`
- `POST /api/calculate/household`
- `POST /api/calculate/food`
- `POST /api/calculate/shopping`

### Recommendations
- `POST /api/recommendations/generate`

## Troubleshooting

### Local Development Issues

1. **API calls not working locally**:
   - Check that the Vite dev server is running
   - Verify the proxy configuration in `vite.config.ts`
   - Check browser network tab for proxy errors

2. **CORS errors**:
   - The proxy should handle CORS automatically
   - If you see CORS errors, check the proxy configuration

3. **API timeout errors**:
   - Check your internet connection
   - Verify the production API is accessible
   - Check the API timeout setting (currently 10 seconds)

### Production Issues

1. **Environment variables not working**:
   - Check `vercel.json` configuration
   - Verify environment variables in Vercel dashboard
   - Ensure `VITE_` prefix is used for client-side variables

2. **API calls failing**:
   - Check the production API URL
   - Verify the API endpoints are accessible
   - Check browser console for error messages

## Development Workflow

1. **Start local development**:
   ```bash
   npm run dev
   ```

2. **Test API calls**:
   - Open browser developer tools
   - Check Network tab for API requests
   - Look for console logs showing API requests

3. **Deploy to production**:
   ```bash
   npm run build
   # Deploy to Vercel (automatic if connected to Git)
   ```

## Environment Variables Reference

| Variable | Description | Default (Development) | Default (Production) |
|----------|-------------|----------------------|---------------------|
| `VITE_API_URL` | API base URL | Empty (uses proxy) | `https://gp-backend-iter3.vercel.app` |

## Best Practices

1. **Never commit sensitive API keys** to version control
2. **Use environment variables** for different API URLs
3. **Test both local and production** configurations
4. **Monitor API calls** in browser developer tools
5. **Handle API errors gracefully** in your components

## Support

If you encounter issues with the API configuration:

1. Check this documentation first
2. Review the browser console for error messages
3. Check the Network tab for failed requests
4. Verify your environment configuration
5. Test with a simple API call to confirm connectivity
