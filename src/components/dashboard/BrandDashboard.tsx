import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import { sendMatchNotification } from '../../lib/email';
import { Search } from 'lucide-react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import toast from 'react-hot-toast';
import ProfileAlert from './BrandDashboard/ProfileAlert';
import FilterSection from './BrandDashboard/FilterSection';
import TabsSection from './BrandDashboard/TabsSection';
import MatchNotification from './BrandDashboard/MatchNotification';
import MatchesSection from './BrandDashboard/MatchesSection';
import NoResultsCard from './BrandDashboard/NoResultsCard';
import OpportunityCard from './BrandDashboard/OpportunityCard';
import InfluencerPostCard from './BrandDashboard/InfluencerPostCard';
import CreditBar from './BrandDashboard/CreditBar'; // Import the new CreditBar component
import type { Opportunity, Post, Category, Match } from './BrandDashboard/types';
import { useLocation } from 'react-router-dom';

interface BrandDashboardProps {
  onUpdateProfile: () => void;
}

export default function BrandDashboard({ onUpdateProfile }: BrandDashboardProps) {
  const { user, profile } = useAuth();
  const location = useLocation();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [matches, setMatches] = useState<string[]>([]);
  const [showMatchSuccess, setShowMatchSuccess] = useState(false);
  const [matchedOpportunity, setMatchedOpportunity] = useState<Opportunity | null>(null);
  const [activeTab, setActiveTab] = useState<'discover' | 'influencers' | 'matches'>('discover');
  const [userMatches, setUserMatches] = useState<Match[]>([]);
  const [adTypeFilter, setAdTypeFilter] = useState<string>('');
  const [priceRangeFilter, setPriceRangeFilter] = useState<string>('');
  const [locationSearch, setLocationSearch] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [swipeActions, setSwipeActions] = useState<{ [key: string]: 'like' | 'dislike' | null }>({});
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [shakeCredits, setShakeCredits] = useState(false);
  const [pendingLikeId, setPendingLikeId] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>((profile as any)?.credits ?? null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);

  const isInitialLoad = useRef(true);
  const hasRefreshed = useRef(false);

  // Extract search query from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search') || '';
    setSearchQuery(searchParam);
  }, [location.search]);

  useEffect(() => {
    if (user) {
      const isNewUser = !profile?.company_name;

      const timer = setTimeout(() => {
        if (isInitialLoad.current && loading && isNewUser && !hasRefreshed.current) {
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
  }, [posts]);

  useEffect(() => {
    setCredits((profile as any)?.credits ?? null);
  }, [(profile as any)?.credits]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowFullDetails(scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Pull-to-refresh functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setTouchStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (window.scrollY === 0 && touchStartY > 0) {
      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, Math.min(150, currentY - touchStartY));
      setPullDistance(distance);
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 100) {
      setIsRefreshing(true);
      // Refresh data
      setTimeout(() => {
        if (activeTab === 'discover') {
          fetchOpportunities();
        } else if (activeTab === 'influencers') {
          fetchPosts();
        }
        setIsRefreshing(false);
        setPullDistance(0);
      }, 1000);
    } else {
      setPullDistance(0);
    }
    setTouchStartY(0);
  };

  // Prevent horizontal overflow
  useEffect(() => {
    const handleResize = () => {
      document.body.style.overflowX = 'hidden';
      document.documentElement.style.overflowX = 'hidden';
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (activeTab === 'discover') {
      fetchOpportunities();
    } else if (activeTab === 'influencers') {
      fetchPosts();
    } else {
      fetchUserMatches();
    }
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('id, name');
    if (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories.');
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
          id,
          opportunity_id,
          created_at,
          status,
          notes,
          meeting_scheduled_at,
          meeting_link,
          opportunities:opportunity_id (
            id,
            title,
            sponsorship_brochure_url,
            location,
            profiles:creator_id (company_name)
          ),
          profiles:brand_id (
            company_name,
            industry,
            contact_person_name
          )
        `)
        .eq('brand_id', user.id);
      if (error) throw error;
      const matchedOpportunityIds = matchesData
        .filter((match) => match.opportunity_id)
        .map((match) => match.opportunity_id);
      setMatches(matchedOpportunityIds);
      setUserMatches(matchesData as Match[]);
    } catch (error) {
      console.error('Error fetching user matches:', error);
      toast.error('Failed to load matches.');
    }
  };

  const fetchOpportunities = async () => {
    let query = supabase
      .from('opportunities')
      .select(`
        id,
        title,
        description,
        location,
        start_date,
        end_date,
        ad_type,
        price_range,
        media_urls,
        sponsorship_brochure_url,
        calendly_link,
        reach,
        requirements,
        benefits,
        category_id,
        status,
        verification_status,
        creator_id,
        categories:category_id (name),
        profiles:creator_id (company_name)
      `)
      .eq('status', 'active')
      .eq('verification_status', 'approved')

    if (user) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('disliked_opportunities')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('fetchOpportunities: Error fetching profile data:', profileError);
        toast.error('Failed to load profile data.');
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
      toast.error('Failed to load opportunities.');
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

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          post_categories:category_id (id, name)
        `)
        .eq('status', 'active')
        .eq('verification_status', 'approved');

      if (user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('disliked_posts')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('fetchPosts: Error fetching profile data:', profileError);
          toast.error('Failed to load profile data.');
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
        console.error('fetchPosts: Error fetching posts:', error);
        toast.error('Failed to load posts: ' + error.message);
        return;
      }

      const transformedPosts = data.map((post) => ({
        ...post,
        category: post.post_categories || null,
      }));

      setPosts(transformedPosts || []);
    } catch (error) {
      console.error('fetchPosts: Unexpected error:', error);
      toast.error('An unexpected error occurred while loading posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      if (activeTab === 'discover') {
        fetchOpportunities();
      } else if (activeTab === 'influencers') {
        fetchPosts();
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
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile.');
      return null;
    }
  };

  const refreshToken = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      if (!data.session?.access_token) {
        throw new Error('No access token in refreshed session');
      }
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

    try {
      let accessToken = (user as any).access_token;
      if (!accessToken) {
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

      const serverProfile = await fetchProfile();
      if (serverProfile && serverProfile.credits !== credits) {
        setCredits(serverProfile.credits ?? null);
      }
    } catch (error: any) {
      setCredits(originalCredits);
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
            id,
            title,
            calendly_link,
            sponsorship_brochure_url,
            profiles:creator_id (company_name, email)
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
              undefined,
              undefined
            );

            setShowMatchSuccess(true);

            setTimeout(() => {
              setShowMatchSuccess(false);
            }, 5000);
          } catch (emailError) {
            console.error('handleLike: Error sending email notification:', emailError);
          }
        }
      }
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
    if (!user) {
      console.error('handleReject: User not available');
      toast.error('Please log in to perform this action.', {
        duration: 4000,
        position: 'top-center',
      });
      return;
    }

    try {
      const { error } = await supabase.rpc('add_dislike', {
        user_id: user.id,
        item_id: id,
        item_type: type,
      });

      if (error) {
        console.error('handleReject: Error updating profile:', error);
        throw error;
      }

      if (type === 'opportunity') {
        setOpportunities(opportunities.filter((opp) => opp.id !== id));
      } else {
        setPosts(posts.filter((post) => post.id !== id));
      }
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
      await deductCredits(300);
      const { error } = await supabase.rpc('reset_disliked_opportunities', {
        user_id: user.id,
      });

      if (error) {
        console.error('handleResetDislikedOpportunities: Error resetting disliked opportunities:', error);
        throw error;
      }

      await fetchOpportunities();
      toast.success('Disliked opportunities revived.', {
        duration: 4000,
        position: 'bottom-right',
      });
    } catch (error: any) {
      console.error('handleResetDislikedOpportunities: Error:', error);
      if (error.message === 'Insufficient credits') {
        // Handled by deductCredits
      } else if (error.message === 'Invalid JWT') {
        // Handled by deductCredits
      } else {
        toast.error('Failed to revive opportunities. Please try again.', {
          duration: 4000,
          position: 'top-center',
        });
      }
    }
  };

  const handleResetDislikedPosts = async () => {
    if (!user) {
      console.error('handleResetDislikedPosts: User not available');
      toast.error('Please log in to perform this action.', {
        duration: 4000,
        position: 'top-center',
      });
      return;
    }

    try {
      await deductCredits(300);
      const { error } = await supabase
        .from('profiles')
        .update({ disliked_posts: [] })
        .eq('id', user.id);

      if (error) {
        console.error('handleResetDislikedPosts: Error resetting disliked posts:', error);
        throw error;
      }

      await fetchPosts();
      toast.success('Disliked posts revived.', {
        duration: 4000,
        position: 'bottom-right',
      });
    } catch (error: any) {
      console.error('handleResetDislikedPosts: Error:', error);
      if (error.message === 'Insufficient credits') {
        // Handled by deductCredits
      } else if (error.message === 'Invalid JWT') {
        // Handled by deductCredits
      } else {
        toast.error('Failed to revive posts. Please try again.', {
          duration: 4000,
          position: 'top-center',
        });
      }
    }
  };

  const resetFilters = () => {
    setSelectedCategory('');
    setShowFilters(false);
    setAdTypeFilter('');
    setPriceRangeFilter('');
    setLocationSearch('');
    setSearchQuery('');
    window.history.replaceState(null, '', '/dashboard');
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

  if (loading && activeTab !== 'influencers') {
    return (
      <div className="min-h-screen bg-gray-50 px-2 sm:px-4 lg:px-6 py-3 sm:py-4 max-w-full overflow-x-hidden">
        {/* Loading Credit Bar */}
        <div className="mb-4 sm:mb-6 bg-white p-4 sm:p-5 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Skeleton circle width={32} height={32} className="sm:w-9 sm:h-9" />
            <div className="flex flex-col">
              <Skeleton width={60} height={24} className="sm:h-8 mb-1" />
              <Skeleton width={100} height={12} className="sm:h-4" />
            </div>
          </div>
          <Skeleton width={120} height={40} className="sm:w-32 sm:h-12 rounded-xl" />
        </div>

        <ProfileAlert companyName={profile?.company_name || undefined} onUpdateProfile={onUpdateProfile} />

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
          <Skeleton width={200} height={28} className="sm:h-8 mb-2 sm:mb-0" />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:space-x-2">
            <Skeleton width={80} height={36} className="sm:h-10 rounded-lg" />
            <Skeleton width={200} height={36} className="sm:h-10 rounded-lg" />
          </div>
        </div>

        <div className="mb-4 sm:mb-6 border-b border-gray-200">
          <div className="flex flex-row gap-2 sm:gap-6 overflow-x-auto">
            {Array(3).fill(0).map((_, index) => (
              <Skeleton key={index} width={120} height={32} className="sm:w-40 rounded-lg mb-2" />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <Skeleton height={200} className="sm:h-80" />
          <div className="p-4 sm:p-6">
            <Skeleton width="90%" height={28} className="sm:h-8 mb-3" />
            <Skeleton width={150} height={16} className="sm:h-5 mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
              <Skeleton width="100%" height={16} className="sm:h-5" />
              <Skeleton width="100%" height={16} className="sm:h-5" />
            </div>
            <Skeleton count={3} height={16} className="sm:h-5 mb-2" />
            <div className="flex justify-center gap-4 mt-6 sm:mt-8">
              <Skeleton circle width={56} height={56} className="sm:w-16 sm:h-16" />
              <Skeleton circle width={56} height={56} className="sm:w-16 sm:h-16" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50 px-2 sm:px-4 lg:px-6 py-3 sm:py-4 w-full max-w-[100vw] overflow-x-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateY(${Math.min(pullDistance / 3, 50)}px)`,
        transition: pullDistance === 0 ? 'transform 0.3s ease-out' : 'none',
      }}
    >
      {pullDistance > 50 && (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4">
          <div className="bg-white rounded-full shadow-lg px-4 py-2 flex items-center space-x-2">
            <div
              className={`w-4 h-4 border-2 border-blue-600 rounded-full ${
                pullDistance > 100 || isRefreshing ? 'animate-spin border-t-transparent' : ''
              }`}
            ></div>
            <span className="text-sm font-medium text-gray-700">
              {isRefreshing ? 'Refreshing...' : pullDistance > 100 ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          </div>
        </div>
      )}

      <div className="fixed bottom-6 right-4 z-40 sm:hidden">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="w-14 h-14 bg-gradient-to-r from-[#2B4B9B] to-[#3B5BB9] text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center disabled:opacity-50 border-2 border-white"
        >
          <svg
            className={`w-6 h-6 ${isRefreshing ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      <CreditBar
        credits={credits}
        shakeCredits={shakeCredits}
        onAddCredits={() => {
          window.location.href = '/purchase';
        }}
      />

      <ProfileAlert companyName={profile?.company_name || undefined} onUpdateProfile={onUpdateProfile} />

      <div className="sticky top-0 z-30 bg-gray-50/95 backdrop-blur-sm border-b border-gray-200 -mx-2 px-2 py-2 mb-4 sm:hidden w-[calc(100%+16px)] overflow-hidden">
        <div className="flex items-center justify-center w-full">
          <div className="flex items-center space-x-1.5 min-w-0">
            <h1 className="text-base font-bold text-gray-800 truncate">
              {activeTab === 'discover' ? '🎯 Discover Events' : activeTab === 'influencers' ? '✨ Discover Influencers' : '🤝 Matches'}
            </h1>
            {activeTab === 'matches' && pendingMatches.length > 0 && (
              <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full flex-shrink-0">
                {pendingMatches.length} pending
              </span>
            )}
          </div>
        </div>
      </div>

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
        activeTab={activeTab}
      />
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

      <AnimatePresence mode="wait">
        {activeTab === 'discover' && (
          <motion.div
            className="pb-20 sm:pb-8"
            key="discover-tab"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {opportunities.length === 0 ? (
              <NoResultsCard
                type="events"
                resetFilters={resetFilters}
                resetDislikedEvents={handleResetDislikedOpportunities}
              />
            ) : (
              <div className="min-h-screen">
                <AnimatePresence>
                  {opportunities
                    .filter((opportunity) => opportunity.id !== pendingLikeId)
                    .slice(0, 1)
                    .map((opportunity) => (
                      <OpportunityCard
                        key={opportunity.id}
                        opportunity={{
                          ...opportunity,
                          location: opportunity.location || '',
                          start_date: opportunity.start_date || undefined,
                          end_date: opportunity.end_date || undefined,
                          description: opportunity.description || '',
                          media_urls: opportunity.media_urls || undefined,
                          sponsorship_brochure_url: opportunity.sponsorship_brochure_url || undefined,
                          category_id: opportunity.category_id || undefined,
                          price_range: opportunity.price_range || undefined,
                        }}
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
              </div>
            )}
          </motion.div>
        )}
        {activeTab === 'influencers' && (
          <motion.div
            className="pb-20 sm:pb-8"
            key="influencers-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {loading ? (
              <div className="min-h-[60vh] flex items-center justify-center bg-white rounded-2xl shadow-lg mx-2 sm:mx-0">
                <div className="text-center p-6 sm:p-8">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                  <p className="text-gray-600 text-sm sm:text-base font-medium">Discovering amazing influencer posts...</p>
                </div>
              </div>
            ) : posts.length === 0 ? (
              <NoResultsCard
                type="influencer posts"
                resetFilters={resetFilters}
                resetDislikedPosts={handleResetDislikedPosts}
              />
            ) : (
              <div className="min-h-[calc(100vh-150px)] sm:min-h-[calc(100vh-100px)]">
                <AnimatePresence>
                  {posts
                    .filter((post) => post.id !== pendingLikeId)
                    .slice(0, 1)
                    .map((post) => (
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
                        deductCredits={deductCredits}
                        showFullDetails={showFullDetails}
                        setShowFullDetails={setShowFullDetails}
                      />
                    ))}
                </AnimatePresence>
                {posts.filter((post) => post.id !== pendingLikeId).length === 0 && (
                  <div className="w-full min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-purple-50 to-white rounded-2xl border border-purple-100 mx-2 sm:mx-0">
                    <div className="text-center p-6 sm:p-8 max-w-md">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center shadow-lg">
                        <Search className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">All caught up! ✨</h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                        You've explored all available influencer posts. Check back later for fresh content!
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                          onClick={resetFilters}
                          className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#2B4B9B] text-white rounded-xl hover:bg-[#1a2f61] text-sm sm:text-base font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          Reset Filters
                        </button>
                        <button
                          onClick={handleResetDislikedPosts}
                          className="px-4 sm:px-6 py-2.5 sm:py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 text-sm sm:text-base font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          Revive Posts (300 credits)
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
        {activeTab === 'matches' && (
          <motion.div
            className="pb-20 sm:pb-8"
            key="matches-tab"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <MatchesSection
              matches={matches}
              pendingMatches={pendingMatches}
              acceptedMatches={acceptedMatches}
              rejectedMatches={rejectedMatches}
              setActiveTab={setActiveTab}
              generateGoogleCalendarLink={generateGoogleCalendarLink}
              deductCredits={deductCredits}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}