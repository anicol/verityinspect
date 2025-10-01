import { useState, useCallback } from 'react';

interface ToastState {
  open: boolean;
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'error';
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({ open: false });

  const showToast = useCallback(
    (options: Omit<ToastState, 'open'>) => {
      setToast({ ...options, open: true });
    },
    []
  );

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, open: false }));
  }, []);

  return {
    toast,
    showToast,
    hideToast,
  };
}
