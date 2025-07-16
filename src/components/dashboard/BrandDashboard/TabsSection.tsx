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
    <div className="sticky top-0 z-40 mb-4 sm:mb-6 border-b-0 bg-white/95 backdrop-blur-sm rounded-t-2xl shadow-lg w-[calc(100%+1rem)] -mx-2 sm:mx-0 sm:w-full overflow-hidden">
      <div className="flex flex-row gap-px overflow-x-auto no-scrollbar w-full bg-white my-5 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('discover')}
          className={`relative flex-1 py-2.5 sm:py-3.5 px-1 cursor-pointer transition-all duration-300 ease-in-out ${
            activeTab === 'discover' 
              ? 'text-[#2B4B9B] font-medium bg-blue-50/60 shadow-sm border-t border-x border-blue-100 rounded-t-lg translate-y-[-1px]'
              : 'text-gray-600 hover:bg-black/5'
          }`}
        >
          <div className="flex flex-col items-center justify-center pb-[7px]">
            <span className="text-sm sm:text-base font-bold mb-1">
              Discover
            </span>
            <span className={`text-[10px] sm:text-xs ${activeTab === 'discover' ? 'text-[#2B4B9B]/70 font-medium' : 'text-gray-500'}`}>
              Events
            </span>
          </div>
          <span className={`absolute bottom-0 left-0 w-full h-[3px] bg-[#2B4B9B] transform transition-all duration-300 ${
            activeTab === 'discover' ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
          }`} style={{ bottom: '0' }} />
        </button>

        {/* discover influencer tab now hidden */}
        <button
          onClick={() => setActiveTab('influencers')}
          className={`relative flex-1 py-2.5 sm:py-3.5 px-1 cursor-pointer transition-all duration-300 ease-in-out ${
            activeTab === 'influencers' 
              ? 'text-purple-600 font-medium bg-purple-50/60 shadow-sm border-t border-x border-purple-100 rounded-t-lg translate-y-[-1px]'
              : 'text-gray-600 hover:bg-black/5'
          }`}
          style={{display:'none'}}
        >
          <div className="flex flex-col items-center justify-center pb-[7px]">
            <span className="text-sm sm:text-base font-bold mb-1">
              Discover
            </span>
            <span className={`text-[10px] sm:text-xs ${activeTab === 'influencers' ? 'text-purple-600/70 font-medium' : 'text-gray-500'}`}>
              Influencers
            </span>
          </div>
          <span className={`absolute bottom-0 left-0 w-full h-[3px] bg-purple-600 transform transition-all duration-300 ${
            activeTab === 'influencers' ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
          }`} style={{ bottom: '0' }} />
        </button>


        <button
          onClick={() => setActiveTab('matches')}
          className={`relative flex-1 py-2.5 sm:py-3.5 px-1 cursor-pointer transition-all duration-300 ease-in-out ${
            activeTab === 'matches' 
              ? 'text-green-600 font-medium bg-green-50/60 shadow-sm border-t border-x border-green-100 rounded-t-lg translate-y-[-1px]'
              : 'text-gray-600 hover:bg-black/5'
          }`}
        >
          <div className="flex flex-col items-center justify-center pb-[7px]">
            <span className="text-sm sm:text-base font-bold mb-1 flex items-center">
              Matches
              {pendingMatches.length > 0 && (
                <span className="inline-block ml-1.5 px-1.5 py-0.5 text-[9px] bg-gradient-to-r from-yellow-200 to-yellow-300 text-yellow-900 rounded-full shadow-sm font-medium">
                  {pendingMatches.length}
                </span>
              )}
            </span>
            <span className={`text-[10px] sm:text-xs ${activeTab === 'matches' ? 'text-green-600/70 font-medium' : 'text-gray-500'}`}>
              Your Connections
            </span>
          </div>
          <span className={`absolute bottom-0 left-0 w-full h-[3px] bg-green-600 transform transition-all duration-300 ${
            activeTab === 'matches' ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
          }`} style={{ bottom: '0' }} />
        </button>
      </div>
    </div>
  );
};

export default TabsSection;