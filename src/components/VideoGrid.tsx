"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearch } from "@/contexts/SearchContext";

// Assuming Video type is defined elsewhere
interface Video {
  id: string;
  title: string;
  thumbnail: string;
  link: string;
}

// Placeholder for VideoCard
const VideoCard = ({ video }: { video: Video }) => (
  <div className="border rounded-lg overflow-hidden shadow-lg">
    <div className="relative h-48 bg-gray-200"></div>
    <div className="p-4">
      <h3 className="text-lg font-bold">{video.title}</h3>
    </div>
  </div>
);

export default function VideoGrid() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [canLoadMore, setCanLoadMore] = useState(true);
  const { searchQuery } = useSearch();

  const fetchVideos = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const url = searchQuery
        ? `/api/videos?q=${searchQuery}&page=${page}`
        : `/api/videos?page=${page}`;
      const res = await fetch(url);
      const newVideos: Video[] = await res.json();
      if (newVideos.length > 0) {
        setVideos((prev) => (page === 1 ? newVideos : [...prev, ...newVideos]));
        if (newVideos.length < 24) {
          setCanLoadMore(false);
        }
      } else {
        if (page === 1) {
          setVideos([]);
        }
        setCanLoadMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch videos:", error);
    }
    setLoading(false);
  }, [page, loading, searchQuery]);

  useEffect(() => {
    setPage(1);
    setVideos([]);
    setCanLoadMore(true);
  }, [searchQuery]);

  useEffect(() => {
    fetchVideos();
  }, [page, searchQuery, fetchVideos]);

  const handleLoadMore = () => {
    if (!loading && canLoadMore) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
      {canLoadMore && (
        <div className="flex justify-center my-8">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-500"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}
