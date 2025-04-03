// src/components/VideoList.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VideoCard from './VideoCard';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

// Define the video type matching the backend API response
interface YouTubeVideo {
    id: string;
    videoId: string;
    title: string;
    description: string | null;
    channelId: string | null;
    channelTitle: string | null;
    publishedAt: string | null;
    thumbnailUrl: string | null;
    createdAt: string;
    updatedAt: string;
    // topics?: string[];
}

const BACKEND_URL = 'http://localhost:3001'; // Your backend server

const VideoList: React.FC = () => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get<YouTubeVideo[]>(`${BACKEND_URL}/api/videos`);
        setVideos(response.data);
      } catch (err) {
        console.error("Failed to fetch videos:", err);
        setError("Could not load videos. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []); // Fetch only once on mount

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="container mx-auto px-4 py-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Latest AI Videos</h2>
         {videos.length === 0 && !isLoading && (
             <div className="bg-gray-50 rounded-lg p-6 text-center">
                 {/* Consider adding a video-specific icon */}
                 <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                 </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No videos found</h3>
                <p className="mt-1 text-sm text-gray-500">Check back later for new content.</p>
            </div>
         )}

        {/* Videos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {videos.map(video => (
            <VideoCard key={video.id} video={video} />
            ))}
        </div>
    </div>
  );
};

export default VideoList;