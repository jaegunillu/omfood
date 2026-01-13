import React, { useEffect, useState, useRef } from 'react';
import Header from './Header';
import Footer from './Footer';
import { collection, onSnapshot, doc, onSnapshot as onSnapshotDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './BrandPage.css';
import styled from 'styled-components';

function stripHtmlTags(html: string) {
  // 태그 제거, &nbsp; 등 공백 치환
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

const BrandAddRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 40px;
  align-items: flex-start;
  flex-wrap: nowrap;
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  padding: 40px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
`;

const BrandCardRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 40px;
  align-items: flex-start;
  flex-wrap: nowrap;
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  padding: 40px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
`;

const BrandPage: React.FC = () => {
  const [brands, setBrands] = useState<any[]>([]);
  const [mainMedia, setMainMedia] = useState<{ type: string; url: string }>({ type: 'video', url: '/brand.mp4' });
  const [mediaLoading, setMediaLoading] = useState<boolean>(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [fallbackVideo, setFallbackVideo] = useState<string>('/brand.mp4');
  const [networkStatus, setNetworkStatus] = useState<string>('unknown');
  const sectionRefs = useRef<(HTMLDivElement|null)[]>([]);
  const [visibleArr, setVisibleArr] = useState<boolean[]>([]);

  useEffect(() => {
    // 네트워크 상태 모니터링
    const updateNetworkStatus = () => {
      if (navigator.onLine) {
        setNetworkStatus('online');
      } else {
        setNetworkStatus('offline');
        setMediaError('네트워크 연결이 끊어졌습니다.');
      }
    };

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    updateNetworkStatus();

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  useEffect(() => {
    // 메인 미디어 정보 가져오기
    const unsubMainMedia = onSnapshotDoc(doc(db, 'brandPage', 'mainMedia'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        console.log('메인 미디어 데이터:', data); // 디버깅용 로그
        setMainMedia({ type: data.type || 'video', url: data.url || '/brand.mp4' });
        setMediaError(null); // 에러 상태 초기화
      }
    });

    // 브랜드 목록 가져오기
    const unsubBrands = onSnapshot(collection(db, 'brandPage', 'brands', 'items'), (snapshot) => {
      const arr: any[] = [];
      snapshot.forEach(doc => arr.push({ id: doc.id, ...doc.data() }));
      arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setBrands(arr);
      setVisibleArr(Array(arr.length).fill(false));
      sectionRefs.current = Array(arr.length).fill(null);
    });

    return () => {
      unsubMainMedia();
      unsubBrands();
    };
  }, []);

  useEffect(() => {
    if (!brands.length) return;
    const observers: IntersectionObserver[] = [];
    brands.forEach((_, idx) => {
      if (!sectionRefs.current[idx]) return;
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
        { threshold: 0.3, rootMargin: '0px 0px -30% 0px' }
      );
      observer.observe(sectionRefs.current[idx]!);
      observers.push(observer);
    });
    return () => { observers.forEach(o => o.disconnect()); };
  }, [brands.length, mainMedia.url]);

  // Firestore에서 모든 브랜드를 map으로 렌더링
  const dynamicBrands = brands;

  const handleMediaLoad = () => {
    setMediaLoading(false);
    setMediaError(null);
    console.log('미디어 로드 성공:', mainMedia.url);
  };

  const handleMediaError = (e: React.SyntheticEvent<HTMLVideoElement | HTMLImageElement, Event>) => {
    setMediaLoading(false);
    
    const target = e.target as HTMLVideoElement | HTMLImageElement;
    const errorCode = (target as HTMLVideoElement).error?.code;
    const errorMessage = (target as HTMLVideoElement).error?.message;
    
    let errorMsg = `미디오 로드 실패: ${mainMedia.url}`;
    
    if (errorCode !== undefined) {
      switch (errorCode) {
        case 1:
          errorMsg += ' (MEDIA_ERR_ABORTED: 사용자가 로딩을 중단함)';
          break;
        case 2:
          errorMsg += ' (MEDIA_ERR_NETWORK: 네트워크 오류)';
          break;
        case 3:
          errorMsg += ' (MEDIA_ERR_DECODE: 미디어 디코딩 오류)';
          break;
        case 4:
          errorMsg += ' (MEDIA_ERR_SRC_NOT_SUPPORTED: 미디어 형식이 지원되지 않음)';
          break;
        default:
          errorMsg += ` (오류 코드: ${errorCode})`;
      }
    }
    
    if (errorMessage) {
      errorMsg += ` - ${errorMessage}`;
    }
    
    setMediaError(errorMsg);
    console.error('미디어 로드 에러:', e);
    console.error('미디어 URL:', mainMedia.url);
    console.error('미디어 타입:', mainMedia.type);
    console.error('에러 코드:', errorCode);
    console.error('에러 메시지:', errorMessage);
    
    // 비디오 로드 실패 시 기본 비디오로 폴백
    if (mainMedia.type === 'video' && mainMedia.url !== fallbackVideo) {
      console.log('기본 비디오로 폴백 시도');
      setMainMedia({ type: 'video', url: fallbackVideo });
      setMediaError(null);
    }
  };

  // 비디오 로드 재시도 함수
  const retryMediaLoad = () => {
    setMediaError(null);
    setMediaLoading(true);
    // 강제로 비디오를 다시 로드
    const videoElement = document.querySelector('.brand-main-video') as HTMLVideoElement;
    if (videoElement) {
      videoElement.load();
    }
  };

  // 비디오 형식 검증
  const isValidVideoFormat = (url: string) => {
    const videoExtensions = ['.mp4', '.webm', '.ogg'];
    const lowerUrl = url.toLowerCase();
    return videoExtensions.some(ext => lowerUrl.includes(ext));
  };

  // 비디오 URL이 유효한지 확인
  const getValidVideoUrl = (url: string) => {
    if (!url || url === '/brand.mp4') return fallbackVideo;
    if (isValidVideoFormat(url)) return url;
    console.warn('지원하지 않는 비디오 형식:', url);
    return fallbackVideo;
  };

  return (
    <div className="brandpage-root">
      <Header isBrandPage />
      {/* 메인 비디오 영역 */}
      <section key={`main-media-${mainMedia.url}`} className="brand-fullscreen-section brand-main-video-section" style={{position:'relative',height:'100vh',minHeight:600,display:'flex',alignItems:'center',justifyContent:'center'}}>
        {mediaLoading && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 2,
            color: '#fff',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            미디어 로딩 중...
          </div>
        )}
        
        {mediaError && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 2,
            color: '#ff4444',
            fontSize: '16px',
            textAlign: 'center',
            maxWidth: '80%'
          }}>
            <div>미디어 로드 실패</div>
            <div style={{ fontSize: '14px', marginTop: '8px', color: '#ccc' }}>
              {mediaError}
            </div>
            {networkStatus === 'offline' && (
              <div style={{ fontSize: '12px', marginTop: '8px', color: '#ff8888' }}>
                네트워크 연결을 확인해주세요
              </div>
            )}
            <button 
              onClick={retryMediaLoad}
              style={{
                marginTop: '16px',
                padding: '8px 16px',
                backgroundColor: '#E5002B',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              다시 시도
            </button>
          </div>
        )}

        {mainMedia.type === 'video' ? (
          <video 
            className="brand-main-video" 
            src={getValidVideoUrl(mainMedia.url)}
            autoPlay 
            muted 
            loop 
            playsInline 
            poster="/logo_black.png" 
            style={{
              width:'100%',
              height:'100%',
              objectFit:'cover',
              position:'absolute',
              top:0,
              left:0,
              zIndex:0,
              maxWidth:'100%',
              maxHeight:'100%'
            }} 
            onLoadStart={() => setMediaLoading(true)}
            onLoadedData={handleMediaLoad}
            onError={handleMediaError}
            key={mainMedia.url}
          />
        ) : (
          <img 
            className="brand-main-image" 
            src={mainMedia.url}
            alt="브랜드 메인 이미지"
            style={{
              width:'100%',
              height:'100%',
              objectFit:'cover',
              position:'absolute',
              top:0,
              left:0,
              zIndex:0,
              maxWidth:'100%',
              maxHeight:'100%'
            }} 
            onLoadStart={() => setMediaLoading(true)}
            onLoad={handleMediaLoad}
            onError={handleMediaError}
            key={mainMedia.url}
          />
        )}
        <div className="brand-main-overlay" style={{position:'relative',zIndex:1,width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center'}}>
          
        </div>
      </section>

      {/* Firestore 연동 브랜드(모든 브랜드) */}
      {dynamicBrands.length > 0 && dynamicBrands.map((brand, idx) => (
        <section
          className="brand-fullscreen-section"
          key={brand.id}
          ref={el => { sectionRefs.current[idx] = el as HTMLDivElement | null; }}
          style={{background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',minHeight:500,marginTop:0,paddingTop:0}}
        >
          <div className={`brand-section-inner horizontal${idx % 2 === 1 ? ' reverse' : ''}`}>
            <div className="brand-desc left">
              <h2
                className={`brand-title${visibleArr[idx] ? ' brand-ani-in' : ' invisible'}`}
                style={{ 
                  fontSize: '3.575rem', // 기존 2.75rem에서 30% 확대 (2.75 * 1.3 = 3.575)
                  fontWeight: 800, 
                  marginBottom: 24, 
                  lineHeight: 1.2, 
                  letterSpacing: '-1px', 
                  color: '#111', 
                  textAlign: 'left' 
                }}
              >
                {stripHtmlTags(brand.mainText)}
              </h2>
              <div
                className={`brand-desc-text${visibleArr[idx] ? ' brand-ani-in-sub' : ' invisible'}`}
                style={{ 
                  fontSize: '0.826rem', // 기존 1.18rem에서 30% 축소 (1.18 * 0.7 = 0.826)
                  marginBottom: 8, // 서브텍스트와 버튼 간격 총합 20px 이하로 조정
                  lineHeight: 1.7, 
                  color: '#222', 
                  textAlign: 'left' 
                }}
                dangerouslySetInnerHTML={{ __html: brand.subText }}
              />
              {brand.link && (
                <a
                  className={`brand-btn${visibleArr[idx] ? ' brand-ani-in-btn' : ' invisible'}`}
                  href={brand.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    marginTop: 12, // 서브텍스트와 버튼 간격 총합 20px 이하로 조정 (8px + 12px = 20px)
                    display: 'inline-block',
                    padding: '18px 48px',
                    borderRadius: 32,
                    border: '1.5px solid #bbb',
                    fontWeight: 700,
                    fontSize: '1.18rem',
                    color: '#222',
                    background: '#fff',
                    minWidth: 180,
                    textAlign: 'center',
                    letterSpacing: '0.01em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {brand.linkText ? brand.linkText.replace(/<[^>]+>/g, '') : '자세히 보기'} &gt;&gt;
                </a>
              )}
            </div>
            <div className={`brand-video-wrap right${visibleArr[idx] ? ' brand-ani-in-media right' : ' invisible'}`}>
              {brand.mediaType === 'video' ? (
                <video 
                  src={brand.mediaUrl} 
                  autoPlay 
                  muted 
                  playsInline 
                  style={{
                    width: 500,
                    height: 500,
                    objectFit: 'cover',
                    borderRadius: 24,
                    background: 'transparent',
                    maxWidth: '100%',
                    aspectRatio: '1/1'
                  }} 
                  onEnded={e => e.currentTarget.pause()} 
                />
              ) : (
                <img 
                  src={brand.mediaUrl} 
                  alt={brand.mainText} 
                  style={{
                    width: 500,
                    height: 500,
                    objectFit: 'cover',
                    borderRadius: 24,
                    background: 'transparent',
                    maxWidth: '100%',
                    aspectRatio: '1/1'
                  }} 
                />
              )}
            </div>
          </div>
        </section>
      ))}
      <Footer />
    </div>
  );
};

export default BrandPage; 