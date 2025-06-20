import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { format, subDays } from 'date-fns';
import type { Database } from '../../lib/database.types';
import { useAuth } from '../../contexts/AuthContext';
import Header from './Reports/Header';
import Filters from './Reports/Filters';
import GeneralReports from './Reports/GeneralReports';
import RiskAnalysisReports from './Reports/RiskAnalysisReports';
import Pagination from './Reports/Pagination';
import { motion } from 'framer-motion';

// Type definitions
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
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<'all' | 'requested' | 'in_progress' | 'completed' | 'rejected'>('all');
  const [dateFrom, setDateFrom] = useState<string>(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [currentPage, setCurrentPage] = useState<{ general: number; risk_analysis: number }>({ general: 1, risk_analysis: 1 });
  const [credits, setCredits] = useState<number | null>(profile?.credits ?? null);
  const [shakeCredits, setShakeCredits] = useState<boolean>(false);
  const [unlockingReport, setUnlockingReport] = useState<string | null>(null);

  useEffect(() => {
    setCredits(profile?.credits ?? null);
  }, [profile?.credits]);

  // Filter reports client-side based on searchTerm
  const filteredGeneralReports = generalReports.filter(report =>
    report.opportunity?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRiskAnalysisReports = riskAnalysisReports.filter(report =>
    report.opportunity?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.profile?.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate total pages for filtered data
  const totalPages = {
    general: Math.ceil(filteredGeneralReports.length / PAGE_SIZE),
    risk_analysis: Math.ceil(filteredRiskAnalysisReports.length / PAGE_SIZE),
  };

  // Paginate filtered reports
  const paginatedGeneralReports = filteredGeneralReports.slice(
    (currentPage.general - 1) * PAGE_SIZE,
    currentPage.general * PAGE_SIZE
  );

  const paginatedRiskAnalysisReports = filteredRiskAnalysisReports.slice(
    (currentPage.risk_analysis - 1) * PAGE_SIZE,
    currentPage.risk_analysis * PAGE_SIZE
  );

  // Reset page when searchTerm changes
  useEffect(() => {
    setCurrentPage(prev => ({ ...prev, [activeTab]: 1 }));
  }, [searchTerm, activeTab]);

  const fetchProfile = async (): Promise<{ credits: number | null; company_name: string | null } | null> => {
    if (!user?.id) {
      toast.error('Please log in to access profile data.');
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
      return data;
    } catch (error: any) {
      toast.error('Failed to fetch profile data.');
      return null;
    }
  };

  const refreshToken = async (): Promise<string> => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      if (!data.session?.access_token) throw new Error('No access token');
      return data.session.access_token;
    } catch (error: any) {
      toast.error('Session refresh failed. Please log in again.');
      throw error;
    }
  };

  const unlockReport = async (reportId: string, url: string): Promise<void> => {
    if (!user?.id || !url || credits === null || credits < 100) {
      setShakeCredits(true);
      toast.error(credits === null || credits < 100 ? 'Insufficient credits!' : 'Please log in or invalid URL.');
      setTimeout(() => setShakeCredits(false), 500);
      return;
    }

    const originalCredits = credits;
    setCredits(credits - 100);
    setUnlockingReport(reportId);

    try {
      const { data: reportCheck, error: checkError } = await supabase
        .from('reports')
        .select('unlocked_by')
        .eq('id', reportId)
        .single();
      if (checkError) throw checkError;

      const unlockedBy = reportCheck.unlocked_by || [];
      if (unlockedBy.includes(user.id)) {
        toast.error('Report already purchased.');
        setCredits(originalCredits);
        return;
      }

      let accessToken = user.access_token || (await refreshToken());
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-credits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ userId: user.id, creditsToDeduct: 100 }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          accessToken = await refreshToken();
          const retryResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-credits`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
            body: JSON.stringify({ userId: user.id, creditsToDeduct: 100 }),
          });
          if (!retryResponse.ok) throw new Error('Retry failed');
        } else {
          throw new Error('Failed to deduct credits');
        }
      }

      const { error: updateError } = await supabase
        .from('reports')
        .update({ unlocked_by: [...unlockedBy, user.id] })
        .eq('id', reportId);
      if (updateError) throw updateError;

      await fetchReports();
      const serverProfile = await fetchProfile();
      if (serverProfile?.credits !== null) setCredits(serverProfile.credits);
    } catch (error: any) {
      setCredits(originalCredits);
      toast.error('Failed to unlock report.');
    } finally {
      setUnlockingReport(null);
    }
  };

  const viewReport = (url: string) => {
    if (!url) {
      toast.error('Invalid report URL.');
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
      if (matchError) throw matchError;

      const opportunityIds = matchData?.map(match => match.opportunity_id) || [];
      if (opportunityIds.length === 0) {
        setGeneralReports([]);
      } else {
        let generalQuery = supabase
          .from('reports')
          .select(
            `id, created_at, pdf_path, filename, unlocked_by, opportunity:opportunities(title)`
          )
          .in('opportunity_id', opportunityIds)
          .gte('created_at', `${dateFrom}T00:00:00+00:00`)
          .lte('created_at', `${dateTo}T23:59:59+00:00`)
          .order('created_at', { ascending: sortOrder === 'asc' });

        const { data: generalData, error: generalError } = await generalQuery;
        if (generalError) throw generalError;

        const generalReportsWithUrls = (generalData ?? []).map(report => ({
          ...report,
          signedUrl: supabase.storage.from('reports').getPublicUrl(report.pdf_path).data.publicUrl || '',
          purchased: report.unlocked_by?.includes(user.id) || false,
          filename: report.filename || 'Report',
        }));

        setGeneralReports(generalReportsWithUrls);
      }

      let riskQuery = supabase
        .from('risk_analysis')
        .select(
          `id, created_at, status, report_url, opportunity:opportunities(title), profile:profiles(company_name)`
        )
        .eq('user_id', user.id)
        .gte('created_at', `${dateFrom}T00:00:00+00:00`)
        .lte('created_at', `${dateTo}T23:59:59+00:00`)
        .order('created_at', { ascending: sortOrder === 'asc' });

      if (statusFilter !== 'all') riskQuery = riskQuery.eq('status', statusFilter);

      const { data: riskData, error: riskError } = await riskQuery;
      if (riskError) throw riskError;

      setRiskAnalysisReports(riskData || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load reports.');
      toast.error(err.message || 'Failed to load reports.');
    } finally {
      setLoading(false);
    }
  }, [sortOrder, statusFilter, dateFrom, dateTo, user?.id]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleSortToggle = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    setCurrentPage(prev => ({ ...prev, [activeTab]: 1 }));
  };

  const handleDateFilter = () => {
    if (!dateFrom || !dateTo || new Date(dateFrom) > new Date(dateTo)) {
      toast.error('Invalid date range.');
      return;
    }
    setCurrentPage(prev => ({ ...prev, [activeTab]: 1 }));
    setSearchTerm(''); // Reset search term when applying filters
    fetchReports();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="hidden sm:block bg-white rounded-xl shadow-lg p-6">
        <Header
          credits={credits}
          shakeCredits={shakeCredits}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setCurrentPage={setCurrentPage}
          setSearchTerm={setSearchTerm}
        />
        <Filters
          activeTab={activeTab}
          sortOrder={sortOrder}
          statusFilter={statusFilter}
          dateFrom={dateFrom}
          dateTo={dateTo}
          setStatusFilter={setStatusFilter}
          setDateFrom={setDateFrom}
          setDateTo={setDateTo}
          handleSortToggle={handleSortToggle}
          handleDateFilter={handleDateFilter}
          fetchReports={fetchReports}
          setCurrentPage={setCurrentPage}
          setSearchTerm={setSearchTerm}
        />
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-semibold text-center"
            role="alert"
          >
            {error}
          </motion.div>
        )}
        {activeTab === 'general' ? (
          <GeneralReports
            reports={paginatedGeneralReports}
            loading={loading}
            unlockingReport={unlockingReport}
            unlockReport={unlockReport}
            viewReport={viewReport}
          />
        ) : (
          <RiskAnalysisReports
            reports={paginatedRiskAnalysisReports}
            loading={loading}
            viewReport={viewReport}
          />
        )}
        {totalPages[activeTab] > 1 && (
          <Pagination
            currentPage={currentPage[activeTab]}
            totalPages={totalPages[activeTab]}
            setCurrentPage={page => setCurrentPage(prev => ({ ...prev, [activeTab]: page }))}
            loading={loading}
          />
        )}
      </div>
      <div className="block sm:hidden">
        <Header
          credits={credits}
          shakeCredits={shakeCredits}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setCurrentPage={setCurrentPage}
          setSearchTerm={setSearchTerm}
          isMobile={true}
        />
        <Filters
          activeTab={activeTab}
          sortOrder={sortOrder}
          statusFilter={statusFilter}
          dateFrom={dateFrom}
          dateTo={dateTo}
          setStatusFilter={setStatusFilter}
          setDateFrom={setDateFrom}
          setDateTo={setDateTo}
          handleSortToggle={handleSortToggle}
          handleDateFilter={handleDateFilter}
          fetchReports={fetchReports}
          setCurrentPage={setCurrentPage}
          setSearchTerm={setSearchTerm}
          isMobile={true}
        />
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
        {activeTab === 'general' ? (
          <GeneralReports
            reports={paginatedGeneralReports}
            loading={loading}
            unlockingReport={unlockingReport}
            unlockReport={unlockReport}
            viewReport={viewReport}
            isMobile={true}
          />
        ) : (
          <RiskAnalysisReports
            reports={paginatedRiskAnalysisReports}
            loading={loading}
            viewReport={viewReport}
            isMobile={true}
          />
        )}
        {totalPages[activeTab] > 1 && (
          <Pagination
            currentPage={currentPage[activeTab]}
            totalPages={totalPages[activeTab]}
            setCurrentPage={page => setCurrentPage(prev => ({ ...prev, [activeTab]: page }))}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}