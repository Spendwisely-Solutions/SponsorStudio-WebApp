import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import { sendMatchNotification } from '../../lib/email';
import { Search } from 'lucide-react';
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
  const [rejections, setRejections] = useState<string[]>([]);
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
      const matchedOpportunityIds = matchesData.map((match) => match.opportunity_id);
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
          ) &&
          !rejections.includes(opp.id)
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

    const filteredPosts = data.filter((post) => !rejections.includes(post.id));
    setPosts(filteredPosts);
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

  const handleReject = (id: string, type: 'opportunity' | 'post') => {
    console.log(`handleReject: Rejecting ${type} with ID ${id}`);
    const updatedRejections = [...rejections, id];
    setRejections(updatedRejections);

    if (type === 'opportunity') {
      const updatedOpportunities = opportunities.filter((opp) => opp.id !== id);
      setOpportunities(updatedOpportunities);
    } else {
      const updatedPosts = posts.filter((post) => post.id !== id);
      setPosts(updatedPosts);
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
        className="mb-4 bg-gradient-to-r from-white to-gray-50 p-4 rounded-xl shadow-md flex items-center justify-between transition-all duration-300 hover:shadow-lg"
        animate={shakeCredits ? { x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.5 } } : {}}
      >
        <div className="flex items-center space-x-2">
          <img
            src={coinIcon}
            alt="Credits"
            className="w-6 h-6"
            data-tooltip-id="credits-tooltip"
            data-tooltip-content="Available Credits"
          />
          <span
            className="text-sm sm:text-base font-semibold text-gray-800"
            data-tooltip-id="credits-tooltip"
            data-tooltip-content="Available Credits"
          >
            {credits ?? 'N/A'}
          </span>
          <Tooltip id="credits-tooltip" place="top" className="text-xs" />
        </div>
        <button
          className="px-4 py-2 bg-[#2B4B9B] text-white rounded-lg hover:bg-[#1a2f61] transition-colors duration-200 text-xs sm:text-sm font-medium"
          onClick={() => {
            window.location.href = '/purchase';
          }}
        >
          Add Credits
        </button>
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
            <NoResultsCard type="events" resetFilters={resetFilters} />
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