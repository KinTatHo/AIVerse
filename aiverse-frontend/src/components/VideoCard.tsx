// src/components/VideoCard.tsx
import React from 'react';

// Define the shape of the video prop, matching backend API response
interface YouTubeVideo {
  id: string;
  videoId: string;
  title: string;
  description: string | null;
  channelId: string | null;
  channelTitle: string | null;
  publishedAt: string | null; // ISO string
  thumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
  // topics?: string[]; // Optional topics field
}

interface VideoCardProps {
  video: YouTubeVideo;
}

// Reusable date formatter (can be moved to a utils file)
const formatDate = (dateString: string | null): string => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return '';
  }
};

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const formattedDate = formatDate(video.publishedAt);
  const youtubeVideoUrl = `https://www.youtube.com/watch?v=${video.videoId}`;

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-lg flex flex-col">
      {video.thumbnailUrl && (
        <a
          href={youtubeVideoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block aspect-video overflow-hidden" // Maintain aspect ratio
        >
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
            loading="lazy" // Lazy load images
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        </a>
      )}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-md font-semibold text-gray-800 mb-2 line-clamp-2 flex-grow">
          <a
            href={youtubeVideoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-700 hover:text-indigo-900 hover:underline"
          >
            {video.title}
          </a>
        </h3>

        <div className="text-xs text-gray-500 mt-auto pt-2">
          {video.channelTitle && (
            <span className="inline-block font-medium mr-2">{video.channelTitle}</span>
          )}
          {formattedDate && (
            <span className="inline-block">{formattedDate}</span>
          )}
        </div>

         {/* Optional: Display topics/tags if implemented */}
         {/* {video.topics && video.topics.length > 0 && (
            <div className="flex flex-wrap mt-2 -mx-1">
                {video.topics.map(topic => <span key={topic} className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full mx-1 mb-1">{topic}</span>)}
            </div>
         )} */}
      </div>
    </article>
  );
};

export default VideoCard;