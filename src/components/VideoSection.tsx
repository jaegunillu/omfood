import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const VideoContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow-x: hidden;
  @media (max-width: 768px) {
    position: relative !important;
    height: auto !important;
    min-height: 0 !important;
    padding-top: 0 !important;
    margin-top: 0 !important;
    padding-bottom: 0 !important;
    margin-bottom: -30px !important;
    line-height: 0 !important;
    overflow: hidden !important;
    display: block !important;
    font-size: 0 !important;
    vertical-align: bottom !important;
    border: none !important;
    outline: none !important;
  }
`;

const VideoBg = styled.video`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  object-fit: cover !important;
  object-position: center;
  z-index: -1;
  @media (min-width: 769px) {
    object-fit: cover !important;
  }
  @media (max-width: 768px) {
    position: relative !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    object-fit: contain !important;
    object-position: center;
    display: block !important;
    vertical-align: bottom !important;
    padding-bottom: 0 !important;
    margin-bottom: 0 !important;
    line-height: 0 !important;
    font-size: 0 !important;
  }
`;

const MainTextOverlay = styled.div`
  position: absolute;
  top: -200px;
  left: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: transparent;
  pointer-events: none;
  @media (max-width: 768px) {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    padding: 40px 20px !important;
    margin-top: 0 !important;
    padding-bottom: 0 !important;
    margin-bottom: 0 !important;
    line-height: 0 !important;
    pointer-events: none !important;
  }
`;

const MainText = styled.h1`
  color: #fff;
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 700;
  text-shadow: 0 4px 24px rgba(0,0,0,0.35);
  letter-spacing: 0.04em;
  text-align: center;
  user-select: text;
  pointer-events: auto;
  margin: 0;
`;

const SubText = styled.p`
  margin-top: 12px;
  color: #fff;
  font-size: clamp(1rem, 2vw, 1.35rem);
  font-weight: 400;
  text-shadow: 0 2px 12px rgba(0,0,0,0.25);
  letter-spacing: 0.01em;
  text-align: center;
  opacity: 0.92;
  user-select: text;
  pointer-events: auto;
  @media (max-width: 700px) {
    padding-left: 10px;
    padding-right: 10px;
  }
`;

const VideoSection: React.FC = () => {
  const [main, setMain] = useState({
    mediaType: 'video',
    mediaUrl: '',
    mainText: { en: 'Global Taste, Local Touch', ko: '글로벌 맛, 로컬 터치' },
    subText: { 
      en: 'From sauces to stores, we blend Korean flavor with local culture for every market we serve.',
      ko: '소스부터 매장까지, 우리는 한국의 맛을 현지 문화와 조화시켜 모든 시장에 제공합니다.'
    }
  });
  const [currentLang, setCurrentLang] = useState<'en' | 'ko'>(
    localStorage.getItem('siteLang') === 'ko' ? 'ko' : 'en'
  );

  useEffect(() => {
    const docRef = doc(db, 'mainSection', 'content');
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        // 기존 데이터 구조 호환성 처리
        const mainText = data.mainText;
        const subText = data.subText;
        
        setMain((prev) => ({ 
          ...prev, 
          ...data,
          mainText: typeof mainText === 'string' ? { en: mainText, ko: mainText } : (mainText && typeof mainText === 'object' ? mainText : prev.mainText),
          subText: typeof subText === 'string' ? { en: subText, ko: subText } : (subText && typeof subText === 'object' ? subText : prev.subText)
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  // 언어 변경 감지
  useEffect(() => {
    const onLangChange = (event: any) => {
      const lang = event?.detail?.language ?? (localStorage.getItem('siteLang') === 'ko' ? 'ko' : 'en');
      setCurrentLang(lang);
    };

    // 초기 언어 설정
    const initialLang = localStorage.getItem('siteLang') === 'ko' ? 'ko' : 'en';
    setCurrentLang(initialLang);

    // 커스텀 이벤트 리스너 (Header에서 발생하는 이벤트)
    window.addEventListener('languageChange', onLangChange);
    window.addEventListener('storage', onLangChange);
    
    return () => {
      window.removeEventListener('languageChange', onLangChange);
      window.removeEventListener('storage', onLangChange);
    };
  }, []);

  if (!main.mediaUrl) {
    return <VideoContainer style={{ background: 'transparent' }}></VideoContainer>;
  }

  return (
    <VideoContainer>
      {main.mediaType === 'video' ? (
        <VideoBg 
          autoPlay 
          muted 
          loop 
          playsInline 
          key={main.mediaUrl}
        >
          <source src={main.mediaUrl} type="video/mp4" />
        </VideoBg>
      ) : (
        <VideoBg 
          as="img" 
          src={main.mediaUrl} 
          alt="main"
        />
      )}
      <MainTextOverlay>
        <MainText dangerouslySetInnerHTML={{ __html: (main.mainText?.[currentLang] ?? main.mainText?.en ?? '') }} />
        <SubText dangerouslySetInnerHTML={{ __html: (main.subText?.[currentLang] ?? main.subText?.en ?? '') }} />
      </MainTextOverlay>
    </VideoContainer>
  );
};

export default VideoSection; 