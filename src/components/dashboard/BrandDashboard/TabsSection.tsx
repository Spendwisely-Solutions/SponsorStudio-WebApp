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
    <div className="sticky top-0 z-40 mb-4 sm:mb-6 border-b-0 bg-surface/95 backdrop-blur-sm rounded-t-2xl shadow-lg w-[calc(100%+1rem)] -mx-2 sm:mx-0 sm:w-full overflow-hidden">
      <div className="flex flex-row gap-px overflow-x-auto no-scrollbar w-full bg-surface my-5 border-b border-border">
        <button
          onClick={() => setActiveTab('discover')}
          className={`relative flex-1 py-2.5 sm:py-3.5 px-1 cursor-pointer transition-all duration-300 ease-in-out ${
            activeTab === 'discover' 
              ? 'text-primary font-medium bg-primary/10 shadow-sm border-t border-x border-primary/20 rounded-t-lg translate-y-[-1px]'
              : 'text-text-secondary hover:bg-surface-hover'
          }`}
        >
          <div className="flex flex-col items-center justify-center pb-[7px]">
            <span className="text-sm sm:text-base font-bold mb-1">
              Discover
            </span>
            <span className={`text-[10px] sm:text-xs ${activeTab === 'discover' ? 'text-primary/70 font-medium' : 'text-text-muted'}`}>
              Events
            </span>
          </div>
          <span className={`absolute bottom-0 left-0 w-full h-[3px] bg-primary transform transition-all duration-300 ${
            activeTab === 'discover' ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
          }`} style={{ bottom: '0' }} />
        </button>

        {/* discover influencer tab now hidden */}
        <button
          onClick={() => setActiveTab('influencers')}
          className={`relative flex-1 py-2.5 sm:py-3.5 px-1 cursor-pointer transition-all duration-300 ease-in-out ${
            activeTab === 'influencers' 
              ? 'text-purple-600 font-medium bg-purple-50/15 shadow-sm border-t border-x border-purple-200/20 rounded-t-lg translate-y-[-1px]'
              : 'text-text-secondary hover:bg-surface-hover'
          }`}
          style={{display:'none'}}
        >
          <div className="flex flex-col items-center justify-center pb-[7px]">
            <span className="text-sm sm:text-base font-bold mb-1">
              Discover
            </span>
            <span className={`text-[10px] sm:text-xs ${activeTab === 'influencers' ? 'text-purple-600/70 font-medium' : 'text-text-muted'}`}>
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
              ? 'text-success font-medium bg-success/15 shadow-sm border-t border-x border-success/20 rounded-t-lg translate-y-[-1px]'
              : 'text-text-secondary hover:bg-surface-hover'
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
            <span className={`text-[10px] sm:text-xs ${activeTab === 'matches' ? 'text-success/70 font-medium' : 'text-text-muted'}`}>
              Your Connections
            </span>
          </div>
          <span className={`absolute bottom-0 left-0 w-full h-[3px] bg-success transform transition-all duration-300 ${
            activeTab === 'matches' ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
          }`} style={{ bottom: '0' }} />
        </button>
      </div>
    </div>
  );
};

export default TabsSection;