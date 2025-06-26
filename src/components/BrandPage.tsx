import React from 'react';
import Header from './Header';
import Footer from './Footer';
import './BrandPage.css';

const BrandPage: React.FC = () => {
  return (
    <div className="brandpage-root">
      <Header isBrandPage />
      {/* 메인 비디오 섹션 (헤더 포함 풀스크린) */}
      <section className="brand-fullscreen-section brand-main-video-section">
        <video className="brand-main-video" src="/brand.mp4" autoPlay muted loop playsInline poster="/logo_black.png" onError={e => { alert('비디오 로드 실패!'); }} />
        <div className="brand-main-overlay">
          {/* 오버레이 텍스트 필요시 여기에 추가 */}
        </div>
      </section>

      {/* 브랜드 1 소개 (풀스크린) */}
      <section className="brand-fullscreen-section brand-section-1">
        <div className="brand-section-inner horizontal">
          <div className="brand-desc left">
            <h2 className="brand-title">A New Standard in<br/>Roasted Chicken, <span className="brand-em">Ovenmaru</span></h2>
            <div className="brand-bold">A proven franchise system built for your success.</div>
            <div className="brand-desc-text">
              From oil-free, differentiated kitchens to structured startup support and a nationwide logistics network <span className="brand-em">Ovenmaru</span> offers a balanced solution for both great taste and efficient operation.<br/>
              Start your journey with <span className="brand-em">Ovenmaru</span> today.
            </div>
            <a className="brand-btn" href="https://ovenmaru.com/" target="_blank" rel="noopener noreferrer">Ovenmaru &gt;&gt;</a>
          </div>
          <div className="brand-video-wrap right">
            <video className="brand-section-video" src="/store1.mp4" autoPlay muted loop playsInline poster="/logo_black.png" onError={e => { alert('비디오 로드 실패!'); }} />
          </div>
        </div>
      </section>

      {/* 브랜드 2 소개 (풀스크린) */}
      <section className="brand-fullscreen-section brand-section-2">
        <div className="brand-section-inner horizontal reverse">
          <div className="brand-video-wrap left">
            <video className="brand-section-video" src="/store2.mp4" autoPlay muted loop playsInline poster="/logo_black.png" onError={e => { alert('비디오 로드 실패!'); }} />
          </div>
          <div className="brand-desc right">
            <h2 className="brand-title"><span className="brand-em">Odduk</span>, a familiar taste<br/>with a surprising twist.</h2>
            <div className="brand-desc-text">
              Korean street food is always loved.<br/>
              <span className="brand-em">Otteok</span> blends familiar flavors with a trendy twist, offering a competitive menu and a simple, efficient system that makes it a standout brand for everyone.
            </div>
            <a className="brand-btn" href="https://www.omodduk.com/" target="_blank" rel="noopener noreferrer">Odduk &gt;&gt;</a>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default BrandPage; 