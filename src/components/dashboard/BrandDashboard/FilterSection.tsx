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
          <h1 className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-white truncate mr-2">
            Brand Dashboard
          </h1>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={toggleFilters}
              className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 border border-gray-300 dark:border-white/10 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 shadow-sm hover:shadow-md transition-all duration-200 click-effect ${
                showFilters ? 'bg-blue-50 text-[#2B4B9B] border-[#2B4B9B] dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/30' : 'bg-white dark:bg-white/5'
              }`}
              title="Filters"
            >
              <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={handleSearchToggle}
              className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 border border-gray-300 dark:border-white/10 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 shadow-sm hover:shadow-md transition-all duration-200 click-effect ${
                showSearch ? 'bg-blue-50 text-[#2B4B9B] border-[#2B4B9B] dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/30' : 'bg-white dark:bg-white/5'
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
              className="w-full pl-8 pr-3 py-1.5 sm:py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-[#2B4B9B] dark:focus:ring-sky-400/50 focus:border-[#2B4B9B] dark:focus:border-sky-400 text-sm shadow-sm transition-all duration-200 bg-white dark:bg-white/5 dark:text-gray-100"
              autoFocus
            />
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
          </div>
        )}
      </div>

      {showFilters && (
        <div className="liquid-glass-card p-2.5 sm:p-4 rounded-lg mb-4 max-w-full overflow-hidden">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h3 className="font-medium text-xs sm:text-sm truncate pr-2 text-gray-800 dark:text-gray-200">
              Filter{' '}
              {activeTab === 'influencers' ? 'Influencer Posts' : activeTab === 'matches' ? 'Matches' : 'Opportunities'}
            </h3>
            <button
              onClick={resetFilters}
              className="text-xs sm:text-sm text-[#2B4B9B] dark:text-sky-400 hover:text-[#1a2f61] dark:hover:text-sky-300 hover:scale-105 active:scale-95 transition-all duration-200 whitespace-nowrap flex-shrink-0 font-medium click-effect"
            >
              Reset Filters
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="min-w-0">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 truncate">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 dark:border-white/10 bg-white dark:bg-slate-950/40 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400 text-xs sm:text-sm cursor-pointer click-effect"
              >
                <option value="" className="dark:bg-[#121212]">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id} className="dark:bg-[#121212]">
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {activeTab === 'matches' && (
              <div className="min-w-0">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 truncate">Status</label>
                <select
                  value={adTypeFilter}
                  onChange={(e) => setAdTypeFilter(e.target.value)}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 dark:border-white/10 bg-white dark:bg-slate-950/40 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400 text-xs sm:text-sm cursor-pointer click-effect"
                >
                  <option value="" className="dark:bg-[#121212]">All Statuses</option>
                  <option value="pending" className="dark:bg-[#121212]">Pending</option>
                  <option value="accepted" className="dark:bg-[#121212]">Accepted</option>
                  <option value="rejected" className="dark:bg-[#121212]">Rejected</option>
                </select>
              </div>
            )}

            {activeTab === 'influencers' && (
              <div className="min-w-0">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 truncate">Content Type</label>
                <select
                  value={adTypeFilter}
                  onChange={(e) => setAdTypeFilter(e.target.value)}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 dark:border-white/10 bg-white dark:bg-slate-950/40 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400 text-xs sm:text-sm cursor-pointer click-effect"
                >
                  <option value="" className="dark:bg-[#121212]">All Types</option>
                  <option value="photo" className="dark:bg-[#121212]">Photo</option>
                  <option value="video" className="dark:bg-[#121212]">Video</option>
                  <option value="article" className="dark:bg-[#121212]">Article</option>
                  <option value="review" className="dark:bg-[#121212]">Review</option>
                </select>
              </div>
            )}

            <div className="min-w-0">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 truncate">
                {activeTab === 'matches' ? 'Budget Range' : 'Price Range'}
              </label>
              <select
                value={priceRangeFilter}
                onChange={(e) => setPriceRangeFilter(e.target.value)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 dark:border-white/10 bg-white dark:bg-slate-950/40 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400 text-xs sm:text-sm cursor-pointer click-effect"
              >
                <option value="" className="dark:bg-[#121212]">Any Budget</option>
                <option value="0-10000" className="dark:bg-[#121212]">Under ₹10,000</option>
                <option value="10000-50000" className="dark:bg-[#121212]">₹10K - ₹50K</option>
                <option value="50000-100000" className="dark:bg-[#121212]">₹50K - ₹1L</option>
                <option value="100000-500000" className="dark:bg-[#121212]">₹1L - ₹5L</option>
                <option value="500000-1000000" className="dark:bg-[#121212]">₹5L - ₹10L</option>
                <option value="1000000-" className="dark:bg-[#121212]">Above ₹10L</option>
              </select>
            </div>

            <div className="min-w-0">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 truncate">Location</label>
              <input
                type="text"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                placeholder="Enter location..."
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 dark:border-white/10 bg-white dark:bg-slate-950/40 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400 text-xs sm:text-sm"
              />
            </div>

            {activeTab === 'matches' && (
              <div className="min-w-0">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 truncate">
                  Meeting Date
                </label>
                <input
                  type="date"
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 dark:border-white/10 bg-white dark:bg-slate-950/40 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400 text-xs sm:text-sm"
                />
              </div>
            )}
          </div>

          <div className="mt-3 sm:mt-4 min-w-0">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 truncate">Search</label>
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
                className="w-full pl-7 pr-3 py-1.5 sm:py-2 border border-gray-300 dark:border-white/10 bg-white dark:bg-slate-950/40 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400 text-xs sm:text-sm"
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