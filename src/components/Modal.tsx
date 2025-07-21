import React, { useEffect, useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  cancelButtonClass?: string;
}

export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonClass = 'bg-red-600 text-white hover:bg-red-700',
  cancelButtonClass = 'border-gray-300 text-gray-700 hover:bg-gray-50'
}: ModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const preventScroll = (e: Event) => {
      e.preventDefault();
    };

    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
      document.body.style.width = '100vw';
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.height = '100vh';
      document.documentElement.style.width = '100vw';
      window.addEventListener('wheel', preventScroll, { passive: false });
      window.addEventListener('touchmove', preventScroll, { passive: false });
      const timer = setTimeout(() => setAnimate(true), 10);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
        document.body.style.height = '';
        document.body.style.width = '';
        document.documentElement.style.overflow = '';
        document.documentElement.style.height = '';
        document.documentElement.style.width = '';
        window.removeEventListener('wheel', preventScroll);
        window.removeEventListener('touchmove', preventScroll);
      };
    } else {
      setAnimate(false);
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
        document.body.style.height = '';
        document.body.style.width = '';
        document.documentElement.style.overflow = '';
        document.documentElement.style.height = '';
        document.documentElement.style.width = '';
      };
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed top-0 left-0 w-[100vw] h-[100vh] bg-black/30 backdrop-blur-md flex items-center justify-center p-8 z-[1000] overflow-hidden "
      style={{ transform: 'none !important' }}
    >
      <div
        className={`bg-white p-6 rounded-lg shadow-lg w-full max-w-md  max-h-[90vh] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out overflow-y-auto ${
          animate ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className={`px-4 py-2 border rounded-lg ${cancelButtonClass}`}
            disabled={isSubmitting}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-lg flex items-center ${confirmButtonClass} ${
              isSubmitting ? 'opacity-90 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting && (
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {isSubmitting ? 'Please wait...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}