import React from 'react';
import styled, { css, keyframes } from 'styled-components';
import { ToastType } from './ToastContext';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateX(40px); }
  to { opacity: 1; transform: translateX(0); }
`;

const ToastBox = styled.div<{ $type: ToastType }>`
  min-width: 300px;
  max-width: 400px;
  background: ${({ $type }) =>
    $type === 'success' ? '#28a745' : $type === 'error' ? '#dc3545' : '#17a2b8'};
  color: #fff;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  animation: ${fadeIn} 0.4s cubic-bezier(0.4,0,0.2,1);
  position: relative;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 8px;
  right: 12px;
  background: none;
  border: none;
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;
  opacity: 0.7;
  &:hover { opacity: 1; }
`;

const Toast: React.FC<{ $type: ToastType; children: React.ReactNode; onClose?: () => void }> = ({ $type, children, onClose }) => (
  <ToastBox $type={$type}>
    {children}
    {onClose && <CloseBtn onClick={onClose}>&times;</CloseBtn>}
  </ToastBox>
);

export default Toast; 