import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Toast from './Toast';
import ToastContainer from './ToastContainer';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextProps {
  toasts: ToastItem[];
  success: (msg: string) => void;
  error: (msg: string) => void;
  info: (msg: string) => void;
  remove: (id: string) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

let toastId = 0;

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message: string, type: ToastType) => {
    const id = `${Date.now()}_${toastId++}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => remove(id), 3000);
  }, [remove]);

  const success = useCallback((msg: string) => show(msg, 'success'), [show]);
  const error = useCallback((msg: string) => show(msg, 'error'), [show]);
  const info = useCallback((msg: string) => show(msg, 'info'), [show]);

  return (
    <ToastContext.Provider value={{ toasts, success, error, info, remove }}>
      {children}
      <ToastContainer>
        {toasts.map((toast) => (
          <Toast key={toast.id} $type={toast.type} onClose={() => remove(toast.id)}>
            {toast.message}
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
} 