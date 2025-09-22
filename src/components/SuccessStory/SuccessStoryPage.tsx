import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../../lib/supabase';
import { Calendar, Clock, ArrowLeft, ArrowRight, ChevronUp, Share2, Facebook, Twitter, Linkedin, Link2, Copy } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type SuccessStory = Database['public']['Tables']['success_stories']['Row'];

export default function SuccessStoryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [story, setStory] = useState<SuccessStory | null>(null);
  const [relatedStories, setRelatedStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Helper function to strip HTML tags and create description
  const createMetaDescription = (content: string) => {
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    return textContent.length > 160 ? textContent.substring(0, 157) + '...' : textContent;
  };

  // Helper function to calculate reading time
  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const textLength = content.replace(/<[^>]*>/g, '').split(' ').length;
    const readingTime = Math.ceil(textLength / wordsPerMinute);
    return readingTime;
  };

  // Share functionality
  const getCurrentUrl = () => {
    return window.location.href;
  };

  const shareToFacebook = () => {
    const url = encodeURIComponent(getCurrentUrl());
    const quote = encodeURIComponent(story?.title || '');
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`, '_blank', 'width=600,height=400');
  };

  const shareToTwitter = () => {
    const url = encodeURIComponent(getCurrentUrl());
    const text = encodeURIComponent(`${story?.title || ''} - ${createMetaDescription(story?.content || '')}`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}&hashtags=SponsorStudio,SuccessStory`, '_blank', 'width=600,height=400');
  };

  const shareToLinkedIn = () => {
    const url = encodeURIComponent(getCurrentUrl());
    const title = encodeURIComponent(story?.title || '');
    const summary = encodeURIComponent(createMetaDescription(story?.content || ''));
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`, '_blank', 'width=600,height=400');
  };

  const shareToWhatsApp = () => {
    const url = encodeURIComponent(getCurrentUrl());
    const text = encodeURIComponent(`*${story?.title || ''}*\n\n${createMetaDescription(story?.content || '')}\n\nRead more:`);
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getCurrentUrl());
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const toggleShareMenu = async () => {
    // Try native sharing on mobile devices first
    if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: story?.title || 'Sponsor Studio Success Story',
          text: createMetaDescription(story?.content || ''),
          url: getCurrentUrl(),
        });
        return;
      } catch (err) {
        // Fall back to custom share menu if native sharing fails
        console.log('Native sharing failed, using custom menu');
      }
    }
    
    setShowShareMenu(!showShareMenu);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const shareButton = document.getElementById('share-button');
      const shareMenu = document.getElementById('share-menu');
      
      if (shareButton && shareMenu && 
          !shareButton.contains(event.target as Node) && 
          !shareMenu.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };

    if (showShareMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showShareMenu]);

  useEffect(() => {
    async function fetchStoryAndRelated() {
      if (!id) return;

      try {
        // Fetch current story
        const { data: storyData, error: storyError } = await supabase
          .from('success_stories')
          .select('*')
          .eq('id', id)
          .single();

        if (storyError || !storyData) {
          setLoading(false);
          return;
        }

        // Fetch related content based on current content type (excluding current story)
        const { data: relatedData } = await supabase
          .from('success_stories')
          .select('*')
          .neq('id', id)
          .eq('is_blog', storyData.is_blog || false) // Match the same content type
          .order('created_at', { ascending: false })
          .limit(6);

        setStory(storyData);
        setRelatedStories(relatedData || []);
      } catch (error) {
        console.error('Error fetching story data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStoryAndRelated();
  }, [id]);

  // Handle scroll to top functionality
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Handle navigation to other stories with scroll to top
  const handleStoryNavigation = (storyId: string) => {
    // Scroll to top immediately before navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Small delay to ensure smooth scrolling starts before navigation
    setTimeout(() => {
      navigate(`${individualLinkPrefix}/${storyId}`);
    }, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2B4B9B]"></div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Content not found</h1>
          <p className="text-gray-600">The content you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  // Determine content type for dynamic UI
  const isCurrentBlog = (story as any).is_blog;
  const contentTypePluralCapital = isCurrentBlog ? 'Blogs' : 'Stories';
  const viewAllLink = isCurrentBlog ? '/blogs' : '/stories';
  const individualLinkPrefix = isCurrentBlog ? '/blog' : '/stories';

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{story.title} | Sponsor Studio</title>
        <meta name="description" content={createMetaDescription(story.content)} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://www.sponsorstudio.in${individualLinkPrefix}/${story.id}`} />
        <meta property="og:title" content={story.title} />
        <meta property="og:description" content={createMetaDescription(story.content)} />
        <meta property="og:image" content={story.preview_image} />
        <meta property="og:site_name" content="Sponsor Studio" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={`https://www.sponsorstudio.in${individualLinkPrefix}/${story.id}`} />
        <meta name="twitter:title" content={story.title} />
        <meta name="twitter:description" content={createMetaDescription(story.content)} />
        <meta name="twitter:image" content={story.preview_image} />
        
        {/* Article specific */}
        <meta property="article:published_time" content={story.created_at} />
        <meta property="article:author" content="Sponsor Studio" />
        <meta property="article:section" content={isCurrentBlog ? "Event Blogs" : "Success Stories"} />
        
        {/* Additional SEO */}
        <meta name="keywords" content={`sponsor studio, ${isCurrentBlog ? 'event blogs, behind the scenes' : 'success stories, brand partnerships'}, event sponsorship`} />
        <meta name="author" content="Sponsor Studio" />
        <link rel="canonical" href={`https://www.sponsorstudio.in${individualLinkPrefix}/${story.id}`} />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-[#2B4B9B] hover:text-[#1a2f61] mb-6 group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back</span>
        </button>

        {/* Main Layout with Sidebar */}
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 xl:max-w-4xl">
            {/* Thumbnail Image */}
            <div className="mb-6">
              <img
                src={story.preview_image}
                alt={story.title}
                className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-xl shadow-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=No+Image';
                }}
              />
            </div>

            {/* Date, Reading Time, and Share */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-gray-600 mb-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Published: {new Date(story.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{calculateReadingTime(story.content)} min read</span>
                </div>
              </div>
              
              {/* Share Button */}
              <div className="relative sm:ml-auto">
                <button
                  id="share-button"
                  onClick={toggleShareMenu}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#2B4B9B] text-white rounded-lg hover:bg-[#1a2f61] transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>

                {/* Share Menu */}
                {showShareMenu && (
                  <div 
                    id="share-menu"
                    className="absolute right-0 sm:right-0 -left-32 sm:left-auto mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                  >
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Share this story</h4>
                      <div className="space-y-2">
                        {/* Facebook */}
                        <button
                          onClick={shareToFacebook}
                          className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                            <Facebook className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-gray-700">Facebook</span>
                        </button>

                        {/* Twitter */}
                        <button
                          onClick={shareToTwitter}
                          className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center mr-3">
                            <Twitter className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-gray-700">Twitter</span>
                        </button>

                        {/* LinkedIn */}
                        <button
                          onClick={shareToLinkedIn}
                          className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center mr-3">
                            <Linkedin className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-gray-700">LinkedIn</span>
                        </button>

                        {/* WhatsApp */}
                        <button
                          onClick={shareToWhatsApp}
                          className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                            <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.087z"/>
                            </svg>
                          </div>
                          <span className="text-gray-700">WhatsApp</span>
                        </button>

                        {/* Copy Link */}
                        <button
                          onClick={copyToClipboard}
                          className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mr-3">
                            {copySuccess ? (
                              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <Link2 className="h-4 w-4 text-white" />
                            )}
                          </div>
                          <span className="text-gray-700">
                            {copySuccess ? 'Copied!' : 'Copy Link'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Blog Content */}
            <div 
              className="prose prose-lg max-w-none prose-headings:text-[#2B4B9B] prose-headings:font-semibold prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-[#2B4B9B] prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-blockquote:border-l-[#2B4B9B] prose-blockquote:bg-blue-50 prose-blockquote:rounded-r-lg prose-blockquote:px-6 prose-blockquote:py-4 prose-img:rounded-xl prose-img:shadow-lg prose-pre:bg-gray-900 prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-table:border-gray-200" 
              dangerouslySetInnerHTML={{ __html: story.content }} 
            />

            {/* Share Section After Content */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Enjoyed this story?</h3>
                  <p className="text-gray-600">Share it with your network!</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={shareToFacebook}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Facebook className="h-4 w-4" />
                    <span>Facebook</span>
                  </button>
                  <button
                    onClick={shareToTwitter}
                    className="flex items-center space-x-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                  >
                    <Twitter className="h-4 w-4" />
                    <span>Twitter</span>
                  </button>
                  <button
                    onClick={shareToLinkedIn}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                  >
                    <Linkedin className="h-4 w-4" />
                    <span>LinkedIn</span>
                  </button>
                  <button
                    onClick={shareToWhatsApp}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.087z"/>
                    </svg>
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    {copySuccess ? (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span>{copySuccess ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile: Related Stories - Horizontal Scroll */}
            {relatedStories.length > 0 && (
              <div className="xl:hidden mt-12 pt-8 border-t border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">More {contentTypePluralCapital}</h3>
                  <Link 
                    to={viewAllLink} 
                    className="text-sm text-[#2B4B9B] hover:text-[#1a2f61] font-medium inline-flex items-center gap-1 group"
                  >
                    View All
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>

                {/* Horizontal Scrollable Cards */}
                <div className="overflow-x-auto pb-4">
                  <div className="flex gap-4 w-max">
                    {relatedStories.slice(0, 6).map((relatedStory) => (
                      <button
                        key={relatedStory.id}
                        onClick={() => handleStoryNavigation(relatedStory.id)}
                        className="group block flex-shrink-0"
                      >
                        <div className="w-64 bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                          <img
                            src={relatedStory.preview_image}
                            alt={relatedStory.title}
                            className="w-full h-40 object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/256x160?text=No+Image';
                            }}
                          />
                          <div className="p-4">
                            <h4 className="font-semibold text-base text-gray-900 group-hover:text-[#2B4B9B] line-clamp-2 leading-tight mb-3 text-left">
                              {relatedStory.title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(relatedStory.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}</span>
                              <span>•</span>
                              <Clock className="h-3 w-3" />
                              <span>{calculateReadingTime(relatedStory.content)} min</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scroll indicator */}
                <div className="text-center mt-4">
                  <p className="text-xs text-gray-500">← Scroll to see more →</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Desktop Only */}
          <aside className="hidden xl:block xl:w-80 xl:sticky xl:top-8 xl:self-start">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">More {contentTypePluralCapital}</h3>
                <Link 
                  to={viewAllLink} 
                  className="text-sm text-[#2B4B9B] hover:text-[#1a2f61] font-medium inline-flex items-center gap-1 group"
                >
                  View All
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <div className="space-y-6">
                {relatedStories.slice(0, 4).map((relatedStory) => (
                  <button
                    key={relatedStory.id}
                    onClick={() => handleStoryNavigation(relatedStory.id)}
                    className="group block w-full text-left"
                  >
                    <div className="flex gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors min-h-[120px]">
                      <img
                        src={relatedStory.preview_image}
                        alt={relatedStory.title}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x80?text=No+Image';
                        }}
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <h4 className="font-semibold text-base text-gray-900 group-hover:text-[#2B4B9B] line-clamp-3 leading-tight mb-3 text-left">
                          {relatedStory.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-auto">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(relatedStory.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}</span>
                          <span>•</span>
                          <Clock className="h-3 w-3" />
                          <span>{calculateReadingTime(relatedStory.content)} min</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {relatedStories.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No other {contentTypePluralCapital.toLowerCase()} available</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 bg-[#2B4B9B] hover:bg-[#1a2f61] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          title="Scroll to top"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}