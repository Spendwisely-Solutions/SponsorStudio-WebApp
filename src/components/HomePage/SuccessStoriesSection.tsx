import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import DesktopHoverCards from './DesktopHoverCards';
import MobileCardStack from './MobileCardStack';
import { SuccessStory as SuccessStoryType } from './Home';
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
  // Filter out blog stories - only show success stories
  const filteredStories = successStories.filter(story => !story.is_blog);
  
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
            <span className="text-sm font-medium">Success Stories</span>
          </div>
          
          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Success Stories
          </h2>
          
          <p
            className="mt-6 max-w-2xl mx-auto text-xl sm:text-2xl text-gray-600 leading-relaxed font-light"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            Engaging stories showcasing exciting events, successful partnerships, and memorable moments.
          </p>
        </div>
        
        {/* Responsive Cards */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gray-100 text-gray-500 rounded-2xl border border-gray-200">
              <div className="w-5 h-5 bg-gray-300 rounded animate-pulse"></div>
              <span className="font-medium">Loading stories...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop View (lg and above) */}
            <div className="hidden lg:block">
              <DesktopHoverCards 
                stories={filteredStories} 
                className="w-full"
              />
            </div>
            
            {/* Mobile/Tablet View (below lg) */}
            <div className="block lg:hidden">
              <MobileCardStack 
                stories={filteredStories} 
                className="w-full"
              />
            </div>
          </>
        )}
        
        
      </div>
    </section>
  );
};

export default SuccessStoriesSection;