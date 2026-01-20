import React, { useState, useRef, useLayoutEffect, useEffect, createContext, useContext } from 'react';
import styled, { keyframes, css, createGlobalStyle } from 'styled-components';
import Header from './components/Header';
import VideoSection from './components/VideoSection';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';
import { db, storage, auth } from './firebase';
import { doc, setDoc, getDoc, onSnapshot, collection, addDoc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { QuerySnapshot, DocumentData } from 'firebase/firestore';
import Footer from './components/Footer';
import BrandPage from './components/BrandPage';
import ProductPage from './components/ProductPage';
import { signInWithEmailAndPassword } from 'firebase/auth';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import AdminProductManageComponent from './components/AdminProductManage';
import { ToastProvider, useToast } from './components/common/ToastContext';
import ContactUsPage from './components/ContactUsPage';
import ContactUsAdminPage from './components/admin/ContactUsAdminPage';
import FooterManagePage from './components/admin/FooterManagePage';
import AboutPage from './components/AboutPage';
import AboutPageAdmin from './components/admin/AboutPage_admin';

import FoodServicePage from './components/FoodServicePage';
// import ContactPage from './components/ContactPage';
// import koreaFlag from '../public/korea.png';
// import americaFlag from '../public/america.png';

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

// Quill 툴바 옵션 (통일된 포맷팅)
// Enter 키는 기본 동작 유지 (새 <p> 태그 생성)
const quillModules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'header': 1 }, { 'header': 2 }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'align': [] }],
    ['link'],
    ['clean']
  ]
};

const GlobalStyle = createGlobalStyle`
  html, body, #root {
    max-width: 100vw;
    overflow-x: hidden;
    box-sizing: border-box;
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  }
`;



// 토스트 알림 컴포넌트
const ToastContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 3000;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Toast = styled.div<{ $type: 'success' | 'error' | 'info' }>`
  background: ${({ $type }) => 
    $type === 'success' ? colors.success : 
    $type === 'error' ? colors.error : colors.info};
  color: ${colors.white};
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  font-size: 1rem;
  min-width: 300px;
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

// 로딩 스피너
const Spinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid ${colors.grayLight};
  border-top: 2px solid ${colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// 진행률 바
const ProgressBar = styled.div<{ $progress: number }>`
  width: 100%;
  height: 4px;
  background: ${colors.grayBorder};
  border-radius: 2px;
  overflow: hidden;
  margin: 8px 0;
  
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${({ $progress }) => $progress}%;
    background: ${colors.primary};
    transition: width 0.3s ease;
  }
`;



const AppContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background: transparent;
  user-select: auto;
`;

const SectionBg = styled.div`
  width: 100vw;
  background: #fdfbe9;
  display: flex;
  justify-content: center;
`;

const Section = styled.section`
  width: 100%;
  max-width: 2100px;
  padding: 130px 32px 110px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  background: transparent;
  @media (max-width: 1600px) { max-width: 1100px; }
  @media (max-width: 1200px) { max-width: 900px; }
  @media (max-width: 900px) { max-width: 100vw; padding: 60px 6px 40px 6px; }
  @media (max-width: 700px) { padding: 32px 2vw 24px 2vw; }
`;

const MainTextSectionWrapper = styled.div`
  position: absolute;
  top: 38%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: auto;
  width: 100%;
  height: 0;
`;

const MainText = styled.h1`
  font-size: 2.8rem;
  font-weight: 700;
  color: #222;
  margin-bottom: 32px;
  text-align: center;
  text-shadow: 0 4px 24px rgba(0,0,0,0.08);
`;

const SubText = styled.p`
  font-size: 1.15rem;
  color: #222;
  max-width: 1000px;
  line-height: 1.35; /* 기존 1.7 → 1.35 로 줄임 */
  text-align: center;
  white-space: pre-line;
  opacity: 0.95;
  @media (max-width: 700px) {
    max-width: 90vw;
    text-align: center;
    word-break: keep-all;
    white-space: pre-line;
    margin: 0 auto;
  }
`;

const StoreTitle = styled.h2`
  color: #222;
  font-size: 2.2rem;
  font-weight: 700;
  text-align: center;
  margin: 48px 0 32px 0;
`;

// 기존 하드코딩된 STORE 데이터 (마이그레이션용)
const initialStores = [
  {
    name: '오븐마루 치킨 베트남 호치민 1호점',
    image: 'vietnam.jpg',
    address: '187 Điện Biên Phủ, Đa Kao, Quận 1, Hồ Chí Minh, 베트남',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15677.282972487526!2d106.67666683955079!3d10.786727900000018!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528cad7b064eb%3A0x3e7eda6be7c88c70!2sOvenmaru%20Chicken!5e0!3m2!1sko!2skr!4v1749022619005!5m2!1sko!2skr',
  },
  {
    name: '오븐마루 치킨 베트남 호치민 2호점',
    image: 'vietnam2.jpg',
    address: '16 Nguyễn Quý Cảnh, P, Thủ Đức, Hồ Chí Minh, 베트남',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15676.6481739132!2d106.71918713955077!3d10.798898300000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317527ed89bde3eb%3A0x6c3c9045db0fa0de!2z7Jik67iQ66eI66OoIOy5mO2CqCDslYjtkbg!5e0!3m2!1sko!2skr!4v1749022687850!5m2!1sko!2skr',
  },
  {
    name: '오븐마루 치킨 몽골점',
    image: 'khoroolol.jpg',
    address: '15-r khoroolol, Enkhuud tuv. Улаанбаатар, Баянзүрх, 4-р хороо, 15-р хороолол, Энхүүд төв, Ulaanbaatar, 몽골',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2673.7557013355645!2d106.94798571231908!3d47.92176426604044!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5d969305b81e7c1d%3A0x545ac97474e8878f!2z7Jik67iQ66eI66Oo!5e0!3m2!1sko!2skr!4v1749022718563!5m2!1sko!2skr',
  },
  {
    name: '오븐마루 치킨 대만점',
    image: 'taipei.jpg',
    address: "106 대만 Taipei City, Da'an District, Alley 5, Lane 107, Section 1, Fuxing S Rd, 6號1樓",
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3614.704355679804!2d121.54200891154012!3d25.04410533779092!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3442abda4cfb1985%3A0x65e12a8d22720510!2z7Jik67iQ66eI66Oo!5e0!3m2!1sko!2skr!4v1749022756192!5m2!1sko!2skr',
  },
];

const StoreSection = styled.section`
  width: 100%;
  background: #fff;
  padding: clamp(40px, 6vw, 60px) 20px clamp(80px, 10vw, 120px) 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StoreList = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 40px;
  justify-items: center;
  width: 100%;
  max-width: 1800px;
  margin-top: 32px;
  padding: 0 20px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 0 16px;
  }
`;

const StoreCard = styled.div<{ $visible?: boolean; $delay?: number }>`
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.06);
  width: 360px;
  padding: clamp(16px, 2vw, 24px) clamp(16px, 2vw, 24px) clamp(24px, 3vw, 32px) clamp(16px, 2vw, 24px);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transform: ${({ $visible }) => ($visible ? 'translateY(0)' : 'translateY(40px)')};
  transition: opacity 0.7s cubic-bezier(0.4,0,0.2,1) ${({ $delay }) => $delay || 0}ms,
              transform 0.7s cubic-bezier(0.4,0,0.2,1) ${({ $delay }) => $delay || 0}ms;
  @media (max-width: 480px) {
    width: 100% !important;
    max-width: 360px;
    min-width: 0;
    margin: 0 auto;
    padding: 16px;
  }
`;

const StoreImageWrapper = styled.div`
  width: 100%;
  aspect-ratio: 4/3;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  background: #eee;
`;

const StoreImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const MapIcon = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255,255,255,0.85);
  border: none;
  border-radius: 50%;
  width: clamp(32px, 4vw, 40px);
  height: clamp(32px, 4vw, 40px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: background 0.2s;
  z-index: 2;
  &:hover {
    background: #fdfbe9;
  }
`;

const MapIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 12px;
`;

const CloseMapBtn = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255,255,255,0.85);
  border: none;
  border-radius: 50%;
  width: clamp(32px, 4vw, 40px);
  height: clamp(32px, 4vw, 40px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 3;
  font-size: clamp(16px, 2vw, 18px);
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: background 0.2s;
  &:hover {
    background: #fdfbe9;
  }
`;

const StoreAddress = styled.div`
  margin-top: clamp(12px, 2vw, 18px);
  font-size: clamp(0.9rem, 1.5vw, 1rem);
  color: #222;
  text-align: center;
  padding: 0 10px;
`;

const BrandSection = styled.section`
  width: 100%;
  background: #fff;
  padding: clamp(40px, 6vw, 80px) 0;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  gap: 80px;
  min-height: 420px;
  @media (max-width: 900px) {
    flex-direction: column;
    gap: 32px;
    padding: 32px 0;
    align-items: center;
    min-height: unset;
  }
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 24px;
    padding: 24px 0;
    align-items: center;
    min-height: unset;
  }
`;

const BrandTextBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  max-width: 480px;
  width: 100%;
  padding: 0 24px;
  @media (max-width: 900px) {
    align-items: center;
    text-align: center;
    padding: 0 8px;
  }
`;

const BrandTopText = styled.div<{ $visible: boolean }>`
  font-size: 1rem;
  font-weight: 400;
  color: #222;
  opacity: 0.7;
  margin-bottom: 8px;
  letter-spacing: -0.02em;
  opacity: ${({ $visible }) => ($visible ? 0.7 : 0)};
  transform: translateY(${({ $visible }) => ($visible ? '0' : '40px')});
  transition: opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1);
  @media (max-width: 900px) {
    width: 100%;
    text-align: center;
  }
`;

const BrandMainText = styled.div<{ $visible: boolean }>`
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 700;
  color: #111;
  line-height: 1.15;
  margin-bottom: 0.2em;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transform: translateY(${({ $visible }) => ($visible ? '0' : '40px')});
  transition: opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1);
  @media (max-width: 900px) {
    width: 100%;
    text-align: center;
  }
`;

const BrandImage = styled.img`
  width: 570px;
  max-width: 60vw;
  height: auto;
  border-radius: 24px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.08);
  background: #f8f8f8;
  object-fit: contain;
  display: block;
  @media (max-width: 900px) {
    max-width: 360px;
    width: 100%;
    height: auto;
    min-width: 0;
    object-fit: contain;
  }
`;

// 메뉴명 관리용 키
const MENU_KEY = 'omfood_menu_names';

function getMenuNames() {
  const saved = localStorage.getItem(MENU_KEY);
  if (saved) return JSON.parse(saved);
  return ['ABOUT OMFOOD', 'FOOD SERVICE', 'BRAND', 'PRODUCT', 'CONTACT'];
}

function setMenuNames(names: string[]) {
  localStorage.setItem(MENU_KEY, JSON.stringify(names));
}

// Firestore에서 메뉴명 가져오기 (실시간 구독용)
async function getMenuNamesFromFirestore() {
  try {
    const docRef = doc(db, 'header_menu', 'main');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        en: Array.isArray(data.en) ? data.en : [],
        ko: Array.isArray(data.ko) ? data.ko : []
      };
    }
  } catch (error) {
    console.error('Error fetching menu names from Firestore:', error);
  }
  return { en: [], ko: [] };
}

// 메인 섹션 관리용 키
const MAIN_KEY = 'omfood_main_section';
function getMainSection() {
  const saved = localStorage.getItem(MAIN_KEY);
  if (saved) return JSON.parse(saved);
  return {
    mediaType: 'video',
    mediaUrl: process.env.PUBLIC_URL + '/main1.mp4',
    mainText: 'Global Taste, Local Touch',
    subText: 'From sauces to stores, we blend Korean flavor with local culture<br />for every market we serve.'
  };
}
function setMainSection(data: any) {
  localStorage.setItem(MAIN_KEY, JSON.stringify(data));
}

// Store 관리용 Firestore 컬렉션 키
const STORES_COLLECTION = 'stores';

// 관리자 공통 레이아웃 스타일 (새로운 디자인 시스템 적용)
const AdminLayout = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${colors.grayLight};
  position: relative;
`;

const AdminLogoutBtn = styled.button`
  position: fixed;
  top: 32px;
  right: 40px;
  z-index: 200;
  background: ${colors.white};
  border: 1px solid ${colors.grayBorder};
  border-radius: 8px;
  padding: 12px 24px;
  cursor: pointer;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  font-size: 1rem;
  color: ${colors.black};
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.2s ease;
  
  &:hover { 
    background: ${colors.primary}; 
    color: ${colors.white};
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }
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

const AdminHeader = styled.header`
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 32px;
  color: ${colors.black};
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${colors.black};
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  margin-bottom: 24px;
  transition: color 0.2s ease;
  
  &:hover {
    color: ${colors.primary};
  }
`;

// 관리자 언어 Context
const AdminLangContext = createContext<{adminLang: 'ko'|'en', setAdminLang: (lang: 'ko'|'en')=>void}>({adminLang: 'en', setAdminLang: ()=>{}});
export function useAdminLang() { return useContext(AdminLangContext); }

function AdminLayoutComponent({ children, showBackButton = true, backTo, backLabel }: { children: React.ReactNode; showBackButton?: boolean; backTo?: string; backLabel?: string }) {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem('admin_login');
    navigate('/admin/login');
  };
  // Context 기반 언어 상태
  const [adminLang, setAdminLang] = useState<'ko'|'en'>(localStorage.getItem('adminLang') === 'ko' ? 'ko' : 'en');
  const handleLangChange = (lang: 'ko'|'en') => {
    setAdminLang(lang);
    localStorage.setItem('adminLang', lang);
    // 커스텀 이벤트 발행
    window.dispatchEvent(new CustomEvent('adminLangChange', { detail: { language: lang }}));
  };
  return (
    <AdminLangContext.Provider value={{adminLang, setAdminLang: handleLangChange}}>
      <AdminLayout>
        <AdminMain>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            {showBackButton && (
              <BackButton onClick={() => navigate(backTo || '/admin/dashboard')}>
                <span style={{ fontSize: 20 }}>←</span> {backLabel || '대시보드로'}
              </BackButton>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {showBackButton && (
                <>
                  <button 
                    onClick={() => handleLangChange('en')} 
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      padding: '8px 12px', 
                      margin: 0, 
                      cursor: 'pointer', 
                      outline: 'none',
                      fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: '1.125rem',
                      fontWeight: adminLang === 'en' ? 700 : 400,
                      color: adminLang === 'en' ? colors.black : colors.grayMedium,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    [ENG]
                  </button>
                  <button 
                    onClick={() => handleLangChange('ko')} 
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      padding: '8px 12px', 
                      margin: 0, 
                      cursor: 'pointer', 
                      outline: 'none',
                      fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: '1.125rem',
                      fontWeight: adminLang === 'ko' ? 700 : 400,
                      color: adminLang === 'ko' ? colors.black : colors.grayMedium,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    [KOR]
                  </button>
                </>
              )}
              <AdminLogoutBtn onClick={logout}>로그아웃</AdminLogoutBtn>
            </div>
          </div>
          {children}
        </AdminMain>
      </AdminLayout>
    </AdminLangContext.Provider>
  );
}

function StoreCards({ stores }: { stores: Array<{ name: string; image: string; address: string; mapUrl: string; order?: number }> }) {
  const [openMapIdx, setOpenMapIdx] = useState<number | null>(null);
  // order 기준 정렬
  const sortedStores = [...stores].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // 애니메이션 관련
  const cardRefs = useRef<(HTMLDivElement|null)[]>([]);
  const [visibleArr, setVisibleArr] = useState<boolean[]>([]);

  // 카드 개수 변화에 따라 ref/visibleArr 동기화
  useEffect(() => {
    setVisibleArr(Array(sortedStores.length).fill(false));
    cardRefs.current = Array(sortedStores.length).fill(null);
  }, [sortedStores.length]);

  // ref가 모두 연결된 후에만 observer 연결
  useEffect(() => {
    if (!sortedStores.length) return;
    if (cardRefs.current.some(ref => !ref)) return;

    const observers: IntersectionObserver[] = [];
    cardRefs.current.forEach((ref, idx) => {
      if (!ref) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            setVisibleArr(prev => {
              if (prev[idx] === entry.isIntersecting) return prev;
              const next = [...prev];
              next[idx] = entry.isIntersecting;
              return next;
            });
          });
        },
        { threshold: 0.3, rootMargin: '0px 0px -20% 0px' }
      );
      observer.observe(ref);
      observers.push(observer);
    });
    return () => { observers.forEach(o => o.disconnect()); };
  }, [sortedStores.length, cardRefs.current, stores]);

  console.log('[StoreCards] stores prop:', stores);

  return (
    <StoreSection>
      <StoreTitle>STORE</StoreTitle>
      <StoreList>
        {(() => { console.log('[StoreCards] map 실행, stores:', stores); return null; })()}
        {sortedStores.map((store, idx) => (
          <StoreCard
            key={store.name}
            ref={el => { cardRefs.current[idx] = el; }}
            $visible={visibleArr[idx]}
            $delay={idx * 120}
          >
            <StoreImageWrapper>
              {openMapIdx === idx ? (
                <>
                  <MapIframe src={store.mapUrl} allowFullScreen loading="lazy" />
                  <CloseMapBtn onClick={() => setOpenMapIdx(null)} title="지도 닫기">×</CloseMapBtn>
                </>
              ) : (
                <>
                  <StoreImage
                    src={store.image.startsWith('http') ? store.image : process.env.PUBLIC_URL + '/' + store.image}
                    alt={store.name}
                  />
                  <MapIcon onClick={() => setOpenMapIdx(idx)} title="구글 지도 열기">
                    <img src={process.env.PUBLIC_URL + '/google-maps.png'} alt="구글 지도 아이콘" width={24} height={24} />
                  </MapIcon>
                </>
              )}
            </StoreImageWrapper>
            <StoreAddress>{store.address}</StoreAddress>
          </StoreCard>
        ))}
      </StoreList>
    </StoreSection>
  );
}

const BrandsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 80px;
`;

// styled-components로 작은 폰트 스타일 추가
const BrandSubText = styled.div<{ $visible: boolean }>`
  font-size: 0.98rem;
  color: #888;
  margin-bottom: 12px;
  min-height: 18px;
  opacity: 0;
  transition: opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1);
  transform: translateY(40px);
  ${({ $visible }) => $visible && css`
    opacity: 1;
    transform: translateY(0);
  `}
