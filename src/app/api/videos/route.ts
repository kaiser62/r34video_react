import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

const BASE_URL = "https://rule34video.com";
const REQUEST_TIMEOUT = 25000; // 25 seconds for Vercel

export const maxDuration = 30; // Vercel function timeout

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || "1";
  const query = searchParams.get("q");

  let url;
  if (query) {
    // Use the search URL format from the Flask app
    const formattedQuery = query.replace(/\s+/g, "-");
    url = `${BASE_URL}/search/${formattedQuery}?sort_by=post_date;from:${page}`;
    console.log("🔧 Using search URL format");
  } else {
    url = `${BASE_URL}/latest-updates/${page}/`;
  }

  console.log("📡 API Request - Page:", page, "Query:", query);
  console.log("🔗 Fetching videos from:", url);

  try {
    const headers: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      "Accept-Encoding": "gzip, deflate, br",
      "Connection": "keep-alive",
      "Upgrade-Insecure-Requests": "1",
      "Referer": BASE_URL,
    };

    const { data } = await axios.get(url, {
      headers,
      timeout: REQUEST_TIMEOUT,
      maxRedirects: 5,
    });

    const $ = cheerio.load(data);
    const videos: {
      id: string;
      link: string;
      thumbnail: string;
      title: string;
      is_hd: string;
      duration: string;
      tags: string[];
    }[] = [];

    $("div.item.thumb").each((i, item) => {
      const linkTag = $(item).find('a.js-open-popup[href*="/video/"]');
      if (!linkTag.length) return;

      const href = linkTag.attr("href") || "";
      const fullLink = new URL(href, BASE_URL).toString();
      const title = linkTag.attr("title") || "";
      const videoId = href.split("/").filter(Boolean).slice(-2, -1)[0];

      const thumbnailTag = $(item).find("img.thumb.lazy-load");
      let thumbnail = thumbnailTag.attr("data-original") || "";
      if (!thumbnail && thumbnailTag.length) {
        thumbnail = thumbnailTag.attr("src") || thumbnailTag.attr("data-src") || "";
      }
      if (!thumbnail) {
        const altThumbnail = $(item).find("img");
        if (altThumbnail.length) {
          thumbnail = altThumbnail.attr("src") || altThumbnail.attr("data-src") || altThumbnail.attr("data-original") || "";
        }
      }

      const duration = $(item).find(".time").text().trim();
      const isHd = $(item).find(".quality").length > 0 ? "HD" : "";
      
      // Tags are not available in the listing, will be fetched when video is opened

      const videoData = {
        id: videoId,
        link: fullLink,
        thumbnail,
        title,
        is_hd: isHd,
        duration,
        tags: [],
      };

      videos.push(videoData);
    });

    console.log(`📊 API Response - Found ${videos.length} videos for page ${page}, query: "${query}"`);
    const response = NextResponse.json(videos);
    
    // Add caching headers for Vercel
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    response.headers.set('CDN-Cache-Control', 'public, max-age=600');
    response.headers.set('Vercel-CDN-Cache-Control', 'public, max-age=600');
    
    return response;
  } catch (error) {
    console.error("Failed to fetch videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}