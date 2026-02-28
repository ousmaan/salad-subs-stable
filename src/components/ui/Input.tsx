/**
 * Input Component
 * Accessible input field with error states and RTL support
 */

import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || `input-${(label || 'input').replace(/\s+/g, '-').toLowerCase()}`;

    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className={cn(
            'block text-sm font-medium mb-1',
            error ? 'text-red-600' : 'text-secondary-700'
          )}
        >
          {label}
          {props.required && <span className="text-red-500 ms-1">*</span>}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'block w-full px-3 py-2 border rounded-lg',
            'focus:outline-none focus:ring-2 focus:ring-offset-1',
            'transition-colors duration-200',
            'disabled:bg-secondary-100 disabled:cursor-not-allowed',
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
