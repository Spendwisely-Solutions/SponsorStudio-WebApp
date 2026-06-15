import React from 'react';
import { motion } from 'framer-motion';
import { Search, RefreshCw, Plus } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import coinIcon from '../../../assets/dashboard/coin.png';

interface HeaderProps {
  credits: number | null;
  shakeCredits: boolean;
  activeTab: 'general' | 'risk_analysis';
  setActiveTab: (tab: 'general' | 'risk_analysis') => void;
  setCurrentPage: React.Dispatch<React.SetStateAction<{ general: number; risk_analysis: number }>>;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  onRefresh: () => void;
  isMobile?: boolean;
}

export default function Header({
  credits,
  shakeCredits,
  activeTab,
  setActiveTab,
  setCurrentPage,
  setSearchTerm,
  onRefresh,
  isMobile = false,
}: HeaderProps) {
  const refreshReports = () => onRefresh();

  return (
    <motion.div
      initial={{ y: isMobile ? -20 : 0, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={isMobile ? 'sticky top-0 bg-white shadow-sm z-20 px-4 py-4' : 'mb-6'}
    >
      {isMobile ? (
        <>
          <h1 className="text-xl font-bold text-gray-900 mb-3">Reports</h1>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <motion.div
                animate={shakeCredits ? { x: [0, -10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-2"
              >
                <img src={coinIcon} alt="Credits" className="w-5 h-5" data-tooltip-id="credits-tooltip" />
                <span className="text-sm font-semibold text-gray-800">{credits ?? 'N/A'}</span>
                <Tooltip id="credits-tooltip" place="top" content="Available credits" className="text-xs z-50" />
              </motion.div>
              <motion.button
                onClick={() => window.location.assign('/purchase')}
                className="p-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Add credits"
                data-tooltip-id="add-credits-tooltip"
              >
                <Plus size={18} />
                <Tooltip id="add-credits-tooltip" place="top" content="Add credits" className="text-xs z-50" />
              </motion.button>
            </div>
          </div>
          <div className="flex gap-2 mb-3">
            <motion.button
              onClick={() => {
                setActiveTab('general');
                setCurrentPage(prev => ({ ...prev, general: 1 }));
              }}
              className={`flex-1 px-3 py-3 text-xs font-medium rounded-lg transition-colors ${
                activeTab === 'general' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-current={activeTab === 'general' ? 'page' : undefined}
            >
              Post-Event
            </motion.button>
            <motion.button
              onClick={() => {
                setActiveTab('risk_analysis');
                setCurrentPage(prev => ({ ...prev, risk_analysis: 1 }));
              }}
              className={`flex-1 px-3 py-3 text-xs font-medium rounded-lg transition-colors ${
                activeTab === 'risk_analysis' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-current={activeTab === 'risk_analysis' ? 'page' : undefined}
            >
              Risk Analysis
            </motion.button>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Search reports..."
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1 h-10 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                aria-label="Search reports"
              />
            </div>
            <motion.button
              onClick={refreshReports}
              className="p-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Refresh reports"
            >
              <RefreshCw size={16} />
            </motion.button>
          </div>
        </>
      ) : (
        <>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold text-gray-900 mb-6"
          >
            Reports
          </motion.h1>
          <div className="liquid-glass-card p-4 rounded-lg shadow-sm flex items-center justify-between">
            <motion.div
              animate={shakeCredits ? { x: [0, -10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2"
            >
              <img src={coinIcon} alt="Credits" className="w-6 h-6" data-tooltip-id="credits-tooltip" />
              <span className="text-sm font-semibold text-gray-800">{credits ?? 'N/A'}</span>
              <Tooltip id="credits-tooltip" place="top" content="Available credits" className="text-xs z-50" />
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
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
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
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Search reports"
              />
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}