`;

function Brands() {
  const [brands, setBrands] = useState<Array<{ name: { en: string; ko: string }; desc: { en: string; ko: string }; subText?: { en: string; ko: string }; image: string; order?: number; nameSize?: string; descSize?: string; subTextSize?: string }>>([]);
  const refs = useRef<Array<HTMLDivElement | null>>([]);
  const [visibleArr, setVisibleArr] = useState<boolean[]>([]);
  const siteLang = localStorage.getItem('siteLang') === 'ko' ? 'ko' : 'en';

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'brands'), (snapshot) => {
      const arr = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        // 마이그레이션: 기존 string이면 en으로 간주
        return {
          name: typeof data.name === 'string' ? { en: data.name, ko: '' } : { en: data.name?.en || '', ko: data.name?.ko || '' },
          desc: typeof data.desc === 'string' ? { en: data.desc, ko: '' } : { en: data.desc?.en || '', ko: data.desc?.ko || '' },
          subText: typeof data.subText === 'string' ? { en: data.subText, ko: '' } : { en: data.subText?.en || '', ko: data.subText?.ko || '' },
          image: data.image || '',
          order: data.order ?? 0,
          nameSize: data.nameSize || '1rem',
          descSize: data.descSize || '3.2rem',
          subTextSize: data.subTextSize || '0.98rem'
        };
      });
      arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setBrands(arr);
      refs.current = Array(arr.length).fill(null);
      setVisibleArr(Array(arr.length).fill(false));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!brands.length) return;
    if (refs.current.filter(Boolean).length !== brands.length) return;

    const timeout = setTimeout(() => {
      const observers: IntersectionObserver[] = [];
      refs.current.forEach((ref, idx) => {
        if (!ref) return;
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              setVisibleArr(prev => {
                if (prev[idx] === entry.isIntersecting) return prev;
                const next = [...prev];
                next[idx] = entry.isIntersecting;
                return next;
              });
            });
          },
          { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
        );
        observer.observe(ref);
        observers.push(observer);
      });
      // cleanup
      return () => { observers.forEach(o => o.disconnect()); };
    }, 0);

    return () => clearTimeout(timeout);
  }, [brands, visibleArr, refs.current.filter(Boolean).length]);

  return (
    <BrandsWrapper>
      {brands.map((brand, idx) => (
        <BrandSection ref={el => { refs.current[idx] = el as HTMLDivElement; }} key={brand.name[siteLang] + idx}>
          <BrandTextBlock>
            <BrandTopText $visible={visibleArr[idx]} style={{ fontSize: brand.nameSize || '1rem' }} dangerouslySetInnerHTML={{ __html: brand.name[siteLang] || '' }} />
            <BrandMainText $visible={visibleArr[idx]} style={brand.descSize ? { fontSize: brand.descSize } : undefined} dangerouslySetInnerHTML={{ __html: brand.desc[siteLang] || '' }} />
            <BrandSubText $visible={visibleArr[idx]} style={{ fontSize: brand.subTextSize || '0.98rem' }} dangerouslySetInnerHTML={{ __html: brand.subText?.[siteLang] || '' }} />
          </BrandTextBlock>
          {brand.image && <BrandImage src={brand.image} alt={brand.name[siteLang]} />}
        </BrandSection>
      ))}
    </BrandsWrapper>
  );
}

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const SloganMainText = styled(MainText)<{ $show: boolean }>`
  opacity: 0;
  ${({ $show }) => $show && css`
    animation: ${fadeIn} 0.8s cubic-bezier(0.4,0,0.2,1) forwards;
  `}
`;

const SloganSubTextLine = styled.span<{ $show: boolean; $delay: number }>`
  display: block;
  opacity: 0;
  ${({ $show, $delay }) => $show && css`
    animation: ${fadeIn} 0.7s cubic-bezier(0.4,0,0.2,1) forwards;
    animation-delay: ${$delay}ms;
  `}
`;

const SloganImageWrapper = styled.div`
  width: 100%;
  overflow: hidden;
  line-height: 0;
  position: relative;
  @media (max-width: 768px) {
    margin-top: -30px !important;
    margin-bottom: 0 !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    display: block !important;
    line-height: 0 !important;
    font-size: 0 !important;
    vertical-align: top !important;
    border: none !important;
    outline: none !important;
  }
`;

const SloganBannerImage = styled.img`
  width: 100%;
  height: auto;
  max-height: 100vh;
  object-fit: cover;
  display: block;
  @media (max-width: 768px) {
    height: auto !important;
    min-height: 500px !important;
    max-height: none !important;
    object-fit: cover !important;
    object-position: center;
    margin-top: 0 !important;
    margin-bottom: 0 !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    vertical-align: top !important;
    line-height: 0 !important;
  }
`;

const SloganTextOverlay = styled.div<{ $x: number; $y: number }>`
  position: absolute;
  top: ${({ $y }) => $y}%;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center !important;
  text-align: center !important;
  width: 95%;
  max-width: 100% !important;
  @media (max-width: 768px) {
    width: 95%;
  }
`;

const SloganMainTextOverlay = styled.div<{ $color?: string; $fontSize?: string }>`
  font-size: ${({ $fontSize }) => $fontSize || '2.8rem'};
  font-weight: 700;
  color: ${({ $color }) => $color || '#fff'};
  margin-bottom: 90px;
  text-align: center !important;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  white-space: pre-wrap;
  word-break: keep-all;
  @media (max-width: 768px) {
    font-size: 1.5rem !important;
    margin-bottom: 16px !important;
  }
`;

const SloganSubTextOverlay = styled.div<{ $color?: string; $fontSize?: string }>`
  font-size: ${({ $fontSize }) => $fontSize || '1.15rem'};
  color: ${({ $color }) => $color || '#fff'};
  width: 105% !important;
  max-width: 2200px !important;
  text-align: center !important;
  opacity: 0.95;
  display: block !important;
  margin: 0 auto !important;

  /* 전체 줄간격을 강하게 줄임 */
  line-height: 1.7 !important;

  /* 내부 모든 자식에 동일한 줄간격/여백 강제 */
  & > * {
    margin: 0 !important;
    padding: 0 !important;
    line-height: 1.3 !important;
    white-space: pre-wrap !important;
    word-break: keep-all !important;
  }

  /* 혹시 p 태그가 들어오는 경우 문단 간 여백 제거 */
  & p {
    margin-bottom: 0 !important;
    min-height: 1em;
  }

  /* <br> 에 의한 여백이 과하게 느껴지지 않도록 */
  & br {
    line-height: 0 !important;
  }

  @media (max-width: 768px) {
    font-size: 0.85rem !important;
    line-height: 1.35 !important;
    width: 95% !important;
    & > * {
      line-height: 1.35 !important;
    }
  }
`;

const TypewriterChar = styled.span<{ $show: boolean; $delay: number }>`
  opacity: ${({ $show }) => ($show ? 1 : 0)};
  transition: opacity 0.1s ease-in;
  transition-delay: ${({ $delay }) => $delay}ms;
  display: inline;
  white-space: normal;
  word-break: inherit;
`;

function SloganSection() {
  const { adminLang } = useAdminLang();
  const [mainText, setMainText] = useState<{ en: string; ko: string }>({ en: '', ko: '' });
  const [subText, setSubText] = useState<{ en: string; ko: string }>({ en: '', ko: '' });
  const [sloganImage, setSloganImage] = useState<string | null>(null);
  const [textPos, setTextPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [mainColor, setMainColor] = useState<string>('#ffffff');
  const [subColor, setSubColor] = useState<string>('#ffffff');
  const [mainFontSize, setMainFontSize] = useState<string>('2.8rem');
  const [subFontSize, setSubFontSize] = useState<string>('1.15rem');
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [visibleChars, setVisibleChars] = useState<{ main: number; sub: number }>({ main: 0, sub: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const siteLang = localStorage.getItem('siteLang') === 'ko' ? 'ko' : 'en';

  useEffect(() => {
    const docRef = doc(db, 'slogan', 'main');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // 마이그레이션: 기존 string이면 en으로 간주
        setMainText(typeof data.mainText === 'string' ? { en: data.mainText, ko: '' } : { en: data.mainText?.en || '', ko: data.mainText?.ko || '' });
        setSubText(typeof data.subText === 'string' ? { en: data.subText, ko: '' } : { en: data.subText?.en || '', ko: data.subText?.ko || ''         });
        setSloganImage(data.sloganImage || null);
        setTextPos(data.textPos || { x: 50, y: 50 });
        setMainColor(data.mainColor || '#ffffff');
        setSubColor(data.subColor || '#ffffff');
        setMainFontSize(data.mainFontSize || '2.8rem');
        setSubFontSize(data.subFontSize || '1.15rem');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [adminLang]);

  useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.7 && rect.bottom > 0) {
        setShow(true);
      } else {
        setShow(false);
        setVisibleChars({ main: 0, sub: 0 });
      }
    };
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!show) {
      setVisibleChars({ main: 0, sub: 0 });
      return;
    }

    // HTML 태그를 제거하고 순수 텍스트만 추출
    const stripHtml = (html: string) => {
      const tmp = document.createElement('DIV');
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || '';
    };

    const mainTextPlain = stripHtml(mainText[siteLang] || '');
    const subTextPlain = stripHtml(subText[siteLang] || '');

    // MainText 타자기 애니메이션 (속도 향상: 50ms -> 15ms -> 8ms)
    mainTextPlain.split('').forEach((_, i) => {
      setTimeout(() => {
        setVisibleChars(prev => ({ ...prev, main: i + 1 }));
      }, i * 8);
    });

    // SubText는 MainText가 끝난 후 시작 (속도 향상: 30ms -> 10ms -> 5ms)
    const mainTextDelay = mainTextPlain.length * 8;
    subTextPlain.split('').forEach((_, i) => {
      setTimeout(() => {
        setVisibleChars(prev => ({ ...prev, sub: i + 1 }));
      }, mainTextDelay + 100 + i * 5);
    });
  }, [show, mainText, subText, siteLang]);

  if (loading) return null;

  // HTML 태그를 제거하고 순수 텍스트만 추출하는 함수
  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // HTML을 파싱하여 텍스트 노드와 줄바꿈을 정확히 추출
  // <p>, <div>, <br> 태그의 종료 시점을 명확한 줄바꿈으로 변환
  const parseHtmlToTextNodes = (html: string) => {
    if (!html || html.trim() === '') return [];
    
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    const textNodes: Array<{ type: 'text' | 'br'; content?: string }> = [];
    
    const processNode = (node: Node, isFirstInParent: boolean = false) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        // 공백만 있는 텍스트도 보존 (줄바꿈 유지)
        if (text.length > 0) {
          textNodes.push({ type: 'text', content: text });
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const tagName = element.tagName.toUpperCase();
        
        if (tagName === 'BR') {
          // <br> 태그는 명확한 줄바꿈
          textNodes.push({ type: 'br' });
        } else if (tagName === 'P') {
          // P 태그 시작 전에 줄바꿈 추가 (이전 형제가 P 또는 DIV인 경우)
          if (!isFirstInParent) {
            const prevSibling = element.previousElementSibling;
            if (prevSibling && (prevSibling.tagName.toUpperCase() === 'P' || prevSibling.tagName.toUpperCase() === 'DIV')) {
              textNodes.push({ type: 'br' });
            }
          }
          
          // P 태그 내부 노드 처리
          const children = Array.from(element.childNodes);
          if (children.length === 0) {
            // 빈 P 태그도 줄바꿈으로 처리 (엔터만 친 경우)
            textNodes.push({ type: 'br' });
          } else {
            children.forEach((child, idx) => {
              processNode(child, idx === 0);
            });
          }
        } else if (tagName === 'DIV') {
          // DIV 태그도 P와 유사하게 처리
          if (!isFirstInParent) {
            const prevSibling = element.previousElementSibling;
            if (prevSibling && (prevSibling.tagName.toUpperCase() === 'P' || prevSibling.tagName.toUpperCase() === 'DIV')) {
              textNodes.push({ type: 'br' });
            }
          }
          
          const children = Array.from(element.childNodes);
          if (children.length === 0) {
            // 빈 DIV도 줄바꿈으로 처리
            textNodes.push({ type: 'br' });
          } else {
            children.forEach((child, idx) => {
              processNode(child, idx === 0);
            });
          }
        } else {
          // 기타 인라인 태그는 자식 노드만 처리
          Array.from(element.childNodes).forEach((child, idx) => {
            processNode(child, idx === 0);
          });
        }
      }
    };
    
    // 루트의 모든 자식 노드 처리
    const rootChildren = Array.from(tmp.childNodes);
    rootChildren.forEach((child, idx) => {
      processNode(child, idx === 0);
    });
    
    return textNodes;
  };

  const renderTextWithAnimation = (text: string, visibleCount: number, isMain: boolean) => {
    const plainText = stripHtml(text);
    const chars = plainText.split('');
    const textNodes = parseHtmlToTextNodes(text);
    let charIndex = 0;
    
    if (isMain) {
      return (
        <SloganMainTextOverlay $color={mainColor} $fontSize={mainFontSize}>
          {textNodes.map((node, nodeIdx) => {
            if (node.type === 'br') {
              return <br key={`br-${nodeIdx}`} />;
            }
            if (node.type === 'text' && node.content) {
              return node.content.split('').map((char, charIdx) => {
                const currentCharIndex = charIndex++;
                return (
                  <TypewriterChar
                    key={`${nodeIdx}-${charIdx}`}
                    $show={show && currentCharIndex < visibleCount}
                    $delay={currentCharIndex * 8}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </TypewriterChar>
                );
              });
            }
            return null;
          })}
        </SloganMainTextOverlay>
      );
    } else {
      const mainTextPlain = stripHtml(mainText[siteLang] || '');
      const mainTextDelay = mainTextPlain.length * 8;
      return (
        <SloganSubTextOverlay $color={subColor} $fontSize={subFontSize}>
          {textNodes.map((node, nodeIdx) => {
            if (node.type === 'br') {
              return <br key={`br-${nodeIdx}`} />;
            }
            if (node.type === 'text' && node.content) {
              // 단어 단위로 나누어서 렌더링 (줄바꿈 개선)
              const words = node.content.split(/(\s+)/);
              return words.map((word, wordIdx) => {
                if (word.trim() === '') {
                  // 공백은 그대로 유지
                  return <span key={`${nodeIdx}-word-${wordIdx}`} style={{ whiteSpace: 'pre' }}>{word}</span>;
                }
                return (
                  <span key={`${nodeIdx}-word-${wordIdx}`} style={{ display: 'inline-block', whiteSpace: 'normal' }}>
                    {word.split('').map((char, charIdx) => {
                      const currentCharIndex = charIndex++;
                      return (
                        <TypewriterChar
                          key={`${nodeIdx}-${wordIdx}-${charIdx}`}
                          $show={show && currentCharIndex < visibleCount}
                          $delay={mainTextDelay + 100 + currentCharIndex * 5}
                        >
                          {char}
                        </TypewriterChar>
                      );
                    })}
                  </span>
                );
              });
            }
            return null;
          })}
        </SloganSubTextOverlay>
      );
    }
  };

  return (
    <>
      {sloganImage ? (
        <SloganImageWrapper ref={ref}>
          <SloganBannerImage src={sloganImage} alt="Slogan Banner" />
          <SloganTextOverlay $x={textPos.x} $y={textPos.y}>
            {renderTextWithAnimation(mainText[siteLang] || '', visibleChars.main, true)}
            {renderTextWithAnimation(subText[siteLang] || '', visibleChars.sub, false)}
          </SloganTextOverlay>
        </SloganImageWrapper>
      ) : (
        <SectionBg>
          <Section ref={ref}>
            <SloganMainText $show={show} dangerouslySetInnerHTML={{ __html: mainText[siteLang] || '' }} />
            <SubText style={{ minHeight: 48 }} dangerouslySetInnerHTML={{ __html: subText[siteLang] || '' }} />
          </Section>
        </SectionBg>
      )}
    </>
  );
}

function AdminLogin() {
  const navigate = useNavigate();
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, id, pw);
      localStorage.setItem('admin_login', '1');
      navigate('/admin/dashboard');
    } catch (error) {
      setErr('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  };
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f7f7' }}>
      <form onSubmit={handleLogin} style={{ background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', minWidth: 320 }}>
        <h2 style={{ marginBottom: 24 }}>관리자 로그인</h2>
        <input value={id} onChange={e => setId(e.target.value)} placeholder="이메일" style={{ width: '100%', marginBottom: 12, padding: 8, fontSize: 16 }} />
        <input value={pw} onChange={e => setPw(e.target.value)} placeholder="비밀번호" type="password" style={{ width: '100%', marginBottom: 12, padding: 8, fontSize: 16 }} />
        <button type="submit" style={{ width: '100%', padding: 10, fontSize: 16, background: '#222', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>로그인</button>
        {err && <div style={{ color: 'red', marginTop: 12 }}>{err}</div>}
      </form>
    </div>
  );
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  if (localStorage.getItem('admin_login') === '1') {
    return <AdminLayoutComponent>{children}</AdminLayoutComponent>;
  }
  return <Navigate to="/admin/login" replace />;
}

function AdminDashboard() {
  const navigate = useNavigate();
  const { adminLang } = useAdminLang();
  const iconSize = 38;
  const [menuNames, setMenuNames] = useState<{ en: string[]; ko: string[] }>({
    en: ["ABOUT OMFOOD", "FOOD SERVICE", "BRAND", "PRODUCT", "CONTACT"],
    ko: ["ABOUT OMFOOD", "FOOD SERVICE", "BRAND", "PRODUCT", "CONTACT"]
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'header_menu', 'main'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMenuNames({
          en: Array.isArray(data.en) ? data.en : [],
          ko: Array.isArray(data.ko) ? data.ko : []
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // HOME인지 판별 (영/한 모두 대응)
  const isHomeMenu = (title?: string, path?: string) => {
    const t = (title || "").trim().toLowerCase();
    const p = (path || "").trim().toLowerCase();
    const titleIsHome =
      t === "home" || t === "main" || t === "메인" || t === "홈" || /(^|\s)home($|\s)/.test(t);
    const pathIsHome = p.includes("/home");
    return titleIsHome || pathIsHome;
  };

  // 메뉴명에 맞는 경로 매핑 (동적)
  const getMenuRoute = (name: string) => {
    const upper = name.toUpperCase();
    if (upper.includes('ABOUT')) return '/admin/about';
    if (upper.includes('FOOD')) return '/admin/foodservice';
    if (upper.includes('BRAND')) return '/admin/brandpage';
    if (upper.includes('PRODUCT')) return '/admin/product';
    if (upper.includes('CONTACT')) return '/admin/contact';
    return '/admin';
  };

  // items 조립 이후, 렌더 전에 HOME 제거
  const visibleItems = (menuNames[adminLang] || []).filter((it) => !isHomeMenu(it, getMenuRoute(it)));

  return (
    <AdminLayoutComponent showBackButton={false}>
      <AdminHeader style={{ textAlign: 'center' }}>관리자 대시보드</AdminHeader>
      <div style={{ 
        maxWidth: '2100px', 
        margin: '100px auto 0 auto', 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '32px',
        padding: '0 20px'
      }}>
        {/* 메인페이지 관리 */}
        <div style={{ 
          width: '100%', 
          background: colors.white, 
          borderRadius: '8px', 
          border: `1px solid ${colors.grayBorder}`, 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
          padding: '32px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          cursor: 'pointer', 
          transition: 'all 0.2s ease'
        }} 
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        }}
        onClick={() => navigate('/admin/mainpage')}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ 
              fontWeight: '600', 
              fontSize: '1.5rem', 
              marginBottom: '8px',
              fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
              color: colors.black
            }}>메인페이지 관리</span>
            <span style={{ 
              color: colors.grayDark, 
              fontSize: '1rem',
              fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
              textAlign: 'center',
              lineHeight: '1.6'
            }}>헤더, 메인 섹션, 슬로건, 스토어, 브랜드 관리</span>
          </div>
        </div>
        {/* 동적 메뉴 관리 버튼 */}
        {visibleItems.map((name, index) => (
          <div key={index} style={{ 
            width: '100%', 
            background: colors.white, 
            borderRadius: '8px', 
            border: `1px solid ${colors.grayBorder}`, 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
            padding: '32px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            cursor: 'pointer', 
            transition: 'all 0.2s ease'
          }} 
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }}
          onClick={() => navigate(getMenuRoute(name)) }>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ 
                fontWeight: '600', 
                fontSize: '1.5rem', 
                marginBottom: '8px',
                fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
                color: colors.black
              }}>{name}</span>
              <span style={{ 
                color: colors.grayDark, 
                fontSize: '1rem',
                fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
                textAlign: 'center',
                lineHeight: '1.6'
              }}>{name} 페이지 관리</span>
            </div>
          </div>
        ))}
      </div>
    </AdminLayoutComponent>
  );
}

// 메인페이지 관리 페이지 (기존 기능들을 통합)
function AdminMainPageManage() {
  const navigate = useNavigate();
  
  return (
    <AdminLayoutComponent showBackButton={false}>
      <AdminHeader>메인페이지 관리</AdminHeader>
      <div className="admin-mainpage-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(5, 1fr)', 
        gap: '24px', 
        marginBottom: '40px',
        maxWidth: '2100px',
        margin: '0 auto 40px auto',
        padding: '0 20px'
      }}>
        <div style={{ 
          background: colors.white, 
          borderRadius: '12px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)', 
          padding: '24px 16px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          cursor: 'pointer', 
          transition: 'all 0.3s ease',
          border: `1px solid ${colors.grayBorder}`,
          minHeight: '160px'
        }} 
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
        }}
        onClick={() => navigate('/admin/menu')}>
          <span style={{ fontSize: '28px', marginBottom: '12px' }}>📋</span>
          <span style={{ 
            fontWeight: '600', 
            fontSize: '1rem', 
            marginBottom: '4px',
            fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
            color: colors.black,
            textAlign: 'center'
          }}>헤더영역 관리</span>
          <span style={{ 
            color: colors.grayDark, 
            fontSize: '0.8rem',
            fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
            textAlign: 'center',
            lineHeight: '1.3'
          }}>로고/메뉴명 수정</span>
        </div>
        <div style={{ 
          background: colors.white, 
          borderRadius: '12px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)', 
          padding: '24px 16px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          cursor: 'pointer', 
          transition: 'all 0.3s ease',
          border: `1px solid ${colors.grayBorder}`,
          minHeight: '160px'
        }} 
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
        }}
        onClick={() => navigate('/admin/main')}>
          <span style={{ fontSize: '28px', marginBottom: '12px' }}>🎬</span>
          <span style={{ 
            fontWeight: '600', 
            fontSize: '1rem', 
            marginBottom: '4px',
            fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
            color: colors.black,
            textAlign: 'center'
          }}>메인 섹션 관리</span>
          <span style={{ 
            color: colors.grayDark, 
            fontSize: '0.8rem',
            fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
            textAlign: 'center',
            lineHeight: '1.3'
          }}>메인 비주얼/텍스트 관리</span>
        </div>
        <div style={{ 
          background: colors.white, 
          borderRadius: '12px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)', 
          padding: '24px 16px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          cursor: 'pointer', 
          transition: 'all 0.3s ease',
          border: `1px solid ${colors.grayBorder}`,
          minHeight: '160px'
        }} 
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
        }}
        onClick={() => navigate('/admin/slogan')}>
          <span style={{ fontSize: '28px', marginBottom: '12px' }}>💬</span>
          <span style={{ 
            fontWeight: '600', 
            fontSize: '1rem', 
            marginBottom: '4px',
            fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
            color: colors.black,
            textAlign: 'center'
          }}>슬로건 관리</span>
          <span style={{ 
            color: colors.grayDark, 
            fontSize: '0.8rem',
            fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
            textAlign: 'center',
            lineHeight: '1.3'
          }}>슬로건 텍스트 관리</span>
        </div>
        <div style={{ 
          background: colors.white, 
          borderRadius: '12px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)', 
          padding: '24px 16px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          cursor: 'pointer', 
          transition: 'all 0.3s ease',
          border: `1px solid ${colors.grayBorder}`,
          minHeight: '160px'
        }} 
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
        }}
        onClick={() => navigate('/admin/store')}>
          <span style={{ fontSize: '28px', marginBottom: '12px' }}>🏪</span>
          <span style={{ 
            fontWeight: '600', 
            fontSize: '1rem', 
            marginBottom: '4px',
            fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
            color: colors.black,
            textAlign: 'center'
          }}>스토어 관리</span>
          <span style={{ 
            color: colors.grayDark, 
            fontSize: '0.8rem',
            fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
            textAlign: 'center',
            lineHeight: '1.3'
          }}>스토어 정보/이미지 관리</span>
        </div>
        <div style={{ 
          background: colors.white, 
          borderRadius: '12px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)', 
          padding: '24px 16px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          cursor: 'pointer', 
          transition: 'all 0.3s ease',
          border: `1px solid ${colors.grayBorder}`,
          minHeight: '160px'
        }} 
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
        }}
        onClick={() => navigate('/admin/brand')}>
          <span style={{ fontSize: '28px', marginBottom: '12px' }}>🏷️</span>
          <span style={{ 
            fontWeight: '600', 
            fontSize: '1rem', 
            marginBottom: '4px',
            fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
            color: colors.black,
            textAlign: 'center'
          }}>브랜드 관리</span>
          <span style={{ 
            color: colors.grayDark, 
            fontSize: '0.8rem',
            fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
            textAlign: 'center',
            lineHeight: '1.3'
          }}>브랜드 정보/이미지 관리</span>
        </div>
        {/* 푸터 영역 관리 버튼 추가 */}
        <div style={{ 
          background: colors.white, 
          borderRadius: '12px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)', 
          padding: '24px 16px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          cursor: 'pointer', 
          transition: 'all 0.3s ease',
          border: `1px solid ${colors.grayBorder}`,
          minHeight: '160px'
        }} 
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
        }}
        onClick={() => navigate('/admin/footer')}>
          <span style={{ fontSize: '28px', marginBottom: '12px' }}>📄</span>
          <span style={{ 
            fontWeight: '600', 
            fontSize: '1rem', 
            marginBottom: '4px',
            fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
            color: colors.black,
            textAlign: 'center'
          }}>푸터 영역 관리</span>
          <span style={{ 
            color: colors.grayDark, 
            fontSize: '0.8rem',
            fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
            textAlign: 'center',
            lineHeight: '1.3'
          }}>홈페이지 하단 링크/SNS/카피라이트 관리</span>
        </div>
      </div>
      
      {/* 반응형 스타일 추가 */}
      <style>{`
        @media (max-width: 1200px) {
          .admin-mainpage-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 768px) {
          .admin-mainpage-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 16px !important;
          }
        }
        @media (max-width: 480px) {
          .admin-mainpage-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </AdminLayoutComponent>
  );
}

