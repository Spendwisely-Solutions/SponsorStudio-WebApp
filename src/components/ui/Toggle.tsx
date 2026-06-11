import React from 'react';

export interface ToggleButtonGroupProps {
  value: any;
  onChange: (value: any) => void;
  exclusive?: boolean; // if true, only one value is selected. If false, value is an array of selected values
  children: React.ReactNode;
  className?: string;
}

export const ToggleButtonGroup: React.FC<ToggleButtonGroupProps> = ({
  value,
  onChange,
  exclusive = true,
  children,
  className = '',
}) => {
  const handleToggle = (buttonValue: any) => {
    if (exclusive) {
      if (value === buttonValue) {
        onChange(null); // allow deselecting
      } else {
        onChange(buttonValue);
      }
    } else {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.includes(buttonValue)) {
        onChange(currentValues.filter((v) => v !== buttonValue));
      } else {
        onChange([...currentValues, buttonValue]);
      }
    }
  };

  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      const isSelected = exclusive
        ? value === child.props.value
        : Array.isArray(value) && value.includes(child.props.value);
        
      return React.cloneElement(child as React.ReactElement<any>, {
        selected: isSelected,
        onClick: () => handleToggle(child.props.value),
      });
    }
    return child;
  });

  return (
    <div
      className={`inline-flex rounded-2xl bg-surface border border-border p-1 overflow-hidden shrink-0 ${className}`}
    >
      {childrenWithProps}
    </div>
  );
};

export interface ToggleButtonProps {
  value: any;
  selected?: boolean; // Injected by parent
  onClick?: () => void; // Injected by parent
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({
  selected = false,
  onClick,
  disabled = false,
  children,
  className = '',
}) => {
  const baseClasses =
    'px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-300 select-none flex items-center justify-center gap-1.5';
  
  const interactionClasses = disabled
    ? 'opacity-30 cursor-not-allowed'
    : selected
    ? 'bg-primary text-text-inverse font-bold shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary)_25%,transparent)]'
    : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover/50 cursor-pointer';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${interactionClasses} ${className}`}
    >
      {children}
    </button>
  );
};

export default ToggleButtonGroup;
