import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const videoUrl = searchParams.get("url");

  if (!videoUrl) {
    return new NextResponse("Missing video URL", { status: 400 });
  }

  try {
    const range = request.headers.get("range");

    const response = await axios({
      method: "get",
      url: videoUrl,
      responseType: "stream",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Referer: "https://rule34video.com/",
        Range: range || "bytes=0-",
      },
    });

    const headers = new Headers();
    headers.set("Content-Type", response.headers["content-type"]);
    headers.set("Content-Length", response.headers["content-length"]);
    headers.set("Accept-Ranges", "bytes");
    headers.set("Access-Control-Allow-Origin", "*");
    if (response.headers["content-range"]) {
      headers.set("Content-Range", response.headers["content-range"]);
    }

    return new NextResponse(response.data, {
      status: response.status,
      headers,
    });
  } catch (error) {
    console.error("Stream failed:", error);
    return new NextResponse("Stream failed", { status: 500 });
  }
}