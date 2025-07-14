import React, { memo, useState, useEffect, useMemo, useRef } from 'react';
import { Calendar, DollarSign, MapPin, FileText, Heart, X, Volume2, VolumeX, Link as LinkIcon, Tag, User, Users, Unlock } from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import toast from 'react-hot-toast';

interface Opportunity {
  id: string;
  title: string;
  location: string;
  start_date?: string;
  end_date?: string;
  price_range?: {
    min: number;
    max: number;
  };
  description: string;
  media_urls?: string[];
  sponsorship_brochure_url?: string;
  category_id?: string;
  category_name?: string;
  ad_type?: string;
  creator_id?: string;
  creator_name?: string;
  requirements?: string;
  benefits?: string;
  reach?: string;
}

interface OpportunityCardProps {
  opportunity: Opportunity;
  onLike: (id: string) => Promise<void>;
  onReject: (id: string) => void;
  swipeAction: 'like' | 'dislike' | null;
  onAnimationComplete: (id: string) => void;
  showFullDetails: boolean;
  setShowFullDetails: (value: boolean) => void;
  credits: number;
  deductCredits: (creditsToDeduct: number) => Promise<void>;
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

  const handleDragEnd = async (event: any, info: any) => {
    const swipeThreshold = 100;
    setIsSwipePending(true);
    console.log(`handleDragEnd: Swipe offset x=${info.offset.x}, credits=${credits}`);

    try {
      if (Math.abs(info.offset.x) > swipeThreshold) {
        if (info.offset.x > swipeThreshold) {
          if (credits < 50) {
            console.log('handleDragEnd: Insufficient credits for like');
            toast.error('Insufficient credits! Please add more credits to like.', {
              duration: 4000,
              position: 'top-center',
            });
            x.set(0, {
              type: 'spring',
              stiffness: 300,
              damping: 30,
            });
            setIsSwipePending(false);
            return;
          }
          console.log('handleDragEnd: Triggering onLike');
          await onLike();
        } else if (info.offset.x < -swipeThreshold) {
          console.log('handleDragEnd: Triggering onReject');
          onReject();
        }
      } else {
        console.log('handleDragEnd: Resetting position (swipe below threshold)');
        x.set(0, {
          type: 'spring',
          stiffness: 300,
          damping: 30,
        });
      }
    } catch (error) {
      console.error('handleDragEnd: Swipe animation error:', error);
      x.set(0, {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      });
    } finally {
      setIsSwipePending(false);
    }
  };

  return { x, rotate, likeOpacity, dislikeOpacity, handleDragEnd };
};

