import { motion } from 'framer-motion';
import { Tooltip } from 'react-tooltip';
import coinIcon from '../../../assets/dashboard/coin.png';
import { useTheme } from '../../../contexts/ThemeContext';

interface CreditBarProps {
  credits: number | null;
  shakeCredits: boolean;
  onAddCredits: () => void;
}

export default function CreditBar({ credits, shakeCredits, onAddCredits }: CreditBarProps) {
  const { theme } = useTheme();
  return (
    <>
      <motion.div
        className="mb-3 sm:mb-5 liquid-glass-card p-2.5 sm:p-4 rounded-xl overflow-hidden"
        animate={shakeCredits ? { x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.5 } } : {}}
        whileHover={{ scale: 1.005, transition: { duration: 0.2 } }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Credit Balance */}
          <div className="flex items-center space-x-2 sm:space-x-3.5 min-w-0">
            <div className="w-7 h-7 sm:w-10 sm:h-10 bg-blue-50 dark:bg-sky-500/10 dark:border dark:border-sky-500/20 rounded-lg flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(56,189,248,0.15)]">
              <img src={coinIcon} alt="Credits" className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex items-baseline">
              <span className="text-base sm:text-xl font-bold text-gray-800 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-sky-400 dark:to-indigo-300 whitespace-nowrap">
                {credits ?? 'N/A'}
              </span>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-normal ml-1">credits</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
            {/* How Credits Work Button */}
            <button
              className="flex items-center gap-1 p-1 sm:p-2 text-blue-600 dark:text-sky-400 hover:text-blue-800 dark:hover:text-sky-300 hover:bg-blue-50 dark:hover:bg-white/5 rounded-lg transition-all duration-200 click-effect"
              data-tooltip-id="credits-info-tooltip"
              title="How credits work"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">How Credits Work</span>
            </button>

            {/* Add Credits Button */}
            <button
              className="flex items-center justify-center gap-1 px-4 py-2 bg-[#2B4B9B] dark:bg-gradient-to-r dark:from-sky-400 dark:to-blue-500 dark:text-slate-950 dark:font-semibold text-white rounded-lg hover:bg-[#1a2f61] dark:hover:from-sky-500 dark:hover:to-blue-600 transition-all duration-200 w-32 h-12 sm:w-auto sm:h-auto border-0 shadow-lg dark:shadow-sky-500/25 click-effect"
              onClick={onAddCredits}
            >
              <svg className="w-5 h-5 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-sm font-medium">Add Credits</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Credit Information Tooltip */}
      <Tooltip
        id="credits-info-tooltip"
        place="bottom"
        className="!shadow-lg !border !rounded-lg !p-0 !opacity-100"
        style={{
          backgroundColor: theme === 'dark' ? '#0D1F3C' : '#ffffff',
          color: theme === 'dark' ? '#f9fafb' : '#1f2937',
          borderColor: theme === 'dark' ? '#1f2937' : '#e2e8f0',
          borderRadius: '8px',
          padding: '0',
          fontSize: '14px',
          maxWidth: '360px',
          zIndex: 1000,
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.15)',
        }}
        html={`
          <div class="p-4">
            <h3 class="font-bold text-gray-800 text-base sm:text-lg border-b border-gray-100 pb-2 mb-3">Credit Usage</h3>
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[15px] sm:text-base text-gray-700">Like/Interest</span>
                <span class="font-bold text-red-600 text-[15px] sm:text-base">50 credits</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-[15px] sm:text-base text-gray-700">Unlock Brochure</span>
                <span class="font-bold text-blue-600 text-[15px] sm:text-base">100 credits</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-[15px] sm:text-base text-gray-700">Post Event Report</span>
                <span class="font-bold text-green-600 text-[15px] sm:text-base">100 credits</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-[15px] sm:text-base text-gray-700">Revive Opportunities</span>
                <span class="font-bold text-orange-600 text-[15px] sm:text-base">300 credits</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-[15px] sm:text-base text-gray-700">Risk Analysis Report</span>
                <span class="font-bold text-purple-600 text-[15px] sm:text-base">500 credits</span>
              </div>
            </div>
            <p class="text-[13px] sm:text-[14px] text-gray-500 text-center mt-2 pt-2 border-t border-gray-100">
              Credits are deducted when actions are completed
            </p>
          </div>
        `}
      />
    </>
  );
}