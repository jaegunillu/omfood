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

  // Firestore에서 3번 브랜드부터만 map으로 렌더링
  const dynamicBrands = brands.slice(2);

  return (
    <div className="brandpage-root">
      <Header isBrandPage />
      {/* 메인 비디오 영역 */}
      <section className="brand-fullscreen-section brand-main-video-section" style={{position:'relative',height:'100vh',minHeight:600,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <video className="brand-main-video" src="/brand.mp4" autoPlay muted loop playsInline poster="/logo_black.png" style={{width:'100vw',height:'100vh',objectFit:'cover',position:'absolute',top:0,left:0,zIndex:0}} onError={e => { alert('비디오 로드 실패!'); }} />
        <div className="brand-main-overlay" style={{position:'relative',zIndex:1,width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <span style={{fontSize:'2rem',fontWeight:700,color:'#222',background:'rgba(255,255,255,0.7)',padding:'18px 40px',borderRadius:16}}>메인 비디오 영역</span>
        </div>
      </section>

      {/* 1번 브랜드: Ovenmaru */}
      <section className="brand-fullscreen-section brand-section-1">
        <div className="brand-section-inner horizontal">
          <div className="brand-desc left">
            <h2 className="brand-title" style={{fontSize:'2.5rem',fontWeight:800,marginBottom:18,lineHeight:1.2}}>A New Standard in<br/>Roasted Chicken, <span className="brand-em">Ovenmaru</span></h2>
            <div className="brand-bold" style={{fontWeight:700,fontSize:'1.2rem',marginBottom:12}}>A proven franchise system built for your success.</div>
            <div className="brand-desc-text" style={{fontSize:'1.1rem',marginBottom:18}}>
              From oil-free, differentiated kitchens to structured startup support and a nationwide logistics network <span className="brand-em">Ovenmaru</span> offers a balanced solution for both great taste and efficient operation.<br/>
              Start your journey with <span className="brand-em">Ovenmaru</span> today.
            </div>
            <a className="brand-btn" href="https://ovenmaru.com/" target="_blank" rel="noopener noreferrer" style={{marginTop:18,display:'inline-block',padding:'12px 32px',borderRadius:24,border:'1.5px solid #bbb',fontWeight:600,fontSize:'1.1rem',color:'#222',background:'#fff'}}>OVENMARU &gt;&gt;</a>
          </div>
          <div className="brand-video-wrap right" style={{display:'flex',alignItems:'center',justifyContent:'center',width:'50%'}}>
            <video className="brand-section-video" src="/store1.mp4" autoPlay muted loop playsInline poster="/logo_black.png" style={{width:'90%',maxWidth:500,borderRadius:24,background:'#eee'}} onError={e => { alert('비디오 로드 실패!'); }} />
          </div>
        </div>
      </section>

      {/* 2번 브랜드: Odduk */}
      <section className="brand-fullscreen-section brand-section-2">
        <div className="brand-section-inner horizontal reverse">
          <div className="brand-video-wrap left" style={{display:'flex',alignItems:'center',justifyContent:'center',width:'50%'}}>
            <video className="brand-section-video" src="/store2.mp4" autoPlay muted loop playsInline poster="/logo_black.png" style={{width:'90%',maxWidth:500,borderRadius:24,background:'#eee'}} onError={e => { alert('비디오 로드 실패!'); }} />
          </div>
          <div className="brand-desc right">
            <h2 className="brand-title" style={{fontSize:'2.1rem',fontWeight:800,marginBottom:18,lineHeight:1.2}}><span className="brand-em">Odduk</span>, a familiar taste<br/>with a surprising twist.</h2>
            <div className="brand-desc-text" style={{fontSize:'1.1rem',marginBottom:18}}>
              Korean street food is always loved.<br/>
              <span className="brand-em">Otteok</span> blends familiar flavors with a trendy twist, offering a competitive menu and a simple, efficient system that makes it a standout brand for everyone.
            </div>
            <a className="brand-btn" href="https://www.omodduk.com/" target="_blank" rel="noopener noreferrer" style={{marginTop:18,display:'inline-block',padding:'12px 32px',borderRadius:24,border:'1.5px solid #bbb',fontWeight:600,fontSize:'1.1rem',color:'#222',background:'#fff'}}>ODDUK &gt;&gt;</a>
          </div>
        </div>
      </section>

      {/* Firestore 연동 브랜드(3번~) */}
      {dynamicBrands.length > 0 && dynamicBrands.map((brand, idx) => (
        <section className="brand-fullscreen-section" key={brand.id} style={{background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',minHeight:600}}>
          <div className="brand-section-inner horizontal" style={{display:'flex',alignItems:'center',justifyContent:'center',width:'100%',maxWidth:1200,gap:60}}>
            {/* 텍스트 왼쪽, 미디어 오른쪽 */}
            <div className="brand-desc left" style={{flex:1,minWidth:320}}>
              <h2 className="brand-title" style={{fontSize:'2.1rem',fontWeight:800,marginBottom:18,lineHeight:1.2}}>{brand.mainText}</h2>
              <div className="brand-desc-text" style={{fontSize:'1.1rem',marginBottom:18}}>{brand.subText}</div>
            </div>
            <div className="brand-video-wrap right" style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center'}}>
              {brand.mediaType === 'video' ? (
                <video src={brand.mediaUrl} controls style={{width:'90%',maxWidth:500,borderRadius:24,background:'#eee'}} />
              ) : (
                <img src={brand.mediaUrl} alt={brand.mainText} style={{width:'90%',maxWidth:500,borderRadius:24,background:'#eee'}} />
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