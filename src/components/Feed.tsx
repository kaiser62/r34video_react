"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const { searchQuery, setSearchQuery, updateURL } = useSearch();
  const requestInProgress = useRef(false);
  const lastFetchedParams = useRef<{ page: number; query: string } | null>(null);
  const initialized = useRef(false);

  const fetchVideos = useCallback(async (pageNumber: number, queryParam?: string) => {
    const currentQuery = queryParam !== undefined ? queryParam : searchQuery;
    
    // Check if we've already fetched this exact combination
    if (lastFetchedParams.current?.page === pageNumber && 
        lastFetchedParams.current?.query === currentQuery) {
      console.log(`⏭️ Skipping fetch - already have page ${pageNumber} for query "${currentQuery}"`);
      return;
    }

    if (requestInProgress.current) {
      console.log(`⏳ Request already in progress, skipping`);
      return;
    }
    
    requestInProgress.current = true;
    setLoading(true);
    
    try {
      const url = currentQuery
        ? `/api/videos?q=${encodeURIComponent(currentQuery)}&page=${pageNumber}`
        : `/api/videos?page=${pageNumber}`;
      
      console.log(`🔍 Fetching videos: ${url}`);
      const res = await fetch(url);
      const newVideos: Video[] = await res.json();
      console.log(`📊 Retrieved ${newVideos.length} videos for page ${pageNumber}, query: "${currentQuery}"`);
      
      setVideos(newVideos);
      setHasNextPage(newVideos.length >= 24);
      
      // Store the parameters we just fetched
      lastFetchedParams.current = { page: pageNumber, query: currentQuery };
    } catch (error) {
      console.error("Failed to fetch videos:", error);
      setVideos([]);
    } finally {
      setLoading(false);
      requestInProgress.current = false;
    }
  }, [searchQuery]); // Include searchQuery dependency

  // React to initial props changes (URL-driven)
  useEffect(() => {
    console.log(`🔄 Props changed - initialPage: ${initialPage}, initialQuery: "${initialQuery}"`);
    
    // Update search query from URL
    if (initialQuery !== undefined && initialQuery !== searchQuery) {
      console.log(`📝 Setting search query from URL: "${initialQuery}"`);
      setSearchQuery(initialQuery);
    }
    
    // Update page from URL
    if (initialPage !== currentPage) {
      console.log(`📄 Setting page from URL: ${initialPage}`);
      setCurrentPage(initialPage);
    }
    
    // Clear previous results when props change
    setVideos([]);
    setHasNextPage(true);
    lastFetchedParams.current = null;
    
    // Fetch data with new params
    fetchVideos(initialPage, initialQuery);
    
    initialized.current = true;
  }, [initialPage, initialQuery, currentPage, searchQuery, setSearchQuery, fetchVideos]);

  // Handle pagination button clicks (update URL, which will trigger re-render)
  const handleNextPage = () => {
    if (!loading && hasNextPage) {
      const nextPage = currentPage + 1;
      console.log(`➡️ Next page clicked: ${nextPage}`);
      updateURL(nextPage, searchQuery);
    }
  };

  const handlePrevPage = () => {
    if (!loading && currentPage > 1) {
      const prevPage = currentPage - 1;  
      console.log(`⬅️ Previous page clicked: ${prevPage}`);
      updateURL(prevPage, searchQuery);
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
          disabled={loading || currentPage === 1}
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
          Page {currentPage}
          {searchQuery && (
            <span className="text-gray-500 text-sm block">
              Search: &ldquo;{searchQuery}&rdquo;
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
      
      {!hasNextPage && videos.length > 0 && currentPage > 1 && (
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