import React from 'react';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  textAlign?: 'left' | 'center' | 'right';
  children?: React.ReactNode;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  textAlign = 'center',
  children,
  className = '',
  ...props
}) => {
  const isHorizontal = orientation === 'horizontal';

  if (!isHorizontal) {
    return (
      <div
        className={`inline-block self-stretch w-px bg-white/10 shrink-0 mx-4 ${className}`}
        role="separator"
        aria-orientation="vertical"
        {...props}
      />
    );
  }

  const baseLineClass = 'h-px bg-white/10 flex-1';

  return (
    <div
      className={`flex items-center text-xs font-semibold uppercase tracking-widest text-gray-500 my-4 w-full select-none ${className}`}
      role="separator"
      aria-orientation="horizontal"
      {...props}
    >
      {children ? (
        <>
          <div className={`${baseLineClass} ${textAlign === 'left' ? 'max-w-[24px]' : ''}`} />
          <span className={`px-4 text-gray-400 shrink-0`}>
            {children}
          </span>
          <div className={`${baseLineClass} ${textAlign === 'right' ? 'max-w-[24px]' : ''}`} />
        </>
      ) : (
        <div className="w-full h-px bg-white/10" />
      )}
    </div>
  );
};

export default Divider;
