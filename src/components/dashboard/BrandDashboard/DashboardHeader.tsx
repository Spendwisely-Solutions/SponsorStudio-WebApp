import React, { useState } from 'react';
import { Filter, Search, X } from 'lucide-react';

interface DashboardHeaderProps {
  activeTab: 'discover' | 'influencers' | 'matches';
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  activeTab,
  showFilters,
  setShowFilters,
  searchQuery = '',
  setSearchQuery,
}) => {
  const [showSearch, setShowSearch] = useState(false);

  const handleSearchToggle = () => {
    setShowSearch(!showSearch);
    if (showSearch && setSearchQuery) {
      setSearchQuery('');
    }
  };

  return (
    <div className="flex flex-col space-y-2 max-w-full overflow-hidden">
      <div className="flex justify-between items-center w-full">
        <h1 className="text-lg sm:text-2xl font-bold text-gray-800 truncate mr-2">Brand Dashboard</h1>
        {(activeTab === 'discover' || activeTab === 'influencers') && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 shadow-sm hover:shadow-md transition-all duration-200"
              title="Filters"
            >
              <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={handleSearchToggle}
              className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 shadow-sm hover:shadow-md transition-all duration-200"
              title="Search"
            >
              {showSearch ? <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>
          </div>
        )}
      </div>
      
      {/* Search Input Field */}
      {showSearch && (activeTab === 'discover' || activeTab === 'influencers') && (
        <div className="relative w-full overflow-hidden">
          <input
            type="text"
            placeholder={activeTab === 'discover' ? "Search opportunities..." : "Search posts..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4B9B] focus:border-[#2B4B9B] text-sm shadow-sm transition-all duration-200"
            autoFocus
          />
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
        </div>
      )}
    </div>
  );
};

export default DashboardHeader;