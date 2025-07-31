import React, { memo, useState, useEffect, useRef, useMemo } from 'react';
import { DollarSign, MapPin, Users, Hash, Heart, X, Volume2, VolumeX, Tag } from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import toast from 'react-hot-toast';
import { supabase } from '../../../lib/supabase';
import type { Post } from './types';

interface InfluencerPostCardProps {
  post: Post;
  onLike: (id: string) => Promise<void>;
  onReject: (id: string) => void;
  swipeAction: 'like' | 'dislike' | null;
  onAnimationComplete: (id: string) => void;
  credits: number;
  deductCredits: (creditsToDeduct: number) => Promise<void>;
  showFullDetails: boolean;
  setShowFullDetails: (value: boolean) => void;
}

const useSwipeAnimation = (
  onLike: () => Promise<void>,
  onReject: () => void,
  setIsSwipePending: (value: boolean) => void,
  credits: number
) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [0, 150], [0, 1]);
  const dislikeOpacity = useTransform(x, [-150, 0], [1, 0]);

  useEffect(() => {
    return x.onChange(() => {});
  }, [x]);

  const handleDragEnd = async (_event: any, info: any) => {
    const swipeThreshold = 100;
    setIsSwipePending(true);

    try {
      if (Math.abs(info.offset.x) > swipeThreshold) {
        if (info.offset.x > swipeThreshold) {
          if (credits < 50) {
            toast.error('Insufficient credits! You need 50 credits to like a post.', {
              duration: 4000,
              position: 'top-center',
            });
            x.set(0);
            setIsSwipePending(false);
            return;
          }
          await onLike();
        } else if (info.offset.x < -swipeThreshold) {
          onReject();
        }
      } else {
        x.set(0);
      }
    } catch (error) {
      console.error('handleDragEnd: Swipe animation error:', error);
      x.set(0);
    } finally {
      setIsSwipePending(false);
    }
  };

  return { x, rotate, likeOpacity, dislikeOpacity, handleDragEnd };
};

