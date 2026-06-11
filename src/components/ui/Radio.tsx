import React from 'react';

export interface RadioGroupProps {
  value: string | number;
  onChange: (value: string | number) => void;
  name: string;
  row?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  value,
  onChange,
  name,
  row = false,
  children,
  className = '',
}) => {
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, {
        name,
        checked: child.props.value === value,
        onChange: () => onChange(child.props.value),
      });
    }
    return child;
  });

  return (
    <div
      className={`flex ${row ? 'flex-row flex-wrap gap-6' : 'flex-col gap-3'} ${className}`}
    >
      {childrenWithProps}
    </div>
  );
};

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string | number;
  label?: React.ReactNode;
  onChange?: () => void; // Injected by RadioGroup or custom
}

export const Radio: React.FC<RadioProps> = ({
  value,
  label,
  checked,
  onChange,
  disabled = false,
  className = '',
  name,
  children,
  ...props
}) => {
  return (
    <label
      className={`inline-flex items-center gap-3 select-none ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
    >
      <div className="relative flex items-center justify-center shrink-0">
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only"
          {...props}
        />
        
        {/* Outer Circle Ring */}
        <div
          className={`w-5 h-5 rounded-full border transition-all duration-300 flex items-center justify-center ${
            disabled
              ? 'border-border bg-surface/30'
              : checked
              ? 'border-primary bg-primary/10 shadow-[0_0_10px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]'
              : 'border-border hover:border-border/80'
          }`}
        >
          {/* Inner Dot Indicator */}
          <div
            className={`w-2 h-2 rounded-full bg-primary transition-transform duration-300 ${
              checked ? 'scale-100' : 'scale-0'
            }`}
          />
        </div>
      </div>
      {label && (
        <span className={`text-sm ${checked ? 'text-text-primary font-medium' : 'text-text-secondary'} transition-colors`}>
          {label}
        </span>
      )}
    </label>
  );
};

export default Radio;
