import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { PlusCircle, BarChart3, Users, FileText, RefreshCw } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import emailjs from '@emailjs/browser';

// Import subcomponents and types
import StatCards from './StatCards';
import PostForm from './PostForm';
import PostList from './PostList';
import MatchList from './MatchList';
import AnalyticsView from './AnalyticsView';

import type { Database } from '../../../lib/database.types';

// Define a Post type that matches exactly what we get from the database
interface DatabasePost {
  id: string;
  influencer_id: string; // This is the actual field name in the database
  title: string;
  description: string;
  hashtags?: string | null;
  category_id: string;
  reach?: number | null;
  price_range?: string | null | { min: number; max: number }; // Handle both formats for backward compatibility
  video_url?: string | null;
  rejection_reason?: string | null;
  status: 'active' | 'paused' | 'completed';
  verification_status?: 'pending' | 'approved' | 'rejected' | null;
  created_at: string;
  updated_at: string;
  is_verified?: boolean | null;
}

type Profile = Database['public']['Tables']['profiles']['Row'];
type Category = { id: string; name: string; description?: string; created_at: string; updated_at: string; };
type Match = Database['public']['Tables']['matches']['Row'];

interface EnhancedMatch extends Match {
  profiles?: Profile;
  posts?: { title: string };
  post_id?: string;
  budget?: string;
  timeline?: string;
  requirements?: string;
}

