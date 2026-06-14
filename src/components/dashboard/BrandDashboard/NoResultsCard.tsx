import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import { useModal } from '../../../contexts/ModalContext'; // Adjust path to match your ModalContext

interface NoResultsCardProps {
  type: 'events' | 'influencer posts';
  resetFilters: () => void;
  resetDislikedEvents?: () => Promise<void>;
  resetDislikedPosts?: () => Promise<void>;
}

const NoResultsCard: React.FC<NoResultsCardProps> = ({ type, resetFilters, resetDislikedEvents, resetDislikedPosts }) => {
  const { openModal, closeModal } = useModal();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = () => {
    openModal({
      title: type === 'events' ? 'Confirm Revive Opportunities' : 'Confirm Revive Posts',
      message: type === 'events' ? 'Reviving opportunities will cost 300 credits. Proceed?' : 'Reviving posts will cost 300 credits. Proceed?',
      confirmText: 'Yes, Revive',
      cancelText: 'Cancel',
      confirmButtonClass: 'bg-[#2B4B9B] text-white hover:bg-[#1a2f61] flex items-center',
      cancelButtonClass: 'border-gray-300 text-gray-700 hover:bg-gray-50',
      onConfirm: async () => {
        setIsSubmitting(true);
        try {
          if (type === 'events' && resetDislikedEvents) {
            await resetDislikedEvents();
          } else if (type === 'influencer posts' && resetDislikedPosts) {
            await resetDislikedPosts();
          }
        } finally {
          setIsSubmitting(false);
          closeModal();
        }
      },
    });
  };

  return (
    <div className="liquid-glass-card rounded-xl p-6 text-center">
      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gray-100 dark:bg-sky-500/10 dark:border dark:border-sky-500/25 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.1)]">
        <Search className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 dark:text-sky-400" />
      </div>
      <h3 className="text-base sm:text-xl font-medium text-gray-800 dark:text-white mb-2">
        No {type} found
      </h3>
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
        {type === 'events'
          ? 'There are no events available matching your criteria. Try resetting filters or reviving previously disliked opportunities.'
          : 'We couldn’t find any influencer posts matching your criteria. Try adjusting your filters.'}
      </p>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
        <button
          onClick={resetFilters}
          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#2B4B9B] dark:bg-gradient-to-r dark:from-sky-400 dark:to-blue-500 dark:text-slate-950 dark:font-semibold text-white rounded-lg hover:bg-[#1a2f61] dark:hover:from-sky-500 dark:hover:to-blue-600 transition-all duration-200 border-0 shadow-lg dark:shadow-sky-500/10 text-xs sm:text-sm click-effect"
          disabled={isSubmitting}
        >
          Reset Filters
        </button>
        {type === 'events' && resetDislikedEvents && (
          <button
            onClick={handleOpenModal}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#2B4B9B] dark:bg-gradient-to-r dark:from-sky-400 dark:to-blue-500 dark:text-slate-950 dark:font-semibold text-white rounded-lg hover:bg-[#1a2f61] dark:hover:from-sky-500 dark:hover:to-blue-600 transition-all duration-200 border-0 shadow-lg dark:shadow-sky-500/10 text-xs sm:text-sm disabled:opacity-90 disabled:cursor-not-allowed click-effect"
            data-tooltip-id="revive-tooltip"
            data-tooltip-content="Clear all disliked opportunities to view them again"
            disabled={isSubmitting}
          >
            Revive Opportunities
          </button>
        )}
        {type === 'influencer posts' && resetDislikedPosts && (
          <button
            onClick={handleOpenModal}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-600 dark:bg-gradient-to-r dark:from-fuchsia-400 dark:to-purple-500 dark:text-slate-950 dark:font-semibold text-white rounded-lg hover:bg-purple-700 dark:hover:from-fuchsia-500 dark:hover:to-purple-600 transition-all duration-200 border-0 shadow-lg dark:shadow-purple-500/10 text-xs sm:text-sm disabled:opacity-90 disabled:cursor-not-allowed click-effect"
            data-tooltip-id="revive-tooltip"
            data-tooltip-content="Clear all disliked posts to view them again"
            disabled={isSubmitting}
          >
            Revive Posts (300 credits)
          </button>
        )}
      </div>
      <Tooltip id="revive-tooltip" place="top" className="text-xs" />
    </div>
  );
};

export default NoResultsCard;