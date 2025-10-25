import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'white' | 'dark';
  text?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const variants = {
  primary: 'text-primary-500',
  white: 'text-white',
  dark: 'text-gray-800',
};

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'primary', 
  text, 
  className 
}: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <motion.div
        className={cn(
          'border-2 rounded-full border-t-current border-r-transparent border-b-current border-l-transparent',
          sizeClasses[size],
          variants[variant]
        )}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn('text-sm font-medium', variants[variant])}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}

export default LoadingSpinner;
