import { useState, useEffect } from 'react';
import { Eye, EyeOff, Edit2, Trash2, Users, Tag, Video, MoreVertical, Play, TrendingUp, Clock, Star, Heart, Share2, Sparkles } from 'lucide-react';

interface Post {
  // Core database fields from the posts table
  id: string;
  creator_id: string;
  title: string;
  description: string;
  hashtags?: string | null;
  category: string;
  reach?: number | null;
  price_range?: string | null | { min: number; max: number }; // Handle both string and object formats
  video_url?: string | null;
  status: 'active' | 'paused' | 'completed';
  verification_status?: 'pending' | 'approved' | 'rejected' | null;
  rejection_reason?: string | null;
  is_verified?: boolean | null;
  created_at: string;
  updated_at: string;
  
  // Additional fields that might be present (for backward compatibility)
  location?: string;
  timeline?: string;
  audience?: string;
  sponsorshipType?: string;
  requirements?: string;
  deliverables?: string;
  videoUrl?: string; // Legacy field name
  imageUrl?: string;
  createdAt?: string; // Legacy field name
  matchCount?: number;
  views?: number;
  likes?: number;
  engagement?: number;
  applications?: number;
}

interface PostListProps {
  posts: Post[];
  onEdit: (post: Post) => void;
  onDelete: (postId: string) => void;
  onToggleStatus: (postId: string, status: 'active' | 'paused') => void;
  isLoading?: boolean;
}

