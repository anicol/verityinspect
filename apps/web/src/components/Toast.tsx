import * as React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { X } from 'lucide-react';

interface ToastProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'error';
}

export function Toast({
  open,
  onOpenChange,
  title,
  description,
  variant = 'default'
}: ToastProps) {
  const variantStyles = {
    default: 'bg-white border-gray-300',
    success: 'bg-green-50 border-green-300',
    error: 'bg-red-50 border-red-300'
  };

  const titleStyles = {
    default: 'text-gray-900',
    success: 'text-green-900',
    error: 'text-red-900'
  };

  const descriptionStyles = {
    default: 'text-gray-600',
    success: 'text-green-700',
    error: 'text-red-700'
  };

  return (
    <ToastPrimitive.Root
      open={open}
      onOpenChange={onOpenChange}
      className={`${variantStyles[variant]} border rounded-lg shadow-lg p-4 flex items-start gap-4 data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full`}
    >
      <div className="flex-1 grid gap-1">
        {title && (
          <ToastPrimitive.Title className={`text-sm font-medium ${titleStyles[variant]}`}>
            {title}
          </ToastPrimitive.Title>
        )}
        {description && (
          <ToastPrimitive.Description className={`text-sm ${descriptionStyles[variant]}`}>
            {description}
          </ToastPrimitive.Description>
        )}
      </div>
      <ToastPrimitive.Close className="text-gray-400 hover:text-gray-600">
        <X className="h-4 w-4" />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {children}
      <ToastPrimitive.Viewport className="fixed top-0 right-0 flex flex-col p-6 gap-2 w-96 max-w-[100vw] m-0 list-none z-50 outline-none" />
    </ToastPrimitive.Provider>
  );
}
