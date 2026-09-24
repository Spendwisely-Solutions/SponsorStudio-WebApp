import React from 'react';
import Link from 'next/link';

type Variant = 'primary' | 'secondary' | 'ghost' | 'inverse' | 'outline-inverse';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] font-medium ' +
  'transition-colors duration-200 ease-out-expo disabled:pointer-events-none disabled:opacity-50';

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  secondary: 'border border-border bg-surface text-text-primary hover:border-border-hover hover:bg-surface-hover',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-surface-hover',
  inverse: 'bg-white text-ink hover:bg-brand-50',
  'outline-inverse': 'border border-white/25 text-white hover:bg-white/10',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

export function buttonStyles({
  variant = 'primary',
  size = 'md',
  className = '',
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`.trim();
}

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsLink = CommonProps & { href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className'>;
type ButtonAsButton = CommonProps & { href?: undefined } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'>;

/**
 * Renders a Next.js Link for internal paths, a plain anchor for external URLs
 * and anchors, and a <button> when no href is given.
 */
export default function Button(props: ButtonAsLink | ButtonAsButton) {
  const { variant, size, className, children, ...rest } = props;
  const classes = buttonStyles({ variant, size, className });

  if (rest.href !== undefined) {
    const { href, ...anchorProps } = rest as ButtonAsLink;
    if (href.startsWith('/') && !href.startsWith('//')) {
      return (
        <Link href={href} className={classes} {...anchorProps}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} className={classes} {...anchorProps}>
        {children}
      </a>
    );
  }

  const { type = 'button', ...buttonProps } = rest as ButtonAsButton;
  return (
    <button type={type} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
