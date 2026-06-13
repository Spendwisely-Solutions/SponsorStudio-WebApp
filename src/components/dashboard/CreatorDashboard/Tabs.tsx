import React from 'react';

interface TabsProps {
  activeTab: 'opportunities' | 'matches';
  setActiveTab: (tab: 'opportunities' | 'matches') => void;
  pendingMatchesCount: number;
}

export default function Tabs({ activeTab, setActiveTab, pendingMatchesCount }: TabsProps) {
  return (
    <div className="mb-8">
      <div className="border-b border-border bg-surface px-6 rounded-t-xl">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('opportunities')}
            className={`py-4 px-2 -mb-px font-semibold text-sm transition-all duration-200 relative ${
              activeTab === 'opportunities'
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-secondary hover:text-text-primary hover:border-b-2 hover:border-border'
            }`}
          >
            Your Opportunities
            {activeTab === 'opportunities' && (
              <div className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-primary rounded-full"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`py-4 px-2 -mb-px font-semibold text-sm transition-all duration-200 relative flex items-center ${
              activeTab === 'matches'
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-secondary hover:text-text-primary hover:border-b-2 hover:border-border'
            }`}
          >
            Brand Matches
            {pendingMatchesCount > 0 && (
              <span className="ml-2 px-2.5 py-1 text-xs bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-full font-bold shadow-sm animate-pulse">
                {pendingMatchesCount} new
              </span>
            )}
            {activeTab === 'matches' && (
              <div className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-primary rounded-full"></div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}