import { NextResponse } from "next/server";

export const maxDuration = 5; // Short timeout for health check

export async function GET() {
  const response = NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "r34video-nextjs",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development"
  });
  
  // Add caching headers
  response.headers.set('Cache-Control', 'public, max-age=60');
  
  return response;
}