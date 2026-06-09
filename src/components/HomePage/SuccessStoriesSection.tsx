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
    <section
      className="py-24 relative overflow-hidden"
      id="success"
      style={{ background: 'linear-gradient(180deg, #0D1F3C 0%, #0A1628 50%, #060D1F 100%)' }}
    >
      {/* Background elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(rgba(0,212,255,0.8) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.3) 0%, transparent 70%)', filter: 'blur(60px)' }}></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)', filter: 'blur(60px)' }}></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full text-sm font-medium" style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00D4FF' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Success Stories
          </div>
          
          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 leading-tight"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Success{' '}
            <span style={{ background: 'linear-gradient(90deg, #00D4FF, #6366F1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Stories</span>
          </h2>
          
          <p
            className="mt-4 max-w-2xl mx-auto text-lg text-gray-400 leading-relaxed"
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