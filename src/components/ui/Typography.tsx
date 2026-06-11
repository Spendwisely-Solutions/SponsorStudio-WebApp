import React from 'react';

export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'subtitle1'
  | 'subtitle2'
  | 'body1'
  | 'body2'
  | 'caption'
  | 'overline'
  | 'button';

export type TypographyAlign = 'inherit' | 'left' | 'center' | 'right' | 'justify';

export type TypographyColor =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'textPrimary'
  | 'textSecondary'
  | 'error'
  | 'warning'
  | 'success'
  | 'white'
  | 'inherit'
  | string;

export type TypographyWeight =
  | 'light'
  | 'normal'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'extrabold'
  | 'black';

export type TypographyGradient =
  | 'cyan-blue'
  | 'indigo-cyan'
  | 'shimmer-cyan'
  | 'shimmer-indigo'
  | boolean;

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  component?: React.ElementType;
  align?: TypographyAlign;
  color?: TypographyColor;
  gutterBottom?: boolean;
  noWrap?: boolean;
  fontWeight?: TypographyWeight;
  gradient?: TypographyGradient;
  children?: React.ReactNode;
}

const variantMapping: Record<TypographyVariant, React.ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  subtitle1: 'p',
  subtitle2: 'p',
  body1: 'p',
  body2: 'p',
  caption: 'span',
  overline: 'span',
  button: 'span',
};

const variantClasses: Record<TypographyVariant, string> = {
  h1: 'text-4xl font-extrabold sm:text-5xl md:text-6xl tracking-tight leading-none',
  h2: 'text-3xl font-bold sm:text-4xl md:text-5xl tracking-tight leading-tight',
  h3: 'text-2xl font-bold sm:text-3xl md:text-4xl leading-snug',
  h4: 'text-xl font-semibold sm:text-2xl md:text-3xl leading-snug',
  h5: 'text-lg font-semibold sm:text-xl md:text-2xl leading-normal',
  h6: 'text-base font-semibold sm:text-lg md:text-xl leading-normal',
  subtitle1: 'text-lg font-medium leading-relaxed',
  subtitle2: 'text-sm font-medium leading-relaxed',
  body1: 'text-base leading-relaxed',
  body2: 'text-sm leading-relaxed',
  caption: 'text-xs leading-normal',
  overline: 'text-xs font-semibold uppercase tracking-widest leading-none',
  button: 'text-sm font-bold uppercase tracking-wider leading-none',
};

const alignClasses: Record<TypographyAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
  inherit: '',
};

const colorClasses: Record<string, string> = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  accent: 'text-info',
  textPrimary: 'text-text-primary',
  textSecondary: 'text-text-secondary',
  error: 'text-danger',
  warning: 'text-warning',
  success: 'text-success',
  white: 'text-white',
  inherit: '',
};

const weightClasses: Record<TypographyWeight, string> = {
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
  black: 'font-black',
};

const gradientClasses = {
  'cyan-blue': 'bg-gradient-to-r from-[#00D4FF] via-[#3B82F6] to-[#6366F1]',
  'indigo-cyan': 'bg-gradient-to-r from-[#6366F1] via-[#3B82F6] to-[#00D4FF]',
  'shimmer-cyan': 'bg-gradient-to-r from-[#00D4FF] via-[#6366F1] to-[#00D4FF] bg-[length:200%_auto] animate-[shimmer_4s_linear_infinite]',
  'shimmer-indigo': 'bg-gradient-to-r from-[#6366F1] via-[#00D4FF] to-[#6366F1] bg-[length:200%_auto] animate-[shimmer_4s_linear_infinite_reverse]',
};

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body1',
  component,
  align = 'inherit',
  color = 'inherit',
  gutterBottom = false,
  noWrap = false,
  fontWeight,
  gradient,
  children,
  className = '',
  ...props
}) => {
  const Component = component || variantMapping[variant] || 'span';

  // Determine variant-specific margin for gutterBottom
  let gutterClass = '';
  if (gutterBottom) {
    if (['h1', 'h2', 'h3'].includes(variant)) {
      gutterClass = 'mb-6';
    } else if (['h4', 'h5', 'h6', 'subtitle1'].includes(variant)) {
      gutterClass = 'mb-4';
    } else if (['body1', 'body2'].includes(variant)) {
      gutterClass = 'mb-3';
    } else {
      gutterClass = 'mb-2';
    }
  }

  // Handle color classes
  let selectedColorClass = '';
  if (!gradient) {
    if (colorClasses[color]) {
      selectedColorClass = colorClasses[color];
    } else if (typeof color === 'string' && color.startsWith('text-')) {
      selectedColorClass = color;
    } else if (color !== 'inherit') {
      selectedColorClass = `text-${color}`;
    }
  }

  // Handle gradient formatting
  let gradientClass = '';
  if (gradient) {
    gradientClass = 'bg-clip-text text-transparent ';
    if (gradient === true || gradient === 'cyan-blue') {
      gradientClass += gradientClasses['cyan-blue'];
    } else if (typeof gradient === 'string' && gradientClasses[gradient as keyof typeof gradientClasses]) {
      gradientClass += gradientClasses[gradient as keyof typeof gradientClasses];
    } else {
      gradientClass += gradientClasses['cyan-blue'];
    }
  }

  const classes = [
    variantClasses[variant] || '',
    fontWeight ? weightClasses[fontWeight] : '',
    alignClasses[align] || '',
    selectedColorClass,
    gradientClass,
    gutterClass,
    noWrap ? 'truncate block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
};

export default Typography;
