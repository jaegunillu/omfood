import React, { useState, useCallback } from 'react';
import Toast from './Toast';

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface ToastContainerProps {
  children: React.ReactNode;
}

interface ToastContextType {
  showToast: (message: string, type: ToastItem['type'], duration?: number) => void;
}

export const ToastContext = React.createContext<ToastContextType>({
  showToast: () => {}
});

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<ToastContainerProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastItem['type'], duration = 3000) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{ position: 'fixed', top: 0, right: 0, zIndex: 10000, pointerEvents: 'none' }}>
        {toasts.map((toast, index) => (
          <div 
            key={toast.id} 
            style={{ 
              position: 'absolute', 
              top: `${20 + index * 80}px`, 
              right: '20px',
              pointerEvents: 'auto'
            }}
          >
            <Toast
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider; 