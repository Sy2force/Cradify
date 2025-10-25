import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onAnimationStart' | 'onAnimationEnd' | 'onDragStart' | 'onDrag' | 'onDragEnd'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
  showPasswordToggle?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    isPassword = false,
    showPasswordToggle = true,
    className,
    type = 'text',
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);

    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    const togglePassword = () => {
      setShowPassword(!showPassword);
    };

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <motion.label
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </motion.label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {leftIcon}
            </div>
          )}

          {/* Input Field */}
          <motion.input
            ref={ref}
            type={inputType}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            whileFocus={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className={cn(
              // Base styles
              'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-300 bg-white/50 dark:bg-dark-100/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200',
              
              // Focus styles
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              
              // Glass effect
              'shadow-sm hover:shadow-md',
              
              // States
              {
                'border-red-500 ring-2 ring-red-500/20': error,
                'ring-2 ring-primary-500/20': isFocused && !error,
                'pl-10': leftIcon,
                'pr-12': rightIcon || (isPassword && showPasswordToggle),
              },
              
              className
            )}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && !isPassword && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {rightIcon}
            </div>
          )}

          {/* Password Toggle */}
          {isPassword && showPasswordToggle && (
            <button
              type="button"
              onClick={togglePassword}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}

          {/* Error Icon */}
          {error && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
              <AlertCircle size={20} />
            </div>
          )}
        </div>

        {/* Helper Text / Error Message */}
        {(error || helperText) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2"
          >
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle size={14} />
                {error}
              </p>
            )}
            {!error && helperText && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {helperText}
              </p>
            )}
          </motion.div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export default Input;
