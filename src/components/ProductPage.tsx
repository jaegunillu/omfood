import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import Header from './Header';
import Footer from './Footer';
import ProductCard from './ProductCard';
import styles from './ProductPage.module.css';

// 타입 정의
interface Category {
  id: string;
  name: { en: string; ko: string } | string;
  description: string;
  order: number;
}

interface Product {
  id: string;
  name: { en: string; ko: string } | string;
  category: string;
  image: string;
  allergens?: any;
  ingredients?: any;
  nutrition?: any;
  order: number;
}

interface ProductPageData {
  ko: { slogan: string; subSlogan: string; bottomText: string };
  en: { slogan: string; subSlogan: string; bottomText: string };
}

// [핵심] 언어 변환 헬퍼 함수
const getLocalized = (data: any, lang: 'en' | 'ko'): string => {
  if (!data) return '';
  if (typeof data === 'string') return data;
  
  if (typeof data === 'object') {
    if (data[lang]) return data[lang];
    if (data.en) return data.en;
    if (data.ko) return data.ko;
    const vals = Object.values(data);
    if (vals.length > 0) return String(vals[0]);
  }
  return '';
};

// [핵심] 비교를 위한 정규화 함수
const normalize = (val: any): string => {
  return String(val || '').trim().toLowerCase();
};

const removeInlineColor = (html: any) => {
  if (typeof html !== 'string') return '';
  return html.replace(/ style="color:[^"]*"/g, '');
};

const defaultLabels = {
  allergens: { en: 'Allergens', ko: '알레르기' },
  ingredients: { en: 'Ingredients', ko: '성분' },
  nutrition: { en: 'Nutrition Facts', ko: '영양 정보' }
};

