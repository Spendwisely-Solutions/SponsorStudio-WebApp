import React, { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowUpRight, Clock, Users } from 'lucide-react';
import { SuccessStory as SuccessStoryType } from './Home';

interface MobileCardStackProps {
  stories: SuccessStoryType[];
  className?: string;
}

const MobileCardStack: React.FC<MobileCardStackProps> = ({ 
  stories, 
  className = '' 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Take first 5 stories for mobile layout
  const displayStories = stories.slice(0, 5);

  if (stories.length === 0) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <p className="text-text-muted">No stories available</p>
      </div>
    );
  }

  const nextStory = () => {
    setCurrentIndex((prev) => (prev + 1) % displayStories.length);
  };

  const prevStory = () => {
    setCurrentIndex((prev) => (prev - 1 + displayStories.length) % displayStories.length);
  };

  // Swipe detection
  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const handleDragEnd = (e: any, { offset, velocity }: PanInfo) => {
    const swipe = swipePower(offset.x, velocity.x);

    if (swipe < -swipeConfidenceThreshold || offset.x < -50) {
      nextStory(); // Swipe left = next story
    } else if (swipe > swipeConfidenceThreshold || offset.x > 50) {
      prevStory(); // Swipe right = previous story
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* Cards Container */}
      <div className="relative h-[450px] mx-4 mb-6">
        <motion.div
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.3}
          onDragEnd={handleDragEnd}
        >
        {displayStories.map((story, index) => {
          const offset = index - currentIndex;
          const isActive = index === currentIndex;
          
          return (
            <motion.div
              key={story.id}
              className="absolute inset-0"
              animate={{
                x: offset * 60,
                y: Math.abs(offset) * 8,
                scale: isActive ? 1 : 0.9,
                opacity: Math.abs(offset) > 2 ? 0 : 1 - Math.abs(offset) * 0.3,
                zIndex: displayStories.length - Math.abs(offset),
                rotateY: offset * -3,
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  ease: [0.23, 1, 0.320, 1]
                }
              }}
              style={{ 
                transformStyle: 'preserve-3d',
                perspective: '1000px'
              }}
            >
              {/* Card */}
              <div className="relative h-full bg-surface rounded-2xl shadow-lg overflow-hidden border border-border">
                {/* Header Image */}
                <div className="relative h-48">
                  <img
                    src={story.preview_image}
                    alt={story.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  
                  {/* Small Current Indicator - Only on active card */}
                  {isActive && (
                    <motion.div
                      className="absolute top-3 right-3"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                    >
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
                        <div className="w-2 h-2 bg-text-inverse rounded-full animate-pulse" />
                      </div>
                    </motion.div>
                  )}

                  {/* Play Button - Only on active card */}
                  {/* Removed play button as requested */}
                </div>

                {/* Content */}
                <div className="p-5 h-48 flex flex-col">
                  {/* Top Section - Meta + Title */}
                  <div className="flex-shrink-0">
                    {/* Meta Info */}
                    <div className="flex items-center gap-3 mb-3 text-xs text-text-muted">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>Story #{index + 1}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        <span>Featured</span>
                      </div>
                    </div>

                    {/* Title with 2 lines max */}
                    <h3 className={`font-bold text-text-primary mb-3 leading-tight transition-all duration-300 ${
                      isActive ? 'text-lg' : 'text-base'
                    }`}>
                      <span className="block line-clamp-2">
                        {story.title}
                      </span>
                    </h3>
                  </div>

                  {/* Middle Section - Description and Button (only for active cards) */}
                  <div className="flex-1 min-h-0">
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.4, ease: [0.23, 1, 0.320, 1] }}
                          className="h-full"
                        >
                          <p className="text-text-secondary text-sm leading-relaxed line-clamp-3 mb-4">
                            {story.preview_text}
                          </p>
                          
                          {/* Button directly after description */}
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.4 }}
                          >
                            <Link
                              to={`/stories/${story.id}`}
                              className="inline-flex items-center justify-center w-full bg-primary text-text-inverse font-semibold py-3 px-6 rounded-xl hover:bg-primary-hover transition-all duration-200 group text-sm"
                            >
                              Read Story
                              <ArrowUpRight className="ml-2 w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </Link>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Inactive card message */}
                  {!isActive && (
                    <div className="flex-1 flex items-center justify-center">
                      <span className="text-xs text-text-muted font-medium">Tap to view</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
        </motion.div>

        {/* Navigation Arrows */}
        <button
          onClick={prevStory}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 w-10 h-10 bg-surface rounded-full shadow-lg flex items-center justify-center z-20 border border-border hover:shadow-xl transition-all duration-200"
        >
          <ChevronLeft className="w-5 h-5 text-text-secondary" />
        </button>

        <button
          onClick={nextStory}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 w-10 h-10 bg-surface rounded-full shadow-lg flex items-center justify-center z-20 border border-border hover:shadow-xl transition-all duration-200"
        >
          <ChevronRight className="w-5 h-5 text-text-secondary" />
        </button>
      </div>

      {/* Progress Indicators */}
      <div className="flex justify-center items-center gap-1.5 mb-6">
        {displayStories.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'w-6 bg-primary' 
                : 'w-1.5 bg-surface-hover hover:bg-border'
            }`}
          />
        ))}
      </div>

      {/* Story Info */}
      <div className="text-center px-4">
        <p className="text-text-secondary text-sm mb-4">
          Story {currentIndex + 1} of {displayStories.length}
        </p>
        
        {stories.length > 5 && (
          <Link
            to="/story"
            className="inline-flex items-center text-primary hover:text-primary-hover font-semibold transition-colors duration-200 group text-sm"
          >
            View all {stories.length} stories
            <ChevronRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>
    </div>
  );
};

export default MobileCardStack;