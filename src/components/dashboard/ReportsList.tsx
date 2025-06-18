import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { ExternalLink, File, Download } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Report = Database['public']['Tables']['reports']['Row'] & {
  opportunity: { title: string } | null;
  signedUrl?: string | null;
};

export default function ReportsList() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [useSignedUrls, setUseSignedUrls] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          opportunity:opportunities(title)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const reportsWithUrls = await Promise.all(
        (data || []).map(async (report) => {
          let signedUrl: string | null = null;
          if (useSignedUrls) {
            const { data: signedUrlData, error: signedUrlError } = await supabase.storage
              .from('reports')
              .createSignedUrl(report.pdf_path, 3600, { download: report.filename });
            if (signedUrlError) {
              console.error(`Error generating signed URL for ${report.pdf_path}:`, signedUrlError);
            } else {
              signedUrl = signedUrlData.signedUrl;
              console.log(`Signed URL for ${report.pdf_path}:`, signedUrl);
            }
          } else {
            const { data: publicUrlData } = supabase.storage.from('reports').getPublicUrl(report.pdf_path);
            signedUrl = publicUrlData.publicUrl;
            console.log(`Public URL for ${report.pdf_path}:`, signedUrl);
          }

          return { ...report, signedUrl };
        })
      );

      setReports(reportsWithUrls);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchReports();
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden mx-2 sm:mx-4 md:mx-0">
      <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-0">Reports</h2>
        <button
          onClick={handleRefresh}
          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm sm:text-base"
        >
          Refresh
        </button>
      </div>
      {loading ? (
        <div className="p-6 sm:p-8 text-center">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-3 sm:mt-4 text-gray-600 text-sm sm:text-base">Loading reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="p-6 sm:p-8 text-center">
          <File className="mx-auto text-gray-400" size={36} />
          <p className="mt-3 sm:mt-4 text-gray-600 text-sm sm:text-base">No reports found</p>
        </div>
      ) : (
        <>
          {/* Mobile Grid Layout */}
          <div className="grid grid-cols-1 gap-3 p-3 sm:hidden">
            {reports.map((report) => (
              <div key={report.id} className="bg-white rounded-md p-3">
                <div className="space-y-1.5">
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase">Opp. ID</span>
                    <p className="text-sm text-gray-900">{report.opportunity_id}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase">Title</span>
                    <p className="text-sm text-gray-900">{report.opportunity?.title || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase">File</span>
                    <div className="flex items-center space-x-2 mt-1">
                      {report.signedUrl ? (
                        <>
                          <a
                            href={report.signedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            type="application/pdf"
                            className="text-blue-600 hover:underline flex items-center text-xs truncate max-w-[150px]"
                          >
                            {report.filename}
                            <ExternalLink size={14} className="ml-1 flex-shrink-0" />
                          </a>
                          <a
                            href={report.signedUrl}
                            download={report.filename}
                            type="application/pdf"
                            className="text-green-600 hover:underline"
                            title="Download PDF"
                          >
                            <Download size={14} />
                          </a>
                        </>
                      ) : (
                        <span className="text-red-600 text-xs">Error loading file</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase">Uploaded</span>
                    <p className="text-xs text-gray-500">
                      {new Date(report.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop Table Layout */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Opp. ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploaded
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.opportunity_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {report.opportunity?.title || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {report.signedUrl ? (
                        <div className="flex items-center space-x-2">
                          <a
                            href={report.signedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            type="application/pdf"
                            className="text-blue-600 hover:underline flex items-center text-sm truncate max-w-[200px]"
                          >
                            {report.filename}
                            <ExternalLink size={16} className="ml-1 flex-shrink-0" />
                          </a>
                          <a
                            href={report.signedUrl}
                            download={report.filename}
                            type="application/pdf"
                            className="text-green-600 hover:underline"
                            title="Download PDF"
                          >
                            <Download size={16} />
                          </a>
                        </div>
                      ) : (
                        <span className="text-red-600 text-sm">Error loading file</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(report.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}