export default function PostList({ posts, onEdit, onDelete, onToggleStatus, isLoading = false }: PostListProps) {
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [fullscreenVideo, setFullscreenVideo] = useState<string | null>(null);
  const [videoStates, setVideoStates] = useState<{[key: string]: { isPlaying: boolean, duration: number }}>({});

  const handleVideoLoadedMetadata = (postId: string, duration: number) => {
    setVideoStates(prev => ({
      ...prev,
      [postId]: { 
        ...prev[postId], 
        duration, 
        isPlaying: false 
      }
    }));
  };

  const handleVideoPlay = (postId: string) => {
    setVideoStates(prev => ({
      ...prev,
      [postId]: { ...prev[postId], isPlaying: true }
    }));
  };

  const handleVideoPause = (postId: string) => {
    setVideoStates(prev => ({
      ...prev,
      [postId]: { ...prev[postId], isPlaying: false }
    }));
  };

  const toggleVideoPlayback = (postId: string, videoElement: HTMLVideoElement) => {
    if (videoElement.paused) {
      videoElement.play()
        .then(() => {
          setVideoStates(prev => ({
            ...prev,
            [postId]: { ...prev[postId], isPlaying: true }
          }));
        })
        .catch(() => {
          // If play fails, ensure state is consistent
          setVideoStates(prev => ({
            ...prev,
            [postId]: { ...prev[postId], isPlaying: false }
          }));
        });
    } else {
      videoElement.pause();
      setVideoStates(prev => ({
        ...prev,
        [postId]: { ...prev[postId], isPlaying: false }
      }));
    }
  };

  const handleFullscreen = (videoUrl: string) => {
    setFullscreenVideo(videoUrl);
  };

  const closeFullscreen = () => {
    setFullscreenVideo(null);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle ESC key to close fullscreen
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && fullscreenVideo) {
        closeFullscreen();
      }
    };

    if (fullscreenVideo) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [fullscreenVideo]);

  // Initialize video states for all posts
  useEffect(() => {
    const newVideoStates: { [key: string]: { isPlaying: boolean; duration: number } } = {};
    posts.forEach(post => {
      if (!videoStates[post.id]) {
        newVideoStates[post.id] = { isPlaying: false, duration: 0 };
      }
    });
    if (Object.keys(newVideoStates).length > 0) {
      setVideoStates(prev => ({ ...prev, ...newVideoStates }));
    }
  }, [posts]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200';
      case 'paused':
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200';
      case 'completed':
        return 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200';
      default:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <TrendingUp className="w-3 h-3" />;
      case 'paused':
        return <Clock className="w-3 h-3" />;
      case 'completed':
        return <Play className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getVerificationStatusColor = (verificationStatus: string, isVerified: boolean) => {
    if (isVerified) {
      return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200';
    }
    switch (verificationStatus) {
      case 'approved':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200';
      case 'pending':
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200';
      case 'rejected':
        return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200';
      default:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200';
    }
  };

  const getVerificationIcon = (verificationStatus: string, isVerified: boolean) => {
    if (isVerified) {
      return <Star className="w-3 h-3" />;
    }
    switch (verificationStatus) {
      case 'approved':
        return <Star className="w-3 h-3" />;
      case 'pending':
        return <Clock className="w-3 h-3" />;
      case 'rejected':
        return <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>;
      default:
        return null;
    }
  };

  const getVerificationMessage = (verificationStatus: string, isVerified: boolean, rejectionReason?: string) => {
    if (isVerified) {
      return {
        message: 'This post has been verified and approved by our team.',
        type: 'success' as const,
        icon: <Star className="w-4 h-4" />
      };
    }
    switch (verificationStatus) {
      case 'pending':
        return {
          message: 'This post is currently under review by our admin team. It will be published once it has been approved.',
          type: 'info' as const,
          icon: <Clock className="w-4 h-4" />
        };
      case 'rejected':
        return {
          message: rejectionReason || 'This post was rejected by the admin team. Please review the feedback and make necessary changes.',
          type: 'error' as const,
          icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        };
      case 'approved':
        return {
          message: 'This post has been approved and verified by our admin team.',
          type: 'success' as const,
          icon: <Star className="w-4 h-4" />
        };
      default:
        return {
          message: 'This post is awaiting admin review before it can be published.',
          type: 'info' as const,
          icon: <Clock className="w-4 h-4" />
        };
    }
  };

  const parseHashtags = (hashtagString?: string | null): string[] => {
    if (!hashtagString) return [];
    
    // Handle different hashtag formats and clean them up
    let tags: string[] = [];
    
    // Check if it's a comma-separated string
    if (hashtagString.includes(',')) {
      tags = hashtagString.split(',');
    } 
    // Check if it's space-separated
    else if (hashtagString.includes(' ')) {
      tags = hashtagString.split(' ');
    }
    // Single hashtag
    else {
      tags = [hashtagString];
    }
    
    return tags
      .map(tag => tag.trim())
      .filter(tag => tag !== '')
      .map(tag => {
        // Ensure hashtag starts with #
        if (!tag.startsWith('#')) {
          return '#' + tag;
        }
        return tag;
      })
      .filter(tag => tag.length > 1); // Filter out standalone '#'
  };

  const formatPrice = (price_range?: string | null | { min: number; max: number }): string => {
    if (!price_range) return 'Price not set';
    
    // Handle legacy object format (for existing data)
    if (typeof price_range === 'object' && price_range.min !== undefined && price_range.max !== undefined) {
      if (price_range.min === price_range.max) {
        return `₹${price_range.min.toLocaleString()}`;
      }
      return `₹${price_range.min.toLocaleString()} - ₹${price_range.max.toLocaleString()}`;
    }
    
    // Handle string format (new format)
    if (typeof price_range === 'string') {
      return price_range;
    }
    
    return 'Price not set';
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return 'Date not available';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden backdrop-blur-sm">
      {/* Add CSS animations via a style tag */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes shimmer {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: calc(200px + 100%) 0;
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(59, 130, 246, 0.6);
          }
        }
        
        .gradient-border {
          background: linear-gradient(white, white) padding-box,
                      linear-gradient(45deg, #3b82f6, #8b5cf6) border-box;
          border: 2px solid transparent;
        }
        
        .glass-effect {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.9);
        }
        
        .fullscreen-modal {
          animation: modalFadeIn 0.3s ease-out;
        }
        
        .fullscreen-video {
          max-width: 100vw;
          max-height: 100vh;
        }
        
        .animation-delay-150 {
          animation-delay: 150ms;
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
        
        .hover\\:shadow-3xl:hover {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
      {/* Enhanced Header */}
      <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-6 py-6 border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Your Content Hub</h3>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Manage your sponsorship opportunities
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full border border-white/50 shadow-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-gray-700">
                {posts.length} {posts.length === 1 ? 'post' : 'posts'}
              </span>
            </div>
            {posts.length > 0 && (
              <div className="flex items-center gap-1 bg-gradient-to-r from-emerald-100 to-green-100 px-3 py-1 rounded-full border border-emerald-200">
                <Star className="w-3 h-3 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-700">Active</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-8">
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-6 relative">
                  <div className="h-1.5 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-t-2xl absolute top-0 left-0 right-0" />
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="h-6 bg-gray-300 rounded-lg w-3/4 mb-3" />
                        <div className="flex gap-2 mb-4">
                          <div className="h-5 bg-gray-300 rounded-full w-16" />
                          <div className="h-5 bg-gray-300 rounded-full w-20" />
                        </div>
                        <div className="h-4 bg-gray-300 rounded w-full mb-2" />
                        <div className="h-4 bg-gray-300 rounded w-2/3" />
                      </div>
                      <div className="h-8 w-16 bg-gray-300 rounded-lg" />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <div className="h-8 bg-gray-300 rounded-xl w-20" />
                      <div className="h-8 bg-gray-300 rounded-xl w-24" />
                      <div className="h-8 bg-gray-300 rounded-xl w-16" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="relative mx-auto mb-6 w-24 h-24">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-3xl rotate-6 animate-pulse" />
              <div className="relative bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl w-full h-full flex items-center justify-center shadow-lg">
                <Video className="w-12 h-12 text-blue-500" />
              </div>
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-3">Ready to create magic? ✨</h4>
            <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed mb-6">
              Your content journey starts here! Create your first post to attract amazing brand partnerships 
              and unlock sponsorship opportunities.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                <span>Get discovered</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full" />
              <div className="flex items-center gap-1">
                <Share2 className="w-3 h-3" />
                <span>Build partnerships</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full" />
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                <span>Earn revenue</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map((post, index) => (
              <div 
                key={post.id} 
                className="group relative bg-gradient-to-br from-white via-gray-50/30 to-white border border-gray-200/60 rounded-3xl p-10 hover:shadow-3xl hover:border-blue-300/60 transition-all duration-700 hover:-translate-y-4 transform hover:bg-gradient-to-br hover:from-blue-50/20 hover:to-indigo-50/20 backdrop-blur-sm overflow-hidden"
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                {/* Premium background overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/[0.02] via-transparent to-purple-600/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                {/* Enhanced status indicator with glow */}
                <div className={`absolute top-0 left-0 right-0 h-3 rounded-t-3xl shadow-lg ${
                  post.status === 'active' ? 'bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 shadow-green-500/25' :
                  post.status === 'paused' ? 'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 shadow-amber-500/25' :
                  'bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 shadow-blue-500/25'
                }`} />



                {/* Floating action badge with enhanced glass effect */}
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-700 transform translate-y-4 group-hover:translate-y-0 scale-90 group-hover:scale-100 z-10">
                  <div className="glass-effect rounded-2xl p-4 shadow-2xl border border-white/60 backdrop-blur-lg bg-white/95">
                    <div className="flex items-center gap-3">
                      <div className="relative group/menu">
                        <button className="p-3 text-gray-600 hover:text-gray-800 rounded-xl hover:bg-gray-50/80 transition-all duration-300 hover:scale-110">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        <div className="absolute right-0 top-14 glass-effect border border-white/60 rounded-2xl shadow-2xl py-4 min-w-48 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-300 z-[100] transform translate-y-2 group-hover/menu:translate-y-0 bg-white/95 backdrop-blur-lg">
                          <button
                            onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                            className="w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-blue-50/80 hover:text-blue-700 flex items-center gap-3 transition-all duration-200 hover:translate-x-1 font-medium"
                          >
                            {expandedPost === post.id ? 
                              <EyeOff className="w-4 h-4" /> : 
                              <Eye className="w-4 h-4" />
                            }
                            {expandedPost === post.id ? 'Hide Details' : 'View Details'}
                          </button>
                          <button
                            onClick={() => onEdit(post)}
                            className="w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-blue-50/80 hover:text-blue-700 flex items-center gap-3 transition-all duration-200 hover:translate-x-1 font-medium"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit Post
                          </button>
                          <button
                            onClick={() => onToggleStatus(post.id, post.status === 'active' ? 'paused' : 'active')}
                            className="w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-amber-50/80 hover:text-amber-700 transition-all duration-200 hover:translate-x-1 font-medium flex items-center gap-3"
                          >
                            {post.status === 'active' ? (
                              <Clock className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                            {post.status === 'active' ? 'Pause Post' : 'Activate Post'}
                          </button>
                          <div className="border-t border-gray-200/60 my-2 mx-3" />
                          <button
                            onClick={() => onDelete(post.id)}
                            className="w-full text-left px-5 py-3 text-sm text-red-600 hover:bg-red-50/80 hover:text-red-700 flex items-center gap-3 transition-all duration-200 hover:translate-x-1 font-medium"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Post
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start justify-between pr-24 relative">
                  <div className="flex-1">
                    {/* Enhanced title and badges */}
                    <div className="flex items-start gap-4 mb-6">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-2xl mb-4 group-hover:text-blue-600 transition-colors leading-tight tracking-tight">
                          {post.title}
                        </h4>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-full shadow-lg border-2 transition-all duration-300 hover:scale-105 ${getStatusColor(post.status)}`}>
                            {getStatusIcon(post.status)}
                            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                          </span>
                          
                          {/* Verification Status Badge */}
                          {(post.verification_status || post.is_verified) && (
                            <span className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-full shadow-lg border-2 transition-all duration-300 hover:scale-105 ${getVerificationStatusColor(post.verification_status || 'pending', post.is_verified || false)}`}>
                              {getVerificationIcon(post.verification_status || 'pending', post.is_verified || false)}
                              {post.is_verified || post.verification_status === 'approved' ? 'Verified' : 
                               post.verification_status === 'pending' ? 'Under Review' :
                               post.verification_status === 'rejected' ? 'Rejected' : 'Pending'}
                            </span>
                          )}
                          
                          {/* Price Range Badge */}
                          {post.price_range && (
                            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-2 text-sm font-bold rounded-full border-2 border-green-200 shadow-lg hover:scale-105 transition-transform">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                              </svg>
                              {formatPrice(post.price_range)}
                            </span>
                          )}
                          
                          {/* Reach Badge */}
                          {post.reach && post.reach > 0 && (
                            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-4 py-2 text-sm font-bold rounded-full border-2 border-purple-200 shadow-lg hover:scale-105 transition-transform">
                              <Users className="w-4 h-4" />
                              {post.reach.toLocaleString()} reach
                            </span>
                          )}
                          
                          {post.matchCount && post.matchCount > 0 ? (
                            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-4 py-2 text-sm font-bold rounded-full border-2 border-blue-200 shadow-lg hover:scale-105 transition-transform">
                              <TrendingUp className="w-4 h-4" />
                              {post.matchCount} {post.matchCount === 1 ? 'match' : 'matches'}
                            </span>
                          ) : null}
                          
                          {post.views && post.views > 0 ? (
                            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-4 py-2 text-sm font-bold rounded-full border-2 border-purple-200 shadow-lg hover:scale-105 transition-transform">
                              <Eye className="w-4 h-4" />
                              {post.views.toLocaleString()} views
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-base mb-6 line-clamp-2 leading-relaxed">{post.description}</p>
                    
                    {/* Hashtags Display */}
                    {post.hashtags && parseHashtags(post.hashtags).length > 0 && (
                      <div className="mb-6">
                        <div className="flex flex-wrap gap-2">
                          {parseHashtags(post.hashtags).slice(0, 6).map((hashtag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full text-white bg-gradient-to-r from-blue-500 to-indigo-500 shadow-sm transition-all duration-200 hover:scale-105"
                            >
                              {hashtag}
                            </span>
                          ))}
                          {parseHashtags(post.hashtags).length > 6 && (
                            <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                              +{parseHashtags(post.hashtags).length - 6} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Show if hashtags exist but parsing failed */}
                    {post.hashtags && parseHashtags(post.hashtags).length === 0 && (
                      <div className="mb-6 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-sm text-orange-800">
                          <strong>Hashtags found but not displayed:</strong> "{post.hashtags}"
                        </p>
                      </div>
                    )}
                    
                    {/* Verification Status Message - Only show for non-verified posts */}
                    {!post.is_verified && (() => {
                      const verificationInfo = getVerificationMessage(
                        post.verification_status || 'pending',
                        post.is_verified || false,
                        post.rejection_reason || undefined
                      );
                      
                      return (
                        <div className={`mb-6 p-4 rounded-xl border-2 flex items-start gap-3 transition-all duration-300 ${
                          verificationInfo.type === 'success' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800' :
                          verificationInfo.type === 'error' ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-800' :
                          'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-800'
                        }`}>
                          <div className="flex-shrink-0 mt-0.5">
                            {verificationInfo.icon}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium leading-relaxed">
                              {verificationInfo.message}
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                    
                    {/* Enhanced info grid */}
                    <div className="flex flex-wrap gap-3 mb-8">
                      <div className="flex items-center gap-3 text-sm text-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl px-4 py-3 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <Tag className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold">{post.category}</span>
                      </div>
                      
                      {/* Created Date */}
                      <div className="flex items-center gap-3 text-sm text-gray-700 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl px-4 py-3 border border-orange-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <Clock className="w-5 h-5 text-orange-600" />
                        <span className="font-semibold">Created {formatDate(post.created_at || post.createdAt || '')}</span>
                      </div>
                      
                      {/* Last Updated - only show if different from created */}
                      {post.updated_at && post.updated_at !== post.created_at && (
                        <div className="flex items-center gap-3 text-sm text-gray-700 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl px-4 py-3 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span className="font-semibold">Updated {formatDate(post.updated_at)}</span>
                        </div>
                      )}
                      
                      {/* Legacy fields for backward compatibility */}
                      {post.audience && (
                        <div className="flex items-center gap-3 text-sm text-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl px-4 py-3 border border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                          <Users className="w-5 h-5 text-purple-600" />
                          <span className="font-semibold">{post.audience}</span>
                        </div>
                      )}
                    </div>

                    {/* Enhanced video preview with premium modern layout */}
                    {(post.video_url || post.videoUrl) && (
                      <div className="mb-8">
                        <div className="relative group/video bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 rounded-3xl p-6 border border-gray-200/60 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
                          {/* Premium gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 rounded-3xl" />
                          
                          {/* Video header with enhanced styling */}
                          <div className="relative flex items-center justify-between mb-6">
                          </div>
                          
                          {/* Premium video container */}
                          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-black/5 to-gray-900/10 p-1">
                            <div className="relative overflow-hidden rounded-2xl bg-black/5">
                              <video
                                ref={(el) => {
                                  if (el) {
                                    el.dataset.postId = post.id;
                                  }
                                }}
                                src={post.video_url || post.videoUrl}
                                className="w-full h-80 object-cover rounded-2xl border-2 border-white/60 shadow-2xl transition-all duration-700 group-hover/video:scale-[1.02] group-hover/video:shadow-3xl cursor-pointer backdrop-blur-sm"
                                controls
                                preload="metadata"
                                onLoadedMetadata={(e) => handleVideoLoadedMetadata(post.id, e.currentTarget.duration)}
                                onPlay={() => handleVideoPlay(post.id)}
                                onPause={() => handleVideoPause(post.id)}
                                onEnded={() => handleVideoPause(post.id)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                              />
                              
                              {/* Enhanced interactive overlay */}
                              <div 
                                className={`absolute inset-0 bg-gradient-to-br from-black/20 via-black/5 to-black/20 rounded-2xl transition-all duration-500 flex items-center justify-center cursor-pointer z-[1] ${
                                  videoStates[post.id]?.isPlaying 
                                    ? 'opacity-0 pointer-events-none' 
                                    : 'opacity-0 group-hover/video:opacity-100'
                                }`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const videoContainer = e.currentTarget.parentElement;
                                  const video = videoContainer?.querySelector('video') as HTMLVideoElement;
                                  if (video) {
                                    toggleVideoPlayback(post.id, video);
                                  }
                                }}
                              >
                                {/* Premium play button */}
                                <div className="relative group/play">
                                  <div className="bg-white/95 backdrop-blur-lg rounded-full p-6 shadow-2xl transform scale-90 group-hover/video:scale-100 transition-all duration-500 hover:scale-110 border border-white/70 group-hover/play:bg-white">
                                    {videoStates[post.id]?.isPlaying ? (
                                      <svg className="w-10 h-10 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                                      </svg>
                                    ) : (
                                      <Play className="w-10 h-10 text-gray-800 ml-1" />
                                    )}
                                  </div>
                                  
                                  {/* Enhanced pulse animation */}
                                  {!videoStates[post.id]?.isPlaying && (
                                    <>
                                      <div className="absolute inset-0 rounded-full bg-white/20 animate-ping scale-75" />
                                      <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping scale-110 animation-delay-150" />
                                    </>
                                  )}
                                  
                                  {/* Enhanced tooltip */}
                                  <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-black/90 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-sm opacity-0 group-hover/video:opacity-100 transition-all duration-300 whitespace-nowrap shadow-xl border border-white/10">
                                    {videoStates[post.id]?.isPlaying ? 'Click to pause' : 'Click to play'}
                                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black/90 rotate-45"></div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Premium quality badge */}
                              <div className="absolute top-4 right-4 bg-gradient-to-r from-black/80 to-gray-900/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold pointer-events-none z-[2] shadow-lg border border-white/20">
                                1080p HD
                              </div>
                              
                              {/* Enhanced playing indicator */}
                              {videoStates[post.id]?.isPlaying && (
                                <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500/95 to-pink-500/95 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 pointer-events-none z-[2] shadow-lg border border-white/20">
                                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                  PLAYING
                                </div>
                              )}
                              
                              {/* Video duration badge - only show when duration is available */}
                              {videoStates[post.id]?.duration && videoStates[post.id].duration > 0 && (
                                <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium pointer-events-none z-[2] shadow-lg border border-white/20">
                                  {formatDuration(videoStates[post.id].duration)}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Enhanced video info footer */}
                          <div className="relative mt-6 pt-6 border-t border-gray-200/60">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                {videoStates[post.id]?.duration && videoStates[post.id].duration > 0 && (
                                  <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-full border border-blue-200/60 shadow-sm">
                                    <Clock className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-semibold text-blue-700">
                                      {formatDuration(videoStates[post.id].duration)}
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2 rounded-full border border-purple-200/60 shadow-sm">
                                  <Eye className="w-4 h-4 text-purple-600" />
                                  <span className="text-sm font-semibold text-purple-700">Preview Mode</span>
                                </div>
                              </div>
                              <button 
                                onClick={() => {
                                  const videoUrl = post.video_url || post.videoUrl;
                                  if (videoUrl) handleFullscreen(videoUrl);
                                }}
                                className="group/btn bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                              >
                                <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                </svg>
                                View Fullscreen
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Enhanced expanded content */}
                    {expandedPost === post.id && (
                      <div className="border-t border-gray-200 pt-6 mt-6 space-y-4 animate-in slide-in-from-top-4 duration-500">
                        <div className="grid gap-4">
                          {/* Rejection Reason */}
                          {post.verification_status === 'rejected' && post.rejection_reason && (
                            <div className="bg-gradient-to-br from-red-50 via-rose-50 to-red-50 rounded-xl p-5 border border-red-200 shadow-sm">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-red-100 rounded-lg">
                                  <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <strong className="text-sm text-red-900 font-semibold">Rejection Reason</strong>
                              </div>
                              <p className="text-sm text-red-800 leading-relaxed">{post.rejection_reason}</p>
                            </div>
                          )}
                          
                          {/* Post Details */}
                          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 rounded-xl p-5 border border-blue-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Tag className="w-4 h-4 text-blue-600" />
                              </div>
                              <strong className="text-sm text-blue-900 font-semibold">Post Details</strong>
                            </div>
                            <div className="space-y-2 text-sm text-blue-800">
                              <div className="flex justify-between">
                                <span className="font-medium">Post ID:</span>
                                <span className="font-mono text-xs bg-blue-100 px-2 py-1 rounded">{post.id}</span>
                              </div>
                              {post.price_range && (
                                <div className="flex justify-between">
                                  <span className="font-medium">Price Range:</span>
                                  <span>{formatPrice(post.price_range)}</span>
                                </div>
                              )}
                              {post.reach && (
                                <div className="flex justify-between">
                                  <span className="font-medium">Target Reach:</span>
                                  <span>{post.reach.toLocaleString()} followers</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="font-medium">Created:</span>
                                <span>{formatDate(post.created_at || post.createdAt || '')}</span>
                              </div>
                              {post.updated_at && post.updated_at !== post.created_at && (
                                <div className="flex justify-between">
                                  <span className="font-medium">Last Updated:</span>
                                  <span>{formatDate(post.updated_at)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {post.requirements && (
                            <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 rounded-xl p-5 border border-amber-100 shadow-sm">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-amber-100 rounded-lg">
                                  <Users className="w-4 h-4 text-amber-600" />
                                </div>
                                <strong className="text-sm text-amber-900 font-semibold">Requirements</strong>
                              </div>
                              <p className="text-sm text-amber-800 leading-relaxed">{post.requirements}</p>
                            </div>
                          )}
                          
                          {post.deliverables && (
                            <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 rounded-xl p-5 border border-green-100 shadow-sm">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                  <Star className="w-4 h-4 text-green-600" />
                                </div>
                                <strong className="text-sm text-green-900 font-semibold">Deliverables</strong>
                              </div>
                              <p className="text-sm text-green-800 leading-relaxed">{post.deliverables}</p>
                            </div>
                          )}
                          
                          {post.imageUrl && (
                            <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-5 border border-gray-200 shadow-sm">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                                  <Video className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <strong className="text-sm text-gray-700 font-semibold">Preview Image</strong>
                                  <p className="text-xs text-gray-500">Thumbnail or cover image</p>
                                </div>
                              </div>
                              <div className="relative group/image bg-white rounded-xl p-3 border border-gray-200">
                                <img
                                  src={post.imageUrl}
                                  alt={post.title}
                                  className="w-56 h-56 object-cover rounded-xl shadow-md border border-gray-200 transition-all duration-300 group-hover/image:scale-105 group-hover/image:shadow-xl"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-xl opacity-0 group-hover/image:opacity-100 transition-opacity duration-300" />
                                
                                {/* Image overlay */}
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg opacity-0 group-hover/image:opacity-100 transition-opacity duration-300">
                                  <Eye className="w-3 h-3 text-gray-600" />
                                </div>
                              </div>
                              
                              {/* Image info */}
                              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Tag className="w-3 h-3" />
                                    Image Preview
                                  </span>
                                </div>
                                <button className="text-xs text-purple-600 hover:text-purple-700 font-medium hover:underline transition-colors">
                                  View Original
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced footer */}
                <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {post.engagement && post.engagement > 0 ? (
                      <span className="flex items-center gap-1.5 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 px-2 py-1 rounded-md border border-green-200">
                        <TrendingUp className="w-3 h-3" />
                        {post.engagement.toFixed(1)}% engagement
                      </span>
                    ) : null}
                    
                    {/* Verification Status in Footer */}
                    {(post.verification_status || post.is_verified) && (
                      <span className={`flex items-center gap-1.5 px-2 py-1 rounded-md border ${
                        post.is_verified || post.verification_status === 'approved' ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200' :
                        post.verification_status === 'pending' ? 'bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 border-yellow-200' :
                        post.verification_status === 'rejected' ? 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200' :
                        'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border-gray-200'
                      }`}>
                        {getVerificationIcon(post.verification_status || 'pending', post.is_verified || false)}
                        {post.is_verified || post.verification_status === 'approved' ? 'Verified Content' : 
                         post.verification_status === 'pending' ? 'Under Review' :
                         post.verification_status === 'rejected' ? 'Needs Revision' : 'Pending Review'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${
                        post.status === 'active' ? 'bg-green-400 animate-pulse' : 
                        post.status === 'paused' ? 'bg-yellow-400' : 'bg-blue-400'
                      }`} />
                      <span className="text-xs text-gray-600 font-semibold">
                        {post.status === 'active' ? 'Live & Discoverable' : 
                         post.status === 'paused' ? 'Temporarily Paused' : 'Completed'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Video Modal */}
      {fullscreenVideo && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[9999] p-4 fullscreen-modal"
          onClick={(e) => {
            // Close modal when clicking on backdrop
            if (e.target === e.currentTarget) {
              closeFullscreen();
            }
          }}
        >
          <div className="relative w-full h-full max-w-7xl flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={closeFullscreen}
              className="absolute top-6 right-6 z-10 bg-black/60 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/80 transition-all duration-200 shadow-lg"
              title="Close fullscreen (ESC)"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Fullscreen video container */}
            <div 
              className="relative w-full h-full max-h-[70vh] bg-black rounded-xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on video
            >
              <video
                src={fullscreenVideo}
                className="w-full h-full object-contain bg-black fullscreen-video"
                controls
                autoPlay
                onEnded={closeFullscreen}
                controlsList="nodownload"
              />
            </div>
            
            {/* Video info overlay */}
            <div 
              className="absolute bottom-6 left-6 right-6 bg-black/70 backdrop-blur-md text-white p-4 rounded-xl border border-white/10"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on info
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-1">Video Preview</h3>
                  <p className="text-sm text-gray-300">Press ESC, click outside, or click the X to close</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    Fullscreen Mode
                  </div>
                  <button
                    onClick={closeFullscreen}
                    className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
