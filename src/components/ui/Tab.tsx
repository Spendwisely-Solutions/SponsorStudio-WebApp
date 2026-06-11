import React from 'react';

export interface TabsProps {
  value: string | number;
  onChange: (value: string | number) => void;
  children: React.ReactNode;
  variant?: 'standard' | 'fullWidth';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  value,
  onChange,
  children,
  variant = 'standard',
  className = '',
}) => {
  // Clone children to inject value and onChange helper directly
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, {
        active: child.props.value === value,
        onClick: () => {
          if (!child.props.disabled) {
            onChange(child.props.value);
          }
        },
        fullWidth: variant === 'fullWidth',
      });
    }
    return child;
  });

  return (
    <div className={`flex border-b border-border ${className}`}>
      <div
        className={`flex ${
          variant === 'fullWidth' ? 'w-full' : 'gap-2 md:gap-4'
        }`}
      >
        {childrenWithProps}
      </div>
    </div>
  );
};

export interface TabProps {
  value: string | number;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  active?: boolean; // Injected by Tabs parent
  fullWidth?: boolean; // Injected by Tabs parent
  onClick?: () => void; // Injected by Tabs parent
  className?: string;
}

export const Tab: React.FC<TabProps> = ({
  label,
  icon,
  disabled = false,
  active = false,
  fullWidth = false,
  onClick,
  className = '',
}) => {
  const baseClasses =
    'relative py-3.5 px-4 font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 select-none border-b-2 border-transparent';
  
  const interactionClasses = disabled
    ? 'opacity-30 cursor-not-allowed'
    : active
    ? 'text-primary border-primary'
    : 'text-text-secondary hover:text-text-primary hover:border-border/30 cursor-pointer';

  const widthClass = fullWidth ? 'flex-1' : '';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${interactionClasses} ${widthClass} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
      
      {/* Premium subtle glow overlay */}
      {active && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[4px] rounded-full bg-primary/40 opacity-50 blur-[2px]" />
      )}
    </button>
  );
};

export interface TabPanelProps {
  value: string | number;
  activeValue: string | number;
  children: React.ReactNode;
  className?: string;
}

export const TabPanel: React.FC<TabPanelProps> = ({
  value,
  activeValue,
  children,
  className = '',
}) => {
  if (value !== activeValue) return null;

  return (
    <div className={`py-6 animate-fade-in ${className}`}>
      {children}
    </div>
  );
};
