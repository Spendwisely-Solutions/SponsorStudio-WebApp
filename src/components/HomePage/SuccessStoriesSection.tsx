import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import SuccessStoryCard from './SuccessStoryCard';
import { SuccessStory as SuccessStoryType } from '../../App';
import AOS from 'aos';
import 'aos/dist/aos.css'; // Import AOS styles
import { ArrowRight } from 'lucide-react';

interface SuccessStoriesSectionProps {
  loading: boolean;
  successStories: SuccessStoryType[];
}

const SuccessStoriesSection: React.FC<SuccessStoriesSectionProps> = ({
  loading,
  successStories,
}) => {
  // Initialize AOS with enhanced settings
  useEffect(() => {
    AOS.init({
      duration: 800, // Slightly longer animation duration for smoother effect
      once: true, // Animate every time the element enters the viewport
      offset: 100, // Trigger animation earlier
      easing: 'ease-out-cubic', // Smoother easing function
      mirror: true // Animations can be triggered when scrolling back up
    });

    // Refresh AOS after stories are loaded
    const timer = setTimeout(() => {
      AOS.refresh();
    }, 100);

    return () => clearTimeout(timer);
  }, [successStories]);

  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden" id="success">
      {/* Enhanced background elements to match hero section */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-200/40 to-indigo-300/30 rounded-full blur-3xl animate-pulse" style={{animationDuration: '4s'}}></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-br from-purple-200/40 to-pink-300/30 rounded-full blur-3xl animate-pulse" style={{animationDuration: '6s', animationDelay: '2s'}}></div>
        
        {/* Floating geometric shapes removed for a cleaner look */}
        
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.8) 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-1.5 mb-8 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
            <span className="text-sm font-medium">Event Blogs & Stories</span>
          </div>
          
          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Success Stories
          </h2>
          
          {/* Blog categories strip */}
          <div className="flex flex-wrap gap-3 justify-center mt-8 mb-10">
            <div className="feature-badge flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-full border border-blue-200/50 shadow-sm">
              <span className="text-sm font-medium text-blue-800">Event Highlights</span>
            </div>
            <div className="feature-badge flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-full border border-green-200/50 shadow-sm">
              <span className="text-sm font-medium text-green-800">Sponsorship Stories</span>
            </div>
            <div className="feature-badge flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2 rounded-full border border-purple-200/50 shadow-sm">
              <span className="text-sm font-medium text-purple-800">Behind The Scenes</span>
            </div>
          </div>
          
          <p
            className="mt-6 max-w-2xl mx-auto text-xl sm:text-2xl text-gray-600 leading-relaxed font-light"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            Engaging stories showcasing exciting events, successful partnerships, and memorable moments.
          </p>
        </div>
        <div className="grid gap-8 lg:gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col rounded-xl shadow-lg overflow-hidden bg-white/80 backdrop-blur-sm">
                <div className="relative">
                  <Skeleton height={240} />
                  <div className="absolute top-4 left-4 z-10">
                    <Skeleton width={100} height={24} className="rounded-full" />
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-center mb-4">
                    <Skeleton width={12} height={12} className="rounded-full" />
                    <Skeleton width={60} height={16} className="ml-2" />
                  </div>
                  <Skeleton width="90%" height={32} className="mb-4" />
                  <Skeleton count={2} height={20} className="mb-3" />
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <Skeleton width={140} height={36} className="rounded-full" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            successStories.slice(0, 3).map((story, index) => {
              const delay = index * 150; // Increased delay between cards for better staggering effect
              const animationType = ['fade-up', 'zoom-in-up', 'fade-right'][index % 3]; // Different animation types
              const storyNumber = index + 1; // Start numbering from 1
              
              return (
                <SuccessStoryCard
                  key={story.id}
                  story={story}
                  storyNumber={storyNumber}
                  data-aos={animationType}
                  data-aos-delay={delay.toString()}
                  hoverClassName="hover:scale-105 hover:shadow-xl hover:-translate-y-1 will-change-transform backface-hidden"
                />
              );
            })
          )}
        </div>
        {successStories.length > 3 && (
          <div
            className="mt-20 text-center"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            <Link
              to="/story"
              className="group inline-flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              View All Stories
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            
            <p className="mt-4 text-gray-600 text-sm">
              {successStories.length} event blogs available
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default SuccessStoriesSection;