// About OMFOOD 관리 페이지
function AdminAboutManage() {
  const { success } = useToast();
  const [aboutData, setAboutData] = useState<{
    title: { en: string; ko: string };
    subtitle: { en: string; ko: string };
    description: { en: string; ko: string };
    content: { en: string; ko: string };
    mission: { en: string; ko: string };
    vision: { en: string; ko: string };
  }>({
    title: { en: '', ko: '' },
    subtitle: { en: '', ko: '' },
    description: { en: '', ko: '' },
    content: { en: '', ko: '' },
    mission: { en: '', ko: '' },
    vision: { en: '', ko: '' }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { adminLang } = useAdminLang();

  useEffect(() => {
    const docRef = doc(db, 'about_page', 'main');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // 마이그레이션: 기존 string이면 en으로 간주
        setAboutData({
          title: typeof data.title === 'string' ? { en: data.title, ko: data.title } : { en: data.title?.en ?? '', ko: data.title?.ko ?? '' },
          subtitle: typeof data.subtitle === 'string' ? { en: data.subtitle, ko: data.subtitle } : { en: data.subtitle?.en ?? '', ko: data.subtitle?.ko ?? '' },
          description: typeof data.description === 'string' ? { en: data.description, ko: data.description } : { en: data.description?.en ?? '', ko: data.description?.ko ?? '' },
          content: typeof data.content === 'string' ? { en: data.content, ko: data.content } : { en: data.content?.en ?? '', ko: data.content?.ko ?? '' },
          mission: typeof data.mission === 'string' ? { en: data.mission, ko: data.mission } : { en: data.mission?.en ?? '', ko: data.mission?.ko ?? '' },
          vision: typeof data.vision === 'string' ? { en: data.vision, ko: data.vision } : { en: data.vision?.en ?? '', ko: data.vision?.ko ?? '' }
        });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [adminLang]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'about_page', 'main'), aboutData);
      success('저장되었습니다!');
    } catch (error) {
      success('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayoutComponent showBackButton={false}>
        <AdminHeader>About OMFOOD 관리</AdminHeader>
        <AdminCard>
          <div style={{ textAlign: 'center', color: '#888', fontSize: 16 }}>
            로딩 중...
          </div>
        </AdminCard>
      </AdminLayoutComponent>
    );
  }

  return (
    <AdminLayoutComponent key={`about-manage-${adminLang}`} showBackButton={false}>
      <AdminHeader>About OMFOOD 관리</AdminHeader>
      
      <AdminCard>
        <AdminLabel>페이지 제목</AdminLabel>
        <AdminInput
          value={aboutData.title[adminLang]}
          onChange={e => setAboutData(prev => ({ ...prev, title: { ...prev.title, [adminLang]: e.target.value } }))}
          placeholder={adminLang === 'ko' ? 'About OMFOOD' : 'About OMFOOD'}
        />
        
        <AdminLabel>부제목</AdminLabel>
        <AdminInput
          value={aboutData.subtitle[adminLang]}
          onChange={e => setAboutData(prev => ({ ...prev, subtitle: { ...prev.subtitle, [adminLang]: e.target.value } }))}
          placeholder={adminLang === 'ko' ? 'OMFOOD에 대해' : 'About OMFOOD'}
        />
        
        <AdminLabel>간단 설명</AdminLabel>
        <AdminTextarea
          value={aboutData.description[adminLang]}
          onChange={e => setAboutData(prev => ({ ...prev, description: { ...prev.description, [adminLang]: e.target.value } }))}
          placeholder={adminLang === 'ko' ? 'OMFOOD에 대한 간단한 설명을 입력하세요.' : 'Enter a brief description about OMFOOD.'}
          rows={3}
        />
        
        <AdminLabel>메인 콘텐츠</AdminLabel>
        <ReactQuill
          value={aboutData.content[adminLang]}
          onChange={val => setAboutData(prev => ({ ...prev, content: { ...prev.content, [adminLang]: val } }))}
          modules={quillModules}
          formats={formats}
          theme="snow"
          placeholder={adminLang === 'ko' ? 'About OMFOOD 페이지의 메인 콘텐츠를 입력하세요.' : 'Enter main content for About OMFOOD page.'}
        />
        
        <AdminLabel>미션</AdminLabel>
        <AdminTextarea
          value={aboutData.mission[adminLang]}
          onChange={e => setAboutData(prev => ({ ...prev, mission: { ...prev.mission, [adminLang]: e.target.value } }))}
          placeholder={adminLang === 'ko' ? '회사의 미션을 입력하세요.' : 'Enter company mission.'}
          rows={3}
        />
        
        <AdminLabel>비전</AdminLabel>
        <AdminTextarea
          value={aboutData.vision[adminLang]}
          onChange={e => setAboutData(prev => ({ ...prev, vision: { ...prev.vision, [adminLang]: e.target.value } }))}
          placeholder={adminLang === 'ko' ? '회사의 비전을 입력하세요.' : 'Enter company vision.'}
          rows={3}
        />
        
        <AdminButton onClick={handleSave} disabled={saving} style={{ width: 'auto' }}>
          {saving ? '저장 중...' : '저장'}
        </AdminButton>
        
        <PreviewBox>
          <strong>프리뷰</strong>
          <div style={{ marginTop: 12, padding: 16, background: '#f9f9f9', borderRadius: 8 }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem' }}>{aboutData.title[adminLang] || '제목 미입력'}</h2>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.2rem', color: '#666' }}>{aboutData.subtitle[adminLang] || '부제목 미입력'}</h3>
            <p style={{ margin: '0 0 16px 0', lineHeight: 1.6 }}>{aboutData.description[adminLang] || '설명 미입력'}</p>
            <div style={{ margin: '0 0 16px 0' }} dangerouslySetInnerHTML={{ __html: aboutData.content[adminLang] || '콘텐츠 미입력' }} />
            <div style={{ margin: '0 0 12px 0' }}>
              <strong>미션:</strong> {aboutData.mission[adminLang] || '미션 미입력'}
            </div>
            <div>
              <strong>비전:</strong> {aboutData.vision[adminLang] || '비전 미입력'}
            </div>
          </div>
        </PreviewBox>
      </AdminCard>
    </AdminLayoutComponent>
  );
}

