import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { format, parseISO, subDays } from 'date-fns';
import { ExternalLink, File, Download, Search, RefreshCw, Filter } from 'lucide-react';
import debounce from 'lodash.debounce';
import type { Database } from '../../lib/database.types';

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
  // State management
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const modalRef = useRef<HTMLDialogElement>(null);

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query);
      setCurrentPage(prev => ({ ...prev, [activeTab]: 1 }));
    }, 300),
    [activeTab]
  );

  // Fetch reports from Supabase
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Authenticate user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Authentication failed. Please log in again.');
      }
      setUserId(user.id);

      // Fetch opportunity_ids for accepted matches
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('opportunity_id')
        .eq('brand_id', user.id)
        .eq('status', 'accepted');

      if (matchError) {
        throw new Error(`Failed to fetch matches: ${matchError.message}`);
      }

      // Extract opportunity_ids as an array, default to empty array if no matches
      const opportunityIds = matchData?.map(match => match.opportunity_id) || [];
      if (opportunityIds.length === 0) {
        setGeneralReports([]);
        setTotalPages(prev => ({ ...prev, general: 1 }));
      } else {
        // Fetch post-event reports for accepted matches
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
          generalQuery.ilike('opportunity.title', `%${searchQuery}%`);
        }

        const { data: generalData, error: generalError, count: generalCount } = await generalQuery;

        if (generalError) {
          throw new Error(`Failed to fetch post-event reports: ${generalError.message}`);
        }

        const generalReportsWithUrls = generalData?.map(report => ({
          ...report,
          signedUrl: supabase.storage.from('reports').getPublicUrl(report.pdf_path).data.publicUrl,
        })) || [];

        setGeneralReports(generalReportsWithUrls);
        setTotalPages(prev => ({
          ...prev,
          general: Math.ceil((generalCount ?? 0) / PAGE_SIZE),
        }));
      }

      // Fetch risk analysis reports
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
        riskQuery.or(`opportunity.title.ilike.%${searchQuery}%,profile.company_name.ilike.%${searchQuery}%`);
      }

      if (statusFilter !== 'all') {
        riskQuery.eq('status', statusFilter);
      }

      const { data: riskData, error: riskError, count: riskCount } = await riskQuery;

      if (riskError) {
        throw new Error(`Failed to fetch risk analysis reports: ${riskError.message}`);
      }

      setRiskAnalysisReports(riskData || []);
      setTotalPages(prev => ({
        ...prev,
        risk_analysis: Math.ceil((riskCount ?? 0) / PAGE_SIZE),
      }));
    } catch (err: any) {
      console.error('Error fetching reports:', err);
      const errorMessage = err.message || 'Failed to load reports. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery, sortOrder, statusFilter, dateFrom, dateTo, currentPage]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages[activeTab]) return;
    setCurrentPage(prev => ({ ...prev, [activeTab]: page }));
  };

  // Handle sort toggle
  const handleSortToggle = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    setCurrentPage(prev => ({ ...prev, [activeTab]: 1 }));
  };

  // Handle date filter
  const handleDateFilter = () => {
    if (!dateFrom || !dateTo) {
      toast.error('Please select both start and end dates.');
      return;
    }
    if (new Date(dateFrom) > new Date(dateTo)) {
      toast.error('Start date cannot be after end date.');
      return;
    }
    setCurrentPage(prev => ({ ...prev, [activeTab]: 1 }));
    fetchReports();
  };

  // Handle preview
  const handlePreview = (url: string) => {
    if (!url) {
      toast.error('Invalid report URL.');
      return;
    }
    setPreviewUrl(url);
    modalRef.current?.showModal();
  };

  // Render skeleton loading
  const renderSkeleton = () => (
    <div className="space-y-3 p-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-gray-100 h-20 rounded-lg animate-pulse"></div>
      ))}
    </div>
  );

  // Filter reports client-side for additional search precision
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

  // Render post-event reports
  const renderGeneralReports = () => {
    if (filteredGeneralReports.length === 0 && !loading) {
      return (
        <div className="p-4 text-center" role="alert">
          <File className="mx-auto text-gray-300" size={36} />
          <p className="mt-3 text-gray-600 text-base font-medium">No post-event reports found</p>
          <p className="mt-1 text-gray-500 text-xs">No accepted matches have associated reports. Contact your account manager for assistance.</p>
        </div>
      );
    }

    return (
      <>
        {/* Mobile Card Layout */}
        <div className="grid grid-cols-1 gap-3 p-3 sm:hidden">
          {filteredGeneralReports.map(report => (
            <div
              key={report.id}
              className="bg-white rounded-lg shadow-sm p-3 border border-gray-100 hover:shadow-md transition-shadow"
              role="article"
            >
              <div className="space-y-2">
                <div>
                  <span className="text-[10px] font-semibold text-gray-500 uppercase">Opportunity</span>
                  <p className="text-sm font-medium text-gray-900 truncate">{report.opportunity?.title || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-gray-500 uppercase">File</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <button
                      onClick={() => handlePreview(report.signedUrl)}
                      className="text-blue-600 hover:underline flex items-center text-xs truncate max-w-[140px]"
                      aria-label={`Preview ${report.filename}`}
                    >
                      {report.filename}
                      <ExternalLink size={12} className="ml-1" />
                    </button>
                    <a
                      href={report.signedUrl}
                      download={report.filename}
                      type="application/pdf"
                      className="text-green-600 hover:text-green-700"
                      aria-label={`Download ${report.filename}`}
                    >
                      <Download size={12} />
                    </a>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-gray-500 uppercase">Uploaded</span>
                  <p className="text-xs text-gray-500">{format(parseISO(report.created_at), 'MMM dd, yyyy')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Desktop Table Layout */}
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
              {filteredGeneralReports.map(report => (
                <tr key={report.id} className="hover:bg-gray-50" role="row">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900" role="gridcell">
                    {report.opportunity?.title || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm" role="gridcell">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePreview(report.signedUrl)}
                        className="text-blue-600 hover:underline flex items-center text-sm truncate max-w-[180px]"
                        aria-label={`Preview ${report.filename}`}
                      >
                        {report.filename}
                        <ExternalLink size={14} className="ml-1" />
                      </button>
                      <a
                        href={report.signedUrl}
                        download={report.filename}
                        type="application/pdf"
                        className="text-green-600 hover:text-green-700"
                        aria-label={`Download ${report.filename}`}
                      >
                        <Download size={14} />
                      </a>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500" role="gridcell">
                    {format(parseISO(report.created_at), 'MMM dd, yyyy')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  // Render risk analysis reports
  const renderRiskAnalysisReports = () => {
    if (filteredRiskAnalysisReports.length === 0 && !loading) {
      return (
        <div className="p-4 text-center" role="alert">
          <File className="mx-auto text-gray-300" size={36} />
          <p className="mt-3 text-gray-600 text-base font-medium">No risk analysis reports found</p>
          <p className="mt-1 text-gray-500 text-xs">Request a risk analysis for your opportunities.</p>
        </div>
      );
    }

    return (
      <>
        {/* Mobile Card Layout */}
        <div className="grid grid-cols-1 gap-3 p-3 sm:hidden">
          {filteredRiskAnalysisReports.map(report => (
            <div
              key={report.id}
              className="bg-white rounded-lg shadow-sm p-3 border border-gray-100 hover:shadow-md transition-shadow"
              role="article"
            >
              <div className="space-y-2">
                <div>
                  <span className="text-[10px] font-semibold text-gray-500 uppercase">Opportunity</span>
                  <p className="text-sm font-medium text-gray-900 truncate">{report.opportunity?.title || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-gray-500 uppercase">Company</span>
                  <p className="text-sm text-gray-900 truncate">{report.profile?.company_name || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-gray-500 uppercase">Status</span>
                  <p className="text-sm">
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] ${
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
                  <span className="text-[10px] font-semibold text-gray-500 uppercase">File</span>
                  <div className="flex items-center space-x-2 mt-1">
                    {report.report_url ? (
                      <>
                        <button
                          onClick={() => handlePreview(report.report_url)}
                          className="text-blue-600 hover:underline flex items-center text-xs truncate max-w-[140px]"
                          aria-label="Preview report"
                        >
                          Report
                          <ExternalLink size={12} className="ml-1" />
                        </button>
                        <a
                          href={report.report_url}
                          download={`risk_analysis_${report.id}.pdf`}
                          type="application/pdf"
                          className="text-green-600 hover:text-green-700"
                          aria-label="Download report"
                        >
                          <Download size={12} />
                        </a>
                      </>
                    ) : (
                      <span className="text-gray-500 text-xs">No report uploaded</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-gray-500 uppercase">Requested</span>
                  <p className="text-xs text-gray-500">{format(parseISO(report.created_at || new Date()), 'MMM dd, yyyy')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Desktop Table Layout */}
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
              {filteredRiskAnalysisReports.map(report => (
                <tr key={report.id} className="hover:bg-gray-50" role="row">
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
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePreview(report.report_url)}
                          className="text-blue-600 hover:underline flex items-center text-sm truncate max-w-[180px]"
                          aria-label="Preview report"
                        >
                          Report
                          <ExternalLink size={14} className="ml-1" />
                        </button>
                        <a
                          href={report.report_url}
                          download={`risk-report-${report.id}.pdf`}
                          type="application/pdf"
                          className="text-green-600 hover:text-green-700"
                          aria-label="Download report"
                        >
                          <Download size={14} />
                        </a>
                      </div>
                    ) : (
                      <span className="text-gray-500">No report</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500" role="gridcell">
                    {format(parseISO(report.created_at || new Date()), 'MMM dd, yyyy')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  // Render pagination
  const renderPagination = () => {
    const pages = totalPages[activeTab];
    if (pages <= 1) return null;

    return (
      <div className="flex flex-wrap justify-center items-center gap-2 mt-4 px-3">
        <button
          onClick={() => handlePageChange(currentPage[activeTab] - 1)}
          disabled={currentPage[activeTab] === 1}
          className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 disabled:opacity-50 hover:bg-gray-200 text-xs font-medium min-w-[44px] transition-colors"
          aria-label="Previous page"
        >
          Previous
        </button>
        {[...Array(pages)].map((_, i) => (
          <button
            key={i}
            onClick={() => handlePageChange(i + 1)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium min-w-[44px] ${
              currentPage[activeTab] === i + 1
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } transition-colors`}
            aria-current={currentPage[activeTab] === i + 1 ? 'page' : undefined}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage[activeTab] + 1)}
          disabled={currentPage[activeTab] === pages}
          className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 disabled:opacity-50 hover:bg-gray-200 text-xs font-medium min-w-[44px] transition-colors"
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mx-2 sm:mx-4 md:mx-auto max-w-[100vw] overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-4">
        <h2 className="text-xl sm:text-lg font-bold text-gray-900">Your Reports</h2>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setActiveTab('general');
                setCurrentPage(prev => ({ ...prev, general: 1 }));
              }}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                activeTab === 'general'
                  ? 'bg-blue-50 text-blue-700 bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              } min-w-[100px]`}
              aria-current={activeTab === 'general' ? 'page' : undefined}
            >
              Post-Event Reports
            </button>
            <button
              onClick={() => {
                setActiveTab('risk_analysis');
                setCurrentPage(prev => ({ ...prev, risk_analysis: 1 }));
              }}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                activeTab === 'risk_analysis'
                  ? 'bg-blue-50 text-blue-700 bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent'
                  : 'text-gray-600 hover:bg-gray-100'
              } min-w-[100px]`}
              aria-current={activeTab === 'risk_analysis' ? 'page' : undefined}
            >
              Risk Analysis
            </button>
          </div>
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by title or company..."
              onChange={handleSearch}
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              aria-label="Search reports"
            />
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSortToggle}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-xs font-medium min-w-[80px] transition-colors"
              aria-label={`Sort by date ${sortOrder === 'desc' ? 'oldest first' : 'newest first'}`}
            >
              Sort: {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
            </button>
            {activeTab === 'risk_analysis' && (
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={e => {
                    setStatusFilter(e.target.value as typeof statusFilter);
                    setCurrentPage(prev => ({ ...prev, risk_analysis: 1 }));
                  }}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-xs font-medium appearance-none pr-6 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[100px]"
                  aria-label="Filter by status"
                >
                  <option value="all">All Statuses</option>
                  <option value="requested">Requested</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
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
              className="px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[130px]"
              aria-label="Filter by start date"
            />
            <span className="text-gray-500 text-xs font-medium">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[130px]"
              aria-label="Filter by end date"
            />
            <button
              onClick={handleDateFilter}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs font-medium min-w-[60px] transition-colors"
              aria-label="Apply date filter"
            >
              Apply
            </button>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={fetchReports}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs font-medium flex items-center min-w-[80px] transition-colors"
            aria-label="Refresh reports"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Refresh
          </button>
        </div>
      </div>

      {/* Content */}
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md mb-3 text-sm" role="alert">
          {error}
        </div>
      )}
      {loading ? renderSkeleton() : activeTab === 'general' ? renderGeneralReports() : renderRiskAnalysisReports()}
      {renderPagination()}

      {/* Preview Modal */}
      <dialog ref={modalRef} className="rounded-lg p-0 w-[95vw] max-w-[95vw] sm:max-w-2xl max-h-[90vh] backdrop:bg-black/70">
        <div className="flex justify-between items-center p-3 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Report Preview</h3>
          <button
            onClick={() => modalRef.current?.close()}
            className="text-gray-500 hover:text-gray-700 p-1 rounded"
            aria-label="Close preview"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-3 overflow-y-auto">
          {previewUrl && (
            <iframe
              src={previewUrl}
              className="w-full h-[60vh] sm:h-[400px] border border-gray-200 rounded"
              title="Report preview"
            />
          )}
        </div>
      </dialog>
    </div>
  );
}