import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import type { Category } from './types';
import { useLocation } from 'react-router-dom'; // Import useLocation

interface FilterSectionProps {
  showFilters: boolean;
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  adTypeFilter: string;
  setAdTypeFilter: (value: string) => void;
  priceRangeFilter: string;
  setPriceRangeFilter: (value: string) => void;
  locationSearch: string;
  setLocationSearch: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  resetFilters: () => void;
  toggleFilters: () => void;
  isInfluencerTab: boolean;
  activeTab?: 'discover' | 'influencers' | 'matches';
}

const FilterSection: React.FC<FilterSectionProps> = ({
  showFilters,
  categories,
  selectedCategory,
  setSelectedCategory,
  adTypeFilter,
  setAdTypeFilter,
  priceRangeFilter,
  setPriceRangeFilter,
  locationSearch,
  setLocationSearch,
  searchQuery,
  setSearchQuery,
  resetFilters,
  toggleFilters,
  isInfluencerTab,
  activeTab = 'discover',
}) => {
  const location = useLocation();
  const [showSearch, setShowSearch] = useState(false);

  // Show search input if there's a search query in the URL or state
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search') || '';
    if (searchParam || searchQuery) {
      setShowSearch(true);
    }
  }, [location.search, searchQuery]);

  const handleSearchToggle = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchQuery('');
      // Clear search query from URL
      window.history.replaceState(null, '', '/dashboard');
    }
  };

  return (
    <>
      <div className="flex flex-col space-y-2 max-w-full overflow-hidden">
        <div className="flex justify-between items-center w-full mb-3">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-800 truncate mr-2">
            Brand Dashboard
          </h1>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={toggleFilters}
              className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 shadow-sm hover:shadow-md transition-all duration-200 ${
                showFilters ? 'bg-blue-50 text-[#2B4B9B] border-[#2B4B9B]' : 'bg-white'
              }`}
              title="Filters"
            >
              <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={handleSearchToggle}
              className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 shadow-sm hover:shadow-md transition-all duration-200 ${
                showSearch ? 'bg-blue-50 text-[#2B4B9B] border-[#2B4B9B]' : 'bg-white'
              }`}
              title="Search"
            >
              {showSearch ? <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>
          </div>
        </div>

        {/* Search Input Field */}
        {showSearch && (
          <div className="relative w-full overflow-hidden">
            <input
              type="text"
              placeholder={
                activeTab === 'influencers'
                  ? 'Search posts...'
                  : activeTab === 'matches'
                  ? 'Search matches...'
                  : 'Search opportunities...'
              }
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                // Update URL with search query
                const params = new URLSearchParams(location.search);
                if (e.target.value) {
                  params.set('search', e.target.value);
                } else {
                  params.delete('search');
                }
                window.history.replaceState(null, '', `/dashboard${params.toString() ? `?${params.toString()}` : ''}`);
              }}
              className="w-full pl-8 pr-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4B9B] focus:border-[#2B4B9B] text-sm shadow-sm transition-all duration-200"
              autoFocus
            />
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
          </div>
        )}
      </div>

      {showFilters && (
        <div className="bg-white p-2.5 sm:p-4 rounded-lg shadow-sm mb-4 max-w-full overflow-hidden">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h3 className="font-medium text-xs sm:text-sm truncate pr-2">
              Filter{' '}
              {activeTab === 'influencers' ? 'Influencer Posts' : activeTab === 'matches' ? 'Matches' : 'Opportunities'}
            </h3>
            <button
              onClick={resetFilters}
              className="text-xs sm:text-sm text-[#2B4B9B] hover:text-[#1a2f61] whitespace-nowrap flex-shrink-0"
            >
              Reset Filters
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="min-w-0">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 truncate">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-[#2B4B9B] focus:border-[#2B4B9B] text-xs sm:text-sm"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {activeTab === 'matches' && (
              <div className="min-w-0">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 truncate">Status</label>
                <select
                  value={adTypeFilter}
                  onChange={(e) => setAdTypeFilter(e.target.value)}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-[#2B4B9B] focus:border-[#2B4B9B] text-xs sm:text-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            )}

            {activeTab === 'influencers' && (
              <div className="min-w-0">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 truncate">Content Type</label>
                <select
                  value={adTypeFilter}
                  onChange={(e) => setAdTypeFilter(e.target.value)}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-[#2B4B9B] focus:border-[#2B4B9B] text-xs sm:text-sm"
                >
                  <option value="">All Types</option>
                  <option value="photo">Photo</option>
                  <option value="video">Video</option>
                  <option value="article">Article</option>
                  <option value="review">Review</option>
                </select>
              </div>
            )}

            <div className="min-w-0">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 truncate">
                {activeTab === 'matches' ? 'Budget Range' : 'Price Range'}
              </label>
              <select
                value={priceRangeFilter}
                onChange={(e) => setPriceRangeFilter(e.target.value)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-[#2B4B9B] focus:border-[#2B4B9B] text-xs sm:text-sm"
              >
                <option value="">Any Budget</option>
                <option value="0-10000">Under ₹10,000</option>
                <option value="10000-50000">₹10K - ₹50K</option>
                <option value="50000-100000">₹50K - ₹1L</option>
                <option value="100000-500000">₹1L - ₹5L</option>
                <option value="500000-1000000">₹5L - ₹10L</option>
                <option value="1000000-">Above ₹10L</option>
              </select>
            </div>

            <div className="min-w-0">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 truncate">Location</label>
              <input
                type="text"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                placeholder="Enter location..."
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-[#2B4B9B] focus:border-[#2B4B9B] text-xs sm:text-sm"
              />
            </div>

            {activeTab === 'matches' && (
              <div className="min-w-0">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 truncate">
                  Meeting Date
                </label>
                <input
                  type="date"
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-[#2B4B9B] focus:border-[#2B4B9B] text-xs sm:text-sm"
                />
              </div>
            )}
          </div>

          <div className="mt-3 sm:mt-4 min-w-0">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 truncate">Search</label>
            <div className="relative overflow-hidden">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  // Update URL with search query
                  const params = new URLSearchParams(location.search);
                  if (e.target.value) {
                    params.set('search', e.target.value);
                  } else {
                    params.delete('search');
                  }
                  window.history.replaceState(null, '', `/dashboard${params.toString() ? `?${params.toString()}` : ''}`);
                }}
                placeholder={
                  activeTab === 'influencers'
                    ? 'Search by influencer name or content...'
                    : activeTab === 'matches'
                    ? 'Search by event name or brand...'
                    : 'Search by title or description...'
                }
                className="w-full pl-7 pr-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-[#2B4B9B] focus:border-[#2B4B9B] text-xs sm:text-sm"
              />
              <Search className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FilterSection;