// Food Service 관리 페이지
function AdminFoodServiceManage() {
  const { success } = useToast();
  const { adminLang } = useAdminLang();
  const [foodServiceData, setFoodServiceData] = useState<{
    title: { en: string; ko: string };
    subtitle: { en: string; ko: string };
    description: { en: string; ko: string };
    content: { en: string; ko: string };
    services: Array<{
      id: string;
      name: { en: string; ko: string };
      description: { en: string; ko: string };
      image: string;
      order: number;
    }>;
  }>({
    title: { en: '', ko: '' },
    subtitle: { en: '', ko: '' },
    description: { en: '', ko: '' },
    content: { en: '', ko: '' },
    services: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newService, setNewService] = useState<{
    name: { en: string; ko: string };
    description: { en: string; ko: string };
    image: string;
  }>({
    name: { en: '', ko: '' },
    description: { en: '', ko: '' },
    image: ''
  });

  useEffect(() => {
    const docRef = doc(db, 'foodservice_page', 'main');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // 마이그레이션: 기존 string이면 en으로 간주
        setFoodServiceData({
          title: typeof data.title === 'string' ? { en: data.title, ko: data.title } : { en: data.title?.en ?? '', ko: data.title?.ko ?? '' },
          subtitle: typeof data.subtitle === 'string' ? { en: data.subtitle, ko: data.subtitle } : { en: data.subtitle?.en ?? '', ko: data.subtitle?.ko ?? '' },
          description: typeof data.description === 'string' ? { en: data.description, ko: data.description } : { en: data.description?.en ?? '', ko: data.description?.ko ?? '' },
          content: typeof data.content === 'string' ? { en: data.content, ko: data.content } : { en: data.content?.en ?? '', ko: data.content?.ko ?? '' },
          services: data.services?.map((service: any) => ({
            id: service.id || Math.random().toString(),
            name: typeof service.name === 'string' ? { en: service.name, ko: service.name } : { en: service.name?.en ?? '', ko: service.name?.ko ?? '' },
            description: typeof service.description === 'string' ? { en: service.description, ko: service.description } : { en: service.description?.en ?? '', ko: service.description?.ko ?? '' },
            image: service.image || '',
            order: service.order || 0
          })) || []
        });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [adminLang]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'foodservice_page', 'main'), foodServiceData);
      success('저장되었습니다!');
    } catch (error) {
      success('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddService = async () => {
    if (!newService.name[adminLang].trim()) return;
    try {
      const service = {
        id: Math.random().toString(),
        ...newService,
        order: foodServiceData.services.length
      };
      setFoodServiceData(prev => ({
        ...prev,
        services: [...prev.services, service]
      }));
      setNewService({
        name: { en: '', ko: '' },
        description: { en: '', ko: '' },
        image: ''
      });
      success('서비스가 추가되었습니다!');
    } catch (error) {
      success('서비스 추가 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      setFoodServiceData(prev => ({
        ...prev,
        services: prev.services.filter(service => service.id !== id)
      }));
      success('서비스가 삭제되었습니다!');
    } catch (error) {
      success('서비스 삭제 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <AdminLayoutComponent showBackButton={false}>
        <AdminHeader>Food Service 관리</AdminHeader>
        <AdminCard>
          <div style={{ textAlign: 'center', color: '#888', fontSize: 16 }}>
            로딩 중...
          </div>
        </AdminCard>
      </AdminLayoutComponent>
    );
  }

  return (
    <AdminLayoutComponent key={`foodservice-manage-${adminLang}`} showBackButton={false}>
      <AdminHeader>Food Service 관리</AdminHeader>
      
      <AdminCard>
        <AdminLabel>페이지 제목</AdminLabel>
        <AdminInput
          value={foodServiceData.title[adminLang]}
          onChange={e => setFoodServiceData(prev => ({ ...prev, title: { ...prev.title, [adminLang]: e.target.value } }))}
          placeholder={adminLang === 'ko' ? 'Food Service' : 'Food Service'}
        />
        
        <AdminLabel>부제목</AdminLabel>
        <AdminInput
          value={foodServiceData.subtitle[adminLang]}
          onChange={e => setFoodServiceData(prev => ({ ...prev, subtitle: { ...prev.subtitle, [adminLang]: e.target.value } }))}
          placeholder={adminLang === 'ko' ? '푸드서비스' : 'Food Service'}
        />
        
        <AdminLabel>간단 설명</AdminLabel>
        <AdminTextarea
          value={foodServiceData.description[adminLang]}
          onChange={e => setFoodServiceData(prev => ({ ...prev, description: { ...prev.description, [adminLang]: e.target.value } }))}
          placeholder={adminLang === 'ko' ? 'Food Service에 대한 간단한 설명을 입력하세요.' : 'Enter a brief description about Food Service.'}
          rows={3}
        />
        
        <AdminLabel>메인 콘텐츠</AdminLabel>
        <ReactQuill
          value={foodServiceData.content[adminLang]}
          onChange={val => setFoodServiceData(prev => ({ ...prev, content: { ...prev.content, [adminLang]: val } }))}
          modules={quillModules}
          formats={formats}
          theme="snow"
          placeholder={adminLang === 'ko' ? 'Food Service 페이지의 메인 콘텐츠를 입력하세요.' : 'Enter main content for Food Service page.'}
        />
        
        <AdminButton onClick={handleSave} disabled={saving} style={{ width: 'auto' }}>
          {saving ? '저장 중...' : '저장'}
        </AdminButton>
        
        <PreviewBox>
          <strong>프리뷰</strong>
          <div style={{ marginTop: 12, padding: 16, background: '#f9f9f9', borderRadius: 8 }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem' }}>{foodServiceData.title[adminLang] || '제목 미입력'}</h2>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.2rem', color: '#666' }}>{foodServiceData.subtitle[adminLang] || '부제목 미입력'}</h3>
            <p style={{ margin: '0 0 16px 0', lineHeight: 1.6 }}>{foodServiceData.description[adminLang] || '설명 미입력'}</p>
            <div style={{ margin: '0 0 16px 0' }} dangerouslySetInnerHTML={{ __html: foodServiceData.content[adminLang] || '콘텐츠 미입력' }} />
          </div>
        </PreviewBox>
      </AdminCard>

      <AdminCard>
        <SectionTitle>서비스 목록 관리</SectionTitle>
        
        {foodServiceData.services.map((service, index) => (
          <div key={service.id} style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <AdminInput
                value={service.name[adminLang]}
                onChange={e => {
                  const updatedServices = [...foodServiceData.services];
                  updatedServices[index] = { ...service, name: { ...service.name, [adminLang]: e.target.value } };
                  setFoodServiceData(prev => ({ ...prev, services: updatedServices }));
                }}
                placeholder="서비스명"
                style={{ marginBottom: 0, flex: 1 }}
              />
              <AdminButton
                $danger
                onClick={() => handleDeleteService(service.id)}
                style={{ margin: 0, padding: '8px 16px' }}
              >
                삭제
              </AdminButton>
            </div>
            <AdminTextarea
              value={service.description[adminLang]}
              onChange={e => {
                const updatedServices = [...foodServiceData.services];
                updatedServices[index] = { ...service, description: { ...service.description, [adminLang]: e.target.value } };
                setFoodServiceData(prev => ({ ...prev, services: updatedServices }));
              }}
              placeholder="서비스 설명"
              rows={2}
              style={{ marginBottom: 8 }}
            />
            <AdminInput
              value={service.image}
              onChange={e => {
                const updatedServices = [...foodServiceData.services];
                updatedServices[index] = { ...service, image: e.target.value };
                setFoodServiceData(prev => ({ ...prev, services: updatedServices }));
              }}
              placeholder="이미지 URL"
              style={{ marginBottom: 0 }}
            />
          </div>
        ))}
        
        <div style={{ border: '2px dashed #e0e0e0', borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <AdminLabel>새 서비스 추가</AdminLabel>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <AdminInput
              value={newService.name[adminLang]}
              onChange={e => setNewService(prev => ({ ...prev, name: { ...prev.name, [adminLang]: e.target.value } }))}
              placeholder="서비스명"
              style={{ marginBottom: 0, flex: 1 }}
            />
            <AdminButton
              $primary
              onClick={handleAddService}
              disabled={!newService.name[adminLang].trim()}
              style={{ margin: 0, padding: '8px 16px' }}
            >
              추가
            </AdminButton>
          </div>
          <AdminTextarea
            value={newService.description[adminLang]}
            onChange={e => setNewService(prev => ({ ...prev, description: { ...prev.description, [adminLang]: e.target.value } }))}
            placeholder="서비스 설명"
            rows={2}
            style={{ marginBottom: 8 }}
          />
          <AdminInput
            value={newService.image}
            onChange={e => setNewService(prev => ({ ...prev, image: e.target.value }))}
            placeholder="이미지 URL"
            style={{ marginBottom: 0 }}
          />
        </div>
        
        <AdminButton onClick={handleSave} disabled={saving} style={{ width: 'auto' }}>
          {saving ? '저장 중...' : '서비스 목록 저장'}
        </AdminButton>
      </AdminCard>
    </AdminLayoutComponent>
  );
}

// Product 관리 페이지
function AdminProductManage() {
  return <AdminProductManageComponent />;
}

// Contact 관리 페이지
function AdminContactManage() {
  const { success } = useToast();
  const { adminLang } = useAdminLang();
  const [contactData, setContactData] = useState<{
    title: { en: string; ko: string };
    subtitle: { en: string; ko: string };
    description: { en: string; ko: string };
    content: { en: string; ko: string };
    address: { en: string; ko: string };
    phone: { en: string; ko: string };
    email: { en: string; ko: string };
    businessHours: { en: string; ko: string };
    mapUrl: string;
  }>({
    title: { en: '', ko: '' },
    subtitle: { en: '', ko: '' },
    description: { en: '', ko: '' },
    content: { en: '', ko: '' },
    address: { en: '', ko: '' },
    phone: { en: '', ko: '' },
    email: { en: '', ko: '' },
    businessHours: { en: '', ko: '' },
    mapUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const docRef = doc(db, 'contact_page', 'main');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // 마이그레이션: 기존 string이면 en으로 간주
        setContactData({
          title: typeof data.title === 'string' ? { en: data.title, ko: data.title } : { en: data.title?.en ?? '', ko: data.title?.ko ?? '' },
          subtitle: typeof data.subtitle === 'string' ? { en: data.subtitle, ko: data.subtitle } : { en: data.subtitle?.en ?? '', ko: data.subtitle?.ko ?? '' },
          description: typeof data.description === 'string' ? { en: data.description, ko: data.description } : { en: data.description?.en ?? '', ko: data.description?.ko ?? '' },
          content: typeof data.content === 'string' ? { en: data.content, ko: data.content } : { en: data.content?.en ?? '', ko: data.content?.ko ?? '' },
          address: typeof data.address === 'string' ? { en: data.address, ko: data.address } : { en: data.address?.en ?? '', ko: data.address?.ko ?? '' },
          phone: typeof data.phone === 'string' ? { en: data.phone, ko: data.phone } : { en: data.phone?.en ?? '', ko: data.phone?.ko ?? '' },
          email: typeof data.email === 'string' ? { en: data.email, ko: data.email } : { en: data.email?.en ?? '', ko: data.email?.ko ?? '' },
          businessHours: typeof data.businessHours === 'string' ? { en: data.businessHours, ko: data.businessHours } : { en: data.businessHours?.en ?? '', ko: data.businessHours?.ko ?? '' },
          mapUrl: data.mapUrl || ''
        });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [adminLang]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'contact_page', 'main'), contactData);
      success('저장되었습니다!');
    } catch (error) {
      success('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
      return (
    <AdminLayoutComponent key={`contact-manage-${adminLang}`} showBackButton={false}>
      <AdminHeader>Contact 관리</AdminHeader>
        <AdminCard>
          <div style={{ textAlign: 'center', color: '#888', fontSize: 16 }}>
            로딩 중...
          </div>
        </AdminCard>
      </AdminLayoutComponent>
    );
  }

  return (
    <AdminLayoutComponent key={`contact-manage-${adminLang}`} showBackButton={false}>
      <AdminHeader>Contact 관리</AdminHeader>
      
      <AdminCard>
        <AdminLabel>페이지 제목</AdminLabel>
        <AdminInput
          value={contactData.title[adminLang]}
          onChange={e => setContactData(prev => ({ ...prev, title: { ...prev.title, [adminLang]: e.target.value } }))}
          placeholder={adminLang === 'ko' ? 'Contact' : 'Contact'}
        />
        
        <AdminLabel>부제목</AdminLabel>
        <AdminInput
          value={contactData.subtitle[adminLang]}
          onChange={e => setContactData(prev => ({ ...prev, subtitle: { ...prev.subtitle, [adminLang]: e.target.value } }))}
          placeholder={adminLang === 'ko' ? '연락처' : 'Contact Us'}
        />
        
        <AdminLabel>간단 설명</AdminLabel>
        <AdminTextarea
          value={contactData.description[adminLang]}
          onChange={e => setContactData(prev => ({ ...prev, description: { ...prev.description, [adminLang]: e.target.value } }))}
          placeholder={adminLang === 'ko' ? 'Contact 페이지에 대한 간단한 설명을 입력하세요.' : 'Enter a brief description about Contact page.'}
          rows={3}
        />
        
        <AdminLabel>메인 콘텐츠</AdminLabel>
        <ReactQuill
          value={contactData.content[adminLang]}
          onChange={val => setContactData(prev => ({ ...prev, content: { ...prev.content, [adminLang]: val } }))}
          modules={quillModules}
          formats={formats}
          theme="snow"
          placeholder={adminLang === 'ko' ? 'Contact 페이지의 메인 콘텐츠를 입력하세요.' : 'Enter main content for Contact page.'}
        />
        
        <AdminButton onClick={handleSave} disabled={saving} style={{ width: 'auto' }}>
          {saving ? '저장 중...' : '저장'}
        </AdminButton>
        
        <PreviewBox>
          <strong>프리뷰</strong>
          <div style={{ marginTop: 12, padding: 16, background: '#f9f9f9', borderRadius: 8 }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem' }}>{contactData.title[adminLang] || '제목 미입력'}</h2>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.2rem', color: '#666' }}>{contactData.subtitle[adminLang] || '부제목 미입력'}</h3>
            <p style={{ margin: '0 0 16px 0', lineHeight: 1.6 }}>{contactData.description[adminLang] || '설명 미입력'}</p>
            <div style={{ margin: '0 0 16px 0' }} dangerouslySetInnerHTML={{ __html: contactData.content[adminLang] || '콘텐츠 미입력' }} />
          </div>
        </PreviewBox>
      </AdminCard>

      <AdminCard>
        <SectionTitle>연락처 정보 관리</SectionTitle>
        
        <AdminLabel>주소</AdminLabel>
        <AdminTextarea
          value={contactData.address[adminLang]}
          onChange={e => setContactData(prev => ({ ...prev, address: { ...prev.address, [adminLang]: e.target.value } }))}
          placeholder={adminLang === 'ko' ? '회사 주소를 입력하세요.' : 'Enter company address.'}
          rows={2}
        />
        
        <AdminLabel>전화번호</AdminLabel>
        <AdminInput
          value={contactData.phone[adminLang]}
          onChange={e => setContactData(prev => ({ ...prev, phone: { ...prev.phone, [adminLang]: e.target.value } }))}
          placeholder={adminLang === 'ko' ? '전화번호를 입력하세요.' : 'Enter phone number.'}
        />
        
        <AdminLabel>이메일</AdminLabel>
        <AdminInput
          value={contactData.email[adminLang]}
          onChange={e => setContactData(prev => ({ ...prev, email: { ...prev.email, [adminLang]: e.target.value } }))}
          placeholder={adminLang === 'ko' ? '이메일을 입력하세요.' : 'Enter email address.'}
        />
        
        <AdminLabel>영업시간</AdminLabel>
        <AdminTextarea
          value={contactData.businessHours[adminLang]}
          onChange={e => setContactData(prev => ({ ...prev, businessHours: { ...prev.businessHours, [adminLang]: e.target.value } }))}
          placeholder={adminLang === 'ko' ? '영업시간을 입력하세요.' : 'Enter business hours.'}
          rows={2}
        />
        
        <AdminLabel>지도 URL</AdminLabel>
        <AdminInput
          value={contactData.mapUrl}
          onChange={e => setContactData(prev => ({ ...prev, mapUrl: e.target.value }))}
          placeholder="Google Maps 또는 기타 지도 URL"
        />
        
        <AdminButton onClick={handleSave} disabled={saving} style={{ width: 'auto' }}>
          {saving ? '저장 중...' : '연락처 정보 저장'}
        </AdminButton>
        
        <PreviewBox>
          <strong>연락처 정보 프리뷰</strong>
          <div style={{ marginTop: 12, padding: 16, background: '#f9f9f9', borderRadius: 8 }}>
            <div style={{ marginBottom: 12 }}>
              <strong>주소:</strong> {contactData.address[adminLang] || '주소 미입력'}
            </div>
            <div style={{ marginBottom: 12 }}>
              <strong>전화번호:</strong> {contactData.phone[adminLang] || '전화번호 미입력'}
            </div>
            <div style={{ marginBottom: 12 }}>
              <strong>이메일:</strong> {contactData.email[adminLang] || '이메일 미입력'}
            </div>
            <div style={{ marginBottom: 12 }}>
              <strong>영업시간:</strong> {contactData.businessHours[adminLang] || '영업시간 미입력'}
            </div>
            {contactData.mapUrl && (
              <div>
                <strong>지도:</strong> <a href={contactData.mapUrl} target="_blank" rel="noopener noreferrer">지도 보기</a>
              </div>
            )}
          </div>
        </PreviewBox>
      </AdminCard>
    </AdminLayoutComponent>
  );
}

// 관리자 페이지 공통 스타일 (새로운 디자인 시스템 적용)
const AdminCard = styled.div`
  background: ${colors.white};
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 32px;
  max-width: 2100px;
  width: 100%;
  margin: 0 auto 32px auto;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    padding: 24px 20px;
  }
`;

const AdminLabel = styled.label`
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 8px;
  display: block;
  color: ${colors.black};
`;

const AdminInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 1rem;
  border: 1.5px solid ${colors.grayBorder};
  border-radius: 8px;
  margin-bottom: 24px;
  background: ${colors.white};
  box-sizing: border-box;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(229, 0, 43, 0.1);
  }
`;

const AdminTextarea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 1rem;
  border: 1.5px solid ${colors.grayBorder};
  border-radius: 8px;
  margin-bottom: 24px;
  background: ${colors.white};
  box-sizing: border-box;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(229, 0, 43, 0.1);
  }
`;

const AdminButton = styled.button<{ $primary?: boolean; $danger?: boolean; $loading?: boolean }>`
  width: 100%;
  padding: 14px 0;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  background: ${({ $primary, $danger, $loading }) => 
    $loading ? colors.grayMedium : $danger ? colors.error : $primary ? colors.primary : colors.grayLight};
  color: ${({ $primary, $danger, $loading }) => 
    $loading ? colors.grayDark : $danger ? colors.white : $primary ? colors.white : colors.black};
  margin-top: 12px;
  margin-bottom: 8px;
  cursor: ${({ $loading }) => $loading ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover { 
    background: ${({ $primary, $danger, $loading }) => 
      $loading ? colors.grayMedium : $danger ? '#c82333' : $primary ? '#c40023' : colors.grayBorder};
    transform: ${({ $loading }) => $loading ? 'none' : 'translateY(-1px)'};
    box-shadow: ${({ $loading }) => $loading ? 'none' : '0 4px 8px rgba(0,0,0,0.15)'};
  }
`;

const AdminFileInput = styled.input`
  margin-bottom: 16px;
`;

const AdminFileLabel = styled.label`
  display: inline-block;
  padding: 8px 18px;
  background: ${colors.grayLight};
  border-radius: 8px;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 1rem;
  font-weight: 500;
  color: ${colors.black};
  cursor: pointer;
  margin-bottom: 12px;
  margin-right: 12px;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${colors.grayBorder};
    transform: translateY(-1px);
  }
`;

const AdminPreview = styled.div`
  width: 250px;
  height: 140px;
  background: ${colors.grayLight};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  overflow: hidden;
  border: 1px solid ${colors.grayBorder};
`;

const AdminQuill = styled(ReactQuill)`
  .ql-toolbar {
    border-radius: 8px 8px 0 0;
    background: ${colors.white};
    border: 1.5px solid ${colors.grayBorder};
    border-bottom: none;
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  
  .ql-container {
    border-radius: 0 0 8px 8px;
    border: 1.5px solid ${colors.grayBorder};
    min-height: 120px;
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 1rem;
    background: ${colors.white};
  }
  
  .ql-editor {
    line-height: 1.6;
  }
  
  .ql-editor:focus {
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(229, 0, 43, 0.1);
  }
  
  margin-bottom: 24px;
`;

const AdminGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  max-width: 2100px;
  width: 100%;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

const AdminSuccessMessage = styled.div`
  color: ${colors.success};
  font-weight: 600;
  margin-top: 16px;
  text-align: center;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const AdminErrorMessage = styled.div`
  color: ${colors.error};
  font-weight: 600;
  margin-top: 16px;
  text-align: center;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
