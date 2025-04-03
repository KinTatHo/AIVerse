import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import NewsCard from './NewsCard';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import FilterBar from './FilterBar'; // Import the FilterBar component

// Make sure this matches the data structure returned by your /api/news endpoint
// Add topics if your backend includes it now
interface NewsArticle {
  id: string;
  title: string;
  url: string;
  sourceName: string | null;
  description: string | null;
  publishedAt: string | null; // Comes as ISO string
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  topics?: string[]; // Add this if your backend sends topics
}

const BACKEND_URL = 'http://localhost:3001'; // Your backend server

const NewsList: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for filters - these will drive the API request
  const [sortBy, setSortBy] = useState('publishedAt'); // Default sort field
  const [order, setOrder] = useState('desc'); // Default sort order: newest first
  const [selectedTopic, setSelectedTopic] = useState(''); // Default topic: 'All Topics'

  // Callback function using useCallback to memoize it
  // Fetches news based on the current filter state
  const fetchNews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    console.log(`Workspaceing news with: sortBy=${sortBy}, order=${order}, topic=${selectedTopic}`); // Log parameters
    try {
      // Construct query parameters for the backend API call
      const params = new URLSearchParams();
      params.append('sortBy', sortBy);
      params.append('order', order);
      if (selectedTopic && selectedTopic !== '') { // Only add topic if it's not 'All'
        params.append('topic', selectedTopic);
      }

      // Make the API request with the constructed parameters
      const response = await axios.get<NewsArticle[]>(`${BACKEND_URL}/api/news`, { params });
      setArticles(response.data); // Update state with fetched articles

    } catch (err: any) {
      console.error("Failed to fetch news:", err);
      // Provide a more specific error message if possible
      const errorMessage = err.response?.data?.error || "Could not load news articles. Please check the connection or try again later.";
      setError(errorMessage);
      setArticles([]); // Clear articles on error to avoid showing stale data
    } finally {
      setIsLoading(false); // Stop loading indicator regardless of success/failure
    }
  }, [sortBy, order, selectedTopic]); // Dependencies: re-run fetchNews if these change

  // useEffect hook to call fetchNews on initial component mount and when filters change
  useEffect(() => {
    fetchNews();
  }, [fetchNews]); // Depends on the memoized fetchNews function

  // --- Filter Update Handlers ---
  // These functions update the state, which then triggers the useEffect hook -> fetchNews
  const handleSortChange = (newSortBy: string, newOrder: string) => {
    setSortBy(newSortBy);
    setOrder(newOrder);
  };

  const handleTopicChange = (newTopic: string) => {
    setSelectedTopic(newTopic);
  };

  // --- Render Logic ---
  return (
    <div className="container mx-auto px-4 py-6"> {/* Use consistent container if needed, or remove if parent handles it */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Latest AI News</h2>

      {/* Filter Bar Component */}
      <FilterBar
        currentSortBy={sortBy}
        currentOrder={order}
        currentTopic={selectedTopic}
        onSortChange={handleSortChange}
        onTopicChange={handleTopicChange}
      />

      {/* Loading State */}
      {isLoading && <LoadingSpinner />}

      {/* Error State */}
      {!isLoading && error && <ErrorMessage message={error} />}

      {/* Content Area (when not loading and no error) */}
      {!isLoading && !error && (
        <>
          {/* Results Count */}
          <div className="mb-4 text-gray-600 text-sm font-medium">
            Showing {articles.length} article{articles.length !== 1 ? 's' : ''}
            {selectedTopic ? ` on topic "${selectedTopic}"` : ''}
            {` (sorted by ${sortBy === 'publishedAt' ? 'date' : sortBy}, ${order === 'desc' ? 'newest' : 'oldest'} first)`}
          </div>

          {/* Empty State (when filters result in no articles) */}
          {articles.length === 0 && (
            <div className="bg-gray-50 rounded-lg p-6 text-center mt-6">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No articles match your criteria</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting the filters or check back later.
                </p>
            </div>
          )}

          {/* Articles Grid (only show if there are articles) */}
          {articles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map(article => (
                // Pass the article data (including topics if available) to NewsCard
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NewsList;