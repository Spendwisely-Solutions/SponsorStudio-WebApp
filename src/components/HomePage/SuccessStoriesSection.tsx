import React, { useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import SuccessStoryCard from './SuccessStoryCard';
import { SuccessStory as SuccessStoryType } from '../../App';
import AOS from 'aos';
import 'aos/dist/aos.css'; // Import AOS styles

interface SuccessStoriesSectionProps {
  loading: boolean;
  successStories: SuccessStoryType[];
  showAllStories: boolean;
  setShowAllStories: (value: boolean) => void;
}

const SuccessStoriesSection: React.FC<SuccessStoriesSectionProps> = ({
  loading,
  successStories,
  showAllStories,
  setShowAllStories,
}) => {
  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 600, // Animation duration in milliseconds
      once: false, // Animate every time the element enters the viewport
      offset: 50, // Trigger animation 50px before the element enters the viewport
    });
    console.log("SuccessStoriesSection mounted with AOS initialized at", new Date().toISOString());

    // Delay AOS.refresh to ensure cards are rendered
    const timer = setTimeout(() => {
      console.log("Refreshing AOS after delay");
      AOS.refresh();
    }, 100);

    return () => clearTimeout(timer);
  }, [successStories, showAllStories]);

  return (
    <section className="py-20 bg-white" id="success">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2
            className="text-4xl sm:text-3xl md:text-4xl font-extrabold text-gray-900"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Success Stories
          </h2>
          <p
            className="mt-4 text-xl sm:text-lg text-gray-600"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            Read about successful partnerships formed through our platform
          </p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col rounded-lg shadow-lg bg-white">
                <Skeleton height={192} />
                <div className="p-6">
                  <Skeleton width="80%" height={24} className="mb-3" />
                  <Skeleton count={2} height={16} className="mb-2" />
                  <Skeleton width={100} height={16} />
                </div>
              </div>
            ))
          ) : (
            (showAllStories ? successStories : successStories.slice(0, 3)).map((story, index) => {
              const delay = index * 100;
              console.log(`Rendering card ${story.id} with AOS zoom-in-up, delay ${delay}ms at`, new Date().toISOString());
              return (
                <SuccessStoryCard
                  key={story.id}
                  story={story}
                  data-aos="zoom-in-up"
                  data-aos-delay={delay.toString()}
                  hoverClassName="hover:scale-105 hover:shadow-xl will-change-transform backface-hidden"
                />
              );
            })
          )}
        </div>
        {successStories.length > 3 && (
          <div
            className="mt-10 text-center"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            <button
              onClick={() => setShowAllStories(!showAllStories)}
              className="inline-flex items-center px-6 py-3 border border-[#2B4B9B] text-[#2B4B9B] rounded-full hover:bg-[#2B4B9B] hover:text-white text-lg sm:text-base will-change-transform"
            >
              {showAllStories ? 'Show Less' : 'View All Stories'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default SuccessStoriesSection;