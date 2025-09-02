"use client";

import { useState, useEffect } from "react";
import { useSearch } from "@/contexts/SearchContext";
import VideoCard from "./VideoCard";
import VideoModal from "./VideoModal";

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  link: string;
  is_hd: string;
  duration: string;
  tags: string[];
}

interface FeedProps {
  initialPage?: number;
  initialQuery?: string;
}

export default function Feed({ initialPage = 1, initialQuery }: FeedProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [hasNextPage, setHasNextPage] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const { updateURL } = useSearch();

  // Direct fetch on mount/remount - much simpler like Flask
  useEffect(() => {
    console.log(`🎬 Feed loading page ${initialPage}, query: "${initialQuery}"`);
    
    const fetchData = async () => {
      setLoading(true);
      setVideos([]); // Clear previous videos immediately
      
      try {
        const currentQuery = initialQuery || "";
        const url = currentQuery
          ? `/api/videos?q=${encodeURIComponent(currentQuery)}&page=${initialPage}`
          : `/api/videos?page=${initialPage}`;
        
        console.log(`🔍 Fetching: ${url}`);
        const res = await fetch(url);
        const newVideos: Video[] = await res.json();
        
        console.log(`📊 API returned ${newVideos.length} videos`);
        console.log(`📝 First video: ${newVideos[0]?.id} - ${newVideos[0]?.title?.substring(0, 30)}...`);
        
        // Force new array reference to trigger re-render
        setVideos([...newVideos]);
        setHasNextPage(newVideos.length >= 24);
        
      } catch (error) {
        console.error("❌ Fetch failed:", error);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [initialPage, initialQuery]);


  // Simple pagination handlers - like Flask
  const handleNextPage = () => {
    if (!loading && hasNextPage) {
      const nextPage = initialPage + 1;
      console.log(`➡️ Going to page ${nextPage}`);
      updateURL(nextPage, initialQuery);
    }
  };

  const handlePrevPage = () => {
    if (!loading && initialPage > 1) {
      const prevPage = initialPage - 1;
      console.log(`⬅️ Going to page ${prevPage}`);
      updateURL(prevPage, initialQuery);
    }
  };


  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
  };

  const closeModal = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {videos.map((video) => (
          <VideoCard 
            key={video.id} 
            video={video} 
            onClick={() => handleVideoClick(video)}
          />
        ))}
      </div>
      
      {loading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Pagination Controls */}
      <div className="flex justify-center items-center space-x-4 my-8">
        <button
          onClick={handlePrevPage}
          disabled={loading || initialPage === 1}
          className="px-6 py-3 bg-gray-700 text-gray-100 rounded-lg hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors border border-gray-600 flex items-center gap-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-300"></div>
          ) : (
            "←"
          )}
          Previous
        </button>
        
        <span className="text-gray-300 font-medium px-4">
          Page {initialPage}
          {initialQuery && (
            <span className="text-gray-500 text-sm block">
              Search: &ldquo;{initialQuery}&rdquo;
            </span>
          )}
        </span>
        
        <button
          onClick={handleNextPage}
          disabled={loading || !hasNextPage}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          Next
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            "→"
          )}
        </button>
      </div>
      
      {!hasNextPage && videos.length > 0 && initialPage > 1 && (
        <div className="text-center text-gray-400 text-sm mb-4">
          No more pages available
        </div>
      )}

      {selectedVideo && (
        <VideoModal video={selectedVideo} onClose={closeModal} />
      )}
    </div>
  );
}