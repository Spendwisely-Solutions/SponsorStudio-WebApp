import React from 'react';

export type ButtonVariant = 'contained' | 'outlined' | 'text' | 'gradient' | 'glass';
export type ButtonColor = 'primary' | 'secondary' | 'accent' | 'success' | 'error' | 'warning' | 'white';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  glow?: boolean;
}

const Spinner: React.FC = () => (
  <svg
    className="animate-spin h-4 w-4 text-current"
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
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const variantStyles: Record<ButtonVariant, Record<ButtonColor, string>> = {
  contained: {
    primary: 'bg-primary hover:bg-primary-hover text-text-inverse',
    secondary: 'bg-secondary hover:bg-secondary-hover text-text-primary font-semibold',
    accent: 'bg-info hover:bg-info/90 text-text-inverse',
    success: 'bg-success hover:bg-success/90 text-text-inverse',
    error: 'bg-danger hover:bg-danger/90 text-text-inverse',
    warning: 'bg-warning hover:bg-warning/90 text-text-primary font-bold',
    white: 'bg-white hover:bg-gray-100 text-gray-900',
  },
  outlined: {
    primary: 'border border-primary text-primary hover:bg-primary/10',
    secondary: 'border border-secondary text-secondary hover:bg-secondary/10',
    accent: 'border border-info text-info hover:bg-info/10',
    success: 'border border-success text-success hover:bg-success/10',
    error: 'border border-danger text-danger hover:bg-danger/10',
    warning: 'border border-warning text-warning hover:bg-warning/10',
    white: 'border border-white/30 text-white hover:bg-white/10',
  },
  text: {
    primary: 'text-primary hover:bg-primary/10',
    secondary: 'text-secondary hover:bg-secondary/10',
    accent: 'text-info hover:bg-info/10',
    success: 'text-success hover:bg-success/10',
    error: 'text-danger hover:bg-danger/10',
    warning: 'text-warning hover:bg-warning/10',
    white: 'text-white hover:bg-white/10',
  },
  gradient: {
    primary: 'bg-gradient-to-r from-primary to-primary-hover hover:brightness-110 text-text-inverse',
    secondary: 'bg-gradient-to-r from-secondary to-secondary-hover hover:brightness-110 text-text-primary font-bold',
    accent: 'bg-gradient-to-r from-info to-primary hover:brightness-110 text-text-inverse',
    success: 'bg-gradient-to-r from-success to-success/80 hover:brightness-110 text-text-inverse',
    error: 'bg-gradient-to-r from-danger to-danger/80 hover:brightness-110 text-text-inverse',
    warning: 'bg-gradient-to-r from-warning to-warning/80 hover:brightness-110 text-text-primary font-bold',
    white: 'bg-gradient-to-r from-gray-100 to-white hover:brightness-95 text-gray-900',
  },
  glass: {
    primary: 'bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary backdrop-blur-md',
    secondary: 'bg-secondary/10 border border-secondary/20 hover:bg-secondary/20 text-secondary backdrop-blur-md',
    accent: 'bg-info/10 border border-info/20 hover:bg-info/20 text-info backdrop-blur-md',
    success: 'bg-success/10 border border-success/20 hover:bg-success/20 text-success backdrop-blur-md',
    error: 'bg-danger/10 border border-danger/20 hover:bg-danger/20 text-danger backdrop-blur-md',
    warning: 'bg-warning/10 border border-warning/20 hover:bg-warning/20 text-warning backdrop-blur-md',
    white: 'bg-white/5 border border-white/10 hover:bg-white/10 text-white backdrop-blur-md',
  },
};

const sizeStyles: Record<ButtonSize, string> = {
  small: 'px-3.5 py-1.5 text-xs rounded-xl gap-1.5',
  medium: 'px-5 py-2.5 text-sm rounded-2xl gap-2',
  large: 'px-7 py-3.5 text-base rounded-2xl gap-2.5',
};

const glowStyles: Record<ButtonColor, string> = {
  primary: 'shadow-[0_0_20px_color-mix(in_srgb,var(--color-primary)_30%,transparent)]',
  secondary: 'shadow-[0_0_20px_color-mix(in_srgb,var(--color-secondary)_35%,transparent)]',
  accent: 'shadow-[0_0_20px_color-mix(in_srgb,var(--color-info)_30%,transparent)]',
  success: 'shadow-[0_0_20px_color-mix(in_srgb,var(--color-success)_25%,transparent)]',
  error: 'shadow-[0_0_20px_color-mix(in_srgb,var(--color-danger)_25%,transparent)]',
  warning: 'shadow-[0_0_20px_color-mix(in_srgb,var(--color-warning)_25%,transparent)]',
  white: 'shadow-[0_0_20px_rgba(255,255,255,0.1)]',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  startIcon,
  endIcon,
  loading = false,
  fullWidth = false,
  glow = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const isDisabled = disabled || loading;

  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-300 select-none active:scale-[0.98] disabled:scale-100 disabled:opacity-50 disabled:pointer-events-none will-change-transform';
  const interactionStyles = 'hover:scale-[1.02]';

  const classes = [
    baseStyles,
    !isDisabled ? interactionStyles : '',
    variantStyles[variant][color],
    sizeStyles[size],
    fullWidth ? 'w-full' : '',
    glow && !isDisabled ? glowStyles[color] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button disabled={isDisabled} className={classes} {...props}>
      {loading && <Spinner />}
      {!loading && startIcon && <span className="inline-flex shrink-0">{startIcon}</span>}
      <span>{children}</span>
      {!loading && endIcon && <span className="inline-flex shrink-0">{endIcon}</span>}
    </button>
  );
};

export default Button;
