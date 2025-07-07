import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import styled, { keyframes, css, createGlobalStyle } from 'styled-components';
import Header from './components/Header';
import VideoSection from './components/VideoSection';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { db, storage, auth } from './firebase';
import { doc, setDoc, getDoc, onSnapshot, collection, addDoc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { QuerySnapshot, DocumentData } from 'firebase/firestore';
import Footer from './components/Footer';
import BrandPage from './components/BrandPage';
import ProductPage from './components/ProductPage';
import { signInWithEmailAndPassword } from 'firebase/auth';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import AdminProductManageComponent from './components/AdminProductManage';
import { ToastProvider } from './components/admin/ToastContext';

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
const quillModules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
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
  max-width: 1400px;
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
  line-height: 1.7;
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
  @media (max-width: 400px) {
    width: 95vw;
    min-width: 0;
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
  max-width: 1400px;
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

function AdminLayoutComponent({ children, showBackButton = true, backTo, backLabel }: { children: React.ReactNode; showBackButton?: boolean; backTo?: string; backLabel?: string }) {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem('admin_login');
    navigate('/admin/login');
  };
  return (
    <AdminLayout>
      <AdminMain>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          {showBackButton && (
            <BackButton onClick={() => navigate(backTo || '/admin/dashboard')}>
              <span style={{ fontSize: 20 }}>←</span> {backLabel || '대시보드로'}
            </BackButton>
          )}
          <AdminLogoutBtn onClick={logout}>로그아웃</AdminLogoutBtn>
        </div>
        {children}
      </AdminMain>
    </AdminLayout>
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
  const [brands, setBrands] = useState<Array<{ name: string; desc: string; subText?: string; image: string; order?: number }>>([]);
  const refs = useRef<Array<HTMLDivElement | null>>([]);
  const [visibleArr, setVisibleArr] = useState<boolean[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'brands'), (snapshot) => {
      const arr = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          name: data.name || '',
          desc: data.desc || '',
          subText: data.subText || '',
          image: data.image || '',
          order: data.order ?? 0,
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
        <BrandSection ref={el => { refs.current[idx] = el as HTMLDivElement; }} key={brand.name + idx}>
          <BrandTextBlock>
            <BrandTopText $visible={visibleArr[idx]} dangerouslySetInnerHTML={{ __html: brand.name || '' }} />
            <BrandMainText $visible={visibleArr[idx]} dangerouslySetInnerHTML={{ __html: brand.desc || '' }} />
            <BrandSubText $visible={visibleArr[idx]} dangerouslySetInnerHTML={{ __html: brand.subText || '' }} />
          </BrandTextBlock>
          {brand.image && <BrandImage src={brand.image} alt={brand.name} />}
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

function SloganSection() {
  const [mainText, setMainText] = useState('');
  const [subText, setSubText] = useState('');
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [subShow, setSubShow] = useState<number>(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const docRef = doc(db, 'slogan', 'main');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setMainText(docSnap.data().mainText || '');
        setSubText(docSnap.data().subText || '');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.7 && rect.bottom > 0) {
        setShow(true);
      } else {
        setShow(false);
      }
    };
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!show) return;
    setSubShow(0);
    const lines = subText.split(/<br\s*\/?>|\n/);
    lines.forEach((_, i) => {
      setTimeout(() => setSubShow(idx => Math.max(idx, i + 1)), 400 + i * 350);
    });
  }, [show, subText]);

  if (loading) return null;

  const subLines = subText.split(/<br\s*\/?>|\n/);

  return (
    <SectionBg>
      <Section ref={ref}>
        <SloganMainText $show={show} dangerouslySetInnerHTML={{ __html: mainText || '' }} />
        <SubText style={{ minHeight: 48 }} dangerouslySetInnerHTML={{ __html: subText || '' }} />
      </Section>
    </SectionBg>
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
  if (localStorage.getItem('admin_login') === '1') return <>{children}</>;
  return <Navigate to="/admin/login" replace />;
}

function AdminDashboard() {
  const navigate = useNavigate();
  const iconSize = 38;
  const [menuNames, setMenuNames] = useState([
    "ABOUT OMFOOD", "FOOD SERVICE", "BRAND", "PRODUCT", "CONTACT"
  ]);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'menu', 'names'), (docSnap) => {
      if (docSnap.exists()) {
        setMenuNames(docSnap.data().items);
      }
    });
    return () => unsubscribe();
  }, []);

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

  return (
    <AdminLayoutComponent showBackButton={false}>
      <AdminHeader style={{ textAlign: 'center' }}>관리자 대시보드</AdminHeader>
      <div style={{ 
        maxWidth: '1400px', 
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
        {menuNames.map((name) => (
          <div key={name} style={{ 
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
    <AdminLayoutComponent>
      <AdminHeader>메인페이지 관리</AdminHeader>
      <div className="admin-mainpage-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(5, 1fr)', 
        gap: '24px', 
        marginBottom: '40px',
        maxWidth: '1400px',
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
  return (
    <AdminLayoutComponent>
      <AdminHeader>About OMFOOD 관리</AdminHeader>
      <AdminCard>
        <div style={{ textAlign: 'center', color: '#888', fontSize: 16 }}>
          About OMFOOD 페이지 관리 기능이 준비 중입니다.
        </div>
      </AdminCard>
    </AdminLayoutComponent>
  );
}

// Food Service 관리 페이지
function AdminFoodServiceManage() {
  return (
    <AdminLayoutComponent>
      <AdminHeader>Food Service 관리</AdminHeader>
      <AdminCard>
        <div style={{ textAlign: 'center', color: '#888', fontSize: 16 }}>
          Food Service 페이지 관리 기능이 준비 중입니다.
        </div>
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
  return (
    <AdminLayoutComponent>
      <AdminHeader>Contact 관리</AdminHeader>
      <AdminCard>
        <div style={{ textAlign: 'center', color: '#888', fontSize: 16 }}>
          Contact 페이지 관리 기능이 준비 중입니다.
        </div>
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
  max-width: 1300px;
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
  max-width: 1300px;
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
  const [names, setNames] = useState<string[]>(["ABOUT OMFOOD", "FOOD SERVICE", "BRAND", "PRODUCT", "CONTACT"]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [logoWhite, setLogoWhite] = useState('');
  const [logoBlack, setLogoBlack] = useState('');
  const [logoWhiteFile, setLogoWhiteFile] = useState<File | null>(null);
  const [logoBlackFile, setLogoBlackFile] = useState<File | null>(null);
  const [logoMsg, setLogoMsg] = useState('');

  useEffect(() => {
    async function fetchMenuNames() {
      setLoading(true);
      const docRef = doc(db, 'menu', 'names');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setNames(docSnap.data().items);
      }
      setLoading(false);
    }
    fetchMenuNames();
  }, []);

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
    const next = [...names];
    next[idx] = value;
    setNames(next);
  };

  const moveMenu = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= names.length) return;
    const next = [...names];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    setNames(next);
  };

  const handleSave = async () => {
    await setDoc(doc(db, 'menu', 'names'), { items: names });
    setMsg('저장되었습니다!');
    setTimeout(() => setMsg(''), 1500);
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
    <AdminLayoutComponent backTo="/admin/mainpage" backLabel="메인페이지">
      {loading ? (
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>로딩 중...</div>
      ) : (
        <>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              {names.map((name, idx) => (
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
                    <button onClick={() => moveMenu(idx, idx + 1)} disabled={idx === names.length - 1} style={{ padding: '4px 12px', fontSize: 18, borderRadius: 6, border: '1px solid #bbb', background: '#fff', cursor: idx === names.length - 1 ? 'not-allowed' : 'pointer' }}>▼</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 42 }}>
              <AdminButton onClick={handleSave} $primary style={{ fontSize: 20, padding: '16px 0', minWidth: 180 }}>저장하기</AdminButton>
            </div>
            {msg && <AdminSuccessMessage>{msg}</AdminSuccessMessage>}
          </AdminCard>
        </>
      )}
    </AdminLayoutComponent>
  );
}

// 메인 섹션 관리 페이지
function AdminMainManage() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    mediaType: 'video',
    mediaUrl: '',
    mainText: '',
    subText: '',
    file: null as File | null
  });
  const [preview, setPreview] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const docRef = doc(db, 'mainSection', 'content');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setData((prev: any) => ({ ...prev, ...docSnap.data(), file: null }));
        setPreview(docSnap.data().mediaUrl);
      }
    };
    loadData();
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setData((d: any) => ({ ...d, mediaType: file.type.startsWith('video') ? 'video' : 'image', mediaUrl: url, file }));
  };

  const handleChange = (k: string, v: string) => setData((d: any) => ({ ...d, [k]: v }));

  const handleSave = async () => {
    try {
      let mediaUrl = data.mediaUrl;
      
      if (data.file) {
        const ext = data.file.name.split('.').pop();
        const uniqueName = `mainSection/${Date.now()}.${ext}`;
        const fileStorageRef = storageRef(storage, uniqueName);
        await uploadBytes(fileStorageRef, data.file);
        mediaUrl = await getDownloadURL(fileStorageRef);
      }

      const mainData = {
        mediaType: data.mediaType,
        mediaUrl,
        mainText: data.mainText,
        subText: data.subText
      };

      await setDoc(doc(db, 'mainSection', 'content'), mainData);
      localStorage.setItem(MAIN_KEY, JSON.stringify(mainData));
      setMsg('저장되었습니다.');
      setTimeout(() => setMsg(''), 2000);
    } catch (error) {
      console.error('Error saving data:', error);
      setMsg('저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <AdminLayoutComponent backTo="/admin/mainpage" backLabel="메인페이지">
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
        <AdminLabel>메인 텍스트</AdminLabel>
        <AdminQuill
          value={data.mainText}
          onChange={v => handleChange('mainText', v)}
          modules={quillModules}
          theme="snow"
          placeholder="메인 텍스트를 입력하세요"
        />
        <AdminLabel>서브 텍스트</AdminLabel>
        <AdminQuill
          value={data.subText}
          onChange={v => handleChange('subText', v)}
          modules={quillModules}
          theme="snow"
          placeholder="서브 텍스트를 입력하세요"
        />
        <AdminButton $primary onClick={handleSave}>저장하기</AdminButton>
        {msg && <AdminSuccessMessage>{msg}</AdminSuccessMessage>}
      </AdminCard>
    </AdminLayoutComponent>
  );
}

// 슬로건 관리 페이지
function AdminSloganManage() {
  const [mainText, setMainText] = useState('Global Taste, Local Touch');
  const [subText, setSubText] = useState('From sauces to stores, we blend Korean flavor with local culture for every market we serve.');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchSlogan() {
      setLoading(true);
      const docRef = doc(db, 'slogan', 'main');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setMainText(docSnap.data().mainText);
        setSubText(docSnap.data().subText);
      }
      setLoading(false);
    }
    fetchSlogan();
  }, []);

  const handleSave = async () => {
    await setDoc(doc(db, 'slogan', 'main'), { mainText, subText });
    setMsg('저장되었습니다!');
    setTimeout(() => setMsg(''), 1500);
  };

  return (
    <AdminLayoutComponent backTo="/admin/mainpage" backLabel="메인페이지">
      {loading ? (
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>로딩 중...</div>
      ) : (
        <>
          <AdminHeader>슬로건 관리</AdminHeader>
          <AdminCard>
            <AdminLabel>메인 슬로건</AdminLabel>
            <div style={{ marginBottom: 24 }}>
              <ReactQuill
                value={mainText}
                onChange={setMainText}
                modules={quillModules}
                theme="snow"
                placeholder="메인 슬로건을 입력하세요"
                style={{ height: 120, marginBottom: 12, background: '#fff' }}
              />
            </div>
            <AdminLabel style={{ marginTop: 24 }}>서브 슬로건</AdminLabel>
            <div style={{ marginBottom: 24 }}>
              <ReactQuill
                value={subText}
                onChange={setSubText}
                modules={quillModules}
                theme="snow"
                placeholder="서브 슬로건을 입력하세요"
                style={{ height: 120, marginBottom: 12, background: '#fff' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 32 }}>
              <AdminButton onClick={handleSave} $primary>저장하기</AdminButton>
            </div>
            {msg && <AdminSuccessMessage>{msg}</AdminSuccessMessage>}
          </AdminCard>
        </>
      )}
    </AdminLayoutComponent>
  );
}

