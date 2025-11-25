import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backTo?: string;
  backLabel?: string;
  onLogout?: () => void;
  showLogout?: boolean;
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

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 0 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: flex-start;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: ${colors.grayMedium};
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${colors.grayLight};
    color: ${colors.black};
  }
  
  span {
    font-size: 20px;
  }
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const PageTitle = styled.h1`
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: ${colors.black};
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const PageSubtitle = styled.p`
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 16px;
  font-weight: 400;
  color: ${colors.grayMedium};
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const LogoutButton = styled.button`
  background: ${colors.white};
  color: ${colors.black};
  border: 1px solid ${colors.grayBorder};
  padding: 12px 24px;
  border-radius: 8px;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  &:hover {
    background: ${colors.primary};
    color: ${colors.white};
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }
  
  @media (max-width: 768px) {
    padding: 10px 20px;
    font-size: 0.875rem;
  }
`;

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showBackButton = true,
  backTo = '/admin/dashboard',
  backLabel = '대시보드로',
  onLogout,
  showLogout = true
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('admin_login');
      navigate('/admin/login');
    }
  };

  return (
    <HeaderContainer>
      <HeaderContent>
        {showBackButton && (
          <BackButton onClick={() => navigate(backTo)}>
            <span>←</span>
            {backLabel}
          </BackButton>
        )}
        <TitleSection>
          <PageTitle>{title}</PageTitle>
          {subtitle && <PageSubtitle>{subtitle}</PageSubtitle>}
        </TitleSection>
      </HeaderContent>
      {showLogout && (
        <LogoutButton onClick={handleLogout}>
          로그아웃
        </LogoutButton>
      )}
    </HeaderContainer>
  );
};

export default PageHeader; 