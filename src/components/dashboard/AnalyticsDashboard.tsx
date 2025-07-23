import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Database } from '../../lib/database.types';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import EventAnalytics from './EventAnalytics';
import { motion, AnimatePresence } from 'framer-motion';

type Opportunity = Database['public']['Tables']['opportunities']['Row'];

export default function AnalyticsDashboard() {
  const { user, profile } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    if (!user || !profile) {
      setIsLoading(false);
      return;
    }

    const fetchOpportunities = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('opportunities')
          .select('*')
          .eq('creator_id', user.id);

        if (error) throw error;

        setOpportunities(data || []);
        setFilteredOpportunities(data || []);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching opportunities:', err);
        setError('Failed to load opportunities. Please try again later.');
        setIsLoading(false);
      }
    };

    if (profile.user_type === 'creator' || profile.user_type === 'event_organizer') {
      fetchOpportunities();
    } else {
      setIsLoading(false);
    }
  }, [user, profile]);

  // Filter opportunities based on search term and status
  useEffect(() => {
    let result = opportunities;

    // Apply search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        (opp) =>
          (opp.title?.toLowerCase().includes(lowerSearch) || '') ||
          (opp.description?.toLowerCase().includes(lowerSearch) || '')
      );
    }

    // Apply status filter
    if (statusFilter !== 'All') {
      result = result.filter((opp) => opp.status === statusFilter.toLowerCase());
    }

    setFilteredOpportunities(result);
  }, [searchTerm, statusFilter, opportunities]);

  // Animation variants for the container
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        when: 'beforeChildren',
        staggerChildren: 0.1,
      },
    },
  };

  // Animation variants for opportunity cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      },
    },
    hover: {
      scale: 1.03,
      boxShadow: '0px 8px 24px rgba(0,0,0,0.1)',
      transition: {
        duration: 0.2,
      },
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.1,
      },
    },
  };

  // Animation variants for modal
  const modalVariants = {
    hidden: { opacity: 0, x: '100%' },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
      },
    },
    exit: {
      opacity: 0,
      x: '100%',
      transition: {
        duration: 0.4,
        ease: 'easeInOut',
      },
    },
  };

  // Animation for heading
  const headingVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      },
    },
  };

  // Animation for search/filter inputs
  const inputVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-[70vh] p-4 md:p-6 md:bg-white md:rounded-xl md:shadow-sm"
    >
      <AnimatePresence>
        {!showAnalyticsModal && (
          <motion.h2
            key="analytics-heading"
            variants={headingVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="text-2xl font-bold text-gray-800 mb-6"
          >
            Analytics
          </motion.h2>
        )}
      </AnimatePresence>
      {!showAnalyticsModal && !isLoading && !error && profile && (profile.user_type === 'creator' || profile.user_type === 'event_organizer') && (
        <motion.div
          variants={inputVariants}
          className="flex flex-col sm:flex-row gap-4 mb-6"
        >
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
            />
          </div>
          <div className="w-full sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Paused">Paused</option>
            </select>
          </div>
        </motion.div>
      )}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(3).fill(0).map((_, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              className="bg-white rounded-lg border border-gray-200 shadow-sm p-6"
            >
              <Skeleton height={24} width="60%" className="mb-4" />
              <Skeleton count={2} height={16} className="mb-2" />
              <Skeleton height={36} width="40%" className="mt-4" />
            </motion.div>
          ))}
        </div>
      ) : error ? (
        <motion.p variants={cardVariants} className="text-red-600">
          {error}
        </motion.p>
      ) : !profile || (profile.user_type !== 'creator' && profile.user_type !== 'event_organizer') ? (
        <motion.p variants={cardVariants} className="text-gray-600">
          Analytics is only available for creators and event organizers.
        </motion.p>
      ) : (
        <AnimatePresence mode="wait">
          {showAnalyticsModal && selectedOpportunity ? (
            <motion.div
              key="modal"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full h-full"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mb-6 mt-2 ml-2 flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-blue-700 font-semibold rounded-md border border-gray-200 shadow-sm hover:bg-blue-50 hover:text-blue-900 transition text-base"
                onClick={() => setShowAnalyticsModal(false)}
                autoFocus
              >
                <span className="text-lg">←</span> Back to Analytics
              </motion.button>
              <div className="w-full h-full">
                <EventAnalytics opportunityId={selectedOpportunity.id} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredOpportunities.length === 0 ? (
                <motion.div variants={cardVariants} className="text-center py-8">
                  <svg
                    width="48"
                    height="48"
                    fill="none"
                    viewBox="0 0 48 48"
                    className="mx-auto mb-4"
                  >
                    <rect width="48" height="48" rx="12" fill="#F3F4F6" />
                    <path
                      d="M16 33V24M22 33V18M28 33V27M34 33V21"
                      stroke="#A0AEC0"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <p className="text-gray-600 mb-2">
                    {searchTerm || statusFilter !== 'All'
                      ? 'No opportunities match your search or filter.'
                      : 'No opportunities found.'}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {searchTerm || statusFilter !== 'All'
                      ? 'Try adjusting your search or filter.'
                      : 'Create an opportunity to see analytics here.'}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={containerVariants}
                >
                  {filteredOpportunities.map((opportunity) => (
                    <motion.div
                      key={opportunity.id}
                      variants={cardVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="group cursor-pointer rounded-lg border border-gray-200 bg-white shadow-sm p-6 flex flex-col justify-between transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-400"
                      tabIndex={0}
                      onClick={() => {
                        setSelectedOpportunity(opportunity);
                        setShowAnalyticsModal(true);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setSelectedOpportunity(opportunity);
                          setShowAnalyticsModal(true);
                        }
                      }}
                      aria-label={`View analytics for ${opportunity.title}`}
                    >
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate group-hover:text-blue-700 transition-colors">
                          {opportunity.title || 'N/A'}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {opportunity.description || 'N/A'}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>
                          Status:{' '}
                          <span className="font-medium text-gray-700">
                            {opportunity.status || 'N/A'}
                          </span>
                        </span>
                        <span>
                          {opportunity.created_at
                            ? (() => {
                                const d = new Date(opportunity.created_at);
                                const day = String(d.getDate()).padStart(2, '0');
                                const month = String(d.getMonth() + 1).padStart(2, '0');
                                const year = d.getFullYear();
                                return `${day}/${month}/${year}`;
                              })()
                            : 'N/A'}
                        </span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition font-semibold"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOpportunity(opportunity);
                          setShowAnalyticsModal(true);
                        }}
                      >
                        View Analytics
                      </motion.button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
}