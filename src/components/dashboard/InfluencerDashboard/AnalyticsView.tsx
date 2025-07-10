import { TrendingUp, TrendingDown, Eye, Heart, MessageCircle, Share2, BarChart3, PieChart as PieChartIcon } from 'lucide-react';

interface AnalyticsData {
  monthlyViews: Array<{ month: string; views: number; engagements: number }>;
  categoryPerformance: Array<{ category: string; posts: number; matches: number }>;
  engagementMetrics: {
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    avgEngagementRate: number;
  };
  growthMetrics: {
    viewsGrowth: number;
    matchesGrowth: number;
    engagementGrowth: number;
  };
}

interface AnalyticsViewProps {
  data: AnalyticsData;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function AnalyticsView({ data }: AnalyticsViewProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUp className="w-4 h-4 text-green-600" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-600" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-full">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex items-center gap-1">
              {getGrowthIcon(data.growthMetrics.viewsGrowth)}
              <span className={`text-sm ${getGrowthColor(data.growthMetrics.viewsGrowth)}`}>
                {Math.abs(data.growthMetrics.viewsGrowth)}%
              </span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {formatNumber(data.engagementMetrics.totalViews)}
          </h3>
          <p className="text-sm text-gray-500">Total Views</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-100 rounded-full">
              <Heart className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex items-center gap-1">
              {getGrowthIcon(data.growthMetrics.engagementGrowth)}
              <span className={`text-sm ${getGrowthColor(data.growthMetrics.engagementGrowth)}`}>
                {Math.abs(data.growthMetrics.engagementGrowth)}%
              </span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {formatNumber(data.engagementMetrics.totalLikes)}
          </h3>
          <p className="text-sm text-gray-500">Total Likes</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-full">
              <MessageCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex items-center gap-1">
              {getGrowthIcon(data.growthMetrics.matchesGrowth)}
              <span className={`text-sm ${getGrowthColor(data.growthMetrics.matchesGrowth)}`}>
                {Math.abs(data.growthMetrics.matchesGrowth)}%
              </span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {formatNumber(data.engagementMetrics.totalComments)}
          </h3>
          <p className="text-sm text-gray-500">Total Comments</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-full">
              <Share2 className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-sm text-gray-500">
              {data.engagementMetrics.avgEngagementRate.toFixed(1)}% avg
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {formatNumber(data.engagementMetrics.totalShares)}
          </h3>
          <p className="text-sm text-gray-500">Total Shares</p>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Performance */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Monthly Performance</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Monthly performance chart</p>
              <p className="text-sm text-gray-400">Install recharts for interactive charts</p>
            </div>
          </div>
        </div>

        {/* Category Performance */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Category Performance</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <PieChartIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Category distribution chart</p>
              <p className="text-sm text-gray-400">Install recharts for interactive charts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Performance Table */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Content Distribution</h3>
        <div className="space-y-3">
          <h4 className="font-medium text-gray-800">Performance by Category</h4>
          {data.categoryPerformance.map((item, index) => (
            <div key={item.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm font-medium">{item.category}</span>
              </div>
              <div className="text-sm text-gray-600">
                {item.posts} posts • {item.matches} matches
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Insights & Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Best Performing Category</h4>
            <p className="text-sm text-blue-800">
              {data.categoryPerformance.sort((a, b) => b.matches - a.matches)[0]?.category} 
              has the highest match rate. Consider creating more content in this category.
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Engagement Growth</h4>
            <p className="text-sm text-green-800">
              Your engagement rate is {data.engagementMetrics.avgEngagementRate.toFixed(1)}%. 
              {data.growthMetrics.engagementGrowth > 0 
                ? 'Great work! Keep maintaining this momentum.'
                : 'Consider posting more interactive content to boost engagement.'
              }
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">Content Strategy</h4>
            <p className="text-sm text-purple-800">
              Focus on high-performing categories and maintain consistent posting schedule 
              to maximize your reach and match opportunities.
            </p>
          </div>
          
          <div className="p-4 bg-orange-50 rounded-lg">
            <h4 className="font-medium text-orange-900 mb-2">Match Optimization</h4>
            <p className="text-sm text-orange-800">
              Respond to matches quickly and provide detailed proposals to improve 
              your acceptance rate with brands.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
