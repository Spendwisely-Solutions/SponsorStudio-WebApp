import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  CalendarRange,
  Link as LinkIcon,
  FileText as FileIcon,
  Check,
  X,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useRazorpay } from 'react-razorpay';
import axios from 'axios';
import { supabase } from '../../../lib/supabase';
import DOMPurify from 'dompurify';
import type { Database } from '../../../lib/database.types';
import MatchFilter from './MatchFilter';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

type Match = Database['public']['Tables']['matches']['Row'] & {
  opportunities?: Pick<Database['public']['Tables']['opportunities']['Row'], 'id' | 'title'>;
  opportunity_id?: string;
};

type DetailedMatch = Match & {
  profiles: Pick<
    Database['public']['Tables']['profiles']['Row'],
    'company_name' | 'industry'
  >;
};

interface MatchListProps {
  matches: Match[];
  matchFilter: 'all' | 'pending' | 'accepted' | 'rejected';
  searchQuery: string;
  onUpdateMatchStatus: (matchId: string, status: 'accepted' | 'rejected') => void;
  processingMatches: Record<string, { accept: boolean; decline: boolean }>;
  onRefresh: () => void;
  onFilterChange: (filter: 'all' | 'pending' | 'accepted' | 'rejected') => void;
  onSearchChange: (query: string) => void;
  generateGoogleCalendarLink: (match: Match) => string;
  onUpdateProfile: () => void;
}

