import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import { sendMatchNotification } from '../../lib/email';
import { Search, Info, Heart, FileText, RotateCcw, ShieldCheck, Calendar } from 'lucide-react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Tooltip } from 'react-tooltip';
import toast from 'react-hot-toast';
import ProfileAlert from './BrandDashboard/ProfileAlert';
import FilterSection from './BrandDashboard/FilterSection';
import TabsSection from './BrandDashboard/TabsSection';
import MatchNotification from './BrandDashboard/MatchNotification';
import MatchesSection from './BrandDashboard/MatchesSection';
import NoResultsCard from './BrandDashboard/NoResultsCard';
import OpportunityCard from './BrandDashboard/OpportunityCard';
import InfluencerPostCard from './BrandDashboard/InfluencerPostCard';
import type { Opportunity, Post, Category, Match } from './BrandDashboard/types';
import coinIcon from '../../assets/dashboard/coin.png';

interface BrandDashboardProps {
  onUpdateProfile: () => void;
}

export default function BrandDashboard({ onUpdateProfile }: BrandDashboardProps) {
  const { user, profile } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [matches, setMatches] = useState<string[]>([]);
  const [showMatchSuccess, setShowMatchSuccess] = useState(false);
  const [matchedOpportunity, setMatchedOpportunity] = useState<Opportunity | null>(null);
  const [activeTab, setActiveTab] = useState<'discover' | 'influencers' | 'matches'>('discover');
  const [userMatches, setUserMatches] = useState<Match[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
  });
  const [adTypeFilter, setAdTypeFilter] = useState<string>('');
  const [priceRangeFilter, setPriceRangeFilter] = useState<string>('');
  const [locationSearch, setLocationSearch] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [swipeActions, setSwipeActions] = useState<{ [key: string]: 'like' | 'dislike' | null }>({});
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [shakeCredits, setShakeCredits] = useState(false);
  const [pendingLikeId, setPendingLikeId] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(profile?.credits ?? null);

  const isInitialLoad = useRef(true);
  const hasRefreshed = useRef(false);
  const loadStartTime = useRef(Date.now());

  useEffect(() => {
    if (user) {
      const isNewUser = !profile?.company_name;

      const timer = setTimeout(() => {
        if (isInitialLoad.current && loading && isNewUser && !hasRefreshed.current) {
          console.log('Initial load taking too long, triggering auto-refresh');
          hasRefreshed.current = true;
          window.location.reload();
        }
      }, 2000);

      fetchCategories();
      fetchUserMatches();
      fetchPosts();
      fetchOpportunities();

      return () => {
        clearTimeout(timer);
        isInitialLoad.current = false;
      };
    }
  }, [user, profile]);

  useEffect(() => {
    setCredits(profile?.credits ?? null);
  }, [profile?.credits]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowFullDetails(scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) {
      console.error('Error fetching categories:', error);
      return;
    }
    setCategories(data || []);
  };

  const fetchUserMatches = async () => {
    if (!user) return;
    try {
      const { data: matchesData, error } = await supabase
        .from('matches')
        .select(`
          *,
          opportunities:opportunity_id (
            *,
            profiles:creator_id (*)
          )
        `)
        .eq('brand_id', user.id);
      if (error) throw error;
      const matchedOpportunityIds = matchesData
        .filter((match) => match.opportunity_id)
        .map((match) => match.opportunity_id);
      setMatches(matchedOpportunityIds);
      setUserMatches(matchesData as Match[]);
      setStats({
        total: opportunities.length,
        pending: matchesData.filter((m) => m.status === 'pending').length,
        accepted: matchesData.filter((m) => m.status === 'accepted').length,
        rejected: matchesData.filter((m) => m.status === 'rejected').length,
      });
    } catch (error) {
      console.error('Error fetching user matches:', error);
    }
  };

  const fetchOpportunities = async (resetIndex: boolean = false) => {
    let query = supabase
      .from('opportunities')
      .select(`
        *,
        categories:category_id (name),
        profiles:creator_id (company_name)
      `)
      .eq('status', 'active')
      .eq('verification_status', 'approved');

    // Exclude disliked opportunities
    if (user) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('disliked_opportunities')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('fetchOpportunities: Error fetching profile data:', profileError);
        return;
      }

      if (profileData?.disliked_opportunities?.length > 0) {
        query = query.not('id', 'in', `(${profileData.disliked_opportunities.join(',')})`);
      }
    }

    if (selectedCategory) {
      query = query.eq('category_id', selectedCategory);
    }
    if (adTypeFilter) {
      query = query.eq('ad_type', adTypeFilter);
    }
    if (priceRangeFilter) {
      const [min, max] = priceRangeFilter.split('-').map(Number);
      query = query.contains('price_range', { min, max });
    }
    if (locationSearch) {
      query = query.ilike('location', `%${locationSearch}%`);
    }
    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching opportunities:', error);
      return;
    }

    const filteredOpportunities = data
      .map((opp: any) => ({
        ...opp,
        category_name: opp.categories?.name || 'N/A',
        creator_name: opp.profiles?.company_name || 'Unknown Creator',
      }))
      .filter(
        (opp: any) =>
          !userMatches.some(
            (match) =>
              match.opportunity_id === opp.id &&
              (match.status === 'pending' || match.status === 'accepted')
          )
      );
    setOpportunities(filteredOpportunities);
    setLoading(false);
  };

  const fetchPosts = async (resetIndex: boolean = false) => {
    let query = supabase
      .from('posts')
      .select('*, categories(*)')
      .eq('status', 'active')
      .eq('verification_status', 'approved');

    // Exclude disliked posts
    if (user) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('disliked_posts')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('fetchPosts: Error fetching profile data:', profileError);
        return;
      }

      if (profileData?.disliked_posts?.length > 0) {
        query = query.not('id', 'in', `(${profileData.disliked_posts.join(',')})`);
      }
    }

    if (selectedCategory) {
      query = query.eq('category_id', selectedCategory);
    }
    if (priceRangeFilter) {
      const [min, max] = priceRangeFilter.split('-').map(Number);
      query = query.contains('price_range', { min, max });
    }
    if (locationSearch) {
      query = query.ilike('location', `%${locationSearch}%`);
    }
    if (searchQuery) {
      query = query.or(
        `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,hashtags.ilike.%${searchQuery}%`
      );
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching posts:', error);
      return;
    }

    setPosts(data);
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      if (activeTab === 'discover') {
        fetchOpportunities(true);
      } else if (activeTab === 'influencers') {
        fetchPosts(true);
      }
    }
  }, [user, selectedCategory, adTypeFilter, priceRangeFilter, locationSearch, searchQuery, userMatches, activeTab]);

  const fetchProfile = async () => {
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('credits, company_name')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      setCredits(data.credits ?? null);
      console.log(`fetchProfile: Updated local credits to ${data.credits}`);
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const refreshToken = async () => {
    console.log('refreshToken: Attempting to refresh session');
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      if (!data.session?.access_token) {
        throw new Error('No access token in refreshed session');
      }
      console.log('refreshToken: Session refreshed successfully');
      return data.session.access_token;
    } catch (error) {
      console.error('refreshToken: Failed to refresh session:', error);
      throw error;
    }
  };

  const deductCredits = async (creditsToDeduct: number): Promise<void> => {
    if (!user) {
      console.error('deductCredits: User not available');
      toast.error('Please log in to perform this action.', {
        duration: 4000,
        position: 'top-center',
      });
      throw new Error('User not authenticated');
    }

    if ((credits ?? 0) < creditsToDeduct) {
      console.log(`deductCredits: Insufficient credits, need ${creditsToDeduct}, have ${credits}`);
      setShakeCredits(true);
      toast.error(`Insufficient credits! You need ${creditsToDeduct} credits to perform this action.`, {
        duration: 4000,
        position: 'top-center',
      });
      setTimeout(() => setShakeCredits(false), 500);
      throw new Error('Insufficient credits');
    }

    const originalCredits = credits;
    setCredits((prev) => (prev ?? 0) - creditsToDeduct);
    console.log(`deductCredits: Optimistically updated credits to ${(credits ?? 0) - creditsToDeduct}`);

    try {
      let accessToken = user.access_token;
      if (!accessToken) {
        console.log('deductCredits: No access token, attempting refresh');
        accessToken = await refreshToken();
      }

      const response = await fetch('https://urablfvmqregyvfyaovi.supabase.co/functions/v1/update-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          userId: user.id,
          creditsToDeduct,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401 && errorData.code === 401 && errorData.message === 'Invalid JWT') {
          console.error('deductCredits: Invalid JWT, attempting token refresh');
          try {
            accessToken = await refreshToken();
            const retryResponse = await fetch('https://urablfvmqregyvfyaovi.supabase.co/functions/v1/update-credits', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
              },
              body: JSON.stringify({
                userId: user.id,
                creditsToDeduct,
              }),
            });
            if (!retryResponse.ok) {
              const retryErrorData = await retryResponse.json().catch(() => ({}));
              throw new Error(`Retry failed: ${retryErrorData.message || retryResponse.statusText}`);
            }
          } catch (refreshError) {
            console.error('deductCredits: Token refresh failed:', refreshError);
            toast.error('Session expired. Please log in again.', {
              duration: 4000,
              position: 'top-center',
            });
            throw new Error('Invalid JWT');
          }
        } else {
          throw new Error(`Failed to deduct credits: ${errorData.message || response.statusText}`);
        }
      }

      const data = await response.json();
      console.log('deductCredits: Credits deducted successfully:', data);

      const serverProfile = await fetchProfile();
      if (serverProfile && serverProfile.credits !== credits) {
        console.log(`deductCredits: Server credits (${serverProfile.credits}) differ from local (${credits}), syncing`);
        setCredits(serverProfile.credits ?? null);
      }
    } catch (error: any) {
      setCredits(originalCredits);
      console.log(`deductCredits: Restored credits to ${originalCredits} due to failure`);
      if (error.message === 'Invalid JWT') {
        toast.error('Session expired. Please log in again.', {
          duration: 4000,
          position: 'top-center',
        });
      } else {
        toast.error(`Failed to deduct ${creditsToDeduct} credits. Please try again.`, {
          duration: 4000,
          position: 'top-center',
        });
      }
      throw error;
    }
  };

  const handleLike = async (id: string, type: 'opportunity' | 'post' = 'opportunity') => {
    if (!user || !profile) {
      console.error('handleLike: User or profile not available');
      toast.error('Please log in to perform this action.', {
        duration: 4000,
        position: 'top-center',
      });
      return;
    }

    console.log(`handleLike: Attempting to like ${type} with ID ${id}, credits: ${credits}`);
    setPendingLikeId(id);

    let item: Opportunity | Post | null = null;
    if (type === 'opportunity') {
      item = opportunities.find((opp) => opp.id === id) || null;
    } else {
      item = posts.find((post) => post.id === id) || null;
    }
    if (!item) {
      console.error('handleLike: Item not found');
      setPendingLikeId(null);
      return;
    }

    try {
      await deductCredits(50);

      if (type === 'opportunity') {
        setOpportunities(opportunities.filter((opp) => opp.id !== id));
        const { data: opportunityData, error: opportunityError } = await supabase
          .from('opportunities')
          .select(`
            *,
            profiles:creator_id (*)
          `)
          .eq('id', id)
          .single();

        if (opportunityError) {
          console.error('handleLike: Error fetching opportunity data:', opportunityError);
          throw opportunityError;
        }

        const { error } = await supabase.from('matches').insert({
          opportunity_id: id,
          brand_id: user.id,
          status: 'pending',
        });

        if (error) {
          console.error('handleLike: Error inserting match:', error);
          throw error;
        }

        if (profile) {
          try {
            const creatorProfile = (opportunityData as any).profiles;

            await sendMatchNotification(
              profile.company_name || user.email || '',
              user.email || '',
              opportunityData.title,
              creatorProfile?.company_name || 'Event Organizer',
              creatorProfile?.email || '',
              opportunityData.calendly_link,
              opportunityData.sponsorship_brochure_url
            );
            console.log('handleLike: Match notification sent');

            setMatchedOpportunity(opportunityData);
            setShowMatchSuccess(true);

            setTimeout(() => {
              setShowMatchSuccess(false);
              setMatchedOpportunity(null);
            }, 5000);
          } catch (emailError) {
            console.error('handleLike: Error sending email notification:', emailError);
          }
        }

        const updatedMatches = [...matches, id];
        setMatches(updatedMatches);
        fetchUserMatches();
      } else {
        setPosts(posts.filter((post) => post.id !== id));
        const { data: postData, error: postError } = await supabase
          .from('posts')
          .select(`
            *,
            profiles:influencer_id (*)
          `)
          .eq('id', id)
          .single();

        if (postError) {
          console.error('handleLike: Error fetching post data:', postError);
          throw postError;
        }

        const { error } = await supabase.from('matches').insert({
          post_id: id,
          brand_id: user.id,
          status: 'pending',
        });

        if (error) {
          console.error('handleLike: Error inserting match:', error);
          throw error;
        }

        if (profile) {
          try {
            const influencerProfile = (postData as any).profiles;

            await sendMatchNotification(
              profile.company_name || user.email || '',
              user.email || '',
              postData.title,
              influencerProfile?.company_name || 'Influencer',
              influencerProfile?.email || '',
              null,
              null
            );
            console.log('handleLike: Match notification sent for post');

            setShowMatchSuccess(true);

            setTimeout(() => {
              setShowMatchSuccess(false);
            }, 5000);
          } catch (emailError) {
            console.error('handleLike: Error sending email notification:', emailError);
          }
        }
      }
      console.log(`handleLike: Successfully liked ${type} with ID ${id}`);
    } catch (error: any) {
      console.error('handleLike: Error:', error);
      if (type === 'opportunity') {
        setOpportunities([item as Opportunity, ...opportunities]);
      } else {
        setPosts([item as Post, ...posts]);
      }
      setSwipeActions((prev) => ({ ...prev, [id]: null }));
      setPendingLikeId(null);
    }
  };

  const handleReject = async (id: string, type: 'opportunity' | 'post') => {
    console.log(`handleReject: Rejecting ${type} with ID ${id}`);
    if (!user) {
      console.error('handleReject: User not available');
      toast.error('Please log in to perform this action.', {
        duration: 4000,
        position: 'top-center',
      });
      return;
    }

    try {
      // Call server-side function to handle dislike
      const { error } = await supabase.rpc('add_dislike', {
        user_id: user.id,
        item_id: id,
        item_type: type,
      });

      if (error) {
        console.error('handleReject: Error updating profile:', error);
        throw error;
      }

      // Update local state to filter out the disliked item
      if (type === 'opportunity') {
        setOpportunities(opportunities.filter((opp) => opp.id !== id));
      } else {
        setPosts(posts.filter((post) => post.id !== id));
      }
      console.log(`handleReject: Successfully recorded dislike for ${type} with ID ${id}`);

    } catch (error) {
      console.error('handleReject: Error:', error);
      toast.error('Failed to record dislike. Please try again.', {
        duration: 4000,
        position: 'top-center',
      });
    }
  };

  const handleResetDislikedOpportunities = async () => {
    if (!user) {
      console.error('handleResetDislikedOpportunities: User not available');
      toast.error('Please log in to perform this action.', {
        duration: 4000,
        position: 'top-center',
      });
      return;
    }

    try {
      // Deduct 300 credits before resetting
      await deductCredits(300);

      // Call server-side function to reset disliked_opportunities
      const { error } = await supabase.rpc('reset_disliked_opportunities', {
        user_id: user.id,
      });

      if (error) {
        console.error('handleResetDislikedOpportunities: Error resetting disliked opportunities:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        throw error;
      }

      // Refresh opportunities to include previously disliked items
      await fetchOpportunities(true);
      console.log('handleResetDislikedOpportunities: Successfully reset disliked opportunities');

      // Show confirmation toast
      toast.success('Disliked opportunities revived.', {
        duration: 4000,
        position: 'bottom-right',
      });
    } catch (error: any) {
      console.error('handleResetDislikedOpportunities: Error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      if (error.code === 'PGRST202') {
        toast.error('Reset function not found. Please contact support.', {
          duration: 4000,
          position: 'top-center',
        });
      } else if (error.message === 'Insufficient credits') {
        // Error already handled by deductCredits with shake animation and toast
      } else if (error.message === 'Invalid JWT') {
        // Error already handled by deductCredits with session expired toast
      } else {
        toast.error('Failed to revive opportunities. Please try again.', {
          duration: 4000,
          position: 'top-center',
        });
      }
    }
  };

  const resetFilters = () => {
    setSelectedCategory('');
    setLocationFilter('');
    setShowFilters(false);
    setAdTypeFilter('');
    setPriceRangeFilter('');
    setLocationSearch('');
    setSearchQuery('');
  };

  const handleAnimationComplete = (id: string) => {
    setSwipeActions((prev) => ({ ...prev, [id]: null }));
  };

  const pendingMatches = userMatches.filter((match) => match.status === 'pending');
  const acceptedMatches = userMatches.filter((match) => match.status === 'accepted');
  const rejectedMatches = userMatches.filter((match) => match.status === 'rejected');

  const generateGoogleCalendarLink = (match: Match) => {
    const event = {
      title: `Meeting for ${match.opportunities?.title || 'Opportunity'}`,
      description: `Meeting with brand and creator.\nJoin Meeting: ${match.meeting_link || ''}`,
      start: match.meeting_scheduled_at || new Date().toISOString(),
      end: match.meeting_scheduled_at
        ? new Date(new Date(match.meeting_scheduled_at).getTime() + 60 * 60 * 1000).toISOString()
        : new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(),
      location: match.meeting_link || match.opportunities?.location || 'TBD',
    };

    const baseUrl = 'https://calendar.google.com/calendar/render';
    const startTime = new Date(event.start).toISOString().replace(/[-:]/g, '').split('.')[0];
    const endTime = new Date(event.end).toISOString().replace(/[-:]/g, '').split('.')[0];
    const dates = `${startTime}%2F${endTime}`;
    const encodedDescription = encodeURIComponent(event.description.trim());

    const params = [
      `action=TEMPLATE`,
      `text=${encodeURIComponent(event.title.trim()).replace(/%20/g, '+')}`,
      `dates=${dates}`,
      `details=${encodedDescription}`,
      `location=${encodeURIComponent(event.location.trim())}`,
    ];

    return `${baseUrl}?${params.join('&')}`;
  };

  if (loading) {
    return (
      <div className="max-w-full overflow-x-hidden">
        <div className="mb-4 flex items-center space-x-2">
          <Skeleton circle width={24} height={24} />
          <Skeleton width={80} height={20} />
        </div>
        <ProfileAlert companyName={profile?.company_name} onUpdateProfile={onUpdateProfile} />
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
          <Skeleton width={200} height={24} />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:space-x-2 mt-4 sm:mt-0">
            <Skeleton width={80} height={32} />
            <Skeleton width={200} height={32} />
          </div>
        </div>
        <div className="mb-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-4 sm:gap-8">
            <Skeleton width={120} height={20} />
            <Skeleton width={150} height={20} />
            <Skeleton width={150} height={20} />
          </div>
        </div>
        <div>
          {showFilters && (
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm mb-4">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <Skeleton width={150} height={16} />
                <Skeleton width={100} height={16} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {Array(4)
                  .fill(0)
                  .map((_, index) => (
                    <div key={index}>
                      <Skeleton width={80} height={12} className="mb-1" />
                      <Skeleton height={32} />
                    </div>
                  ))}
              </div>
              <div className="mt-3 sm:mt-4">
                <Skeleton width={80} height={12} className="mb-1" />
                <Skeleton height={32} />
              </div>
            </div>
          )}
          <div className="min-h-[400px] sm:min-h-[500px] bg-white rounded-lg shadow-sm overflow-hidden">
            <Skeleton height={192} className="sm:h-64" />
            <div className="p-4 sm:p-6">
              <Skeleton width="80%" height={24} className="mb-2" />
              <Skeleton width={120} height={16} className="mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                <Skeleton width={150} height={16} />
                <Skeleton width={150} height={16} />
              </div>
              <Skeleton width={100} height={16} className="mb-4" />
              <Skeleton count={3} height={16} className="mb-2" />
              <div className="flex justify-center gap-4 mt-4">
                <Skeleton circle width={48} height={48} />
                <Skeleton circle width={48} height={48} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log(`Rendering BrandDashboard with credits: ${credits}, access_token: ${user?.access_token ? 'present' : 'missing'}`);

  return (
    <div className="max-w-full overflow-x-hidden">
      <motion.div
        className="mb-4 bg-gradient-to-r from-white to-gray-50 p-4 rounded-xl shadow-md flex items-center justify-between transition-all duration-300 hover:shadow-lg border border-gray-100"
        animate={shakeCredits ? { x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.5 } } : {}}
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={coinIcon}
              alt="Credits"
              className="w-7 h-7 drop-shadow-sm"
            />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div className="flex flex-col">
            <span
              className="text-lg font-bold text-gray-800"
              data-tooltip-id="credits-info-tooltip"
            >
              {credits ?? 'N/A'}
            </span>
            <span className="text-xs text-gray-500 font-medium">Available Credits</span>
          </div>
          <button
            className="ml-2 p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200"
            data-tooltip-id="credits-info-tooltip"
          >
            <Info className="w-4 h-4" />
          </button>
          <Tooltip 
            id="credits-info-tooltip" 
            place="bottom" 
            className="!bg-white !text-gray-800 !shadow-xl !border !border-gray-200 !rounded-xl !p-0 !opacity-100"
            style={{ 
              backgroundColor: '#ffffff',
              color: '#1f2937',
              borderRadius: '12px',
              padding: '0',
              fontSize: '13px',
              maxWidth: '320px',
              zIndex: 1000,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
            html={`
              <div class="p-4">
                <div class="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                  <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg class="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                  <span class="font-semibold text-gray-800">Credit Usage Guide</span>
                </div>
                <div class="space-y-2.5">
                  <div class="flex items-center justify-between p-2 bg-red-50 rounded-lg border border-red-100">
                    <div class="flex items-center gap-2">
                      <div class="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center">
                        <svg class="w-2.5 h-2.5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
                        </svg>
                      </div>
                      <span class="text-gray-700 text-sm font-medium">Like/Interest</span>
                    </div>
                    <span class="font-bold text-red-600 text-sm">50 credits</span>
                  </div>
                  <div class="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-100">
                    <div class="flex items-center gap-2">
                      <div class="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg class="w-2.5 h-2.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"></path>
                        </svg>
                      </div>
                      <span class="text-gray-700 text-sm font-medium">Unlock Brochure</span>
                    </div>
                    <span class="font-bold text-blue-600 text-sm">100 credits</span>
                  </div>
                  <div class="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-100">
                    <div class="flex items-center gap-2">
                      <div class="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                        <svg class="w-2.5 h-2.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clip-rule="evenodd"></path>
                        </svg>
                      </div>
                      <span class="text-gray-700 text-sm font-medium">Post Event Report</span>
                    </div>
                    <span class="font-bold text-green-600 text-sm">100 credits</span>
                  </div>
                  <div class="flex items-center justify-between p-2 bg-orange-50 rounded-lg border border-orange-100">
                    <div class="flex items-center gap-2">
                      <div class="w-4 h-4 bg-orange-100 rounded-full flex items-center justify-center">
                        <svg class="w-2.5 h-2.5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"></path>
                        </svg>
                      </div>
                      <span class="text-gray-700 text-sm font-medium">Revive Opportunities</span>
                    </div>
                    <span class="font-bold text-orange-600 text-sm">300 credits</span>
                  </div>
                  <div class="flex items-center justify-between p-2 bg-purple-50 rounded-lg border border-purple-100">
                    <div class="flex items-center gap-2">
                      <div class="w-4 h-4 bg-purple-100 rounded-full flex items-center justify-center">
                        <svg class="w-2.5 h-2.5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                        </svg>
                      </div>
                      <span class="text-gray-700 text-sm font-medium">Risk Analysis Report</span>
                    </div>
                    <span class="font-bold text-purple-600 text-sm">500 credits</span>
                  </div>
                </div>
                <div class="mt-3 pt-2 border-t border-gray-100">
                  <p class="text-xs text-gray-500 text-center">💡 Credits are deducted when actions are completed</p>
                </div>
              </div>
            `}
          />
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="px-4 py-2 bg-[#2B4B9B] text-white rounded-lg hover:bg-[#1a2f61] transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md transform hover:scale-105"
            onClick={() => {
              window.location.href = '/purchase';
            }}
          >
            <span className="flex items-center gap-2">
              <span>Add Credits</span>
              <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">+</span>
            </span>
          </button>
        </div>
      </motion.div>

      <ProfileAlert companyName={profile?.company_name} onUpdateProfile={onUpdateProfile} />
      {(activeTab === 'discover' || activeTab === 'influencers') && (
        <FilterSection
          showFilters={showFilters}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          adTypeFilter={adTypeFilter}
          setAdTypeFilter={setAdTypeFilter}
          priceRangeFilter={priceRangeFilter}
          setPriceRangeFilter={setPriceRangeFilter}
          locationSearch={locationSearch}
          setLocationSearch={setLocationSearch}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          resetFilters={resetFilters}
          toggleFilters={() => setShowFilters(!showFilters)}
          isInfluencerTab={activeTab === 'influencers'}
        />
      )}
      <TabsSection
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingMatches={pendingMatches}
      />
      <MatchNotification
        showMatchSuccess={showMatchSuccess}
        matchedOpportunity={matchedOpportunity}
        isInfluencerTab={activeTab === 'influencers'}
      />
      {activeTab === 'discover' && (
        <>
          {opportunities.length === 0 ? (
            <NoResultsCard
              type="events"
              resetFilters={resetFilters}
              resetDislikedEvents={handleResetDislikedOpportunities}
            />
          ) : (
            <div className="min-h-[calc(100vh-150px)] sm:min-h-[calc(100vh-100px)]">
              <AnimatePresence>
                {opportunities
                  .filter((opportunity) => opportunity.id !== pendingLikeId)
                  .slice(0, 1)
                  .map((opportunity) => (
                    <OpportunityCard
                      key={opportunity.id}
                      opportunity={opportunity}
                      onLike={async (id: string) => {
                        setSwipeActions((prev) => ({ ...prev, [id]: 'like' }));
                        await handleLike(id, 'opportunity');
                      }}
                      onReject={(id: string) => {
                        setSwipeActions((prev) => ({ ...prev, [id]: 'dislike' }));
                        handleReject(id, 'opportunity');
                      }}
                      swipeAction={swipeActions[opportunity.id] || null}
                      onAnimationComplete={handleAnimationComplete}
                      showFullDetails={showFullDetails}
                      setShowFullDetails={setShowFullDetails}
                      credits={credits ?? 0}
                      deductCredits={deductCredits}
                    />
                  ))}
              </AnimatePresence>
              {opportunities.length === 1 && !pendingLikeId && (
                <div className="w-full min-h-[calc(100vh-150px)] sm:min-h-[calc(100vh-100px)] flex items-center justify-center">
                  <div className="text-center p-6">
                    <Search className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-xl font-medium text-gray-700 mb-2">
                      No more events available
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                      You've gone through all available events matching your criteria.
                    </p>
                    <button
                      onClick={resetFilters}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#2B4B9B] text-white rounded-lg hover:bg-[#1a2f61] text-xs sm:text-sm"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
      {activeTab === 'influencers' && (
        <>
          {posts.length === 0 ? (
            <NoResultsCard type="influencer posts" resetFilters={resetFilters} />
          ) : (
            <div className="h-[calc(100vh-150px)] sm:h-[calc(100vh-100px)] overflow-y-auto snap-y snap-mandatory">
              <AnimatePresence>
                {posts.map((post) => (
                  <InfluencerPostCard
                    key={post.id}
                    post={post}
                    onLike={async (id: string) => {
                      setSwipeActions((prev) => ({ ...prev, [id]: 'like' }));
                      await handleLike(id, 'post');
                    }}
                    onReject={(id: string) => {
                      setSwipeActions((prev) => ({ ...prev, [id]: 'dislike' }));
                      handleReject(id, 'post');
                    }}
                    swipeAction={swipeActions[post.id] || null}
                    onAnimationComplete={handleAnimationComplete}
                    credits={credits ?? 0}
                  />
                ))}
              </AnimatePresence>
              <div className="snap-center flex-shrink-0 w-full h-[calc(100vh-150px)] sm:h-[calc(100vh-100px)] flex items-center justify-center">
                <div className="text-center p-6">
                  <Search className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-xl font-medium text-gray-700 mb-2">
                    No more influencer posts available
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                    You've gone through all available influencer posts matching your criteria.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#2B4B9B] text-white rounded-lg hover:bg-[#1a2f61] text-xs sm:text-sm"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {activeTab === 'matches' && (
        <MatchesSection
          matches={matches}
          pendingMatches={pendingMatches}
          acceptedMatches={acceptedMatches}
          rejectedMatches={rejectedMatches}
          setActiveTab={setActiveTab}
          generateGoogleCalendarLink={generateGoogleCalendarLink}
          deductCredits={deductCredits}
        />
      )}
    </div>
  );
}