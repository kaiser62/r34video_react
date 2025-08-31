# r34video React App

A modern, dark-themed video browsing application built with Next.js 15 and React 19. Features a responsive grid layout, video streaming, search functionality, and tag-based filtering.

## Features

- 🎨 **Dark Theme** - Sleek, modern dark interface
- 📱 **Responsive Design** - Works on all screen sizes
- 🎥 **Video Streaming** - Built-in proxy for CORS handling
- 🔍 **Search & Filters** - Tag-based search with URL persistence
- 📄 **Pagination** - Next/Previous page navigation
- 🏷️ **Clickable Tags** - Click tags to search related content
- ⚡ **Quality Selection** - Multiple video quality options
- 🖥️ **Modal View** - Full-screen video player with metadata

## Tech Stack

- **Framework:** Next.js 15 with Turbopack
- **Frontend:** React 19, TypeScript
- **Styling:** Tailwind CSS 4
- **Data Fetching:** Axios with Cheerio for scraping
- **Video Player:** HTML5 with streaming proxy

## Getting Started

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Production

```bash
npm run build
npm start
```

## Deployment

### Deploy to Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

1. Connect your GitHub repository to Render
2. The `render.yaml` file will automatically configure the deployment
3. Set any required environment variables
4. Deploy!

### Docker Deployment

```bash
# Build the image
docker build -t r34video-react .

# Run the container
docker run -p 3000:3000 r34video-react
```

### Manual Deployment

1. Build the application:
   ```bash
   npm ci
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Configuration

The app uses the following environment variables:

- `NODE_ENV` - Set to "production" for production builds
- `PORT` - Server port (default: 3000)

## API Endpoints

- `/api/videos?page=1&q=search` - Fetch videos with pagination and search
- `/api/resolve?url=video_url` - Get video streams and metadata
- `/api/stream?url=stream_url` - Proxy video streams for CORS

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── globals.css    # Global styles
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Home page
├── components/
│   ├── Feed.tsx       # Main video grid
│   ├── VideoCard.tsx  # Video thumbnail cards
│   ├── VideoModal.tsx # Video player modal
│   └── Header.tsx     # Navigation header
└── contexts/
    └── SearchContext.tsx # Search state management
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
