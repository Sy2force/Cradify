import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const variants = {
  default: 'bg-white dark:bg-dark-100 shadow-lg',
  glass: 'bg-white/80 dark:bg-dark-100/80 backdrop-blur-md border border-gray-200/50 dark:border-dark-300/50 shadow-lg',
  bordered: 'bg-white dark:bg-dark-100 border border-gray-200 dark:border-dark-300 shadow-md',
};

const paddings = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-12',
};

export default function Container({
  children,
  className,
  variant = 'glass',
  padding = 'lg',
}: ContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'rounded-2xl',
        variants[variant],
        paddings[padding],
        className
      )}
    >
      {children}
    </motion.div>
  );
}
