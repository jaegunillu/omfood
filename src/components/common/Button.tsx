import React from 'react';
import styled from 'styled-components';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
  icon?: React.ReactNode;
}

// 디자인 시스템 - 컬러 팔레트
const colors = {
  primary: '#E5002B',
  secondary: '#F88D2A',
  black: '#111111',
  grayDark: '#444444',
  grayLight: '#F5F5F5',
  white: '#FFFFFF',
  grayMedium: '#888888',
  grayBorder: '#E0E0E0',
  success: '#28a745',
  error: '#dc3545',
  info: '#17a2b8'
};

const StyledButton = styled.button<{ 
  $variant: 'primary' | 'secondary' | 'danger' | 'outline' | 'success';
  $size: 'sm' | 'md' | 'lg';
  $loading: boolean;
}>`
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: ${({ $loading }) => $loading ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  /* Size variants */
  ${({ $size }) => {
    switch ($size) {
      case 'sm':
        return `
          padding: 8px 16px;
          font-size: 0.875rem;
        `;
      case 'md':
        return `
          padding: 12px 24px;
          font-size: 1rem;
        `;
      case 'lg':
        return `
          padding: 16px 32px;
          font-size: 1.125rem;
        `;
      default:
        return `
          padding: 12px 24px;
          font-size: 1rem;
        `;
    }
  }}
  
  /* Variant styles */
  ${({ $variant, $loading }) => {
    if ($loading) {
      return `
        background: ${colors.grayMedium};
        color: ${colors.grayDark};
      `;
    }
    
    switch ($variant) {
      case 'primary':
        return `
          background: ${colors.primary};
          color: ${colors.white};
          &:hover {
            background: #c40023;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(229, 0, 43, 0.3);
          }
        `;
      case 'secondary':
        return `
          background: ${colors.grayDark};
          color: ${colors.white};
          &:hover {
            background: #333333;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          }
        `;
      case 'danger':
        return `
          background: ${colors.error};
          color: ${colors.white};
          &:hover {
            background: #c82333;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(220, 53, 69, 0.3);
          }
        `;
      case 'success':
        return `
          background: ${colors.success};
          color: ${colors.white};
          &:hover {
            background: #218838;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
          }
        `;
      case 'outline':
        return `
          background: transparent;
          color: ${colors.primary};
          border: 2px solid ${colors.primary};
          &:hover {
            background: ${colors.primary};
            color: ${colors.white};
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(229, 0, 43, 0.2);
          }
        `;
      default:
        return `
          background: ${colors.grayLight};
          color: ${colors.black};
          &:hover {
            background: ${colors.grayBorder};
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(229, 0, 43, 0.1);
  }
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  style,
  icon
}) => {
  return (
    <StyledButton
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      $variant={variant}
      $size={size}
      $loading={loading}
      className={className}
      style={style}
    >
      {loading && <LoadingSpinner />}
      {icon && !loading && <span>{icon}</span>}
      {children}
    </StyledButton>
  );
};

export default Button; 