// 상세정보 모달
const ProductDetailModal = ({ product, onClose, language, labels }: { product: any, onClose: () => void, language: 'en' | 'ko', labels?: any }) => {
  if (!product) return null;

  const productName = getLocalized(product.name, language);
  const allergensText = removeInlineColor(getLocalized(product.allergens, language)) || 'None';
  const ingredientsText = removeInlineColor(getLocalized(product.ingredients, language)) || '-';
  const nutritionText = removeInlineColor(getLocalized(product.nutrition, language)) || '-';
  
  const currentLabels = labels || defaultLabels;
  const allergensLabel = getLocalized(currentLabels.allergens, language);
  const ingredientsLabel = getLocalized(currentLabels.ingredients, language);
  const nutritionLabel = getLocalized(currentLabels.nutrition, language);

  return (
    <div style={{
      position: 'fixed', zIndex: 1000, left: 0, top: 0, width: '100vw', height: '100vh',
      background: 'rgba(30,30,30,0.35)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff', borderRadius: 32, maxWidth: 480, width: '90vw', padding: 0, position: 'relative', boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 28, cursor: 'pointer', color: '#888', zIndex: 2 }}>×</button>
        <div style={{ maxHeight: 'calc(100vh - 48px)', overflowY: 'auto', padding: '40px 32px', boxSizing: 'border-box', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {product.image && <img src={product.image} alt={productName} style={{ width: '100%', minWidth: 240, maxWidth: 360, height: 'auto', objectFit: 'contain', marginBottom: -50, display: 'block' }} />}
            <div style={{ fontWeight: 700, fontSize: 22, marginTop: 0, marginBottom: 8 }}>{productName}</div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 4 }}>{allergensLabel}</div>
            <div dangerouslySetInnerHTML={{ __html: allergensText }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 4 }}>{ingredientsLabel}</div>
            <div dangerouslySetInnerHTML={{ __html: ingredientsText }} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 4 }}>{nutritionLabel}</div>
            <div dangerouslySetInnerHTML={{ __html: nutritionText }} />
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [pageData, setPageData] = useState<ProductPageData>({
    ko: { slogan: '', subSlogan: '', bottomText: '' },
    en: { slogan: '', subSlogan: '', bottomText: '' }
  });
  const [modalProduct, setModalProduct] = useState<any>(null);
  const navigate = useNavigate();
  const [language, setLanguage] = useState<'en' | 'ko'>(localStorage.getItem('siteLang') === 'ko' ? 'ko' : 'en');
  const [labelSettings, setLabelSettings] = useState(defaultLabels);

  // 데이터 구독
  useEffect(() => {
    const unsubCats = onSnapshot(collection(db, 'productCategories'), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Category));
      list.sort((a, b) => a.order - b.order);
      setCategories(list);
    });

    const unsubProds = onSnapshot(collection(db, 'products'), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
      list.sort((a, b) => a.order - b.order);
      setProducts(list);
    });

    const unsubPage = onSnapshot(doc(db, 'productPage', 'content'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setPageData({
          ko: { slogan: d.slogan?.ko || '', subSlogan: d.subSlogan?.ko || '', bottomText: d.bottomText?.ko || '' },
          en: { slogan: d.slogan?.en || '', subSlogan: d.subSlogan?.en || '', bottomText: d.bottomText?.en || '' }
        });
      }
    });

    const unsubLabels = onSnapshot(doc(db, 'productPage', 'labels'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setLabelSettings({
          allergens: { en: d.allergens?.en || 'Allergens', ko: d.allergens?.ko || '알레르기' },
          ingredients: { en: d.ingredients?.en || 'Ingredients', ko: d.ingredients?.ko || '성분' },
          nutrition: { en: d.nutrition?.en || 'Nutrition Facts', ko: d.nutrition?.ko || '영양 정보' }
        });
      }
    });

    return () => { unsubCats(); unsubProds(); unsubPage(); unsubLabels(); };
  }, []);

  // 언어 변경 감지
  useEffect(() => {
    const handler = (e: any) => {
      const lang = e.detail?.language as 'ko' | 'en';
      if (lang) setLanguage(lang);
    };
    window.addEventListener('languageChange', handler);
    return () => window.removeEventListener('languageChange', handler);
  }, []);

  return (
    <>
      <Header isBrandPage />
      <div className={styles.pageBg}>
        {/* [수정] 부모 섹션
          - 기존 클래스(styles.sloganContainer)를 유지하면 너비가 830px로 갇힘.
          - 따라서 부모 섹션은 너비를 100%로 풀어주되, 내부에 있는 메인 타이틀은 기존 스타일을 유지.
        */}
        <section style={{ 
          width: '100%', 
          maxWidth: '100vw', 
          padding: '100px 20px 60px 20px', 
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          {/* [복구 완료] 메인 슬로건
            - 기존에 사용하던 CSS 모듈 클래스(styles.sloganTitle)를 그대로 사용하여
            - 폰트, 컬러, 그림자 등 모든 디자인을 원상복구했습니다.
          */}
          <div 
            className={styles.sloganTitle} 
            dangerouslySetInnerHTML={{ __html: pageData[language].slogan.replace(/\n/g, '<br/>') }} 
          />
          
          {/* [서브 슬로건만 수정]
            - 별도의 클래스(sub-slogan-custom)를 적용하여
            - 너비 제한 해제 (1440px)
            - 폰트 사이즈/컬러/정렬 강제 적용 (CSS Reset)
          */}
          <div 
            className="sub-slogan-custom"
            dangerouslySetInnerHTML={{ __html: pageData[language].subSlogan.replace(/\n/g, '<br/>') }} 
          />
        </section>

        {/* 카테고리별 제품 리스트 */}
        {categories.map(cat => {
          const catName = getLocalized(cat.name, language);
          const catDesc = getLocalized(cat.description, language);

          const targetId = normalize(cat.id);
          const targetEn = normalize(typeof cat.name === 'object' ? cat.name.en : cat.name);
          const targetKo = normalize(typeof cat.name === 'object' ? cat.name.ko : cat.name);
          const targetRaw = normalize(typeof cat.name === 'string' ? cat.name : '');

          const filteredProds = products.filter(p => {
            const pCat = normalize(p.category);
            return (
              pCat === targetId ||
              pCat === targetEn ||
              pCat === targetKo ||
              pCat === targetRaw
            );
          });

          return (
            <section key={cat.id} className={styles.categorySection}>
              <div className={styles.categoryTitle}>{catName}</div>
              <div className={styles.categoryDescription} dangerouslySetInnerHTML={{ __html: catDesc.replace(/\n/g, '<br/>') }} />
              <div className={styles.productsGrid}>
                {filteredProds.length > 0 ? (
                  filteredProds.map(prod => (
                    <ProductCard
                      key={prod.id}
                      image={prod.image}
                      name={getLocalized(prod.name, language)}
                      category={catName}
                      onClick={() => setModalProduct(prod)}
                    />
                  ))
                ) : (
                  <div style={{ width: '100%', textAlign: 'center', padding: '20px', color: '#ccc', display: 'none' }}></div>
                )}
              </div>
            </section>
          );
        })}

        <section className={styles.customSection}>
          <div className={styles.customText} dangerouslySetInnerHTML={{ __html: pageData[language].bottomText.replace(/\n/g, '<br/>') }} />
          <button className={styles.moreButton} onClick={() => navigate('/contact')}>
            {language === 'ko' ? '더보기' : 'More'}
          </button>
        </section>
      </div>

      {modalProduct && (
        <ProductDetailModal product={modalProduct} onClose={() => setModalProduct(null)} language={language} labels={labelSettings} />
      )}
      <Footer />
      
      {/* [스타일 정의] 
        - 메인 슬로건 스타일은 건드리지 않음 (기존 styles.sloganTitle 사용)
        - 서브 슬로건 스타일만 여기서 정의하여 적용
      */}
      <style>{`
        .sub-slogan-custom {
          width: 100%;
          max-width: 1440px; /* 넓게 퍼지도록 설정 */
          margin: 24px auto 0 auto;
          text-align: center;
          font-family: 'Pretendard', sans-serif;
          font-size: 1.2rem;
          font-weight: 500;
          color: #8c6450;
          line-height: 1.6;
        }

        /* 서브 슬로건 내부의 P, DIV 태그 초기화 (줄바꿈 허용 + 중앙 정렬) */
        .sub-slogan-custom p,
        .sub-slogan-custom div {
          margin: 0;
          padding: 0;
          text-align: center !important; /* 강제 중앙 정렬 */
          min-height: 1.2em; /* 빈 줄 유지 */
          width: 100%;
        }

        /* 서브 슬로건 내부의 H태그 스타일 리셋 (본문처럼 보이게) */
        .sub-slogan-custom h1, 
        .sub-slogan-custom h2, 
        .sub-slogan-custom h3 {
          font-size: 1.2rem;
          font-weight: 500;
          margin: 0;
          line-height: 1.6;
          text-align: center !important;
          color: #8c6450;
        }

        @media (max-width: 768px) {
          .sub-slogan-custom { font-size: 1rem; padding: 0 16px; }
        }
      `}</style>
    </>
  );
};

export default ProductPage;
