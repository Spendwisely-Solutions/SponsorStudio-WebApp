import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';
import { formatDate } from '../../../utils/formatDate';
import { 
  Trash2, 
  Edit, 
  Search,
  Users,
  Building2,
  Calendar,
  Mail,
  MapPin,
  RefreshCw,
  TrendingUp,
  UserCog,
  Filter,
  ChevronUp,
  ChevronDown,
  ArrowUpDown
} from 'lucide-react';
import Modal from '../../Modal';

interface Profile {
  id: string;
  user_type: string | null;
  company_name: string | null;
  website: string | null;
  industry: string | null;
  annual_marketing_budget: number | null;
  target_audience: string | null;
  location: string | null;
  created_at: string | null;
  updated_at: string | null;
  industry_details: string | null;
  company_size: string | null;
  marketing_channels: string | null;
  previous_sponsorships: any | null;
  sponsorship_goals: string | null;
  contact_person_name: string | null;
  contact_person_position: string | null;
  contact_person_phone: string | null;
  social_media: any | null;
  profile_picture_url: string | null;
  phone_number: string | null;
  phone_number_verified: boolean | null;
  email?: string | null;
}

interface ManageUsersProps {
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
}

interface UserTypeCount {
  user_type: string | null;
  count: number;
}

export default function ManageUsers({ searchTerm: externalSearchTerm, setSearchTerm: setExternalSearchTerm }: ManageUsersProps) {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(externalSearchTerm || '');
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usersToDelete, setUsersToDelete] = useState<string[]>([]);
  const [userTypeCounts, setUserTypeCounts] = useState<UserTypeCount[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    userType: 'all',
    joinDate: 'all',
    location: 'all',
    companySize: 'all'
  });
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (externalSearchTerm !== undefined) {
      setSearchTerm(externalSearchTerm);
    }
  }, [externalSearchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    if (setExternalSearchTerm) {
      setExternalSearchTerm(newSearchTerm);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchUserTypeCounts();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

 
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .neq('user_type', 'admin');

      if (profilesError) {
        console.error('Supabase fetch error (profiles):', profilesError);
        throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
      }

      if (!profilesData || profilesData.length === 0) {
        console.warn('No profiles data returned from Supabase');
        setUsers([]);
        return;
      }

      setUsers(profilesData as Profile[]);
    } catch (error) {
      console.error('Error in fetchUsers:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch users');
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTypeCounts = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_type')
        .neq('user_type', 'admin');

      if (error) {
        console.error('Supabase fetch error (user type counts):', error);
        throw new Error(`Failed to fetch user type counts: ${error.message}`);
      }

      const userTypeMap = new Map<string | null, number>();
      data.forEach(item => {
        const userType = item.user_type || 'Unknown';
        userTypeMap.set(userType, (userTypeMap.get(userType) || 0) + 1);
      });

      const counts: UserTypeCount[] = Array.from(userTypeMap.entries()).map(([user_type, count]) => ({
        user_type,
        count,
      }));

      setUserTypeCounts(counts);
    } catch (error) {
      console.error('Error in fetchUserTypeCounts:', error);
      toast.error('Failed to load user type counts');
    }
  };

  const handleDeleteUsers = async (userIds: string[]) => {
    try {
      setIsDeleting(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No user session found. Please log in.');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete users');
      }

      setUsers(users.filter(user => !userIds.includes(user.id)));
      setSelectedUsers([]);
      setIsSelectionMode(false);
      toast.success(`${userIds.length} user${userIds.length > 1 ? 's' : ''} deleted successfully`);
      fetchUserTypeCounts();
    } catch (error) {
      console.error('Error deleting users:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete users');
    } finally {
      setIsDeleting(false);
    }
  };

  const openModal = (userIds: string | string[]) => {
    setUsersToDelete(Array.isArray(userIds) ? userIds : [userIds]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setUsersToDelete([]);
  };

  const confirmDelete = () => {
    if (usersToDelete.length > 0) {
      closeModal();
      handleDeleteUsers(usersToDelete);
    }
  };

  const handleSelectUser = (userId: string) => {
    if (!isSelectionMode) return;
    setSelectedUsers(prev => {
      const newSelection = prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId];
      if (newSelection.length === 0) {
        setIsSelectionMode(false);
      }
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
      setIsSelectionMode(false);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const startLongPress = (userId: string) => {
    longPressTimer.current = setTimeout(() => {
      setIsSelectionMode(true);
      setSelectedUsers(prev => prev.includes(userId) ? prev : [...prev, userId]);
    }, 500);
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const getUserTypeConfig = (userType: string | null) => {
    switch (userType) {
      case 'brand':
        return {
          label: 'Brands',
          subtitle: 'Companies',
          color: '#10b981',
          gradient: 'linear-gradient(135deg, #10b981, #059669)',
          icon: Building2
        };
      case 'creator':
        return {
          label: 'Creators',
          subtitle: 'Content makers',
          color: '#f59e0b',
          gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
          icon: Users
        };
      case 'event_organizer':
        return {
          label: 'Event Organizers',
          subtitle: 'Event hosts',
          color: '#8b5cf6',
          gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
          icon: Calendar
        };
      case 'agency':
        return {
          label: 'Agencies',
          subtitle: 'Marketing firms',
          color: '#ef4444',
          gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
          icon: Building2
        };
      case 'influencer':
        return {
          label: 'Influencers',
          subtitle: 'Social media',
          color: '#ec4899',
          gradient: 'linear-gradient(135deg, #ec4899, #db2777)',
          icon: Users
        };
      default:
        return {
          label: 'Unknown',
          subtitle: 'Unspecified',
          color: '#6b7280',
          gradient: 'linear-gradient(135deg, #6b7280, #4b5563)',
          icon: UserCog
        };
    }
  };

  const handleDoubleClick = (userId: string) => {
    setIsSelectionMode(true);
    setSelectedUsers(prev => prev.includes(userId) ? prev : [...prev, userId]);
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ArrowUpDown className="w-3 h-3 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-3 h-3 text-blue-600" />
      : <ChevronDown className="w-3 h-3 text-blue-600" />;
  };

  const getUniqueValues = (key: keyof Profile) => {
    const values = users
      .map(user => user[key])
      .filter(value => value && value !== '')
      .map(value => String(value));
    return Array.from(new Set(values)).sort();
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      userType: 'all',
      joinDate: 'all',
      location: 'all',
      companySize: 'all'
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearchTerm =
      !searchTerm ||
      (user.contact_person_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (user.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (user.website?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (user.location?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (user.company_size?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (user.phone_number?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

    const matchesFilters = 
      (filters.userType === 'all' || user.user_type === filters.userType) &&
      (filters.joinDate === 'all' || (() => {
        if (!user.created_at) return false;
        const joinDate = new Date(user.created_at);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (filters.joinDate) {
          case 'last-7-days': return daysDiff <= 7;
          case 'last-30-days': return daysDiff <= 30;
          case 'last-90-days': return daysDiff <= 90;
          case 'last-year': return daysDiff <= 365;
          default: return true;
        }
      })()) &&
      (filters.location === 'all' || user.location === filters.location) &&
      (filters.companySize === 'all' || user.company_size === filters.companySize);

    return matchesSearchTerm && matchesFilters;
  }).sort((a, b) => {
    if (!sortConfig) return 0;

    const { key, direction } = sortConfig;
    let aValue = a[key as keyof Profile];
    let bValue = b[key as keyof Profile];

    // Handle null/undefined values
    if (!aValue && !bValue) return 0;
    if (!aValue) return direction === 'asc' ? 1 : -1;
    if (!bValue) return direction === 'asc' ? -1 : 1;

    // Convert to strings for comparison
    aValue = String(aValue).toLowerCase();
    bValue = String(bValue).toLowerCase();

    if (aValue < bValue) {
      return direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return direction === 'asc' ? 1 : -1;
    }
    return 0;
  });


  return (
    <div className="space-y-6">
      {/* Progress Bar Overlay */}
      {isDeleting && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-200/50 w-full max-w-md mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Deleting Users</h3>
              <p className="text-gray-600 mb-6">Please wait while we remove the selected users...</p>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div className="bg-gradient-to-r from-red-500 to-pink-500 h-3 rounded-full animate-pulse" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Manage Users
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Oversee and manage all registered users
              {filteredUsers.length !== users.length && (
                <span className="ml-2 text-blue-600">
                  (Showing {filteredUsers.length} of {users.length})
                </span>
              )}
              {sortConfig && (
                <span className="ml-2 text-green-600">
                  • Sorted by {sortConfig.key.replace('_', ' ')} ({sortConfig.direction})
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-6">
        <div className="bg-white/70 backdrop-blur-md p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 sm:mb-0">
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Total Users</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1">{users.length}</p>
              <p className="text-xs sm:text-sm text-blue-600 font-medium mt-1">All registered</p>
            </div>
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center self-end sm:self-auto">
              <TrendingUp className="text-white" size={16} />
            </div>
          </div>
        </div>
        {userTypeCounts.map((count) => {
          const userTypeConfig = getUserTypeConfig(count.user_type);
          return (
            <div
              key={count.user_type || 'unknown'}
              className="bg-white/70 backdrop-blur-md p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-2 sm:mb-0">
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">{userTypeConfig.label}</p>
                  <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1">{count.count}</p>
                  <p className="text-xs sm:text-sm font-medium mt-1" style={{color: userTypeConfig.color}}>
                    {userTypeConfig.subtitle}
                  </p>
                </div>
                <div 
                  className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center self-end sm:self-auto"
                  style={{background: userTypeConfig.gradient}}
                >
                  <userTypeConfig.icon className="text-white" size={16} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="bg-white/70 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-lg border border-gray-200/50 p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name, email, company, website, location, or phone..."
                  className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200 text-sm sm:text-base"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl transition-all duration-200 font-medium text-sm sm:text-base flex items-center ${
                showFilters 
                  ? 'text-blue-600 border-blue-200 bg-blue-50' 
                  : 'text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {(filters.userType !== 'all' || filters.joinDate !== 'all' || filters.location !== 'all' || filters.companySize !== 'all') && (
                <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                  Active
                </span>
              )}
            </button>
          </div>

          {/* Filter Controls */}
          {showFilters && (
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">User Type</label>
                  <select
                    value={filters.userType}
                    onChange={(e) => handleFilterChange('userType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                  >
                    <option value="all">All Types</option>
                    {getUniqueValues('user_type').map(type => (
                      <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Join Date</label>
                  <select
                    value={filters.joinDate}
                    onChange={(e) => handleFilterChange('joinDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                  >
                    <option value="all">All Time</option>
                    <option value="last-7-days">Last 7 Days</option>
                    <option value="last-30-days">Last 30 Days</option>
                    <option value="last-90-days">Last 90 Days</option>
                    <option value="last-year">Last Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                  <select
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                  >
                    <option value="all">All Locations</option>
                    {getUniqueValues('location').map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Company Size</label>
                  <select
                    value={filters.companySize}
                    onChange={(e) => handleFilterChange('companySize', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                  >
                    <option value="all">All Sizes</option>
                    {getUniqueValues('company_size').map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                <div className="text-sm text-gray-600">
                  Showing {filteredUsers.length} of {users.length} users
                </div>
                <button
                  onClick={clearFilters}
                  className="px-3 py-1.5 text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <div className="flex gap-3">
              <button
                onClick={fetchUsers}
                className="p-2.5 sm:p-3 text-gray-600 hover:text-blue-600 border border-gray-200 rounded-lg sm:rounded-xl hover:bg-blue-50 transition-all duration-200 hover:shadow-md flex items-center justify-center"
                title="Refresh data"
              >
                <RefreshCw size={18} />
              </button>
              {!isSelectionMode && filteredUsers.length > 0 && (
                <button
                  onClick={() => {
                    setIsSelectionMode(true);
                    setSelectedUsers([]);
                  }}
                  className="px-3 sm:px-4 py-2.5 sm:py-3 text-blue-600 hover:text-blue-800 border border-blue-200 rounded-lg sm:rounded-xl hover:bg-blue-50 transition-all duration-200 font-medium text-sm sm:text-base"
                >
                  Select Mode
                </button>
              )}
            </div>
            {isSelectionMode && (
              <div className="flex gap-2">
                <button
                  onClick={handleSelectAll}
                  className="px-3 sm:px-4 py-2.5 sm:py-3 text-blue-600 hover:text-blue-800 border border-blue-200 rounded-lg sm:rounded-xl hover:bg-blue-50 transition-all duration-200 font-medium text-sm sm:text-base"
                >
                  {selectedUsers.length === filteredUsers.length ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  onClick={() => {
                    setIsSelectionMode(false);
                    setSelectedUsers([]);
                  }}
                  className="px-3 sm:px-4 py-2.5 sm:py-3 text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium text-sm sm:text-base"
                >
                  Cancel Selection
                </button>
              </div>
            )}
          </div>
          {isSelectionMode && selectedUsers.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">
                  {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={() => openModal(selectedUsers)}
                  className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-medium transition-colors duration-200"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete Selected
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white/70 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
        {loading ? (
          <div className="p-6 sm:p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-spin mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Loading Users</h3>
            <p className="text-sm sm:text-base text-gray-600">Fetching user data...</p>
          </div>
        ) : error ? (
          <div className="p-6 sm:p-12 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-red-200 to-red-300 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Users className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Error Loading Users</h3>
            <p className="text-sm sm:text-base text-red-600 mb-4 sm:mb-6">{error}</p>
            <button
              onClick={fetchUsers}
              className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg text-sm sm:text-base"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Loading
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-6 sm:p-12 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Users className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Users Found</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              {searchTerm ? `No users match "${searchTerm}"` : 'No users found with current filters'}
            </p>
            <button
              onClick={fetchUsers}
              className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg text-sm sm:text-base"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead className="bg-gray-50/50 border-b border-gray-200">
                    <tr>
                      {(selectedUsers.length > 0 || isSelectionMode) && (
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-12">
                          <input
                            type="checkbox"
                            checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                            onChange={handleSelectAll}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </th>
                      )}
                      <th 
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[150px] cursor-pointer hover:bg-gray-100/50 transition-colors duration-200"
                        onClick={() => handleSort('company_name')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Company</span>
                          {getSortIcon('company_name')}
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[140px] cursor-pointer hover:bg-gray-100/50 transition-colors duration-200"
                        onClick={() => handleSort('contact_person_name')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Contact Person</span>
                          {getSortIcon('contact_person_name')}
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[180px] cursor-pointer hover:bg-gray-100/50 transition-colors duration-200"
                        onClick={() => handleSort('email')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Email</span>
                          {getSortIcon('email')}
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[100px] cursor-pointer hover:bg-gray-100/50 transition-colors duration-200"
                        onClick={() => handleSort('user_type')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Role</span>
                          {getSortIcon('user_type')}
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[120px] cursor-pointer hover:bg-gray-100/50 transition-colors duration-200"
                        onClick={() => handleSort('created_at')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Join Date</span>
                          {getSortIcon('created_at')}
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[120px] cursor-pointer hover:bg-gray-100/50 transition-colors duration-200"
                        onClick={() => handleSort('location')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Location</span>
                          {getSortIcon('location')}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[120px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/50">
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        onMouseDown={() => startLongPress(user.id)}
                        onMouseUp={cancelLongPress}
                        onMouseLeave={cancelLongPress}
                        onDoubleClick={() => handleDoubleClick(user.id)}
                        onClick={() => handleSelectUser(user.id)}
                        className={`cursor-pointer transition-colors duration-200 ${
                          selectedUsers.includes(user.id) ? 'bg-blue-50' : 'hover:bg-gray-50/50'
                        }`}
                      >
                        {(selectedUsers.length > 0 || isSelectionMode) && (
                          <td className="px-4 py-3 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => handleSelectUser(user.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </td>
                        )}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center max-w-[150px]">
                            <Building2 className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                            <div className="truncate">
                              <div className="text-sm font-medium text-gray-900 truncate" title={user.company_name || 'N/A'}>
                                {user.company_name || 'N/A'}
                              </div>
                              <div className="text-xs text-gray-500">Company</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="max-w-[140px] truncate">
                            <div className="text-sm text-gray-900 truncate" title={user.contact_person_name || 'N/A'}>
                              {user.contact_person_name || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500 truncate" title={user.contact_person_position || 'Position'}>
                              {user.contact_person_position || 'Position'}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center max-w-[180px]">
                            <Mail className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                            <div className="text-sm text-gray-900 truncate" title={user.email || 'N/A'}>
                              {user.email || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 max-w-[100px] truncate">
                            {user.user_type || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900 max-w-[120px] truncate" title={formatDate(user.created_at)}>
                            {formatDate(user.created_at)}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center max-w-[120px]">
                            <MapPin className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                            <div className="text-sm text-gray-900 truncate" title={user.location || 'N/A'}>
                              {user.location || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                alert(`Edit user ${user.contact_person_name} (ID: ${user.id})`);
                              }}
                              className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 text-xs font-medium transition-colors duration-200"
                              title="Edit User"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openModal(user.id);
                              }}
                              className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 text-xs font-medium transition-colors duration-200"
                              title="Delete User"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden">
              {/* Mobile Sort Controls */}
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Sort by:</span>
                  <select
                    value={sortConfig ? `${sortConfig.key}-${sortConfig.direction}` : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        const [key, direction] = e.target.value.split('-');
                        setSortConfig({ key, direction: direction as 'asc' | 'desc' });
                      } else {
                        setSortConfig(null);
                      }
                    }}
                    className="ml-3 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                  >
                    <option value="">Default Order</option>
                    <option value="company_name-asc">Company A-Z</option>
                    <option value="company_name-desc">Company Z-A</option>
                    <option value="contact_person_name-asc">Contact A-Z</option>
                    <option value="contact_person_name-desc">Contact Z-A</option>
                    <option value="user_type-asc">Role A-Z</option>
                    <option value="user_type-desc">Role Z-A</option>
                    <option value="created_at-asc">Join Date (Oldest)</option>
                    <option value="created_at-desc">Join Date (Newest)</option>
                    <option value="location-asc">Location A-Z</option>
                    <option value="location-desc">Location Z-A</option>
                  </select>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200/50">
                {filteredUsers.map((user) => (
                <div 
                  key={user.id} 
                  className={`p-4 sm:p-6 transition-colors duration-200 ${
                    selectedUsers.includes(user.id) ? 'bg-blue-50' : 'hover:bg-gray-50/50'
                  }`}
                  onMouseDown={() => startLongPress(user.id)}
                  onMouseUp={cancelLongPress}
                  onMouseLeave={cancelLongPress}
                  onDoubleClick={() => handleDoubleClick(user.id)}
                  onClick={() => handleSelectUser(user.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center flex-1 min-w-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mr-3 flex-shrink-0">
                        <Building2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate" title={user.company_name || 'N/A'}>
                          {user.company_name || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Company</div>
                      </div>
                    </div>
                    {(selectedUsers.length > 0 || isSelectionMode) && (
                      <div className="ml-3 flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center min-w-0">
                      <Users className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-900 truncate" title={user.contact_person_name || 'N/A'}>
                        {user.contact_person_name || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center min-w-0">
                      <Mail className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-900 truncate" title={user.email || 'N/A'}>
                        {user.email || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center min-w-0">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-900 truncate" title={user.created_at ? `Joined ${formatDate(user.created_at)}` : 'Join date unknown'}>
                        {user.created_at ? `Joined ${formatDate(user.created_at)}` : 'Join date unknown'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {user.user_type || 'Unknown'}
                      </span>
                      {user.location && (
                        <div className="flex items-center min-w-0 ml-2">
                          <MapPin className="w-4 h-4 text-gray-400 mr-1 flex-shrink-0" />
                          <span className="text-sm text-gray-600 truncate" title={user.location}>
                            {user.location}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`Edit user ${user.contact_person_name} (ID: ${user.id})`);
                      }}
                      className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 text-xs font-medium transition-colors duration-200 flex-1 justify-center sm:flex-none"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal(user.id);
                      }}
                      className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 text-xs font-medium transition-colors duration-200 flex-1 justify-center sm:flex-none"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </button>
                    {!isSelectionMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsSelectionMode(true);
                          setSelectedUsers([user.id]);
                        }}
                        className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-xs font-medium transition-colors duration-200"
                        title="Select this user"
                      >
                        Select
                      </button>
                    )}
                  </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={confirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete ${usersToDelete.length} user${usersToDelete.length > 1 ? 's' : ''}? This action cannot be undone and will also remove the user${usersToDelete.length > 1 ? 's' : ''} from authentication.`}
        confirmText="Delete"
        confirmButtonClass="bg-red-600 text-white hover:bg-red-700"
        cancelButtonClass="border-gray-300 text-gray-700 hover:bg-gray-50"
      />
    </div>
  );
}

