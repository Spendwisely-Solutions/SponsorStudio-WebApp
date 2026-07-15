import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';
import { formatDate } from '../../../utils/formatDate';
import { 
  AlertTriangle, 
  Calendar, 
  MapPin, 
  DollarSign,
  ChevronDown,
  ChevronUp,
  FileText,
  Link as LinkIcon,
  Clock,
  Building2,
  Globe,
  Mail,
  Tag,
  CheckSquare,
  CalendarRange,
  Search,
  Users,
  Filter,
  RefreshCw,
  Eye,
  ExternalLink,
  Star,
  Activity
} from 'lucide-react';
import type { Database } from '../../../lib/database.types';

type Match = {
  id: string;
  opportunity_id: string;
  brand_id: string;
  event_organizer_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  meeting_scheduled_at?: string;
  meeting_link?: string;
  notes?: string;
  opportunity: (Database['public']['Tables']['opportunities']['Row'] & {
    categories: Database['public']['Tables']['categories']['Row'] | null;
    creator_profile: Database['public']['Tables']['profiles']['Row'] & { email?: string } | null;
  }) | null;
  brand_profile: Database['public']['Tables']['profiles']['Row'] & { email?: string } | null;
  event_organizer_profile: Database['public']['Tables']['profiles']['Row'] | null;
};

interface MatchedOpportunitiesProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  stats: {
    totalMatches: number;
    pendingMatches: number;
    acceptedMatches: number;
    rejectedMatches: number;
  };
  setStats: (stats: Partial<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    totalMatches: number;
    pendingMatches: number;
    acceptedMatches: number;
    rejectedMatches: number;
  }>) => void;
}

