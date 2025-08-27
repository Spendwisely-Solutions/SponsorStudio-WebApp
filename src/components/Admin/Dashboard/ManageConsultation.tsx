import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../lib/supabase';
import { formatDate } from '../../../utils/formatDate';
import toast from 'react-hot-toast';
import {
  Calendar,
  Clock,
  Mail,
  Phone,
  Building2,
  User,
  Link as LinkIcon,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  ExternalLink,
  Users,
  Video,
  ArrowUp,
  ArrowDown,
  SlidersHorizontal
} from 'lucide-react';

// Define the ConsultationBooking interface with stricter types
interface ConsultationBooking {
  id: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  consultation_date: string;
  time_slot: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  meeting_link?: string;
  brand_description?: string;
  requirements?: string;
  created_at: string;
  payments?: {
    id: string;
    status: string;
    amount: number;
    currency: string;
    created_at: string;
    razorpay_payment_id?: string;
  }[];
}

// Utility to validate URLs
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const ManageConsultations = () => {
  const [bookings, setBookings] = useState<ConsultationBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryLoading, setRetryLoading] = useState(false); // Added for retry button
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);

  // Fetch bookings from Supabase
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('consultation_bookings')
        .select(`
          *,
          payments!inner(
            id,
            status,
            amount,
            currency,
            created_at,
            razorpay_payment_id
          )
        `)
        .eq('payments.status', 'paid')
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Explicit type check for safety
      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid data format received from server');
      }
      setBookings(data as ConsultationBooking[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error('Error fetching bookings:', err); // Improved logging
      setError(errorMessage);
      toast.error('Failed to load consultations');
    } finally {
      setLoading(false);
      setRetryLoading(false); // Reset retry loading state
    }
  };

  // Update booking status with confirmation for critical changes
  const updateStatus = async (id: string, newStatus: string) => {
    // Confirm critical status changes (e.g., cancelling)
    if (newStatus === 'cancelled' && !confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      // Optimistic update
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === id ? { ...booking, status: newStatus as ConsultationBooking['status'] } : booking
        )
      );

      const { error } = await supabase
        .from('consultation_bookings')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success('Status updated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error('Failed to update status');
      // Revert optimistic update on error
      await fetchBookings();
    }
  };

  // Update meeting link with validation
  const updateMeetingLink = async (id: string, meetingLink: string) => {
    if (meetingLink && !isValidUrl(meetingLink)) {
      toast.error('Please enter a valid URL for the meeting link');
      return;
    }

    try {
      // Optimistic update
      setBookings((prev) =>
        prev.map((booking) => (booking.id === id ? { ...booking, meeting_link: meetingLink } : booking))
      );

      const { error } = await supabase
        .from('consultation_bookings')
        .update({ meeting_link: meetingLink || null }) // Handle empty string as null
        .eq('id', id);

      if (error) throw error;
      toast.success('Meeting link updated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error('Failed to update meeting link');
      // Revert optimistic update on error
      await fetchBookings();
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'confirmed':
        return {
          color: 'text-green-800',
          bg: 'bg-green-100',
          border: 'border-green-200',
          icon: CheckCircle
        };
      case 'completed':
        return {
          color: 'text-blue-800',
          bg: 'bg-blue-100',
          border: 'border-blue-200',
          icon: CheckCircle
        };
      case 'cancelled':
        return {
          color: 'text-red-800',
          bg: 'bg-red-100',
          border: 'border-red-200',
          icon: XCircle
        };
      default: // pending
        return {
          color: 'text-yellow-800',
          bg: 'bg-yellow-100',
          border: 'border-yellow-200',
          icon: AlertCircle
        };
    }
  };

  // Memoize filtered bookings to improve performance
  const filteredBookings = useMemo(() => {
    let filtered = bookings.filter((booking) => {
      const matchesSearch =
        (booking.company_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (booking.contact_person?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (booking.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (booking.brand_description?.toLowerCase() || '').includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

      // Date filter logic
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const bookingDate = new Date(booking.consultation_date || booking.created_at);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (dateFilter) {
          case 'today':
            matchesDate = bookingDate >= today && bookingDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
            break;
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = bookingDate >= weekAgo;
            break;
          case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesDate = bookingDate >= monthAgo;
            break;
          case 'upcoming':
            matchesDate = bookingDate >= today;
            break;
          case 'past':
            matchesDate = bookingDate < today;
            break;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'company_name':
          aValue = a.company_name?.toLowerCase() || '';
          bValue = b.company_name?.toLowerCase() || '';
          break;
        case 'contact_person':
          aValue = a.contact_person?.toLowerCase() || '';
          bValue = b.contact_person?.toLowerCase() || '';
          break;
        case 'consultation_date':
          aValue = new Date(a.consultation_date || a.created_at);
          bValue = new Date(b.consultation_date || b.created_at);
          break;
        case 'brand_description':
          aValue = a.brand_description?.toLowerCase() || '';
          bValue = b.brand_description?.toLowerCase() || '';
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default: // created_at
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [bookings, searchTerm, statusFilter, dateFilter, sortBy, sortOrder]);

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true">
        <div className="p-6 sm:p-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-spin mb-4 sm:mb-6">
            <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Loading Consultations</h3>
          <p className="text-sm sm:text-base text-gray-600">Fetching consultation data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="p-6 sm:p-12 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-red-200 to-red-300 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <XCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Error Loading Consultations</h3>
          <p className="text-sm sm:text-base text-red-600 mb-4 sm:mb-6">{error}</p>
          <button
            onClick={() => {
              setRetryLoading(true);
              fetchBookings();
            }}
            disabled={retryLoading}
            className={`inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-label="Retry loading consultations"
          >
            {retryLoading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {retryLoading ? 'Retrying...' : 'Retry Loading'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Paid Consultation Bookings
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Manage and track paid consultation requests
              {filteredBookings.length !== bookings.length && (
                <span className="ml-2 text-blue-600">
                  (Showing {filteredBookings.length} of {bookings.length})
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {filteredBookings.length} paid bookings
            </div>
            <button
              onClick={fetchBookings}
              className="p-2.5 sm:p-3 text-gray-600 hover:text-blue-600 border border-gray-200 rounded-lg sm:rounded-xl hover:bg-blue-50 transition-all duration-200 hover:shadow-md flex items-center justify-center"
              title="Refresh data"
              aria-label="Refresh consultation data"
            >
              <RefreshCw size={18} />
            </button>
            <div className="hidden sm:block">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white/70 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-lg border border-gray-200/50 p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by company, contact person, email, or brand description..."
                className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200 text-sm sm:text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search consultations"
              />
            </div>
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <select
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm min-w-0"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by status"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <select
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm min-w-0"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                aria-label="Filter by date"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </select>
            </div>

            {/* Sort Controls */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <SlidersHorizontal className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <select
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm min-w-0"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort by"
                >
                  <option value="created_at">Created Date</option>
                  <option value="consultation_date">Consultation Date</option>
                  <option value="company_name">Company Name</option>
                  <option value="contact_person">Contact Person</option>
                  <option value="brand_description">Brand Description</option>
                  <option value="status">Status</option>
                </select>
              </div>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2.5 border border-gray-200 rounded-lg bg-white/80 backdrop-blur-sm hover:bg-blue-50 transition-all duration-200 flex items-center justify-center min-w-[44px]"
                title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
              >
                {sortOrder === 'asc' ? (
                  <ArrowUp className="h-4 w-4 text-gray-600" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Active Filters Summary */}
          {(searchTerm || statusFilter !== 'all' || dateFilter !== 'all') && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Search: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                </span>
              )}
              {statusFilter !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  Status: {statusFilter}
                  <button
                    onClick={() => setStatusFilter('all')}
                    className="ml-1 text-green-600 hover:text-green-800"
                    aria-label="Clear status filter"
                  >
                    ×
                  </button>
                </span>
              )}
              {dateFilter !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                  Date: {dateFilter}
                  <button
                    onClick={() => setDateFilter('all')}
                    className="ml-1 text-purple-600 hover:text-purple-800"
                    aria-label="Clear date filter"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setDateFilter('all');
                }}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results Summary */}
      {bookings.length > 0 && (
        <div className="bg-white/70 backdrop-blur-md rounded-lg shadow-md border border-gray-200/50 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>
                Showing <span className="font-medium text-blue-600">{filteredBookings.length}</span> of{' '}
                <span className="font-medium">{bookings.length}</span> paid consultations
              </span>
              {filteredBookings.length !== bookings.length && (
                <span className="text-orange-600">
                  ({bookings.length - filteredBookings.length} filtered out)
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">
              Sorted by {sortBy.replace('_', ' ')} ({sortOrder === 'asc' ? 'ascending' : 'descending'})
            </div>
          </div>
        </div>
      )}

      {/* Bookings Grid */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-lg border border-gray-200/50 p-8 sm:p-12 text-center">
          <Users className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">No paid consultations found</h3>
          <p className="text-gray-500 text-sm sm:text-base">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'No paid consultation bookings have been submitted yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {filteredBookings.map((booking) => {
            const statusConfig = getStatusConfig(booking.status);
            const StatusIcon = statusConfig.icon;
            const isExpanded = expandedBooking === booking.id;

            return (
              <div
                key={booking.id}
                className="bg-white/70 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-4 sm:p-6 border-b border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center space-x-2">
                        <Building2 className="h-5 w-5 text-blue-600" />
                        <span>{booking.company_name || 'Unknown Company'}</span>
                      </h3>
                      <p className="text-gray-600 flex items-center space-x-2 mt-1 text-sm sm:text-base">
                        <User className="h-4 w-4" />
                        <span>{booking.contact_person || 'Unknown Contact'}</span>
                      </p>
                    </div>
                    <div
                      className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border} border`}
                    >
                      <StatusIcon className="h-4 w-4" />
                      <span className="capitalize">{booking.status}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="p-4 sm:p-6 bg-gray-50/30 backdrop-blur-sm border-b border-gray-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Mail className="h-4 w-4 text-blue-500" />
                      <span className="truncate">{booking.email || 'No email'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Phone className="h-4 w-4 text-blue-500" />
                      <span>{booking.phone || 'No phone'}</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 sm:p-6 space-y-4">
                  {/* Brand Description */}
                  {booking.brand_description && (
                    <div className="p-3 bg-blue-50/50 backdrop-blur-sm rounded-lg border border-blue-100">
                      <div className="flex items-start space-x-2">
                        <Building2 className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-blue-800 mb-1">Brand Description</p>
                          <p className="text-sm text-blue-700">{booking.brand_description}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Time Slot and Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {booking.time_slot && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">Time: {booking.time_slot}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">
                        Date: {booking.consultation_date ? formatDate(booking.consultation_date) : 'Not specified'}
                      </span>
                    </div>
                  </div>

                  {/* Status Update */}
                  <div>
                    <label htmlFor={`status-${booking.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      id={`status-${booking.id}`}
                      value={booking.status}
                      onChange={(e) => updateStatus(booking.id, e.target.value)}
                      className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      aria-label={`Update status for ${booking.company_name}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Meeting Link */}
                  <div>
                    <label htmlFor={`meeting-link-${booking.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                      Meeting Link
                    </label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        id={`meeting-link-${booking.id}`}
                        type="url"
                        defaultValue={booking.meeting_link || ''}
                        onBlur={(e) => updateMeetingLink(booking.id, e.target.value)}
                        placeholder="Enter meeting link"
                        className="w-full pl-10 pr-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        aria-label={`Meeting link for ${booking.company_name}`}
                      />
                    </div>
                    {booking.meeting_link && (
                      <button
                        onClick={() => window.open(booking.meeting_link, '_blank')}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1 transition-colors duration-200"
                        aria-label={`Open meeting link for ${booking.company_name}`}
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Open Meeting</span>
                      </button>
                    )}
                  </div>

                  {/* Requirements/Notes (if available) */}
                  {booking.requirements && (
                    <div>
                      <button
                        onClick={() => setExpandedBooking(isExpanded ? null : booking.id)}
                        className="flex items-center justify-between w-full text-left"
                        aria-expanded={isExpanded}
                        aria-controls={`requirements-${booking.id}`}
                      >
                        <label className="text-sm font-medium text-gray-700">Requirements</label>
                        <Eye
                          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {isExpanded && (
                        <div id={`requirements-${booking.id}`} className="mt-2 p-3 bg-gray-50/50 backdrop-blur-sm rounded-lg border border-gray-100">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{booking.requirements}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Created Date */}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <span className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>Created: {formatDate(booking.created_at)}</span>
                    </span>
                    {booking.status === 'confirmed' && booking.meeting_link && (
                      <span className="flex items-center space-x-1 text-green-600">
                        <Video className="h-3 w-3" />
                        <span>Ready for meeting</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ManageConsultations;