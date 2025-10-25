import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loading?: boolean; // Alias for isLoading
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  as?: React.ElementType;
  to?: string;
  title?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variants = {
  primary: 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg shadow-primary-500/25',
  secondary: 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-900 dark:from-dark-200 dark:to-dark-300 dark:hover:from-dark-100 dark:hover:to-dark-200 dark:text-white',
  outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white bg-transparent',
  ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-dark-200',
  destructive: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/25',
  danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/25',
};

const sizes = {
  sm: 'px-3 py-2 text-sm font-medium',
  md: 'px-4 py-2.5 text-sm font-semibold',
  lg: 'px-6 py-3 text-base font-semibold',
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loading = false,
  disabled = false,
  className = '',
  children,
  onClick,
  type = 'button',
  as,
  to,
  title,
  leftIcon,
  rightIcon,
  fullWidth = false,
  ...props
}: ButtonProps): JSX.Element {
  const actualLoading = isLoading || loading;
  const Component = as || motion.button;

  const componentProps = {
    ...props,
    ...(as && { to }),
    ...(title && { title }),
    className: cn(
      'relative inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
      variants[variant],
      sizes[size],
      fullWidth && 'w-full',
      (disabled || actualLoading) && 'opacity-50 cursor-not-allowed',
      className
    ),
    disabled: disabled || actualLoading,
    type: as ? undefined : type,
    onClick: (disabled || actualLoading) ? undefined : onClick,
    ...(Component === motion.button && {
      whileHover: { scale: disabled || actualLoading ? 1 : 1.02 },
      whileTap: { scale: disabled || actualLoading ? 1 : 0.98 },
      transition: { duration: 0.2 }
    })
  };

  return (
    <Component {...componentProps}>
      {actualLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {leftIcon && !actualLoading && leftIcon}
      <span className={cn('truncate', { 'opacity-0': actualLoading })}>
        {children}
      </span>
      {rightIcon && !actualLoading && rightIcon}
    </Component>
  );
}

export default Button;
