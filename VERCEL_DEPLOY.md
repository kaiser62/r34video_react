# Vercel Deployment Guide

This branch is optimized for deployment on Vercel with the following optimizations:

## Optimizations Made

### 1. **Build Configuration**
- Removed `--turbopack` flag for Vercel compatibility
- Added `vercel-build` script
- Configured `next.config.ts` with Vercel-specific settings

### 2. **API Route Optimizations**
- Added `maxDuration` exports for function timeout control
- Configured request timeouts (25s max for Vercel functions)
- Added CDN caching headers for better performance
- Improved error handling and logging

### 3. **Vercel Configuration**
- Created `vercel.json` with optimal settings
- Configured CORS headers
- Set up proper caching strategies
- Added security headers

### 4. **Performance Enhancements**
- Image optimization with WebP/AVIF support
- Compression enabled
- ETags disabled for better caching
- External packages configured for server components

## Deployment Steps

1. **Fork/Clone this branch**
   ```bash
   git clone <repo-url>
   git checkout vercel-deploy
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Deploy to Vercel**
   
   **Option A: Using Vercel CLI**
   ```bash
   npm install -g vercel
   vercel
   ```
   
   **Option B: Using GitHub Integration**
   - Connect your GitHub repo to Vercel
   - Vercel will auto-deploy from this branch
   - Set branch to `vercel-deploy` in Vercel dashboard

4. **Environment Variables**
   No environment variables are required for basic functionality.

## Vercel Function Limits

- **Timeout**: 30 seconds (configured)
- **Memory**: Default (1024 MB on Pro plan)
- **Execution**: Serverless functions
- **Cold Start**: ~200-500ms

## API Endpoints

- `GET /api/videos?page=1&q=search` - Fetch videos
- `GET /api/resolve?url=video-url` - Get video streams
- `GET /api/stream?url=stream-url` - Proxy video streaming
- `GET /api/health` - Health check

## Performance Features

1. **CDN Caching**: 10-minute cache for video listings
2. **Stream Caching**: 20-minute cache for video resolution
3. **Image Optimization**: Automatic WebP/AVIF conversion
4. **Compression**: Gzip compression enabled

## Monitoring

Use Vercel's built-in analytics to monitor:
- Function execution time
- Error rates
- Traffic patterns
- Cache hit rates

## Troubleshooting

### Function Timeout
If functions timeout, check the logs in Vercel dashboard. The app is configured with 30-second timeouts.

### CORS Issues  
CORS headers are configured in `vercel.json`. If issues persist, check the Vercel console.

### Performance
Monitor Core Web Vitals in Vercel Analytics for optimization opportunities.

## Production URLs

After deployment, your app will be available at:
- Production: `https://your-app.vercel.app`
- Preview: `https://your-app-git-vercel-deploy.vercel.app`