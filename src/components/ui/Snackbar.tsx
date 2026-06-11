import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type SnackbarSeverity = 'success' | 'info' | 'warning' | 'error';

export interface SnackbarOrigin {
  vertical: 'top' | 'bottom';
  horizontal: 'left' | 'center' | 'right';
}

export interface SnackbarProps {
  isOpen: boolean;
  message: React.ReactNode;
  onClose: () => void;
  autoHideDuration?: number;
  severity?: SnackbarSeverity;
  anchorOrigin?: SnackbarOrigin;
  action?: React.ReactNode;
  className?: string;
}

const severityIcons: Record<SnackbarSeverity, React.ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5 text-success shrink-0" />,
  info: <Info className="w-5 h-5 text-info shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-warning shrink-0" />,
  error: <AlertCircle className="w-5 h-5 text-danger shrink-0" />,
};

const severityClasses: Record<SnackbarSeverity, string> = {
  success: 'border-success/20 bg-success/5 text-success',
  info: 'border-info/20 bg-info/5 text-info',
  warning: 'border-warning/20 bg-warning/5 text-warning',
  error: 'border-danger/20 bg-danger/5 text-danger',
};

export const Snackbar: React.FC<SnackbarProps> = ({
  isOpen,
  message,
  onClose,
  autoHideDuration = 4000,
  severity = 'info',
  anchorOrigin = { vertical: 'bottom', horizontal: 'right' },
  action,
  className = '',
}) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const timer = setTimeout(() => setAnimate(true), 10);
      return () => clearTimeout(timer);
    } else {
      setAnimate(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && autoHideDuration) {
      const timer = setTimeout(() => {
        onClose();
      }, autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoHideDuration, onClose]);

  if (!shouldRender) return null;

  // Placement styles
  let positionClass = 'fixed z-[9999] p-4 flex ';
  positionClass += anchorOrigin.vertical === 'top' ? 'top-6 ' : 'bottom-6 ';

  if (anchorOrigin.horizontal === 'left') {
    positionClass += 'left-6';
  } else if (anchorOrigin.horizontal === 'right') {
    positionClass += 'right-6';
  } else {
    positionClass += 'left-1/2 -translate-x-1/2';
  }

  // Animation directions depending on vertical placement
  const transitionClass = animate
    ? 'opacity-100 translate-y-0 scale-100'
    : `opacity-0 scale-95 ${anchorOrigin.vertical === 'top' ? '-translate-y-4' : 'translate-y-4'}`;

  return (
    <div className={`${positionClass} pointer-events-none`}>
      <div
        className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-300 ease-out ${
          severityClasses[severity]
        } ${transitionClass} ${className}`}
        style={{ maxWidth: '450px' }}
        role="alert"
      >
        {severityIcons[severity]}
        <div className="text-sm font-medium leading-relaxed break-words flex-1 pr-1">
          {message}
        </div>
        {action && <div className="flex items-center shrink-0">{action}</div>}
        <button
          onClick={onClose}
          className="shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors text-current opacity-70 hover:opacity-100"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Snackbar;
