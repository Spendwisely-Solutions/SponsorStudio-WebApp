import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, Play, ArrowUpRight } from 'lucide-react';
import { SuccessStory as SuccessStoryType } from './Home';
import './DesktopHoverCards.css';

interface DesktopHoverCardsProps {
  stories: SuccessStoryType[];
  className?: string;
}

const DesktopHoverCards: React.FC<DesktopHoverCardsProps> = ({ 
  stories, 
  className = '' 
}) => {
  const [activeCard, setActiveCard] = useState<number>(1); // Second card is active by default (index 1)
  const shouldReduceMotion = useReducedMotion();

  // Memoize display stories for performance
  const displayStories = useMemo(() => stories.slice(0, 4), [stories]);

  // Optimized hover handlers with useCallback
  const handleCardHover = useCallback((index: number) => {
    setActiveCard(index);
  }, []);

  // Ultra-high FPS spring configurations with reduced speed
  const springConfig = useMemo(() => ({
    type: "spring" as const,
    stiffness: shouldReduceMotion ? 120 : 240,
    damping: shouldReduceMotion ? 60 : 35,
    mass: 0.8,
    velocity: 0,
    restDelta: 0.0001,
    restSpeed: 0.0001
  }), [shouldReduceMotion]);

  const layoutSpringConfig = useMemo(() => ({
    type: "spring" as const,
    stiffness: shouldReduceMotion ? 100 : 200,
    damping: shouldReduceMotion ? 55 : 30,
    mass: 0.7,
    velocity: 0,
    restDelta: 0.0001,
    restSpeed: 0.0001
  }), [shouldReduceMotion]);

  if (stories.length === 0) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <p className="text-text-muted">No stories available</p>
      </div>
    );
  }

  return (
    <div className={`relative w-full desktop-hover-cards ${className}`}>
      <motion.div 
        className="flex gap-2 h-[500px] max-w-7xl mx-auto"
        layout
        transition={{
          layout: {
            ...layoutSpringConfig,
            ease: [0.08, 0.82, 0.17, 1], // Ultra-smooth easing for higher FPS
            duration: shouldReduceMotion ? 0.2 : 0.8
          }
        }}
        style={{
          willChange: 'transform',
          transform: 'translateZ(0)', // Force hardware acceleration
          backfaceVisibility: 'hidden'
        }}
      >
        {displayStories.map((story, index) => {
          const isActive = activeCard === index;
          const isAnyHovered = activeCard !== 1; // Check if any card other than default is being hovered
          
          return (
            <motion.div
              key={story.id}
              className="relative overflow-hidden cursor-pointer group rounded-2xl shadow-lg"
              onHoverStart={() => handleCardHover(index)}
              layout
              layoutId={`card-${story.id}`}
              transition={{
                layout: {
                  ...layoutSpringConfig,
                  delay: shouldReduceMotion ? 0 : index * 0.015,
                  ease: [0.08, 0.82, 0.17, 1],
                  duration: 0.6
                }
              }}
              animate={{
                flex: isActive ? '2' : '1',
                transition: {
                  ...springConfig,
                  delay: shouldReduceMotion ? 0 : index * 0.01,
                  ease: [0.08, 0.82, 0.17, 1],
                  duration: 0.7
                }
              }}
              style={{
                willChange: 'transform, flex',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden',
                contain: 'layout style paint'
              }}
            >
              {/* Background Image */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden">
                <motion.img
                  src={story.preview_image}
                  alt={story.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                  animate={{
                    scale: isActive ? 1.05 : 1.1,
                    transition: {
                      ...springConfig,
                      ease: [0.08, 0.82, 0.17, 1],
                      duration: 0.8
                    }
                  }}
                  style={{
                    willChange: 'transform',
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden'
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
                      duration: shouldReduceMotion ? 0.15 : 0.6,
                      ease: [0.08, 0.82, 0.17, 1]
                    }
                  }}
                  style={{
                    willChange: 'background',
                    transform: 'translateZ(0)'
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
                      ...springConfig,
                      delay: shouldReduceMotion ? 0 : index * 0.01,
                      ease: [0.08, 0.82, 0.17, 1],
                      duration: 0.6
                    }
                  }}
                  style={{
                    willChange: 'margin',
                    transform: 'translateZ(0)'
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
                          duration: shouldReduceMotion ? 0.1 : 0.5,
                          delay: shouldReduceMotion ? 0 : index * 0.01,
                          ease: [0.08, 0.82, 0.17, 1]
                        }
                      }}
                      style={{
                        willChange: 'background-color, color, backdrop-filter',
                        transform: 'translateZ(0)'
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
                        duration: shouldReduceMotion ? 0.15 : 0.6,
                        delay: shouldReduceMotion ? 0 : index * 0.01,
                        ease: [0.08, 0.82, 0.17, 1]
                      }
                    }}
                    style={{
                      willChange: 'font-size, margin-bottom, opacity',
                      transform: 'translateZ(0)'
                    }}
                  >
                    {isActive ? story.title : story.title.slice(0, 40) + '...'}
                  </motion.h3>

                  {/* Description - only show when active */}
                  <AnimatePresence mode="wait">
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: 10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        transition={{ 
                          duration: shouldReduceMotion ? 0.15 : 0.7,
                          delay: shouldReduceMotion ? 0 : 0.08 + (index * 0.015),
                          ease: [0.08, 0.82, 0.17, 1]
                        }}
                        className="overflow-hidden"
                        style={{
                          willChange: 'opacity, height, transform',
                          transform: 'translateZ(0)'
                        }}
                      >
                        <p className="text-gray-200 text-base leading-relaxed mb-6 line-clamp-3">
                          {story.preview_text}
                        </p>
                        
                        {/* Action buttons */}
                        <div className="flex items-center gap-4">
                          <Link
                            to={`/stories/${story.id}`}
                            className="inline-flex items-center bg-white text-gray-900 font-semibold px-6 py-3 rounded-xl hover:bg-gray-100 transition-all duration-300 ease-[cubic-bezier(0.08,0.82,0.17,1)] group/btn transform hover:scale-105"
                            style={{
                              willChange: 'transform, background-color',
                              transform: 'translateZ(0)'
                            }}
                          >
                            Read Story
                            <ArrowUpRight className="ml-2 w-4 h-4 transition-transform duration-300 ease-[cubic-bezier(0.08,0.82,0.17,1)] group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
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
                      duration: 0.5,
                      ease: [0.08, 0.82, 0.17, 1]
                    }
                  }}
                >
                  <div className="w-8 h-8 rounded-full border-2 border-white/40 flex items-center justify-center">
                    <motion.div 
                      className="w-2 h-2 bg-white rounded-full"
                      animate={{
                        scale: [1, 1.1, 1],
                        transition: {
                          duration: 3,
                          repeat: Infinity,
                          ease: [0.08, 0.82, 0.17, 1]
                        }
                      }}
                    />
                  </div>
                </motion.div>
              )}

              {/* Active card indicator */}
              {isActive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0, rotate: -90 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    rotate: 0,
                    transition: {
                      ...springConfig,
                      delay: shouldReduceMotion ? 0 : 0.15 + (index * 0.02),
                      ease: [0.16, 1, 0.3, 1]
                    }
                  }}
                  exit={{ 
                    opacity: 0, 
                    scale: 0.9, 
                    rotate: 90,
                    transition: {
                      duration: shouldReduceMotion ? 0.1 : 0.15,
                      ease: [0.16, 1, 0.3, 1]
                    }
                  }}
                  className="absolute top-6 right-6 z-10"
                  style={{
                    willChange: 'transform, opacity',
                    transform: 'translateZ(0)'
                  }}
                >
                  <motion.div 
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
                    animate={shouldReduceMotion ? {} : {
                      boxShadow: [
                        "0 10px 25px rgba(0,0,0,0.1)",
                        "0 15px 35px rgba(0,0,0,0.15)",
                        "0 10px 25px rgba(0,0,0,0.1)"
                      ],
                      transition: {
                        duration: 3,
                        repeat: Infinity,
                        ease: [0.16, 1, 0.3, 1]
                      }
                    }}
                    style={{
                      willChange: shouldReduceMotion ? 'auto' : 'box-shadow',
                      transform: 'translateZ(0)'
                    }}
                  >
                    <motion.div 
                      className="w-3 h-3 bg-blue-600 rounded-full"
                      animate={shouldReduceMotion ? {} : {
                        scale: [1, 1.05, 1],
                        opacity: [1, 0.9, 1],
                        transition: {
                          duration: 2,
                          repeat: Infinity,
                          ease: [0.16, 1, 0.3, 1]
                        }
                      }}
                      style={{
                        willChange: shouldReduceMotion ? 'auto' : 'transform, opacity',
                        transform: 'translateZ(0)'
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
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <span>Hover cards to explore</span>
          <div className="w-1.5 h-1.5 bg-border rounded-full" />
          <span>{displayStories.length} featured stories</span>
        </div>
      </div>

      {/* View all stories link */}
      {stories.length > 1 && (
        <div className="text-center mt-6">
          <Link
            to="/stories"
            className="inline-flex items-center text-primary hover:text-primary-hover font-semibold transition-colors duration-200 group"
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