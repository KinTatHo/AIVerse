import React from 'react';

interface NewsArticle {
  id: string;
  title: string;
  url: string;
  sourceName: string | null;
  description: string | null;
  publishedAt: string | null;
  imageUrl: string | null;
  // topics?: string[];
}

interface NewsCardProps {
  article: NewsArticle;
}

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

const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  const formattedDate = formatDate(article.publishedAt);

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-lg">
      {article.imageUrl && (
        <div className="w-full h-48 overflow-hidden">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">
          <a 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-indigo-700 hover:text-indigo-900 hover:underline"
          >
            {article.title}
          </a>
        </h3>
        
        <div className="flex items-center text-sm text-gray-500 mb-3">
          {article.sourceName && (
            <span className="inline-block font-medium">{article.sourceName}</span>
          )}
          {article.sourceName && formattedDate && (
            <span className="mx-2">&middot;</span>
          )}
          {formattedDate && (
            <span className="inline-block">{formattedDate}</span>
          )}
        </div>
        
        {article.description && (
          <p className="text-gray-600 text-sm line-clamp-3 mb-4">
            {article.description}
          </p>
        )}
        
        <a 
          href={article.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          Read More
          <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
        
        {/* Uncomment when implementing topics */}
        {/* {article.topics && article.topics.length > 0 && (
          <div className="flex flex-wrap mt-3 -mx-1">
            {article.topics.map(topic => (
              <span 
                key={topic} 
                className="bg-indigo-50 text-indigo-600 text-xs px-2 py-1 rounded-full mx-1 mb-1"
              >
                {topic}
              </span>
            ))}
          </div>
        )} */}
      </div>
    </article>
  );
};

export default NewsCard;