import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import PageHeader from './PageHeader';

/**
 * 관리자 대시보드
 * - HOME 카드는 렌더 단계에서 필터링으로 숨김
 * - 나머지 메뉴(메인페이지 관리 / ABOUT / BRAND / PRODUCT / CONTACT)는 그대로 노출
 * - 필요한 경우 path 문자열만 실제 라우트에 맞게 조정하세요.
 */

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

const AdminLayout = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${colors.grayLight};
  position: relative;
`;

const AdminMain = styled.main`
  flex: 1;
  padding: 48px 50px 40px 50px;
  min-height: 100vh;
  max-width: 2100px;
  margin: 0 auto;
  
  @media (max-width: 900px) {
    padding: 24px 16px;
  }
`;


const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  @media (max-width: 992px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.button`
  width: 100%;
  text-align: left;
  padding: 22px 20px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(16, 24, 40, 0.06);
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(16, 24, 40, 0.10);
    border-color: #e6e6e6;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(24, 119, 242, 0.25);
  }
`;

const CardTitle = styled.div`
  font-size: 16px;
  font-weight: 800;
  color: #222;
  letter-spacing: 0.02em;
  margin-bottom: 6px;
  text-transform: uppercase;
`;

const CardDesc = styled.div`
  font-size: 12px;
  color: #777;
  letter-spacing: -0.01em;
  line-height: 1.45;
`;

/** HOME인지 판별 (영/한 모두 대응) */
const isHomeMenu = (title?: string, path?: string) => {
  const t = (title || "").trim().toLowerCase();
  const p = (path || "").trim().toLowerCase();
  const titleIsHome =
    t === "home" || t === "main" || t === "메인" || t === "홈" || /(^|\s)home($|\s)/.test(t);
  const pathIsHome = p.includes("/home");
  return titleIsHome || pathIsHome;
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  /** 관리자 대시보드 카드 정의 (필요시 path만 수정) */
  const cards: Array<{ title: string; desc?: string; path: string }> = [
    {
      title: "메인페이지 관리",
      desc: "헤더, 메인 섹션, 슬로건, 스토어, 브랜드 등 관리",
      path: "/admin/main",
    },
    // HOME은 데이터엔 포함하되 렌더에서 필터로 숨깁니다.
    { title: "HOME", desc: "HOME 페이지 관리", path: "/admin/home" },
    { title: "ABOUT", desc: "ABOUT 페이지 관리", path: "/admin/about" },
    { title: "BRAND", desc: "BRAND 페이지 관리", path: "/admin/brand" },
    { title: "PRODUCT", desc: "PRODUCT 페이지 관리", path: "/admin/product" },
    { title: "CONTACT", desc: "CONTACT 페이지 관리", path: "/admin/contact" },
  ];

  // items 조립 이후, 렌더 전에 HOME 제거
  const visibleItems = (cards || []).filter((it) => !isHomeMenu(it.title, it.path));

  return (
    <AdminLayout>
      <AdminMain>
        <PageHeader 
          title="관리자 대시보드"
          subtitle="시스템의 각 영역을 관리할 수 있습니다"
          showBackButton={false}
          onLogout={() => {
            localStorage.removeItem('admin_login');
            window.location.href = '/admin/login';
          }}
        />

        <Grid>
          {visibleItems.map((c) => (
            <Card key={c.title} onClick={() => navigate(c.path)}>
              <CardTitle>{c.title}</CardTitle>
              {c.desc ? <CardDesc>{c.desc}</CardDesc> : null}
            </Card>
          ))}
        </Grid>
      </AdminMain>
    </AdminLayout>
  );
};

export default DashboardPage;
