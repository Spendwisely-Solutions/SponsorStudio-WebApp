import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { signOut } from '../../../lib/auth';
import { supabase } from '../../../lib/supabase';
import { 
  CheckCircle, 
  XCircle, 
  BarChart3,
  Clock,
  LogOut,
  ClipboardList,
  Settings as SettingsIcon,
  LayoutDashboard,
  MessageCircleQuestion as Faq,
  Briefcase,
  Link as LinkIcon,
  FolderOpen,
  FileText,
  Menu,
  X,
  TrendingUp,
  Users,
  Shield,
  Bell
} from 'lucide-react';
import Opportunities from './Opportunities';
import MatchedOpportunities from './MatchedOpportunities';
import ManageUsers from './ManageUsers';
import RiskAnalysisRequests from './RiskAnalysisRequests';
import ManageBlogs from './ManageBlogs';
import ManageClientsLogos from './ManageClientsLogos';
import ManageMedia from './ManageMedia';
import ManageFaq from './ManageFaq';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalMatches: 0,
    pendingMatches: 0,
    acceptedMatches: 0,
    rejectedMatches: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch stats for opportunities and matches when the dashboard loads
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);

        // Fetch opportunities stats
        const { data: oppStatsData, error: oppStatsError } = await supabase
          .from('opportunities')
          .select('verification_status');
        
        if (oppStatsError) throw oppStatsError;

        const normalizedOppStats = oppStatsData.map(item => ({
          ...item,
          verification_status: item.verification_status?.trim().toLowerCase() ?? 'pending'
        }));

        // Fetch matches stats
        const { data: matchStatsData, error: matchStatsError } = await supabase
          .from('matches')
          .select('status');
        
        if (matchStatsError) throw matchStatsError;

        const normalizedMatchStats = matchStatsData?.map(item => ({
          ...item,
          status: item.status?.trim().toLowerCase()
        })) || [];

        setStats({
          total: normalizedOppStats.length,
          pending: normalizedOppStats.filter(o => o.verification_status === 'pending').length,
          approved: normalizedOppStats.filter(o => o.verification_status === 'approved').length,
          rejected: normalizedOppStats.filter(o => o.verification_status === 'rejected').length,
          totalMatches: normalizedMatchStats.length,
          pendingMatches: normalizedMatchStats.filter(m => m.status === 'pending').length,
          acceptedMatches: normalizedMatchStats.filter(m => m.status === 'accepted').length,
          rejectedMatches: normalizedMatchStats.filter(m => m.status === 'rejected').length
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Create mock notifications based on pending items
        const mockNotifications = [
          {
            id: 1,
            title: 'New Opportunity Pending',
            message: `${stats.pending} opportunities need verification`,
            type: 'opportunity',
            time: '5 mins ago',
            read: false,
            icon: '📋'
          },
          {
            id: 2,
            title: 'Matches Awaiting Review',
            message: `${stats.pendingMatches} matches need your attention`,
            type: 'match',
            time: '15 mins ago',
            read: false,
            icon: '🔗'
          },
          {
            id: 3,
            title: 'User Registration',
            message: 'New user registered and needs profile verification',
            type: 'user',
            time: '1 hour ago',
            read: true,
            icon: '👤'
          },
          {
            id: 4,
            title: 'System Update',
            message: 'Platform maintenance scheduled for tonight',
            type: 'system',
            time: '2 hours ago',
            read: false,
            icon: '⚙️'
          },
          {
            id: 5,
            title: 'New FAQ Request',
            message: 'Users requesting FAQ about payment methods',
            type: 'faq',
            time: '3 hours ago',
            read: true,
            icon: '❓'
          }
        ];

        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => !n.read).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    if (stats.total > 0) { // Only fetch notifications after stats are loaded
      fetchNotifications();
    }
  }, [stats]);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showNotifications && !target.closest('.notification-dropdown')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const markAsRead = (notificationId: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/admin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-600' },
    { path: '/admin/opportunities', label: 'Opportunities', icon: Briefcase, color: 'text-green-600' },
    { path: '/admin/matched-opportunities', label: 'Matches', icon: LinkIcon, color: 'text-purple-600' },
    { path: '/admin/risk-analysis', label: 'Risk Analysis', icon: Shield, color: 'text-red-600' },
    { path: '/admin/create-risk-analysis', label: 'Create Reports', icon: FileText, color: 'text-orange-600' },
    { path: '/admin/manage-users', label: 'Manage Users', icon: Users, color: 'text-indigo-600' },
    { path: '/admin/manage-blogs', label: 'Manage Blogs', icon: ClipboardList, color: 'text-pink-600' },
    { path: '/admin/manage-clients-logos', label: 'Client Logos', icon: BarChart3, color: 'text-cyan-600' },
    { path: '/admin/manage-medias', label: 'Media', icon: FolderOpen, color: 'text-emerald-600' },
    { path: '/admin/manage-faq', label: 'FAQ', icon: Faq, color: 'text-amber-600' },
    { path: '/admin/settings', label: 'Settings', icon: SettingsIcon, color: 'text-gray-600' }
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      {/* Mobile Menu Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-white/95 backdrop-blur-md shadow-2xl border-r border-gray-200/50 z-30 transform transition-transform duration-300 ease-in-out flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        <div className="flex-shrink-0 p-6 pt-1 pb-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-0">
            <div className="flex items-center">
              <img 
                src="/sponsor_studio_logo.png" 
                alt="SponsorStudio" 
                className="h-20 w-auto"
              />
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-6 pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center px-4 py-3 rounded-xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 shadow-sm' 
                      : 'hover:bg-gray-50 hover:shadow-sm'
                    }
                  `}
                >
                  <Icon className={`
                    w-5 h-5 mr-3 transition-colors duration-200
                    ${isActive ? item.color : 'text-gray-500 group-hover:text-gray-700'}
                  `} />
                  <span className={`
                    font-medium transition-colors duration-200
                    ${isActive ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'}
                  `}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="flex-shrink-0 p-6 pt-0 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Top Header */}
        <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors mr-3"
                >
                  <Menu className="w-6 h-6 text-gray-500" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-gray-600">Welcome back, {user?.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative notification-dropdown">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <Bell className="w-6 h-6 text-gray-500 hover:text-gray-700 cursor-pointer transition-colors" />
                    {unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      </div>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200/50 z-50 max-h-96 overflow-hidden">
                      <div className="p-4 border-b border-gray-200/50">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-gray-500">
                            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p>No notifications yet</p>
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              onClick={() => markAsRead(notification.id)}
                              className={`
                                p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors
                                ${!notification.read ? 'bg-blue-50/50' : ''}
                              `}
                            >
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                  <div className={`
                                    w-10 h-10 rounded-xl flex items-center justify-center text-lg
                                    ${!notification.read ? 'bg-blue-100' : 'bg-gray-100'}
                                  `}>
                                    {notification.icon}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className={`
                                      text-sm font-medium truncate
                                      ${!notification.read ? 'text-gray-900' : 'text-gray-700'}
                                    `}>
                                      {notification.title}
                                    </p>
                                    {!notification.read && (
                                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2" />
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {notification.time}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="p-3 border-t border-gray-200/50">
                        <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
                          View all notifications
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          <Routes>
          <Route
            path="/dashboard"
            element={
              <div className="space-y-8">
                {/* Welcome Section */}
                <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                        Welcome to Admin Dashboard
                      </h2>
                      <p className="text-gray-600">Manage and verify opportunities, matches, and platform content</p>
                    </div>
                    <div className="hidden md:block">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                        <LayoutDashboard className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {loadingStats ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-spin mb-4">
                      <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                    <p className="text-gray-600 font-medium">Loading analytics...</p>
                  </div>
                ) : (
                  <>
                    {/* Opportunities Overview */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                          <TrendingUp className="w-6 h-6 mr-3 text-blue-600" />
                          Opportunities Overview
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600 font-medium">Total Opportunities</p>
                              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                              <p className="text-sm text-green-600 font-medium mt-1">+12% from last month</p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                              <BarChart3 className="text-white" size={20} />
                            </div>
                          </div>
                        </div>
                        <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600 font-medium">Pending Review</p>
                              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pending}</p>
                              <p className="text-sm text-yellow-600 font-medium mt-1">Needs attention</p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                              <Clock className="text-white" size={20} />
                            </div>
                          </div>
                        </div>
                        <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600 font-medium">Approved</p>
                              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.approved}</p>
                              <p className="text-sm text-green-600 font-medium mt-1">Ready to match</p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                              <CheckCircle className="text-white" size={20} />
                            </div>
                          </div>
                        </div>
                        <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600 font-medium">Rejected</p>
                              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.rejected}</p>
                              <p className="text-sm text-red-600 font-medium mt-1">Quality control</p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                              <XCircle className="text-white" size={20} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Matches Overview */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                          <LinkIcon className="w-6 h-6 mr-3 text-purple-600" />
                          Matches Overview
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600 font-medium">Total Matches</p>
                              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalMatches}</p>
                              <p className="text-sm text-blue-600 font-medium mt-1">All connections</p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                              <BarChart3 className="text-white" size={20} />
                            </div>
                          </div>
                        </div>
                        <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600 font-medium">Pending Matches</p>
                              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pendingMatches}</p>
                              <p className="text-sm text-yellow-600 font-medium mt-1">Awaiting response</p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                              <Clock className="text-white" size={20} />
                            </div>
                          </div>
                        </div>
                        <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600 font-medium">Accepted Matches</p>
                              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.acceptedMatches}</p>
                              <p className="text-sm text-green-600 font-medium mt-1">Successful connections</p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                              <CheckCircle className="text-white" size={20} />
                            </div>
                          </div>
                        </div>
                        <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600 font-medium">Rejected Matches</p>
                              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.rejectedMatches}</p>
                              <p className="text-sm text-red-600 font-medium mt-1">Not a fit</p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                              <XCircle className="text-white" size={20} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            }
          />
          <Route
            path="/opportunities"
            element={
              <Opportunities 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                stats={stats}
                setStats={(newStats) => setStats(prev => ({ ...prev, ...newStats }))}
              />
            }
          />
          <Route
            path="/matched-opportunities"
            element={
              <MatchedOpportunities 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                stats={stats}
                setStats={(newStats) => setStats(prev => ({ ...prev, ...newStats }))}
              />
            }
          />
          <Route
            path="/risk-analysis"
            element={
              <RiskAnalysisRequests 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            }
          />
          <Route
            path="/create-risk-analysis"
            element={
              <>Create Risk Analysis Reports</>
            }
          />
          <Route
            path="/manage-users"
            element={
              <ManageUsers 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            }
          />
          <Route
            path="/manage-blogs"
            element={
              <ManageBlogs />
            }
          />
          <Route
            path="/manage-clients-logos"
            element={
              <ManageClientsLogos />
            }
          />
          <Route
            path="/manage-medias"
            element={
              <ManageMedia />
            }
          />
          <Route
            path="/manage-faq"
            element={
              <ManageFaq />
            }
          />
          <Route
            path="/settings"
            element={<div className="text-center mt-8">Settings Page (Coming Soon)</div>}
          />
          <Route
            path="*"
            element={<div className="text-center mt-8">Page Not Found</div>}
          />
        </Routes>
        </div>
      </div>
    </div>
  );
}