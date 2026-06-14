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
    <div className="sticky top-0 z-40 mb-4 sm:mb-6 border-b-0 liquid-glass-card rounded-t-2xl w-[calc(100%+1rem)] -mx-2 sm:mx-0 sm:w-full overflow-hidden">
      <div className="flex flex-row gap-px overflow-x-auto no-scrollbar w-full bg-surface dark:bg-transparent border-b border-border dark:border-white/5">
        <button
          onClick={() => setActiveTab('discover')}
          className={`relative flex-1 py-3 sm:py-4 px-1 cursor-pointer transition-all duration-300 ease-in-out click-effect ${
            activeTab === 'discover' 
              ? 'text-primary dark:text-sky-400 font-medium bg-primary/10 dark:bg-sky-500/10 shadow-sm border-t border-x border-primary/20 dark:border-sky-500/25 rounded-t-lg translate-y-[-1px]'
              : 'text-text-secondary dark:text-gray-400 hover:bg-surface-hover dark:hover:bg-white/5 rounded-t-lg hover:scale-[1.01]'
          }`}
        >
          <div className="flex flex-col items-center justify-center pb-1">
            <span className="text-sm sm:text-base font-bold mb-1">
              Discover
            </span>
            <span className={`text-[10px] sm:text-xs ${activeTab === 'discover' ? 'text-primary/70 dark:text-sky-400/70 font-medium' : 'text-text-muted dark:text-gray-500'}`}>
              Events
            </span>
          </div>
          <span className={`absolute bottom-0 left-0 w-full h-[3px] bg-primary dark:bg-sky-400 transform transition-all duration-300 ${
            activeTab === 'discover' ? 'opacity-100 scale-x-100 shadow-[0_0_8px_#38bdf8]' : 'opacity-0 scale-x-0'
          }`} style={{ bottom: '0' }} />
        </button>

        {/* discover influencer tab now hidden */}
        <button
          onClick={() => setActiveTab('influencers')}
          className={`relative flex-1 py-3 sm:py-4 px-1 cursor-pointer transition-all duration-300 ease-in-out click-effect ${
            activeTab === 'influencers' 
              ? 'text-purple-600 dark:text-fuchsia-400 font-medium bg-purple-50/15 dark:bg-fuchsia-500/10 shadow-sm border-t border-x border-purple-200/20 dark:border-fuchsia-500/25 rounded-t-lg translate-y-[-1px]'
              : 'text-text-secondary dark:text-gray-400 hover:bg-surface-hover dark:hover:bg-white/5 rounded-t-lg hover:scale-[1.01]'
          }`}
          style={{display:'none'}}
        >
          <div className="flex flex-col items-center justify-center pb-1">
            <span className="text-sm sm:text-base font-bold mb-1">
              Discover
            </span>
            <span className={`text-[10px] sm:text-xs ${activeTab === 'influencers' ? 'text-purple-600/70 dark:text-fuchsia-400/70 font-medium' : 'text-text-muted dark:text-gray-500'}`}>
              Influencers
            </span>
          </div>
          <span className={`absolute bottom-0 left-0 w-full h-[3px] bg-purple-600 dark:bg-fuchsia-400 transform transition-all duration-300 ${
            activeTab === 'influencers' ? 'opacity-100 scale-x-100 shadow-[0_0_8px_#e879f9]' : 'opacity-0 scale-x-0'
          }`} style={{ bottom: '0' }} />
        </button>


        <button
          onClick={() => setActiveTab('matches')}
          className={`relative flex-1 py-3 sm:py-4 px-1 cursor-pointer transition-all duration-300 ease-in-out click-effect ${
            activeTab === 'matches' 
              ? 'text-success dark:text-emerald-400 font-medium bg-success/15 dark:bg-emerald-500/10 shadow-sm border-t border-x border-success/20 dark:border-emerald-500/25 rounded-t-lg translate-y-[-1px]'
              : 'text-text-secondary dark:text-gray-400 hover:bg-surface-hover dark:hover:bg-white/5 rounded-t-lg hover:scale-[1.01]'
          }`}
        >
          <div className="flex flex-col items-center justify-center pb-1">
            <span className="text-sm sm:text-base font-bold mb-1 flex items-center">
              Matches
              {pendingMatches.length > 0 && (
                <span className="inline-block ml-1.5 px-1.5 py-0.5 text-[9px] bg-gradient-to-r from-yellow-200 to-yellow-300 dark:from-yellow-500/20 dark:to-yellow-400/20 text-yellow-900 dark:text-yellow-400 rounded-full shadow-sm dark:shadow-[0_0_10px_rgba(234,179,8,0.1)] font-medium border dark:border-yellow-500/30">
                  {pendingMatches.length}
                </span>
              )}
            </span>
            <span className={`text-[10px] sm:text-xs ${activeTab === 'matches' ? 'text-success/70 dark:text-emerald-400/70 font-medium' : 'text-text-muted dark:text-gray-500'}`}>
              Your Connections
            </span>
          </div>
          <span className={`absolute bottom-0 left-0 w-full h-[3px] bg-success dark:bg-emerald-400 transform transition-all duration-300 ${
            activeTab === 'matches' ? 'opacity-100 scale-x-100 shadow-[0_0_8px_#34d399]' : 'opacity-0 scale-x-0'
          }`} style={{ bottom: '0' }} />
        </button>
      </div>
    </div>
  );
};

export default TabsSection;