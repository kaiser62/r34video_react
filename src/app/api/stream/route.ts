import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const REQUEST_TIMEOUT = 25000; // 25 seconds for Vercel
export const maxDuration = 30; // Vercel function timeout

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const videoUrl = searchParams.get("url");

  if (!videoUrl) {
    return new NextResponse("Missing video URL", { status: 400 });
  }

  try {
    const range = request.headers.get("range");
    console.log(`🎥 Stream request for: ${videoUrl}`);
    console.log(`📐 Client range: ${range}`);

    // First, get file info with a HEAD request to check actual size
    let actualSize: number | null = null;
    try {
      const headResponse = await axios.head(videoUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Referer: "https://rule34video.com/",
        },
        timeout: REQUEST_TIMEOUT,
      });
      actualSize = parseInt(headResponse.headers["content-length"] || "0", 10);
      console.log(`📏 Actual file size: ${actualSize} bytes`);
    } catch {
      console.warn("📝 HEAD request failed, proceeding with range request");
    }

    // Prepare headers for the range request
    const requestHeaders: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Referer: "https://rule34video.com/",
    };

    // If we have a range request, validate it against actual file size
    if (range && actualSize) {
      const rangeMatch = range.match(/bytes=(\d*)-(\d*)/);
      if (rangeMatch) {
        const start = parseInt(rangeMatch[1] || "0", 10);
        const end = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : actualSize - 1;
        
        console.log(`🔍 Parsed range: ${start}-${end} (file size: ${actualSize})`);
        
        // If start position is beyond file size, return 416
        if (start >= actualSize) {
          console.error(`❌ Range start ${start} >= file size ${actualSize}`);
          return new NextResponse("Range Not Satisfiable", { 
            status: 416,
            headers: {
              "Content-Range": `bytes */${actualSize}`,
              "Accept-Ranges": "bytes",
            }
          });
        }
        
        // Adjust range to file boundaries
        const adjustedEnd = Math.min(end, actualSize - 1);
        requestHeaders.Range = `bytes=${start}-${adjustedEnd}`;
        console.log(`✅ Adjusted range: ${requestHeaders.Range}`);
      }
    } else if (range) {
      // Use original range if we couldn't get file size
      requestHeaders.Range = range;
    }

    const response = await axios({
      method: "get",
      url: videoUrl,
      responseType: "stream",
      headers: requestHeaders,
      timeout: REQUEST_TIMEOUT,
      maxRedirects: 5,
      validateStatus: (status) => status < 500, // Accept 416 from upstream
    });

    console.log(`📊 Upstream response: ${response.status}`);
    console.log(`📋 Upstream headers:`, Object.keys(response.headers));

    // If upstream returned 416, pass it through
    if (response.status === 416) {
      return new NextResponse("Range Not Satisfiable", { 
        status: 416,
        headers: {
          "Content-Range": response.headers["content-range"] || `bytes */${actualSize || 0}`,
          "Accept-Ranges": "bytes",
          "Access-Control-Allow-Origin": "*",
        }
      });
    }

    const headers = new Headers();
    headers.set("Content-Type", response.headers["content-type"] || "video/mp4");
    if (response.headers["content-length"]) {
      headers.set("Content-Length", response.headers["content-length"]);
    }
    headers.set("Accept-Ranges", "bytes");
    headers.set("Access-Control-Allow-Origin", "*");
    if (response.headers["content-range"]) {
      headers.set("Content-Range", response.headers["content-range"]);
      console.log(`📐 Upstream Content-Range: ${response.headers["content-range"]}`);
    }

    return new NextResponse(response.data, {
      status: response.status,
      headers,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("❌ Stream failed:", errorMessage);
    
    // If it's a 416 error from axios, handle it properly
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response: { status: number; headers: Record<string, string> } };
      if (axiosError.response?.status === 416) {
        return new NextResponse("Range Not Satisfiable", { 
          status: 416,
          headers: {
            "Content-Range": axiosError.response.headers["content-range"] || "bytes */0",
            "Accept-Ranges": "bytes",
            "Access-Control-Allow-Origin": "*",
          }
        });
      }
    }
    
    return new NextResponse("Stream failed", { status: 500 });
  }
}