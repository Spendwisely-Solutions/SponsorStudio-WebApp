import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';
import { 
  Search, 
  FileText, 
  XCircle, 
  CheckCircle, 
  Clock, 
  Upload,
  RefreshCw,
  Eye,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Building2
} from 'lucide-react';

interface RiskAnalysisRequest {
  id: string;
  user_id: string;
  opportunity_id: string;
  status: 'requested' | 'in_progress' | 'completed' | 'rejected';
  report_url: string | null;
  created_at: string;
  updated_at: string;
  profiles: {
    company_name: string;
  } | null;
  opportunities: {
    title: string;
  } | null;
}

interface RiskAnalysisRequestsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const RiskAnalysisRequests: React.FC<RiskAnalysisRequestsProps> = ({ searchTerm, setSearchTerm }) => {
  const [requests, setRequests] = useState<RiskAnalysisRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingRequests, setUpdatingRequests] = useState(new Set<string>());
  const [filter, setFilter] = useState<'all' | 'requested' | 'in_progress' | 'completed' | 'rejected'>('all');
  const [stats, setStats] = useState({
    total: 0,
    requested: 0,
    in_progress: 0,
    completed: 0,
    rejected: 0
  });

  // Helper functions
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'in_progress':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('risk_analysis')
        .select(`
          id,
          user_id,
          opportunity_id,
          status,
          report_url,
          created_at,
          updated_at,
          profiles:user_id (company_name),
          opportunities:opportunity_id (title)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedData: RiskAnalysisRequest[] = (data || []).map(item => ({
        ...item,
        profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles,
        opportunities: Array.isArray(item.opportunities) ? item.opportunities[0] : item.opportunities
      }));
      
      setRequests(formattedData);
      
      // Calculate stats
      const newStats = {
        total: formattedData.length,
        requested: formattedData.filter(r => r.status === 'requested').length,
        in_progress: formattedData.filter(r => r.status === 'in_progress').length,
        completed: formattedData.filter(r => r.status === 'completed').length,
        rejected: formattedData.filter(r => r.status === 'rejected').length
      };
      setStats(newStats);
    } catch (error) {
      console.error('Error fetching risk analysis requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRequest = async (requestId: string, updates: Partial<RiskAnalysisRequest>) => {
    setUpdatingRequests(prev => new Set([...prev, requestId]));
    try {
      const { error } = await supabase
        .from('risk_analysis')
        .update(updates)
        .eq('id', requestId);

      if (error) throw error;

      setRequests(prev =>
        prev.map(req => (req.id === requestId ? { ...req, ...updates } : req))
      );
      toast.success('Request updated successfully');
      
      // Refresh to get updated stats
      await fetchRequests();
    } catch (error) {
      console.error('Error updating risk analysis request:', error);
      toast.error('Failed to update request');
    } finally {
      setUpdatingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const handleFileUpload = async (requestId: string, file: File) => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUpdatingRequests(prev => new Set([...prev, requestId]));

    try {
      const fileName = `${requestId}_${Date.now()}_${file.name}`;

      // Read file as ArrayBuffer and convert to Uint8Array
      const arrayBuffer = await file.arrayBuffer();
      const fileData = new Uint8Array(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from('risk-analysis-reports')
        .upload(fileName, fileData, {
          contentType: 'application/pdf',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('risk-analysis-reports')
        .getPublicUrl(fileName);

      if (!urlData?.publicUrl) throw new Error('Failed to get public URL');

      await handleUpdateRequest(requestId, {
        report_url: urlData.publicUrl,
        status: 'completed',
      });

      toast.success('Report uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload report');
    } finally {
      setUpdatingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.profiles?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.opportunities?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || req.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
              Risk Analysis Requests
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage and review risk analysis reports</p>
          </div>
          <div className="hidden sm:block">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6">
        <div className="bg-white/70 backdrop-blur-md p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 sm:mb-0">
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Total Requests</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              <p className="text-xs sm:text-sm text-blue-600 font-medium mt-1">All requests</p>
            </div>
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center self-end sm:self-auto">
              <TrendingUp className="text-white" size={16} />
            </div>
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-md p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 sm:mb-0">
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Requested</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1">{stats.requested}</p>
              <p className="text-xs sm:text-sm text-blue-600 font-medium mt-1">Pending review</p>
            </div>
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center self-end sm:self-auto">
              <AlertTriangle className="text-white" size={16} />
            </div>
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-md p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 sm:mb-0">
              <p className="text-xs sm:text-sm text-gray-600 font-medium">In Progress</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1">{stats.in_progress}</p>
              <p className="text-xs sm:text-sm text-yellow-600 font-medium mt-1">Being processed</p>
            </div>
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg sm:rounded-xl flex items-center justify-center self-end sm:self-auto">
              <Clock className="text-white" size={16} />
            </div>
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-md p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 sm:mb-0">
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Completed</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1">{stats.completed}</p>
              <p className="text-xs sm:text-sm text-green-600 font-medium mt-1">Reports ready</p>
            </div>
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg sm:rounded-xl flex items-center justify-center self-end sm:self-auto">
              <CheckCircle className="text-white" size={16} />
            </div>
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-md p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 sm:mb-0">
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Rejected</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1">{stats.rejected}</p>
              <p className="text-xs sm:text-sm text-red-600 font-medium mt-1">Not approved</p>
            </div>
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg sm:rounded-xl flex items-center justify-center self-end sm:self-auto">
              <XCircle className="text-white" size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/70 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-lg border border-gray-200/50 p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by company or opportunity..."
                className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200 text-sm sm:text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              className="px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-medium min-w-[120px] text-sm sm:text-base"
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
            >
              <option value="all">All Status</option>
              <option value="requested">🔵 Requested</option>
              <option value="in_progress">🟡 In Progress</option>
              <option value="completed">🟢 Completed</option>
              <option value="rejected">🔴 Rejected</option>
            </select>
            <button
              onClick={fetchRequests}
              className="p-2.5 sm:p-3 text-gray-600 hover:text-red-600 border border-gray-200 rounded-lg sm:rounded-xl hover:bg-red-50 transition-all duration-200 hover:shadow-md flex items-center justify-center"
              title="Refresh data"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white/70 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
        {loading ? (
          <div className="p-6 sm:p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-spin mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Loading Requests</h3>
            <p className="text-sm sm:text-base text-gray-600">Fetching risk analysis requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-6 sm:p-12 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Requests Found</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              {searchTerm ? `No requests match "${searchTerm}"` : 'No risk analysis requests found with current filters'}
            </p>
            <button
              onClick={fetchRequests}
              className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-medium rounded-lg sm:rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-lg text-sm sm:text-base"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Opportunity</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50">
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50/50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{req.profiles?.company_name || 'N/A'}</div>
                            <div className="text-xs text-gray-500">Company</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={req.opportunities?.title}>
                          {req.opportunities?.title || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(req.status)}
                          <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(req.status)}`}>
                            {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-2" />
                          {formatDate(req.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {req.status === 'requested' && (
                            <>
                              <button
                                onClick={() => handleUpdateRequest(req.id, { status: 'in_progress' })}
                                disabled={updatingRequests.has(req.id)}
                                className="inline-flex items-center px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 text-xs font-medium transition-colors duration-200 disabled:opacity-50"
                                title="Mark as In Progress"
                              >
                                <Clock className="w-3 h-3 mr-1" />
                                In Progress
                              </button>
                              <button
                                onClick={() => handleUpdateRequest(req.id, { status: 'rejected' })}
                                disabled={updatingRequests.has(req.id)}
                                className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 text-xs font-medium transition-colors duration-200 disabled:opacity-50"
                                title="Reject Request"
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Reject
                              </button>
                            </>
                          )}
                          {req.status !== 'completed' && req.status !== 'rejected' && (
                            <div className="flex items-center space-x-2">
                              <label className="relative cursor-pointer">
                                <input
                                  type="file"
                                  accept="application/pdf"
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                      handleFileUpload(req.id, e.target.files[0]);
                                      e.target.value = '';
                                    }
                                  }}
                                />
                                <div className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 ${
                                  updatingRequests.has(req.id)
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                }`}>
                                  <Upload className="w-3 h-3 mr-1" />
                                  {updatingRequests.has(req.id) ? 'Uploading...' : 'Upload Report'}
                                </div>
                              </label>
                            </div>
                          )}
                          {req.report_url && (
                            <a
                              href={req.report_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 text-xs font-medium transition-colors duration-200"
                              title="View Report"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View Report
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-gray-200/50">
              {filteredRequests.map((req) => (
                <div key={req.id} className="p-4 sm:p-6 hover:bg-gray-50/50 transition-colors duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-red-100 to-pink-100 rounded-xl flex items-center justify-center mr-3">
                        <Building2 className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{req.profiles?.company_name || 'N/A'}</div>
                        <div className="text-xs text-gray-500 mt-1">Company</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {getStatusIcon(req.status)}
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(req.status)}`}>
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="text-sm text-gray-600">
                      <strong>Opportunity:</strong> {req.opportunities?.title || 'N/A'}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(req.created_at)}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {req.status === 'requested' && (
                      <>
                        <button
                          onClick={() => handleUpdateRequest(req.id, { status: 'in_progress' })}
                          disabled={updatingRequests.has(req.id)}
                          className="inline-flex items-center px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 text-xs font-medium transition-colors duration-200 disabled:opacity-50"
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          In Progress
                        </button>
                        <button
                          onClick={() => handleUpdateRequest(req.id, { status: 'rejected' })}
                          disabled={updatingRequests.has(req.id)}
                          className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 text-xs font-medium transition-colors duration-200 disabled:opacity-50"
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Reject
                        </button>
                      </>
                    )}
                    {req.status !== 'completed' && req.status !== 'rejected' && (
                      <label className="relative cursor-pointer">
                        <input
                          type="file"
                          accept="application/pdf"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleFileUpload(req.id, e.target.files[0]);
                              e.target.value = '';
                            }
                          }}
                        />
                        <div className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 ${
                          updatingRequests.has(req.id)
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        }`}>
                          <Upload className="w-3 h-3 mr-1" />
                          {updatingRequests.has(req.id) ? 'Uploading...' : 'Upload Report'}
                        </div>
                      </label>
                    )}
                    {req.report_url && (
                      <a
                        href={req.report_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 text-xs font-medium transition-colors duration-200"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View Report
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RiskAnalysisRequests;