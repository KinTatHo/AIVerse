import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import NewsCard from './NewsCard';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import FilterBar from './FilterBar';
import { NewsArticle } from '../constants/types'

const BACKEND_URL = 'http://localhost:3001';

const NewsList: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sortBy, setSortBy] = useState('publishedAt');
  const [order, setOrder] = useState('desc');
  const [selectedTopic, setSelectedTopic] = useState('');

  const fetchNews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    console.log(`Workspaceing news with: sortBy=${sortBy}, order=${order}, topic=${selectedTopic}`);
    try {
      const params = new URLSearchParams();
      params.append('sortBy', sortBy);
      params.append('order', order);
      if (selectedTopic && selectedTopic !== '') {
        params.append('topic', selectedTopic);
      }

      const response = await axios.get<NewsArticle[]>(`${BACKEND_URL}/api/news`, { params });
      setArticles(response.data);

    } catch (err: any) {
      console.error("Failed to fetch news:", err);
      const errorMessage = err.response?.data?.error || "Could not load news articles. Please check the connection or try again later.";
      setError(errorMessage);
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  }, [sortBy, order, selectedTopic]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleSortChange = (newSortBy: string, newOrder: string) => {
    setSortBy(newSortBy);
    setOrder(newOrder);
  };

  const handleTopicChange = (newTopic: string) => {
    setSelectedTopic(newTopic);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Latest AI News</h2>
      <FilterBar
        currentSortBy={sortBy}
        currentOrder={order}
        currentTopic={selectedTopic}
        onSortChange={handleSortChange}
        onTopicChange={handleTopicChange}
      />

      {isLoading && <LoadingSpinner />}

      {!isLoading && error && <ErrorMessage message={error} />}

      {!isLoading && !error && (
        <>
          <div className="mb-4 text-gray-600 text-sm font-medium">
            Showing {articles.length} article{articles.length !== 1 ? 's' : ''}
            {selectedTopic ? ` on topic "${selectedTopic}"` : ''}
            {` (sorted by ${sortBy === 'publishedAt' ? 'date' : sortBy}, ${order === 'desc' ? 'newest' : 'oldest'} first)`}
          </div>

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

          {articles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map(article => (
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