export default function InfluencerDashboard() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<DatabasePost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [matches, setMatches] = useState<EnhancedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'matches' | 'analytics'>('overview');
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  useEffect(() => {
    if (EMAILJS_PUBLIC_KEY) {
      emailjs.init(EMAILJS_PUBLIC_KEY);
    }
  }, [EMAILJS_PUBLIC_KEY]);

  // Fetch functions
  const fetchCategories = async () => {
    const cachedCategories = localStorage.getItem('post_categories');
    if (cachedCategories) {
      setCategories(JSON.parse(cachedCategories));
      return;
    }
    const { data, error } = await supabase.from('post_categories').select('*').limit(100);
    if (error) {
      toast.error('Failed to load categories');
      return;
    }
    setCategories(data || []);
    localStorage.setItem('post_ categories', JSON.stringify(data || []));
  };

  const fetchPosts = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('influencer_id', user.id) // Use influencer_id as it exists in the database
      .order('created_at', { ascending: false });
    
    if (error) {
      toast.error('Failed to load posts');
      return;
    }
    setPosts(data || []);
  };

  const fetchMatches = async () => {
    if (!user) return;
    const { data: influencerPosts, error: postsError } = await supabase
      .from('posts')
      .select('id')
      .eq('influencer_id', user.id); // Use influencer_id as it exists in the database
    
    if (postsError) {
      toast.error('Failed to load matches');
      return;
    }
    
    if (!influencerPosts || influencerPosts.length === 0) {
      setMatches([]);
      return;
    }
    
    const postIds = influencerPosts.map((post: any) => post.id);
    const { data: matchesData, error: matchesError } = await supabase
      .from('matches')
      .select(`
        id,
        status,
        created_at,
        updated_at,
        opportunity_id,
        brand_id,
        meeting_link,
        meeting_scheduled_at,
        notes,
        profiles:brand_id (company_name, industry, contact_person_name, contact_person_phone, email),
        posts:opportunity_id (title)
      `)
      .in('opportunity_id', postIds)
      .order('created_at', { ascending: false });
    
    if (matchesError) {
      toast.error('Failed to load matches');
      return;
    }
    setMatches((matchesData as unknown as EnhancedMatch[]) || []);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchCategories(), fetchPosts(), fetchMatches()]);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  // Handle functions
  const handleCreatePost = async (postData: any) => {
    if (!user) return;
    setIsSubmitting(true);
    
    try {
      let videoUrl: string | undefined;

      if (postData.video_file) {
        const file = postData.video_file;
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const filePath = `posts/${user.id}/${fileName}`;
        
        const fileBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as ArrayBuffer);
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsArrayBuffer(file);
        });

        const { error } = await supabase.storage
          .from('media')
          .upload(filePath, fileBuffer, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type,
          });

        if (error) {
          throw new Error(`Failed to upload video: ${error.message}`);
        }

        const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(filePath);
        if (!publicUrlData.publicUrl) {
          throw new Error('Failed to generate public URL');
        }
        videoUrl = publicUrlData.publicUrl;
      }

      const postDataToInsert = {
        title: postData.title,
        description: postData.description,
        hashtags: postData.hashtags,
        category_id: postData.category_id,
        reach: postData.reach ?? null,
        price_range: postData.price_range || null, // Store as string, not object
        video_url: videoUrl || postData.video_url || null,
        status: postData.status || 'active',
        verification_status: 'pending',
        is_verified: false,
        influencer_id: user.id, // Use influencer_id as it exists in the database
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('posts')
        .insert([postDataToInsert])
        .select()
        .single();
      
      if (error) throw error;
      
      setPosts(prev => [data, ...prev]);
      toast.success('Post created successfully!');
      
      // Form will be closed by the PostForm component via onSuccess callback
    } catch (error: any) {
      toast.error(`Failed to create post: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPost = async (post: any) => {
    setShowForm(true);
    // TODO: Implement edit functionality
    console.log('Edit post:', post);
  };

  const handleDeletePost = async (postId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('influencer_id', user.id); // Use influencer_id as it exists in the database
      
      if (error) throw error;
      
      setPosts(prev => prev.filter(post => post.id !== postId));
      toast.success('Post deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const handleTogglePostStatus = async (postId: string, status: 'active' | 'paused') => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('posts')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', postId)
        .eq('influencer_id', user.id); // Use influencer_id as it exists in the database
      
      if (error) throw error;
      
      setPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, status } : post
      ));
      toast.success(`Post ${status === 'active' ? 'activated' : 'paused'} successfully!`);
    } catch (error) {
      toast.error('Failed to update post status');
    }
  };

  // Calculate statistics
  const stats = {
    totalPosts: posts.length,
    activePosts: posts.filter(post => post.status === 'active').length,
    pendingMatches: matches.filter(match => match.status === 'pending').length,
    acceptedMatches: matches.filter(match => match.status === 'accepted').length,
    rejectedMatches: matches.filter(match => match.status === 'rejected').length,
  };

  // Transform database posts to match PostList's expected Post interface
  const postsWithExtras = posts.map(post => {
    // Safely handle price_range conversion
    let price_range_safe;
    if (typeof post.price_range === 'object' && post.price_range && 'min' in post.price_range && 'max' in post.price_range) {
      price_range_safe = `$${post.price_range.min} - $${post.price_range.max}`;
    } else {
      price_range_safe = post.price_range;
    }
    
    return {
      ...post,
      // Add required category field
      category: categories.find(cat => cat.id === post.category_id)?.name || 'Unknown',
      // Add creator_id mapping from influencer_id for PostList compatibility
      creator_id: post.influencer_id,
      // Ensure price_range is safe for rendering
      price_range: price_range_safe,
      // Add legacy field mappings for backward compatibility
      videoUrl: post.video_url || undefined,
      createdAt: post.created_at,
      // Add calculated fields
      matchCount: matches.filter(match => match.opportunity_id === post.id).length,
    };
  });

  const transformedMatches = matches.map(match => ({
    id: match.id,
    brandName: match.profiles?.company_name || 'Unknown Brand',
    brandLogo: '',
    brandDescription: match.profiles?.industry || '',
    postTitle: match.posts?.title || 'Unknown Post',
    postId: match.opportunity_id,
    status: match.status as 'pending' | 'accepted' | 'rejected',
    matchedAt: match.created_at || '',
    message: match.notes || '',
    budget: match.budget || '',
    timeline: match.timeline || '',
    requirements: match.requirements || '',
    contact: {
      email: '',
      phone: match.profiles?.contact_person_phone || '',
      website: match.profiles?.website || '',
    },
    brandRating: 4.5, // Mock rating
  }));

  // Mock analytics data
  const analyticsData = {
    monthlyViews: [
      { month: 'Jan', views: 1500, engagements: 120 },
      { month: 'Feb', views: 2300, engagements: 180 },
      { month: 'Mar', views: 1800, engagements: 150 },
      { month: 'Apr', views: 2800, engagements: 240 },
      { month: 'May', views: 3200, engagements: 280 },
      { month: 'Jun', views: 2900, engagements: 260 },
    ],
    categoryPerformance: [
      { category: 'Fashion', posts: 12, matches: 8 },
      { category: 'Beauty', posts: 8, matches: 6 },
      { category: 'Lifestyle', posts: 15, matches: 10 },
      { category: 'Food', posts: 5, matches: 3 },
    ],
    engagementMetrics: {
      totalViews: 15500,
      totalLikes: 2350,
      totalComments: 480,
      totalShares: 125,
      avgEngagementRate: 18.5,
    },
    growthMetrics: {
      viewsGrowth: 12.5,
      matchesGrowth: 8.3,
      engagementGrowth: 15.2,
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">Influencer Dashboard</h1>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Create Post
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'posts', label: 'Posts', icon: FileText },
              { id: 'matches', label: 'Matches', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Post Form Modal */}
        {showForm && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 modal-backdrop">
            <style>{`
              .modal-backdrop {
                backdrop-filter: blur(12px) saturate(180%);
                background: linear-gradient(135deg, 
                  rgba(0, 0, 0, 0.4) 0%, 
                  rgba(30, 41, 59, 0.5) 25%,
                  rgba(15, 23, 42, 0.6) 75%,
                  rgba(0, 0, 0, 0.7) 100%);
                animation: premiumFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
              }
              
              @keyframes premiumFadeIn {
                from { 
                  opacity: 0; 
                  backdrop-filter: blur(0px);
                  transform: scale(1.05);
                }
                to { 
                  opacity: 1; 
                  backdrop-filter: blur(12px) saturate(180%);
                  transform: scale(1);
                }
              }
              
              .modal-backdrop::before {
                content: '';
                position: absolute;
                inset: 0;
                background: radial-gradient(circle at 50% 50%, 
                  rgba(99, 102, 241, 0.05) 0%, 
                  transparent 50%);
                animation: pulseOverlay 3s ease-in-out infinite;
              }
              
              @keyframes pulseOverlay {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 0.8; }
              }
            `}</style>
            <PostForm
              onSubmit={handleCreatePost}
              loading={isSubmitting}
              onClose={() => setShowForm(false)}
              categories={categories}
              onSuccess={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <StatCards {...stats} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Posts</h3>
                <div className="space-y-3">
                  {postsWithExtras.slice(0, 3).map(post => (
                    <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{post.title}</h4>
                        <p className="text-sm text-gray-600">{post.category}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        post.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Matches</h3>
                <div className="space-y-3">
                  {transformedMatches.slice(0, 3).map(match => (
                    <div key={match.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{match.brandName}</h4>
                        <p className="text-sm text-gray-600">{match.postTitle}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        match.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        match.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {match.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'posts' && (
          <PostList
            posts={postsWithExtras}
            onEdit={handleEditPost}
            onDelete={handleDeletePost}
            onToggleStatus={handleTogglePostStatus}
            isLoading={loading}
          />
        )}

        {activeTab === 'matches' && (
          <MatchList
            onRefresh={fetchData}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView data={analyticsData} />
        )}
      </div>
    </div>
  );
}
