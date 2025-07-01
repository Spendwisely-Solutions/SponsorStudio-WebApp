import React from 'react';
import {
  Calendar,
  Clock,
  Check,
  X,
  TrendingUp,
  TrendingDown,
  Activity,
} from 'lucide-react';
import type { Database } from '../../../lib/database.types';

type Opportunity = Database['public']['Tables']['opportunities']['Row'];
type Match = Database['public']['Tables']['matches']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row'];
  opportunities?: Database['public']['Tables']['opportunities']['Row'];
};

interface StatsCardsProps {
  opportunities: Opportunity[];
  pendingMatches: Match[];
  acceptedMatches: Match[];
  rejectedMatches: Match[];
  loading: boolean;
}

export default function StatsCards({
  opportunities,
  pendingMatches,
  acceptedMatches,
  rejectedMatches,
  loading,
}: StatsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array(4)
          .fill(0)
          .map((_, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-5 bg-gray-200 rounded w-24"></div>
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                </div>
                <div className="h-9 bg-gray-200 rounded w-16 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
      </div>
    );
  }

  const activeOpportunities = opportunities.filter((o) => o.status === 'active').length;
  const completionRate = acceptedMatches.length + rejectedMatches.length > 0 
    ? Math.round((acceptedMatches.length / (acceptedMatches.length + rejectedMatches.length)) * 100)
    : 0;

  const statsData = [
    {
      title: 'Total Opportunities',
      value: opportunities.length,
      subtitle: `${activeOpportunities} active`,
      icon: Calendar,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      hoverColor: 'hover:border-blue-200',
      trend: null,
    },
    {
      title: 'Pending Matches',
      value: pendingMatches.length,
      subtitle: 'Awaiting your response',
      icon: Clock,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
      hoverColor: 'hover:border-amber-200',
      trend: pendingMatches.length > 0 ? { type: 'up', value: 'New matches available' } : null,
    },
    {
      title: 'Accepted Matches',
      value: acceptedMatches.length,
      subtitle: 'Confirmed partnerships',
      icon: Check,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      hoverColor: 'hover:border-emerald-200',
      trend: acceptedMatches.length > 0 ? { type: 'up', value: `${completionRate}% success rate` } : null,
    },
    {
      title: 'Rejected Matches',
      value: rejectedMatches.length,
      subtitle: 'Declined partnerships',
      icon: X,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-100',
      hoverColor: 'hover:border-red-200',
      trend: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={index}
            className={`bg-white p-6 rounded-xl shadow-sm border-2 ${stat.borderColor} ${stat.hoverColor} 
              transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                {stat.title}
              </h3>
              <div className={`p-3 ${stat.bgColor} rounded-xl group-hover:scale-110 transition-transform duration-200`}>
                <IconComponent className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="text-3xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                {stat.value}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors">
                  {stat.subtitle}
                </span>
                
                {stat.trend && (
                  <div className="flex items-center space-x-1">
                    {stat.trend.type === 'up' ? (
                      <TrendingUp className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-500" />
                    )}
                    <span className={`text-xs font-medium ${
                      stat.trend.type === 'up' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {stat.trend.value}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}