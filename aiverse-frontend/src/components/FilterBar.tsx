// src/components/FilterBar.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = 'http://localhost:3001';

interface FilterBarProps {
  // Current filter values
  currentSortBy: string;
  currentOrder: string;
  currentTopic: string;
  // Callback functions to update filters in parent
  onSortChange: (sortBy: string, order: string) => void;
  onTopicChange: (topic: string) => void;
  // Optional: Add search query handling if needed
  // currentSearchQuery: string;
  // onSearchChange: (query: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  currentSortBy,
  currentOrder,
  currentTopic,
  onSortChange,
  onTopicChange,
}) => {
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);

  // Fetch available topics from the backend when the component mounts
  useEffect(() => {
    const fetchTopics = async () => {
      setIsLoadingTopics(true);
      try {
        // Assuming you created the /api/topics endpoint in the backend
        const response = await axios.get<string[]>(`${BACKEND_URL}/api/topics`);
        // Add an "All Topics" option
        setAvailableTopics(['', ...response.data.sort()]); // Add empty string for "All"
      } catch (error) {
        console.error("Failed to fetch topics:", error);
        setAvailableTopics(['']); // Fallback to only "All" option
      } finally {
        setIsLoadingTopics(false);
      }
    };
    fetchTopics();
  }, []);

  const handleSortOrderChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value; // e.g., "publishedAt-desc"
    const [sortBy, order] = value.split('-');
    onSortChange(sortBy, order);
  };

  const handleTopicSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      onTopicChange(event.target.value);
  }

  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-6 shadow-sm flex flex-wrap items-center gap-4">
       {/* Sort Order Selector */}
       <div className="flex-shrink-0">
         <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mr-2">
           Sort by:
         </label>
         <select
           id="sortOrder"
           name="sortOrder"
           className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
           value={`${currentSortBy}-${currentOrder}`} // Combine value for selection
           onChange={handleSortOrderChange}
         >
           <option value="publishedAt-desc">Newest First</option>
           <option value="publishedAt-asc">Oldest First</option>
           {/* Add other sort options if backend supports them, e.g., createdAt */}
           {/* <option value="createdAt-desc">Most Recently Added</option> */}
         </select>
       </div>

        {/* Topic Selector */}
        <div className="flex-shrink-0">
            <label htmlFor="topicFilter" className="block text-sm font-medium text-gray-700 mr-2">
                Topic:
            </label>
            <select
                id="topicFilter"
                name="topicFilter"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
                value={currentTopic}
                onChange={handleTopicSelectChange}
                disabled={isLoadingTopics || availableTopics.length <= 1} // Disable if loading or only "All"
            >
                {isLoadingTopics ? (
                    <option>Loading topics...</option>
                ) : (
                    availableTopics.map(topic => (
                        <option key={topic} value={topic}>
                            {topic === '' ? 'All Topics' : topic}
                        </option>
                    ))
                )}
            </select>
        </div>

        {/* Optional: Add Text Search Input here if you want it integrated */}
        {/* <div className="flex-grow"> ... text search input ... </div> */}
    </div>
  );
};

export default FilterBar;