`;

// 메뉴명 관리 페이지
function AdminMenuManage() {
  const { adminLang } = useAdminLang();
  const { success } = useToast();
  
  // 도큐먼트 로드
  const [menuData, setMenuData] = useState<{ en: string[]; ko: string[] }>({ en: [], ko: [] });
  
  // 언어 전환 시 편집 배열 스위치
  const [menuForm, setMenuForm] = useState<string[]>([]);
  
  const [logoWhite, setLogoWhite] = useState('');
  const [logoBlack, setLogoBlack] = useState('');
  const [logoWhiteFile, setLogoWhiteFile] = useState<File | null>(null);
  const [logoBlackFile, setLogoBlackFile] = useState<File | null>(null);
  const [logoMsg, setLogoMsg] = useState('');

  // 도큐먼트 로드
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'header_menu', 'main'), snap => {
      if (!snap.exists()) return;
      const d = snap.data();
      setMenuData({
        en: Array.isArray(d.en) ? d.en : [],
        ko: Array.isArray(d.ko) ? d.ko : [],
      });
    });
    return () => unsubscribe();
  }, []);

  // 언어 전환 시 편집 배열 스위치
  useEffect(() => {
    setMenuForm([...(menuData[adminLang] || [])]);
  }, [adminLang, menuData]); // 🔴

  useEffect(() => {
    // Firestore에서 로고 경로 불러오기
    const docRef = doc(db, 'header', 'logo');
    getDoc(docRef).then(docSnap => {
      if (docSnap.exists()) {
        setLogoWhite(docSnap.data().white || '/logo_white.png');
        setLogoBlack(docSnap.data().black || '/logo_black.png');
      } else {
        setLogoWhite('/logo_white.png');
        setLogoBlack('/logo_black.png');
      }
    });
  }, []);

  const handleChange = (idx: number, value: string) => {
    const next = [...menuForm];
    next[idx] = value;
    setMenuForm(next);
  };

  const moveMenu = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= menuForm.length) return;
    const next = [...menuForm];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    setMenuForm(next);
  };

  const handleSave = async () => {
    // 저장: 선택 언어만 partial-merge
    const payload = { [adminLang]: menuForm };
    console.log('[SAVE header_menu]', adminLang, payload);
    await setDoc(doc(db, 'header_menu', 'main'), payload, { merge: true });
    success('헤더 영역이 저장되었습니다!');
  };

  const handleLogoUpload = async (type: 'white' | 'black') => {
    try {
      const file = type === 'white' ? logoWhiteFile : logoBlackFile;
      if (!file) return;
      const ext = file.name.split('.').pop();
      const storagePath = `header/logo_${type}_${Date.now()}.${ext}`;
      const sRef = storageRef(storage, storagePath);
      await uploadBytes(sRef, file);
      const url = await getDownloadURL(sRef);
      const docRef = doc(db, 'header', 'logo');
      await setDoc(docRef, { [type]: url }, { merge: true });
      if (type === 'white') setLogoWhite(url);
      if (type === 'black') setLogoBlack(url);
      setLogoMsg('로고가 저장되었습니다!');
      setTimeout(() => setLogoMsg(''), 1500);
    } catch (e) {
      setLogoMsg('업로드 실패');
      setTimeout(() => setLogoMsg(''), 1500);
    }
  };

  return (
    <div key={`menu-manage-${adminLang}`}>
      <AdminHeader>헤더영역 관리</AdminHeader>
      
      <AdminCard style={{ maxWidth: 780, margin: '0 auto', padding: '48px 40px' }}>
        {/* 로고 업로드 UI 추가 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <span style={{ minWidth: 90, fontWeight: 700, fontSize: 18 }}>로고(흰색)</span>
            <input type="file" accept="image/*" onChange={e => setLogoWhiteFile(e.target.files?.[0] || null)} />
            {logoWhite && <img src={logoWhite} alt="logo_white" style={{ width: 60, height: 40, objectFit: 'contain', background: '#eee', borderRadius: 6 }} />}
            <button onClick={() => handleLogoUpload('white')} disabled={!logoWhiteFile} style={{ marginLeft: 8, padding: '6px 16px', borderRadius: 6, border: '1px solid #bbb', background: '#fff', cursor: logoWhiteFile ? 'pointer' : 'not-allowed' }}>저장</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <span style={{ minWidth: 90, fontWeight: 700, fontSize: 18 }}>로고(검정)</span>
            <input type="file" accept="image/*" onChange={e => setLogoBlackFile(e.target.files?.[0] || null)} />
            {logoBlack && <img src={logoBlack} alt="logo_black" style={{ width: 60, height: 40, objectFit: 'contain', background: '#eee', borderRadius: 6 }} />}
            <button onClick={() => handleLogoUpload('black')} disabled={!logoBlackFile} style={{ marginLeft: 8, padding: '6px 16px', borderRadius: 6, border: '1px solid #bbb', background: '#fff', cursor: logoBlackFile ? 'pointer' : 'not-allowed' }}>저장</button>
          </div>
          {logoMsg && <div style={{ color: '#1976d2', marginTop: 8 }}>{logoMsg}</div>}
        </div>
        
        {/* 메뉴 관리 */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: '#333' }}>
            {adminLang === 'en' ? '영문 메뉴 관리' : '국문 메뉴 관리'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {menuForm.map((name, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
                <span style={{ minWidth: 78, fontWeight: 700, fontSize: 23 }}>{`메뉴${idx + 1}`}</span>
                <input
                  value={name}
                  onChange={e => handleChange(idx, e.target.value)}
                  placeholder={`메뉴 ${idx + 1} 이름을 입력하세요`}
                  style={{ flex: 1, padding: '12px 18px', fontSize: 21, border: '1px solid #ccc', borderRadius: 8 }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <button onClick={() => moveMenu(idx, idx - 1)} disabled={idx === 0} style={{ padding: '4px 12px', fontSize: 18, borderRadius: 6, border: '1px solid #bbb', background: '#fff', cursor: idx === 0 ? 'not-allowed' : 'pointer' }}>▲</button>
                  <button onClick={() => moveMenu(idx, idx + 1)} disabled={idx === menuForm.length - 1} style={{ padding: '4px 12px', fontSize: 18, borderRadius: 6, border: '1px solid #bbb', background: '#fff', cursor: idx === menuForm.length - 1 ? 'not-allowed' : 'pointer' }}>▼</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 42 }}>
          <AdminButton onClick={handleSave} $primary style={{ fontSize: 20, padding: '16px 0', minWidth: 180 }}>저장하기</AdminButton>
        </div>
      </AdminCard>
    </div>
  );
}

// 메인 섹션 관리 페이지
function AdminMainManage() {
  const navigate = useNavigate();
  const { success } = useToast();
  const { adminLang } = useAdminLang();
  
  // 도큐먼트 로드 → 양언어 상태 정규화
  const [docData, setDocData] = useState({
    mediaType: 'video',
    mediaUrl: '',
    mainText: { en: '', ko: '' },
    subText: { en: '', ko: '' }
  });
  
  // 언어 전환 시 폼 값 즉시 스위치
  const [form, setForm] = useState({ main: '', sub: '' });
  
  const [preview, setPreview] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ]
  };

  const formats = ['header', 'bold', 'italic', 'underline', 'strike', 'color', 'background', 'list', 'bullet', 'link'];

  // 도큐먼트 로드 → 양언어 상태 정규화
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'mainSection', 'content'), snap => {
      if (!snap.exists()) return;
      const d = snap.data();
      setDocData({
        mediaType: d.mediaType || 'video',
        mediaUrl: d.mediaUrl || '',
        mainText: typeof d.mainText === 'string' ? { en: d.mainText, ko: d.mainText } : { en: d?.mainText?.en || '', ko: d?.mainText?.ko || '' },
        subText: typeof d.subText === 'string' ? { en: d.subText, ko: d.subText } : { en: d?.subText?.en || '', ko: d?.subText?.ko || '' },
      });
      setPreview(d.mediaUrl || '');
    });
    return () => unsubscribe();
  }, []);

  // 언어 전환 시 폼 값 즉시 스위치
  useEffect(() => {
    setForm({
      main: docData.mainText[adminLang] || '',
      sub: docData.subText[adminLang] || '',
    });
  }, [adminLang, docData]); // 🔴 adminLang 의존성 필수

  // 언어 변경 이벤트 구독
  useEffect(() => {
    const handleAdminLangChange = (event: any) => {
      const lang = event.detail?.language as 'en' | 'ko';
      if (lang) {
        setForm({
          main: docData.mainText[lang] || '',
          sub: docData.subText[lang] || '',
        });
      }
    };

    window.addEventListener('adminLangChange', handleAdminLangChange);
    return () => {
      window.removeEventListener('adminLangChange', handleAdminLangChange);
    };
  }, [docData]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setFile(file);
  };

  const handleFormChange = (field: 'main' | 'sub', value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      let mediaUrl = docData.mediaUrl;
      let mediaChanged = false;
      
      if (file) {
        const ext = file.name.split('.').pop();
        const uniqueName = `mainSection/${Date.now()}.${ext}`;
        const fileStorageRef = storageRef(storage, uniqueName);
        await uploadBytes(fileStorageRef, file);
        mediaUrl = await getDownloadURL(fileStorageRef);
        mediaChanged = true;
      }

      // 필드 경로로 부분 업데이트 (단일 요청으로 처리하여 깜빡임 방지)
      const ref = doc(db, 'mainSection', 'content');
      const updatePayload: Record<string, any> = {
        mainText: {
          ...(docData.mainText || {}),
          [adminLang]: form.main ?? '',
        },
        subText: {
          ...(docData.subText || {}),
          [adminLang]: form.sub ?? '',
        },
      };

      // 미디어 변경 시에만 포함
      if (mediaChanged) {
        updatePayload.mediaType = file?.type.startsWith('video') ? 'video' : 'image';
        updatePayload.mediaUrl = mediaUrl;
      }

      await setDoc(ref, updatePayload, { merge: true });

      console.log('[SAVE mainSection]', adminLang, { 
        [`mainText.${adminLang}`]: form.main,
        [`subText.${adminLang}`]: form.sub 
      });
      success('메인 섹션이 저장되었습니다!');
    } catch (error) {
      console.error('Error saving data:', error);
      success('저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <div key={`main-manage-${adminLang}`}>
      <AdminHeader>메인 섹션 관리</AdminHeader>
      
      <AdminCard>
        <AdminLabel>메인 이미지/영상 업로드</AdminLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: 32 }}>
          <AdminFileLabel htmlFor="main-media-upload">파일 선택</AdminFileLabel>
          <AdminFileInput id="main-media-upload" type="file" accept="image/*,video/*" onChange={handleFile} />
          {preview && (
            <AdminPreview>
              {isVideo(preview) ? (
                <video src={preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} controls />
              ) : (
                <img src={preview} alt="미리보기" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </AdminPreview>
          )}
        </div>
        
        {/* 메인 텍스트 입력 */}
        <div style={{ marginBottom: 24 }}>
          <AdminLabel>메인 텍스트 ({adminLang.toUpperCase()})</AdminLabel>
          <AdminQuill
            key={`main-quill-${adminLang}`}
            value={form.main}
            onChange={v => handleFormChange('main', v)}
            modules={quillModules}
            formats={formats}
            theme="snow"
            placeholder={`${adminLang === 'en' ? '영어' : '한국어'} 메인 텍스트를 입력하세요`}
          />
        </div>
        
        {/* 서브 텍스트 입력 */}
        <div style={{ marginBottom: 24 }}>
          <AdminLabel>서브 텍스트 ({adminLang.toUpperCase()})</AdminLabel>
          <AdminQuill
            key={`sub-quill-${adminLang}`}
            value={form.sub}
            onChange={v => handleFormChange('sub', v)}
            modules={quillModules}
            formats={formats}
            theme="snow"
            placeholder={`${adminLang === 'en' ? '영어' : '한국어'} 서브 텍스트를 입력하세요`}
          />
        </div>
        
        {/* 실시간 프리뷰 */}
        <div style={{ marginTop: 32, padding: 24, background: '#f8f9fa', borderRadius: 8, border: '1px solid #e0e0e0' }}>
          <h5 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16, color: '#333' }}>실시간 Preview ({adminLang.toUpperCase()})</h5>
          <div style={{ background: '#ffffff', padding: 24, borderRadius: 8, border: '1px solid #e0e0e0' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: 16 }}>
              <div 
                style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 16, color: '#222', textAlign: 'center' }}
                dangerouslySetInnerHTML={{ __html: form.main || '<em>메인 텍스트를 입력하세요...</em>' }}
              />
              <div 
                style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#666', textAlign: 'center' }}
                dangerouslySetInnerHTML={{ __html: form.sub || '<em>서브 텍스트를 입력하세요...</em>' }}
              />
            </div>
          </div>
        </div>
        
        <AdminButton $primary onClick={handleSave}>저장하기</AdminButton>
      </AdminCard>
    </div>
  );
}

// 슬로건 관리 페이지
function AdminSloganManage() {
  const { success } = useToast();
  const { adminLang } = useAdminLang();
  
  // 도큐먼트 로드 → 양언어 상태 정규화
  const [docData, setDocData] = useState<{ mainText: { en: string; ko: string }; subText: { en: string; ko: string } }>({
    mainText: { en: 'Global Taste, Local Touch', ko: '' },
    subText: { en: 'From sauces to stores, we blend Korean flavor with local culture for every market we serve.', ko: '' }
  });
  
  // 언어 전환 시 폼 값 즉시 스위치
  const [form, setForm] = useState({ main: '', sub: '' });
  
  // 편집 상태 관리 (편집 중일 때 Firestore 업데이트가 폼을 덮어쓰지 않도록)
  const [isEditing, setIsEditing] = useState(false);
  
  // 저장 직후 롤백 방지를 위한 저장된 값 추적
  const savedFormRef = useRef<{ main: string; sub: string } | null>(null);
  
  // 슬로건 이미지 관련 state
  const [sloganImage, setSloganImage] = useState<string>('');
  const [sloganImageFile, setSloganImageFile] = useState<File | null>(null);
  const [sloganImagePreview, setSloganImagePreview] = useState<string>('');
  
  // 텍스트 위치 state
  const [textPos, setTextPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  
  // 텍스트 색상 state
  const [mainColor, setMainColor] = useState<string>('#ffffff');
  const [subColor, setSubColor] = useState<string>('#ffffff');
  
  // 텍스트 폰트 사이즈 state
  const [mainFontSize, setMainFontSize] = useState<string>('2.8rem');
  const [subFontSize, setSubFontSize] = useState<string>('1.15rem');
  
  // 프리뷰 이미지 크기 추적
  const [previewImageWidth, setPreviewImageWidth] = useState<number>(800);
  const [previewImageHeight, setPreviewImageHeight] = useState<number>(0);
  const [previewImageAspectRatio, setPreviewImageAspectRatio] = useState<number>(1);
  const previewImageRef = useRef<HTMLImageElement>(null);
  
  const [loading, setLoading] = useState(true);

  // 실시간 데이터 구독
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'slogan', 'main'), snap => {
      if (!snap.exists()) return;
      const d = snap.data();
      
      // Map 구조와 문자열 키 구조를 모두 확인하여 호환성 확보
      // Map 구조 우선, 없으면 문자열 키 확인
      const mainTextData = {
        en: d.mainText?.en || (d as any)['mainText.en'] || (typeof d.mainText === 'string' ? d.mainText : ''),
        ko: d.mainText?.ko || (d as any)['mainText.ko'] || ''
      };
      
      const subTextData = {
        en: d.subText?.en || (d as any)['subText.en'] || (typeof d.subText === 'string' ? d.subText : ''),
        ko: d.subText?.ko || (d as any)['subText.ko'] || ''
      };
      
      setDocData({
        mainText: mainTextData,
        subText: subTextData,
      });
      setSloganImage(d.sloganImage || '');
      setTextPos(d.textPos || { x: 50, y: 50 });
      setMainColor(d.mainColor || '#ffffff');
      setSubColor(d.subColor || '#ffffff');
      setMainFontSize(d.mainFontSize || '2.8rem');
      setSubFontSize(d.subFontSize || '1.15rem');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 프리뷰 이미지 크기 및 비율 추적
  useEffect(() => {
    const updateImageSize = () => {
      if (previewImageRef.current) {
        const img = previewImageRef.current;
        setPreviewImageWidth(img.offsetWidth);
        setPreviewImageHeight(img.offsetHeight);
        
        // naturalWidth와 naturalHeight를 사용하여 실제 비율 계산
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          const aspectRatio = img.naturalWidth / img.naturalHeight;
          setPreviewImageAspectRatio(aspectRatio);
        }
      }
    };
    
    if (sloganImagePreview || sloganImage) {
      updateImageSize();
      window.addEventListener('resize', updateImageSize);
      return () => window.removeEventListener('resize', updateImageSize);
    }
  }, [sloganImagePreview, sloganImage]);

  // 언어 전환 시 폼 값 즉시 스위치 (HTML 태그 보존 - 가공하지 않음)
  // 초기 로딩 완료 시에만 Firestore 데이터로 폼을 업데이트
  // 서버 데이터(docData)와 로컬 폼 데이터(form)가 다를 때만 업데이트
  useEffect(() => {
    // 로딩 중일 때는 폼을 업데이트하지 않음
    if (loading) {
      return;
    }
    
    const mainTextValue = docData.mainText[adminLang] || '';
    const subTextValue = docData.subText[adminLang] || '';
    
    // 저장 직후 롤백 방지: 저장된 값과 현재 폼 값이 같으면 업데이트하지 않음
    if (savedFormRef.current && 
        savedFormRef.current.main === form.main && 
        savedFormRef.current.sub === form.sub &&
        savedFormRef.current.main === mainTextValue &&
        savedFormRef.current.sub === subTextValue) {
      // 저장된 값과 현재 폼 값이 같고, 서버 데이터도 같으면 업데이트하지 않음
      savedFormRef.current = null; // 플래그 해제
      return;
    }
    
    // 서버 데이터(docData)와 로컬 폼 데이터(form)가 다를 때만 업데이트
    // 이 조건이 없으면 저장 직후 useEffect가 실행되어 입력값이 롤백될 수 있음
    // 정확한 비교를 위해 trim()을 사용하지 않고 HTML 문자열을 그대로 비교
    const mainTextMatches = form.main === mainTextValue;
    const subTextMatches = form.sub === subTextValue;
    
    if (mainTextMatches && subTextMatches) {
      // 데이터가 같으면 업데이트하지 않음 (불필요한 리렌더링 및 롤백 방지)
      return;
    }
    
    console.log('[AdminSloganManage LOAD] 메인 텍스트 HTML:', mainTextValue);
    console.log('[AdminSloganManage LOAD] 서브 텍스트 HTML:', subTextValue);
    console.log('[AdminSloganManage LOAD] 현재 폼 값 - 메인:', form.main, '서브:', form.sub);
    console.log('[AdminSloganManage LOAD] 데이터 비교 - 메인 일치:', mainTextMatches, '서브 일치:', subTextMatches);
    
    // ReactQuill HTML을 그대로 사용 (가공하지 않음)
    setForm({
      main: mainTextValue,
      sub: subTextValue,
    });
  }, [adminLang, docData, loading]);

  // 언어 변경 이벤트 구독
  useEffect(() => {
    const handleAdminLangChange = (event: any) => {
      const lang = event.detail?.language as 'en' | 'ko';
      if (lang) {
        const mainTextValue = docData.mainText[lang] || '';
        const subTextValue = docData.subText[lang] || '';
        setForm({
          main: mainTextValue,
          sub: subTextValue,
        });
      }
    };

    window.addEventListener('adminLangChange', handleAdminLangChange);
    return () => {
      window.removeEventListener('adminLangChange', handleAdminLangChange);
    };
  }, [docData]);

  const handleSloganImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSloganImageFile(file);
    setSloganImagePreview(url);
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const img = e.currentTarget.querySelector('img') as HTMLImageElement;
    if (!img) return;
    
    // 이미지에서 직접 클릭 이벤트가 발생한 경우
    if (e.target === img) {
      const nativeEvent = e.nativeEvent as MouseEvent;
      const offsetX = nativeEvent.offsetX;
      const offsetY = nativeEvent.offsetY;
      
      // 이미지의 실제 크기 사용
      const imgWidth = img.offsetWidth || img.width;
      const imgHeight = img.offsetHeight || img.height;
      
      const x = (offsetX / imgWidth) * 100;
      const y = (offsetY / imgHeight) * 100;
      
      // 좌표 범위 제한 (0-100%)
      const clampedX = Math.max(0, Math.min(100, x));
      const clampedY = Math.max(0, Math.min(100, y));
      
      setTextPos({ x: clampedX, y: clampedY });
    } else {
      // div에서 클릭한 경우 (이미지 영역 내)
      const rect = e.currentTarget.getBoundingClientRect();
      const imgRect = img.getBoundingClientRect();
      const x = ((e.clientX - imgRect.left) / imgRect.width) * 100;
      const y = ((e.clientY - imgRect.top) / imgRect.height) * 100;
      
      const clampedX = Math.max(0, Math.min(100, x));
      const clampedY = Math.max(0, Math.min(100, y));
      
      setTextPos({ x: clampedX, y: clampedY });
    }
  };

  const handleSave = async () => {
    // 필드 경로로 부분 업데이트
    const ref = doc(db, 'slogan', 'main');
    
    // 이미지 업로드 처리
    let imageUrl = sloganImage;
    if (sloganImageFile) {
      try {
        const ext = sloganImageFile.name.split('.').pop();
        const uniqueName = `slogan/image_${Date.now()}.${ext}`;
        const fileStorageRef = storageRef(storage, uniqueName);
        await uploadBytes(fileStorageRef, sloganImageFile);
        imageUrl = await getDownloadURL(fileStorageRef);
        setSloganImage(imageUrl);
        setSloganImageFile(null);
        setSloganImagePreview('');
      } catch (error) {
        console.error('이미지 업로드 실패:', error);
        success('이미지 업로드 중 오류가 발생했습니다.');
        return;
      }
    }
    
    // ReactQuill의 HTML을 그대로 저장 (가공하지 않음 - 줄바꿈 포함)
    // stripHtml, replace 등 모든 HTML 가공 로직 제거
    const mainTextToSave = form.main ?? '';
    const subTextToSave = form.sub ?? '';
    
    console.log('[SAVE] 메인 텍스트 HTML:', mainTextToSave);
    console.log('[SAVE] 서브 텍스트 HTML:', subTextToSave);
    
    // Optimistic UI: Firestore 저장 직전에 로컬 상태를 먼저 업데이트하여 롤백 방지
    // 이렇게 하면 useEffect가 실행되더라도 docData가 이미 최신 상태이므로 입력값이 유지됨
    setDocData(prev => ({
      ...prev,
      mainText: {
        ...(prev.mainText || {}),
        [adminLang]: mainTextToSave,
      },
      subText: {
        ...(prev.subText || {}),
        [adminLang]: subTextToSave,
      },
    }));
    
    // 한 번에 모든 데이터 저장 (트랜잭션처럼)
    // 중첩 객체 구조로 저장하여 Map 필드가 정확히 업데이트되도록 함
    const updateData: any = {
      mainText: {
        ...(docData.mainText || {}),
        [adminLang]: mainTextToSave
      },
      subText: {
        ...(docData.subText || {}),
        [adminLang]: subTextToSave
      }
    };
    
    // 이미지 URL 저장
    if (imageUrl) {
      updateData.sloganImage = imageUrl;
    }
    
    // 텍스트 위치 저장
    updateData.textPos = textPos;
    
    // 텍스트 색상 저장
    updateData.mainColor = mainColor;
    updateData.subColor = subColor;
    
    // 텍스트 폰트 사이즈 저장
    updateData.mainFontSize = mainFontSize;
    updateData.subFontSize = subFontSize;
    
    // Firestore에 저장 (중첩 객체 구조로 저장)
    await setDoc(ref, updateData, { merge: true });

    console.log('[SAVE slogan]', adminLang, { 
      [`mainText.${adminLang}`]: mainTextToSave,
      [`subText.${adminLang}`]: subTextToSave,
      sloganImage: imageUrl,
      textPos,
      mainColor,
      subColor,
      mainFontSize,
      subFontSize
    });
    
    // 저장 직후 롤백 방지: 저장된 값을 ref에 저장
    savedFormRef.current = {
      main: mainTextToSave,
      sub: subTextToSave
    };
    
    // 저장 완료 후 편집 상태 해제
    // docData가 이미 업데이트되었고, savedFormRef로 useEffect가 폼을 덮어쓰지 않으므로 입력값이 유지됨
    setIsEditing(false);
    success('슬로건이 저장되었습니다!');
  };

  return (
    <div key={`slogan-manage-${adminLang}`}>
      <AdminHeader>슬로건 관리</AdminHeader>
      {loading ? (
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>로딩 중...</div>
      ) : (
        <AdminCard>
          {/* 슬로건 섹션 상단 이미지 업로드 */}
          <div style={{ marginBottom: 48 }}>
            <AdminLabel>슬로건 섹션 상단 이미지</AdminLabel>
            <div style={{ marginTop: 12, marginBottom: 24 }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleSloganImageChange}
                style={{ marginBottom: 12 }}
              />
              {(sloganImagePreview || sloganImage) && (
                <div
                  onClick={handleImageClick}
                  style={{
                    position: 'relative',
                    cursor: 'crosshair',
                    width: '100%',
                    maxWidth: '800px',
                    height: 'auto',
                    minHeight: '200px',
                    marginBottom: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <img
                    ref={previewImageRef}
                    src={sloganImagePreview || sloganImage}
                    alt="슬로건 배너 미리보기"
                    style={{ width: '100%', height: 'auto', maxHeight: '400px', objectFit: 'contain', display: 'block' }}
                    onLoad={() => {
                      if (previewImageRef.current) {
                        const img = previewImageRef.current;
                        setPreviewImageWidth(img.offsetWidth);
                        setPreviewImageHeight(img.offsetHeight);
                        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                          setPreviewImageAspectRatio(img.naturalWidth / img.naturalHeight);
                        }
                      }
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: `${textPos.y}%`,
                      left: `${textPos.x}%`,
                      transform: 'translate(-50%, -50%)',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: '#E5002B',
                      border: '2px solid #fff',
                      boxShadow: '0 0 0 2px #E5002B',
                      pointerEvents: 'none',
                      zIndex: 10
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* 메인 슬로건 섹션 */}
          <div style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
              <AdminLabel style={{ marginBottom: 0 }}>메인 슬로건 ({adminLang.toUpperCase()})</AdminLabel>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <label style={{ fontSize: '0.9rem', color: '#666' }}>색상:</label>
                <input
                  type="color"
                  value={mainColor}
                  onChange={e => setMainColor(e.target.value)}
                  style={{ width: '40px', height: '32px', border: '1px solid #e0e0e0', borderRadius: '4px', cursor: 'pointer' }}
                />
                <label style={{ fontSize: '0.9rem', color: '#666', marginLeft: 8 }}>폰트 사이즈:</label>
                <input
                  type="text"
                  value={mainFontSize}
                  onChange={e => setMainFontSize(e.target.value)}
                  placeholder="2.8rem"
                  style={{ width: '80px', padding: '4px 8px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '0.9rem' }}
                />
              </div>
            </div>
            <div style={{ marginTop: 12, marginBottom: 24 }}>
              <ReactQuill
                key={`slogan-main-quill-${adminLang}`}
                value={form.main}
                onChange={(val, delta, source) => {
                  if (!loading && source === 'user') {
                    setIsEditing(true);
                    setForm(prev => ({ ...prev, main: val }));
                  }
                }}
                modules={quillModules}
                formats={formats}
                theme="snow"
                placeholder={`${adminLang === 'en' ? '영어' : '한국어'} 메인 슬로건을 입력하세요`}
                style={{ height: 120, marginBottom: 12, background: '#fff' }}
              />
            </div>
          </div>

          {/* 서브 슬로건 섹션 */}
          <div style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
              <AdminLabel style={{ marginBottom: 0 }}>서브 슬로건 ({adminLang.toUpperCase()})</AdminLabel>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <label style={{ fontSize: '0.9rem', color: '#666' }}>색상:</label>
                <input
                  type="color"
                  value={subColor}
                  onChange={e => setSubColor(e.target.value)}
                  style={{ width: '40px', height: '32px', border: '1px solid #e0e0e0', borderRadius: '4px', cursor: 'pointer' }}
                />
                <label style={{ fontSize: '0.9rem', color: '#666', marginLeft: 8 }}>폰트 사이즈:</label>
                <input
                  type="text"
                  value={subFontSize}
                  onChange={e => setSubFontSize(e.target.value)}
                  placeholder="1.15rem"
                  style={{ width: '80px', padding: '4px 8px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '0.9rem' }}
                />
              </div>
            </div>
            <div style={{ marginTop: 12, marginBottom: 24 }}>
              <ReactQuill
                key={`slogan-sub-quill-${adminLang}`}
                value={form.sub}
                onChange={(val, delta, source) => {
                  if (!loading && source === 'user') {
                    setIsEditing(true);
                    setForm(prev => ({ ...prev, sub: val }));
                  }
                }}
                modules={quillModules}
                formats={formats}
                theme="snow"
                placeholder={`${adminLang === 'en' ? '영어' : '한국어'} 서브 슬로건을 입력하세요`}
                style={{ height: 120, marginBottom: 12, background: '#fff' }}
              />
            </div>
          </div>

          {/* 실시간 프리뷰 섹션 */}
          <div style={{ marginBottom: 48, padding: 24, background: '#f8f9fa', borderRadius: 8, border: '1px solid #e0e0e0' }}>
            <h5 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16, color: '#333' }}>실시간 Preview ({adminLang.toUpperCase()})</h5>
            {(sloganImagePreview || sloganImage) ? (
              <div style={{ position: 'relative', width: '100%', maxWidth: '800px', margin: '0 auto', borderRadius: 8, overflow: 'hidden' }}>
                <img
                  src={sloganImagePreview || sloganImage}
                  alt="슬로건 배너 프리뷰"
                  style={{ width: '100%', height: 'auto', maxHeight: '400px', objectFit: 'contain', display: 'block' }}
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                      const aspectRatio = img.naturalWidth / img.naturalHeight;
                      setPreviewImageAspectRatio(aspectRatio);
                    }
                    setPreviewImageWidth(img.offsetWidth);
                    setPreviewImageHeight(img.offsetHeight);
                  }}
                />
                {previewImageWidth > 0 && previewImageAspectRatio > 0 && (() => {
                  const previewScale = previewImageWidth / 1920;
                  // 이미지 비율에 맞춘 높이 계산 (1920px 기준)
                  const containerHeight = 1920 / previewImageAspectRatio;
                  return (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: '50%',
                        width: '1920px',
                        height: `${containerHeight}px`,
                        transform: `translateX(-50%) scale(${previewScale})`,
                        transformOrigin: 'top center',
                        pointerEvents: 'none'
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          top: `${textPos.y}%`,
                          left: `${textPos.x}%`,
                          transform: 'translate(-50%, -50%)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                          width: '95%',
                          maxWidth: '100%'
                        }}
                      >
                        <div
                          style={{
                            fontSize: mainFontSize || '2.8rem',
                            fontWeight: 700,
                            marginBottom: '56px',
                            color: mainColor,
                            textAlign: 'center',
                            width: '100%',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'keep-all'
                          }}
                          dangerouslySetInnerHTML={{ __html: form.main || '<em>메인 슬로건을 입력하세요...</em>' }}
                        />
                        <div
                          className="slogan-sub-preview"
                          style={{
                            fontSize: subFontSize || '1.15rem',
                            lineHeight: 1.3,
                            color: subColor,
                            opacity: 0.95,
                            textAlign: 'center',
                            width: '100%',
                            maxWidth: '100%',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'keep-all',
                            display: 'block',
                            margin: '0 auto',
                            boxSizing: 'border-box'
                          }}
                          dangerouslySetInnerHTML={{ __html: form.sub || '<em>서브 슬로건을 입력하세요...</em>' }}
                        />
                        <style>{`
                          .slogan-sub-preview {
                            line-height: 1.3 !important;
                          }
                          .slogan-sub-preview > * {
                            margin: 0 !important;
                            padding: 0 !important;
                            line-height: 1.3 !important;
                            white-space: pre-wrap !important;
                            word-break: keep-all !important;
                          }
                          .slogan-sub-preview p {
                            margin: 0 !important;
                            margin-bottom: 0 !important;
                            padding: 0 !important;
                            line-height: 1.3 !important;
                            min-height: 1em;
                          }
                          .slogan-sub-preview br {
                            display: block;
                            content: "";
                            margin: 0 !important;
                            height: 0 !important;
                            line-height: 0 !important;
                          }
                        `}</style>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div style={{ background: '#fff', padding: 24, borderRadius: 8, border: '1px solid #e0e0e0' }}>
                <div style={{ maxWidth: '100%', margin: '0 auto', textAlign: 'center' }}>
                  <div 
                    style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 16, color: '#222' }}
                    dangerouslySetInnerHTML={{ __html: form.main || '<em>메인 슬로건을 입력하세요...</em>' }}
                  />
                  <div 
                    className="slogan-sub-preview"
                    style={{ 
                      fontSize: subFontSize || '1.15rem', 
                      lineHeight: 1.3, 
                      color: subColor || '#666',
                      opacity: 0.95,
                      textAlign: 'center',
                      width: '100%',
                      maxWidth: '100%',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'keep-all',
                      display: 'block',
                      margin: '0 auto',
                      boxSizing: 'border-box'
                    }}
                    dangerouslySetInnerHTML={{ __html: form.sub || '<em>서브 슬로건을 입력하세요...</em>' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 저장 버튼 섹션 */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 32 }}>
            <AdminButton onClick={handleSave} $primary>저장하기</AdminButton>
          </div>
        </AdminCard>
      )}
    </div>
  );
}

// 스토어 관리 페이지
function AdminStoreManage() {
  const { success } = useToast();
  const { adminLang } = useAdminLang();
  const [stores, setStores] = useState<Array<{ id: string; name: string; image: string; address: string; mapUrl: string; order?: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [newStore, setNewStore] = useState<{ name: string; image: string; address: string; mapUrl: string }>({ name: '', image: '', address: '', mapUrl: '' });
  const [uploading, setUploading] = useState(false);
  const [expandedStores, setExpandedStores] = useState<Set<string>>(new Set());

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, STORES_COLLECTION), (snapshot: QuerySnapshot<DocumentData>) => {
      const stores = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          image: data.image || '',
          address: data.address || '',
          mapUrl: data.mapUrl || '',
          order: data.order ?? 0
        };
      });
      stores.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setStores(stores);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async (store: any) => {
    try {
      await setDoc(doc(db, STORES_COLLECTION, store.id), store);
      success('스토어가 저장되었습니다!');
    } catch (error) {
      success('저장 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, STORES_COLLECTION, id));
      success('스토어가 삭제되었습니다!');
    } catch (error) {
      success('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleAdd = async () => {
    if (!newStore.name.trim()) return;
    try {
      const order = stores.length;
      await addDoc(collection(db, STORES_COLLECTION), { ...newStore, order });
      setNewStore({ name: '', image: '', address: '', mapUrl: '' });
      success('스토어가 추가되었습니다!');
    } catch (error) {
      success('추가 중 오류가 발생했습니다.');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number | null = null) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const uniqueName = `stores/${Date.now()}.${ext}`;
      const fileStorageRef = storageRef(storage, uniqueName);
      await uploadBytes(fileStorageRef, file);
      const url = await getDownloadURL(fileStorageRef);
      if (idx === null) {
        setNewStore(prev => ({ ...prev, image: url }));
      } else {
        setStores(prev => {
          const next = [...prev];
          next[idx] = { ...next[idx], image: url };
          return next;
        });
      }
    } catch (error) {
      success('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleReorder = async (newStores: Array<{ id: string; name: string; image: string; address: string; mapUrl: string; order?: number }>) => {
    try {
      await Promise.all(newStores.map((store, idx) => 
        updateDoc(doc(db, STORES_COLLECTION, store.id), { order: idx })
      ));
      success('순서가 변경되었습니다!');
    } catch (error) {
      success('순서 변경 중 오류가 발생했습니다.');
    }
  };

  const toggleStore = (storeId: string) => {
    setExpandedStores(prev => {
      const newSet = new Set(prev);
      if (newSet.has(storeId)) {
        newSet.delete(storeId);
      } else {
        newSet.add(storeId);
      }
      return newSet;
    });
  };

  const renderStoreItem = (store: { id: string; name: string; image: string; address: string; mapUrl: string; order?: number }, index: number) => {
    const isExpanded = expandedStores.has(store.id);
    
    return (
      <div style={{ 
        background: '#ffffff', 
        border: '1px solid #e0e0e0', 
        borderRadius: '12px', 
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <div 
          style={{ 
            padding: '20px 24px', 
            background: isExpanded ? '#f8f9fa' : '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: isExpanded ? '1px solid #e0e0e0' : 'none',
            transition: 'all 0.3s ease'
          }}
          onClick={() => toggleStore(store.id)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '50px', 
              height: '50px', 
              borderRadius: '8px', 
              overflow: 'hidden',
              border: '1px solid #e0e0e0'
            }}>
              <img 
                src={store.image || '/placeholder-store.jpg'} 
                alt={store.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div>
              <h3 style={{ 
                margin: 0, 
                fontSize: '1.1rem', 
                fontWeight: '600', 
                color: '#111111',
                fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif'
              }}>
                {store.name || '스토어명 없음'}
              </h3>
              <p style={{ 
                margin: '4px 0 0 0', 
                fontSize: '0.9rem', 
                color: '#888888',
                fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif'
              }}>
                {store.address || '주소 없음'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ 
              fontSize: '20px', 
              color: '#888888',
              transition: 'transform 0.3s ease',
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
            }}>
              ▼
            </span>
          </div>
        </div>
        
        {isExpanded && (
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <AdminLabel>스토어 이미지</AdminLabel>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => handleImageUpload(e, index)}
                  style={{ marginBottom: '12px' }}
                  disabled={uploading}
                />
                {store.image && (
                  <img 
                    src={store.image} 
                    alt={store.name}
                    style={{ 
                      width: '100%', 
                      height: '200px', 
                      objectFit: 'cover', 
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0'
                    }} 
                  />
                )}
              </div>
              <div>
                <AdminLabel>스토어명</AdminLabel>
                <AdminInput
                  value={store.name}
                  onChange={e => setStores(prev => { 
                    const next = [...prev]; 
                    next[index] = { ...next[index], name: e.target.value }; 
                    return next; 
                  })}
                  placeholder="스토어명"
                />
                <AdminLabel>주소</AdminLabel>
                <AdminInput
                  value={store.address}
                  onChange={e => setStores(prev => { 
                    const next = [...prev]; 
                    next[index] = { ...next[index], address: e.target.value }; 
                    return next; 
                  })}
                  placeholder="주소"
                />
                <AdminLabel>지도 URL</AdminLabel>
                <AdminInput
                  value={store.mapUrl}
                  onChange={e => setStores(prev => { 
                    const next = [...prev]; 
                    next[index] = { ...next[index], mapUrl: e.target.value }; 
                    return next; 
                  })}
                  placeholder="지도 URL"
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <AdminButton onClick={() => handleSave(store)} $primary>저장</AdminButton>
              <AdminButton onClick={() => handleDelete(store.id)} $danger>삭제</AdminButton>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div key={`store-manage-${adminLang}`}>
      <AdminHeader>스토어 관리</AdminHeader>
      
      {/* 스토어 추가 섹션 */}
      <AdminCard>
        <AdminLabel>새 스토어 추가</AdminLabel>
        <AdminGrid>
          <div>
            <AdminInput
              value={newStore.name}
              onChange={e => setNewStore(prev => ({ ...prev, name: e.target.value }))}
              placeholder="스토어명"
            />
            <AdminInput
              value={newStore.address}
              onChange={e => setNewStore(prev => ({ ...prev, address: e.target.value }))}
              placeholder="주소"
              style={{ marginTop: 8 }}
            />
            <AdminInput
              value={newStore.mapUrl}
              onChange={e => setNewStore(prev => ({ ...prev, mapUrl: e.target.value }))}
              placeholder="지도 URL"
              style={{ marginTop: 8 }}
            />
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={e => handleImageUpload(e, null)}
              style={{ marginBottom: 12 }}
              disabled={uploading}
            />
            {newStore.image && (
              <img 
                src={newStore.image} 
                alt="미리보기" 
                style={{ 
                  width: '100%', 
                  height: '200px', 
                  objectFit: 'cover', 
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0'
                }} 
              />
            )}
            <AdminButton 
              onClick={handleAdd} 
              $primary 
              style={{ marginTop: 12, width: '100%' }}
              disabled={!newStore.name.trim()}
            >
              스토어 추가
            </AdminButton>
          </div>
        </AdminGrid>
      </AdminCard>

      {/* 스토어 목록 섹션 */}
      <AdminCard>
        <AdminLabel>스토어 목록 (드래그하여 순서 변경)</AdminLabel>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#888', fontSize: 18, padding: '40px' }}>
            로딩 중...
          </div>
        ) : stores.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888', fontSize: 18, padding: '40px' }}>
            등록된 스토어가 없습니다.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {stores.map((store, index) => (
              <div
                key={store.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', index.toString());
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderTop = '2px solid #F88D2A';
                }}
                onDragLeave={(e) => {
                  e.currentTarget.style.borderTop = 'none';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderTop = 'none';
                  const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                  if (fromIndex !== index) {
                    const newStores = [...stores];
                    const [moved] = newStores.splice(fromIndex, 1);
                    newStores.splice(index, 0, moved);
                    handleReorder(newStores);
                  }
                }}
                style={{ transition: 'all 0.2s ease' }}
              >
                {renderStoreItem(store, index)}
              </div>
            ))}
          </div>
        )}
      </AdminCard>
      
      {msg && <AdminSuccessMessage>{msg}</AdminSuccessMessage>}
    </div>
  );
}

// 브랜드 관리 페이지
// 브랜드 추가/목록 레이아웃용 styled-components
const BrandAddRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 40px;
  align-items: flex-start;
  flex-wrap: nowrap;
  max-width: 1150px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  padding: 40px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  justify-content: center;
`;
const BrandCardRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 555px);
  gap: 40px;
  max-width: 1150px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  padding: 40px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  justify-content: center;
