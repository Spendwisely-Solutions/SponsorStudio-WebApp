import React from 'react';
import type { Match } from './types';

interface TabsSectionProps {
  activeTab: 'discover' | 'influencers' | 'matches';
  setActiveTab: (tab: 'discover' | 'influencers' | 'matches') => void;
  pendingMatches: Match[];
}

const TabsSection: React.FC<TabsSectionProps> = ({
  activeTab,
  setActiveTab,
  pendingMatches,
}) => {
  return (
    <div className="mb-4 border-b border-gray-200">
      <div className="flex flex-row gap-1 sm:gap-6 overflow-x-auto scrollbar-hide min-w-fit">
        <button
          onClick={() => setActiveTab('discover')}
          className={`relative py-1.5 px-1.5 sm:px-3 font-medium text-[10px] sm:text-sm flex items-center space-x-0.5 sm:space-x-1 transition-all duration-200 ${
            activeTab === 'discover'
              ? 'text-[#2B4B9B] font-semibold'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
          } max-[400px]:flex-col max-[400px]:items-center max-[400px]:space-x-0 min-w-fit`}
        >
          <span className="truncate">Discover Opportunities</span>
          {/* <span className="truncate max-[400px]:mt-0.5"></span> */}
          {activeTab === 'discover' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2B4B9B] rounded-t-full transition-all duration-200" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('influencers')}
          className={`relative py-1.5 px-1.5 sm:px-3 font-medium text-[10px] sm:text-sm flex items-center space-x-0.5 sm:space-x-1 transition-all duration-200 ${
            activeTab === 'influencers'
              ? 'text-[#2B4B9B] font-semibold'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
          } max-[400px]:flex-col max-[400px]:items-center max-[400px]:space-x-0 min-w-fit`}
          style={{ display:'none' }}
        >
          <span className="truncate">Discover Influencers</span>
          <span className="truncate max-[400px]:mt-0.5"></span>
          {activeTab === 'influencers' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2B4B9B] rounded-t-full transition-all duration-200" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('matches')}
          className={`relative py-1.5 px-1.5 sm:px-3 font-medium text-[10px] sm:text-sm flex items-center space-x-0.5 sm:space-x-1 transition-all duration-200 ${
            activeTab === 'matches'
              ? 'text-[#2B4B9B] font-semibold'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
          } max-[400px]:flex-col max-[400px]:items-center max-[400px]:space-x-0 min-w-fit`}
        >
          <span className="truncate">Your Matches</span>
          {/* <span className="truncate max-[400px]:mt-0.5"></span> */}
          {pendingMatches.length > 0 && (
            <span className="ml-0.5 sm:ml-1.5 px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-xs bg-gradient-to-r from-yellow-200 to-yellow-300 text-yellow-900 rounded-full shadow-sm max-[400px]:mt-0.5">
              {pendingMatches.length} pending
            </span>
          )}
          {activeTab === 'matches' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2B4B9B] rounded-t-full transition-all duration-200" />
          )}
        </button>
      </div>
    </div>
  );
};

export default TabsSection;