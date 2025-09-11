import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabase';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import type { Database } from '../lib/database.types';

type SuccessStory = Database['public']['Tables']['success_stories']['Row'];

export default function SuccessStoryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [story, setStory] = useState<SuccessStory | null>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    async function fetchStory() {
      if (!id) return;

      const { data: storyData, error: storyError } = await supabase
        .from('success_stories')
        .select('*')
        .eq('id', id)
        .single();

      if (storyError || !storyData) {
        return;
      }

      setStory(storyData);
      setLoading(false);
    }

    fetchStory();
  }, [id]);

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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Story not found</h1>
          <p className="text-gray-600">The blog post you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{story.title} | Sponsor Studio</title>
        <meta name="description" content={createMetaDescription(story.content)} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://www.sponsorstudio.in/story/${story.id}`} />
        <meta property="og:title" content={story.title} />
        <meta property="og:description" content={createMetaDescription(story.content)} />
        <meta property="og:image" content={story.preview_image} />
        <meta property="og:site_name" content="Sponsor Studio" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={`https://www.sponsorstudio.in/story/${story.id}`} />
        <meta name="twitter:title" content={story.title} />
        <meta name="twitter:description" content={createMetaDescription(story.content)} />
        <meta name="twitter:image" content={story.preview_image} />
        
        {/* Article specific */}
        <meta property="article:published_time" content={story.created_at} />
        <meta property="article:author" content="Sponsor Studio" />
        <meta property="article:section" content="Success Stories" />
        
        {/* Additional SEO */}
        <meta name="keywords" content="sponsor studio, success stories, brand partnerships, event sponsorship" />
        <meta name="author" content="Sponsor Studio" />
        <link rel="canonical" href={`https://www.sponsorstudio.in/story/${story.id}`} />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-[#2B4B9B] hover:text-[#1a2f61] mb-6 group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back</span>
        </button>

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

        {/* Date and Reading Time */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
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

        {/* Blog Content */}
        <div 
          className="prose prose-lg max-w-none prose-headings:text-[#2B4B9B] prose-headings:font-semibold prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-[#2B4B9B] prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-blockquote:border-l-[#2B4B9B] prose-blockquote:bg-blue-50 prose-blockquote:rounded-r-lg prose-blockquote:px-6 prose-blockquote:py-4 prose-img:rounded-xl prose-img:shadow-lg prose-pre:bg-gray-900 prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-table:border-gray-200" 
          dangerouslySetInnerHTML={{ __html: story.content }} 
        />
      </div>
    </div>
  );
}