const OpportunityCard: React.FC<OpportunityCardProps> = memo(
  ({ opportunity, onLike, onReject, swipeAction, onAnimationComplete, showFullDetails, credits, deductCredits }) => {
    const [isSwipePending, setIsSwipePending] = useState(false);
    const { x, rotate, likeOpacity, dislikeOpacity, handleDragEnd } = useSwipeAnimation(
      () => onLike(opportunity.id),
      () => onReject(opportunity.id),
      setIsSwipePending,
      credits
    );

    const [isMuted, setIsMuted] = useState(true);
    const [showMuteIndicator, setShowMuteIndicator] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState(opportunity.media_urls?.[0] || '');
    const [isBrochureUnlocked, setIsBrochureUnlocked] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false); // New loading state
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
      console.log(`OpportunityCard: Mounted with credits=${credits}, opportunity.id=${opportunity.id}`);
      x.set(0);
    }, [opportunity.id, x, credits]);

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
                video.muted = true;
                video.play().catch(err => {
                  console.error('Video playback failed even when muted:', err);
                });
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
    }, [opportunity.id, isMuted, selectedMedia, isSwipePending]);

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
        console.log(`handleToggleMute: Video ${newMuteState ? 'muted' : 'unmuted'}`);
      }
    };

    const handleButtonAction = async (action: 'like' | 'dislike') => {
      if (isSwipePending) {
        console.log(`handleButtonAction: Action ${action} blocked due to pending swipe`);
        return;
      }
      setIsSwipePending(true);
      console.log(`handleButtonAction: Triggering ${action}, credits=${credits}`);

      try {
        if (action === 'like') {
          if (credits < 50) {
            console.log('handleButtonAction: Insufficient credits for like');
            toast.error('Insufficient credits! Please add more credits to like.', {
              duration: 4000,
              position: 'top-center',
            });
            x.set(0, {
              type: 'spring',
              stiffness: 300,
              damping: 30,
            });
            setIsSwipePending(false);
            return;
          }
          await onLike(opportunity.id);
        } else {
          onReject(opportunity.id);
        }
      } catch (error) {
        console.error(`handleButtonAction: Action ${action} failed:`, error);
        x.set(0, {
          type: 'spring',
          stiffness: 300,
          damping: 30,
        });
      } finally {
        setIsSwipePending(false);
      }
    };

    const handleUnlockBrochure = async () => {
      if (credits < 100) {
        console.log('handleUnlockBrochure: Insufficient credits for brochure');
        toast.error('Insufficient credits! You need 100 credits to unlock the brochure.', {
          duration: 4000,
          position: 'top-center',
        });
        return;
      }

      setIsUnlocking(true); // Start loading
      try {
        console.log('handleUnlockBrochure: Attempting to deduct 100 credits');
        await deductCredits(100);
        setIsBrochureUnlocked(true);
        toast.success('Brochure unlocked successfully!', {
          duration: 4000,
          position: 'top-center',
        });
        console.log('handleUnlockBrochure: Brochure unlocked');
      } catch (error: any) {
        console.error('handleUnlockBrochure: Error deducting credits:', error);
        // Error messages (e.g., "Session expired" or "Failed to deduct credits") are handled by deductCredits in BrandDashboard
      } finally {
        setIsUnlocking(false); // Stop loading
      }
    };

    const handleMediaSelect = (mediaUrl: string) => {
      setSelectedMedia(mediaUrl);
      if (videoRef.current && /\.(mp4|webm|ogg)$/i.test(mediaUrl)) {
        videoRef.current.load();
        videoRef.current.muted = isMuted;
        videoRef.current.play().catch(error => {
          console.error('Video playback failed:', error);
          setIsMuted(true);
          videoRef.current.muted = true;
          videoRef.current.play().catch(err => {
            console.error('Video playback failed even when muted:', err);
          });
        });
      }
      console.log(`handleMediaSelect: Selected media ${mediaUrl}`);
    };

    const mediaContent = useMemo(() => {
      if (!opportunity.media_urls?.length) {
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

      const isVideo = /\.(mp4|webm|ogg)$/i.test(selectedMedia);

      return (
        <motion.div
          key={selectedMedia}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="relative w-full h-full"
        >
          {isVideo ? (
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
                <source src={selectedMedia} type="video/mp4" />
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
                  onTouchStart={handleToggleMute}
                  className="p-2 bg-gray-200/70 rounded-full hover:bg-gray-300/90 transition-colors duration-200"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 text-gray-900" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-gray-900" />
                  )}
                </button>
              </motion.div>
            </div>
          ) : (
            <img
              src={selectedMedia}
              alt={opportunity.title}
              className="w-full h-full object-cover"
              loading="eager"
              decoding="async"
            />
          )}
        </motion.div>
      );
    }, [opportunity.media_urls, opportunity.title, selectedMedia, isMuted, showMuteIndicator]);

    const thumbnailGallery = useMemo(() => {
      if (!opportunity.media_urls || opportunity.media_urls.length <= 1) return null;

      const useFlexWrap = opportunity.media_urls.length > 4;

      return (
        <div className="bg-gray-100 p-2">
          <div 
            className={`flex gap-2 pb-2 ${
              useFlexWrap 
                ? 'flex-wrap justify-center' 
                : 'overflow-x-auto scrollbar-hide'
            }`}
            style={useFlexWrap ? {} : {
              scrollbarWidth: 'thin',
              scrollbarColor: '#9CA3AF #E5E7EB',
              WebkitOverflowScrolling: 'touch',
              msOverflowStyle: '-ms-autohiding-scrollbar'
            }}
          >
            {opportunity.media_urls.map((url, index) => {
              const isThumbnailVideo = /\.(mp4|webm|ogg)$/i.test(url);
              return (
                <button
                  key={index}
                  onClick={() => handleMediaSelect(url)}
                  className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-md overflow-hidden border-2 ${
                    selectedMedia === url ? 'border-blue-600' : 'border-gray-300'
                  } hover:border-blue-400 transition-colors duration-200`}
                >
                {isThumbnailVideo ? (
                  <video
                    src={url}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    onMouseOver={e => e.currentTarget.play()}
                    onMouseOut={e => e.currentTarget.pause()}
                  >
                    <source src={url} type="video/mp4" />
                  </video>
                ) : (
                  <img
                    src={url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </button>
            );
          })}
          </div>
        </div>
      );
    }, [opportunity.media_urls, selectedMedia]);

    const detailCards = [
      {
      icon: <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />,
      label: (() => {
        const pr = opportunity.price_range;
        if (pr) {
        const { min, max } = pr;
        // If max is not set (0 or undefined/null), show "Price"
        if (!max) {
          return 'Price';
        }
        return 'Budget';
        }
        return 'Budget';
      })(),
      value: (() => {
        const pr = opportunity.price_range;
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
      icon: <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />,
      label: 'Brochure',
      value: opportunity.sponsorship_brochure_url ? (
        <div className="flex flex-col space-y-1">
        {isBrochureUnlocked ? (
          <a
          href={opportunity.sponsorship_brochure_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-blue-600 hover:text-blue-800"
          aria-label="View sponsorship brochure"
          >
          <LinkIcon className="w-4 h-4 mr-1" />
          View Brochure
          </a>
        ) : (
          <button
          onClick={handleUnlockBrochure}
          disabled={credits < 100 || isUnlocking}
          className={`flex items-center px-2 py-1 rounded-md transition-colors duration-200 ${
            credits < 100 || isUnlocking
            ? 'bg-gray-400/80 text-gray-600 cursor-not-allowed'
            : 'bg-blue-600/80 text-white hover:bg-blue-700/90'
          }`}
          aria-label="Unlock sponsorship brochure, costs 100 credits"
          >
          {isUnlocking ? (
            <span className="flex items-center">
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></span>
            Unlocking...
            </span>
          ) : (
            <>
            <Unlock className="w-4 h-4 mr-1" />
            Unlock Brochure
            </>
          )}
          </button>
        )}
        <p className="text-xs text-gray-500">Costs 100 credits to view</p>
        </div>
      ) : 'Not Available',
      },
      {
      icon: <Tag className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />,
      label: 'Category',
      value: opportunity.category_name || 'N/A',
      },
      {
      icon: <Tag className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />,
      label: 'Ad Type',
      value: opportunity.ad_type || 'N/A',
      },
      {
      icon: <User className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />,
      label: 'Creator',
      value: opportunity.creator_name || 'N/A',
      },
    ].filter(card => card.value !== 'N/A' || card.label === 'Brochure');

    const formattedDate = opportunity.start_date
      ? opportunity.end_date &&
        new Date(opportunity.start_date).toDateString() === new Date(opportunity.end_date).toDateString()
        ? new Date(opportunity.start_date).toLocaleDateString()
        : `${new Date(opportunity.start_date).toLocaleDateString()}${
            opportunity.end_date ? ` - ${new Date(opportunity.end_date).toLocaleDateString()}` : ''
          }`
      : 'N/A';

    return (
      <div className="flex flex-col pb-6">
        <motion.div
          key={opportunity.id}
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
              onAnimationComplete(opportunity.id);
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
              <h2 className="text-xl sm:text-2xl font-bold">{opportunity.title}</h2>
              <div className="flex items-center text-sm sm:text-base">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-1 text-white" />
                {opportunity.location || 'N/A'}
              </div>
            </div>
            <div className="flex-1 flex flex-col space-y-1 items-end">
              <div className="flex items-center text-sm sm:text-base">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-1 text-white" />
                {opportunity.reach || 'N/A'}
              </div>
              <div className="flex items-center text-sm sm:text-base">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-1 text-white" />
                {formattedDate}
              </div>
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
        {thumbnailGallery}
        <div className="bg-gray-100 py-4 sm:py-6">
          <div className="grid grid-cols-1">
            <div className="bg-white rounded-lg p-4 shadow-md">
              <p className="text-sm sm:text-base text-gray-600">Description</p>
              <p className="text-base sm:text-lg text-gray-900 text-justify">
                {opportunity.description || 'Not specified'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {opportunity.requirements && opportunity.requirements.trim() !== '' && (
              <div className="bg-white rounded-lg p-3 shadow-md">
              <p className="text-xs sm:text-sm text-gray-600">Requirements</p>
              <p className="text-base sm:text-lg text-gray-900 text-justify">
                {opportunity.requirements}
              </p>
              </div>
            )}
            {opportunity.benefits && opportunity.benefits.trim() !== '' && (
              <div className="bg-white rounded-lg p-3 shadow-md">
              <p className="text-xs sm:text-sm text-gray-600">Benefits</p>
              <p className="text-base sm:text-lg text-gray-900 text-justify">
                {opportunity.benefits}
              </p>
              </div>
            )}
          </div>
        </div>
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
      </div>
    );
  }
);

OpportunityCard.displayName = 'OpportunityCard';

export default OpportunityCard;
