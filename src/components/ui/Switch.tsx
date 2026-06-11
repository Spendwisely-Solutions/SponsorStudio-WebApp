import React from 'react';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <label
      className={`inline-flex items-center gap-3 select-none ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
    >
      <div className="relative flex items-center shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
          {...props}
        />
        
        {/* Track */}
        <div
          className={`w-10 h-6 rounded-full transition-colors duration-300 relative ${
            disabled
              ? 'bg-border/30'
              : checked
              ? 'bg-primary shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary)_25%,transparent)]'
              : 'bg-border/60 hover:bg-border/80'
          }`}
        >
          {/* Slider knob circle */}
          <div
            className={`w-4 h-4 rounded-full bg-white absolute top-1 left-1 transition-transform duration-300 ${
              checked ? 'translate-x-4 bg-text-inverse' : 'translate-x-0'
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

export default Switch;
