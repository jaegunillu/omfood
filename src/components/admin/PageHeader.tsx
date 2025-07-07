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
}

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
  color: #888888;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f0f0f0;
    color: #111111;
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
  font-size: 24px;
  font-weight: 700;
  color: #111111;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const PageSubtitle = styled.p`
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 16px;
  font-weight: 400;
  color: #888888;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const LogoutButton = styled.button`
  background: #F88D2A;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e67e22;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(248, 141, 42, 0.3);
  }
  
  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 13px;
  }
`;

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showBackButton = true,
  backTo = '/admin/dashboard',
  backLabel = '대시보드로',
  onLogout
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
      <LogoutButton onClick={handleLogout}>
        로그아웃
      </LogoutButton>
    </HeaderContainer>
  );
};

export default PageHeader; 