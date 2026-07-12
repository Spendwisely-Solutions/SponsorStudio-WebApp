import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { Eye, Frown, Calendar } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import type { Database } from '../../lib/database.types';

interface RiskAnalysisReportsProps {
  reports: Array<
    Database['public']['Tables']['risk_analysis']['Row'] & {
      opportunity: { title: string | null } | null;
      profile: { company_name: string | null } | null;
      report_url: string | null;
    }
  >;
  loading: boolean;
  viewReport: (url: string) => void;
  isMobile?: boolean;
}

export default function RiskAnalysisReports({
  reports,
  loading,
  viewReport,
  isMobile = false,
}: RiskAnalysisReportsProps) {
  const renderSkeleton = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 px-4"
    >
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-gray-200 h-12 rounded animate-pulse" />
      ))}
    </motion.div>
  );

  if (loading && reports.length === 0) return renderSkeleton();

  if (isMobile) {
    return (
      <motion.div className="px-4 pb-20">
        {reports.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <div className="flex justify-center gap-4 mb-4">
              <Calendar className="w-10 h-10 text-gray-300" />
              <Frown className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-600 text-base font-semibold mb-2">No Risk Analysis Reports Found</p>
            <p className="text-gray-500 text-sm">Request a risk analysis or adjust filters.</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {reports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 mb-3 hover:shadow-md transition-all"
              >
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-gray-900 truncate">
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
                          : 'bg-gray-100 text-gray-700'
                      }`}
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
                        data-tooltip-id="tooltip-view-${report.id}"
                      >
                        View
                        <Eye size={16} />
                        <Tooltip id="tooltip-view-${report.id}" content="View report in new tab" className="text-xs z-50" />
                      </motion.button>
                    ) : (
                      <span className="text-gray-500 text-xs">Not available</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </motion.div>
    );
  } else {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {reports.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <Frown className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No Risk Analysis Reports Found</h3>
            <p className="mt-1 text-sm text-gray-500">Request a risk analysis or adjust filters.</p>
          </motion.div>
        ) : (
          <motion.table
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="min-w-full divide-y divide-gray-200"
          >
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Opportunity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Company
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Created
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report, index) => (
                <motion.tr
                  key={report.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900 truncate max-w-xs">
                      {report.opportunity?.title ?? 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-700 truncate max-w-xs">
                      {report.profile?.company_name ?? 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
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
                    >
                      {report.status ? report.status.charAt(0).toUpperCase() + report.status.slice(1) : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {format(parseISO(report.created_at), 'MMM d, yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold">
                    {report.report_url ? (
                      <motion.button
                        onClick={() => viewReport(report.report_url!)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors text-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label="View risk analysis report"
                        data-tooltip-id="view-risk-tooltip-${report.id}"
                      >
                        View
                        <Eye size={16} />
                        <Tooltip id="view-risk-tooltip-${report.id}" content="View report in new tab" className="text-xs z-50" />
                      </motion.button>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </motion.table>
        )}
      </motion.div>
    );
  }
}