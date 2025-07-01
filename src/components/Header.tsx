import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

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

const LogoImg = styled.img<{ $visible?: boolean }>`
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

const MenuItem = styled.a<{ $isHovered: boolean; $hover: boolean }>`
  color: ${props => (props.$hover ? '#222' : '#fff')};
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

const MobileMenuButton = styled.button`
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
    color: #fff;
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

const Header: React.FC<{ isBrandPage?: boolean }> = ({ isBrandPage = false }) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [navHover, setNavHover] = useState(false);
  const [logoHover, setLogoHover] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1162);
  const [menuItems, setMenuItems] = useState<string[]>([
    "ABOUT OMFOOD", "FOOD SERVICE", "BRAND", "PRODUCT", "CONTACT"
  ]);
  const [language, setLanguage] = useState<'en' | 'ko'>('en');
  const [logoWhite, setLogoWhite] = useState<string>('/logo_white.png');
  const [logoBlack, setLogoBlack] = useState<string>('/logo_black.png');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1162);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const docRef = doc(db, 'menu', 'names');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setMenuItems(docSnap.data().items);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Firestore에서 로고 경로 실시간 구독
    const docRef = doc(db, 'header', 'logo');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setLogoWhite(docSnap.data().white || '/logo_white.png');
        setLogoBlack(docSnap.data().black || '/logo_black.png');
      } else {
        setLogoWhite('/logo_white.png');
        setLogoBlack('/logo_black.png');
      }
    });
    return () => unsubscribe();
  }, []);

  const isHeaderHover = navHover || logoHover;

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
    // TODO: 국문 페이지 전환 로직 (추후 구현)
  };

  return (
    <HeaderContainer $hover={isBrandPage ? true : isHeaderHover} $isMobile={isMobile} $brand={isBrandPage}>
      <MobileMenuButton onClick={handleMobileMenuToggle}>
        {mobileMenuOpen ? '×' : '≡'}
      </MobileMenuButton>
      <LogoWrapper
        onMouseEnter={() => setLogoHover(true)}
        onMouseLeave={() => setLogoHover(false)}
      >
        <a href="/" style={{ width: '100%', height: '100%', display: 'block', position: 'relative' }}>
          {isBrandPage ? (
            <LogoImg src={logoBlack} alt="logo" $visible={true} />
          ) : (
            <>
              <LogoImg src={logoWhite} alt="logo" $visible={!isHeaderHover} />
              <LogoImg src={logoBlack} alt="logo" $visible={isHeaderHover} />
            </>
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
          {menuItems.map((item) => (
            <MenuItem
              key={item}
              href={item.toUpperCase() === 'BRAND' ? '/brand' : '#'}
              $isHovered={hoveredItem === item}
              $hover={isBrandPage ? true : isHeaderHover}
              style={isBrandPage ? { color: '#222' } : {}}
              onMouseEnter={() => setHoveredItem(item)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {item.split('').map((char, idx) => (
                <MenuChar
                  key={idx}
                  $isActive={hoveredItem === item}
                  $delay={hoveredItem === item ? idx * 30 : 0}
                >
                  {char}
                </MenuChar>
              ))}
            </MenuItem>
          ))}
        </Nav>
      </NavWrapper>
      <LanguageSelector>
        <FlagWrapper onClick={() => handleLanguageChange('en')} title="English">
          {language === 'en' && <RedDot />}
          <FlagIcon src="/america.png" alt="English" />
        </FlagWrapper>
        <FlagWrapper onClick={() => handleLanguageChange('ko')} title="한국어">
          {language === 'ko' && <RedDot />}
          <FlagIcon src="/korea.png" alt="한국어" />
        </FlagWrapper>
      </LanguageSelector>
      <MobileNav $open={mobileMenuOpen}>
        {mobileMenuOpen && (
          <MobileCloseButton onClick={handleMobileMenuClose} title="닫기">×</MobileCloseButton>
        )}
        {menuItems.map((item) => (
          <MenuItem
            key={item}
            href="#"
            $isHovered={false}
            $hover={true}
            style={{ fontSize: '1.5rem', margin: '24px 0', color: '#fff', fontWeight: 700 }}
            onClick={handleMobileMenuClose}
          >
            {item}
          </MenuItem>
        ))}
      </MobileNav>
    </HeaderContainer>
  );
};

export default Header;