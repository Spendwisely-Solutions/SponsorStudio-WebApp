import React, { useState, useEffect } from 'react';
import { Heart, FileText, Calendar, Video } from 'lucide-react';
import { supabase } from '../../../lib/supabase'; // Adjust import path as needed
import toast from 'react-hot-toast';
import type { Match } from './types';

interface MatchesSectionProps {
  matches: string[];
  pendingMatches: Match[];
  acceptedMatches: Match[];
  rejectedMatches: Match[];
  setActiveTab: (tab: 'discover' | 'influencers' | 'matches') => void;
  generateGoogleCalendarLink: (match: Match) => string;
}

const MatchesSection: React.FC<MatchesSectionProps> = ({
  matches,
  pendingMatches,
  acceptedMatches,
  rejectedMatches,
  setActiveTab,
  generateGoogleCalendarLink,
}) => {
  const [requestedAnalyses, setRequestedAnalyses] = useState<Set<string>>(new Set());
  const [loadingRequests, setLoadingRequests] = useState<Set<string>>(new Set());

  // Fetch existing risk analysis requests to disable buttons for already requested opportunities
  useEffect(() => {
    const fetchRequestedAnalyses = async () => {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) {
          throw new Error('User not authenticated');
        }

        const { data, error } = await supabase
          .from('risk_analysis')
          .select('opportunity_id')
          .eq('user_id', userData.user.id);

        if (error) throw error;

        const requestedIds = new Set(data.map(item => item.opportunity_id));
        setRequestedAnalyses(requestedIds);
      } catch (error) {
        console.error('Error fetching risk analysis requests:', error);
        toast.error('Failed to load existing requests');
      }
    };

    fetchRequestedAnalyses();
  }, []);

  const handleRequestRiskAnalysis = async (opportunityId: string) => {
    if (!opportunityId) {
      toast.error('Invalid opportunity');
      return;
    }

    setLoadingRequests(prev => new Set([...prev, opportunityId]));

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('risk_analysis')
        .insert({
          user_id: userData.user.id,
          opportunity_id: opportunityId,
          status: 'requested',
        });

      if (error) throw error;

      setRequestedAnalyses(prev => new Set([...prev, opportunityId]));
      toast.success('Risk analysis requested successfully');
    } catch (error) {
      console.error('Error requesting risk analysis:', error);
      toast.error('Failed to request risk analysis');
    } finally {
      setLoadingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(opportunityId);
        return newSet;
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6 pb-14 sm:pb-6">
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">
        Your Matches
      </h2>

      {matches.length === 0 ? (
        <div className="text-center py-6 sm:py-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-2">
            No matches yet
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
            When you express interest in events, they'll appear here.
          </p>
          <button
            onClick={() => setActiveTab('discover')}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#2B4B9B] text-white rounded-lg hover:bg-[#1a2f61] text-xs sm:text-sm"
          >
            Discover Events
          </button>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {pendingMatches.length > 0 && (
            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-2 sm:mb-3 flex items-center">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-400 rounded-full mr-1.5 sm:mr-2"></span>
                Pending Response
              </h3>
              <div className="space-y-2 sm:space-y-3">
                {pendingMatches.map((match) => (
                  <div
                    key={match.id}
                    className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <div className="mb-2 sm:mb-0">
                        <div className="flex items-center">
                          <h4 className="font-medium text-gray-800 text-xs sm:text-sm">
                            {match.profiles?.company_name || 'Unknown Company'}
                          </h4>
                          <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs bg-yellow-100 text-yellow-800 rounded-full">
                            Pending
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          Interested in:{' '}
                          <span className="font-medium">
                            {(match as any).opportunities?.title || 'Unknown Event'}
                          </span>
                        </p>
                        {match.profiles?.industry && (
                          <p className="text-xs sm:text-sm text-gray-600">
                            Industry: {match.profiles.industry}
                          </p>
                        )}
                        {match.profiles?.contact_person_name && (
                          <p className="text-xs sm:text-sm text-gray-600">
                            Contact: {match.profiles.contact_person_name}
                            {match.profiles.contact_person_phone
                              ? ` (${match.profiles.contact_person_phone})`
                              : ''}
                          </p>
                        )}
                        <p className="text-xs sm:text-sm text-gray-600">
                          Sent: {new Date(match.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {match.opportunities?.sponsorship_brochure_url && (
                          <a
                            href={match.opportunities.sponsorship_brochure_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center text-xs sm:text-sm"
                          >
                            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                            View Brochure
                          </a>
                        )}
                        <button
                          onClick={() => handleRequestRiskAnalysis(match.opportunity_id)}
                          disabled={requestedAnalyses.has(match.opportunity_id) || loadingRequests.has(match.opportunity_id)}
                          className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg flex items-center text-xs sm:text-sm ${
                            requestedAnalyses.has(match.opportunity_id) || loadingRequests.has(match.opportunity_id)
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                          {loadingRequests.has(match.opportunity_id)
                            ? 'Requesting...'
                            : requestedAnalyses.has(match.opportunity_id)
                            ? 'Requested'
                            : 'Request Risk Analysis'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {acceptedMatches.length > 0 && (
            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-3 sm:mb-4 flex items-center">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full mr-1.5 sm:mr-2"></span>
                Accepted Matches
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {acceptedMatches.map((match) => (
                  <div
                    key={match.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-6">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <h4 className="font-medium text-gray-800 text-sm sm:text-base">
                              {match.profiles?.company_name || 'Unknown Company'}
                            </h4>
                            <span className="ml-2 px-2 py-0.5 text-xs sm:text-sm bg-green-100 text-green-800 rounded-full">
                              Accepted
                            </span>
                          </div>
                          <p className="text-sm sm:text-base text-gray-600">
                            Event:{' '}
                            <span className="font-medium">
                              {(match as any).opportunities?.title || 'Unknown Event'}
                            </span>
                          </p>
                          {match.meeting_scheduled_at && (
                            <p className="text-sm sm:text-base text-gray-600">
                              Meeting scheduled for:{' '}
                              {new Date(match.meeting_scheduled_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                          <div className="flex flex-row gap-3 sm:flex-row sm:gap-4">
                            {match.opportunities?.sponsorship_brochure_url && (
                              <a
                                href={match.opportunities.sponsorship_brochure_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 flex items-center justify-center flex-1 sm:flex-none"
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                View Brochure
                              </a>
                            )}
                            <button
                              onClick={() => handleRequestRiskAnalysis(match.opportunity_id)}
                              disabled={requestedAnalyses.has(match.opportunity_id) || loadingRequests.has(match.opportunity_id)}
                              className={`px-4 py-2 text-sm font-medium rounded-md flex items-center justify-center flex-1 sm:flex-none ${
                                requestedAnalyses.has(match.opportunity_id) || loadingRequests.has(match.opportunity_id)
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              {loadingRequests.has(match.opportunity_id)
                                ? 'Requesting...'
                                : requestedAnalyses.has(match.opportunity_id)
                                ? 'Requested'
                                : 'Request Risk Analysis'}
                            </button>
                            {match.meeting_scheduled_at && (
                              <a
                                href={generateGoogleCalendarLink(match)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 flex items-center justify-center flex-1 sm:flex-none"
                              >
                                <Calendar className="w-4 h-4 mr-2" />
                                Add to Calendar
                              </a>
                            )}
                          </div>
                          {match.meeting_link && (
                            <a
                              href={match.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-blue-100 text-[#2B4B9B] text-sm font-medium rounded-md hover:bg-blue-200 flex items-center justify-center w-full sm:w-auto"
                            >
                              <Video className="w-4 h-4 mr-2" />
                              Join Meeting
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {rejectedMatches.length > 0 && (
            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-2 sm:mb-3 flex items-center">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-400 rounded-full mr-1.5 sm:mr-2"></span>
                Rejected Matches
              </h3>
              <div className="space-y-2 sm:space-y-3">
                {rejectedMatches.map((match) => (
                  <div
                    key={match.id}
                    className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <div>
                        <div className="flex items-center">
                          <h4 className="font-medium text-gray-800 text-xs sm:text-sm">
                            {match.profiles?.company_name || 'Unknown Company'}
                          </h4>
                          <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs bg-red-100 text-red-800 rounded-full">
                            Rejected
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          Event:{' '}
                          <span className="font-medium">
                            {(match as any).opportunities?.title || 'Unknown Event'}
                          </span>
                        </p>
                        {match.notes && (
                          <p className="text-xs sm:text-sm text-gray-600 mt-1">
                            Reason: {match.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MatchesSection;