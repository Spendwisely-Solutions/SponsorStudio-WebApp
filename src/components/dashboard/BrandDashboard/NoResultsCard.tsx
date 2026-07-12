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
    <div className="bg-white rounded-lg shadow-sm p-6 text-center">
      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <Search className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
      </div>
      <h3 className="text-base sm:text-xl font-medium text-gray-800 mb-2">
        No {type} found
      </h3>
      <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
        {type === 'events'
          ? 'There are no events available matching your criteria. Try resetting filters or reviving previously disliked opportunities.'
          : 'We couldn’t find any influencer posts matching your criteria. Try adjusting your filters.'}
      </p>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
        <button
          onClick={resetFilters}
          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#2B4B9B] text-white rounded-lg hover:bg-[#1a2f61] text-xs sm:text-sm"
          disabled={isSubmitting}
        >
          Reset Filters
        </button>
        {type === 'events' && resetDislikedEvents && (
          <button
            onClick={handleOpenModal}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#2B4B9B] text-white rounded-lg hover:bg-[#1a2f61] text-xs sm:text-sm disabled:opacity-90 disabled:cursor-not-allowed"
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
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-xs sm:text-sm disabled:opacity-90 disabled:cursor-not-allowed"
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