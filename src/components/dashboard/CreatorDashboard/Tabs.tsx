import React from 'react';

interface TabsProps {
  activeTab: 'opportunities' | 'matches';
  setActiveTab: (tab: 'opportunities' | 'matches') => void;
  pendingMatchesCount: number;
}

export default function Tabs({ activeTab, setActiveTab, pendingMatchesCount }: TabsProps) {
  return (
    <div className="mb-8">
      <div className="border-b border-gray-200 bg-white rounded-t-xl px-6">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('opportunities')}
            className={`py-4 px-2 -mb-px font-semibold text-sm transition-all duration-200 relative ${
              activeTab === 'opportunities'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
            }`}
          >
            Your Opportunities
            {activeTab === 'opportunities' && (
              <div className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-blue-600 rounded-full"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`py-4 px-2 -mb-px font-semibold text-sm transition-all duration-200 relative flex items-center ${
              activeTab === 'matches'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
            }`}
          >
            Brand Matches
            {pendingMatchesCount > 0 && (
              <span className="ml-2 px-2.5 py-1 text-xs bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-full font-bold shadow-sm animate-pulse">
                {pendingMatchesCount} new
              </span>
            )}
            {activeTab === 'matches' && (
              <div className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-blue-600 rounded-full"></div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}