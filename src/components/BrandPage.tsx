import React, { useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import './BrandPage.css';

const BrandPage: React.FC = () => {
  const [brands, setBrands] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'brandPage', 'brands', 'items'), (snapshot) => {
      const arr: any[] = [];
      snapshot.forEach(doc => arr.push({ id: doc.id, ...doc.data() }));
      arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setBrands(arr);
    });
    return () => unsub();
  }, []);

  // Firestore에서 모든 브랜드를 map으로 렌더링
  const dynamicBrands = brands;

  return (
    <div className="brandpage-root">
      <Header isBrandPage />
      {/* 메인 비디오 영역 */}
      <section className="brand-fullscreen-section brand-main-video-section" style={{position:'relative',height:'100vh',minHeight:600,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <video className="brand-main-video" src="/brand.mp4" autoPlay muted loop playsInline poster="/logo_black.png" style={{width:'100vw',height:'100vh',objectFit:'cover',position:'absolute',top:0,left:0,zIndex:0}} onError={e => { alert('비디오 로드 실패!'); }} />
        <div className="brand-main-overlay" style={{position:'relative',zIndex:1,width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center'}}>
          
        </div>
      </section>

      {/* Firestore 연동 브랜드(모든 브랜드) */}
      {dynamicBrands.length > 0 && dynamicBrands.map((brand, idx) => (
        <section className="brand-fullscreen-section" key={brand.id} style={{background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',minHeight:600}}>
          <div className="brand-section-inner horizontal" style={{display:'flex',alignItems:'center',justifyContent:'center',width:'100%',maxWidth:1200,gap:60}}>
            {idx % 2 === 0 ? (
              // 기본: 텍스트 왼쪽, 미디어 오른쪽
              <>
                <div className="brand-desc left" style={{flex:'0 0 650px',maxWidth:650,minWidth:0,width:'100%',display:'flex',flexDirection:'column',justifyContent:'center'}}>
                  <h2 className="brand-title" style={{fontSize:'2.2rem',fontWeight:800,marginBottom:24,lineHeight:1.3}}>{brand.mainText}</h2>
                  <div className="brand-desc-text" style={{fontSize:'1.18rem',marginBottom:28,lineHeight:1.7,color:'#222'}}>{brand.subText}</div>
                  {brand.link && (
                    <a className="brand-btn" href={brand.link} target="_blank" rel="noopener noreferrer" style={{marginTop:24,display:'inline-block',padding:'13px 36px',borderRadius:24,border:'1.5px solid #bbb',fontWeight:600,fontSize:'1.08rem',color:'#222',background:'#fff'}}>{brand.linkText || '자세히 보기'} &gt;&gt;</a>
                  )}
                </div>
                <div className="brand-video-wrap right" style={{width:'600px',height:'600px',borderRadius:24,background:'#eee',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {brand.mediaType === 'video' ? (
                    <video src={brand.mediaUrl} autoPlay muted loop playsInline style={{width:600,height:600,objectFit:'cover',borderRadius:24,background:'#eee'}} />
                  ) : (
                    <img src={brand.mediaUrl} alt={brand.mainText} style={{width:600,height:600,objectFit:'cover',borderRadius:24,background:'#eee'}} />
                  )}
                </div>
              </>
            ) : (
              // reverse: 미디어 왼쪽, 텍스트 오른쪽
              <>
                <div className="brand-video-wrap left" style={{width:'600px',height:'600px',borderRadius:24,background:'#eee',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {brand.mediaType === 'video' ? (
                    <video src={brand.mediaUrl} autoPlay muted loop playsInline style={{width:600,height:600,objectFit:'cover',borderRadius:24,background:'#eee'}} />
                  ) : (
                    <img src={brand.mediaUrl} alt={brand.mainText} style={{width:600,height:600,objectFit:'cover',borderRadius:24,background:'#eee'}} />
                  )}
                </div>
                <div className="brand-desc right" style={{flex:'0 0 650px',maxWidth:650,minWidth:0,width:'100%',display:'flex',flexDirection:'column',justifyContent:'center'}}>
                  <h2 className="brand-title" style={{fontSize:'2.2rem',fontWeight:800,marginBottom:24,lineHeight:1.3}}>{brand.mainText}</h2>
                  <div className="brand-desc-text" style={{fontSize:'1.18rem',marginBottom:28,lineHeight:1.7,color:'#222'}}>{brand.subText}</div>
                  {brand.link && (
                    <a className="brand-btn" href={brand.link} target="_blank" rel="noopener noreferrer" style={{marginTop:24,display:'inline-block',padding:'13px 36px',borderRadius:24,border:'1.5px solid #bbb',fontWeight:600,fontSize:'1.08rem',color:'#222',background:'#fff'}}>{brand.linkText || '자세히 보기'} &gt;&gt;</a>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      ))}
      <Footer />
    </div>
  );
};

export default BrandPage; 