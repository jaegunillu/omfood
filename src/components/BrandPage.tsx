import React, { useEffect, useState, useRef } from 'react';
import Header from './Header';
import Footer from './Footer';
import { collection, onSnapshot } from 'firebase/firestore';
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
  const sectionRefs = useRef<(HTMLDivElement|null)[]>([]);
  const [visibleArr, setVisibleArr] = useState<boolean[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'brandPage', 'brands', 'items'), (snapshot) => {
      const arr: any[] = [];
      snapshot.forEach(doc => arr.push({ id: doc.id, ...doc.data() }));
      arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setBrands(arr);
      setVisibleArr(Array(arr.length).fill(false));
      sectionRefs.current = Array(arr.length).fill(null);
    });
    return () => unsub();
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
  }, [brands.length]);

  // Firestore에서 모든 브랜드를 map으로 렌더링
  const dynamicBrands = brands;

  return (
    <div className="brandpage-root">
      <Header isBrandPage />
      {/* 메인 비디오 영역 */}
      <section className="brand-fullscreen-section brand-main-video-section" style={{position:'relative',height:'100vh',minHeight:600,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <video 
          className="brand-main-video" 
          src="/brand.mp4" 
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
          onError={e => { alert('비디오 로드 실패!'); }} 
        />
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