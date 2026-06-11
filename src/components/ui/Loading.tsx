import React from 'react';

export interface CircularProgressProps extends React.SVGAttributes<SVGSVGElement> {
  size?: number | string;
  thickness?: number;
  color?: 'primary' | 'secondary' | 'accent' | 'white' | string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  size = 40,
  thickness = 3.6,
  color = 'primary',
  className = '',
  ...props
}) => {
  const colorMap: Record<string, string> = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-info',
    white: 'text-white',
  };

  const colorClass = colorMap[color] || (color.startsWith('text-') ? color : `text-${color}`);

  return (
    <svg
      className={`animate-spin ${colorClass} ${className}`}
      width={size}
      height={size}
      viewBox="22 22 44 44"
      {...props}
    >
      <circle
        className="opacity-25"
        cx="44"
        cy="44"
        r="20"
        fill="none"
        stroke="currentColor"
        strokeWidth={thickness}
      />
      <circle
        className="opacity-75"
        cx="44"
        cy="44"
        r="20"
        fill="none"
        stroke="currentColor"
        strokeWidth={thickness}
        strokeDasharray="80, 200"
        strokeDashoffset="0"
        strokeLinecap="round"
        style={{
          transition: 'stroke-dashoffset 300ms ease-in-out',
        }}
      />
    </svg>
  );
};

export interface LinearProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: 'primary' | 'secondary' | 'accent' | 'gradient' | string;
  height?: number | string;
}

export const LinearProgress: React.FC<LinearProgressProps> = ({
  color = 'primary',
  height = 4,
  className = '',
  ...props
}) => {
  const colorMap: Record<string, string> = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    accent: 'bg-info',
    gradient: 'bg-gradient-to-r from-secondary to-info',
  };

  const indicatorClass = colorMap[color] || (color.startsWith('bg-') ? color : `bg-${color}`);

  return (
    <div
      className={`w-full overflow-hidden bg-surface-hover/30 rounded-full relative ${className}`}
      style={{ height }}
      {...props}
    >
      <div
        className={`h-full w-full origin-left rounded-full absolute left-0 top-0 animate-[shimmer-linear_1.5s_infinite_linear] ${indicatorClass}`}
      />
      <style>{`
        @keyframes shimmer-linear {
          0% { transform: translateX(-100%) scaleX(0.5); }
          50% { transform: translateX(-20%) scaleX(0.8); }
          100% { transform: translateX(100%) scaleX(0.5); }
        }
      `}</style>
    </div>
  );
};

export default CircularProgress;