export default function MatchList({
  matches,
  matchFilter,
  searchQuery,
  onUpdateMatchStatus,
  processingMatches,
  onRefresh,
  onFilterChange,
  onSearchChange,
  generateGoogleCalendarLink,
  onUpdateProfile,
}: MatchListProps) {
  const [paymentStatus, setPaymentStatus] = useState<Record<string, boolean>>({});
  const [paymentInitiated, setPaymentInitiated] = useState<Record<string, boolean>>({});
  const [paymentError, setPaymentError] = useState<Record<string, string | null>>({});
  const [loadingPayments, setLoadingPayments] = useState<boolean>(true);
  const [paymentCheckError, setPaymentCheckError] = useState<string | null>(null);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const [detailedMatches, setDetailedMatches] = useState<Record<string, DetailedMatch[]>>({});
  const { Razorpay } = useRazorpay();

  useEffect(() => {
    const checkPayments = async () => {
      setLoadingPayments(true);
      setPaymentCheckError(null);
      const uniqueOpportunityIds = [
        ...new Set(matches.map(match => match.opportunities?.id || match.opportunity_id).filter(id => id)),
      ];

      if (uniqueOpportunityIds.length === 0) {
        setLoadingPayments(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('payments')
          .select('id, status, opportunity_id')
          .in('opportunity_id', uniqueOpportunityIds)
          .in('status', ['paid', 'unpaid']);

        if (error) {
          console.error('Payment status query failed:', error.message);
          setPaymentCheckError('Failed to verify payment status. Please try again.');
          setLoadingPayments(false);
          return;
        }

        const statusMap: Record<string, boolean> = {};
        uniqueOpportunityIds.forEach(oppId => {
          const payment = data.find(p => p.opportunity_id === oppId && p.status === 'paid');
          statusMap[oppId] = !!payment;
        });

        setPaymentStatus(statusMap);
        setPaymentInitiated({});
        setPaymentError({});
        setLoadingPayments(false);
      } catch (err) {
        console.error('Unexpected error checking payments:', err);
        setPaymentCheckError('Unexpected error checking payments. Please try again.');
        setLoadingPayments(false);
      }
    };

    if (matches.length > 0) {
      checkPayments();
    } else {
      setLoadingPayments(false);
    }
  }, [matches]);

  const fetchMatchDetails = async (opportunityId: string) => {
    try {
      // Use a Supabase view or direct table with explicit field selection
      const { data, error } = await supabase
        .from('matches')
        .select(`
          id,
          opportunity_id,
          status,
          created_at,
          updated_at,
          meeting_scheduled_at,
          meeting_link,
          notes,
          profiles:brand_id (
            company_name,
            industry
          ),
          opportunities:opportunity_id (id, title)
        `)
        .eq('opportunity_id', opportunityId)
        .limit(50);

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      // Log raw response to verify fields

      // Sanitize profiles data to ensure only required fields are included
      const sanitizedData = data.map(match => ({
        ...match,
        profiles: match.profiles && Array.isArray(match.profiles) && match.profiles.length > 0
          ? {
              company_name: match.profiles[0].company_name,
              industry: match.profiles[0].industry,
            }
          : match.profiles
          ? {
              company_name: (match.profiles as any).company_name,
              industry: (match.profiles as any).industry,
            }
          : null,
      }));

      // Validate response for unexpected fields
      sanitizedData.forEach(match => {
        if (match.profiles) {
          const profileKeys = Object.keys(match.profiles);
          const expectedKeys = [
            'company_name',
            'industry',
          ];
          const unexpectedKeys = profileKeys.filter(key => !expectedKeys.includes(key));
          if (unexpectedKeys.length > 0) {
            console.error(
              `Data leak detected! Unexpected profile fields for match ${match.id}:`,
              unexpectedKeys.join(', ')
            );
            toast.error('Unexpected profile data detected. Please contact support.', {
              id: 'data_leak_warning',
            });
          }
          if (!match.profiles.company_name) {
            console.warn(
              'Null company_name for match:',
              match.id
            );
            toast.error(
              'Some matches have missing profile data. Please update your profile.',
              { id: 'missing_profile_data' }
            );
            onUpdateProfile();
          }
        }
      });

      setDetailedMatches(prev => ({
        ...prev,
        [opportunityId]: sanitizedData as unknown as DetailedMatch[],
      }));
    } catch (error) {
      console.error('Error fetching match details:', error);
      toast.error('Failed to load match details.');
    }
  };

  const initiatePayment = async (opportunityId: string, amount: number = 5000) => {
    try {
      const { data: existingPayment, error: checkError } = await supabase
        .from('payments')
        .select('id, status')
        .eq('opportunity_id', opportunityId)
        .eq('status', 'paid')
        .maybeSingle();

      if (checkError) {
        console.error(`Failed to check payment for opportunity ${opportunityId}:`, checkError.message);
        throw new Error('Failed to verify payment status');
      }

      if (existingPayment) {
        setPaymentStatus(prev => ({
          ...prev,
          [opportunityId]: true,
        }));
        setPaymentError(prev => ({ ...prev, [opportunityId]: null }));
        setPaymentInitiated(prev => ({ ...prev, [opportunityId]: false }));
        await fetchMatchDetails(opportunityId);
        return;
      }

      setPaymentInitiated(prev => ({ ...prev, [opportunityId]: true }));
      setPaymentError(prev => ({ ...prev, [opportunityId]: null }));

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const response = await axios.post('https://payment-gateway-serverless-lac.vercel.app/api/create-order', {
        amount,
        currency: 'INR',
      });

      const { orderId, amount: razorpayAmount, currency } = response.data;

      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          opportunity_id: opportunityId,
          amount: razorpayAmount * 100,
          currency: 'INR',
          status: 'unpaid',
          razorpay_order_id: orderId,
        })
        .select()
        .single();

      if (paymentError) {
        console.error(`Failed to create payment record for ${opportunityId}:`, paymentError.message);
        throw new Error('Failed to create payment record');
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayAmount * 100,
        currency,
        name: 'Sponsor Studio',
        description: `Payment for opportunity ${opportunityId}`,
        order_id: orderId,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const verifyResponse = await axios.post('https://payment-gateway-serverless-lac.vercel.app/api/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyResponse.data.success) {
              const { error: updateError } = await supabase
                .from('payments')
                .update({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  status: 'paid',
                })
                .eq('id', payment.id);

              if (updateError) throw new Error('Failed to update payment status');

              setPaymentStatus(prev => ({
                ...prev,
                [opportunityId]: true,
              }));
              setPaymentError(prev => ({ ...prev, [opportunityId]: null }));
              await fetchMatchDetails(opportunityId);
            } else {
              await supabase
                .from('payments')
                .update({ status: 'unpaid' })
                .eq('id', payment.id);
              setPaymentError(prev => ({
                ...prev,
                [opportunityId]: 'Payment verification failed. Please contact support.',
              }));
            }
          } catch (error) {
            console.error(`Payment verification error for ${opportunityId}:`, error);
            await supabase
              .from('payments')
              .update({ status: 'unpaid' })
              .eq('id', payment.id);
            setPaymentError(prev => ({
              ...prev,
              [opportunityId]: 'Error verifying payment. Please try again.',
            }));
          } finally {
            setPaymentInitiated(prev => ({ ...prev, [opportunityId]: false }));
          }
        },
        prefill: {
          name: 'User', // Fallback since profiles are not fetched initially
          email: '',
          contact: '',
        },
        theme: {
          color: '#2B4B9B',
        },
      };

      const razorpay = new Razorpay(options);
      razorpay.on('payment.failed', async (response) => {
        await supabase
          .from('payments')
          .update({ status: 'unpaid' })
          .eq('id', payment.id);
        setPaymentError(prev => ({
          ...prev,
          [opportunityId]: `Payment failed: ${response.error.description}`,
        }));
        setPaymentInitiated(prev => ({ ...prev, [opportunityId]: false }));
      });
      razorpay.open();
    } catch (error: any) {
      console.error(`Payment initiation error for ${opportunityId}:`, error.message);
      setPaymentError(prev => ({
        ...prev,
        [opportunityId]: 'Failed to initiate payment. Please try again.',
      }));
      setPaymentInitiated(prev => ({ ...prev, [opportunityId]: false }));
    }
  };

  const filteredMatches = matches
    .filter((match) => {
      if (matchFilter === 'all') return true;
      return match.status === matchFilter;
    })
    .filter((match) => {
      if (!searchQuery) return true;
      const searchLower = DOMPurify.sanitize(searchQuery.toLowerCase());
      return match.opportunities?.title?.toLowerCase().includes(searchLower) ?? false;
    });

  const matchesByOpportunity = filteredMatches.reduce((acc, match) => {
    const oppId = match.opportunities?.id || match.opportunity_id || 'missing_opportunity';
    if (!acc[oppId]) acc[oppId] = [];
    acc[oppId].push(match);
    return acc;
  }, {} as Record<string, Match[]>);

  const toggleOpportunity = (oppId: string) => {
    setSelectedOpportunityId(selectedOpportunityId === oppId ? null : oppId);
    if (paymentStatus[oppId] && !detailedMatches[oppId]) {
      fetchMatchDetails(oppId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, oppId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleOpportunity(oppId);
    }
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  if (loadingPayments && matches.length > 0) {
    return (
      <motion.div
        className="bg-white rounded-xl shadow-lg p-6 sm:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Brand Matches</h2>
          <motion.button
            onClick={onRefresh}
            onKeyDown={(e) => handleKeyDown(e, 'refresh')}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-[#2B4B9B] to-[#3B5BB9] text-white rounded-lg shadow-md"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            aria-label="Refresh matches"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </motion.button>
        </div>
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-16 h-16 mx-auto mb-4 bg-indigo-50 rounded-full flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <RefreshCw className="w-8 h-8 text-indigo-500" />
          </motion.div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Payment Status</h3>
          <p className="text-gray-600">Please wait while we check payment status...</p>
        </motion.div>
      </motion.div>
    );
  }

  if (paymentCheckError) {
    return (
      <motion.div
        className="bg-white rounded-xl shadow-lg p-6 sm:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Brand Matches</h2>
          <motion.button
            onClick={onRefresh}
            onKeyDown={(e) => handleKeyDown(e, 'refresh')}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-[#2B4B9B] to-[#3B5BB9] text-white rounded-lg shadow-md"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            aria-label="Refresh matches"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </motion.button>
        </div>
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Payment Status</h3>
          <p className="text-gray-600 mb-4">{paymentCheckError}</p>
          <motion.button
            onClick={() => {
              setPaymentCheckError(null);
              setLoadingPayments(true);
              const checkPayments = async () => {
                const uniqueOpportunityIds = [...new Set(matches.map(match => match.opportunities?.id || match.opportunity_id).filter(id => id))];
                if (uniqueOpportunityIds.length === 0) return;
                try {
                  const { data, error } = await supabase
                    .from('payments')
                    .select('id, status, opportunity_id')
                    .in('opportunity_id', uniqueOpportunityIds)
                    .in('status', ['paid', 'unpaid']);
                  if (error) throw error;
                  const statusMap: Record<string, boolean> = {};
                  uniqueOpportunityIds.forEach(oppId => {
                    statusMap[oppId] = !!data.find(p => p.opportunity_id === oppId && p.status === 'paid');
                  });
                  setPaymentStatus(statusMap);
                  setPaymentInitiated({});
                  setPaymentError({});
                } catch (err) {
                  setPaymentCheckError('Unexpected error checking payments. Please try again.');
                } finally {
                  setLoadingPayments(false);
                }
              };
              checkPayments();
            }}
            onKeyDown={(e) => handleKeyDown(e, 'retry')}
            className="px-6 py-2 bg-gradient-to-r from-[#2B4B9B] to-[#3B5BB9] text-white rounded-lg shadow-md"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            aria-label="Retry loading payment status"
          >
            Retry
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  if (matches.length === 0 || Object.keys(matchesByOpportunity).length === 0) {
    return (
      <motion.div
        className="bg-white rounded-xl shadow-lg p-6 sm:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Brand Matches</h2>
          <motion.button
            onClick={onRefresh}
            onKeyDown={(e) => handleKeyDown(e, 'refresh')}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-[#2B4B9B] to-[#3B5BB9] text-white rounded-lg shadow-md"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            aria-label="Refresh matches"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </motion.button>
        </div>
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-indigo-50 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-indigo-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {searchQuery ? 'No matching results' : 'No matches found'}
          </h3>
          <p className="text-gray-600">
            {searchQuery
              ? 'Try adjusting your search or filter criteria.'
              : 'When brands express interest in your events, they will appear here.'}
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg p-6 sm:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Brand Matches</h2>
        <motion.button
          onClick={onRefresh}
          onKeyDown={(e) => handleKeyDown(e, 'refresh')}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-[#2B4B9B] to-[#3B5BB9] text-white rounded-lg shadow-md"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          aria-label="Refresh matches"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </motion.button>
      </div>

      <MatchFilter
        matchFilter={matchFilter}
        searchQuery={searchQuery}
        onFilterChange={onFilterChange}
        onSearchChange={onSearchChange}
        matches={matches as any}
      />

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        initial="hidden"
        animate="visible"
      >
        {Object.entries(matchesByOpportunity).map(([oppId, oppMatches], index) => {
          const opportunity = oppMatches[0].opportunities;
          const isMissingOpportunity = oppId === 'missing_opportunity';
          const isPaid = paymentStatus[oppId] ?? false;
          const matchCount = oppMatches.length;

          return (
            <motion.div
              key={oppId}
              className="border border-gray-200 rounded-xl shadow-md p-5 bg-gradient-to-br from-white to-gray-50 hover:shadow-lg cursor-pointer transition-shadow"
              onClick={() => toggleOpportunity(oppId)}
              onKeyDown={(e) => handleKeyDown(e, oppId)}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { delay: index * 0.1, duration: 0.3 } },
              }}
              initial="hidden"
              animate="visible"
              tabIndex={0}
              aria-label={`Toggle matches for ${opportunity?.title || 'Unknown Opportunity'}`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {isMissingOpportunity ? `Opportunity ID: ${oppMatches[0].opportunity_id || 'Unknown'}` : (opportunity?.title || 'Unknown Opportunity')}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium">
                    {matchCount} Match{matchCount !== 1 ? 'es' : ''}
                  </p>
                  <p className="text-sm mt-1">
                    {isMissingOpportunity ? (
                      <span className="text-red-600 font-medium">(Opportunity Data Missing)</span>
                    ) : isPaid ? (
                      <span className="text-green-600 font-medium">(Unlocked)</span>
                    ) : (
                      <span className="text-red-600 font-medium">(Locked)</span>
                    )}
                  </p>
                </div>
                {selectedOpportunityId === oppId ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <AnimatePresence>
        {selectedOpportunityId && matchesByOpportunity[selectedOpportunityId] && (
          <motion.div
            variants={{
              hidden: { opacity: 0, height: 0 },
              visible: { opacity: 1, height: 'auto', transition: { duration: 0.3 } },
              exit: { opacity: 0, height: 0, transition: { duration: 0.2 } },
            }}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {(() => {
              const oppMatches = matchesByOpportunity[selectedOpportunityId];
              const opportunity = oppMatches[0].opportunities;
              const isMissingOpportunity = selectedOpportunityId === 'missing_opportunity';
              const isPaid = paymentStatus[selectedOpportunityId] ?? false;
              const paymentAmount = 5000; // Hardcoded since payment_amount column does not exist

              return (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    Matches for {isMissingOpportunity ? `Opportunity ID: ${oppMatches[0].opportunity_id || 'Unknown'}` : (opportunity?.title || 'Unknown Opportunity')}
                  </h3>
                  {isPaid ? (
                    <motion.div className="grid gap-6">
                      {detailedMatches[selectedOpportunityId]?.map((match, index) => (
                        <motion.div
                          key={match.id}
                          className={`rounded-xl border shadow-md p-6 transition-all duration-200 ${
                            match.status === 'pending'
                              ? 'border-yellow-300 bg-yellow-50'
                              : match.status === 'accepted'
                              ? 'border-green-300 bg-green-50'
                              : 'border-gray-300 bg-gray-50 opacity-90'
                          }`}
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0, transition: { delay: index * 0.1, duration: 0.3 } },
                          }}
                          initial="hidden"
                          animate="visible"
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                            <div className="flex-grow">
                              <div className="flex items-center mb-3">
                                <h4 className="text-xl font-semibold text-gray-900">
                                  {match.profiles?.company_name || 'Brand Details Unavailable'}
                                </h4>
                                <span
                                  className={`ml-3 px-3 py-1 text-xs font-semibold rounded-full ${
                                    match.status === 'pending'
                                      ? 'bg-yellow-200 text-yellow-800'
                                      : match.status === 'accepted'
                                      ? 'bg-green-200 text-green-800'
                                      : 'bg-red-200 text-red-800'
                                  }`}
                                >
                                  {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                                </span>
                              </div>
                              <div className="space-y-2 text-sm text-gray-600">
                                <p>
                                  <span className="font-medium">Event:</span>{' '}
                                  {match.opportunities?.title || (isMissingOpportunity ? `Opportunity ID: ${match.opportunity_id || 'Unknown'}` : 'Unknown Event')}
                                </p>
                                {match.profiles?.industry && (
                                  <p>
                                    <span className="font-medium">Industry:</span> {match.profiles.industry}
                                  </p>
                                )}
                                <p>
                                  <span className="font-medium">
                                    {match.status === 'pending' ? 'Received' : 'Updated'}:
                                  </span>{' '}
                                  {match.created_at || match.updated_at
                                    ? new Date(
                                        match.status === 'pending' ? match.created_at : match.updated_at
                                      ).toLocaleDateString()
                                    : 'N/A'}
                                </p>
                                {match.meeting_scheduled_at && match.status === 'accepted' && (
                                  <p className="flex items-center">
                                    <CalendarRange className="w-4 h-4 mr-1" />
                                    <span>
                                      Meeting: {new Date(match.meeting_scheduled_at).toLocaleString()}
                                    </span>
                                  </p>
                                )}
                                {match.notes && match.status === 'accepted' && (
                                  <p className="flex items-start">
                                    <FileIcon className="w-4 h-4 mr-1 mt-1" />
                                    <span>
                                      <span className="font-medium">Notes:</span> {match.notes}
                                    </span>
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-end space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                              {match.status === 'pending' ? (
                                <>
                                  <motion.button
                                    onClick={() => onUpdateMatchStatus(match.id, 'accepted')}
                                    onKeyDown={(e) => handleKeyDown(e, `accept-${match.id}`)}
                                    disabled={processingMatches[match.id]?.accept}
                                    className={`w-full sm:w-auto flex items-center justify-center px-5 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed`}
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                    aria-label={`Accept match ${match.id}`}
                                  >
                                    {processingMatches[match.id]?.accept ? (
                                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                      <Check className="w-4 h-4 mr-2" />
                                    )}
                                    Accept
                                  </motion.button>
                                  <motion.button
                                    onClick={() => onUpdateMatchStatus(match.id, 'rejected')}
                                    onKeyDown={(e) => handleKeyDown(e, `decline-${match.id}`)}
                                    disabled={processingMatches[match.id]?.decline}
                                    className={`w-full sm:w-auto flex items-center justify-center px-5 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed`}
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                    aria-label={`Decline match ${match.id}`}
                                  >
                                    {processingMatches[match.id]?.decline ? (
                                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                      <X className="w-4 h-4 mr-2" />
                                    )}
                                    Decline
                                  </motion.button>
                                </>
                              ) : match.status === 'accepted' && match.meeting_link && match.meeting_scheduled_at ? (
                                <>
                                  <motion.a
                                    href={match.meeting_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full sm:w-auto flex items-center justify-center px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md"
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                    aria-label="Join meeting"
                                  >
                                    <LinkIcon className="w-4 h-4 mr-2" />
                                    Join Meeting
                                  </motion.a>
                                  <motion.a
                                    href={generateGoogleCalendarLink(match)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full sm:w-auto flex items-center justify-center px-5 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg shadow-md"
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                    aria-label="Add to calendar"
                                  >
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Add to Calendar
                                  </motion.a>
                                </>
                              ) : match.status === 'accepted' ? (
                                <span className="text-sm text-gray-600 flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  Meeting to be scheduled
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      className="text-center p-8 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-200"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      aria-live="polite"
                    >
                      {isMissingOpportunity ? (
                        <>
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">Opportunity Data Missing</h3>
                          <p className="text-gray-600 mb-4">Matches cannot be displayed due to missing opportunity data. Please contact support.</p>
                        </>
                      ) : (
                        <>
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">
                            Unlock Matches for {opportunity?.title || 'this Opportunity'}
                          </h3>
                          <p className="text-gray-600 mb-4">
                            A one-time fee of ₹{paymentAmount} is required to view matches.
                          </p>
                          {paymentError[selectedOpportunityId] && (
                            <p className="text-sm text-red-600 mb-4">{paymentError[selectedOpportunityId]}</p>
                          )}
                          <motion.button
                            onClick={() => initiatePayment(selectedOpportunityId, paymentAmount)}
                            onKeyDown={(e) => handleKeyDown(e, `pay-${selectedOpportunityId}`)}
                            disabled={paymentInitiated[selectedOpportunityId]}
                            className={`px-6 py-3 ${
                              paymentInitiated[selectedOpportunityId]
                                ? 'bg-gray-400'
                                : 'bg-gradient-to-r from-[#2B4B9B] to-[#3B5BB9]'
                            } text-white rounded-lg shadow-md`}
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            aria-label={`Pay to unlock matches for ${opportunity?.title || 'this opportunity'}`}
                          >
                            {paymentInitiated[selectedOpportunityId] ? (
                              <span className="flex items-center">
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Initiating Payment...
                              </span>
                            ) : (
                              'Pay Now'
                            )}
                          </motion.button>
                        </>
                      )}
                    </motion.div>
                  )}
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}