export default function MatchedOpportunities({ searchTerm, setSearchTerm, setStats }: MatchedOpportunitiesProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
  const [newMeetingLink, setNewMeetingLink] = useState<string>('');
  const [meetingScheduledAt, setMeetingScheduledAt] = useState<string>('');
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [matchFilter, setMatchFilter] = useState<'pending' | 'accepted' | 'rejected' | 'all'>('all');

  useEffect(() => {
    fetchMatches();
  }, [matchFilter]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      let matchesQuery = supabase
        .from('matches')
        .select('*');
      
      const { data: matchesData, error: matchesError } = await matchesQuery;
      
      if (matchesError) throw matchesError;
      
      if (!matchesData || matchesData.length === 0) {
        setMatches([]);
        return;
      }

      const normalizedMatches = matchesData.map(match => ({
        ...match,
        status: match.status?.trim().toLowerCase()
      }));

      const filteredMatches = matchFilter === 'all'
        ? normalizedMatches
        : normalizedMatches.filter(match => match.status === matchFilter);

      const opportunityIds = [...new Set(filteredMatches.map(match => match.opportunity_id))];
      const { data: opportunitiesData, error: opportunitiesError } = await supabase
        .from('opportunities')
        .select(`
          *,
          categories:category_id (*)
        `)
        .in('id', opportunityIds);
      
      if (opportunitiesError) throw opportunitiesError;

      const creatorIds = [...new Set(opportunitiesData?.map(opp => opp.creator_id) || [])];
      
      const brandIds = [...new Set(filteredMatches.map(match => match.brand_id))];
      const allProfileIds = [...new Set([...brandIds, ...creatorIds])];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', allProfileIds);
      
      if (profilesError) throw profilesError;

      const profilesWithEmails = await Promise.all(
        profilesData.map(async (profile: any) => {
          try {
            const response = await fetch(
              `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/users/${profile.id}/email`,
              {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${await supabase.auth.getSession().then(({ data }) => data.session?.access_token)}`,
                },
              }
            );
            const resData = await response.json();
            if (!resData.success || !resData.data?.email) {
              throw new Error(resData.error?.message || 'Failed to fetch email');
            }
            return {
              ...profile,
              email: resData.data.email
            };
          } catch (error) {
            console.error(`Error fetching email for profile ${profile.id}:`, error);
            return { ...profile, email: 'Not set' };
          }
        })
      );

      const opportunitiesWithCreators = opportunitiesData?.map(opp => {
        const creatorProfile = profilesWithEmails.find(profile => profile.id === opp.creator_id) || null;
        return {
          ...opp,
          creator_profile: creatorProfile
        };
      }) || [];

      const matchesWithRelations = filteredMatches.map(match => {
        const opportunity = opportunitiesWithCreators.find(opp => opp.id === match.opportunity_id) || null;
        const brandProfile = profilesWithEmails.find(profile => profile.id === match.brand_id) || null;

        return {
          ...match,
          opportunity,
          brand_profile: brandProfile,
          event_organizer_profile: null
        };
      });

      
      setMatches(matchesWithRelations as Match[] || []);
      
      const { data: matchStatsData, error: matchStatsError } = await supabase
        .from('matches')
        .select('status');
      
      if (matchStatsError) throw matchStatsError;
      
      const normalizedMatchStats = matchStatsData?.map(item => ({
        ...item,
        status: item.status?.trim().toLowerCase()
      })) || [];

      
      if (normalizedMatchStats) {
        setStats({
          totalMatches: normalizedMatchStats.length,
          pendingMatches: normalizedMatchStats.filter(m => m.status === 'pending').length,
          acceptedMatches: normalizedMatchStats.filter(m => m.status === 'accepted').length,
          rejectedMatches: normalizedMatchStats.filter(m => m.status === 'rejected').length
        });
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast.error('Failed to fetch matches');
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (priceRange: any) => {
    if (!priceRange || typeof priceRange !== 'object') return 'Price not set';
    
    const min = typeof priceRange.min === 'number' ? priceRange.min : 0;
    const max = typeof priceRange.max === 'number' ? priceRange.max : 0;
    
    if (min === 0 && max === 0) return 'Price not set';
    if (min === max) return `₹${min.toLocaleString()}`;
    return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
  };

  const filteredMatches = matches.filter(match => {
    const opportunityTitle = match.opportunity?.title?.toLowerCase() || '';
    const brandCompanyName = match.brand_profile?.company_name?.toLowerCase() || '';
    const creatorCompanyName = match.opportunity?.creator_profile?.company_name?.toLowerCase() || '';
    
    const searchLower = searchTerm.toLowerCase();
    return (
      opportunityTitle.includes(searchLower) ||
      brandCompanyName.includes(searchLower) ||
      creatorCompanyName.includes(searchLower)
    );
  });

  const handleSaveMeetingLink = async (matchId: string) => {
    if (!newMeetingLink || !meetingScheduledAt) {
      toast.error('Please enter both a meeting link and scheduled date/time');
      return;
    }

    try {
      setProcessingAction(matchId);


      // Parse the input string (e.g., "2025-04-30T00:00") as local time
      const [datePart, timePart] = meetingScheduledAt.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hours, minutes] = timePart.split(':').map(Number);

      // Create a Date object in local timezone
      // Month is 0-based in JavaScript Date, so subtract 1 from month
      const localDate = new Date(year, month - 1, day, hours, minutes);


      // Use the Parsed local time (ISO) as the UTC value to store
      const utcDateString = localDate.toISOString();

      const { error } = await supabase
        .from('matches')
        .update({ meeting_link: newMeetingLink, meeting_scheduled_at: utcDateString })
        .eq('id', matchId);

      if (error) throw error;

      setMatches(prevMatches =>
        prevMatches.map(match =>
          match.id === matchId ? { ...match, meeting_link: newMeetingLink, meeting_scheduled_at: utcDateString } : match
        )
      );
      setNewMeetingLink('');
      setMeetingScheduledAt('');
      setExpandedMatch(null);
      toast.success('Meeting details saved successfully');
    } catch (error) {
      console.error('Error saving meeting details:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save meeting details');
    } finally {
      setProcessingAction(null);
    }
  };

  const generateGoogleCalendarLink = (match: Match) => {
    const event = {
      title: `Meeting for ${match.opportunity?.title || 'Opportunity'}`,
      description: `Meeting with brand and creator.\nJoin Meeting: ${match.meeting_link || ''}`,
      start: match.meeting_scheduled_at || new Date().toISOString(),
      end: match.meeting_scheduled_at ? new Date(new Date(match.meeting_scheduled_at).getTime() + 60 * 60 * 1000).toISOString() : new Date().toISOString(),
      location: match.meeting_link || '',
    };

    // Format dates for Google Calendar (YYYYMMDDTHHMMSSZ)
    const formatDate = (date: string) => {
      return new Date(date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const startDate = formatDate(event.start);
    const endDate = formatDate(event.end);

    // Construct the Google Calendar URL
    const googleCalendarUrl = new URL('https://calendar.google.com/calendar/render');
    googleCalendarUrl.searchParams.append('action', 'TEMPLATE');
    googleCalendarUrl.searchParams.append('text', event.title);
    googleCalendarUrl.searchParams.append('dates', `${startDate}/${endDate}`);
    googleCalendarUrl.searchParams.append('details', event.description);
    googleCalendarUrl.searchParams.append('location', event.location);

    return googleCalendarUrl.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Matched Opportunities
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Manage and track opportunity matches between brands and creators
              {filteredMatches.length !== matches.length && (
                <span className="ml-2 text-blue-600">
                  (Showing {filteredMatches.length} of {matches.length})
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchMatches}
              className="p-2.5 sm:p-3 text-gray-600 hover:text-blue-600 border border-gray-200 rounded-lg sm:rounded-xl hover:bg-blue-50 transition-all duration-200 hover:shadow-md flex items-center justify-center"
              title="Refresh data"
            >
              <RefreshCw size={18} />
            </button>
            <div className="hidden sm:block">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white/70 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-lg border border-gray-200/50 p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by opportunity title, brand, or creator..."
                  className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200 text-sm sm:text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <select
                  className="pl-9 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm sm:text-base min-w-[140px]"
                  value={matchFilter}
                  onChange={(e) => { 
                    setMatchFilter(e.target.value as typeof matchFilter); 
                  }}
                >
                  <option value="all">All Matches</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white/70 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
        {loading ? (
          <div className="p-6 sm:p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-spin mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Loading Matches</h3>
            <p className="text-sm sm:text-base text-gray-600">Fetching match data...</p>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="p-6 sm:p-12 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Matches Found</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              {searchTerm ? `No matches found for "${searchTerm}"` : 'No matches found with current filters'}
            </p>
            <button
              onClick={fetchMatches}
              className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg text-sm sm:text-base"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200/50">
            {filteredMatches.map((match) => (
              <div key={match.id} className="p-4 sm:p-6 hover:bg-gray-50/50 transition-all duration-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {match.opportunity?.title || 'Opportunity not found'}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${
                          match.status?.trim().toLowerCase() === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            : match.status?.trim().toLowerCase() === 'accepted'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            match.status?.trim().toLowerCase() === 'pending'
                              ? 'bg-yellow-500'
                              : match.status?.trim().toLowerCase() === 'accepted'
                              ? 'bg-green-500'
                              : 'bg-red-500'
                          }`} />
                          {match.status?.charAt(0).toUpperCase() + match.status?.slice(1)}
                        </span>
                        {match.meeting_link && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full border border-blue-200">
                            <Calendar className="w-3 h-3 mr-1" />
                            Meeting Set
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                      {/* Brand Section */}
                      <div className="bg-white/50 rounded-xl p-4 border border-gray-100/50">
                        <div className="flex items-center mb-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                            <Building2 className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Brand</h4>
                            <p className="text-sm text-gray-500">Company Details</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Building2 size={14} className="text-gray-400 mr-2 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {match.brand_profile?.company_name || 'Not set'}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Tag size={14} className="text-gray-400 mr-2 flex-shrink-0" />
                            <span className="text-sm text-gray-600 truncate">
                              {match.brand_profile?.industry || 'Industry not set'}
                            </span>
                          </div>
                          {match.brand_profile?.contact_person_name && (
                            <div className="flex items-center">
                              <Users size={14} className="text-gray-400 mr-2 flex-shrink-0" />
                              <span className="text-sm text-gray-600 truncate">
                                {match.brand_profile.contact_person_name}
                              </span>
                            </div>
                          )}
                          {match.brand_profile?.email && (
                            <div className="flex items-center">
                              <Mail size={14} className="text-gray-400 mr-2 flex-shrink-0" />
                              <span className="text-sm text-gray-600 truncate">
                                {match.brand_profile.email}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Creator Section */}
                      <div className="bg-white/50 rounded-xl p-4 border border-gray-100/50">
                        <div className="flex items-center mb-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                            <Star className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Creator</h4>
                            <p className="text-sm text-gray-500">Content Creator</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Building2 size={14} className="text-gray-400 mr-2 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {match.opportunity?.creator_profile?.company_name || 'Not set'}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Tag size={14} className="text-gray-400 mr-2 flex-shrink-0" />
                            <span className="text-sm text-gray-600 truncate">
                              {match.opportunity?.creator_profile?.industry || 'Industry not set'}
                            </span>
                          </div>
                          {match.opportunity?.creator_profile?.contact_person_name && (
                            <div className="flex items-center">
                              <Users size={14} className="text-gray-400 mr-2 flex-shrink-0" />
                              <span className="text-sm text-gray-600 truncate">
                                {match.opportunity?.creator_profile?.contact_person_name}
                              </span>
                            </div>
                          )}
                          {match.opportunity?.creator_profile?.email && (
                            <div className="flex items-center">
                              <Mail size={14} className="text-gray-400 mr-2 flex-shrink-0" />
                              <span className="text-sm text-gray-600 truncate">
                                {match.opportunity?.creator_profile?.email}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Info Bar */}
                    <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock size={14} className="mr-1.5 flex-shrink-0" />
                        Matched {formatDate(match.created_at)}
                      </div>
                      {match.opportunity?.location && (
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin size={14} className="mr-1.5 flex-shrink-0" />
                          {match.opportunity.location}
                        </div>
                      )}
                      {match.opportunity && (
                        <div className="flex items-center text-sm text-gray-500">
                          <DollarSign size={14} className="mr-1.5 flex-shrink-0" />
                          {formatPrice(match.opportunity.price_range)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => setExpandedMatch(match.id === expandedMatch ? null : match.id)}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
                      title={match.id === expandedMatch ? "Collapse details" : "Expand details"}
                    >
                      {match.id === expandedMatch ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </button>
                  </div>
                </div>
                {match.id === expandedMatch && (
                  <div className="mt-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200/50">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Opportunity Details */}
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-gray-200/50">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-3">
                            <Eye className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Opportunity Details</h4>
                            <p className="text-sm text-gray-500">Complete opportunity information</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="bg-gray-50/50 rounded-lg p-3">
                            <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                              <FileText className="w-4 h-4 mr-2" />
                              Description
                            </h5>
                            <p className="text-gray-600 text-sm leading-relaxed">
                              {match.opportunity?.description || 'No description available'}
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex items-center p-3 bg-blue-50/50 rounded-lg">
                              <MapPin size={16} className="mr-3 text-blue-600 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Location</p>
                                <p className="text-sm text-blue-900">{match.opportunity?.location || 'Not set'}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center p-3 bg-green-50/50 rounded-lg">
                              <DollarSign size={16} className="mr-3 text-green-600 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Budget</p>
                                <p className="text-sm text-green-900">
                                  {match.opportunity ? formatPrice(match.opportunity.price_range) : 'Not set'}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center p-3 bg-purple-50/50 rounded-lg">
                            <CalendarRange size={16} className="mr-3 text-purple-600 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-purple-700 uppercase tracking-wide">Duration</p>
                              <p className="text-sm text-purple-900">
                                {match.opportunity?.start_date && match.opportunity?.end_date 
                                  ? `${formatDate(match.opportunity.start_date)} - ${formatDate(match.opportunity.end_date)}`
                                  : 'Dates not set'
                                }
                              </p>
                            </div>
                          </div>

                          {match.opportunity?.categories?.name && (
                            <div className="flex items-center p-3 bg-orange-50/50 rounded-lg">
                              <Tag size={16} className="mr-3 text-orange-600 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-medium text-orange-700 uppercase tracking-wide">Category</p>
                                <p className="text-sm text-orange-900">{match.opportunity.categories.name}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Match Details */}
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-gray-200/50">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-3">
                            <Activity className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Match Information</h4>
                            <p className="text-sm text-gray-500">Connection and meeting details</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex items-center p-3 bg-gray-50/50 rounded-lg">
                              <Clock size={16} className="mr-3 text-gray-600 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">Matched Date</p>
                                <p className="text-sm text-gray-900">{formatDate(match.created_at)}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center p-3 bg-gray-50/50 rounded-lg">
                              <CheckSquare size={16} className="mr-3 text-gray-600 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">Status</p>
                                <p className="text-sm text-gray-900">
                                  {match.status?.charAt(0).toUpperCase() + match.status?.slice(1)}
                                </p>
                              </div>
                            </div>
                          </div>

                          {match.meeting_scheduled_at && (
                            <div className="flex items-center p-3 bg-indigo-50/50 rounded-lg">
                              <Calendar size={16} className="mr-3 text-indigo-600 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-medium text-indigo-700 uppercase tracking-wide">Meeting Scheduled</p>
                                <p className="text-sm text-indigo-900">
                                  {new Date(match.meeting_scheduled_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {match.meeting_link && (
                            <div className="p-3 bg-blue-50/50 rounded-lg">
                              <div className="flex items-center mb-2">
                                <LinkIcon size={16} className="mr-2 text-blue-600" />
                                <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Meeting Link</p>
                              </div>
                              <a 
                                href={match.meeting_link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                Join Meeting
                                <ExternalLink size={14} className="ml-1" />
                              </a>
                            </div>
                          )}

                          {/* Contact Links */}
                          <div className="space-y-2">
                            {match.brand_profile?.website && (
                              <div className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-lg">
                                <div className="flex items-center">
                                  <Globe size={16} className="mr-3 text-emerald-600" />
                                  <span className="text-sm font-medium text-emerald-900">Brand Website</span>
                                </div>
                                <a 
                                  href={match.brand_profile.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-sm text-emerald-600 hover:text-emerald-800"
                                >
                                  Visit
                                  <ExternalLink size={14} className="ml-1" />
                                </a>
                              </div>
                            )}
                            
                            {match.opportunity?.creator_profile?.website && (
                              <div className="flex items-center justify-between p-3 bg-purple-50/50 rounded-lg">
                                <div className="flex items-center">
                                  <Globe size={16} className="mr-3 text-purple-600" />
                                  <span className="text-sm font-medium text-purple-900">Creator Website</span>
                                </div>
                                <a 
                                  href={match.opportunity?.creator_profile?.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-sm text-purple-600 hover:text-purple-800"
                                >
                                  Visit
                                  <ExternalLink size={14} className="ml-1" />
                                </a>
                              </div>
                            )}
                          </div>

                          {match.notes && (
                            <div className="p-3 bg-amber-50/50 rounded-lg">
                              <div className="flex items-start">
                                <FileText size={16} className="mr-3 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-1">Notes</p>
                                  <p className="text-sm text-amber-900">{match.notes}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {match.status?.trim().toLowerCase() === 'accepted' && (
                      <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-blue-200/50">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-3">
                            <Calendar className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Meeting Management</h4>
                            <p className="text-sm text-gray-500">Schedule and manage meeting details</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                          <div className="lg:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Link</label>
                            <input
                              type="text"
                              value={newMeetingLink}
                              onChange={(e) => setNewMeetingLink(e.target.value)}
                              placeholder="https://meet.google.com/xxx-yyyy-zzz"
                              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 text-sm"
                            />
                          </div>
                          <div className="lg:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date & Time</label>
                            <input
                              type="datetime-local"
                              value={meetingScheduledAt}
                              onChange={(e) => setMeetingScheduledAt(e.target.value)}
                              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 text-sm"
                            />
                          </div>
                          <div className="lg:col-span-1 flex flex-col justify-end gap-2">
                            <button
                              onClick={() => handleSaveMeetingLink(match.id)}
                              disabled={processingAction === match.id || !newMeetingLink || !meetingScheduledAt}
                              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm"
                            >
                              {processingAction === match.id ? (
                                <div className="flex items-center justify-center">
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                  Saving...
                                </div>
                              ) : (
                                'Save Meeting'
                              )}
                            </button>
                            {(match.meeting_link && match.meeting_scheduled_at) && (
                              <a
                                href={generateGoogleCalendarLink(match)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium text-sm"
                              >
                                <Calendar className="w-4 h-4 mr-2" />
                                Add to Calendar
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}