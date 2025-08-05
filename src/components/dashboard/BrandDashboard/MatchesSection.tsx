import React, { useState, useEffect } from 'react';
import { Heart, FileText, Calendar, Video } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';
import { useModal } from '../../../contexts/ModalContext'; // Adjust path
import { formatDate } from '../../../utils/formatDate';
import type { Match } from './types';

interface MatchesSectionProps {
  matches: string[];
  pendingMatches: Match[];
  acceptedMatches: Match[];
  rejectedMatches: Match[];
  setActiveTab: (tab: 'discover' | 'influencers' | 'matches') => void;
  generateGoogleCalendarLink: (match: Match) => string;
  deductCredits: (creditsToDeduct: number) => Promise<void>;
}

const MatchesSection: React.FC<MatchesSectionProps> = ({
  matches,
  pendingMatches,
  acceptedMatches,
  rejectedMatches,
  setActiveTab,
  generateGoogleCalendarLink,
  deductCredits,
}) => {
  const [requestedAnalyses, setRequestedAnalyses] = useState<Set<string>>(new Set());
  const [loadingRequests, setLoadingRequests] = useState<Set<string>>(new Set());
  const { openModal, closeModal } = useModal();

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

  const openRiskAnalysisModal = (opportunityId: string) => {
    if (!opportunityId) {
      toast.error('Invalid opportunity');
      return;
    }
    openModal({
      title: 'Confirm Risk Analysis Request',
      message: 'Requesting a risk analysis will cost 500 credits. Are you sure you want to proceed?',
      confirmText: 'Request (500 Credits)',
      cancelText: 'Cancel',
      confirmButtonClass: 'bg-blue-600 text-white hover:bg-blue-700',
      cancelButtonClass: 'border-gray-300 text-gray-700 hover:bg-gray-50',
      onConfirm: async () => {
        setLoadingRequests(prev => new Set([...prev, opportunityId]));
        try {
          const { data: userData, error: userError } = await supabase.auth.getUser();
          if (userError || !userData.user) {
            throw new Error('User not authenticated');
          }

          await deductCredits(500);

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
        } catch (error: any) {
          console.error('Error requesting risk analysis:', error);
          toast.error('Failed to request risk analysis');
        } finally {
          setLoadingRequests(prev => {
            const newSet = new Set(prev);
            newSet.delete(opportunityId);
            return newSet;
          });
          closeModal();
        }
      },
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 transition-all duration-300">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
        Your Matches
      </h2>

      {matches.length === 0 ? (
        <div className="text-center py-8 sm:py-10">
          <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-medium text-gray-700 mb-2">
            No matches yet
          </h3>
          <p className="text-sm sm:text-base text-gray-500 mb-4">
            When you express interest in events, they'll appear here.
          </p>
          <button
            onClick={() => setActiveTab('discover')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base font-medium transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Discover Events"
          >
            Discover Events
          </button>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {pendingMatches.length > 0 && (
            <div>
              <h3 className="text-lg sm:text-xl font-medium text-gray-800 mb-3 flex items-center">
                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                Pending Response
              </h3>
              <div className="space-y-4">
                {pendingMatches.map((match) => (
                  <div
                    key={match.id}
                    className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-5 transition-all hover:shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <h4 className="font-semibold text-gray-800 text-sm sm:text-base">
                            {match.opportunities?.profiles?.company_name || 'Unknown Company'}
                          </h4>
                          <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                            Pending
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Interested in:{' '}
                          <span className="font-medium">
                            {(match as any).opportunities?.title || 'Unknown Event'}
                          </span>
                        </p>
                        {match.profiles?.industry && (
                          <p className="text-sm text-gray-600">
                            Industry: {match.profiles.industry}
                          </p>
                        )}
                        {match.profiles?.contact_person_name && (
                          <p className="text-sm text-gray-600">
                            Contact: {match.profiles.contact_person_name}
                            {match.profiles.contact_person_phone
                              ? ` (${match.profiles.contact_person_phone})`
                              : ''}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          Sent: {formatDate(match.created_at)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => openRiskAnalysisModal(match.opportunity_id)}
                          disabled={requestedAnalyses.has(match.opportunity_id) || loadingRequests.has(match.opportunity_id)}
                          className={`px-3 py-1.5 rounded-lg flex items-center text-sm transition-transform transform hover:scale-105 ${
                            requestedAnalyses.has(match.opportunity_id) || loadingRequests.has(match.opportunity_id)
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                          aria-label={requestedAnalyses.has(match.opportunity_id) ? 'Risk Analysis Requested' : 'Request Risk Analysis'}
                        >
                          <FileText className="w-4 h-4 mr-1.5" />
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
              <h3 className="text-lg sm:text-xl font-medium text-gray-800 mb-3 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Accepted Matches
              </h3>
              <div className="space-y-4">
                {acceptedMatches.map((match) => (
                  <div
                    key={match.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 transition-all hover:shadow-md"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <h4 className="font-semibold text-gray-800 text-sm sm:text-base">
                              {match.opportunities?.profiles?.company_name || 'Unknown Company'}
                            </h4>
                            <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              Accepted
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Event:{' '}
                            <span className="font-medium">
                              {(match as any).opportunities?.title || 'Unknown Event'}
                            </span>
                          </p>
                          {match.meeting_scheduled_at && (
                            <p className="text-sm text-gray-600">
                              Meeting scheduled for: {formatDateTime(match.meeting_scheduled_at)}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                          {match.opportunities?.sponsorship_brochure_url && (
                            <a
                              href={match.opportunities.sponsorship_brochure_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 flex items-center transition-transform transform hover:scale-105"
                              aria-label="View Sponsorship Brochure"
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              View Brochure
                            </a>
                          )}
                          <button
                            onClick={() => openRiskAnalysisModal(match.opportunity_id)}
                            disabled={requestedAnalyses.has(match.opportunity_id) || loadingRequests.has(match.opportunity_id)}
                            className={`px-4 py-2 text-sm rounded-md flex items-center transition-transform transform hover:scale-105 ${
                              requestedAnalyses.has(match.opportunity_id) || loadingRequests.has(match.opportunity_id)
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                            aria-label={requestedAnalyses.has(match.opportunity_id) ? 'Risk Analysis Requested' : 'Request Risk Analysis'}
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
                              className="px-4 py-2 bg-green-100 text-green-700 text-sm rounded-md hover:bg-green-200 flex items-center transition-transform transform hover:scale-105"
                              aria-label="Add to Calendar"
                            >
                              <Calendar className="w-4 h-4 mr-2" />
                              Add to Calendar
                            </a>
                          )}
                          {match.meeting_link && (
                            <a
                              href={match.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center transition-transform transform hover:scale-105"
                              aria-label="Join Meeting"
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
              <h3 className="text-lg sm:text-xl font-medium text-gray-800 mb-3 flex items-center">
                <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                Rejected Matches
              </h3>
              <div className="space-y-4">
                {rejectedMatches.map((match) => (
                  <div
                    key={match.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 transition-all hover:shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <h4 className="font-semibold text-gray-800 text-sm sm:text-base">
                            {match.profiles?.company_name || 'Unknown Company'}
                          </h4>
                          <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                            Rejected
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Event:{' '}
                          <span className="font-medium">
                            {(match as any).opportunities?.title || 'Unknown Event'}
                          </span>
                        </p>
                        {match.notes && (
                          <p className="text-sm text-gray-600">
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