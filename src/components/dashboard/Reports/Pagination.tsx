import React from 'react';
import { motion } from 'framer-motion';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  loading: boolean;
}

export default function Pagination({ currentPage, totalPages, setCurrentPage, loading }: PaginationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-between gap-2 mt-6 px-4"
    >
      <motion.button
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={currentPage === 1 || loading}
        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Previous page"
      >
        Previous
      </motion.button>
      <div className="flex gap-1">
        {[...Array(totalPages)].map((_, i) => (
          <motion.button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-2 rounded-lg text-sm font-semibold ${
              currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-current={currentPage === i + 1 ? 'page' : undefined}
          >
            {i + 1}
          </motion.button>
        ))}
      </div>
      <motion.button
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={currentPage === totalPages || loading}
        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Next page"
      >
        Next
      </motion.button>
    </motion.div>
  );
}