`;
const BrandAddLeft = styled.div`
  width: 555px;
  min-width: 555px;
  max-width: 555px;
`;
const BrandAddRight = styled.div`
  width: 555px;
  min-width: 555px;
  max-width: 555px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 18px;
`;
const BrandCardLeft = styled.div`
  width: 555px;
  min-width: 555px;
  max-width: 555px;
`;
const BrandCardRight = styled.div`
  width: 555px;
  min-width: 555px;
  max-width: 555px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 14px;
`;
const BrandCardBtnRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  margin-bottom: 2px;
`;
const BrandCardFileBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
`;
const BrandInputGroup = styled.div`
  margin-bottom: 28px;
  &:not(:last-child) {
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 18px;
  }
`;
const BrandLabel = styled.label`
  font-weight: 700;
  font-size: 1.08rem;
  margin-bottom: 10px;
  display: block;
  color: #222;
`;
const BrandQuill = styled(ReactQuill)`
  width: 100%;
  .ql-container {
    border-radius: 8px;
    background: #fafbfc;
    min-height: 48px;
    font-size: 1.04rem;
  }
  .ql-toolbar {
    border-radius: 8px 8px 0 0;
    background: #f5f6fa;
  }
  margin-bottom: 0;
`;

function AdminBrandManage() {
  const { success } = useToast();
  const [brands, setBrands] = useState<Array<{ id: string; name: { en: string; ko: string }; desc: { en: string; ko: string }; subText?: { en: string; ko: string }; image: string; order?: number; nameSize?: string; descSize?: string; subTextSize?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [uploading, setUploading] = useState(false);
  const [newBrand, setNewBrand] = useState<{ name: { en: string; ko: string }; desc: { en: string; ko: string }; subText?: { en: string; ko: string }; image: string; nameSize?: string; descSize?: string; subTextSize?: string }>({ name: { en: '', ko: '' }, desc: { en: '', ko: '' }, subText: { en: '', ko: '' }, image: '', nameSize: '1rem', descSize: '3.2rem', subTextSize: '0.98rem' });
  const [expandedBrands, setExpandedBrands] = useState<Set<string>>(new Set());
  const { adminLang } = useAdminLang();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'brands'), (snapshot: QuerySnapshot<DocumentData>) => {
      const arr = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        // 마이그레이션: 기존 string이면 en으로 간주
        return {
          id: docSnap.id,
          name: typeof data.name === 'string' ? { en: data.name, ko: data.name } : { en: data.name?.en ?? '', ko: data.name?.ko ?? '' },
          desc: typeof data.desc === 'string' ? { en: data.desc, ko: data.desc } : { en: data.desc?.en ?? '', ko: data.desc?.ko ?? '' },
          subText: typeof data.subText === 'string' ? { en: data.subText, ko: data.subText } : { en: data.subText?.en ?? '', ko: data.subText?.ko ?? '' },
          image: data.image || '',
          order: data.order ?? 0,
          nameSize: data.nameSize || '1rem',
          descSize: data.descSize || '3.2rem',
          subTextSize: data.subTextSize || '0.98rem'
        };
      });
      arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setBrands(arr);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [adminLang]);

  const handleSave = async (brand: any) => {
    try {
      await setDoc(doc(db, 'brands', brand.id), brand);
      success('브랜드가 저장되었습니다!');
    } catch (error) {
      success('저장 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'brands', id));
      success('브랜드가 삭제되었습니다!');
    } catch (error) {
      success('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleAdd = async () => {
    if (!newBrand.name[adminLang].trim()) return;
    try {
      const order = brands.length;
      await addDoc(collection(db, 'brands'), { ...newBrand, order });
      setNewBrand({ name: { en: '', ko: '' }, desc: { en: '', ko: '' }, subText: { en: '', ko: '' }, image: '', nameSize: '1rem', descSize: '3.2rem', subTextSize: '0.98rem' });
      success('브랜드가 추가되었습니다!');
    } catch (error) {
      success('추가 중 오류가 발생했습니다.');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number | null = null) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const uniqueName = `brands/${Date.now()}.${ext}`;
      const fileStorageRef = storageRef(storage, uniqueName);
      await uploadBytes(fileStorageRef, file);
      const url = await getDownloadURL(fileStorageRef);
      if (idx === null) {
        setNewBrand(prev => ({ ...prev, image: url }));
      } else {
        setBrands(prev => {
          const next = [...prev];
          next[idx] = { ...next[idx], image: url };
          return next;
        });
      }
    } catch (error) {
      success('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleReorder = async (newBrands: Array<{ id: string; name: { en: string; ko: string }; desc: { en: string; ko: string }; subText?: { en: string; ko: string }; image: string; order?: number; nameSize?: string; descSize?: string; subTextSize?: string }>) => {
    try {
      await Promise.all(newBrands.map((brand, idx) => 
        updateDoc(doc(db, 'brands', brand.id), { order: idx })
      ));
      success('순서가 변경되었습니다!');
    } catch (error) {
      success('순서 변경 중 오류가 발생했습니다.');
    }
  };

  const toggleBrand = (brandId: string) => {
    setExpandedBrands(prev => {
      const newSet = new Set(prev);
      if (newSet.has(brandId)) {
        newSet.delete(brandId);
      } else {
        newSet.add(brandId);
      }
      return newSet;
    });
  };

  const renderBrandItem = (brand: { id: string; name: { en: string; ko: string }; desc: { en: string; ko: string }; subText?: { en: string; ko: string }; image: string; order?: number; nameSize?: string; descSize?: string; subTextSize?: string }, index: number) => {
    const isExpanded = expandedBrands.has(brand.id);
    
    return (
      <div style={{ 
        background: '#ffffff', 
        border: '1px solid #e0e0e0', 
        borderRadius: '12px', 
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <div 
          style={{ 
            padding: '20px 24px', 
            background: isExpanded ? '#f8f9fa' : '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: isExpanded ? '1px solid #e0e0e0' : 'none',
            transition: 'all 0.3s ease'
          }}
          onClick={() => toggleBrand(brand.id)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '50px', 
              height: '50px', 
              borderRadius: '8px', 
              overflow: 'hidden',
              border: '1px solid #e0e0e0'
            }}>
              <img 
                src={brand.image || '/placeholder-brand.jpg'} 
                alt={brand.name.en}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div>
              <h3 style={{ 
                margin: 0, 
                fontSize: '1.1rem', 
                fontWeight: '600', 
                color: '#111111',
                fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif'
              }}
                dangerouslySetInnerHTML={{ __html: brand.name.en || 'Brand Name Missing' }}
              />
              <p style={{ 
                margin: '4px 0 0 0', 
                fontSize: '0.9rem', 
                color: '#888888',
                fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
                maxWidth: '300px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {brand.desc.en ? brand.desc.en.replace(/<[^>]*>/g, '') : 'Description Missing'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ 
              fontSize: '20px', 
              color: '#888888',
              transition: 'transform 0.3s ease',
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
            }}>
              ▼
            </span>
          </div>
        </div>
        
        {isExpanded && (
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <AdminLabel>브랜드 이미지</AdminLabel>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => handleImageUpload(e, index)}
                  style={{ marginBottom: '12px' }}
                  disabled={uploading}
                />
                {brand.image && (
                  <img 
                    src={brand.image} 
                    alt={brand.name.en}
                    style={{ 
                      width: '100%', 
                      height: '200px', 
                      objectFit: 'cover', 
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0'
                    }} 
                  />
                )}
              </div>
              <div>
                <AdminLabel>브랜드명</AdminLabel>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <AdminInput
                    type="text"
                    value={brand.nameSize || '1rem'}
                    onChange={e => setBrands(prev => {
                      const next = [...prev];
                      next[index] = { ...next[index], nameSize: e.target.value };
                      return next;
                    })}
                    placeholder="1rem"
                    style={{ width: '100px', marginBottom: 0, fontSize: '0.9rem', padding: '6px 8px' }}
                  />
                  <span style={{ fontSize: '0.85rem', color: '#666' }}>폰트 크기</span>
                </div>
                <ReactQuill
                  value={brand.name[adminLang]}
                  onChange={val => setBrands(prev => {
                    const next = [...prev];
                    next[index] = { ...next[index], name: { ...next[index].name, [adminLang]: val } };
                    return next;
                  })}
                  modules={quillModules}
                  formats={formats}
                  theme="snow"
                  placeholder="Brand Name"
                />
                <AdminLabel>브랜드 설명</AdminLabel>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <AdminInput
                    type="text"
                    value={brand.descSize || '3.2rem'}
                    onChange={e => setBrands(prev => {
                      const next = [...prev];
                      next[index] = { ...next[index], descSize: e.target.value };
                      return next;
                    })}
                    placeholder="3.2rem"
                    style={{ width: '100px', marginBottom: 0, fontSize: '0.9rem', padding: '6px 8px' }}
                  />
                  <span style={{ fontSize: '0.85rem', color: '#666' }}>폰트 크기</span>
                </div>
                <ReactQuill
                  value={brand.desc[adminLang]}
                  onChange={val => setBrands(prev => {
                    const next = [...prev];
                    next[index] = { ...next[index], desc: { ...next[index].desc, [adminLang]: val } };
                    return next;
                  })}
                  modules={quillModules}
                  formats={formats}
                  theme="snow"
                  placeholder="Brand Description"
                />
                <AdminLabel>브랜드 서브텍스트</AdminLabel>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <AdminInput
                    type="text"
                    value={brand.subTextSize || '0.98rem'}
                    onChange={e => setBrands(prev => {
                      const next = [...prev];
                      next[index] = { ...next[index], subTextSize: e.target.value };
                      return next;
                    })}
                    placeholder="0.98rem"
                    style={{ width: '100px', marginBottom: 0, fontSize: '0.9rem', padding: '6px 8px' }}
                  />
                  <span style={{ fontSize: '0.85rem', color: '#666' }}>폰트 크기</span>
                </div>
                <ReactQuill
                  value={brand.subText?.[adminLang] || ''}
                  onChange={val => setBrands(prev => {
                    const next = [...prev];
                    const currentSubText = next[index].subText || { en: '', ko: '' };
                    next[index] = { ...next[index], subText: { ...currentSubText, [adminLang]: val } };
                    return next;
                  })}
                  modules={quillModules}
                  formats={formats}
                  theme="snow"
                  placeholder="Brand Subtext"
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <AdminButton onClick={() => handleSave(brand)} $primary>저장</AdminButton>
              <AdminButton onClick={() => handleDelete(brand.id)} $danger>삭제</AdminButton>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div key={`brand-manage-${adminLang}`}>
      <AdminHeader>브랜드 관리</AdminHeader>
      
      {/* 브랜드 추가 섹션 */}
      <AdminCard>
        <AdminLabel>새 브랜드 추가</AdminLabel>
        <AdminGrid>
          <div>
            <AdminLabel>브랜드명</AdminLabel>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
              <AdminInput
                type="text"
                value={newBrand.nameSize || '1rem'}
                onChange={e => setNewBrand(prev => ({ ...prev, nameSize: e.target.value }))}
                placeholder="1rem"
                style={{ width: '100px', marginBottom: 0, fontSize: '0.9rem', padding: '6px 8px' }}
              />
              <span style={{ fontSize: '0.85rem', color: '#666' }}>폰트 크기</span>
            </div>
            <ReactQuill
              value={newBrand.name[adminLang]}
              onChange={val => setNewBrand(prev => ({ ...prev, name: { ...prev.name, [adminLang]: val } }))}
              modules={quillModules}
              formats={formats}
              theme="snow"
              placeholder="Brand Name"
            />
            <AdminLabel>브랜드 설명</AdminLabel>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
              <AdminInput
                type="text"
                value={newBrand.descSize || '3.2rem'}
                onChange={e => setNewBrand(prev => ({ ...prev, descSize: e.target.value }))}
                placeholder="3.2rem"
                style={{ width: '100px', marginBottom: 0, fontSize: '0.9rem', padding: '6px 8px' }}
              />
              <span style={{ fontSize: '0.85rem', color: '#666' }}>폰트 크기</span>
            </div>
            <ReactQuill
              value={newBrand.desc[adminLang]}
              onChange={val => setNewBrand(prev => ({ ...prev, desc: { ...prev.desc, [adminLang]: val } }))}
              modules={quillModules}
              formats={formats}
              theme="snow"
              placeholder="Brand Description"
            />
            <AdminLabel>브랜드 서브텍스트</AdminLabel>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
              <AdminInput
                type="text"
                value={newBrand.subTextSize || '0.98rem'}
                onChange={e => setNewBrand(prev => ({ ...prev, subTextSize: e.target.value }))}
                placeholder="0.98rem"
                style={{ width: '100px', marginBottom: 0, fontSize: '0.9rem', padding: '6px 8px' }}
              />
              <span style={{ fontSize: '0.85rem', color: '#666' }}>폰트 크기</span>
            </div>
            <ReactQuill
              value={newBrand.subText?.[adminLang] || ''}
              onChange={val => setNewBrand(prev => ({ 
                ...prev, 
                subText: { ...(prev.subText || { en: '', ko: '' }), [adminLang]: val } 
              }))}
              modules={quillModules}
              formats={formats}
              theme="snow"
              placeholder="Brand Subtext"
            />
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={e => handleImageUpload(e, null)}
              style={{ marginBottom: 12 }}
              disabled={uploading}
            />
            {newBrand.image && (
              <img 
                src={newBrand.image} 
                alt="미리보기" 
                style={{ 
                  width: '100%', 
                  height: '200px', 
                  objectFit: 'cover', 
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0'
                }} 
              />
            )}
            <AdminButton 
              onClick={handleAdd} 
              $primary 
              style={{ marginTop: 12, width: '100%' }}
              disabled={!newBrand.name[adminLang].trim()}
            >
              브랜드 추가
            </AdminButton>
          </div>
        </AdminGrid>
      </AdminCard>

      {/* 브랜드 목록 섹션 */}
      <AdminCard>
        <AdminLabel>브랜드 목록 (드래그하여 순서 변경)</AdminLabel>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#888', fontSize: 18, padding: '40px' }}>
            로딩 중...
          </div>
        ) : brands.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888', fontSize: 18, padding: '40px' }}>
            등록된 브랜드가 없습니다.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {brands.map((brand, index) => (
              <div
                key={brand.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', index.toString());
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderTop = '2px solid #F88D2A';
                }}
                onDragLeave={(e) => {
                  e.currentTarget.style.borderTop = 'none';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderTop = 'none';
                  const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                  if (fromIndex !== index) {
                    const newBrands = [...brands];
                    const [moved] = newBrands.splice(fromIndex, 1);
                    newBrands.splice(index, 0, moved);
                    handleReorder(newBrands);
                  }
                }}
                style={{ transition: 'all 0.2s ease' }}
              >
                {renderBrandItem(brand, index)}
              </div>
            ))}
          </div>
        )}
      </AdminCard>
      
      {msg && <AdminSuccessMessage>{msg}</AdminSuccessMessage>}
    </div>
  );
}

// 브랜드 페이지 관리 컴포넌트 (모든 브랜드를 map으로 관리)
function AdminBrandPageManage() {
  const [mainMedia, setMainMedia] = useState({
    type: 'video',
    url: '',
    file: null as File | null
  });
  const [brands, setBrands] = useState<any[]>([]);
  const [addBrand, setAddBrand] = useState({
    mainText: { en: '', ko: '' },
    subText: { en: '', ko: '' },
    mediaType: 'video',
    file: null as File | null,
    preview: '',
    link: '',
    linkText: { en: '', ko: '' }
  });
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();
  const { adminLang } = useAdminLang();

  useEffect(() => {
    setLoading(true);
    getDoc(doc(db, 'brandPage', 'mainMedia')).then(mainDoc => {
      if (mainDoc.exists()) {
        setMainMedia((prev: any) => ({ ...prev, ...mainDoc.data(), file: null }));
      }
    });
    const unsub = onSnapshot(collection(db, 'brandPage', 'brands', 'items'), (brandsSnap) => {
      const arr: any[] = [];
      brandsSnap.forEach(docSnap => {
        const data = docSnap.data() as any;
        arr.push({
          id: docSnap.id,
          ...data,
          mainText: typeof data.mainText === 'string' ? { en: data.mainText, ko: data.mainText } : data.mainText,
          subText: typeof data.subText === 'string' ? { en: data.subText, ko: data.subText } : data.subText,
          linkText: typeof data.linkText === 'string' ? { en: data.linkText, ko: data.linkText } : data.linkText,
          file: null,
          preview: ''
        });
      });
      arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setBrands(arr);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 파일 핸들러 (공통)
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, idx: number | null = null) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (idx === null) {
      setAddBrand(prev => ({ ...prev, file, mediaType: file.type.startsWith('video') ? 'video' : 'image', preview: url, mediaUrl: url }));
    } else {
      setBrands(prev => {
        const next = [...prev];
        next[idx] = { ...next[idx], file, mediaType: file.type.startsWith('video') ? 'video' : 'image', preview: url, mediaUrl: url };
        return next;
      });
    }
  };

  // 메인 미디어 저장
  const handleSaveMainMedia = async () => {
    try {
      let url = mainMedia.url;
      let type = mainMedia.type;
      
      console.log('메인 미디어 저장 시작:', { url, type, file: mainMedia.file });
      
      if (mainMedia.file) {
        const ext = mainMedia.file.name.split('.').pop();
        const uniqueName = `brandPage/mainMedia_${Date.now()}.${ext}`;
        console.log('파일 업로드 정보:', { fileName: mainMedia.file.name, ext, uniqueName });
        
        const fileStorageRef = storageRef(storage, uniqueName);
        console.log('Storage 참조 생성:', uniqueName);
        
        await uploadBytes(fileStorageRef, mainMedia.file);
        console.log('파일 업로드 완료');
        
        url = await getDownloadURL(fileStorageRef);
        type = mainMedia.file.type.startsWith('video') ? 'video' : 'image';
        console.log('다운로드 URL 생성:', { url, type });
      }
      
      console.log('Firestore에 저장할 데이터:', { url, type });
      await setDoc(doc(db, 'brandPage', 'mainMedia'), { url, type });
      console.log('Firestore 저장 완료');
      
      // 상태 업데이트를 즉시 반영하여 UI가 새로운 미디어를 표시하도록 함
      setMainMedia((prev: any) => ({ ...prev, url, type, file: null }));
      console.log('상태 업데이트 완료');
      
      success('저장되었습니다!');
    } catch (e) {
      console.error('메인 미디어 저장 실패:', e);
      error('저장 실패');
    }
  };

  // 브랜드 저장
  const handleSaveBrand = async (idx: number) => {
    try {
      const brand = brands[idx];
      let mediaUrl = brand.mediaUrl;
      let mediaType = brand.mediaType;
      if (brand.file) {
        const ext = brand.file.name.split('.').pop();
        const uniqueName = `brandPage/brand${idx + 1}_${Date.now()}.${ext}`;
        const fileStorageRef = storageRef(storage, uniqueName);
        await uploadBytes(fileStorageRef, brand.file);
        mediaUrl = await getDownloadURL(fileStorageRef);
        mediaType = brand.file.type.startsWith('video') ? 'video' : 'image';
      }
      const data = {
        mainText: brand.mainText,
        subText: brand.subText,
        mediaUrl,
        mediaType,
        order: idx,
        link: brand.link || '',
        linkText: brand.linkText || ''
      };
      if (brand.id) {
        await setDoc(doc(db, 'brandPage', 'brands', 'items', brand.id), data);
      }
      success('저장되었습니다!');
    } catch (e) {
      error('저장 실패');
    }
  };

  // 브랜드 삭제
  const handleDeleteBrand = async (idx: number) => {
    try {
      const brand = brands[idx];
      if (brand.id) {
        await deleteDoc(doc(db, 'brandPage', 'brands', 'items', brand.id));
      }
      success('삭제되었습니다!');
    } catch (e) {
      error('삭제 실패');
    }
  };

  // 브랜드 순서 변경
  const moveBrand = async (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0 || toIdx >= brands.length) return;
    const newArr = [...brands];
    const [moved] = newArr.splice(fromIdx, 1);
    newArr.splice(toIdx, 0, moved);
    await Promise.all(newArr.map((brand, idx) => updateDoc(doc(db, 'brandPage', 'brands', 'items', brand.id), { order: idx })));
    success('순서가 변경되었습니다.');
  };

  // 브랜드 추가
  const handleAddBrand = async () => {
    try {
      let mediaUrl = '';
      let mediaType = addBrand.mediaType;
      if (addBrand.file) {
        const ext = addBrand.file.name.split('.').pop();
        const uniqueName = `brandPage/brand_${Date.now()}.${ext}`;
        const fileStorageRef = storageRef(storage, uniqueName);
        await uploadBytes(fileStorageRef, addBrand.file);
        mediaUrl = await getDownloadURL(fileStorageRef);
        mediaType = addBrand.file.type.startsWith('video') ? 'video' : 'image';
      }
      const data = {
        mainText: addBrand.mainText,
        subText: addBrand.subText,
        mediaUrl,
        mediaType,
        order: brands.length,
        link: addBrand.link || '',
        linkText: addBrand.linkText || { en: '', ko: '' }
      };
      await addDoc(collection(db, 'brandPage', 'brands', 'items'), data);
      setAddBrand({ mainText: { en: '', ko: '' }, subText: { en: '', ko: '' }, mediaType: 'video', file: null, preview: '', link: '', linkText: { en: '', ko: '' } });
      success('브랜드가 추가되었습니다!');
    } catch (e) {
      error('추가 실패');
    }
  };

  return (
    <div style={{ background: '#f7f8fa', minHeight: '100vh', paddingBottom: 60 }}>
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '32px 0 0 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
        </div>
        <h1 style={{ fontWeight: 800, fontSize: '2.1rem', marginBottom: 36, textAlign: 'center', letterSpacing: '-1px', color: '#222' }}>Brand 페이지 관리</h1>
      </div>
      {/* 상단 파란 메시지 완전 제거 */}
      {/* 브랜드 추가 + 메인 미디어 교체를 한 줄에 2개로 배치 */}
      <div style={{ display: 'flex', flexDirection: 'row', gap: 32, justifyContent: 'center', alignItems: 'flex-start', maxWidth: 960, margin: '0 auto 40px auto' }}>
        <div style={{ flex: 1, width: 555, minWidth: 555, maxWidth: 555, minHeight: 620, background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px rgba(0,0,0,0.07)', boxSizing: 'border-box', padding: 32, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>브랜드 추가</div>
          <AdminLabel>메인 텍스트</AdminLabel>
          <AdminQuill key={`add-main-${adminLang}`} value={addBrand.mainText?.[adminLang] || ''} onChange={v => setAddBrand(b => ({ ...b, mainText: { ...(b.mainText || { en: '', ko: '' }), [adminLang]: v } }))} modules={quillModules} theme="snow" placeholder="브랜드 메인 텍스트" />
          <AdminLabel style={{ marginTop: 4 }}>서브 텍스트</AdminLabel>
          <AdminQuill key={`add-sub-${adminLang}`} value={addBrand.subText?.[adminLang] || ''} onChange={v => setAddBrand(b => ({ ...b, subText: { ...(b.subText || { en: '', ko: '' }), [adminLang]: v } }))} modules={quillModules} theme="snow" placeholder="브랜드 서브 텍스트" />
          <AdminLabel style={{ marginTop: 4 }}>링크 텍스트 (선택사항)</AdminLabel>
          <AdminQuill key={`add-link-${adminLang}`} value={addBrand.linkText?.[adminLang] || ''} onChange={v => setAddBrand(b => ({ ...b, linkText: { ...(b.linkText || { en: '', ko: '' }), [adminLang]: v } }))} modules={quillModules} theme="snow" placeholder="자세히 보기" />
          <AdminLabel style={{ marginTop: 4 }}>비디오/이미지 파일</AdminLabel>
          <input type="file" accept="image/png,image/jpeg,video/mp4" onChange={e => handleFile(e, null)} style={{ marginBottom: 8 }} />
          {addBrand.preview && (
            <div style={{ marginTop: 8 }}>
              {addBrand.mediaType === 'video' ? (
                <video src={addBrand.preview} style={{ width: '100%', maxWidth: 380, height: 200, borderRadius: 10, background: '#f3f3f3', objectFit: 'cover' }} controls />
              ) : (
                <img src={addBrand.preview} alt="미리보기" style={{ width: '100%', maxWidth: 380, height: 200, borderRadius: 10, background: '#f3f3f3', objectFit: 'cover' }} />
              )}
            </div>
          )}
          <AdminButton $primary style={{ marginTop: 12, fontSize: 16, borderRadius: 8, height: 44 }} onClick={handleAddBrand}>브랜드 추가</AdminButton>
        </div>
        <div style={{ flex: 1, width: 555, minWidth: 555, maxWidth: 555, minHeight: 620, background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px rgba(0,0,0,0.07)', boxSizing: 'border-box', padding: 32, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>메인 영역 미디어 교체</div>
          <input type="file" accept="image/png,image/jpeg,video/mp4" onChange={e => setMainMedia(prev => ({ ...prev, file: e.target.files?.[0] || null }))} style={{ marginBottom: 8 }} />
          {mainMedia.url && (
            <div style={{ marginTop: 8 }}>
              {mainMedia.type === 'video' ? (
                <video src={mainMedia.url} style={{ width: '100%', maxWidth: 380, height: 200, borderRadius: 10, background: '#f3f3f3', objectFit: 'cover' }} controls />
              ) : (
                <img src={mainMedia.url} alt="미리보기" style={{ width: '100%', maxWidth: 380, height: 200, borderRadius: 10, background: '#f3f3f3', objectFit: 'cover' }} />
              )}
            </div>
          )}
          <AdminButton $primary style={{ marginTop: 12, fontSize: 16, borderRadius: 8, height: 44 }} onClick={handleSaveMainMedia}>저장</AdminButton>
        </div>
      </div>
      <AdminCard style={{ maxWidth: 1400, minWidth: 1320, margin: '0 auto 32px auto', background: '#f9f9f9', padding: '40px 24px 40px 24px', boxSizing: 'border-box' }}>
        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 24 }}>브랜드 목록</div>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#888', fontSize: 18 }}>로딩 중...</div>
        ) : brands.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888', fontSize: 18 }}>등록된 브랜드가 없습니다.</div>
        ) : (
          <div className="admin-brand-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 555px)',
            gap: 12,
            justifyContent: 'center',
            alignItems: 'stretch',
            width: '100%'
          }}>
            {brands.map((brand, idx) => (
              <div key={brand.id} style={{
                background: '#fff',
                borderRadius: 16,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                padding: 20,
                minWidth: 555,
                maxWidth: 555,
                width: 555,
                minHeight: 420,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                border: '1.5px solid #e5e5e5',
                position: 'relative',
                boxSizing: 'border-box',
                alignItems: 'stretch',
                justifyContent: 'flex-start'
              }}>
                <div style={{ marginBottom: 8, textAlign: 'center' }}>
                  {brand.preview || brand.mediaUrl ? (
                    brand.mediaType === 'video' ? (
                      <video src={brand.preview || brand.mediaUrl} style={{ width: '100%', maxWidth: 380, height: 200, borderRadius: 10, background: '#f3f3f3', objectFit: 'cover' }} controls />
                    ) : (
                      <img src={brand.preview || brand.mediaUrl} alt="미리보기" style={{ width: '100%', maxWidth: 380, height: 200, borderRadius: 10, background: '#f3f3f3', objectFit: 'cover' }} />
                    )
                  ) : (
                    <div style={{ width: '100%', height: 200, background: '#f3f3f3', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 16 }}>미디어 없음</div>
                  )}
                </div>
                <input type="file" accept="image/png,image/jpeg,video/mp4" onChange={e => handleFile(e, idx)} style={{ marginBottom: 8 }} />
                <AdminLabel style={{ marginBottom: 8, fontSize: '1.12rem', fontWeight: 700, color: '#222' }}>메인 텍스트</AdminLabel>
                <AdminQuill
                  key={`main-text-${brand.id}-${adminLang}`}
                  value={brand.mainText?.[adminLang] || ''}
                  onChange={v => setBrands(prev => {
                    const next = [...prev];
                    const current = next[idx]?.mainText;
                    const base = typeof current === 'string' ? { en: current, ko: current } : (current || { en: '', ko: '' });
                    next[idx] = { ...next[idx], mainText: { ...base, [adminLang]: v } };
                    return next;
                  })}
                  modules={quillModules}
                  formats={formats}
                  theme="snow"
                  placeholder="브랜드 메인 텍스트"
                />
                <AdminLabel style={{ marginTop: 4, fontSize: '1.12rem', fontWeight: 700, color: '#222' }}>서브 텍스트</AdminLabel>
                <AdminQuill
                  key={`sub-text-${brand.id}-${adminLang}`}
                  value={brand.subText?.[adminLang] || ''}
                  onChange={v => setBrands(prev => {
                    const next = [...prev];
                    const current = next[idx]?.subText;
                    const base = typeof current === 'string' ? { en: current, ko: current } : (current || { en: '', ko: '' });
                    next[idx] = { ...next[idx], subText: { ...base, [adminLang]: v } };
                    return next;
                  })}
                  modules={quillModules}
                  formats={formats}
                  theme="snow"
                  placeholder="브랜드 서브 텍스트"
                />
                <AdminLabel style={{ marginTop: 4, fontSize: '1.12rem', fontWeight: 700, color: '#222' }}>링크 URL (선택사항)</AdminLabel>
                <AdminInput value={brand.link || ''} onChange={e => setBrands(prev => { const next = [...prev]; next[idx] = { ...next[idx], link: e.target.value }; return next; })} style={{ fontSize: 16, padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e5e5e5', marginBottom: 4 }} placeholder="https://example.com" />
                <AdminLabel style={{ marginTop: 4, fontSize: '1.12rem', fontWeight: 700, color: '#222' }}>링크 텍스트 (선택사항)</AdminLabel>
                <AdminQuill
                  key={`link-text-${brand.id}-${adminLang}`}
                  value={brand.linkText?.[adminLang] || ''}
                  onChange={v => setBrands(prev => {
                    const next = [...prev];
                    const current = next[idx]?.linkText;
                    const base = typeof current === 'string' ? { en: current, ko: current } : (current || { en: '', ko: '' });
                    next[idx] = { ...next[idx], linkText: { ...base, [adminLang]: v } };
                    return next;
                  })}
                  modules={quillModules}
                  formats={formats}
                  theme="snow"
                  placeholder="자세히 보기"
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center' }}>
                  <AdminButton $primary onClick={() => handleSaveBrand(idx)} style={{ minWidth: 70, fontSize: 15, borderRadius: 8, height: 40 }}>저장</AdminButton>
                  <AdminButton onClick={() => handleDeleteBrand(idx)} style={{ background: '#f66', color: '#fff', minWidth: 70, fontSize: 15, borderRadius: 8, height: 40 }}>삭제</AdminButton>
                  <AdminButton onClick={() => moveBrand(idx, idx - 1)} disabled={idx === 0} style={{ minWidth: 36, padding: '0 8px', fontSize: 15, borderRadius: 8, height: 40 }}>▲</AdminButton>
                  <AdminButton onClick={() => moveBrand(idx, idx + 1)} disabled={idx === brands.length - 1} style={{ minWidth: 36, padding: '0 8px', fontSize: 15, borderRadius: 8, height: 40 }}>▼</AdminButton>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* 반응형 스타일 */}
        <style>{`
          .admin-brand-grid { grid-template-columns: repeat(2, 555px); gap: 12px; justify-content: center; }
          @media (max-width: 1200px) {
            .admin-brand-grid { grid-template-columns: repeat(2, 440px) !important; }
          }
          @media (max-width: 900px) {
            .admin-brand-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </AdminCard>
      <style>{`
        .ql-size-small { font-size: 0.75em; }
        .ql-size-large { font-size: 1.5em; }
        .ql-size-huge  { font-size: 2.5em; }
      `}</style>
    </div>
  );
}

