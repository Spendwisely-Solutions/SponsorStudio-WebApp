'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import NavBar from './NavBar';
import Footer from './Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Clock, 
  Tag,
  Share2,
  ChevronLeft,
  Volume2,
  VolumeX,
  X,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

interface EventData {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  price_range: {
    min: number;
    max: number;
  };
  reach: number;
  footfall?: number;
  media_urls: string[];
  status: string;
  created_at: string;
  requirements?: string;
  benefits?: string;
  organization_name?: string;
  organization_address?: string;
  poc_name?: string;
  poc_position?: string;
  calendly_link?: string;
  sponsorship_brochure_url?: string;
  is_verified: boolean;
  is_vip: boolean;
  category?: { 
    id: string; 
    name: string;
    description?: string;
  };
  creator?: {
    id: string;
    company_name?: string;
    contact_person_name?: string;
  };
}

export default function EventDetails() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const opportunityId = searchParams.get('id');
  
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!opportunityId) {
      toast.error('Event ID is required');
      router.push('/trending-events');
      return;
    }

    fetchEventDetails();
  }, [opportunityId]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(
        `https://urablfvmqregyvfyaovi.supabase.co/functions/v1/get-opportunity-by-id?id=${opportunityId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch event');
      }

      const result = await response.json();

      if (!result.data) {
        toast.error('Event not found');
        router.push('/trending-events');
        return;
      }

      setEvent(result.data);
    } catch (error: any) {
      console.error('Error fetching event:', error);
      toast.error('Failed to load event details');
      router.push('/trending-events');
    } finally {
      setLoading(false);
    }
  };

  const isVideoUrl = (url: string) => {
    return url.match(/\.(mp4|webm|ogg|mov)$/i) || url.includes('video');
  };

  const handleToggleMute = () => {
    if (videoRef.current) {
      const newMuteState = !isMuted;
      setIsMuted(newMuteState);
      videoRef.current.muted = newMuteState;
      toast(newMuteState ? 'Video muted' : 'Playing with sound', {
        icon: newMuteState ? '🔇' : '🔊',
      });
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: event?.title || 'Check out this event',
      text: event?.description || '',
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatReach = (reach: number) => {
    if (reach >= 1000000) {
      return `${(reach / 1000000).toFixed(1)}M`;
    } else if (reach >= 1000) {
      return `${(reach / 1000).toFixed(1)}K`;
    }
    return reach.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <NavBar hideAuthButton={true} />
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 font-medium">Loading event details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  const currentMedia = event.media_urls?.[selectedMediaIndex];
  const isCurrentVideo = currentMedia ? isVideoUrl(currentMedia) : false;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <NavBar hideAuthButton={true} />

        <div className="container mx-auto px-4 py-8 max-w-7xl pt-12">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-6 group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back</span>
          </motion.button>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Media Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4 lg:sticky lg:top-8 lg:self-start"
            >
              {/* Main Media Display */}
              <div className="relative bg-white rounded-3xl overflow-hidden shadow-lg aspect-[4/3] group">
                {event.media_urls && event.media_urls.length > 0 ? (
                  <>
                    {isCurrentVideo ? (
                      <div className="relative w-full h-full">
                        <video
                          ref={videoRef}
                          src={currentMedia}
                          className="w-full h-full object-cover"
                          autoPlay
                          loop
                          muted={isMuted}
                          playsInline
                        />
                        <button
                          onClick={handleToggleMute}
                          className="absolute top-4 right-4 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all backdrop-blur-sm z-10"
                        >
                          {isMuted ? (
                            <VolumeX className="w-5 h-5" />
                          ) : (
                            <Volume2 className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <img
                        src={currentMedia}
                        alt={event.title}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setIsMediaModalOpen(true)}
                      />
                    )}
                    
                    {/* Fullscreen Button */}
                    <button
                      onClick={() => setIsMediaModalOpen(true)}
                      className="absolute bottom-4 right-4 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all backdrop-blur-sm opacity-0 group-hover:opacity-100"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100">
                    <div className="text-center">
                      <Tag className="w-16 h-16 text-blue-300 mx-auto mb-2" />
                      <p className="text-gray-500">No media available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Media Thumbnails */}
              {event.media_urls && event.media_urls.length > 1 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                  {event.media_urls.map((url, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setSelectedMediaIndex(index)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative aspect-square rounded-lg sm:rounded-xl overflow-hidden bg-gray-100 ${
                        selectedMediaIndex === index
                          ? 'ring-2 sm:ring-4 ring-blue-500'
                          : 'ring-1 sm:ring-2 ring-gray-200 hover:ring-gray-300'
                      }`}
                    >
                      {isVideoUrl(url) ? (
                        <>
                          <video
                            src={url}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <Volume2 className="w-4 h-4 sm:w-6 sm:h-6 text-white drop-shadow-lg" />
                          </div>
                        </>
                      ) : (
                        <img
                          src={url}
                          alt={`Media ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Event Details Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-lg border border-blue-100/40">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 pr-2">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                      {event.title}
                    </h1>
                    
                    {event.category && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                        >
                          {event.category.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleShare}
                    className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Brand Info */}
                {event.creator && (
                  <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {(event.creator.company_name || event.creator.contact_person_name || event.organization_name || 'U')?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {event.creator.company_name || event.creator.contact_person_name || event.organization_name || 'Unknown'}
                      </p>
                      {event.organization_name && event.creator.company_name !== event.organization_name && (
                        <p className="text-sm text-gray-600">{event.organization_name}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Key Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
                  <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl">
                    <div className="p-2 bg-white rounded-lg sm:rounded-xl shadow-sm flex-shrink-0">
                      <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-600 mb-1">Price Range</p>
                      <p className="font-bold text-gray-900 text-xs sm:text-sm truncate">{formatCurrency(event.price_range.min)} - {formatCurrency(event.price_range.max)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl">
                    <div className="p-2 bg-white rounded-lg sm:rounded-xl shadow-sm flex-shrink-0">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-600 mb-1">Expected Reach</p>
                      <p className="font-bold text-gray-900 text-sm sm:text-base">{formatReach(event.reach)}+</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl">
                    <div className="p-2 bg-white rounded-lg sm:rounded-xl shadow-sm flex-shrink-0">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-600 mb-1">Event Date</p>
                      <p className="font-bold text-gray-900 text-xs sm:text-sm">
                        {formatDate(event.start_date)}
                        {event.end_date && event.end_date !== event.start_date && (
                          <> - {formatDate(event.end_date)}</>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl sm:rounded-2xl">
                    <div className="p-2 bg-white rounded-lg sm:rounded-xl shadow-sm flex-shrink-0">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-600 mb-1">Location</p>
                      <p className="font-bold text-gray-900 text-xs sm:text-sm truncate">{event.location}</p>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Posted on {formatDate(event.created_at)}</span>
                  <span
                    className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${
                      event.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : event.status === 'closed'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-lg border border-blue-100/40">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">About This Event</h2>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">{event.description}</p>
                
                {/* Benefits */}
                {event.benefits && (
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">Benefits</h3>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">{event.benefits}</p>
                  </div>
                )}

                {/* Requirements */}
                {event.requirements && (
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">Requirements</h3>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">{event.requirements}</p>
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.sponsorstudio.in';
                  window.location.href = `${APP_URL}/signin`;
                }}
                className="w-full py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm sm:text-base font-semibold rounded-xl sm:rounded-2xl shadow-lg transition-all"
              >
                Collaborate With This Event 🤝
              </motion.button>
            </motion.div>
          </div>
        </div>

        <Footer />
      </div>

      {/* Media Modal */}
      <AnimatePresence>
        {isMediaModalOpen && currentMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setIsMediaModalOpen(false)}
          >
            <button
              onClick={() => setIsMediaModalOpen(false)}
              className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-7xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {isCurrentVideo ? (
                <div className="relative">
                  <video
                    src={currentMedia}
                    className="w-full h-auto max-h-[90vh] rounded-lg"
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    controls
                  />
                </div>
              ) : (
                <img
                  src={currentMedia}
                  alt={event.title}
                  className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
