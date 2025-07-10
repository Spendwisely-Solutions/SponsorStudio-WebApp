import { useState } from 'react';
import { Check, X, Eye, Calendar, Tag, Building, Mail, Phone, ExternalLink, Clock, Star } from 'lucide-react';

interface Match {
  id: string;
  brandName: string;
  brandLogo?: string;
  brandDescription?: string;
  postTitle: string;
  postId: string;
  status: 'pending' | 'accepted' | 'rejected';
  matchedAt: string;
  message?: string;
  budget?: string;
  timeline?: string;
  requirements?: string;
  contact?: {
    email?: string;
    phone?: string;
    website?: string;
  };
  brandRating?: number;
}

interface MatchListProps {
  matches: Match[];
  onAccept: (matchId: string) => void;
  onReject: (matchId: string) => void;
  onViewDetails: (match: Match) => void;
}

export default function MatchList({ matches, onAccept, onReject, onViewDetails }: MatchListProps) {
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const pendingMatches = matches.filter(match => match.status === 'pending');
  const acceptedMatches = matches.filter(match => match.status === 'accepted');
  const rejectedMatches = matches.filter(match => match.status === 'rejected');

  return (
    <div className="space-y-6">
      {/* Pending Matches */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-800">Pending Matches</h3>
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 text-xs rounded-full">
            {pendingMatches.length} pending
          </span>
        </div>

        {pendingMatches.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">No pending matches at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingMatches.map((match) => (
              <div key={match.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {match.brandLogo ? (
                        <img src={match.brandLogo} alt={match.brandName} className="w-8 h-8 rounded" />
                      ) : (
                        <Building className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{match.brandName}</h4>
                        {match.brandRating && (
                          <div className="flex items-center gap-1">
                            {renderStars(match.brandRating)}
                            <span className="text-xs text-gray-500">({match.brandRating})</span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        Interested in: <span className="font-medium">{match.postTitle}</span>
                      </p>
                      
                      {match.message && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{match.message}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                        <span>Matched {formatDate(match.matchedAt)}</span>
                        {match.budget && (
                          <span className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            Budget: {match.budget}
                          </span>
                        )}
                        {match.timeline && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {match.timeline}
                          </span>
                        )}
                      </div>

                      {expandedMatch === match.id && (
                        <div className="border-t pt-3 mt-3 space-y-2">
                          {match.brandDescription && (
                            <div>
                              <strong className="text-sm text-gray-700">About Brand:</strong>
                              <p className="text-sm text-gray-600">{match.brandDescription}</p>
                            </div>
                          )}
                          
                          {match.requirements && (
                            <div>
                              <strong className="text-sm text-gray-700">Requirements:</strong>
                              <p className="text-sm text-gray-600">{match.requirements}</p>
                            </div>
                          )}
                          
                          {match.contact && (
                            <div>
                              <strong className="text-sm text-gray-700">Contact:</strong>
                              <div className="flex flex-wrap gap-3 mt-1">
                                {match.contact.email && (
                                  <a
                                    href={`mailto:${match.contact.email}`}
                                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                                  >
                                    <Mail className="w-3 h-3" />
                                    {match.contact.email}
                                  </a>
                                )}
                                {match.contact.phone && (
                                  <a
                                    href={`tel:${match.contact.phone}`}
                                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                                  >
                                    <Phone className="w-3 h-3" />
                                    {match.contact.phone}
                                  </a>
                                )}
                                {match.contact.website && (
                                  <a
                                    href={match.contact.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    Website
                                  </a>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => setExpandedMatch(expandedMatch === match.id ? null : match.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => onAccept(match.id)}
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                      title="Accept match"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => onReject(match.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      title="Reject match"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Accepted Matches */}
      {acceptedMatches.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-800">Accepted Matches</h3>
            <span className="bg-green-100 text-green-800 px-2 py-1 text-xs rounded-full">
              {acceptedMatches.length} accepted
            </span>
          </div>

          <div className="space-y-4">
            {acceptedMatches.map((match) => (
              <div key={match.id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      {match.brandLogo ? (
                        <img src={match.brandLogo} alt={match.brandName} className="w-6 h-6 rounded" />
                      ) : (
                        <Building className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900">{match.brandName}</h4>
                      <p className="text-sm text-gray-600">{match.postTitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(match.status)}`}>
                      {match.status}
                    </span>
                    <button
                      onClick={() => onViewDetails(match)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Rejected Matches */}
      {rejectedMatches.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-800">Recent Rejections</h3>
            <span className="bg-red-100 text-red-800 px-2 py-1 text-xs rounded-full">
              {rejectedMatches.length} rejected
            </span>
          </div>

          <div className="space-y-3">
            {rejectedMatches.slice(0, 3).map((match) => (
              <div key={match.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    {match.brandLogo ? (
                      <img src={match.brandLogo} alt={match.brandName} className="w-5 h-5 rounded" />
                    ) : (
                      <Building className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{match.brandName}</h4>
                    <p className="text-xs text-gray-600">{match.postTitle}</p>
                  </div>
                </div>

                <span className="text-xs text-gray-500">
                  {formatDate(match.matchedAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
