import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'icon';

type ButtonProps = {
  variant?: Variant;
  children: ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ variant = 'primary', className = '', children, type = 'button', ...rest }: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold transition-transform active:scale-95 disabled:opacity-50';

  const variants: Record<Variant, string> = {
    primary: 'action-gradient text-on-primary px-5 py-1.5 rounded-full text-sm shadow-lg shadow-primary/20',
    secondary:
      'bg-surface-container-high text-primary px-4 py-1.5 rounded-lg text-sm hover:bg-surface-container transition-colors',
    ghost: 'text-on-surface-variant hover:bg-surface-container-low rounded-lg px-2 py-1 text-sm',
    icon: 'p-2 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors',
  };

  return (
    <button type={type} className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
