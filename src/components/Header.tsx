import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';

const HeaderContainer = styled.header<{ $hover: boolean; $isMobile: boolean; $brand?: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  padding: 40px 0 0 0;
  height: 120px;
  display: flex;
  align-items: center;
  overflow: visible;
  position: relative;
  background: transparent;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.98);
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
    opacity: ${({ $hover, $isMobile }) => ($isMobile ? 0 : ($hover ? 1 : 0))};
    transform: translateY(${({ $hover, $isMobile }) => ($isMobile ? '-100%' : ($hover ? '0' : '-100%'))});
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: -1;
  }

  @media (max-width: 768px) {
    &::before {
      opacity: ${({ $hover }) => ($hover ? 1 : 0)};
      transform: translateY(${({ $hover }) => ($hover ? '0' : '-100%')});
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
  }
`;

const LogoWrapper = styled.div`
  position: relative;
  left: 40px;
  top: -20px;
  transform: none;
  z-index: 2;
  width: 120px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  transition: transform 0.4s ease-in-out;
  @media (max-width: 1162px) {
    left: 50%;
    transform: translateX(-50%);
    justify-content: center;
  }
`;

const LogoImg = styled.img<{
  $visible?: boolean;
  $isMainPage: boolean;
  $isHeaderHover: boolean;
  $navHover: boolean;
  $logoHover: boolean;
}>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: ${props => (props.$visible ? 1 : 0)};
  transform: scale(${props => (props.$visible ? 1 : 0.95)});
  transition: opacity 0.4s cubic-bezier(0.4,0,0.2,1), transform 0.4s cubic-bezier(0.4,0,0.2,1);
  pointer-events: none;
  filter: none;
`;

const NavWrapper = styled.div`
  position: absolute;
  left: 50%;
  top: 0px;
  transform: translateX(-50%);
  height: 100%;
  display: flex;
  align-items: center;
  z-index: 2;
  @media (max-width: 1162px) {
    display: none;
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 40px;
`;

const MenuItem = styled.a<{
  $isHovered: boolean;
  $hover: boolean;
  $isMainPage: boolean;
  $isHeaderHover: boolean;
  $navHover: boolean;
  $logoHover: boolean;
}>`
  color: ${({ $isMainPage, $isHeaderHover, $navHover, $logoHover }) =>
    $isMainPage && !($isHeaderHover || $navHover || $logoHover) ? '#fff' : '#222'};
  text-decoration: none;
  font-size: 16px;
  font-weight: 300;
  transition: color 0.4s ease-in-out;
  position: relative;
  z-index: 2;
  display: inline-block;
  white-space: nowrap;

  &::after {
    content: '';
    display: block;
    position: absolute;
    left: 0;
    right: 0;
    bottom: -2px;
    height: 0.05em;
    background: #222;
    border-radius: 2px;
    opacity: ${props => (props.$isHovered ? 1 : 0)};
    transform: scaleX(${props => (props.$isHovered ? 1 : 0.2)});
    transition:
      opacity 0.4s cubic-bezier(0.4,0,0.2,1),
      transform 0.4s cubic-bezier(0.4,0,0.2,1);
    transition-delay: 100ms;
    pointer-events: none;
  }
`;

const MenuChar = styled.span<{ $isActive: boolean; $delay: number }>`
  display: inline;
  transition: font-weight 0.3s cubic-bezier(0.4,0,0.2,1);
  font-weight: ${props => (props.$isActive ? 700 : 300)};
  transition-delay: ${props => props.$delay}ms;
`;

const MobileMenuButton = styled.button<{
  $isMainPage: boolean;
  $isHeaderHover: boolean;
  $navHover: boolean;
  $logoHover: boolean;
}>`
  display: none;
  @media (max-width: 1162px) {
    display: flex;
    position: absolute;
    left: 24px;
    top: 32px;
    background: none;
    border: none;
    z-index: 10;
    font-size: 2rem;
    color: ${({ $isMainPage, $isHeaderHover, $navHover, $logoHover }) =>
      $isMainPage && !($isHeaderHover || $navHover || $logoHover) ? '#fff' : '#222'};
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
`;

const MobileNav = styled.nav<{ $open: boolean }>`
  display: none;
  @media (max-width: 1162px) {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0,0,0,0.98);
    z-index: 9999;
    padding-top: 120px;
    transition: transform 0.3s ease-in-out;
    transform: ${({ $open }) => $open ? 'translateX(0)' : 'translateX(-100vw)'};
    visibility: ${({ $open }) => $open ? 'visible' : 'hidden'};
  }
`;

const MobileCloseButton = styled.button`
  position: fixed;
  top: 44px;
  right: 44px;
  background: none;
  border: none;
  z-index: 10001;
  font-size: 2.2rem;
  color: #fff;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  display: flex;
  box-shadow: none;
  @media (min-width: 769px) {
    display: none;
  }
`;

const VideoContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  overflow: hidden;
`;

const VideoBg = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  z-index: 0;
`;

const SloganWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  user-select: auto;
  pointer-events: auto;
`;

const LanguageSelector = styled.div`
  position: absolute;
  right: 80px;
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 3;
  @media (max-width: 1162px) {
    display: none;
  }
`;

const FlagWrapper = styled.div`
  position: relative;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const FlagIcon = styled.img`
  width: 32px;
  height: 32px;
  object-fit: cover;
  border-radius: 50%;
  border: 1.5px solid #eee;
  background: #fff;
`;

const RedDot = styled.div`
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 7px;
  height: 7px;
  background: #ff2d2d;
  border-radius: 50%;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  z-index: 2;
  margin-bottom: 5px;
`;

// 모바일 메뉴 내 언어 선택자
const MobileLanguageSelector = styled.div`
  display: none;
  @media (max-width: 1162px) {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 24px;
    width: 100%;
    margin-top: auto;
    margin-bottom: 40px;
  }
`;

interface HeaderProps {
  isMainPage?: boolean;
  isBrandPage?: boolean;
}

const Header: React.FC<HeaderProps> = ({ isMainPage = false, isBrandPage = false }) => {
  const [isHeaderHover, setIsHeaderHover] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoHover, setLogoHover] = useState(false);
  const [navHover, setNavHover] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'ko'>(localStorage.getItem('siteLang') === 'en' ? 'en' : 'ko');
  const [logoWhite, setLogoWhite] = useState<string | null>(null);
  const [logoBlack, setLogoBlack] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<{ en: string[]; ko: string[] } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsAnimated(scrollY > 50);
      setIsHeaderHover(scrollY > 50);
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1162);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    handleResize();
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Firestore에서 로고 경로 실시간 구독
  useEffect(() => {
    console.log('[Header] 로고 데이터 구독 시작');
    const docRef = doc(db, 'header', 'logo');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      console.log('[Header] 로고 데이터 변경 감지:', docSnap.exists());
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('[Header] 로고 데이터:', data);
        // Firestore에서 받은 경로를 그대로 사용 (이미 완전한 URL)
        setLogoWhite(data.white || null);
        setLogoBlack(data.black || null);
        console.log('[Header] 로고 경로 설정:', { white: data.white, black: data.black });
        console.log('[Header] 로고 상태 업데이트 완료');
      } else {
        console.log('[Header] 로고 데이터 문서가 존재하지 않음');
        setLogoWhite(null);
        setLogoBlack(null);
      }
    }, (error) => {
      console.error('[Header] 로고 데이터 구독 오류:', error);
    });
    return () => {
      console.log('[Header] 로고 데이터 구독 해제');
      unsubscribe();
    };
  }, []);

  // Firestore에서 메뉴 데이터 실시간 구독
  useEffect(() => {
    console.log('[Header] 메뉴 데이터 구독 시작');
    const ref = doc(db, 'header_menu', 'main');
    const unsub = onSnapshot(ref, (snap) => {
      console.log('[Header] Firestore 메뉴 데이터 변경 감지:', snap.exists());
      if (snap.exists()) {
        const data = snap.data();
        console.log('[Header] 메뉴 데이터:', data);
        setMenuItems({
          en: Array.isArray(data.en) ? data.en : Object.values(data.en),
          ko: Array.isArray(data.ko) ? data.ko : Object.values(data.ko),
        });
        console.log('[Header] 상태 업데이트 완료');
      } else {
        console.log('[Header] 메뉴 데이터 문서가 존재하지 않음');
        // 기본값 유지
      }
    }, (error) => {
      console.error('[Header] 메뉴 데이터 구독 오류:', error);
      // 기본값 유지
    });
    return () => {
      console.log('[Header] 메뉴 데이터 구독 해제');
      unsub();
    };
  }, []);

  // 메뉴 데이터 변경 시 로그 출력 (상태 업데이트 후 실행됨)
  useEffect(() => {
    console.log('[Header] 현재 메뉴 데이터:', menuItems);
    console.log('[Header] 현재 언어:', language);
    console.log('[Header] 현재 언어의 메뉴:', menuItems?.[language]);
    console.log('[Header] 메뉴 렌더링 조건 확인:', {
      menuItemsExists: !!menuItems,
      languageExists: !!menuItems?.[language],
      isArray: Array.isArray(menuItems?.[language]),
      length: menuItems?.[language]?.length
    });
  }, [menuItems, language]);

  // 렌더링 디버깅을 위한 useEffect
  useEffect(() => {
    console.log('[Header] 렌더링 디버깅 - menuItems:', menuItems, 'language:', language, 'logoWhite:', logoWhite, 'logoBlack:', logoBlack);
    console.log('[Header] 메뉴 렌더링 - menuItems[language]:', menuItems?.[language]);
  }, [menuItems, language, logoWhite, logoBlack]);

  const handleMobileMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileMenuClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMobileMenuOpen(false);
  };

  const handleLanguageChange = (lang: 'en' | 'ko') => {
    setLanguage(lang);
    localStorage.setItem('siteLang', lang);
    // 페이지 새로고침으로 언어 변경 적용
    window.location.reload();
  };

  // 메뉴 클릭 핸들러 - Firestore 데이터 기반으로 동작
  const handleMenuClick = (item: string) => {
    console.log('[Header] 메뉴 클릭:', item);
    const key = item.toLowerCase().replace(/\s/g, '');
    
    // Firestore에서 관리되는 메뉴명에 따라 동적으로 라우팅
    if (key.includes('brand') || key.includes('브랜드')) {
      navigate('/brand');
    } else if (key.includes('product') || key.includes('제품')) {
      navigate('/product');
    } else if (key === 'contact' || key === 'contactus' || key.includes('연락처')) {
      navigate('/contact');
    } else if (key.includes('about') || key.includes('소개')) {
      navigate('/about');
    } else if (key.includes('foodservice') || key.includes('푸드서비스') || key.includes('food')) {
      navigate('/foodservice');
    } else {
      console.log('[Header] 알 수 없는 메뉴:', item);
    }
  };

  console.log('[Header] menuItems[language] 실제 값:', menuItems?.[language]);
  const menuArray = (() => {
    if (!menuItems || !menuItems[language]) return [];
    const raw = menuItems[language];
    const arr = Array.isArray(raw) ? raw : Object.values(raw);
    return arr.filter(v => typeof v === 'string' && !Array.isArray(v) && v !== null && v !== undefined);
  })() as string[];

  return (
    <HeaderContainer
      $hover={isMainPage ? (isHeaderHover || navHover || logoHover) : true}
      $isMobile={isMobile}
      $brand={false}
      style={isMainPage ? {} : {background: '#fff', boxShadow: '0 2px 20px rgba(0,0,0,0.08)'}}
    >
      <MobileMenuButton
        $isMainPage={isMainPage}
        $isHeaderHover={isHeaderHover}
        $navHover={navHover}
        $logoHover={logoHover}
        onClick={handleMobileMenuToggle}
      >
        {mobileMenuOpen ? '×' : '≡'}
      </MobileMenuButton>
      <LogoWrapper
        onMouseEnter={() => setLogoHover(true)}
        onMouseLeave={() => setLogoHover(false)}
      >
        <a href="/" style={{ width: '100%', height: '100%', display: 'block', position: 'relative' }}>
          <LogoImg
            src={
              isMainPage
                ? (isHeaderHover || navHover || logoHover
                    ? logoBlack || undefined
                    : logoWhite || undefined)
                : logoBlack || undefined
            }
            alt="logo"
            $visible={true}
            $isMainPage={isMainPage}
            $isHeaderHover={isHeaderHover}
            $navHover={navHover}
            $logoHover={logoHover}
          />
        </a>
      </LogoWrapper>
      <NavWrapper>
        <Nav
          onMouseEnter={() => setNavHover(true)}
          onMouseLeave={() => {
            setNavHover(false);
            setHoveredItem(null);
          }}
        >
          {menuArray.length > 0 ? (
            menuArray.map((item: string, idx: number) =>
              typeof item === 'string' ? (
                <MenuItem
                  key={idx}
                  href="#"
                  $isHovered={hoveredItem === item}
                  $hover={isAnimated ? isHeaderHover : true}
                  $isMainPage={isMainPage}
                  $isHeaderHover={isHeaderHover}
                  $navHover={navHover}
                  $logoHover={logoHover}
                  onMouseEnter={() => setHoveredItem(item)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={e => {
                    e.preventDefault();
                    handleMenuClick(item);
                  }}
                >
                  {item}
                </MenuItem>
              ) : null
            )
          ) : null}
        </Nav>
      </NavWrapper>
      <LanguageSelector>
        <FlagWrapper onClick={() => handleLanguageChange('en')} title="English">
          {language === 'en' && <RedDot />}
          <FlagIcon src={`${process.env.PUBLIC_URL}/america.png`} alt="English" />
        </FlagWrapper>
        <FlagWrapper onClick={() => handleLanguageChange('ko')} title="한국어">
          {language === 'ko' && <RedDot />}
          <FlagIcon src={`${process.env.PUBLIC_URL}/korea.png`} alt="한국어" />
        </FlagWrapper>
      </LanguageSelector>
      <MobileNav $open={mobileMenuOpen}>
        {mobileMenuOpen && (
          <MobileCloseButton onClick={handleMobileMenuClose} title="닫기" style={{color:'#fff', zIndex:10001, background:'none'}}>
            ×
          </MobileCloseButton>
        )}
        {menuArray.length > 0 ? (
          menuArray.map((item, idx) => (
            <MenuItem
              key={idx}
              href="#"
              $isHovered={false}
              $hover={isAnimated ? true : true}
              $isMainPage={isMainPage}
              $isHeaderHover={isHeaderHover}
              $navHover={navHover}
              $logoHover={logoHover}
              style={{ fontSize: '1.5rem', margin: '24px 0', color: '#fff', fontWeight: 700, textShadow: '0 1px 8px rgba(0,0,0,0.18)' }}
              onClick={e => {
                e.preventDefault();
                setMobileMenuOpen(false);
                handleMenuClick(item);
              }}
            >
              {item}
            </MenuItem>
          ))
        ) : null}
        <MobileLanguageSelector>
          <FlagWrapper onClick={() => handleLanguageChange('en')} title="English">
            {language === 'en' && <RedDot />}
            <FlagIcon src={`${process.env.PUBLIC_URL}/america.png`} alt="English" style={{background:'#fff', border:'2px solid #fff'}} />
          </FlagWrapper>
          <FlagWrapper onClick={() => handleLanguageChange('ko')} title="한국어">
            {language === 'ko' && <RedDot />}
            <FlagIcon src={`${process.env.PUBLIC_URL}/korea.png`} alt="한국어" style={{background:'#fff', border:'2px solid #fff'}} />
          </FlagWrapper>
        </MobileLanguageSelector>
      </MobileNav>
    </HeaderContainer>
  );
};

export default Header;