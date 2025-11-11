import * as React from 'react';
import { cn } from '@/lib/utils';

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'success' | 'error' | 'warning';
  }
>(({ className, variant = 'default', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'relative w-full rounded-lg border p-4',
        {
          'border-gray-200 bg-white': variant === 'default',
          'border-green-200 bg-green-50 text-green-800': variant === 'success',
          'border-red-200 bg-red-50 text-red-800': variant === 'error',
          'border-yellow-200 bg-yellow-50 text-yellow-800': variant === 'warning',
        },
        className
      )}
      {...props}
    />
  );
});
Alert.displayName = 'Alert';

export { Alert };