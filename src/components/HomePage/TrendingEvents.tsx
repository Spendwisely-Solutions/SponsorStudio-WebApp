import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Slider from 'react-slick'; // Import react-slick
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

type TrendingEvent = {
  title: string;
  description: string;
  media_urls: string[];
  start_date: string;
  end_date: string;
  location: string;
};

interface TrendingEventsProps {
  showAuthForm?: () => void;
}

function TrendingEvents({ showAuthForm }: TrendingEventsProps) {
  const [events, setEvents] = useState<TrendingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Fetch trending events from API
  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-trending-events`)
      .then(res => res.json())
      .then(res => {
        if (res.success && Array.isArray(res.data)) {
          setEvents(res.data);
        } else {
          setEvents([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setEvents([]);
        setLoading(false);
      });
  }, []);

  // Responsive: Detect mobile view
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter out events with 'test event' in the title, events without any media, and expired events
  const filteredEvents = useMemo(() => {
    const filtered = events.filter(e => {
      // exclude explicit test events
      if (e.title?.toLowerCase().includes('test event')) return false;

      // require at least one media URL
      if (!Array.isArray(e.media_urls) || e.media_urls.length === 0) return false;

      // if end_date exists and parses to a valid date, exclude if it's in the past
      if (e.start_date) {
        const start = new Date(e.start_date);
        if (!isNaN(start.getTime())) {
          const now = new Date();
          if (start < now) return false; // expired
        }
      }

      return true;
    });

    // If we have 2, 3, or 4 events, duplicate the array to improve carousel experience
    if (filtered.length >= 2 && filtered.length <= 4) {
      return [...filtered, ...filtered];
    }

    return filtered;
  }, [events]);

  // Slick Slider settings for Center Mode - dynamic based on event count
  const sliderSettings = useMemo(() => {
    const numEvents = filteredEvents.length;
    const baseSettings = {
      centerMode: numEvents > 1,
      centerPadding: isMobile ? '10px' : '60px',
      slidesToShow: Math.min(isMobile ? 1 : 3, numEvents),
      slidesToScroll: 1,
      autoplay: numEvents > 1,
      autoplaySpeed: 2000,
      infinite: numEvents > 1,
      arrows: false,
      dots: numEvents > 1,
      speed: 500,
      cssEase: 'cubic-bezier(.4,0,.2,1)' as const,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: Math.min(2, numEvents),
            centerPadding: '40px',
            centerMode: numEvents > 1,
          },
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: Math.min(1, numEvents),
            centerPadding: '10px',
          },
        },
      ],
    };

    // For single event, override to non-slider mode
    if (numEvents === 1) {
      return {
        ...baseSettings,
        centerMode: false,
        slidesToShow: 1,
        infinite: false,
        autoplay: false,
        dots: false,
      };
    }

    return baseSettings;
  }, [filteredEvents.length, isMobile]);

  // Format date as 'day Month'
  const formatDate = (start: string) => {
    if (!start) return '';
    const startObj = new Date(start);
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' };
    return startObj.toLocaleDateString('en-US', options);
  };

  const { user, profile } = useAuth();

  // Render single event card (non-slider)
  const renderSingleEvent = (event: TrendingEvent) => {
    let mediaUrl = '';
    let mediaType: 'image' | 'video' | null = null;

    // Prioritize the first image, then any image, then any video, then first available media
    if (event.media_urls && event.media_urls.length > 0) {
      const firstMedia = event.media_urls[0];
      if (firstMedia.match(/\.(jpg|jpeg|png|webp|avif)$/i)) {
        mediaUrl = firstMedia;
        mediaType = 'image';
      } else {
        const image = event.media_urls.find(url => url.match(/\.(jpg|jpeg|png|webp|avif)$/i));
        if (image) {
          mediaUrl = image;
          mediaType = 'image';
        } else {
          const video = event.media_urls.find(url => url.match(/\.(mp4|webm|ogg)$/i));
          if (video) {
            mediaUrl = video;
            mediaType = 'video';
          } else {
            mediaUrl = firstMedia;
            mediaType = null;
          }
        }
      }
    }

    // Track mouse/touch movement to distinguish click vs drag
    let startX = 0, startY = 0, moved = false;
    const threshold = 10; // px
    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      moved = false;
      if (e.pointerType === 'touch' || e.pointerType === 'mouse') {
        startX = e.clientX;
        startY = e.clientY;
      }
    };
    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType === 'touch' || e.pointerType === 'mouse') {
        if (Math.abs(e.clientX - startX) > threshold || Math.abs(e.clientY - startY) > threshold) {
          moved = true;
        }
      }
    };
    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!moved) {
        // If not logged in, show auth form
        if (!user) {
          if (typeof showAuthForm === 'function') showAuthForm();
          return;
        }
        // Only allow dashboard navigation for brand users
        if (profile?.user_type === 'brand') {
          const searchParam = encodeURIComponent(event.title);
          window.location.href = `/dashboard?search=${searchParam}`;
        }
        // Do nothing for other user types
      }
    };

    return (
      <div
        className="px-2 outline-none cursor-pointer mx-auto"
        style={{ maxWidth: isMobile ? '100%' : '18rem' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="bg-white/90 rounded-3xl shadow-xl border border-blue-100/40 backdrop-blur-md px-4 py-6 flex flex-col items-center transition-transform duration-500 ease-[cubic-bezier(.4,0,.2,1)] animate-cardin">
          <div
            className="w-full rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center"
            style={{ height: '192px', minHeight: '192px', maxHeight: '192px' }}
          >
            {mediaType === 'image' && mediaUrl ? (
              <img
                src={mediaUrl}
                alt={event.title}
                className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
              />
            ) : mediaType === 'video' && mediaUrl ? (
              <video
                src={mediaUrl}
                className="w-full h-full object-cover object-center"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                poster={event.media_urls.find(url => url.match(/\.(jpg|jpeg|png|webp|avif)$/i)) || undefined}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">No Media</div>
            )}
          </div>
          <div className="text-center flex-1 flex flex-col justify-start w-full">
            <h3 className="text-lg sm:text-xl font-bold text-blue-800 mb-1 truncate w-full" title={event.title}>
              {event.title}
            </h3>
            <div className="text-xs sm:text-sm text-gray-500 mb-1">{formatDate(event.start_date)}</div>
            <div className="text-xs sm:text-sm text-gray-400 mb-1">{event.location}</div>
            <p className="text-gray-600 text-sm mb-2 line-clamp-2 w-full" title={event.description}>
              {event.description}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full py-16 px-2 sm:px-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 overflow-hidden">
      {/* Animated background orbs and pattern */}
      <div className="absolute inset-0 -z-10 animate-gradient bg-gradient-to-br from-blue-200/40 via-indigo-100/40 to-purple-100/40 opacity-80"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-200/40 to-indigo-300/30 rounded-full blur-3xl animate-pulse opacity-50" style={{ animationDuration: '4s' }}></div>
      <div className="absolute bottom-0 right-0 w-60 h-60 bg-gradient-to-br from-purple-200/40 to-pink-300/30 rounded-full blur-3xl animate-pulse opacity-50" style={{ animationDuration: '6s', animationDelay: '2s' }}></div>
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.8) 1px, transparent 0)`, backgroundSize: '50px 50px' }}></div>

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center px-4 py-1.5 mb-8 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
            <span className="text-sm font-medium">What's Hot</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-fadein pb-3">
            Trending Events
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-xl sm:text-2xl text-gray-600 leading-relaxed font-light animate-fadein2">
            Discover the most popular and upcoming events happening now on SponsorStudio
          </p>
        </div>

        {/* Content based on event count */}
        <div className="relative pb-14">
          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center text-gray-500">No events available</div>
          ) : filteredEvents.length === 1 ? (
            renderSingleEvent(filteredEvents[0])
          ) : (
            <Slider {...sliderSettings}>
              {filteredEvents.map((event, idx) => {
                let mediaUrl = '';
                let mediaType: 'image' | 'video' | null = null;

                // Prioritize the first image, then any image, then any video, then first available media
                if (event.media_urls && event.media_urls.length > 0) {
                  const firstMedia = event.media_urls[0];
                  if (firstMedia.match(/\.(jpg|jpeg|png|webp|avif)$/i)) {
                    mediaUrl = firstMedia;
                    mediaType = 'image';
                  } else {
                    const image = event.media_urls.find(url => url.match(/\.(jpg|jpeg|png|webp|avif)$/i));
                    if (image) {
                      mediaUrl = image;
                      mediaType = 'image';
                    } else {
                      const video = event.media_urls.find(url => url.match(/\.(mp4|webm|ogg)$/i));
                      if (video) {
                        mediaUrl = video;
                        mediaType = 'video';
                      } else {
                        mediaUrl = firstMedia;
                        mediaType = null;
                      }
                    }
                  }
                }

                // Track mouse/touch movement to distinguish click vs drag
                let startX = 0, startY = 0, moved = false;
                const threshold = 10; // px
                const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
                  moved = false;
                  if (e.pointerType === 'touch' || e.pointerType === 'mouse') {
                    startX = e.clientX;
                    startY = e.clientY;
                  }
                };
                const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
                  if (e.pointerType === 'touch' || e.pointerType === 'mouse') {
                    if (Math.abs(e.clientX - startX) > threshold || Math.abs(e.clientY - startY) > threshold) {
                      moved = true;
                    }
                  }
                };
                const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
                  if (!moved) {
                    // If not logged in, show auth form
                    if (!user) {
                      if (typeof showAuthForm === 'function') showAuthForm();
                      return;
                    }
                    // Only allow dashboard navigation for brand users
                    if (profile?.user_type === 'brand') {
                      const searchParam = encodeURIComponent(event.title);
                      window.location.href = `/dashboard?search=${searchParam}`;
                    }
                    // Do nothing for other user types
                  }
                };

                return (
                  <div
                    key={event.title + (event.start_date || idx)}
                    className="px-2 outline-none cursor-pointer"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                  >
                    <div
                      className="bg-white/90 rounded-3xl shadow-xl border border-blue-100/40 backdrop-blur-md px-4 py-6 flex flex-col items-center transition-transform duration-500 ease-[cubic-bezier(.4,0,.2,1)] animate-cardin mb-12"
                      style={{
                        width: isMobile ? '100%' : '18rem',
                        minWidth: isMobile ? '0' : '18rem',
                        maxWidth: isMobile ? '100%' : '18rem',
                        animationDelay: `${0.2 + idx * 0.1}s`,
                      }}
                    >
                      <div
                        className="w-full rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center"
                        style={{ height: '192px', minHeight: '192px', maxHeight: '192px' }}
                      >
                        {mediaType === 'image' && mediaUrl ? (
                          <img
                            src={mediaUrl}
                            alt={event.title}
                            className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : mediaType === 'video' && mediaUrl ? (
                          <video
                            src={mediaUrl}
                            className="w-full h-full object-cover object-center"
                            autoPlay
                            loop
                            muted
                            playsInline
                            preload="metadata"
                            poster={event.media_urls.find(url => url.match(/\.(jpg|jpeg|png|webp|avif)$/i)) || undefined}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">No Media</div>
                        )}
                      </div>
                      <div className="text-center flex-1 flex flex-col justify-start w-full">
                        <h3 className="text-lg sm:text-xl font-bold text-blue-800 mb-1 truncate w-full" title={event.title}>
                          {event.title}
                        </h3>
                        <div className="text-xs sm:text-sm text-gray-500 mb-1">{formatDate(event.start_date)}</div>
                        <div className="text-xs sm:text-sm text-gray-400 mb-1">{event.location}</div>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2 w-full" title={event.description}>
                          {event.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </Slider>
          )}
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 8s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .animate-pulse {
          animation: pulse 4s cubic-bezier(.4,0,.2,1) infinite;
        }
        @keyframes fadein {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadein {
          animation: fadein 0.8s cubic-bezier(.4,0,.2,1) both;
        }
        @keyframes cardin {
          from { opacity: 0; transform: scale(0.95) translateY(30px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-cardin {
          animation: cardin 1s cubic-bezier(.4,0,.2,1) both;
        }
        .slick-slide {
          transition: transform 0.5s cubic-bezier(.4,0,.2,1), opacity 0.5s cubic-bezier(.4,0,.2,1);
          padding: 0 8px;
        }
        .slick-slide:not(.slick-center) {
          transform: scale(0.85);
          opacity: 0.6;
        }
        .slick-center {
          transform: scale(1);
          opacity: 1;
          z-index: 20;
        }
        @media (max-width: 1024px) {
          .slick-slide:not(.slick-center) {
            transform: scale(0.9);
          }
        }
        @media (max-width: 768px) {
          .slick-slide {
            padding: 0 4px;
          }
          .slick-slide:not(.slick-center) {
            transform: scale(0.95);
            opacity: 0.8;
          }
        }
        .slick-dots li button:before {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
          border: 2px solid #3b82f6;
          border-radius: 50%;
          width: 12px;
          height: 12px;
          line-height: 12px;
        }
        .slick-dots li.slick-active button:before {
          background: #3b82f6;
          color: #3b82f6;
          transform: scale(1.25);
        }
      `}</style>
    </div>
  );
}

export default TrendingEvents;