const InfluencerPostCard: React.FC<InfluencerPostCardProps> = memo(
  ({ post, onLike, onReject, swipeAction, onAnimationComplete, credits, showFullDetails }) => {
    const [isSwipePending, setIsSwipePending] = useState(false);
    const [userPosts, setUserPosts] = useState<Post[]>([]);
    const [loadingUserPosts, setLoadingUserPosts] = useState(false);
    
    const { x, rotate, likeOpacity, dislikeOpacity, handleDragEnd } = useSwipeAnimation(
      () => onLike(post.id),
      () => onReject(post.id),
      setIsSwipePending,
      credits
    );

    const [isMuted, setIsMuted] = useState(true);
    const [showMuteIndicator, setShowMuteIndicator] = useState(false);
    const [selectedMedia] = useState(post.video_url || '');
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
      x.set(0);
    }, [post.id, x, credits]);

    useEffect(() => {
      let timeout: NodeJS.Timeout;
      if (showMuteIndicator) {
        timeout = setTimeout(() => {
          setShowMuteIndicator(false);
        }, 2000);
      }
      return () => clearTimeout(timeout);
    }, [showMuteIndicator]);

    useEffect(() => {
      if (!videoRef.current) return;

      const video = videoRef.current;
      video.muted = isMuted;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !isSwipePending) {
            video.muted = isMuted;
            const playPromise = video.play();
            if (playPromise !== undefined) {
              playPromise.catch(error => {
                console.error('Video playback failed:', error);
                setIsMuted(true);
                if (videoRef.current) {
                  videoRef.current.muted = true;
                  videoRef.current.play().catch(err => {
                    console.error('Video playback failed even when muted:', err);
                  });
                }
              });
            }
          } else {
            video.pause();
          }
        },
        { threshold: 0.5 }
      );

      observer.observe(video);

      return () => {
        observer.disconnect();
      };
    }, [post.id, isMuted, selectedMedia, isSwipePending]);

    // Fetch other posts from the same user when scrolling details
    const fetchUserPosts = async () => {
      if (!post.influencer_id || loadingUserPosts || userPosts.length > 0) return;
      
      setLoadingUserPosts(true);
      try {
        const { data, error } = await supabase
          .from('posts')
          .select(`
            *,
            post_categories:category_id (id, name)
          `)
          .eq('influencer_id', post.influencer_id)
          .neq('id', post.id)
          .eq('status', 'active')
          .eq('verification_status', 'approved')
          .limit(10);

        if (error) {
          console.error('Error fetching user posts:', error);
          return;
        }

        const transformedPosts = data.map((userPost) => ({
          ...userPost,
          categories: userPost.post_categories || null,
        }));

        setUserPosts(transformedPosts || []);
      } catch (error) {
        console.error('Unexpected error fetching user posts:', error);
      } finally {
        setLoadingUserPosts(false);
      }
    };

    useEffect(() => {
      if (showFullDetails) {
        fetchUserPosts();
      }
    }, [showFullDetails, post.influencer_id]);

    const handleToggleMute = (e?: React.MouseEvent | React.TouchEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (videoRef.current) {
        const newMuteState = !isMuted;
        videoRef.current.muted = newMuteState;
        setIsMuted(newMuteState);
        setShowMuteIndicator(true);
      }
    };

    const handleButtonAction = async (action: 'like' | 'dislike') => {
      if (isSwipePending) {
        return;
      }
      setIsSwipePending(true);

      try {
        if (action === 'like') {
          if (credits < 50) {
            toast.error('Insufficient credits! You need 50 credits to like a post.', {
              duration: 4000,
              position: 'top-center',
            });
            x.set(0);
            setIsSwipePending(false);
            return;
          }
          await onLike(post.id);
        } else {
          onReject(post.id);
        }
      } catch (error) {
        console.error(`handleButtonAction: Action ${action} failed:`, error);
        x.set(0);
      } finally {
        setIsSwipePending(false);
      }
    };

    const mediaContent = useMemo(() => {
      if (!post.video_url) {
        return (
          <motion.div
            className="w-full h-64 sm:h-80 bg-gray-100 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <p className="text-gray-500 text-sm">No media available</p>
          </motion.div>
        );
      }

      return (
        <motion.div
          key={selectedMedia}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="relative w-full h-full"
        >
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              loop
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover"
              onTouchStart={handleToggleMute}
              onClick={handleToggleMute}
            >
              <source src={post.video_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <motion.div
              className="absolute top-4 right-4"
              initial={{ opacity: showMuteIndicator ? 1 : 0 }}
              animate={{ opacity: showMuteIndicator ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={handleToggleMute}
                className="p-2 bg-black/70 rounded-full hover:bg-black/90 transition-colors duration-200"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-white" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
                )}
              </button>
            </motion.div>
          </div>
        </motion.div>
      );
    }, [post.video_url, selectedMedia, isMuted, showMuteIndicator]);

    const detailCards = [
      {
        icon: <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />,
        label: (() => {
          const pr = post.price_range;
          if (pr) {
            const { max } = pr;
            if (!max) {
              return 'Price';
            }
            return 'Budget';
          }
          return 'Budget';
        })(),
        value: (() => {
          const pr = post.price_range;
          if (pr) {
            const { min, max } = pr;
            if (min > 0 && max > 0) {
              return `₹${min} - ₹${max}`;
            } else if (min > 0 && !max) {
              return `₹${min}`;
            } else if (max > 0 && !min) {
              return `₹${max}`;
            } else {
              return 'Contact for price';
            }
          }
          return 'N/A';
        })(),
      },
      {
        icon: <Tag className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />,
        label: 'Category',
        value: post.categories?.name || 'N/A',
      },
      {
        icon: <Users className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />,
        label: 'Reach',
        value: post.reach ? post.reach.toLocaleString() : 'N/A',
      },
      {
        icon: <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />,
        label: 'Location',
        value: post.location || 'N/A',
      },
    ].filter(card => card.value !== 'N/A');

    return (
      <div className="flex flex-col pb-6">
        <motion.div
          key={post.id}
          className="snap-center flex-shrink-0 w-full h-[calc(100vh-150px)] sm:h-[calc(100vh-100px)] flex flex-col bg-white rounded-lg overflow-hidden relative"
          drag={isSwipePending ? false : 'x'}
          dragConstraints={{ left: -300, right: 300 }}
          dragElastic={0.2}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          initial={{
            scale: 0.95,
            opacity: 0,
          }}
          animate={{
            scale: 1,
            opacity: 1,
            transition: {
              type: 'spring',
              stiffness: 200,
              damping: 25,
              mass: 0.8,
            },
          }}
          exit={{
            x: swipeAction === 'like' ? '100%' : swipeAction === 'dislike' ? '-100%' : 0,
            opacity: 0,
            transition: {
              duration: 0.3,
              ease: 'easeOut',
            },
          }}
          style={{
            x,
            rotate,
            willChange: 'transform',
            touchAction: 'pan-y',
          }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 25,
            mass: 0.8,
          }}
          onAnimationComplete={() => {
            if (swipeAction && !isSwipePending) {
              onAnimationComplete(post.id);
            }
          }}
        >
          {mediaContent}
          <motion.div
            style={{
              opacity: likeOpacity,
              pointerEvents: 'none',
            }}
            className="absolute inset-0 flex items-center justify-center bg-green-600/90"
          >
            <div className="text-4xl sm:text-6xl font-bold text-white border-4 border-gray-200 rounded-full px-6 py-3 shadow-lg transform rotate-12">
              LIKE
            </div>
          </motion.div>
          <motion.div
            style={{
              opacity: dislikeOpacity,
              pointerEvents: 'none',
            }}
            className="absolute inset-0 flex items-center justify-center bg-red-600/90"
          >
            <div className="text-4xl sm:text-6xl font-bold text-white border-4 border-gray-200 rounded-full px-6 py-3 shadow-lg -rotate-12">
              DISLIKE
            </div>
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-gray-800/30 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white flex justify-between items-start gap-4">
            <div className="flex-1 flex flex-col space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold">{post.title || 'Untitled'}</h2>
              {post.categories && (
                <div className="flex items-center text-sm sm:text-base">
                  <Hash className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span>{post.categories.name}</span>
                </div>
              )}
            </div>
            <div className="flex-1 flex flex-col space-y-1 items-end">
              {post.location && (
                <div className="flex items-center text-sm sm:text-base">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span>{post.location}</span>
                </div>
              )}
              {post.reach && (
                <div className="flex items-center text-sm sm:text-base">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span>{post.reach.toLocaleString()} reach</span>
                </div>
              )}
            </div>
          </div>
          <div className="absolute top-1/2 right-4 sm:right-6 transform -translate-y-1/2 flex flex-col gap-2">
            <button
              onClick={() => handleButtonAction('like')}
              className={`p-2 rounded-full transition-colors duration-200 ${
                credits < 50 || isSwipePending
                  ? 'bg-gray-400/80 cursor-not-allowed'
                  : 'bg-green-600/80 hover:bg-green-700/90'
              }`}
              aria-label="Like"
              disabled={credits < 50 || isSwipePending}
            >
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" />
            </button>
            <button
              onClick={() => handleButtonAction('dislike')}
              className={`p-2 rounded-full transition-colors duration-200 ${
                isSwipePending ? 'bg-gray-400/80 cursor-not-allowed' : 'bg-red-600/80 hover:bg-red-700/90'
              }`}
              aria-label="Reject"
              disabled={isSwipePending}
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
          </div>
        </motion.div>
        
        {/* Scrollable Details Section */}
        <div className="bg-gray-100 py-4 sm:py-6">
          <div className="grid grid-cols-1">
            <div className="bg-white rounded-lg p-4 shadow-md">
              <p className="text-sm sm:text-base text-gray-600">Description</p>
              <p className="text-base sm:text-lg text-gray-900 text-justify">
                {post.description || 'Not specified'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Hashtags Section */}
        {post.hashtags && (
          <div className="bg-gray-100">
            <div className="grid grid-cols-1">
              <div className="bg-white rounded-lg p-3 shadow-md">
                <p className="text-xs sm:text-sm text-gray-600">Hashtags</p>
                <p className="text-base sm:text-lg text-gray-900">
                  {post.hashtags}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Detail Cards */}
        <div className="bg-gray-100 py-4 sm:py-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {detailCards.map((card, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-3 flex items-center space-x-3 shadow-md"
              >
                {card.icon}
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">{card.label}</p>
                  <p className="text-sm sm:text-base text-gray-900">{card.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Other Posts from Same User */}
        {showFullDetails && userPosts.length > 0 && (
          <div className="bg-gray-100 py-4 sm:py-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 px-4">More from this creator</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 max-h-96 overflow-y-auto">
              {userPosts.map((userPost) => (
                <div key={userPost.id} className="bg-white rounded-lg p-3 shadow-md">
                  {userPost.video_url && (
                    <video
                      className="w-full h-32 object-cover rounded-md mb-2"
                      muted
                      loop
                      onMouseOver={e => e.currentTarget.play()}
                      onMouseOut={e => e.currentTarget.pause()}
                    >
                      <source src={userPost.video_url} type="video/mp4" />
                    </video>
                  )}
                  <h4 className="font-medium text-gray-900 mb-1">{userPost.title}</h4>
                  {userPost.categories && (
                    <p className="text-sm text-gray-600 mb-1">{userPost.categories.name}</p>
                  )}
                  <p className="text-xs text-gray-500 line-clamp-2">{userPost.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {showFullDetails && loadingUserPosts && (
          <div className="bg-gray-100 py-4 sm:py-6">
            <div className="text-center">
              <p className="text-gray-500 text-sm">Loading more posts...</p>
            </div>
          </div>
        )}
      </div>
    );
  }
);

InfluencerPostCard.displayName = 'InfluencerPostCard';

export default InfluencerPostCard;