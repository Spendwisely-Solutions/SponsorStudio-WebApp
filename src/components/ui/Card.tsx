import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'outlined' | 'solid';
  hoverEffect?: boolean;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  variant = 'glass',
  hoverEffect = true,
  glow = false,
  children,
  className = '',
  ...props
}) => {
  const baseClasses = 'relative rounded-3xl overflow-hidden transition-all duration-300';
  
  const variantClasses = {
    glass: 'bg-surface/60 border border-border backdrop-blur-md',
    outlined: 'border border-border bg-transparent',
    solid: 'bg-background-secondary border border-border',
  };

  const hoverClasses = hoverEffect
    ? 'hover:scale-[1.01] hover:bg-surface-hover/50 hover:border-border-hover'
    : '';

  const glowClasses = glow
    ? 'hover:shadow-[0_0_40px_color-mix(in_srgb,var(--color-primary)_8%,transparent)]'
    : '';

  const classes = [
    baseClasses,
    variantClasses[variant],
    hoverClasses,
    glowClasses,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: React.ReactNode;
  subheader?: React.ReactNode;
  action?: React.ReactNode;
  avatar?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subheader,
  action,
  avatar,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex items-center justify-between p-6 pb-3 gap-4 ${className}`} {...props}>
      <div className="flex items-center gap-3">
        {avatar && <div className="shrink-0">{avatar}</div>}
        <div>
          {typeof title === 'string' ? (
            <h3 className="text-base font-bold text-text-primary leading-none tracking-wide">{title}</h3>
          ) : (
            title
          )}
          {subheader && (
            <div className="mt-1">
              {typeof subheader === 'string' ? (
                <p className="text-xs text-text-secondary">{subheader}</p>
              ) : (
                subheader
              )}
            </div>
          )}
        </div>
      </div>
      {action && <div className="shrink-0 self-start">{action}</div>}
    </div>
  );
};

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`p-6 pt-3 pb-6 text-sm text-text-secondary leading-relaxed ${className}`} {...props}>
      {children}
    </div>
  );
};

export interface CardActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  disableSpacing?: boolean;
}

export const CardActions: React.FC<CardActionsProps> = ({
  disableSpacing = false,
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`flex items-center gap-3 p-6 pt-0 ${disableSpacing ? '' : 'justify-end'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export interface CardMediaProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  height?: string;
}

export const CardMedia: React.FC<CardMediaProps> = ({
  height = '180px',
  className = '',
  alt = '',
  style,
  ...props
}) => {
  return (
    <img
      className={`w-full object-cover shrink-0 ${className}`}
      alt={alt}
      style={{ height, ...style }}
      {...props}
    />
  );
};

export default Card;
