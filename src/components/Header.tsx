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
    height: 75px;
    padding-top: 10px !important;
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
  justify-content: center;
  transition: transform 0.4s ease-in-out;
  @media (max-width: 1162px) {
    left: 50%;
    transform: translateX(-50%);
    justify-content: center;
  }
  @media (max-width: 768px) {
    width: 90px;
    height: 75px;
    top: 0 !important;
  }
`;

const LogoImg = styled.img<{
  $visible?: boolean;
  $isLoaded: boolean;
  $isMainPage: boolean;
  $isHeaderHover: boolean;
  $navHover: boolean;
  $logoHover: boolean;
}>`
  position: absolute;
  top: 50%;
  left: 50%;
  width: auto !important;
  height: auto !important;
  max-width: 100% !important;
  max-height: 100% !important;
  object-fit: contain;
  opacity: ${props => (props.$visible && props.$isLoaded ? 1 : 0)};
  transform: translate(-50%, -50%) scale(${props => (props.$visible ? 1 : 0.95)});
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
  $languageHover?: boolean;
}>`
  color: ${({ $isMainPage, $isHeaderHover, $navHover, $logoHover, $languageHover }) =>
    $isMainPage && !($isHeaderHover || $navHover || $logoHover || $languageHover) ? '#fff' : '#222'};
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
  $languageHover?: boolean;
  $isMobile: boolean;
}>`
  display: none;
  @media (max-width: 1162px) {
    display: flex;
    position: absolute;
    left: 20px;
    top: 28px;
    background: none;
    border: none;
    z-index: 10;
    font-size: 1.8rem;
    color: ${({ $isMainPage, $isHeaderHover, $navHover, $logoHover, $languageHover, $isMobile }) =>
      $isMobile ? '#222' : ($isMainPage && !($isHeaderHover || $navHover || $logoHover || $languageHover) ? '#fff' : '#222')};
    align-items: center;
    justify-content: center;
    cursor: pointer;
    width: 44px;
    height: 44px;
    @media (max-width: 768px) {
      left: 16px;
      top: 24px;
      font-size: 1.6rem;
      width: 40px;
      height: 40px;
    }
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
    @media (max-width: 768px) {
      padding-top: 100px;
      gap: 8px;
    }
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
  @media (max-width: 768px) {
    top: 20px;
    right: 20px;
    font-size: 2rem;
    width: 40px;
    height: 40px;
  }
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

const LangTextButton = styled.button<{
  $isMainPage: boolean;
  $isHeaderHover: boolean;
  $navHover: boolean;
  $logoHover: boolean;
  $languageHover?: boolean;
  $isActive: boolean;
  $isMobile?: boolean;
}>`
  background: none;
  border: none;
  color: ${({ $isMainPage, $isHeaderHover, $navHover, $logoHover, $languageHover, $isMobile }) =>
    $isMobile ? '#fff' : ($isMainPage && !($isHeaderHover || $navHover || $logoHover || $languageHover) ? '#fff' : '#222')};
  font-size: 1.125rem;
  font-weight: ${({ $isActive }) => ($isActive ? 700 : 400)};
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.4s ease-in-out, font-weight 0.2s ease;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  display: inline-flex;
  align-items: center;
  
  &:hover {
    font-weight: 600;
  }
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
  const [languageHover, setLanguageHover] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'ko'>(localStorage.getItem('siteLang') === 'ko' ? 'ko' : 'en');
  const [logoWhite, setLogoWhite] = useState<string | null>(null);
  const [logoBlack, setLogoBlack] = useState<string | null>(null);
  const [isLogoLoaded, setIsLogoLoaded] = useState(false);
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
        // 배열만 사용하도록 보장
        const en = Array.isArray(data?.en) ? data.en : [];
        const ko = Array.isArray(data?.ko) ? data.ko : [];
        setMenuItems({ en, ko });
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

  // 공통 언어 전환 함수
  const setSiteLang = (lang: 'en' | 'ko') => {
    localStorage.setItem('siteLang', lang);
    window.dispatchEvent(new CustomEvent('languageChange', { detail: { language: lang } }));
  };

  const handleLanguageChange = (lang: 'en' | 'ko') => {
    setLanguage(lang);
    setSiteLang(lang);
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
    } else if (key.includes('home') || key.includes('홈') || key.includes('foodservice') || key.includes('푸드서비스') || key.includes('food')) {
      navigate('/');
    } else {
      console.log('[Header] 알 수 없는 메뉴:', item);
    }
  };

  console.log('[Header] menuItems[language] 실제 값:', menuItems?.[language]);
  const menuArray = (() => {
    if (!menuItems || !menuItems[language]) return [];
    const raw = menuItems[language];
    // 배열만 사용하도록 보장
    const arr = Array.isArray(raw) ? raw : [];
    return arr.filter(v => typeof v === 'string' && v !== null && v !== undefined);
  })() as string[];

  const logoSrc = isMobile
    ? logoBlack || undefined
    : isMainPage
    ? (isHeaderHover || navHover || logoHover || languageHover
        ? logoBlack || undefined
        : logoWhite || undefined)
    : logoBlack || undefined;

  useEffect(() => {
    if (logoSrc) {
      setIsLogoLoaded(false);
    }
  }, [logoSrc]);

  return (
    <HeaderContainer
      $hover={isMainPage ? (isHeaderHover || navHover || logoHover || languageHover) : true}
      $isMobile={isMobile}
      $brand={false}
      style={isMainPage ? {} : {background: '#fff', boxShadow: '0 2px 20px rgba(0,0,0,0.08)'}}
    >
      <MobileMenuButton
        $isMainPage={isMainPage}
        $isHeaderHover={isHeaderHover}
        $navHover={navHover}
        $logoHover={logoHover}
        $languageHover={languageHover}
        $isMobile={isMobile}
        onClick={handleMobileMenuToggle}
      >
        {mobileMenuOpen ? '×' : '≡'}
      </MobileMenuButton>
      <LogoWrapper
        onMouseEnter={() => setLogoHover(true)}
        onMouseLeave={() => setLogoHover(false)}
      >
        <a href="/" style={{ width: '100%', height: '100%', display: 'block', position: 'relative' }}>
          {logoSrc && (
            <LogoImg
              src={logoSrc}
              alt="logo"
              $visible={true}
              $isLoaded={isLogoLoaded}
              $isMainPage={isMainPage}
              $isHeaderHover={isHeaderHover}
              $navHover={navHover}
              $logoHover={logoHover}
              onLoad={() => setIsLogoLoaded(true)}
            />
          )}
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
                  $languageHover={languageHover}
                  onMouseEnter={() => setHoveredItem(item)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={e => {
                    e.preventDefault();
                    handleMenuClick(item);
                  }}
                >
                  {item.split('').map((char, charIdx) => (
                    <MenuChar
                      key={charIdx}
                      $isActive={hoveredItem === item}
                      $delay={charIdx * 50}
                    >
                      {char}
                    </MenuChar>
                  ))}
                </MenuItem>
              ) : null
            )
          ) : null}
        </Nav>
      </NavWrapper>
      {!location.pathname.includes('/admin') && (
        <LanguageSelector
          onMouseEnter={() => setLanguageHover(true)}
          onMouseLeave={() => setLanguageHover(false)}
        >
          <LangTextButton
            onClick={() => handleLanguageChange('en')}
            $isMainPage={isMainPage}
            $isHeaderHover={isHeaderHover}
            $navHover={navHover}
            $logoHover={logoHover}
            $languageHover={languageHover}
            $isActive={language === 'en'}
            title="English"
          >
            [ENG]
          </LangTextButton>
          <LangTextButton
            onClick={() => handleLanguageChange('ko')}
            $isMainPage={isMainPage}
            $isHeaderHover={isHeaderHover}
            $navHover={navHover}
            $logoHover={logoHover}
            $languageHover={languageHover}
            $isActive={language === 'ko'}
            title="한국어"
          >
            [KOR]
          </LangTextButton>
        </LanguageSelector>
      )}
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
              $languageHover={languageHover}
              style={{ fontSize: '1.2rem', margin: '20px 0', color: '#fff', fontWeight: 700, textShadow: '0 1px 8px rgba(0,0,0,0.18)' }}
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
        {!location.pathname.includes('/admin') && (
          <MobileLanguageSelector>
            <LangTextButton
              onClick={() => handleLanguageChange('en')}
              $isMainPage={isMainPage}
              $isHeaderHover={isHeaderHover}
              $navHover={navHover}
              $logoHover={logoHover}
              $isActive={language === 'en'}
              $isMobile={true}
              title="English"
            >
              [ENG]
            </LangTextButton>
            <LangTextButton
              onClick={() => handleLanguageChange('ko')}
              $isMainPage={isMainPage}
              $isHeaderHover={isHeaderHover}
              $navHover={navHover}
              $logoHover={logoHover}
              $isActive={language === 'ko'}
              $isMobile={true}
              title="한국어"
            >
              [KOR]
            </LangTextButton>
          </MobileLanguageSelector>
        )}
      </MobileNav>
    </HeaderContainer>
  );
};

export default Header;