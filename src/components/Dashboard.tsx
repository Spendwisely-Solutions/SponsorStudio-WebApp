import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowRight, Building2, BarChart3, FileCheck, MessageSquare, Menu, ChevronRight, X, Home, Calendar, FileText, User, LogOut, BarChart2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { sendContactEmail } from '../lib/email';
import { Link, useNavigate } from 'react-router-dom';
import AuthForm from './AuthComponents/AuthForm';
import ProfileCompletionDialog from './ProfileCompletionDialog';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../lib/database.types';
import Marquee from 'react-fast-marquee';
import AdminDashboard from '../components/Admin/Dashboard/AdminDashboard';
import BrandDashboard from './dashboard/BrandDashboard';
import CreatorDashboard from './dashboard/CreatorDashboard';
import InfluencerDashboard from './dashboard/InfluencerDashboard';
import ProfileSettings from './dashboard/ProfileSettings/ProfileSettings';
import ScheduledMeetings from './dashboard/Meetings/ScheduledMeetings';
import ReportsList from './dashboard/Reports/ReportsList';
import AnalyticsDashboard from './dashboard/AnalyticsDashboard';
import Messages from './dashboard/Messages/Messages';
import { signOut } from '../lib/auth';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import toast from 'react-hot-toast';

type ClientLogo = Database['public']['Tables']['client_logos']['Row'];
type SuccessStory = Database['public']['Tables']['success_stories']['Row'];
type Match = Database['public']['Tables']['matches']['Row'] & {
  opportunities?: Pick<
    Database['public']['Tables']['opportunities']['Row'],
    'id' | 'title' | 'creator_id' | 'profiles'
  >;
  posts?: Pick<Database['public']['Tables']['posts']['Row'], 'id' | 'title'>;
  profiles?: Pick<
    Database['public']['Tables']['profiles']['Row'],
    'company_name' | 'industry' | 'contact_person_name' | 'contact_person_phone' | 'email'
  >;
};

