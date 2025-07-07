import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
  duration?: number;
}

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const ToastContainer = styled.div<{ $type: ToastProps['type']; $isClosing: boolean }>`
  position: fixed;
  top: 20px;
  right: 20px;
  background: ${({ $type }) => {
    switch ($type) {
      case 'success': return '#4CAF50';
      case 'error': return '#F44336';
      case 'warning': return '#FF9800';
      case 'info': return '#2196F3';
      default: return '#333333';
    }
  }};
  color: white;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  max-width: 400px;
  min-width: 300px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  animation: ${({ $isClosing }) => $isClosing ? slideOut : slideIn} 0.3s ease;
  
  @media (max-width: 768px) {
    right: 16px;
    left: 16px;
    max-width: none;
    min-width: auto;
  }
`;

const ToastContent = styled.div`
  flex: 1;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
`;

const ToastIcon = styled.span`
  font-size: 18px;
  flex-shrink: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  flex-shrink: 0;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const getToastIcon = (type: ToastProps['type']) => {
  switch (type) {
    case 'success': return '✓';
    case 'error': return '✕';
    case 'warning': return '⚠';
    case 'info': return 'ℹ';
    default: return '•';
  }
};

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type, 
  onClose, 
  duration = 3000 
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <ToastContainer $type={type} $isClosing={false}>
      <ToastIcon>{getToastIcon(type)}</ToastIcon>
      <ToastContent>{message}</ToastContent>
      <CloseButton onClick={onClose}>×</CloseButton>
    </ToastContainer>
  );
};

export default Toast; 