import { Video, Clock, Check, X } from 'lucide-react';

interface StatCardsProps {
  totalPosts: number;
  activePosts: number;
  pendingMatches: number;
  acceptedMatches: number;
  rejectedMatches: number;
}

export default function StatCards({
  totalPosts,
  activePosts,
  pendingMatches,
  acceptedMatches,
  rejectedMatches,
}: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-800">Total Posts</h3>
          <div className="p-2 bg-blue-100 rounded-full">
            <Video className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900">{totalPosts}</p>
        <div className="flex items-center mt-2 text-sm">
          <span className="text-gray-500">{activePosts} active</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-800">Pending Matches</h3>
          <div className="p-2 bg-yellow-100 rounded-full">
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900">{pendingMatches}</p>
        <div className="flex items-center mt-2 text-sm">
          <span className="text-gray-500">Awaiting your response</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-800">Accepted Matches</h3>
          <div className="p-2 bg-green-100 rounded-full">
            <Check className="w-5 h-5 text-green-600" />
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900">{acceptedMatches}</p>
        <div className="flex items-center mt-2 text-sm">
          <span className="text-gray-500">Confirmed partnerships</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-800">Rejected Matches</h3>
          <div className="p-2 bg-red-100 rounded-full">
            <X className="w-5 h-5 text-red-600" />
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900">{rejectedMatches}</p>
        <div className="flex items-center mt-2 text-sm">
          <span className="text-gray-500">Declined partnerships</span>
        </div>
      </div>
    </div>
  );
}
