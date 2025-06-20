import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, RefreshCw } from 'lucide-react';

interface FiltersProps {
  activeTab: 'general' | 'risk_analysis';
  sortOrder: 'asc' | 'desc';
  statusFilter: 'all' | 'requested' | 'in_progress' | 'completed' | 'rejected';
  dateFrom: string;
  dateTo: string;
  setStatusFilter: (status: 'all' | 'requested' | 'in_progress' | 'completed' | 'rejected') => void;
  setDateFrom: (date: string) => void;
  setDateTo: (date: string) => void;
  handleSortToggle: () => void;
  handleDateFilter: () => void;
  fetchReports: () => void;
  setCurrentPage: React.Dispatch<React.SetStateAction<{ general: number; risk_analysis: number }>>;
  isMobile?: boolean;
}

export default function Filters({
  activeTab,
  sortOrder,
  statusFilter,
  dateFrom,
  dateTo,
  setStatusFilter,
  setDateFrom,
  setDateTo,
  handleSortToggle,
  handleDateFilter,
  fetchReports,
  setCurrentPage,
  isMobile = false,
}: FiltersProps) {
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };
    if (isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMobile]);

  const toggleFilters = () => setShowFilters(!showFilters);

  if (isMobile) {
    return (
      <>
        <motion.button
          onClick={toggleFilters}
          className="p-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors mx-4 my-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Open filters"
        >
          <Filter size={18} />
        </motion.button>
        <AnimatePresence>
          {showFilters && (
            <>
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed inset-y-0 right-0 w-4/5 max-w-sm bg-white shadow-xl z-30 p-5"
                ref={filterRef}
                role="dialog"
                aria-labelledby="filter-heading"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 id="filter-heading" className="text-lg font-semibold text-gray-900">Filters</h2>
                  <motion.button
                    onClick={toggleFilters}
                    className="p-2 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Close filters"
                  >
                    <X size={18} />
                  </motion.button>
                </div>
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700" htmlFor="sort-order-mobile">Sort Order</label>
                    <motion.button
                      id="sort-order-mobile"
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
                      <label className="text-sm font-semibold text-gray-700" htmlFor="status-filter-mobile">Status</label>
                      <select
                        id="status-filter-mobile"
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
                      onClick={() => {
                        handleDateFilter();
                        toggleFilters();
                      }}
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
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black z-20"
                onClick={toggleFilters}
                aria-hidden="true"
              />
            </>
          )}
        </AnimatePresence>
      </>
    );
  } else {
    return (
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
              Sort by: {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
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
    );
  }
}