export default function Dashboard() {
  const location = useLocation();
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'matches' | 'profile' | 'messages' | 'meetings' | 'reports' | 'analytics'>(
    () => (location.state as any)?.activeTab || 'dashboard'
  );
  const [userProfile, setUserProfile] = useState<Database['public']['Tables']['profiles']['Row'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [opportunities, setOpportunities] = useState<Database['public']['Tables']['opportunities']['Row'][]>([]);
  const [posts, setPosts] = useState<Database['public']['Tables']['posts']['Row'][]>([]);
  const [meetings, setMeetings] = useState<Match[]>([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Database['public']['Tables']['opportunities']['Row'] | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    if ((location.state as any)?.activeTab) {
      setActiveTab((location.state as any).activeTab);
    }
  }, [location.state]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setUserProfile(profile);
      fetchUserData();
    }
  }, [profile]);

  const fetchUserData = async () => {
    if (!user || !profile) return;

    try {
      if (profile.user_type !== 'admin') {
        if (profile.user_type === 'creator' || profile.user_type === 'event_organizer') {
          const { data: opportunitiesData, error: opportunitiesError } = await supabase
            .from('opportunities')
            .select('*')
            .eq('creator_id', user.id);
          
          if (opportunitiesError) throw opportunitiesError;
          setOpportunities(opportunitiesData || []);
        } else if (profile.user_type === 'influencer') {
          const { data: postsData, error: postsError } = await supabase
            .from('posts')
            .select('*')
            .eq('influencer_id', user.id);
          
          if (postsError) throw postsError;
          setPosts(postsData || []);
        }
        
        let matchesQuery;
        if (profile.user_type === 'brand' || profile.user_type === 'agency') {
          matchesQuery = supabase
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
              opportunities:opportunity_id (
                id,
                title,
                creator_id,
                profiles:creator_id (
                  company_name,
                  industry,
                  contact_person_name,
                  contact_person_phone,
                  email
                )
              )
            `)
            .eq('brand_id', profile.id)
            .in('status', ['accepted', 'completed']);
        } else if (profile.user_type === 'creator' || profile.user_type === 'event_organizer') {
          const { data: creatorOpps, error: oppsError } = await supabase
            .from('opportunities')
            .select('id')
            .eq('creator_id', user.id);
          
          if (oppsError) throw oppsError;
          
          if (creatorOpps && creatorOpps.length > 0) {
            const oppIds = creatorOpps.map(opp => opp.id);
            matchesQuery = supabase
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
                  industry,
                  contact_person_name,
                  contact_person_phone,
                  email
                ),
                opportunities:opportunity_id (
                  id,
                  title
                )
              `)
              .in('opportunity_id', oppIds)
              .in('status', ['accepted', 'completed']);
          }
        } else if (profile.user_type === 'influencer') {
          const { data: influencerPosts, error: postsError } = await supabase
            .from('posts')
            .select('id')
            .eq('influencer_id', user.id);
          
          if (postsError) throw postsError;
          
          if (influencerPosts && influencerPosts.length > 0) {
            const postIds = influencerPosts.map(post => post.id);
            matchesQuery = supabase
              .from('matches')
              .select(`
                id,
                post_id,
                status,
                created_at,
                updated_at,
                meeting_scheduled_at,
                meeting_link,
                notes,
                profiles:brand_id (
                  company_name,
                  industry,
                  contact_person_name,
                  contact_person_phone,
                  email
                ),
                posts:post_id (
                  id,
                  title
                )
              `)
              .in('post_id', postIds)
              .in('status', ['accepted', 'completed']);
          }
        }
        
        if (matchesQuery) {
          const { data: matchesData, error: matchesError } = await matchesQuery;
          if (matchesError) throw matchesError;

          // Log raw response to verify fields

          // Sanitize match data to ensure only required profile fields are included
          const sanitizedData = matchesData.map(match => ({
            ...match,
            profiles: match.profiles
              ? {
                  company_name: match.profiles.company_name,
                  industry: match.profiles.industry,
                  contact_person_name: match.profiles.contact_person_name,
                  contact_person_phone: match.profiles.contact_person_phone,
                  email: match.profiles.email,
                }
              : null,
            opportunities: match.opportunities
              ? {
                  id: match.opportunities.id,
                  title: match.opportunities.title,
                  creator_id: match.opportunities.creator_id,
                  profiles: match.opportunities.profiles
                    ? {
                        company_name: match.opportunities.profiles.company_name,
                        industry: match.opportunities.profiles.industry,
                        contact_person_name: match.opportunities.profiles.contact_person_name,
                        contact_person_phone: match.opportunities.profiles.contact_person_phone,
                        email: match.opportunities.profiles.email,
                      }
                    : null,
                }
              : null,
            posts: match.posts
              ? {
                  id: match.posts.id,
                  title: match.posts.title,
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
                'contact_person_name',
                'contact_person_phone',
                'email',
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
            }
            if (match.opportunities?.profiles) {
              const oppProfileKeys = Object.keys(match.opportunities.profiles);
              const expectedKeys = [
                'company_name',
                'industry',
                'contact_person_name',
                'contact_person_phone',
                'email',
              ];
              const unexpectedKeys = oppProfileKeys.filter(key => !expectedKeys.includes(key));
              if (unexpectedKeys.length > 0) {
                console.error(
                  `Data leak detected! Unexpected opportunity profile fields for match ${match.id}:`,
                  unexpectedKeys.join(', ')
                );
                toast.error('Unexpected profile data detected. Please contact support.', {
                  id: 'data_leak_warning',
                });
              }
            }
          });

          setMeetings(sanitizedData as Match[]);
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setIsLoading(false);
      toast.error('Failed to load dashboard data.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out.');
    }
  };

  const handleUpdateProfile = () => {
    setActiveTab('profile');
    setMobileSidebarOpen(false);
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <div className="w-64 bg-white shadow-md hidden md:block fixed h-full p-6">
          <Skeleton height={48} width={120} className="mb-6" />
          <div className="flex items-center space-x-3 mb-8">
            <Skeleton circle width={40} height={40} />
            <div>
              <Skeleton width={100} height={16} />
              <Skeleton width={80} height={12} className="mt-2" />
            </div>
          </div>
          <nav className="px-4">
            <ul className="space-y-2">
              {Array(5).fill(0).map((_, index) => (
                <li key={index}>
                  <Skeleton height={40} className="rounded-lg" />
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="flex-1 md:ml-64 p-6">
          <div className="flex justify-between items-center mb-6">
            <Skeleton width={200} height={24} />
            <Skeleton width={120} height={36} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {Array(4).fill(0).map((_, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <Skeleton height={20} width="60%" />
                <Skeleton height={36} width="40%" className="mt-4" />
              </div>
            ))}
          </div>
          <div className="space-y-6">
            {Array(3).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <Skeleton height={24} width="50%" className="mb-4" />
                <Skeleton count={3} height={16} className="mb-2" />
              </div>
            ))}
          </div>
        </div>
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-t z-50">
          <div className="flex justify-around p-2">
            {Array(4).fill(0).map((_, index) => (
              <Skeleton key={index} circle width={32} height={32} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center p-6">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile Setup Required</h2>
          <p className="text-gray-600 mb-6">
            It looks like your profile isn’t set up yet. Please complete your profile to access the dashboard.
          </p>
          <button
            onClick={() => setActiveTab('profile')}
            className="px-4 py-2 bg-[#2B4B9B] text-white rounded-lg hover:bg-[#1a2f61] transition-colors"
          >
            Go to Profile Settings
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = profile.user_type === 'admin';
  const isBrand = profile.user_type === 'brand' || profile.user_type === 'agency';
  const isCreator = profile.user_type === 'creator' || profile.user_type === 'event_organizer';
  const isInfluencer = profile.user_type === 'influencer';

  if (isAdmin) {
    return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <div className="w-64 bg-white shadow-md hidden md:block fixed h-full">
        <div className="p-6">
          <img 
            src="https://i.ibb.co/ZzPfwrxP/logo-final-png.png" 
            alt="Sponsor Studio" 
            className="h-14 mb-6 cursor-pointer"
            onClick={() => navigate('/')}
          />
          <div className="flex items-center space-x-3 mb-8">
            {userProfile?.profile_picture_url && !avatarError ? (
              <img
                src={userProfile.profile_picture_url}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#2B4B9B] flex items-center justify-center text-white">
                {userProfile?.company_name ? userProfile.company_name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-medium">{userProfile?.company_name || 'Your Account'}</p>
              <p className="text-sm text-gray-500">
                {userProfile?.user_type === 'event_organizer'
                  ? 'Opportunity Provider'
                  : userProfile?.user_type.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
        <nav className="px-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
                  activeTab === 'dashboard' ? 'bg-blue-50 text-[#2B4B9B]' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Home className="w-5 h-5" />
                <span>Dashboard</span>
              </button>
            </li>
            <li className='hidden'>
              <button
                onClick={() => setActiveTab('messages')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
                  activeTab === 'messages' ? 'bg-blue-50 text-[#2B4B9B]' : 'text-gray-700 hover:bg-gray-100'
                }`}
                style={{display:'none'}}
              >
                <MessageSquare className="w-5 h-5" />
                <span>Messages</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('meetings')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
                  activeTab === 'meetings' ? 'bg-blue-50 text-[#2B4B9B]' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span>Meetings</span>
              </button>
            </li>
            {isBrand && (
              <li>
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
                    activeTab === 'reports' ? 'bg-blue-50 text-[#2B4B9B]' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span>Reports</span>
                </button>
              </li>
            )}
            {(isCreator || isInfluencer) && (
              <li>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
                    activeTab === 'analytics' ? 'bg-blue-50 text-[#2B4B9B]' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <BarChart2 className="w-5 h-5" />
                  <span>Analytics</span>
                </button>
              </li>
            )}
            {(isCreator || isBrand) && (
              <li className='hidden'>
                <button
                  onClick={() => setActiveTab('messages')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
                    activeTab === 'messages' ? 'bg-blue-50 text-[#2B4B9B]' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <BarChart2 className="w-5 h-5" />
                  <span>Messages</span>
                </button>
              </li>
            )}
            <li>
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
                  activeTab === 'profile' ? 'bg-blue-50 text-[#2B4B9B]' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </button>
            </li>
            <li>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-md z-50 transform ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out md:hidden`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <img 
              src="https://i.ibb.co/ZzPfwrxP/logo-final-png.png" 
              alt="Sponsor Studio" 
              className="h-12 cursor-pointer"
              onClick={() => navigate('/')}
            />
            <button onClick={() => setMobileSidebarOpen(false)}>
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          <div className="flex items-center space-x-3 mb-8">
            {userProfile?.profile_picture_url && !avatarError ? (
              <img
                src={userProfile.profile_picture_url}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#2B4B9B] flex items-center justify-center text-white">
                {userProfile?.company_name ? userProfile.company_name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-medium">{userProfile?.company_name || 'Your Account'}</p>
              <p className="text-sm text-gray-500">{userProfile?.user_type.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
        <nav className="px-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => { setActiveTab('dashboard'); setMobileSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
                  activeTab === 'dashboard' ? 'bg-blue-50 text-[#2B4B9B]' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Home className="w-5 h-5" />
                <span>Dashboard</span>
              </button>
            </li>
            <li className='hidden'>
              <button
                onClick={() => { setActiveTab('messages'); setMobileSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
                  activeTab === 'messages' ? 'bg-blue-50 text-[#2B4B9B]' : 'text-gray-700 hover:bg-gray-100'
                }`}
                style={{display:'none'}}
              >
                <MessageSquare className="w-5 h-5" />
                <span>Messages</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => { setActiveTab('meetings'); setMobileSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
                  activeTab === 'meetings' ? 'bg-blue-50 text-[#2B4B9B]' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span>Meetings</span>
              </button>
            </li>
            {isBrand && (
              <li>
                <button
                  onClick={() => { setActiveTab('reports'); setMobileSidebarOpen(false); }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
                    activeTab === 'reports' ? 'bg-blue-50 text-[#2B4B9B]' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span>Reports</span>
                </button>
              </li>
            )}
            {isBrand || isCreator || isInfluencer && (
              <li className='hidden'>
                <button
                  onClick={() => { setActiveTab('messages'); setMobileSidebarOpen(false); }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
                    activeTab === 'reports' ? 'bg-blue-50 text-[#2B4B9B]' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span>Reports</span>
                </button>
              </li>
            )}
            {(isCreator || isInfluencer) && (
              <li>
                <button
                  onClick={() => { setActiveTab('analytics'); setMobileSidebarOpen(false); }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
                    activeTab === 'analytics' ? 'bg-blue-50 text-[#2B4B9B]' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <BarChart2 className="w-5 h-5" />
                  <span>Analytics</span>
                </button>
              </li>
            )}
            <li className='hidden'>
              <button
                onClick={() => { setActiveTab('messages'); setMobileSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
                  activeTab === 'profile' ? 'bg-blue-50 text-[#2B4B9B]' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <User className="w-5 h-5" />
                <span>Messages</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => { setActiveTab('profile'); setMobileSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
                  activeTab === 'profile' ? 'bg-blue-50 text-[#2B4B9B]' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => { handleSignOut(); setMobileSidebarOpen(false); }}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-t z-50">
        <div className="flex justify-around p-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`p-2 rounded-lg ${activeTab === 'dashboard' ? 'text-[#2B4B9B]' : 'text-gray-500'}`}
          >
            <Home className="w-6 h-6 mx-auto" />
          </button>
          {isBrand && (
            <button
              onClick={() => setActiveTab('reports')}
              className={`p-2 rounded-lg ${activeTab === 'reports' ? 'text-[#2B4B9B]' : 'text-gray-500'}`}
            >
              <FileText className="w-6 h-6 mx-auto" />
            </button>
          )}
          <button
            onClick={() => setActiveTab('meetings')}
            className={`p-2 rounded-lg ${activeTab === 'meetings' ? 'text-[#2B4B9B]' : 'text-gray-500'}`}
          >
            <Calendar className="w-6 h-6 mx-auto" />
          </button>
          {(isCreator || isInfluencer) && (
            <button
              onClick={() => setActiveTab('analytics')}
              className={`p-2 rounded-lg ${activeTab === 'analytics' ? 'text-[#2B4B9B]' : 'text-gray-500'}`}
            >
              <BarChart2 className="w-6 h-6 mx-auto" />
            </button>
          )}
          <button
            onClick={() => setActiveTab('profile')}
            className={`p-2 rounded-lg ${activeTab === 'profile' ? 'text-[#2B4B9B]' : 'text-gray-500'}`}
          >
            <User className="w-6 h-6 mx-auto" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 p-6">
        {/* Mobile Header with Menu Button */}
        <div className="md:hidden flex items-center justify-between mb-1">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <Menu className="w-6 h-6" />
          </button>
          <img 
            src="https://i.ibb.co/ZzPfwrxP/logo-final-png.png" 
            alt="Sponsor Studio" 
            className="h-12 cursor-pointer mb-2 scale-150"
            onClick={() => navigate('/')}
          />
          <div className="w-6"></div> {/* Placeholder for spacing */}
        </div>

        {activeTab === 'dashboard' && (
          <>
            {isBrand && <BrandDashboard onUpdateProfile={handleUpdateProfile} />}
            {isCreator && <CreatorDashboard onUpdateProfile={handleUpdateProfile} />}
            {isInfluencer && <InfluencerDashboard onUpdateProfile={handleUpdateProfile} />}
          </>
        )}
        {activeTab === 'profile' && (
          <ProfileSettings profile={userProfile} />
        )}
        {activeTab === 'messages' && (
              <Messages />
        )}
        {activeTab === 'meetings' && (
          <ScheduledMeetings meetings={meetings} isBrand={isBrand} />
        )}
        {(activeTab === 'reports' && isBrand) && (
          <ReportsList />
        )}
        {(activeTab === 'analytics' && (isCreator || isInfluencer)) && (
          <AnalyticsDashboard />
        )}
      </div>
    </div>
  );
}