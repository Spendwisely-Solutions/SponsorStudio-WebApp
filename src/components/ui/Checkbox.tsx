import React from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
}

export const Checkbox: React.FC<CheckboxProps> = ({
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
      <div className="relative flex items-center justify-center shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
          {...props}
        />
        
        {/* Outer Square box */}
        <div
          className={`w-5 h-5 rounded-lg border transition-all duration-300 flex items-center justify-center ${
            disabled
              ? 'border-border bg-surface/30'
              : checked
              ? 'border-primary bg-primary text-text-inverse shadow-[0_0_10px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]'
              : 'border-border hover:border-border/80 bg-surface'
          }`}
        >
          {/* Check icon indicator */}
          <Check
            className={`w-3.5 h-3.5 stroke-[3.5] transition-transform duration-250 ${
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

export default Checkbox;
