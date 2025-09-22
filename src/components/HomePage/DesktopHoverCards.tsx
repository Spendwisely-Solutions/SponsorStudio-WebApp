import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, Play, ArrowUpRight } from 'lucide-react';
import { SuccessStory as SuccessStoryType } from './Home';

interface DesktopHoverCardsProps {
  stories: SuccessStoryType[];
  className?: string;
}

const DesktopHoverCards: React.FC<DesktopHoverCardsProps> = ({ 
  stories, 
  className = '' 
}) => {
  const [activeCard, setActiveCard] = useState<number>(1); // Second card is active by default (index 1)

  // Take first 4 stories for desktop layout
  const displayStories = stories.slice(0, 4);

  if (stories.length === 0) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <p className="text-gray-500">No stories available</p>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      <motion.div 
        className="flex gap-2 h-[500px] max-w-7xl mx-auto"
        layout
        transition={{
          layout: {
            type: "spring",
            stiffness: 400,
            damping: 40,
            mass: 0.8,
            duration: 0.5,
            ease: [0.23, 1, 0.320, 1] // easeOutQuart for buttery smoothness
          }
        }}
      >
        {displayStories.map((story, index) => {
          const isActive = activeCard === index;
          const isAnyHovered = activeCard !== 1; // Check if any card other than default is being hovered
          
          return (
            <motion.div
              key={story.id}
              className="relative overflow-hidden cursor-pointer group rounded-2xl shadow-lg will-change-transform" // Added performance optimization
              onHoverStart={() => setActiveCard(index)}
              // Removed onHoverEnd - card stays active until another card is hovered
              layout
              transition={{
                layout: {
                  type: "spring",
                  stiffness: 350,
                  damping: 35,
                  mass: 0.9,
                  duration: 0.7,
                  delay: index * 0.06, // Reduced delay for smoother cascade
                  ease: [0.23, 1, 0.320, 1] // easeOutQuart
                }
              }}
              animate={{
                flex: isActive ? '2' : '1',
                transition: {
                  type: "spring",
                  stiffness: 350,
                  damping: 35,
                  mass: 0.9,
                  duration: 0.7,
                  delay: index * 0.05, // Slightly faster flex changes
                  ease: [0.23, 1, 0.320, 1]
                }
              }}
            >
              {/* Background Image */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden">
                <motion.img
                  src={story.preview_image}
                  alt={story.title}
                  className="w-full h-full object-cover will-change-transform"
                  animate={{
                    scale: isActive ? 1.05 : 1.1,
                    transition: {
                      type: "spring",
                      stiffness: 300,
                      damping: 40,
                      mass: 1,
                      ease: [0.23, 1, 0.320, 1]
                    }
                  }}
                />
                
                {/* Overlay gradients */}
                <motion.div 
                  className="absolute inset-0"
                  animate={{
                    background: isActive 
                      ? 'linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.4), rgba(0,0,0,0.2))'
                      : isAnyHovered
                      ? 'rgba(0,0,0,0.7)'
                      : 'linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0.2), transparent)',
                    transition: {
                      duration: 0.6,
                      ease: [0.23, 1, 0.320, 1]
                    }
                  }}
                />
              </div>

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-end p-8">
                {/* Always visible content */}
                <motion.div 
                  className="mb-4"
                  animate={{
                    marginBottom: isActive ? '1.5rem' : '1rem',
                    transition: {
                      duration: 0.5,
                      delay: index * 0.03,
                      ease: [0.23, 1, 0.320, 1]
                    }
                  }}
                >
                  {/* Company/Brand logo area */}
                  <div className="mb-4">
                    <motion.div 
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold"
                      animate={{
                        backgroundColor: isActive ? '#ffffff' : 'rgba(255,255,255,0.2)',
                        color: isActive ? '#111827' : '#ffffff',
                        backdropFilter: isActive ? 'none' : 'blur(4px)',
                        transition: {
                          duration: 0.4,
                          delay: index * 0.04,
                          ease: [0.23, 1, 0.320, 1]
                        }
                      }}
                    >
                      Story #{index + 1}
                    </motion.div>
                  </div>

                  {/* Title */}
                  <motion.h3 
                    className="font-bold text-white leading-tight"
                    animate={{
                      fontSize: isActive ? '1.875rem' : isAnyHovered ? '1.125rem' : '1.25rem',
                      marginBottom: isActive ? '1rem' : isAnyHovered ? '0.5rem' : '0.75rem',
                      opacity: isAnyHovered && !isActive ? 0.7 : 1,
                      transition: {
                        duration: 0.5,
                        delay: index * 0.04,
                        ease: [0.23, 1, 0.320, 1]
                      }
                    }}
                  >
                    {isActive ? story.title : story.title.slice(0, 40) + '...'}
                  </motion.h3>

                  {/* Description - only show when active */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: 20 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -20 }}
                        transition={{ 
                          duration: 0.5, 
                          delay: 0.15 + (index * 0.06), // Optimized staggered delay
                          ease: [0.23, 1, 0.320, 1] // Butter smooth easing
                        }}
                        className="overflow-hidden"
                      >
                        <p className="text-gray-200 text-base leading-relaxed mb-6 line-clamp-3">
                          {story.preview_text}
                        </p>
                        
                        {/* Action buttons */}
                        <div className="flex items-center gap-4">
                          <Link
                            to={`/stories/${story.id}`}
                            className="inline-flex items-center bg-white text-gray-900 font-semibold px-6 py-3 rounded-xl hover:bg-gray-100 transition-all duration-200 ease-[cubic-bezier(0.23,1,0.320,1)] group/btn"
                          >
                            Read Story
                            <ArrowUpRight className="ml-2 w-4 h-4 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.320,1)] group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                          </Link>
                          
                          
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Minimal CTA when not active */}
                  {!isActive && (
                    <motion.div
                      initial={{ opacity: 1 }}
                      animate={{ opacity: isAnyHovered ? 0.5 : 1 }}
                      className="flex items-center text-white/80 text-sm font-medium"
                    >
                      Hover to explore
                      <ChevronRight className="ml-1 w-4 h-4" />
                    </motion.div>
                  )}
                </motion.div>
              </div>

              {/* Hover indicator */}
              {!isActive && (
                <motion.div 
                  className="absolute top-6 right-6 z-10"
                  animate={{
                    opacity: isAnyHovered ? 0.3 : 1,
                    scale: isAnyHovered ? 0.75 : 1,
                    transition: {
                      duration: 0.3,
                      ease: [0.23, 1, 0.320, 1]
                    }
                  }}
                >
                  <div className="w-8 h-8 rounded-full border-2 border-white/40 flex items-center justify-center">
                    <motion.div 
                      className="w-2 h-2 bg-white rounded-full"
                      animate={{
                        scale: [1, 1.2, 1],
                        transition: {
                          duration: 2,
                          repeat: Infinity,
                          ease: [0.23, 1, 0.320, 1]
                        }
                      }}
                    />
                  </div>
                </motion.div>
              )}

              {/* Active card indicator */}
              {isActive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0, rotate: -180 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    rotate: 0,
                    transition: {
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                      delay: 0.2 + (index * 0.03),
                      ease: [0.23, 1, 0.320, 1]
                    }
                  }}
                  exit={{ 
                    opacity: 0, 
                    scale: 0.8, 
                    rotate: 180,
                    transition: {
                      duration: 0.2,
                      ease: [0.23, 1, 0.320, 1]
                    }
                  }}
                  className="absolute top-6 right-6 z-10"
                >
                  <motion.div 
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
                    animate={{
                      boxShadow: [
                        "0 10px 25px rgba(0,0,0,0.1)",
                        "0 20px 40px rgba(0,0,0,0.15)",
                        "0 10px 25px rgba(0,0,0,0.1)"
                      ],
                      transition: {
                        duration: 2,
                        repeat: Infinity,
                        ease: [0.23, 1, 0.320, 1]
                      }
                    }}
                  >
                    <motion.div 
                      className="w-3 h-3 bg-blue-600 rounded-full"
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [1, 0.8, 1],
                        transition: {
                          duration: 1.5,
                          repeat: Infinity,
                          ease: [0.23, 1, 0.320, 1]
                        }
                      }}
                    />
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Bottom navigation */}
      <div className="flex items-center justify-center mt-8 gap-6">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Hover cards to explore</span>
          <div className="w-1 h-1 bg-gray-400 rounded-full" />
          <span>{displayStories.length} featured stories</span>
        </div>
      </div>

      {/* View all stories link */}
      {stories.length > 1 && (
        <div className="text-center mt-6">
          <Link
            to="/stories"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200 group"
          >
            View all stories
            <ChevronRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default DesktopHoverCards;