// Google Analytics 페이지뷰 추적 컴포넌트
function PageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    // 관리자 페이지는 통계에서 제외
    if (location.pathname.startsWith('/admin')) {
      return;
    }

    // 페이지뷰 전송
    ReactGA.send({ hitType: 'pageview', page: location.pathname + location.search });
  }, [location]);

  return null;
}

function App() {
  // Google Analytics 초기화
  useEffect(() => {
    ReactGA.initialize('G-8ZMLB6ZDB5');
  }, []);

  // Firestore 실시간 stores 데이터
  const [storeList, setStoreList] = useState<Array<{ name: string; image: string; address: string; mapUrl: string; order?: number }>>(initialStores);
  const siteLang = localStorage.getItem('siteLang') === 'ko' ? 'ko' : 'en';
  
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, STORES_COLLECTION), (snapshot: QuerySnapshot<DocumentData>) => {
      const stores = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id, // id 필드 추가
          name: data.name || '',
          image: data.image || '',
          address: data.address || '',
          mapUrl: data.mapUrl || '',
          order: data.order ?? 0
        };
      });
      // order 기준 정렬
      stores.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      console.log('[onSnapshot] stores:', stores);
      setStoreList(stores);
    });
    return () => unsubscribe();
  }, []);

  return (
    <ToastProvider>
      <Router>
        <PageViewTracker />
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          
          {/* 메인페이지 하위 관리 기능들 */}
          <Route path="/admin/mainpage" element={<AdminRoute><AdminMainPageManage /></AdminRoute>} />
          <Route path="/admin/menu" element={<AdminRoute><AdminMenuManage /></AdminRoute>} />
          <Route path="/admin/main" element={<AdminRoute><AdminMainManage /></AdminRoute>} />
          <Route path="/admin/slogan" element={<AdminRoute><AdminSloganManage /></AdminRoute>} />
          <Route path="/admin/store" element={<AdminRoute><AdminStoreManage /></AdminRoute>} />
          <Route path="/admin/brand" element={<AdminRoute><AdminBrandManage /></AdminRoute>} />
          <Route path="/admin/brandpage" element={<AdminRoute><AdminBrandPageManage /></AdminRoute>} />
          <Route path="/admin/footer" element={<AdminRoute><FooterManagePage /></AdminRoute>} />
          
          {/* 각 페이지별 관리 기능들 */}
          <Route path="/admin/about" element={<AdminRoute><AboutPageAdmin /></AdminRoute>} />
          <Route path="/admin/foodservice" element={<AdminRoute><AdminFoodServiceManage /></AdminRoute>} />
          <Route path="/admin/product" element={<AdminRoute><AdminProductManage /></AdminRoute>} />
          <Route path="/admin/contact" element={<AdminRoute><ContactUsAdminPage /></AdminRoute>} />
          <Route path="/contact" element={<ContactUsPage />} />
          <Route path="/admin/contact-us" element={<AdminRoute><ContactUsAdminPage /></AdminRoute>} />
          
          <Route path="/brand" element={<BrandPage />} />
          <Route path="/product" element={<ProductPage />} />
          <Route path="/about" element={<><Header /><AboutPage /><Footer language={siteLang} /></>} />
  
          <Route path="/foodservice" element={<><Header /><FoodServicePage /><Footer language={siteLang} /></>} />
          <Route path="/contact" element={<><Header /><ContactUsPage /><Footer language={siteLang} /></>} />
          {/* 기존 홈페이지 라우트 */}
          <Route path="/" element={<><Header isMainPage /><VideoSection /><SloganSection /><StoreCards stores={storeList} /><BrandSection><Brands /></BrandSection><Footer language={siteLang} /></>} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;

// 파일 확장자 기반 비디오 여부 판별 함수
function isVideo(url: string) {
  return /\.(mp4|webm|ogg)$/i.test(url);
}

const formats = [
  'bold', 'italic', 'underline', 'strike', 'align', 'link', 'size', 'header', 'list', 'indent', 'clean'
];

const PreviewBox = styled.div`
  background: ${colors.grayLight};
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
  border: 1px solid ${colors.grayBorder};
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.9rem;
  color: ${colors.grayDark};
`;

const SectionTitle = styled.h2`
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 24px;
  color: ${colors.black};
`;

// AboutPage, FoodServicePage, ContactUsPage 함수형 컴포넌트 선언 (JSX 반환)

