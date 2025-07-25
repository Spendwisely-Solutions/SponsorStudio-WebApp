import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';
import { Search, FileText, XCircle, CheckCircle, Clock } from 'lucide-react';

const RiskAnalysisRequests = ({ searchTerm, setSearchTerm }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingRequests, setUpdatingRequests] = useState(new Set());

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
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching risk analysis requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRequest = async (requestId, updates) => {
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

  const handleFileUpload = async (requestId, file) => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    console.log('File details:', { name: file.name, type: file.type, size: file.size });

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
      console.log('Uploading file:', fileName);

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

      console.log('Upload response:', 'Success');

      const { data: urlData } = supabase.storage
        .from('risk-analysis-reports')
        .getPublicUrl(fileName);

      if (!urlData?.publicUrl) throw new Error('Failed to get public URL');

      console.log('Uploaded file public URL:', urlData.publicUrl);

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

  const filteredRequests = requests.filter(
    req =>
      req.profiles?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.opportunities?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Risk Analysis Requests</h2>
        <div className="relative w-full max-w-xs">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by company or opportunity..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No risk analysis requests found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-3 px-4 text-gray-600">ID</th>
                <th className="py-3 px-4 text-gray-600">Company</th>
                <th className="py-3 px-4 text-gray-600">Opportunity</th>
                <th className="py-3 px-4 text-gray-600">Status</th>
                <th className="py-3 px-4 text-gray-600">Created</th>
                <th className="py-3 px-4 text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map(req => (
                <tr key={req.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">{req.id.slice(0, 8)}...</td>
                  <td className="py-3 px-4 text-sm">{req.profiles?.company_name || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm">{req.opportunities?.title || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        req.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : req.status === 'in_progress'
                          ? 'bg-yellow-100 text-yellow-800'
                          : req.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {new Date(req.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-sm flex items-center gap-2">
                    {req.status === 'requested' && (
                      <>
                        <button
                          onClick={() => handleUpdateRequest(req.id, { status: 'in_progress' })}
                          disabled={updatingRequests.has(req.id)}
                          className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 text-xs flex items-center"
                          title="Mark as In Progress"
                        >
                          <Clock className="w-4 h-4 mr-1" />
                          In Progress
                        </button>
                        <button
                          onClick={() => handleUpdateRequest(req.id, { status: 'rejected' })}
                          disabled={updatingRequests.has(req.id)}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 text-xs flex items-center"
                          title="Reject Request"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </button>
                      </>
                    )}
                    {req.status !== 'completed' && req.status !== 'rejected' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="application/pdf"
                          className="px-3 py-1 border rounded-lg text-xs w-40"
                          onChange={e => {
                            if (e.target.files?.[0]) {
                              handleFileUpload(req.id, e.target.files[0]);
                              e.target.value = '';
                            }
                          }}
                        />
                        <button
                          disabled={updatingRequests.has(req.id)}
                          className={`px-3 py-1 rounded-lg text-xs flex items-center ${
                            updatingRequests.has(req.id)
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                          }`}
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          {updatingRequests.has(req.id) ? 'Uploading...' : 'Upload'}
                        </button>
                      </div>
                    )}
                    {req.report_url && (
                      <a
                        href={req.report_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 text-xs flex items-center"
                        title="View Report"
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        View Report
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RiskAnalysisRequests;