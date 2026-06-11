import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  glow?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  maxWidth = 'sm',
  fullWidth = true,
  glow = false,
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

  const maxWidthClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-5xl',
  };

  const backdropAnimateClass = animate ? 'bg-black/50 backdrop-blur-md' : 'bg-black/0 backdrop-blur-none';
  const modalAnimateClass = animate ? 'scale-100 opacity-100' : 'scale-95 opacity-0';
  const borderGlowClass = glow ? 'shadow-[0_0_50px_color-mix(in_srgb,var(--color-primary)_15%,transparent)] border-primary/20' : 'border-border shadow-md';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Overlay Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 transition-all duration-300 ease-in-out cursor-pointer ${backdropAnimateClass}`}
      />

      {/* Dialog Shell */}
      <div
        className={`relative w-full rounded-3xl border bg-surface/90 backdrop-blur-xl transition-all duration-300 ease-out flex flex-col max-h-[90vh] ${
          maxWidthClasses[maxWidth]
        } ${fullWidth ? 'w-full' : ''} ${borderGlowClass} ${modalAnimateClass} ${className}`}
      >
        {children}
      </div>
    </div>
  );
};

export interface DialogTitleProps {
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const DialogTitle: React.FC<DialogTitleProps> = ({
  children,
  onClose,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between p-6 pb-4 border-b border-border shrink-0 ${className}`}>
      <h3 className="text-lg font-bold text-text-primary tracking-wide">{children}</h3>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 hover:bg-surface-hover/20 text-text-secondary hover:text-text-primary rounded-lg transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

export const DialogContent: React.FC<DialogContentProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`p-6 overflow-y-auto text-sm text-text-secondary leading-relaxed ${className}`}>
      {children}
    </div>
  );
};

export interface DialogActionsProps {
  children: React.ReactNode;
  className?: string;
}

export const DialogActions: React.FC<DialogActionsProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-end gap-3 p-6 pt-4 border-t border-border shrink-0 ${className}`}>
      {children}
    </div>
  );
};

export default Dialog;
