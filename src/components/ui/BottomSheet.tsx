import React, { useEffect, useState } from 'react';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  maxHeight?: string;
  children: React.ReactNode;
  className?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  maxHeight = '75vh',
  children,
  className = '',
}) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const preventScroll = (e: Event) => e.preventDefault();

    if (isOpen) {
      setShouldRender(true);
      document.body.style.overflow = 'hidden';
      window.addEventListener('wheel', preventScroll, { passive: false });
      window.addEventListener('touchmove', preventScroll, { passive: false });
      const timer = setTimeout(() => setAnimate(true), 10);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
        window.removeEventListener('wheel', preventScroll);
        window.removeEventListener('touchmove', preventScroll);
      };
    } else {
      setAnimate(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  const backdropAnimateClass = animate ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0 backdrop-blur-none';
  const drawerAnimateClass = animate ? 'translate-y-0' : 'translate-y-full';

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center overflow-hidden">
      {/* Overlay Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 transition-all duration-300 ease-in-out cursor-pointer ${backdropAnimateClass}`}
      />

      {/* Slide-up Sheet */}
      <div
        className={`relative w-full max-w-lg bg-surface/95 border-t border-border rounded-t-[32px] backdrop-blur-xl shadow-lg transition-transform duration-300 ease-out flex flex-col ${drawerAnimateClass} ${className}`}
        style={{ maxHeight }}
      >
        {/* Drag Handle Decorator */}
        <div className="w-full py-4 flex justify-center shrink-0 cursor-pointer" onClick={onClose}>
          <div className="w-12 h-1 bg-border rounded-full hover:bg-border/80 transition-colors" />
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto px-6 pb-8 text-sm text-text-secondary">
          {children}
        </div>
      </div>
    </div>
  );
};

export default BottomSheet;
