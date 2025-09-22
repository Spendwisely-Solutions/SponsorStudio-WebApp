import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabase';
import { Calendar, Clock, ArrowLeft, Search, Filter, X, SortAsc, SortDesc, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import type { Database } from '../lib/database.types';

type BlogPost = Database['public']['Tables']['success_stories']['Row'];

function Blogs() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title-asc' | 'title-desc' | 'reading-time'>('newest');
  const [filterBy, setFilterBy] = useState<'all' | 'recent' | 'popular'>('all');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Clear search function
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSortBy('newest');
    setFilterBy('all');
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm || filterBy !== 'all' || sortBy !== 'newest';

  // Helper function to calculate reading time
  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const textLength = content.replace(/<[^>]*>/g, '').split(' ').length;
    const readingTime = Math.ceil(textLength / wordsPerMinute);
    return readingTime;
  };

  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    const strippedText = text.replace(/<[^>]*>/g, '').trim();
    return strippedText.length > maxLength 
      ? strippedText.substring(0, maxLength) + '...' 
      : strippedText;
  };

  // Fetch only blog posts
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data, error } = await supabase
          .from('success_stories')
          .select('*')
          .eq('is_blog', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBlogs(data || []);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Advanced filtering and sorting with useMemo for performance
  const filteredAndSortedBlogs = useMemo(() => {
    let filtered = [...blogs];

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(blog => 
        blog.title.toLowerCase().includes(searchLower) ||
        blog.preview_text?.toLowerCase().includes(searchLower) ||
        blog.content.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (filterBy === 'recent') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = filtered.filter(blog => new Date(blog.created_at) > thirtyDaysAgo);
    } else if (filterBy === 'popular') {
      // For now, we'll simulate popularity by content length
      // In a real app, you'd have view counts or likes
      filtered = filtered.filter(blog => blog.content.length > 1000);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'reading-time':
          const aReadTime = calculateReadingTime(a.content);
          const bReadTime = calculateReadingTime(b.content);
          return aReadTime - bReadTime;
        default:
          return 0;
      }
    });

    return filtered;
  }, [blogs, searchTerm, sortBy, filterBy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 overflow-x-hidden">
      <Helmet>
        <title>Blogs | Sponsor Studio</title>
        <meta name="description" content="Explore event highlights, behind-the-scenes content, and industry insights from the Sponsor Studio blog." />
        <meta property="og:title" content="Event Blogs | Sponsor Studio" />
        <meta property="og:description" content="Explore event highlights, behind-the-scenes content, and industry insights from the Sponsor Studio blog." />
        <meta property="og:url" content="https://www.sponsorstudio.in/blogs" />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-br from-blue-200/40 to-indigo-300/30 rounded-full blur-3xl animate-pulse" style={{animationDuration: '4s'}}></div>
        <div className="absolute bottom-0 right-1/4 w-56 h-56 sm:w-80 sm:h-80 bg-gradient-to-br from-purple-200/40 to-pink-300/30 rounded-full blur-3xl animate-pulse" style={{animationDuration: '6s', animationDelay: '2s'}}></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.8) 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          className="mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Back to Home Button */}
          <div className="mb-6 sm:mb-8">
            <Link 
              to="/"
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 group transition-colors text-sm sm:text-base"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Centered Content */}
          <div className="text-center">
            <div className="inline-flex items-center px-3 py-1.5 sm:px-4 mb-6 sm:mb-8 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
              <span className="flex h-2 w-2 rounded-full bg-purple-500 mr-2 animate-pulse"></span>
              <span className="text-xs sm:text-sm font-medium">Blogs</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 mb-4 sm:mb-6 px-4 pb-3">
              Blogs
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 leading-relaxed px-4">
              Discover inspiring stories, expert tips, and the latest updates from the Sponsor Studio blog.
            </p>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          className="mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Mobile: Search + Icon controls in same line */}
          <div className="flex sm:hidden items-center gap-2 mb-4">
            {/* Search Bar - takes available space */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {/* Filter Icon with indicator */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className={`relative p-2.5 rounded-lg border ${showMobileFilters ? 'bg-purple-100 border-purple-300 text-purple-600' : 'bg-white border-gray-200 text-gray-600'} hover:bg-purple-50 transition-colors`}
              title="Filters & Sort"
            >
              <Filter className="h-4 w-4" />
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full"></span>
              )}
            </button>

            {/* Reset button for mobile */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-gray-600 hover:text-gray-800 px-2 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                title="Reset filters"
              >
                Reset
              </button>
            )}
          </div>

          {/* Mobile: Expandable filter options */}
          <AnimatePresence>
            {showMobileFilters && (
              <motion.div
                className="sm:hidden mb-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Filter and Sort in 2-column grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <select
                      value={filterBy}
                      onChange={(e) => setFilterBy(e.target.value as 'all' | 'recent' | 'popular')}
                      className="w-full pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-lg bg-white/80 appearance-none cursor-pointer"
                    >
                      <option value="all">All Blogs</option>
                      <option value="recent">Recent</option>
                      <option value="popular">Popular</option>
                    </select>
                  </div>

                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                      className="w-full pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-lg bg-white/80 appearance-none cursor-pointer"
                    >
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                      <option value="title-asc">A-Z</option>
                      <option value="title-desc">Z-A</option>
                      <option value="reading-time">Quick Read</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Desktop: Full controls */}
          <div className="hidden sm:flex gap-3">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter */}
            <div className="relative w-48">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as 'all' | 'recent' | 'popular')}
                className="w-full pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm appearance-none cursor-pointer transition-all duration-200"
              >
                <option value="all">All Blogs</option>
                <option value="recent">Recent</option>
                <option value="popular">Popular</option>
              </select>
            </div>

            {/* Sort */}
            <div className="relative w-48">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                {sortBy === 'title-asc' || sortBy === 'title-desc' ? (
                  sortBy === 'title-asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm appearance-none cursor-pointer transition-all duration-200"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="title-asc">A-Z</option>
                <option value="title-desc">Z-A</option>
                <option value="reading-time">Quick Read</option>
              </select>
            </div>

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-3 py-2.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 whitespace-nowrap"
                title="Reset all filters"
              >
                Reset
              </button>
            )}
          </div>

          {/* Active Filters Display (both mobile and desktop) */}
          {hasActiveFilters && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-xs">
                  "{searchTerm.length > 15 ? searchTerm.substring(0, 15) + '...' : searchTerm}"
                  <button onClick={clearSearch} className="hover:text-purple-900">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filterBy !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs">
                  {filterBy === 'recent' ? 'Recent' : 'Popular'}
                </span>
              )}
              {sortBy !== 'newest' && (
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">
                  {sortBy === 'oldest' ? 'Oldest' : sortBy === 'title-asc' ? 'A-Z' : sortBy === 'title-desc' ? 'Z-A' : 'Quick'}
                </span>
              )}
            </div>
          )}
        </motion.div>

        {/* Blogs Count */}
        {!loading && (
          <motion.div
            className="mb-6 sm:mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <p className="text-gray-600 text-sm sm:text-base">
              {filteredAndSortedBlogs.length} {filteredAndSortedBlogs.length === 1 ? 'blog' : 'blogs'} found
              {searchTerm && ` for "${searchTerm}"`}
            </p>
          </motion.div>
        )}

        {/* Blogs Grid */}
        <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            // Loading Skeletons
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <Skeleton height={200} className="sm:!h-[240px]" />
                <div className="p-4 sm:p-6">
                  <Skeleton height={16} className="mb-2 sm:mb-3 sm:!h-[20px]" />
                  <Skeleton height={14} count={2} className="mb-3 sm:mb-4 sm:!h-[16px]" />
                  <div className="flex items-center justify-between">
                    <Skeleton width={60} height={14} className="sm:!w-[80px] sm:!h-[16px]" />
                    <Skeleton width={50} height={14} className="sm:!w-[60px] sm:!h-[16px]" />
                  </div>
                </div>
              </div>
            ))
          ) : filteredAndSortedBlogs.length === 0 ? (
            // No Results
            <div className="col-span-full text-center py-12 sm:py-16 px-4">
              <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12 sm:h-16 sm:w-16 mx-auto" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No blogs found</h3>
              <p className="text-gray-500 text-sm sm:text-base mb-4">
                {searchTerm ? `No blogs match "${searchTerm}"` : 'No blogs match your current filters'}
              </p>
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                <X className="h-4 w-4" />
                Clear All Filters
              </button>
            </div>
          ) : (
            // Blog Cards
            filteredAndSortedBlogs.map((blog, index) => (
              <motion.div
                key={blog.id}
                className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link to={`/blog/${blog.id}`} className="block h-full">
                  {/* Image */}
                  <div className="relative overflow-hidden">
                    <img
                      src={blog.preview_image}
                      alt={blog.title}
                      className="w-full h-40 sm:h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x240?text=No+Image';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-6">
                    {/* Date and Reading Time */}
                    <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>{new Date(blog.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>{calculateReadingTime(blog.content)} min read</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-purple-600 transition-colors line-clamp-2 leading-tight">
                      {blog.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 line-clamp-3 leading-relaxed text-sm sm:text-base">
                      {blog.preview_text || truncateText(blog.content, 120)}
                    </p>

                    {/* Read More */}
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                      <span className="text-purple-600 font-medium group-hover:text-purple-700 transition-colors text-sm sm:text-base">
                        Read More →
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>

        {/* Load More or Pagination could be added here in the future */}
      </div>
    </div>
  );
}

export default Blogs;
