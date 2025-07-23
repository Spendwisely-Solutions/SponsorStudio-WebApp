import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Calendar,
  Users,
  DollarSign,
  BarChart3,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  AlertCircle,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
  FileText,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import type { Database } from '../../../lib/database.types';

type Opportunity = Database['public']['Tables']['opportunities']['Row'] & {
  price_range?: { min?: number | null; max?: number | null } | null;
  mou_url?: string | null;
};
type Category = Database['public']['Tables']['categories']['Row'];
type Match = Database['public']['Tables']['matches']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row'];
  opportunities?: Database['public']['Tables']['opportunities']['Row'];
};

interface EventCardProps {
  opportunity: Opportunity;
  matches: Match[];
  categories: Category[];
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  onViewAnalytics: () => void;
}

function getVerificationStatusBadge(status: string | null) {
  switch (status) {
    case 'pending':
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-sm">
          Pending
        </span>
      );
    case 'approved':
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-green-400 to-green-600 text-white shadow-sm">
          Verified
        </span>
      );
    case 'rejected':
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-red-400 to-red-600 text-white shadow-sm">
          Rejected
        </span>
      );
    default:
      return null;
  }
}

export default function EventCard({
  opportunity,
  matches,
  categories,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewAnalytics,
}: EventCardProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [mouId, setMouId] = useState<string | null>(null);
  const [loadingMou, setLoadingMou] = useState(true);
  const [impressionCount, setImpressionCount] = useState<number | null>(null);
  const navigate = useNavigate();

  // Fetch MOU ID or URL based on VIP status
  useEffect(() => {
    const fetchMouId = async () => {
      try {
        if (opportunity.is_vip && opportunity.mou_url) {
          // For VIP opportunities, construct full URL with mou_url
          const baseUrl = 'https://urablfvmqregyvfyaovi.supabase.co/storage/v1/object/public/mou-documents/';
          setMouId(`${baseUrl}${opportunity.mou_url}`);
        } else if (opportunity.mou_id) {
          // For non-VIP opportunities, use mou_id
          setMouId(opportunity.mou_id);
        } else {
          console.log('No mou_id or mou_url found for opportunity:', opportunity.id);
          setMouId(null);
        }
      } catch (err) {
        console.error('Unexpected error fetching MOU ID/URL:', err);
        setMouId(null);
      } finally {
        setLoadingMou(false);
      }
    };

    fetchMouId();
  }, [opportunity.is_vip, opportunity.mou_url, opportunity.mou_id, opportunity.id]);

  // Fetch impression count from impressions table
  useEffect(() => {
    const fetchImpressionCount = async () => {
      try {
        const { count, error } = await supabase
          .from('impressions')
          .select('*', { count: 'exact', head: true })
          .eq('opportunity_id', opportunity.id);

        if (error) {
          console.error('Error fetching impression count:', error);
          setImpressionCount(0);
          return;
        }

        setImpressionCount(count || 0);
      } catch (err) {
        console.error('Unexpected error fetching impression count:', err);
        setImpressionCount(0);
      }
    };

    fetchImpressionCount();
  }, [opportunity.id]);

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name ?? 'Unknown Category';
  };

  const isVideoUrl = (url: string): boolean => {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
    return videoExtensions.some((ext) => url.toLowerCase().endsWith(ext));
  };

  const handleViewMou = () => {
    if (mouId) {
      if (opportunity.is_vip) {
        // For VIP opportunities, open mou_url in a new tab
        window.open(mouId, '_blank', 'noopener,noreferrer');
      } else {
        // For non-VIP opportunities, navigate to view-mou route with mou_id
        navigate('/view-mou', { state: { mouId } });
      }
    }
  };

  // Background logic
  const firstImageUrl = opportunity.media_urls?.find((url) => !isVideoUrl(url));
  const hasImageBackground = !!firstImageUrl;
  const backgroundStyle = hasImageBackground
    ? {
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url(${firstImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {
        background: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)',
      };

  // Framer Motion variants
  const cardVariants = {
    hidden: { opacity: 0, y: 30, rotateX: 10 },
    visible: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    hover: { scale: 1.02, transition: { duration: 0.3 } },
  };

  const buttonVariants = {
    hover: { scale: 1.15, rotate: 5, transition: { duration: 0.2 } },
    tap: { scale: 0.9 },
  };

  const toggleVariants = {
    hover: { scale: 1.1, transition: { duration: 0.2 } },
    tap: { scale: 0.9 },
  };

  const tooltipVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      className="rounded-2xl shadow-lg overflow-hidden border border-gray-200/50 w-full"
      style={backgroundStyle}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <div
        className={`p-6 sm:p-8 ${hasImageBackground ? 'bg-gradient-to-t from-black/60 to-transparent backdrop-blur-sm' : 'bg-transparent'}`}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3
                className={`text-xl sm:text-2xl font-extrabold truncate ${
                  hasImageBackground ? 'text-white' : 'text-gray-900'
                }`}
              >
                {opportunity.title ?? 'Untitled'}
              </h3>
              <div className="flex gap-2">
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    opportunity.status === 'active'
                      ? 'bg-gradient-to-r from-indigo-400 to-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-800'
                  } shadow-sm`}
                >
                  {opportunity.status === 'active' ? 'Active' : 'Paused'}
                </span>
                {getVerificationStatusBadge(opportunity.verification_status)}
                {opportunity.is_vip && (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-amber-400 to-yellow-600 text-white shadow-sm flex items-center">
                    <Sparkles className="w-3 h-3 mr-1" />
                    VIP
                  </span>
                )}
              </div>
            </div>
            <p
              className={`text-sm font-medium ${
                hasImageBackground ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              {getCategoryName(opportunity.category_id)}
            </p>
          </div>
          <motion.div
            className="group relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span
              className={`text-sm font-semibold ${
                hasImageBackground ? 'text-indigo-300' : 'text-indigo-600'
              }`}
            >
              {matches.length} {matches.length === 1 ? 'match' : 'matches'}
            </span>
            <motion.div
              className="absolute hidden group-hover:block bg-indigo-900 text-white text-xs rounded-lg py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2 shadow-lg z-10"
              variants={tooltipVariants}
              initial="hidden"
              animate="visible"
            >
              View details in Matches section
            </motion.div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          className="flex justify-end space-x-2 mb-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          {mouId && !loadingMou && (
            <motion.button
              onClick={handleViewMou}
              className={`p-2 rounded-full transition-all duration-300 ${
                hasImageBackground
                  ? 'text-gray-200 hover:text-white hover:bg-blue-500/50'
                  : 'text-gray-600 hover:text-white hover:bg-blue-600'
              }`}
              title={opportunity.is_vip ? 'View VIP MOU Link' : 'View MOU'}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <FileText className="w-5 h-5" />
            </motion.button>
          )}
          <motion.button
            onClick={onViewAnalytics}
            className={`p-2 rounded-full transition-all duration-300 ${
              hasImageBackground
                ? 'text-gray-200 hover:text-white hover:bg-indigo-500/50'
                : 'text-gray-600 hover:text-white hover:bg-indigo-600'
              }`}
            title="View Analytics"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <BarChart3 className="w-5 h-5" />
          </motion.button>
          <motion.button
            onClick={onToggleStatus}
            className={`p-2 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
              hasImageBackground
                ? 'text-gray-200 hover:text-white hover:bg-indigo-500/50'
                : 'text-gray-600 hover:text-white hover:bg-indigo-600'
              }`}
            title={opportunity.status === 'active' ? 'Pause Opportunity' : 'Activate Opportunity'}
            disabled={opportunity.verification_status !== 'approved'}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            {opportunity.status === 'active' ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </motion.button>
          <motion.button
            onClick={onEdit}
            className={`p-2 rounded-full transition-all duration-300 ${
              hasImageBackground
                ? 'text-gray-200 hover:text-white hover:bg-indigo-500/50'
                : 'text-gray-600 hover:text-white hover:bg-indigo-600'
              }`}
            title="Edit Opportunity"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Edit className="w-5 h-5" />
          </motion.button>
          <motion.button
            onClick={onDelete}
            className={`p-2 rounded-full transition-all duration-300 ${
              hasImageBackground
                ? 'text-gray-200 hover:text-white hover:bg-red-500/50'
                : 'text-gray-600 hover:text-white hover:bg-red-600'
              }`}
            title="Delete Opportunity"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Trash2 className="w-5 h-5" />
          </motion.button>
        </motion.div>

        {/* Verification Alerts */}
        {opportunity.verification_status === 'pending' && (
          <motion.div
            className="mb-6 p-4 bg-yellow-100/80 border-l-4 border-yellow-500 rounded-r-lg backdrop-blur-sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0" />
              <p className="text-sm text-yellow-800 font-medium">
                Pending verification. Visible to brands once approved.
              </p>
            </div>
          </motion.div>
        )}
        {opportunity.verification_status === 'rejected' && (
          <motion.div
            className="mb-6 p-4 bg-red-100/80 border-l-4 border-red-500 rounded-r-lg backdrop-blur-sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-800 font-medium">
                  Rejected during verification.
                </p>
                {opportunity.rejection_reason && (
                  <p className="text-sm text-red-800 mt-1">
                    Reason: {opportunity.rejection_reason}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Details Grid */}
        <motion.div
          className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 rounded-xl ${
            hasImageBackground ? 'bg-white/10 backdrop-blur-md' : 'bg-gray-100'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.div
            className="flex items-center group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <MapPin
              className={`w-4 h-4 mr-2 flex-shrink-0 ${
                hasImageBackground ? 'text-gray-300' : 'text-gray-500'
              } group-hover:text-indigo-500 transition-colors`}
            />
            <span
              className={`text-sm truncate ${
                hasImageBackground ? 'text-gray-200' : 'text-gray-700'
              }`}
            >
              {opportunity.location ?? 'Unknown Location'}
            </span>
          </motion.div>
          {opportunity.start_date && (
            <motion.div
              className="flex items-center group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Calendar
                className={`w-4 h-4 mr-2 flex-shrink-0 ${
                  hasImageBackground ? 'text-gray-300' : 'text-gray-500'
                } group-hover:text-indigo-500 transition-colors`}
              />
              <span
                className={`text-sm truncate ${
                  hasImageBackground ? 'text-gray-200' : 'text-gray-700'
                }`}
              >
                {opportunity.end_date &&
                new Date(opportunity.start_date).toDateString() ===
                  new Date(opportunity.end_date).toDateString()
                  ? new Date(opportunity.start_date).toLocaleDateString('en-IN')
                  : `${new Date(opportunity.start_date).toLocaleDateString('en-IN')}${
                      opportunity.end_date
                        ? ` - ${new Date(opportunity.end_date).toLocaleDateString('en-IN')}`
                        : ''
                    }`}
              </span>
            </motion.div>
          )}
          {opportunity.reach && (
            <motion.div
              className="flex items-center group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Users
                className={`w-4 h-4 mr-2 flex-shrink-0 ${
                  hasImageBackground ? 'text-gray-300' : 'text-gray-500'
                } group-hover:text-indigo-500 transition-colors`}
              />
              <span
                className={`text-sm ${
                  hasImageBackground ? 'text-gray-200' : 'text-gray-700'
                }`}
              >
                {opportunity.reach.toLocaleString('en-IN')} reach
              </span>
            </motion.div>
          )}
          {opportunity.price_range && (
            <motion.div
              className="flex items-center group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <DollarSign
                className={`w-4 h-4 mr-2 flex-shrink-0 ${
                  hasImageBackground ? 'text-gray-300' : 'text-gray-500'
                } group-hover:text-indigo-500 transition-colors`}
              />
              <span
                className={`text-sm truncate ${
                  hasImageBackground ? 'text-gray-200' : 'text-gray-700'
                }`}
              >
                {typeof opportunity.price_range === 'object' &&
                opportunity.price_range &&
                (opportunity.price_range.min || opportunity.price_range.max)
                  ? opportunity.price_range.min && opportunity.price_range.max
                    ? `₹${opportunity.price_range.min.toLocaleString('en-IN')} - ₹${opportunity.price_range.max.toLocaleString('en-IN')}`
                    : opportunity.price_range.min
                    ? `₹${opportunity.price_range.min.toLocaleString('en-IN')}`
                    : `₹${opportunity.price_range.max!.toLocaleString('en-IN')}`
                  : 'Contact for pricing'}
              </span>
            </motion.div>
          )}
          <motion.div
            className="flex items-center group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Eye
              className={`w-4 h-4 mr-2 flex-shrink-0 ${
                hasImageBackground ? 'text-gray-300' : 'text-gray-500'
              } group-hover:text-indigo-500 transition-colors`}
            />
            <span
              className={`text-sm ${
                hasImageBackground ? 'text-gray-200' : 'text-gray-700'
              }`}
            >
              {impressionCount !== null ? `${impressionCount.toLocaleString('en-IN')} impressions` : 'Loading...'}
            </span>
          </motion.div>
        </motion.div>

        {/* Links */}
        <motion.div
          className="flex flex-wrap gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          {opportunity.calendly_link && (
            <motion.a
              href={opportunity.calendly_link}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center text-sm font-medium ${
                hasImageBackground
                  ? 'text-indigo-300 hover:text-indigo-100'
                  : 'text-indigo-600 hover:text-indigo-800'
              } transition-colors`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
            >
              <Calendar className="w-4 h-4 mr-1" />
              Schedule a Call
            </motion.a>
          )}
          {opportunity.sponsorship_brochure_url && (
            <motion.a
              href={opportunity.sponsorship_brochure_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center text-sm font-medium ${
                hasImageBackground
                  ? 'text-indigo-300 hover:text-indigo-100'
                  : 'text-indigo-600 hover:text-indigo-800'
              } transition-colors`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              <LinkIcon className="w-4 h-4 mr-1" />
              View Brochure
            </motion.a>
          )}
        </motion.div>

        {/* Media */}
        {opportunity.media_urls && opportunity.media_urls.length > 0 && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <h4
              className={`text-sm font-semibold mb-3 ${
                hasImageBackground ? 'text-gray-200' : 'text-gray-800'
              }`}
            >
              Media
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {opportunity.media_urls.map((url, index) => (
                <motion.div
                  key={index}
                  className="relative overflow-hidden rounded-lg"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 1.3 + index * 0.1 }}
                  whileHover={{ scale: 1.05, boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}
                >
                  {isVideoUrl(url) ? (
                    <video
                      src={url}
                      controls
                      className="w-full h-20 sm:h-24 md:h-28 object-cover"
                    />
                  ) : (
                    <img
                      src={url}
                      alt={`Media ${index + 1}`}
                      className="w-full h-20 sm:h-24 md:h-28 object-cover"
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Description */}
        {opportunity.description && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
          >
            <h4
              className={`text-sm font-semibold mb-2 ${
                hasImageBackground ? 'text-gray-200' : 'text-gray-800'
              }`}
            >
              Description
            </h4>
            <div className="relative">
              <AnimatePresence>
                {!isDescriptionExpanded && (
                  <motion.p
                    className={`text-sm ${
                      hasImageBackground ? 'text-gray-300' : 'text-gray-600'
                    } line-clamp-3`}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {opportunity.description}
                  </motion.p>
                )}
                {isDescriptionExpanded && (
                  <motion.p
                    className={`text-sm ${
                      hasImageBackground ? 'text-gray-300' : 'text-gray-600'
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {opportunity.description}
                  </motion.p>
                )}
              </AnimatePresence>
              {opportunity.description.length > 150 && (
                <motion.button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className={`mt-2 text-sm font-medium ${
                    hasImageBackground
                      ? 'text-indigo-300 hover:text-indigo-100'
                      : 'text-indigo-600 hover:text-indigo-800'
                  } flex items-center`}
                  variants={toggleVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  {isDescriptionExpanded ? 'Read Less' : 'Read More'}
                  {isDescriptionExpanded ? (
                    <ChevronUp className="w-4 h-4 ml-1" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-1" />
                  )}
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}