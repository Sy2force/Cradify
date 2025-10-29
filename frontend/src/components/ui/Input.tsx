import React from 'react';
import { clsx } from 'clsx';

const cn = (...inputs: any[]) => clsx(inputs);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
        </label>
      )}
      <input
        {...props}
        id={id}
        className={cn(
          "flex h-12 w-full rounded-xl border-2 px-4 py-3 text-sm font-medium ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300",
          "border-gray-200 dark:border-gray-600",
          "bg-gray-50/80 dark:bg-gray-700/50",
          "text-gray-900 dark:text-white",
          "placeholder:text-gray-400 dark:placeholder:text-gray-500",
          "focus:border-blue-500 focus:ring-blue-500/20 focus:bg-white dark:focus:border-blue-400 dark:focus:ring-blue-400/20 dark:focus:bg-gray-600/80",
          "hover:border-gray-300 dark:hover:border-gray-500 hover:bg-white dark:hover:bg-gray-600/70",
          "disabled:bg-gray-100 dark:disabled:bg-gray-800",
          "disabled:text-gray-400 dark:disabled:text-gray-500",
          error && "border-red-400 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500 dark:focus:border-red-400",
          className
        )}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
}
