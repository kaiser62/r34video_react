import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import he from "he";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoUrl = searchParams.get("url");

  if (!videoUrl) {
    return NextResponse.json(
      { error: "Missing video URL" },
      { status: 400 }
    );
  }

  console.log("Resolving video from:", videoUrl);

  try {
    const { data: html_page } = await axios.get(videoUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
    });

    console.log("Fetched HTML page of length:", html_page.length);

    const $ = cheerio.load(html_page);

    // Extract stream URLs - first try from .wrap a.tag_item links
    const streams: { [key: string]: string } = {};
    const streamLinks = $(".wrap a.tag_item") || $("a[href*='.mp4']");
    streamLinks.each((i, el) => {
      const href = $(el).attr("href");
      const label = $(el).text().trim();
      console.log(`Found potential stream link: ${href} with label: ${label}`);
      if (href && href.includes(".mp4")) {
        streams[label || `Quality ${Object.keys(streams).length + 1}`] = he.decode(href);
      }
    });

    // If no streams found, search in script tags
    if (Object.keys(streams).length === 0) {
      console.log("No streams found in a tags, searching in script tags...");
      $("script").each((i, script) => {
        const scriptContent = $(script).html();
        if (scriptContent) {
          const mp4Urls = scriptContent.match(/["'](https?:\/\/[^"']+\.mp4)["']/g);
          if (mp4Urls) {
            console.log(`Found ${mp4Urls.length} mp4 URLs in script tag ${i}:`, mp4Urls);
            mp4Urls.forEach((url, j) => {
              const decodedUrl = he.decode(url.slice(1, -1));
              const qualityMatch = decodedUrl.match(/_(\d+p)\.mp4/);
              const quality = qualityMatch ? qualityMatch[1] : `Source ${j + 1}`;
              streams[quality] = decodedUrl;
            });
          }
        }
      });
    }

    console.log("Found streams:", Object.keys(streams));

    // Extract tags from .tag_item elements
    const tags: string[] = [];
    $(".tag_item").each((i, el) => {
      const tagText = $(el).text().trim();
      if (tagText) {
        tags.push(tagText);
      }
    });
    
    // Remove duplicate tags and sort
    const uniqueTags = [...new Set(tags)].sort();
    console.log(`Found ${uniqueTags.length} unique tags`);

    // Extract title
    const title = $(".title_video, h1.title, h1").first().text().trim();
    console.log("Found title:", title);

    const resolvedData = {
      streams,
      tags: uniqueTags,
      title,
    };

    console.log("Resolved video data:", resolvedData);
    return NextResponse.json(resolvedData);
  } catch (error) {
    console.error("Failed to resolve video:", error);
    return NextResponse.json(
      { error: "Failed to resolve video" },
      { status: 500 }
    );
  }
}