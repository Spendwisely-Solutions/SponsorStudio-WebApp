import React from 'react';

export type BadgeColor = 'primary' | 'secondary' | 'accent' | 'error' | 'success' | 'warning';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  badgeContent?: React.ReactNode;
  color?: BadgeColor;
  variant?: 'standard' | 'dot';
  invisible?: boolean;
  anchorOrigin?: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'right';
  };
  children?: React.ReactNode;
}

const colorClasses: Record<BadgeColor, string> = {
  primary: 'bg-primary text-text-inverse',
  secondary: 'bg-secondary text-text-primary font-bold',
  accent: 'bg-info text-text-inverse',
  error: 'bg-danger text-text-inverse',
  success: 'bg-success text-text-inverse',
  warning: 'bg-warning text-text-primary font-bold',
};

export const Badge: React.FC<BadgeProps> = ({
  badgeContent,
  color = 'error',
  variant = 'standard',
  invisible = false,
  anchorOrigin = { vertical: 'top', horizontal: 'right' },
  children,
  className = '',
  ...props
}) => {
  const isDot = variant === 'dot';

  // Position coordinates
  let positionClasses = 'absolute z-10 select-none pointer-events-none flex items-center justify-center ';
  positionClasses += anchorOrigin.vertical === 'top' ? 'top-0 -translate-y-1/2 ' : 'bottom-0 translate-y-1/2 ';
  positionClasses += anchorOrigin.horizontal === 'right' ? 'right-0 translate-x-1/2 ' : 'left-0 -translate-x-1/2 ';

  const shapeClasses = isDot
    ? 'w-2.5 h-2.5 rounded-full ring-2 ring-background'
    : 'px-1.5 min-w-[20px] h-5 rounded-full text-[10px] font-bold leading-none ring-2 ring-background';

  return (
    <div className={`relative inline-flex shrink-0 ${className}`} {...props}>
      {children}
      {!invisible && (badgeContent !== undefined || isDot) && (
        <span className={`${positionClasses} ${shapeClasses} ${colorClasses[color]}`}>
          {!isDot && badgeContent}
        </span>
      )}
    </div>
  );
};

export default Badge;
