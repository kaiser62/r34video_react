"use client";

import { useState, useEffect } from "react";
import { useSearch } from "@/contexts/SearchContext";

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  link: string;
  is_hd: string;
  duration: string;
  tags: string[];
}

interface VideoModalProps {
  video: Video;
  onClose: () => void;
}

interface VideoQuality {
  label: string;
  url: string;
}

export default function VideoModal({ video, onClose }: VideoModalProps) {
  const [showAllTags, setShowAllTags] = useState(false);
  const [videoQualities, setVideoQualities] = useState<VideoQuality[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<VideoQuality | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedTags, setResolvedTags] = useState<string[]>([]);
  const [resolvedTitle, setResolvedTitle] = useState<string>("");
  const { setSearchQuery } = useSearch();

  useEffect(() => {
    const fetchVideoData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/resolve?url=${encodeURIComponent(video.link)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch video data');
        }
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        const qualities: VideoQuality[] = [];
        if (data.streams && Object.keys(data.streams).length > 0) {
          Object.entries(data.streams).forEach(([quality, url]) => {
            qualities.push({ label: quality, url: url as string });
          });
        }
        
        if (qualities.length === 0) {
          throw new Error('No video streams found');
        }
        
        setVideoQualities(qualities);
        setSelectedQuality(qualities[0] || null);
        
        // Set resolved tags and title
        setResolvedTags(data.tags || []);
        setResolvedTitle(data.title || video.title);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchVideoData();
  }, [video.link, video.title]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleTagClick = (tag: string) => {
    // Close modal and search for this tag
    onClose();
    setSearchQuery(tag);
  };

  const tagsToDisplay = resolvedTags.length > 0 ? resolvedTags : video.tags;
  const visibleTags = showAllTags ? tagsToDisplay : tagsToDisplay.slice(0, 5);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto border border-gray-700">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold truncate mr-4 text-gray-100">{resolvedTitle || video.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-2xl leading-none transition-colors"
          >
            ×
          </button>
        </div>
        
        <div className="p-6">
          <div className="aspect-video bg-gray-900 rounded-lg mb-6 relative">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}
            
            {error && (
              <div className="absolute inset-0 flex items-center justify-center text-white text-center p-4">
                <div>
                  <p className="mb-2">Failed to load video</p>
                  <p className="text-sm text-gray-300">{error}</p>
                </div>
              </div>
            )}
            
            {selectedQuality && !loading && !error && (
              <video
                src={`/api/stream?url=${encodeURIComponent(selectedQuality.url)}`}
                controls
                className="w-full h-full"
                poster={video.thumbnail}
                preload="metadata"
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
          
          {videoQualities.length > 1 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Quality:
              </label>
              <select
                value={selectedQuality?.label || ''}
                onChange={(e) => {
                  const quality = videoQualities.find(q => q.label === e.target.value);
                  setSelectedQuality(quality || null);
                }}
                className="block w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {videoQualities.map((quality) => (
                  <option key={quality.label} value={quality.label}>
                    {quality.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2 text-gray-100">Tags</h3>
            {tagsToDisplay.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {visibleTags.map((tag, index) => (
                  <button
                    key={index}
                    onClick={() => handleTagClick(tag)}
                    className="inline-block bg-blue-600 text-blue-100 text-sm px-3 py-1 rounded-full hover:bg-blue-500 transition-colors cursor-pointer"
                    title={`Search for "${tag}"`}
                  >
                    {tag}
                  </button>
                ))}
                {tagsToDisplay.length > 5 && (
                  <button
                    onClick={() => setShowAllTags(!showAllTags)}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                  >
                    {showAllTags ? 'Show less' : `Show ${tagsToDisplay.length - 5} more`}
                  </button>
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">{loading ? 'Loading tags...' : 'No tags available'}</p>
            )}
          </div>
          
          <div className="text-sm text-gray-300 space-y-1">
            {video.duration && (
              <p><strong>Duration:</strong> {video.duration}</p>
            )}
            {video.is_hd && (
              <p><strong>Quality:</strong> HD</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}