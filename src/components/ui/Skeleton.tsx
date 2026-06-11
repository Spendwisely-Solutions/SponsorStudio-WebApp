import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
  className = '',
  style,
  ...props
}) => {
  const baseClasses = 'bg-white/5';
  
  const variantClasses = {
    text: 'rounded h-4 w-full mt-2 mb-2',
    circular: 'rounded-full shrink-0',
    rectangular: 'w-full',
    rounded: 'rounded-2xl w-full',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-[shimmer-wave_2s_infinite_linear] bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%]',
    none: '',
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    animationClasses[animation],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const customStyle: React.CSSProperties = {
    width: width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : variant === 'text' ? undefined : '100%',
    ...style,
  };

  return (
    <div className={classes} style={customStyle} {...props}>
      {animation === 'wave' && <style>{`
        @keyframes shimmer-wave {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>}
    </div>
  );
};

export default Skeleton;