// 스토어 관리 페이지
function AdminStoreManage() {
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
      setMsg('저장되었습니다!');
      setTimeout(() => setMsg(''), 1500);
    } catch (error) {
      setMsg('저장 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, STORES_COLLECTION, id));
      setMsg('삭제되었습니다!');
      setTimeout(() => setMsg(''), 1500);
    } catch (error) {
      setMsg('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleAdd = async () => {
    if (!newStore.name.trim()) return;
    try {
      const order = stores.length;
      await addDoc(collection(db, STORES_COLLECTION), { ...newStore, order });
      setNewStore({ name: '', image: '', address: '', mapUrl: '' });
      setMsg('스토어가 추가되었습니다!');
      setTimeout(() => setMsg(''), 1500);
    } catch (error) {
      setMsg('추가 중 오류가 발생했습니다.');
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
      setMsg('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleReorder = async (newStores: Array<{ id: string; name: string; image: string; address: string; mapUrl: string; order?: number }>) => {
    try {
      await Promise.all(newStores.map((store, idx) => 
        updateDoc(doc(db, STORES_COLLECTION, store.id), { order: idx })
      ));
      setMsg('순서가 변경되었습니다!');
      setTimeout(() => setMsg(''), 1500);
    } catch (error) {
      setMsg('순서 변경 중 오류가 발생했습니다.');
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
    <AdminLayoutComponent backTo="/admin/mainpage" backLabel="메인페이지">
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
    </AdminLayoutComponent>
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
  const [brands, setBrands] = useState<Array<{ id: string; name: string; desc: string; subText?: string; image: string; order?: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [uploading, setUploading] = useState(false);
  const [newBrand, setNewBrand] = useState<{ name: string; desc: string; subText?: string; image: string }>({ name: '', desc: '', subText: '', image: '' });
  const [expandedBrands, setExpandedBrands] = useState<Set<string>>(new Set());

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'brands'), (snapshot: QuerySnapshot<DocumentData>) => {
      const arr = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        name: docSnap.data().name || '',
        desc: docSnap.data().desc || '',
        subText: docSnap.data().subText || '',
        image: docSnap.data().image || '',
        order: docSnap.data().order ?? 0
      }));
      arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setBrands(arr);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async (brand: any) => {
    try {
      await setDoc(doc(db, 'brands', brand.id), brand);
      setMsg('저장되었습니다!');
      setTimeout(() => setMsg(''), 1500);
    } catch (error) {
      setMsg('저장 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'brands', id));
      setMsg('삭제되었습니다!');
      setTimeout(() => setMsg(''), 1500);
    } catch (error) {
      setMsg('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleAdd = async () => {
    if (!newBrand.name.trim()) return;
    try {
      const order = brands.length;
      await addDoc(collection(db, 'brands'), { ...newBrand, order });
      setNewBrand({ name: '', desc: '', subText: '', image: '' });
      setMsg('브랜드가 추가되었습니다!');
      setTimeout(() => setMsg(''), 1500);
    } catch (error) {
      setMsg('추가 중 오류가 발생했습니다.');
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
      setMsg('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleReorder = async (newBrands: Array<{ id: string; name: string; desc: string; subText?: string; image: string; order?: number }>) => {
    try {
      await Promise.all(newBrands.map((brand, idx) => 
        updateDoc(doc(db, 'brands', brand.id), { order: idx })
      ));
      setMsg('순서가 변경되었습니다!');
      setTimeout(() => setMsg(''), 1500);
    } catch (error) {
      setMsg('순서 변경 중 오류가 발생했습니다.');
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

  const renderBrandItem = (brand: { id: string; name: string; desc: string; subText?: string; image: string; order?: number }, index: number) => {
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
                alt={brand.name}
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
                {brand.name || '브랜드명 없음'}
              </h3>
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
                {brand.desc ? brand.desc.replace(/<[^>]*>/g, '') : '설명 없음'}
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
                    alt={brand.name}
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
                <AdminQuill
                  value={brand.name}
                  onChange={v => setBrands(prev => { 
                    const next = [...prev]; 
                    next[index] = { ...next[index], name: v }; 
                    return next; 
                  })}
                  modules={quillModules}
                  theme="snow"
                  placeholder="브랜드명"
                />
                <AdminLabel>브랜드 설명</AdminLabel>
                <AdminQuill
                  value={brand.desc}
                  onChange={v => setBrands(prev => { 
                    const next = [...prev]; 
                    next[index] = { ...next[index], desc: v }; 
                    return next; 
                  })}
                  modules={quillModules}
                  theme="snow"
                  placeholder="브랜드 설명"
                />
                <AdminLabel>브랜드 서브텍스트</AdminLabel>
                <AdminQuill
                  value={brand.subText || ''}
                  onChange={v => setBrands(prev => { 
                    const next = [...prev]; 
                    next[index] = { ...next[index], subText: v }; 
                    return next; 
                  })}
                  modules={quillModules}
                  theme="snow"
                  placeholder="브랜드 서브텍스트"
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
    <AdminLayoutComponent backTo="/admin/mainpage" backLabel="메인페이지">
      <AdminHeader>브랜드 관리</AdminHeader>
      
      {/* 브랜드 추가 섹션 */}
      <AdminCard>
        <AdminLabel>새 브랜드 추가</AdminLabel>
        <AdminGrid>
          <div>
            <AdminLabel>브랜드명</AdminLabel>
            <AdminQuill
              value={newBrand.name}
              onChange={v => setNewBrand(prev => ({ ...prev, name: v }))}
              modules={quillModules}
              theme="snow"
              placeholder="브랜드명"
            />
            <AdminLabel>브랜드 설명</AdminLabel>
            <AdminQuill
              value={newBrand.desc}
              onChange={v => setNewBrand(prev => ({ ...prev, desc: v }))}
              modules={quillModules}
              theme="snow"
              placeholder="브랜드 설명"
            />
            <AdminLabel>브랜드 서브텍스트</AdminLabel>
            <AdminQuill
              value={newBrand.subText || ''}
              onChange={v => setNewBrand(prev => ({ ...prev, subText: v }))}
              modules={quillModules}
              theme="snow"
              placeholder="브랜드 서브텍스트"
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
              disabled={!newBrand.name.trim()}
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
    </AdminLayoutComponent>
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
    mainText: '',
    subText: '',
    mediaType: 'video',
    file: null as File | null,
    preview: '',
    link: '',
    linkText: ''
  });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

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
        arr.push({ id: docSnap.id, ...docSnap.data(), file: null, preview: '' });
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
    setMsg('저장 중...');
    try {
      let url = mainMedia.url;
      let type = mainMedia.type;
      if (mainMedia.file) {
        const ext = mainMedia.file.name.split('.').pop();
        const uniqueName = `brandPage/mainMedia_${Date.now()}.${ext}`;
        const fileStorageRef = storageRef(storage, uniqueName);
        await uploadBytes(fileStorageRef, mainMedia.file);
        url = await getDownloadURL(fileStorageRef);
        type = mainMedia.file.type.startsWith('video') ? 'video' : 'image';
      }
      await setDoc(doc(db, 'brandPage', 'mainMedia'), { url, type });
      setMainMedia((prev: any) => ({ ...prev, url, type, file: null }));
      setMsg('저장되었습니다!');
    } catch (e) {
      setMsg('저장 실패');
    } finally {
      setTimeout(() => setMsg(''), 1500);
    }
  };

  // 브랜드 저장
  const handleSaveBrand = async (idx: number) => {
    setMsg('저장 중...');
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
      setMsg('저장되었습니다!');
      setTimeout(() => setMsg(''), 1500);
    } catch (e) {
      setMsg('저장 실패');
      setTimeout(() => setMsg(''), 1500);
    }
  };

  // 브랜드 삭제
  const handleDeleteBrand = async (idx: number) => {
    setMsg('삭제 중...');
    try {
      const brand = brands[idx];
      if (brand.id) {
        await deleteDoc(doc(db, 'brandPage', 'brands', 'items', brand.id));
      }
      setMsg('삭제되었습니다!');
      setTimeout(() => setMsg(''), 1500);
    } catch (e) {
      setMsg('삭제 실패');
      setTimeout(() => setMsg(''), 1500);
    }
  };

  // 브랜드 순서 변경
  const moveBrand = async (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0 || toIdx >= brands.length) return;
    const newArr = [...brands];
    const [moved] = newArr.splice(fromIdx, 1);
    newArr.splice(toIdx, 0, moved);
    await Promise.all(newArr.map((brand, idx) => updateDoc(doc(db, 'brandPage', 'brands', 'items', brand.id), { order: idx })));
    setMsg('순서가 변경되었습니다.');
    setTimeout(() => setMsg(''), 1500);
  };

  // 브랜드 추가
  const handleAddBrand = async () => {
    setMsg('추가 중...');
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
        linkText: addBrand.linkText || ''
      };
      await addDoc(collection(db, 'brandPage', 'brands', 'items'), data);
      setAddBrand({ mainText: '', subText: '', mediaType: 'video', file: null, preview: '', link: '', linkText: '' });
      setMsg('브랜드가 추가되었습니다!');
      setTimeout(() => setMsg(''), 1500);
    } catch (e) {
      setMsg('추가 실패');
      setTimeout(() => setMsg(''), 1500);
    }
  };

  return (
    <div style={{ background: '#f7f8fa', minHeight: '100vh', paddingBottom: 60 }}>
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '32px 0 0 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
          <span style={{ fontSize: 16, color: '#888', cursor: 'pointer', marginRight: 18 }} onClick={() => window.history.back()}>&larr; 대시보드로</span>
        </div>
        <h1 style={{ fontWeight: 800, fontSize: '2.1rem', marginBottom: 36, textAlign: 'center', letterSpacing: '-1px', color: '#222' }}>Brand 페이지 관리</h1>
      </div>
      {msg && <div style={{ textAlign: 'center', color: '#007bff', fontWeight: 600, marginBottom: 16 }}>{msg}</div>}
      {/* 브랜드 추가 + 메인 미디어 교체를 한 줄에 2개로 배치 */}
      <div style={{ display: 'flex', flexDirection: 'row', gap: 32, justifyContent: 'center', alignItems: 'flex-start', maxWidth: 960, margin: '0 auto 40px auto' }}>
        <div style={{ flex: 1, width: 555, minWidth: 555, maxWidth: 555, minHeight: 620, background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px rgba(0,0,0,0.07)', boxSizing: 'border-box', padding: 32, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>브랜드 추가</div>
          <AdminLabel>메인 텍스트</AdminLabel>
          <AdminQuill value={addBrand.mainText} onChange={v => setAddBrand(b => ({ ...b, mainText: v }))} modules={quillModules} theme="snow" placeholder="브랜드 메인 텍스트" />
          <AdminLabel style={{ marginTop: 4 }}>서브 텍스트</AdminLabel>
          <AdminQuill value={addBrand.subText} onChange={v => setAddBrand(b => ({ ...b, subText: v }))} modules={quillModules} theme="snow" placeholder="브랜드 서브 텍스트" />
          <AdminLabel style={{ marginTop: 4 }}>링크 텍스트 (선택사항)</AdminLabel>
          <AdminQuill value={addBrand.linkText} onChange={v => setAddBrand(b => ({ ...b, linkText: v }))} modules={quillModules} theme="snow" placeholder="자세히 보기" />
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
                <AdminQuill value={brand.mainText} onChange={v => setBrands(prev => { const next = [...prev]; next[idx] = { ...next[idx], mainText: v }; return next; })} modules={quillModules} theme="snow" placeholder="브랜드 메인 텍스트" />
                <AdminLabel style={{ marginTop: 4, fontSize: '1.12rem', fontWeight: 700, color: '#222' }}>서브 텍스트</AdminLabel>
                <AdminQuill value={brand.subText} onChange={v => setBrands(prev => { const next = [...prev]; next[idx] = { ...next[idx], subText: v }; return next; })} modules={quillModules} theme="snow" placeholder="브랜드 서브 텍스트" />
                <AdminLabel style={{ marginTop: 4, fontSize: '1.12rem', fontWeight: 700, color: '#222' }}>링크 URL (선택사항)</AdminLabel>
                <AdminInput value={brand.link || ''} onChange={e => setBrands(prev => { const next = [...prev]; next[idx] = { ...next[idx], link: e.target.value }; return next; })} style={{ fontSize: 16, padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e5e5e5', marginBottom: 4 }} placeholder="https://example.com" />
                <AdminLabel style={{ marginTop: 4, fontSize: '1.12rem', fontWeight: 700, color: '#222' }}>링크 텍스트 (선택사항)</AdminLabel>
                <AdminQuill value={brand.linkText || ''} onChange={v => setBrands(prev => { const next = [...prev]; next[idx] = { ...next[idx], linkText: v }; return next; })} modules={quillModules} theme="snow" placeholder="자세히 보기" />
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
    </div>
  );
}

function App() {
  // Firestore 실시간 stores 데이터
  const [storeList, setStoreList] = useState<Array<{ name: string; image: string; address: string; mapUrl: string; order?: number }>>(initialStores);
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
          
          {/* 각 페이지별 관리 기능들 */}
          <Route path="/admin/about" element={<AdminRoute><AdminAboutManage /></AdminRoute>} />
          <Route path="/admin/foodservice" element={<AdminRoute><AdminFoodServiceManage /></AdminRoute>} />
          <Route path="/admin/product" element={<AdminRoute><AdminProductManage /></AdminRoute>} />
          <Route path="/admin/contact" element={<AdminRoute><AdminContactManage /></AdminRoute>} />
          
          <Route path="/brand" element={<BrandPage />} />
          <Route path="/product" element={<ProductPage />} />
          {/* 기존 홈페이지 라우트 */}
          <Route path="/*" element={
            <AppContainer>
              <Header />
              <VideoSection />
              <SloganSection />
              <StoreCards stores={(() => { console.log('[App] storeList:', storeList); return storeList; })()} />
              <BrandSection>
                <Brands />
              </BrandSection>
              <Footer />
            </AppContainer>
          } />
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
