import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { Building, RefreshCw, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useRazorpay } from 'react-razorpay';
import axios from 'axios';

type Match = {
  id: string;
  opportunity_id?: string;
  post_id?: string;
  brand_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  meeting_scheduled_at: string | null;
  meeting_link: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    company_name: string | null;
    industry: string | null;
    contact_person_name: string | null;
    contact_person_phone: string | null;
    website: string | null;
  };
  posts?: {
    id: string;
    title: string;
    description: string | null;
    price_range: { min: number; max: number } | null;
    hashtags: string | null;
    reach: number | null;
    influencer_id: string;
  };
};

interface MatchListProps {
  onRefresh: () => void;
}

export default function MatchList({ onRefresh }: MatchListProps) {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingMatches, setProcessingMatches] = useState<Record<string, boolean>>({});
  const [paymentStatus, setPaymentStatus] = useState<Record<string, boolean>>({});
  const [paymentInitiated, setPaymentInitiated] = useState<Record<string, boolean>>({});
  const [paymentError, setPaymentError] = useState<Record<string, string | null>>({});
  const [loadingPayments, setLoadingPayments] = useState<boolean>(true);
  const [paymentCheckError, setPaymentCheckError] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const { Razorpay } = useRazorpay();

  // Fetch matches for the current influencer
  useEffect(() => {
    fetchMatches();
  }, [user]);

  // Check payment status for posts
  useEffect(() => {
    const checkPayments = async () => {
      setLoadingPayments(true);
      setPaymentCheckError(null);
      const uniquePostIds = [...new Set(matches.map(match => match.posts?.id || match.post_id).filter(id => id))];

      console.log('Unique post IDs for payment check:', uniquePostIds);

      if (uniquePostIds.length === 0) {
        console.log('No valid post IDs found');
        setLoadingPayments(false);
        return;
      }

      try {
        console.log('Checking payment status for posts:', uniquePostIds);
        const { data, error } = await supabase
          .from('payments')
          .select('id, status, post_id')
          .in('post_id', uniquePostIds)
          .in('status', ['paid', 'unpaid']);

        if (error) {
          console.error('Payment status query failed:', error.message);
          setPaymentCheckError('Failed to verify payment status. Please try again.');
          setLoadingPayments(false);
          return;
        }

        const statusMap: Record<string, boolean> = {};
        uniquePostIds.forEach(postId => {
          if (postId) {
            const payment = data.find(p => p.post_id === postId && p.status === 'paid');
            statusMap[postId] = !!payment;
            console.log(`Post ${postId} payment status: ${statusMap[postId] ? 'paid' : 'unpaid'}`);
          }
        });

        console.log('Payment status map:', statusMap);
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

  const fetchMatches = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // First get all posts by this influencer
      const { data: userPosts, error: postsError } = await supabase
        .from('posts')
        .select('id')
        .eq('influencer_id', user.id);

      if (postsError) {
        console.error('Error fetching user posts:', postsError);
        toast.error('Failed to load user posts');
        return;
      }

      if (!userPosts || userPosts.length === 0) {
        console.log('No posts found for user');
        setMatches([]);
        return;
      }

      const postIds = userPosts.map(post => post.id);

      // Now get matches for those posts
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          profiles:brand_id (*),
          posts:post_id (*)
        `)
        .not('post_id', 'is', null)
        .in('post_id', postIds);

      if (error) {
        console.error('Error fetching matches:', error);
        toast.error('Failed to load matches');
        return;
      }

      console.log('Fetched matches:', data);
      setMatches(data || []);
    } catch (error) {
      console.error('Unexpected error fetching matches:', error);
      toast.error('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const updateMatchStatus = async (matchId: string, status: 'accepted' | 'rejected') => {
    setProcessingMatches(prev => ({ ...prev, [matchId]: true }));
    
    try {
      const { error } = await supabase
        .from('matches')
        .update({ status })
        .eq('id', matchId);

      if (error) {
        console.error('Error updating match status:', error);
        toast.error('Failed to update match status');
        return;
      }

      // Update local state
      setMatches(prev => 
        prev.map(match => 
          match.id === matchId ? { ...match, status } : match
        )
      );

      toast.success(`Match ${status} successfully`);
    } catch (error) {
      console.error('Unexpected error updating match:', error);
      toast.error('Failed to update match status');
    } finally {
      setProcessingMatches(prev => ({ ...prev, [matchId]: false }));
    }
  };

  const initiatePayment = async (postId: string, amount: number = 5000) => {
    try {
      const { data: existingPayment, error: checkError } = await supabase
        .from('payments')
        .select('id, status')
        .eq('post_id', postId)
        .eq('status', 'paid')
        .maybeSingle();

      if (checkError) {
        console.error(`Failed to check payment for post ${postId}:`, checkError.message);
        throw new Error('Failed to verify payment status');
      }

      if (existingPayment) {
        console.log(`Post ${postId} already paid`);
        setPaymentStatus(prev => ({
          ...prev,
          [postId]: true,
        }));
        setPaymentError(prev => ({ ...prev, [postId]: null }));
        setPaymentInitiated(prev => ({ ...prev, [postId]: false }));
        return;
      }

      setPaymentInitiated(prev => ({ ...prev, [postId]: true }));
      setPaymentError(prev => ({ ...prev, [postId]: null }));

      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('User not authenticated');

      const response = await axios.post('https://payment-gateway-serverless-lac.vercel.app/api/create-order', {
        amount,
        currency: 'INR',
      });

      const { orderId, amount: razorpayAmount, currency } = response.data;

      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: currentUser.id,
          post_id: postId,
          amount: razorpayAmount * 100,
          currency: 'INR',
          status: 'unpaid',
          razorpay_order_id: orderId,
        })
        .select()
        .single();

      if (paymentError) {
        console.error(`Failed to create payment record for ${postId}:`, paymentError.message);
        throw new Error('Failed to create payment record');
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayAmount * 100,
        currency,
        name: 'Sponsor Studio',
        description: `Payment for post ${postId}`,
        order_id: orderId,
        handler: async (response: any) => {
          try {
            const verifyResponse = await axios.post('https://payment-gateway-serverless-lac.vercel.app/api/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyResponse.data.success) {
              console.log(`Payment verified for post ${postId}`);
              const { error: updateError } = await supabase
                .from('payments')
                .update({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  status: 'paid',
                })
                .eq('id', payment.id);

              if (updateError) throw new Error('Failed to update payment status');

              setPaymentStatus(prev => {
                const newStatus = { ...prev, [postId]: true };
                console.log(`Payment status updated to paid for ${postId}:`, newStatus);
                return newStatus;
              });
              setPaymentError(prev => ({ ...prev, [postId]: null }));
            } else {
              console.log(`Payment verification failed for ${postId}`);
              await supabase
                .from('payments')
                .update({ status: 'unpaid' })
                .eq('id', payment.id);
              setPaymentError(prev => ({ ...prev, [postId]: 'Payment verification failed. Please contact support.' }));
            }
          } catch (error) {
            console.error(`Payment verification error for ${postId}:`, error);
            await supabase
              .from('payments')
              .update({ status: 'unpaid' })
              .eq('id', payment.id);
            setPaymentError(prev => ({ ...prev, [postId]: 'Error verifying payment. Please try again.' }));
          } finally {
            setPaymentInitiated(prev => ({ ...prev, [postId]: false }));
          }
        },
        prefill: {
          name: matches[0]?.profiles?.contact_person_name || 'User',
          email: 'user@example.com',
          contact: matches[0]?.profiles?.contact_person_phone || '+919999999999',
        },
        theme: {
          color: '#2B4B9B',
        },
      };

      const razorpay = new Razorpay(options);
      razorpay.on('payment.failed', async (response: any) => {
        console.log(`Payment failed for ${postId}:`, response.error.description);
        await supabase
          .from('payments')
          .update({ status: 'unpaid' })
          .eq('id', payment.id);
        setPaymentError(prev => ({ ...prev, [postId]: `Payment failed: ${response.error.description}` }));
        setPaymentInitiated(prev => ({ ...prev, [postId]: false }));
      });
      razorpay.open();
    } catch (error: any) {
      console.error(`Payment initiation error for ${postId}:`, error.message);
      setPaymentError(prev => ({ ...prev, [postId]: 'Failed to initiate payment. Please try again.' }));
      setPaymentInitiated(prev => ({ ...prev, [postId]: false }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Group matches by post
  const matchesByPost = matches.reduce((acc, match) => {
    const postId = match.posts?.id || match.post_id || 'missing_post';
    if (!acc[postId]) acc[postId] = [];
    acc[postId].push(match);
    return acc;
  }, {} as Record<string, Match[]>);

  const togglePost = (postId: string) => {
    setSelectedPostId(selectedPostId === postId ? null : postId);
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.3 },
    }),
  };

  const matchVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: 'auto', transition: { duration: 0.3 } },
    exit: { opacity: 0, height: 0, transition: { duration: 0.2 } },
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  if (loading) {
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
            className="flex items-center px-4 py-2 bg-gradient-to-r from-[#2B4B9B] to-[#3B5BB9] text-white rounded-lg shadow-md"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
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
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Matches</h3>
          <p className="text-gray-600">Please wait while we load your brand matches...</p>
        </motion.div>
      </motion.div>
    );
  }

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
            className="flex items-center px-4 py-2 bg-gradient-to-r from-[#2B4B9B] to-[#3B5BB9] text-white rounded-lg shadow-md"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
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
            className="flex items-center px-4 py-2 bg-gradient-to-r from-[#2B4B9B] to-[#3B5BB9] text-white rounded-lg shadow-md"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
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
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-gradient-to-r from-[#2B4B9B] to-[#3B5BB9] text-white rounded-lg shadow-md"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            Retry
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  if (matches.length === 0 || Object.keys(matchesByPost).length === 0) {
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
            className="flex items-center px-4 py-2 bg-gradient-to-r from-[#2B4B9B] to-[#3B5BB9] text-white rounded-lg shadow-md"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
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
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No matches found</h3>
          <p className="text-gray-600">When brands express interest in your posts, they will appear here.</p>
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
          className="flex items-center px-4 py-2 bg-gradient-to-r from-[#2B4B9B] to-[#3B5BB9] text-white rounded-lg shadow-md"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </motion.button>
      </div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        initial="hidden"
        animate="visible"
      >
        {Object.entries(matchesByPost).map(([postId, postMatches], index) => {
          const post = postMatches[0].posts;
          const isMissingPost = postId === 'missing_post';
          const isPaid = paymentStatus[postId] ?? false;
          const matchCount = postMatches.length;

          return (
            <motion.div
              key={postId}
              className="border border-gray-200 rounded-xl shadow-md p-5 bg-gradient-to-br from-white to-gray-50 hover:shadow-lg cursor-pointer transition-shadow"
              onClick={() => togglePost(postId)}
              variants={cardVariants}
              custom={index}
              initial="hidden"
              animate="visible"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {isMissingPost ? `Post ID: ${postMatches[0].post_id || 'Unknown'}` : (post?.title || 'Unknown Post')}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium">
                    {matchCount} Match{matchCount !== 1 ? 'es' : ''}
                  </p>
                  <p className="text-sm mt-1">
                    {isMissingPost ? (
                      <span className="text-red-600 font-medium">(Post Data Missing)</span>
                    ) : isPaid ? (
                      <span className="text-green-600 font-medium">(Unlocked)</span>
                    ) : (
                      <span className="text-red-600 font-medium">(Locked)</span>
                    )}
                  </p>
                </div>
                {selectedPostId === postId ? (
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
        {selectedPostId && matchesByPost[selectedPostId] && (
          <motion.div
            variants={matchVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {(() => {
              const postMatches = matchesByPost[selectedPostId];
              const post = postMatches[0].posts;
              const isMissingPost = selectedPostId === 'missing_post';
              const isPaid = paymentStatus[selectedPostId] ?? false;
              const paymentAmount = 5000;

              return (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    Matches for {isMissingPost ? `Post ID: ${postMatches[0].post_id || 'Unknown'}` : (post?.title || 'Unknown Post')}
                  </h3>
                  {isPaid ? (
                    <motion.div className="grid gap-6">
                      {postMatches.map((match, index) => (
                        <motion.div
                          key={match.id}
                          className={`rounded-xl border shadow-md p-6 transition-all duration-200 ${
                            match.status === 'pending'
                              ? 'border-yellow-300 bg-yellow-50'
                              : match.status === 'accepted'
                              ? 'border-green-300 bg-green-50'
                              : 'border-gray-300 bg-gray-50 opacity-90'
                          }`}
                          variants={cardVariants}
                          custom={index}
                          initial="hidden"
                          animate="visible"
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                            <div className="flex-grow">
                              <div className="flex items-center mb-3">
                                <Building className="w-6 h-6 text-gray-600 mr-2" />
                                <h4 className="text-xl font-semibold text-gray-900">
                                  {match.profiles?.company_name || 'Unknown Brand'}
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
                                  <strong>Industry:</strong>{' '}
                                  {match.profiles?.industry || 'Not specified'}
                                </p>
                                {match.profiles?.contact_person_name && (
                                  <p>
                                    <strong>Contact Person:</strong> {match.profiles.contact_person_name}
                                  </p>
                                )}
                                <p>
                                  <strong>Matched:</strong>{' '}
                                  {formatDate(match.created_at)}
                                </p>
                                {match.notes && match.status === 'accepted' && (
                                  <p>
                                    <strong>Notes:</strong> {match.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-end space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                              {match.status === 'pending' ? (
                                <>
                                  <motion.button
                                    onClick={() => updateMatchStatus(match.id, 'accepted')}
                                    disabled={processingMatches[match.id]}
                                    className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                  >
                                    {processingMatches[match.id] ? 'Processing...' : 'Accept'}
                                  </motion.button>
                                  <motion.button
                                    onClick={() => updateMatchStatus(match.id, 'rejected')}
                                    disabled={processingMatches[match.id]}
                                    className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                  >
                                    {processingMatches[match.id] ? 'Processing...' : 'Reject'}
                                  </motion.button>
                                </>
                              ) : match.status === 'accepted' ? (
                                <div className="text-center">
                                  <p className="text-green-600 font-medium text-sm">Match Accepted</p>
                                  <p className="text-xs text-gray-500">Contact details shared</p>
                                </div>
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
                      {isMissingPost ? (
                        <>
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">Post Data Missing</h3>
                          <p className="text-gray-600 mb-4">Matches cannot be displayed due to missing post data. Please contact support.</p>
                        </>
                      ) : (
                        <>
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">
                            Unlock Matches for {post?.title || 'this Post'}
                          </h3>
                          <p className="text-gray-600 mb-4">
                            A one-time fee of ₹{paymentAmount} is required to view matches.
                          </p>
                          {paymentError[selectedPostId] && (
                            <p className="text-sm text-red-600 mb-4">{paymentError[selectedPostId]}</p>
                          )}
                          <motion.button
                            onClick={() => initiatePayment(selectedPostId, paymentAmount)}
                            disabled={paymentInitiated[selectedPostId]}
                            className={`px-6 py-3 ${
                              paymentInitiated[selectedPostId]
                                ? 'bg-gray-400'
                                : 'bg-gradient-to-r from-[#2B4B9B] to-[#3B5BB9]'
                            } text-white rounded-lg shadow-md`}
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                          >
                            {paymentInitiated[selectedPostId] ? (
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
