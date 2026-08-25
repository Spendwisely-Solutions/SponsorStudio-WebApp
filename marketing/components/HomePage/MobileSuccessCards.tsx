import React, { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Play, ArrowUpRight, Star, Calendar, TrendingUp } from 'lucide-react';
import { SuccessStory as SuccessStoryType } from './Home';

interface MobileSuccessCardsProps {
  stories: SuccessStoryType[];
  className?: string;
}

const MobileSuccessCards: React.FC<MobileSuccessCardsProps> = ({ 
  stories, 
  className = '' 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Take first 6 stories for mobile layout
  const displayStories = stories.slice(0, 6);

  if (stories.length === 0) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <p className="text-gray-500">No stories available</p>
      </div>
    );
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.8,
    })
  };

  const swipeConfidenceThreshold = 8000; // Reduced for easier swiping
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      if (newDirection === 1) {
        return prevIndex === displayStories.length - 1 ? 0 : prevIndex + 1;
      } else {
        return prevIndex === 0 ? displayStories.length - 1 : prevIndex - 1;
      }
    });
  };

  const handleDragEnd = (e: any, { offset, velocity }: PanInfo) => {
    const swipe = swipePower(offset.x, velocity.x);

    // More sensitive swipe detection for mobile
    if (swipe < -swipeConfidenceThreshold || offset.x < -50) {
      paginate(1);
    } else if (swipe > swipeConfidenceThreshold || offset.x > 50) {
      paginate(-1);
    }
  };

  const currentStory = displayStories[currentIndex];

  return (
    <div className={`relative w-full ${className}`}>
      {/* Main Card Container */}
      <div className="relative h-[500px] mx-3 mb-6 sm:mx-4 sm:mb-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 25,
              mass: 0.8,
              ease: [0.23, 1, 0.320, 1]
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.3}
            dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 cursor-grab active:cursor-grabbing select-none"
          >
            {/* Card Content */}
            <div className="relative h-full bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl overflow-hidden border border-gray-100">
              {/* Hero Image Section */}
              <div className="relative h-56 sm:h-64">
                <motion.img
                  src={currentStory.preview_image}
                  alt={currentStory.title}
                  className="w-full h-full object-cover"
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.8, ease: [0.23, 1, 0.320, 1] }}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                
                {/* Top Badge */}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                  <motion.div
                    className="inline-flex items-center px-2.5 py-1 sm:px-3 sm:py-1.5 bg-white/25 backdrop-blur-sm rounded-full border border-white/20"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <Star className="w-3 h-3 text-yellow-400 mr-1 fill-current" />
                    <span className="text-white text-xs font-semibold">Featured</span>
                  </motion.div>
                </div>

                {/* Play Button */}
                <motion.button
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 sm:w-16 sm:h-16 bg-white/25 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 touch-manipulation"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
                >
                  <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white ml-0.5" fill="currentColor" />
                </motion.button>
              </div>

              {/* Content Section */}
              <div className="p-4 sm:p-6 flex flex-col h-44 sm:h-48">
                {/* Meta Information */}
                <motion.div
                  className="flex items-center gap-4 mb-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Story #{currentIndex + 1}</span>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>Success Story</span>
                  </div>
                </motion.div>

                {/* Title */}
                <motion.h3
                  className="text-xl font-bold text-gray-900 mb-3 leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  {currentStory.title}
                </motion.h3>

                {/* Description */}
                <motion.p
                  className="text-gray-600 text-sm leading-relaxed mb-6 flex-1 line-clamp-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  {currentStory.preview_text}
                </motion.p>

                {/* Action Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <Link
                    href={`/stories/${currentStory.id}`}
                    className="inline-flex items-center justify-center w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-2xl hover:bg-blue-700 transition-all duration-200 ease-[cubic-bezier(0.23,1,0.320,1)] group"
                  >
                    Read Full Story
                    <ArrowUpRight className="ml-2 w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows - Mobile Optimized */}
        <motion.button
          className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/95 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center z-10 border border-gray-200/50 touch-manipulation active:scale-95"
          onClick={() => paginate(-1)}
          whileHover={{ scale: 1.05, x: -2 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
        </motion.button>

        <motion.button
          className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/95 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center z-10 border border-gray-200/50 touch-manipulation active:scale-95"
          onClick={() => paginate(1)}
          whileHover={{ scale: 1.05, x: 2 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
        </motion.button>
      </div>

      {/* Pagination Dots - Enhanced for Mobile */}
      <div className="flex justify-center items-center gap-2 mb-4 sm:mb-6">
        {displayStories.map((_, index) => (
          <motion.button
            key={index}
            className={`h-2 rounded-full transition-all duration-300 touch-manipulation ${
              index === currentIndex 
                ? 'w-6 sm:w-8 bg-blue-600 shadow-md' 
                : 'w-2 bg-gray-300 hover:bg-gray-400 active:bg-gray-500'
            }`}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
            }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            style={{ minHeight: '44px', minWidth: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <div className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'w-6 sm:w-8 bg-blue-600' 
                : 'w-2 bg-gray-300'
            }`} />
          </motion.button>
        ))}
      </div>

      {/* Story Count & CTA */}
      <motion.div
        className="text-center px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <p className="text-gray-600 text-sm mb-4">
          Showing {currentIndex + 1} of {displayStories.length} featured stories
        </p>
        
        {stories.length > 6 && (
          <Link
            href="/stories"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200 group"
          >
            View all {stories.length} stories
            <ChevronRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </motion.div>

      {/* Swipe Indicator */}
      <motion.div
        className="flex justify-center mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <div className="flex items-center gap-2 text-gray-400 text-xs">
          <motion.div
            className="w-4 h-0.5 bg-gray-300 rounded-full"
            animate={{
              x: [-8, 8, -8],
              transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          />
          <span>Swipe to explore</span>
          <motion.div
            className="w-4 h-0.5 bg-gray-300 rounded-full"
            animate={{
              x: [8, -8, 8],
              transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default MobileSuccessCards;