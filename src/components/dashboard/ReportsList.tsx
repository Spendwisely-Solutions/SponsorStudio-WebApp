import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { format, parseISO, subDays } from 'date-fns';
import { Search, RefreshCw, Filter, Lock, Eye, Frown, Calendar, X, Plus } from 'lucide-react';
import debounce from 'lodash.debounce';
import type { Database } from '../../lib/database.types';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip } from 'react-tooltip';
import coinIcon from '../../assets/dashboard/coin.png';
import { useAuth } from '../../contexts/AuthContext';

// Type definitions with all fields
type GeneralReport = Database['public']['Tables']['reports']['Row'] & {
  opportunity: { title: string | null } | null;
  signedUrl: string;
  purchased: boolean;
  filename: string | null;
};

type RiskAnalysisReport = Database['public']['Tables']['risk_analysis']['Row'] & {
  opportunity: { title: string | null } | null;
  profile: { company_name: string | null } | null;
  report_url: string | null;
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
  const [unlockingReport, setUnlockingReport] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCredits(profile?.credits ?? null);
  }, [profile?.credits]);

  // Close filters on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      if (error) throw new Error(`Failed to fetch profile: ${error.message}`);
      setCredits(data.credits ?? null);
      console.log(`fetchProfile: Updated credits to ${data.credits}`);
      return data;
    } catch (error: any) {
      console.error('fetchProfile: Error:', error.message);
      toast.error('Failed to fetch profile data.', { duration: 4000, position: 'top-center' });
      return null;
    }
  };

  const refreshToken = async (): Promise<string> => {
    console.log('refreshToken: Attempting to refresh session');
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw new Error(`Failed to refresh session: ${error.message}`);
      if (!data.session?.access_token) throw new Error('No access token in refreshed session');
      console.log('refreshToken: Session refreshed successfully');
      return data.session.access_token;
    } catch (error: any) {
      console.error('refreshToken: Error:', error.message);
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
      toast.error('Insufficient credits! Need 100 credits to unlock.', { duration: 4000, position: 'top-center' });
      setTimeout(() => setShakeCredits(false), 500);
      throw new Error('Insufficient credits');
    }

    const originalCredits = credits;
    setCredits(prev => (prev !== null ? prev - 100 : null));
    setUnlockingReport(reportId);
    console.log(`unlockReport: Optimistically updated credits to ${credits - 100}`);

    try {
      const { data: reportCheck, error: checkError } = await supabase
        .from('reports')
        .select('unlocked_by')
        .eq('id', reportId)
        .single();

      if (checkError) throw new Error(`Failed to check report: ${checkError.message}`);

      const unlockedBy = reportCheck.unlocked_by || []; // Handle null or undefined
      if (unlockedBy.includes(user.id)) {
        console.log(`unlockReport: Report ${reportId} already purchased`);
        toast.error('Report already purchased.', { duration: 4000, position: 'top-center' });
        setCredits(originalCredits);
        throw new Error('Report already purchased');
      }

      let accessToken = user.access_token;
      if (!accessToken) accessToken = await refreshToken();

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
          console.log('unlockReport: Invalid JWT, retrying');
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
          if (!retryResponse.ok) throw new Error(`Retry failed: ${retryResponse.statusText}`);
        } else {
          throw new Error(`Failed to deduct credits: ${errorData.message || response.statusText}`);
        }
      }

      const { error: updateError } = await supabase
        .from('reports')
        .update({ unlocked_by: [...unlockedBy, user.id] })
        .eq('id', reportId);

      if (updateError) {
        console.error(`unlockReport: Failed to update report: ${updateError.message}`);
        toast.error('Failed to unlock report. Credits deducted. Contact support.', { duration: 6000, position: 'top-center' });
        throw new Error(`Failed to update report: ${updateError.message}`);
      }

      console.log('unlockReport: Report unlocked successfully');
      await fetchReports();
      const serverProfile = await fetchProfile();
      if (serverProfile?.credits !== null && serverProfile.credits !== credits) {
        setCredits(serverProfile.credits);
      }
    } catch (error: any) {
      setCredits(originalCredits);
      console.error('unlockReport: Error:', error.message);
      toast.error(error.message || 'Failed to unlock report.', { duration: 4000, position: 'top-center' });
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
            id,
            created_at,
            pdf_path,
            filename,
            unlocked_by,
            opportunity:opportunities(title)
          `,
            { count: 'exact' }
          )
          .in('opportunity_id', opportunityIds)
          .gte('created_at', `${dateFrom}T00:00:00+00:00`)
          .lte('created_at', `${dateTo}T23:59:59+00:00`)
          .order('created_at', { ascending: sortOrder === 'asc' })
          .range((currentPage.general - 1) * PAGE_SIZE, currentPage.general * PAGE_SIZE - 1);

        if (searchQuery) generalQuery = generalQuery.ilike('opportunity.title', `%${searchQuery}%`);

        const { data: generalData, error: generalError, count: generalCount } = await generalQuery;
        if (generalError) throw new Error(`Failed to fetch general reports: ${generalError.message}`);

        const generalReportsWithUrls = (generalData ?? []).map(report => ({
          ...report,
          signedUrl: supabase.storage.from('reports').getPublicUrl(report.pdf_path).data.publicUrl || '',
          purchased: report.unlocked_by?.includes(user.id) || false,
          filename: report.filename || 'Report',
        }));

        setGeneralReports(generalReportsWithUrls);
        setTotalPages(prev => ({
          ...prev,
          general: Math.ceil((generalCount || 0) / PAGE_SIZE),
        }));
      }

      let riskQuery = supabase
        .from('risk_analysis')
        .select(
          `
          id,
          created_at,
          status,
          report_url,
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

      if (searchQuery) riskQuery = riskQuery.or(`opportunity.title.ilike.%${searchQuery}%,profile.company_name.ilike.%${searchQuery}%`);
      if (statusFilter !== 'all') riskQuery = riskQuery.eq('status', statusFilter);

      const { data: riskData, error: riskError, count: riskCount } = await riskQuery;
      if (riskError) throw new Error(`Failed to fetch risk analysis reports: ${riskError.message}`);

      setRiskAnalysisReports(riskData || []);
      setTotalPages(prev => ({
        ...prev,
        risk_analysis: Math.ceil((riskCount || 0) / PAGE_SIZE),
      }));
    } catch (err: any) {
      console.error('fetchReports: Error:', err.message);
      setError(err.message || 'Failed to load reports.');
      toast.error(err.message || 'Failed to load reports.', { duration: 4000, position: 'top-center' });
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
    setShowFilters(false);
  };

  const renderSkeleton = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 px-4"
    >
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-gray-100 h-12 rounded animate-pulse" />
      ))}
    </motion.div>
  );

  const renderGeneralReports = () => {
    if (generalReports.length === 0 && !loading) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-12 px-4"
        >
          <div className="flex justify-center gap-4 mb-4">
            <Calendar className="w-10 h-10 text-gray-300" />
            <Frown className="w-10 h-10 text-gray-300" />
          </div>
          <p className="text-gray-800 text-base font-semibold mb-2">No Post-Event Reports Found</p>
          <p className="text-gray-500 text-sm">Adjust filters or contact your account manager.</p>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-3 px-4 pt-2"
      >
        <AnimatePresence>
          {generalReports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all"
              role="article"
            >
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-gray-900 truncate" aria-label={`Opportunity: ${report.opportunity?.title || 'N/A'}`}>
                  {report.opportunity?.title || 'N/A'}
                </h3>
                <p className="text-xs text-gray-500">Uploaded: {format(parseISO(report.created_at), 'MMM dd, yyyy')}</p>
                <div className="flex justify-end">
                  {report.purchased ? (
                    <motion.button
                      onClick={() => viewReport(report.signedUrl)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-blue-700 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={`View report ${report.filename || 'Report'}`}
                      data-tooltip-id={`view-tooltip-${report.id}`}
                      data-tooltip-content="View report in new tab"
                    >
                      View
                      <Eye size={16} />
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={() => unlockReport(report.id, report.signedUrl)}
                      disabled={unlockingReport === report.id}
                      className={`px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        unlockingReport === report.id ? 'animate-pulse' : ''
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={`Unlock report ${report.filename || 'Report'} for 100 credits`}
                      data-tooltip-id={`unlock-tooltip-${report.id}`}
                      data-tooltip-content="Unlock costs 100 credits"
                    >
                      {unlockingReport === report.id ? (
                        <>
                          Unlocking
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </>
                      ) : (
                        <>
                          Unlock
                          <Lock size={16} />
                        </>
                      )}
                    </motion.button>
                  )}
                  <Tooltip id={`view-tooltip-${report.id}`} place="top" className="text-xs z-50" />
                  <Tooltip id={`unlock-tooltip-${report.id}`} place="top" className="text-xs z-50" />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {currentPage[activeTab] < totalPages[activeTab] && (
          <motion.button
            onClick={() => setCurrentPage(prev => ({ ...prev, [activeTab]: prev[activeTab] + 1 }))}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            aria-label="Load more reports"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                Loading
                <svg className="animate-spin h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : (
              'Load More'
            )}
          </motion.button>
        )}
      </motion.div>
    );
  };

  const renderRiskAnalysisReports = () => {
    if (riskAnalysisReports.length === 0 && !loading) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-12 px-4"
        >
          <div className="flex justify-center gap-4 mb-4">
            <Calendar className="w-10 h-10 text-gray-300" />
            <Frown className="w-10 h-10 text-gray-300" />
          </div>
          <p className="text-gray-800 text-base font-semibold mb-2">No Risk Analysis Reports Found</p>
          <p className="text-gray-500 text-sm">Request a risk analysis or adjust filters.</p>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-3 px-4 pt-2"
      >
        <AnimatePresence>
          {riskAnalysisReports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all"
              role="article"
            >
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-gray-900 truncate" aria-label={`Opportunity: ${report.opportunity?.title || 'N/A'}`}>
                  {report.opportunity?.title || 'N/A'}
                </h3>
                <div className="flex justify-between items-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      report.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : report.status === 'in_progress'
                        ? 'bg-yellow-100 text-yellow-800'
                        : report.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                    aria-label={`Status: ${report.status ? report.status.charAt(0).toUpperCase() + report.status.slice(1) : 'N/A'}`}
                  >
                    {report.status ? report.status.charAt(0).toUpperCase() + report.status.slice(1) : 'N/A'}
                  </span>
                  {report.report_url ? (
                    <motion.button
                      onClick={() => viewReport(report.report_url!)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-blue-700 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="View risk analysis report"
                      data-tooltip-id={`view-tooltip-${report.id}`}
                      data-tooltip-content="View report in new tab"
                    >
                      View
                      <Eye size={16} />
                    </motion.button>
                  ) : (
                    <span className="text-gray-500 text-xs">Not available</span>
                  )}
                  <Tooltip id={`view-tooltip-${report.id}`} place="top" className="text-xs z-50" />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {currentPage[activeTab] < totalPages[activeTab] && (
          <motion.button
            onClick={() => setCurrentPage(prev => ({ ...prev, [activeTab]: prev[activeTab] + 1 }))}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            aria-label="Load more reports"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                Loading
                <svg className="animate-spin h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : (
              'Load More'
            )}
          </motion.button>
        )}
      </motion.div>
    );
  };

  const renderMobileContent = () => (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 bg-white shadow-sm z-20 px-4 py-4"
      >
        <h1 className="text-xl font-bold text-gray-900 mb-3">Reports</h1>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <motion.div
              animate={shakeCredits ? { x: [0, -10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2"
            >
              <img src={coinIcon} alt="Credits" className="w-5 h-5" data-tooltip-id="credits-tooltip" data-tooltip-content="Available credits" />
              <span className="text-sm font-semibold text-gray-800">{credits ?? 'N/A'}</span>
              <Tooltip id="credits-tooltip" place="top" className="text-xs z-50" />
            </motion.div>
            <motion.button
              onClick={() => window.location.assign('/purchase')}
              className="p-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Add credits"
              data-tooltip-id="add-credits-tooltip"
              data-tooltip-content="Add credits"
            >
              <Plus size={18} />
            </motion.button>
            <Tooltip id="add-credits-tooltip" place="top" className="text-xs z-50" />
          </div>
          <motion.button
            onClick={fetchReports}
            className="p-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Refresh reports"
          >
            <RefreshCw size={18} />
          </motion.button>
        </div>

        <div className="flex gap-2 mb-3 overflow-x-auto">
          <motion.button
            onClick={() => {
              setActiveTab('general');
              setCurrentPage(prev => ({ ...prev, general: 1 }));
            }}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex-shrink-0 ${
              activeTab === 'general' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-current={activeTab === 'general' ? 'page' : undefined}
            aria-label="View post-event reports"
          >
            Post-Event
          </motion.button>
          <motion.button
            onClick={() => {
              setActiveTab('risk_analysis');
              setCurrentPage(prev => ({ ...prev, risk_analysis: 1 }));
            }}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex-shrink-0 ${
              activeTab === 'risk_analysis' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-current={activeTab === 'risk_analysis' ? 'page' : undefined}
            aria-label="View risk analysis reports"
          >
            Risk Analysis
          </motion.button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search reports..."
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
              aria-label="Search reports"
            />
          </div>
          <motion.button
            onClick={() => setShowFilters(true)}
            className="p-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Open filters"
          >
            <Filter size={18} />
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 right-0 w-4/5 max-w-sm bg-white shadow-xl z-30 p-4"
            ref={filterRef}
            role="dialog"
            aria-labelledby="filter-heading"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 id="filter-heading" className="text-lg font-semibold text-gray-900">Filters</h2>
              <motion.button
                onClick={() => setShowFilters(false)}
                className="p-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Close filters"
              >
                <X size={18} />
              </motion.button>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700" htmlFor="sort-order">Sort Order</label>
                <motion.button
                  id="sort-order"
                  onClick={handleSortToggle}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors text-left"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={`Sort by date ${sortOrder === 'desc' ? 'oldest first' : 'newest first'}`}
                >
                  {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                </motion.button>
              </div>
              {activeTab === 'risk_analysis' && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700" htmlFor="status-filter">Status</label>
                  <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={e => {
                      setStatusFilter(e.target.value as typeof statusFilter);
                      setCurrentPage(prev => ({ ...prev, risk_analysis: 1 }));
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Filter by status"
                  >
                    <option value="all">All Statuses</option>
                    <option value="requested">Requested</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Date Range</label>
                <div className="flex flex-col gap-2">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Filter by start date"
                  />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Filter by end date"
                  />
                </div>
                <motion.button
                  onClick={handleDateFilter}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors mt-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Apply date filter"
                >
                  Apply
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black z-20"
          onClick={() => setShowFilters(false)}
          aria-hidden="true"
        />
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-4 mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-semibold text-center"
          role="alert"
        >
          {error}
        </motion.div>
      )}

      {loading ? renderSkeleton() : activeTab === 'general' ? renderGeneralReports() : renderRiskAnalysisReports()}
    </div>
  );

  const renderDesktopContent = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6"
    >
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl font-bold text-gray-900 mb-6"
      >
        Reports
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6 bg-white p-4 rounded-lg shadow-sm flex items-center justify-between"
      >
        <motion.div
          animate={shakeCredits ? { x: [0, -10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <img src={coinIcon} alt="Credits" className="w-6 h-6" data-tooltip-id="credits-tooltip" data-tooltip-content="Available credits" />
          <span className="text-sm font-semibold text-gray-800">{credits ?? 'N/A'}</span>
          <Tooltip id="credits-tooltip" place="top" className="text-xs z-50" />
        </motion.div>
        <motion.button
          onClick={() => window.location.assign('/purchase')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
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
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col gap-2 mb-6"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-wrap gap-2">
            <motion.button
              onClick={() => {
                setActiveTab('general');
                setCurrentPage(prev => ({ ...prev, general: 1 }));
              }}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
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
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                activeTab === 'risk_analysis' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              } min-w-[120px]`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-current={activeTab === 'risk_analysis' ? 'page' : undefined}
            >
              Risk Analysis
            </motion.button>
          </div>
          <div className="relative w-full max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search by title or company..."
              onChange={handleSearch}
              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Search reports"
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col gap-3 mb-6"
      >
        <div className="flex flex-col sm:flex-row gap-2 justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <motion.button
              onClick={handleSortToggle}
              className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 text-sm font-semibold transition-colors"
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
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px]"
                  aria-label="Filter by status"
                >
                  <option value="all">All Statuses</option>
                  <option value="requested">Requested</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[140px]"
              aria-label="Filter by start date"
            />
            <span className="text-gray-600 text-sm">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[140px]"
              aria-label="Filter by end date"
            />
            <motion.button
              onClick={handleDateFilter}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Refresh reports"
          >
            <RefreshCw size={16} />
            Refresh
          </motion.button>
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-semibold text-center"
          role="alert"
        >
          {error}
        </motion.div>
      )}

      {loading ? (
        renderSkeleton()
      ) : activeTab === 'general' ? (
        generalReports.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center py-12"
            role="alert"
          >
            <Frown className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No Post-Event Reports Found</h3>
            <p className="mt-1 text-sm text-gray-500">Adjust filters or contact your account manager.</p>
          </motion.div>
        ) : (
          <motion.table
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="min-w-full divide-y divide-gray-200"
          >
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Opportunity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Uploaded
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {generalReports.map(report => (
                <motion.tr
                  key={report.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 * generalReports.indexOf(report) }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900 truncate max-w-xs">{report.opportunity?.title ?? 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{format(parseISO(report.created_at), 'MMM d, yyyy')}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold">
                    {report.purchased ? (
                      <motion.button
                        onClick={() => viewReport(report.signedUrl)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors text-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={`View report ${report.filename || 'Report'}`}
                        data-tooltip-id={`view-tooltip-${report.id}`}
                        data-tooltip-content="View report in new tab"
                      >
                        View
                        <Eye size={16} />
                      </motion.button>
                    ) : (
                      <motion.button
                        onClick={() => unlockReport(report.id, report.signedUrl)}
                        disabled={unlockingReport === report.id}
                        className={`px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
                          unlockingReport === report.id ? 'animate-pulse' : ''
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={`Unlock report ${report.filename || 'Report'} for 100 credits`}
                        data-tooltip-id={`unlock-tooltip-${report.id}`}
                        data-tooltip-content="Unlock costs 100 credits"
                      >
                        {unlockingReport === report.id ? (
                          <>
                            Unlocking
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </>
                        ) : (
                          <>
                            Unlock
                            <Lock size={16} />
                          </>
                        )}
                      </motion.button>
                    )}
                    <Tooltip id={`view-tooltip-${report.id}`} place="top" className="text-xs z-50" />
                    <Tooltip id={`unlock-tooltip-${report.id}`} place="top" className="text-xs z-50" />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </motion.table>
        )
      ) : (
        riskAnalysisReports.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center py-12"
            role="alert"
          >
            <Frown className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No Risk Analysis Reports Found</h3>
            <p className="mt-1 text-sm text-gray-500">Request a risk analysis or adjust filters.</p>
          </motion.div>
        ) : (
          <motion.table
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="min-w-full divide-y divide-gray-200"
          >
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Opportunity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {riskAnalysisReports.map(report => (
                <motion.tr
                  key={report.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 * riskAnalysisReports.indexOf(report) }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900 truncate max-w-xs">{report.opportunity?.title ?? 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-700 truncate max-w-xs">{report.profile?.company_name ?? 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        report.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : report.status === 'in_progress'
                          ? 'bg-yellow-100 text-yellow-800'
                          : report.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                      aria-label={`Status: ${report.status ? report.status.charAt(0).toUpperCase() + report.status.slice(1) : 'N/A'}`}
                    >
                      {report.status ? report.status.charAt(0).toUpperCase() + report.status.slice(1) : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{format(parseISO(report.created_at), 'MMM d, yyyy')}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold">
                    {report.report_url ? (
                      <motion.button
                        onClick={() => viewReport(report.report_url!)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors text-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label="View risk analysis report"
                        data-tooltip-id={`view-risk-tooltip-${report.id}`}
                        data-tooltip-content="View report in new tab"
                      >
                        View
                        <Eye size={16} />
                      </motion.button>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                    <Tooltip id={`view-risk-tooltip-${report.id}`} place="top" className="text-xs z-50" />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </motion.table>
        )
      )}
      {totalPages[activeTab] > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex items-center justify-between gap-2 mt-6 px-4"
        >
          <motion.button
            onClick={() => setCurrentPage(prev => ({ ...prev, [activeTab]: prev[activeTab] - 1 }))}
            disabled={currentPage[activeTab] === 1 || loading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Previous page"
          >
            Previous
          </motion.button>
          <div className="flex gap-1">
            {[...Array(totalPages[activeTab])].map((_, i) => (
              <motion.button
                key={i}
                onClick={() => setCurrentPage(prev => ({ ...prev, [activeTab]: i + 1 }))}
                className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                  currentPage[activeTab] === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-current={currentPage[activeTab] === i + 1 ? 'page' : undefined}
              >
                {i + 1}
              </motion.button>
            ))}
          </div>
          <motion.button
            onClick={() => setCurrentPage(prev => ({ ...prev, [activeTab]: prev[activeTab] + 1 }))}
            disabled={currentPage[activeTab] === totalPages[activeTab] || loading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Next page"
          >
            Next
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="hidden sm:block bg-white rounded-xl shadow-lg"
      >
        {renderDesktopContent()}
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="block sm:hidden"
      >
        {renderMobileContent()}
      </motion.div>
    </>
  );
}