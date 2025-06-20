import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { Eye, Lock, Frown, Calendar } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import type { Database } from '../../lib/database.types';

interface GeneralReportsProps {
  reports: Array<
    Database['public']['Tables']['reports']['Row'] & {
      opportunity: { title: string | null } | null;
      signedUrl: string;
      purchased: boolean;
      filename: string | null;
    }
  >;
  loading: boolean;
  unlockingReport: string | null;
  unlockReport: (reportId: string, url: string) => Promise<void>;
  viewReport: (url: string) => void;
  isMobile?: boolean;
}

export default function GeneralReports({
  reports,
  loading,
  unlockingReport,
  unlockReport,
  viewReport,
  isMobile = false,
}: GeneralReportsProps) {
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
            <p className="text-gray-800 text-base font-semibold mb-2">No Post-Event Reports Found</p>
            <p className="text-gray-500 text-sm">Adjust filters or contact support.</p>
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
                  <p className="text-xs text-gray-500">
                    Uploaded: {format(parseISO(report.created_at), 'MMM dd, yyyy')}
                  </p>
                  <div className="flex justify-end">
                    {report.purchased ? (
                      <motion.button
                        onClick={() => viewReport(report.signedUrl)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-blue-700 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={`View report ${report.filename || 'Unknown'}`}
                        data-tooltip-id={`tooltip-view-${report.id}`}
                      >
                        View
                        <Eye size={16} />
                        <Tooltip id={`tooltip-view-${report.id}`} content="View report in new tab" className="text-xs z-50" />
                      </motion.button>
                    ) : (
                      <motion.button
                        onClick={() => unlockReport(report.id, report.signedUrl)}
                        disabled={unlockingReport === report.id}
                        className={`px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-blue-700 transition-colors ${
                          unlockingReport === report.id ? 'animate-pulse' : ''
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={`Unlock report ${report.filename || 'Unknown'} for 100 credits`}
                        data-tooltip-id={`tooltip-unlock-${report.id}`}
                      >
                        {unlockingReport === report.id ? (
                          <>
                            Unlocking
                            <svg
                              className="animate-spin h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                          </>
                        ) : (
                          <>
                            Unlock
                            <Lock size={16} />
                          </>
                        )}
                        <Tooltip id={`tooltip-unlock-${report.id}`} content="Unlock costs 100 credits" className="text-xs z-50" />
                      </motion.button>
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
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No Post-Event Reports Found</h3>
            <p className="mt-1 text-sm text-gray-500">Adjust filters or contact support.</p>
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Uploaded
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900 truncate max-w-xs">
                      {report.opportunity?.title ?? 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {format(parseISO(report.created_at), 'MMM d, yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold">
                    {report.purchased ? (
                      <motion.button
                        onClick={() => viewReport(report.signedUrl)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors text-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={`View report ${report.filename || 'Unknown'}`}
                        data-tooltip-id={`view-tooltip-${report.id}`}
                      >
                        View
                        <Eye size={16} />
                        <Tooltip id={`view-tooltip-${report.id}`} content="View report in new tab" className="text-xs z-50" />
                      </motion.button>
                    ) : (
                      <motion.button
                        onClick={() => unlockReport(report.id, report.signedUrl)}
                        disabled={unlockingReport === report.id}
                        className={`px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 text-sm font-semibold ${
                          unlockingReport === report.id ? 'animate-pulse' : ''
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={`Unlock report ${report.filename || 'Unknown'} for 100 credits`}
                        data-tooltip-id={`unlock-tooltip-${report.id}`}
                      >
                        {unlockingReport === report.id ? (
                          <>
                            Unlocking
                            <svg
                              className="animate-spin h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                          </>
                        ) : (
                          <>
                            Unlock
                            <Lock size={16} />
                          </>
                        )}
                        <Tooltip id={`unlock-tooltip-${report.id}`} content="Unlock costs 100 credits" className="text-xs z-50" />
                      </motion.button>
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