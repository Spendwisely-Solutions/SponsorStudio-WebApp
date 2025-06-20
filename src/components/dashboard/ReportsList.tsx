import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { format, parseISO, subDays } from 'date-fns';
import { ExternalLink, File, Search, RefreshCw, Filter, Lock, Eye, Frown, Calendar } from 'lucide-react';
import debounce from 'lodash.debounce';
import type { Database } from '../../lib/database.types';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip } from 'react-tooltip';
import coinIcon from '../../assets/dashboard/coin.png';
import { useAuth } from '../../contexts/AuthContext';

// Type definitions for reports
type GeneralReport = Database['public']['Tables']['reports']['Row'] & {
  opportunity: { title?: string } | null;
};

type RiskAnalysisReport = Database['public']['Tables']['risk_analysis']['Row'] & {
  opportunity: { title?: string } | null;
  profile: { company_name?: string } | null;
};

const PAGE_SIZE = 10;

export default function ReportsList() {
  const { user, profile } = useAuth();
  const [generalReports, setGeneralReports] = useState<GeneralReport[]>([]);
  const [riskAnalysisReports, setRiskAnalysisReports] = useState<RiskAnalysisReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'risk_analysis'>('general');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<'all' | 'requested' | 'in_progress' | 'completed' | 'rejected'>('all');
  const [dateFrom, setDateFrom] = useState<string>(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [currentPage, setCurrentPage] = useState<{ general: number; risk_analysis: number }>({ general: 1, risk_analysis: 1 });
  const [totalPages, setTotalPages] = useState<{ general: number; risk_analysis: number }>({ general: 1, risk_analysis: 1 });
  const [credits, setCredits] = useState<number | null>(profile?.credits ?? null);
  const [shakeCredits, setShakeCredits] = useState<boolean>(false);
  const [unlockedReports, setUnlockedReports] = useState<Set<string>>(new Set());
  const [unlockingReport, setUnlockingReport] = useState<string | null>(null);

  useEffect(() => {
    setCredits(profile?.credits ?? null);
  }, [profile?.credits]);

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query);
      setCurrentPage(prev => ({ ...prev, [activeTab]: 1 }));
    }, 300),
    [activeTab]
  );

  const fetchProfile = async (): Promise<{ credits: number | null; company_name: string | null } | null> => {
    if (!user?.id) {
      console.error('fetchProfile: No user ID available');
      toast.error('Please log in to access profile data.', { duration: 4000, position: 'top-center' });
      return null;
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('credits, company_name')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      setCredits(data.credits ?? null);
      console.log(`fetchProfile: Updated local credits to ${data.credits}`);
      return data;
    } catch (error) {
      console.error('fetchProfile: Error fetching profile:', error);
      toast.error('Failed to fetch profile data. Please try again.', { duration: 4000, position: 'top-center' });
      return null;
    }
  };

  const refreshToken = async (): Promise<string> => {
    console.log('refreshToken: Attempting to refresh session');
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      if (!data.session?.access_token) {
        throw new Error('No access token in refreshed session');
      }
      console.log('refreshToken: Session refreshed successfully');
      return data.session.access_token;
    } catch (error) {
      console.error('refreshToken: Failed to refresh session:', error);
      toast.error('Session refresh failed. Please log in again.', { duration: 4000, position: 'top-center' });
      throw error;
    }
  };

  const unlockReport = async (reportId: string, url: string): Promise<void> => {
    if (!user?.id) {
      console.error('unlockReport: User not authenticated');
      toast.error('Please log in to unlock reports.', { duration: 4000, position: 'top-center' });
      throw new Error('User not authenticated');
    }

    if (!url) {
      console.error('unlockReport: Invalid report URL');
      toast.error('Invalid report URL.', { duration: 4000, position: 'top-center' });
      throw new Error('Invalid report URL');
    }

    if (credits === null || credits < 100) {
      console.log(`unlockReport: Insufficient credits, need 100, have ${credits}`);
      setShakeCredits(true);
      toast.error('Insufficient credits! You need 100 credits to unlock this report.', {
        duration: 4000,
        position: 'top-center',
      });
      setTimeout(() => setShakeCredits(false), 500);
      throw new Error('Insufficient credits');
    }

    const originalCredits = credits;
    setCredits(prev => (prev ?? 0) - 100);
    setUnlockingReport(reportId);
    console.log(`unlockReport: Optimistically updated credits to ${(credits ?? 0) - 100}`);

    try {
      let accessToken = user.access_token || (await refreshToken());
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-credits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          userId: user.id,
          creditsToDeduct: 100,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401 && errorData.message === 'Invalid JWT') {
          console.log('unlockReport: Invalid JWT, retrying with refreshed token');
          accessToken = await refreshToken();
          const retryResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-credits`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              userId: user.id,
              creditsToDeduct: 100,
            }),
          });
          if (!retryResponse.ok) {
            const retryErrorData = await retryResponse.json().catch(() => ({}));
            throw new Error(`Retry failed: ${retryErrorData.message || retryResponse.statusText}`);
          }
        } else {
          throw new Error(`Failed to deduct credits: ${errorData.message || response.statusText}`);
        }
      }

      console.log('unlockReport: Credits deducted successfully');
      setUnlockedReports(prev => new Set(prev).add(reportId));
      const serverProfile = await fetchProfile();
      if (serverProfile && serverProfile.credits !== null && serverProfile.credits !== credits) {
        console.log(`unlockReport: Syncing credits, server: ${serverProfile.credits}, local: ${credits}`);
        setCredits(serverProfile.credits);
      }
    } catch (error: any) {
      setCredits(originalCredits);
      console.log(`unlockReport: Restored credits to ${originalCredits} due to error`);
      toast.error('Failed to unlock report. Please try again.', { duration: 4000, position: 'top-center' });
      throw error;
    } finally {
      setUnlockingReport(null);
    }
  };

  const viewReport = (url: string) => {
    if (!url) {
      toast.error('Invalid report URL.', { duration: 4000, position: 'top-center' });
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const fetchReports = useCallback(async () => {
    if (!user?.id) {
      setError('Please log in to view reports.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('opportunity_id')
        .eq('brand_id', user.id)
        .eq('status', 'accepted');

      if (matchError) throw new Error(`Failed to fetch matches: ${matchError.message}`);

      const opportunityIds = matchData?.map(match => match.opportunity_id) || [];
      if (opportunityIds.length === 0) {
        setGeneralReports([]);
        setTotalPages(prev => ({ ...prev, general: 1 }));
      } else {
        let generalQuery = supabase
          .from('reports')
          .select(
            `
            *,
            opportunity:opportunities(title)
          `,
            { count: 'exact' }
          )
          .in('opportunity_id', opportunityIds)
          .gte('created_at', `${dateFrom}T00:00:00+00:00`)
          .lte('created_at', `${dateTo}T23:59:59+00:00`)
          .order('created_at', { ascending: sortOrder === 'asc' })
          .range((currentPage.general - 1) * PAGE_SIZE, currentPage.general * PAGE_SIZE - 1);

        if (searchQuery) {
          generalQuery = generalQuery.ilike('opportunity.title', `%${searchQuery}%`);
        }

        const { data: generalData, error: generalError, count: generalCount } = await generalQuery;
        if (generalError) throw new Error(`Failed to fetch general reports: ${generalError.message}`);

        const generalReportsWithUrls = generalData?.map(report => ({
          ...report,
          signedUrl: supabase.storage.from('reports').getPublicUrl(report.pdf_path).data.publicUrl || '',
        })) || [];

        setGeneralReports(generalReportsWithUrls);
        setTotalPages(prev => ({
          ...prev,
          general: Math.ceil((generalCount ?? 0) / PAGE_SIZE),
        }));
      }

      let riskQuery = supabase
        .from('risk_analysis')
        .select(
          `
          *,
          opportunity:opportunities(title),
          profile:profiles(company_name)
        `,
          { count: 'exact' }
        )
        .eq('user_id', user.id)
        .gte('created_at', `${dateFrom}T00:00:00+00:00`)
        .lte('created_at', `${dateTo}T23:59:59+00:00`)
        .order('created_at', { ascending: sortOrder === 'asc' })
        .range((currentPage.risk_analysis - 1) * PAGE_SIZE, currentPage.risk_analysis * PAGE_SIZE - 1);

      if (searchQuery) {
        riskQuery = riskQuery.or(`opportunity.title.ilike.%${searchQuery}%,profile.company_name.ilike.%${searchQuery}%`);
      }

      if (statusFilter !== 'all') {
        riskQuery = riskQuery.eq('status', statusFilter);
      }

      const { data: riskData, error: riskError, count: riskCount } = await riskQuery;
      if (riskError) throw new Error(`Failed to fetch risk analysis reports: ${riskError.message}`);

      setRiskAnalysisReports(riskData || []);
      setTotalPages(prev => ({
        ...prev,
        risk_analysis: Math.ceil((riskCount ?? 0) / PAGE_SIZE),
      }));
    } catch (err: any) {
      console.error('fetchReports: Error fetching reports:', err);
      const errorMessage = err.message || 'Failed to load reports. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage, { duration: 4000, position: 'top-center' });
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery, sortOrder, statusFilter, dateFrom, dateTo, currentPage, user?.id]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages[activeTab]) return;
    setCurrentPage(prev => ({ ...prev, [activeTab]: page }));
  };

  const handleSortToggle = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    setCurrentPage(prev => ({ ...prev, [activeTab]: 1 }));
  };

  const handleDateFilter = () => {
    if (!dateFrom || !dateTo) {
      toast.error('Please select both start and end dates.', { duration: 4000, position: 'top-center' });
      return;
    }
    if (new Date(dateFrom) > new Date(dateTo)) {
      toast.error('Start date cannot be after end date.', { duration: 4000, position: 'top-center' });
      return;
    }
    setCurrentPage(prev => ({ ...prev, [activeTab]: 1 }));
    fetchReports();
  };

  const renderSkeleton = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-3 p-3"
    >
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-gray-100 h-20 rounded-lg animate-pulse" />
      ))}
    </motion.div>
  );

  const filteredGeneralReports = generalReports.filter(
    report =>
      report.opportunity?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRiskAnalysisReports = riskAnalysisReports.filter(
    report =>
      (report.opportunity?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.profile?.company_name?.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (statusFilter === 'all' || report.status === statusFilter)
  );

  const renderGeneralReports = () => {
    if (filteredGeneralReports.length === 0 && !loading) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-10"
        >
          <div className="flex justify-center space-x-3 mb-4">
            <Calendar className="w-10 h-10 text-gray-400" />
            <Frown className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-600 text-lg mb-4">No post-event reports found</p>
          <p className="text-gray-500 text-sm">No accepted matches have associated reports. Contact your account manager.</p>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid grid-cols-1 gap-3 p-3 sm:hidden">
          <AnimatePresence>
            {filteredGeneralReports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm p-3 border border-gray-100 hover:shadow-md transition-shadow"
                role="article"
              >
                <div className="space-y-2">
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase">Opportunity</span>
                    <p className="text-sm font-medium text-gray-900 truncate">{report.opportunity?.title || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase">File</span>
                    <div className="flex items-center mt-1">
                      {unlockedReports.has(report.id) ? (
                        <motion.button
                          onClick={() => viewReport(report.signedUrl)}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs font-medium flex items-center transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          aria-label={`View ${report.filename}`}
                          data-tooltip-id={`view-tooltip-${report.id}`}
                          data-tooltip-content="View report in new tab"
                        >
                          View Report
                          <Eye size={12} className="ml-2" />
                        </motion.button>
                      ) : (
                        <motion.button
                          onClick={() => unlockReport(report.id, report.signedUrl)}
                          disabled={unlockingReport === report.id}
                          className={`px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-md text-xs font-medium flex items-center transition-all duration-200 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed ${
                            unlockingReport === report.id ? 'animate-pulse' : ''
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          aria-label={`Unlock ${report.filename} (100 credits)`}
                          data-tooltip-id={`unlock-tooltip-${report.id}`}
                          data-tooltip-content="Unlock costs 100 credits"
                        >
                          {unlockingReport === report.id ? (
                            <>
                              Unlocking
                              <svg className="animate-spin ml-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            </>
                          ) : (
                            <>
                              Unlock Report
                              <Lock size={12} className="ml-2" />
                            </>
                          )}
                        </motion.button>
                      )}
                      <Tooltip id={`view-tooltip-${report.id}`} place="top" className="text-xs" />
                      <Tooltip id={`unlock-tooltip-${report.id}`} place="top" className="text-xs" />
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase">Uploaded</span>
                    <p className="text-xs text-gray-500">{format(parseISO(report.created_at), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200" role="grid">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase" scope="col">
                  Opportunity
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase" scope="col">File</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase" scope="col">Uploaded</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <AnimatePresence>
                {filteredGeneralReports.map((report, index) => (
                  <motion.tr
                    key={report.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="hover:bg-gray-50"
                    role="row"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900" role="gridcell">
                      {report.opportunity?.title || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm" role="gridcell">
                      <div className="flex items-center">
                        {unlockedReports.has(report.id) ? (
                          <motion.button
                            onClick={() => viewReport(report.signedUrl)}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium flex items-center transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label={`View ${report.filename}`}
                            data-tooltip-id={`view-tooltip-${report.id}`}
                            data-tooltip-content="View report in new tab"
                          >
                            View Report
                            <Eye size={14} className="ml-2" />
                          </motion.button>
                        ) : (
                          <motion.button
                            onClick={() => unlockReport(report.id, report.signedUrl)}
                            disabled={unlockingReport === report.id}
                            className={`px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-md text-sm font-medium flex items-center transition-all duration-200 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed ${
                              unlockingReport === report.id ? 'animate-pulse' : ''
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label={`Unlock ${report.filename} (100 credits)`}
                            data-tooltip-id={`unlock-tooltip-${report.id}`}
                            data-tooltip-content="Unlock costs 100 credits"
                          >
                            {unlockingReport === report.id ? (
                              <>
                                Unlocking
                                <svg className="animate-spin ml-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              </>
                            ) : (
                              <>
                                Unlock Report
                                <Lock size={14} className="ml-2" />
                              </>
                            )}
                          </motion.button>
                        )}
                        <Tooltip id={`view-tooltip-${report.id}`} place="top" className="text-xs" />
                        <Tooltip id={`unlock-tooltip-${report.id}`} place="top" className="text-xs" />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500" role="gridcell">
                      {format(parseISO(report.created_at), 'MMM dd, yyyy')}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>
    );
  };

  const renderRiskAnalysisReports = () => {
    if (filteredRiskAnalysisReports.length === 0 && !loading) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-10"
        >
          <div className="flex justify-center space-x-3 mb-4">
            <Calendar className="w-10 h-10 text-gray-400" />
            <Frown className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-600 text-lg mb-4">No risk analysis reports found</p>
          <p className="text-gray-500 text-sm">Request a risk analysis for your opportunities.</p>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid grid-cols-1 gap-3 p-3 sm:hidden">
          <AnimatePresence>
            {filteredRiskAnalysisReports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm p-3 border border-gray-100 hover:shadow-md transition-shadow"
                role="article"
              >
                <div className="space-y-2">
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase">Opportunity</span>
                    <p className="text-sm font-medium text-gray-900 truncate">{report.opportunity?.title || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase">Company</span>
                    <p className="text-sm text-gray-900 truncate">{report.profile?.company_name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase">Status</span>
                    <p className="text-sm">
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-xs ${
                          report.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : report.status === 'in_progress'
                            ? 'bg-yellow-100 text-yellow-800'
                            : report.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {report.status ? report.status.charAt(0).toUpperCase() + report.status.slice(1) : 'N/A'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase">File</span>
                    <div className="flex items-center mt-1">
                      {report.report_url ? (
                        <>
                          <motion.button
                            onClick={() => viewReport(report.report_url)}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs font-medium flex items-center transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label="View report"
                            data-tooltip-id={`view-tooltip-${report.id}`}
                            data-tooltip-content="View report in new tab"
                          >
                            View Report
                            <Eye size={12} className="ml-2" />
                          </motion.button>
                          <Tooltip id={`view-tooltip-${report.id}`} place="top" className="text-xs" />
                        </>
                      ) : (
                        <span className="text-gray-500 text-xs">No report uploaded</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase">Requested</span>
                    <p className="text-xs text-gray-500">
                      {format(parseISO(report.created_at || new Date().toISOString()), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200" role="grid">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase" scope="col">
                  Opportunity
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase" scope="col">Company</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase" scope="col">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase" scope="col">File</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase" scope="col">Requested</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <AnimatePresence>
                {filteredRiskAnalysisReports.map((report, index) => (
                  <motion.tr
                    key={report.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="hover:bg-gray-50"
                    role="row"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900" role="gridcell">
                      {report.opportunity?.title || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900" role="gridcell">
                      {report.profile?.company_name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm" role="gridcell">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          report.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : report.status === 'in_progress'
                            ? 'bg-yellow-100 text-yellow-800'
                            : report.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {report.status ? report.status.charAt(0).toUpperCase() + report.status.slice(1) : 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm" role="gridcell">
                      {report.report_url ? (
                        <div className="flex items-center">
                          <motion.button
                            onClick={() => viewReport(report.report_url)}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium flex items-center transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label="View report"
                            data-tooltip-id={`view-tooltip-${report.id}`}
                            data-tooltip-content="View report in new tab"
                          >
                            View Report
                            <Eye size={14} className="ml-2" />
                          </motion.button>
                          <Tooltip id={`view-tooltip-${report.id}`} place="top" className="text-xs" />
                        </div>
                      ) : (
                        <span className="text-gray-600">No report</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500" role="gridcell">
                      {format(parseISO(report.created_at || new Date().toISOString()), 'MMM dd, yyyy')}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>
    );
  };

  const renderPagination = () => {
    const pages = totalPages[activeTab];
    if (pages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 mt-4 px-3 flex-wrap">
        <motion.button
          onClick={() => handlePageChange(currentPage[activeTab] - 1)}
          disabled={currentPage[activeTab] === 1}
          className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 disabled:opacity-50 hover:bg-gray-200 text-sm font-medium transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Previous page"
        >
          Previous
        </motion.button>
        {[...Array(pages)].map((_, i) => (
          <motion.button
            key={i}
            onClick={() => handlePageChange(i + 1)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              currentPage[activeTab] === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } transition-colors`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-current={currentPage[activeTab] === i + 1 ? 'page' : undefined}
          >
            {i + 1}
          </motion.button>
        ))}
        <motion.button
          onClick={() => handlePageChange(currentPage[activeTab] + 1)}
          disabled={currentPage[activeTab] === pages}
          className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 disabled:opacity-50 hover:bg-gray-200 text-sm font-medium transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Next page"
        >
          Next
        </motion.button>
      </div>
    );
  };

  const content = (
    <>
      <motion.div
        className="mb-4 bg-gradient-to-r from-white to-gray-50 p-4 rounded-lg shadow-sm flex items-center justify-between transition-colors duration-200 hover:shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, ...(shakeCredits ? { x: [0, -10, 10, -10, 10, 0] } : {}) }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-2">
          <img
            src={coinIcon}
            alt="Credits"
            className="w-6 h-6"
            data-tooltip-id="credits-tooltip"
            data-tooltip-content="Available credits"
          />
          <span
            className="text-sm font-semibold text-gray-800"
            data-tooltip-id="credits-tooltip"
            data-tooltip-content="Available credits"
          >
            {credits ?? 'N/A'}
          </span>
          <Tooltip id="credits-tooltip" place="top" className="text-xs" />
        </div>
        <motion.button
          className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors"
          onClick={() => {
            window.location.href = '/purchase';
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Add credits"
        >
          Add Credits
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-2 mb-4"
      >
        <h2 className="text-xl font-semibold text-gray-900">Your Reports</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex flex-wrap gap-2">
            <motion.button
              onClick={() => {
                setActiveTab('general');
                setCurrentPage(prev => ({ ...prev, general: 1 }));
              }}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                activeTab === 'general' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              } min-w-[120px]`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-current={activeTab === 'general' ? 'page' : undefined}
            >
              Post-Event Reports
            </motion.button>
            <motion.button
              onClick={() => {
                setActiveTab('risk_analysis');
                setCurrentPage(prev => ({ ...prev, risk_analysis: 1 }));
              }}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                activeTab === 'risk_analysis' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              } min-w-[120px]`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-current={activeTab === 'risk_analysis' ? 'page' : undefined}
            >
              Risk Analysis
            </motion.button>
          </div>
          <div className="relative w-full max-w-md flex items-center">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
              <Search className="text-gray-400" size={16} />
            </span>
            <input
              type="text"
              placeholder="Search by title or company..."
              onChange={handleSearch}
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              aria-label="Search reports"
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-3 mb-4"
      >
        <div className="flex flex-col sm:flex-row gap-2 justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <motion.button
              onClick={handleSortToggle}
              className="px-3 py-1.5 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200 text-sm font-medium transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`Sort by date ${sortOrder === 'desc' ? 'oldest first' : 'newest first'}`}
            >
              Sort: {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
            </motion.button>
            {activeTab === 'risk_analysis' && (
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={e => {
                    setStatusFilter(e.target.value as typeof statusFilter);
                    setCurrentPage(prev => ({ ...prev, risk_analysis: 1 }));
                  }}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm font-medium appearance-none pr-6 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px]"
                  aria-label="Filter by status"
                >
                  <option value="all">All Statuses</option>
                  <option value="requested">Requested</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Complete</option>
                  <option value="rejected">Failed</option>
                </select>
                <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={12} />
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[140px]"
              aria-label="Filter by start date"
            />
            <span className="text-gray-600 text-sm">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[140px]"
              aria-label="Filter by end date"
            />
            <motion.button
              onClick={handleDateFilter}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Apply date filter"
            >
              Apply
            </motion.button>
          </div>
        </div>
        <div className="flex justify-end">
          <motion.button
            onClick={fetchReports}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium flex items-center transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Refresh reports"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </motion.button>
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-3 bg-red-50 text-red-600 rounded-md text-center mb-4 text-sm"
          role="alert"
        >
          {error}
        </motion.div>
      )}
      {loading ? renderSkeleton() : activeTab === 'general' ? renderGeneralReports() : renderRiskAnalysisReports()}
      {renderPagination()}
    </>
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden sm:block bg-white rounded-xl shadow-lg p-6"
      >
        {content}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="block sm:hidden pb-16"
      >
        {content}
      </motion.div>
    </>
  );
}