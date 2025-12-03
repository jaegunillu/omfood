import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import Header from './Header';
import Footer from './Footer';
import ProductCard from './ProductCard';
import styles from './ProductPage.module.css';

interface Category {
  id: string;
  name: { en: string; ko: string };
  description: string;
  order: number;
}

interface Product {
  id: string;
  name: { en: string; ko: string };
  category: string;
  image: string;
  order: number;
}

interface ProductPageData {
  ko: {
    slogan: string;
    subSlogan: string;
    bottomText: string;
  };
  en: {
    slogan: string;
    subSlogan: string;
    bottomText: string;
  };
}

// 상세정보 모달 컴포넌트
const removeInlineColor = (html: any) => {
  if (typeof html !== 'string') return '';
  return html.replace(/ style="color:[^"]*"/g, '');
};

interface LabelSettings {
  allergens: { en: string; ko: string };
  ingredients: { en: string; ko: string };
  nutrition: { en: string; ko: string };
}

const defaultLabels: LabelSettings = {
  allergens: { en: 'Allergens', ko: '알레르기' },
  ingredients: { en: 'Ingredients', ko: '성분' },
  nutrition: { en: 'Nutrition Facts', ko: '영양 정보' }
};

const ProductDetailModal = ({ product, onClose, language, labels }: { product: any, onClose: () => void, language: 'en' | 'ko', labels?: LabelSettings }) => {
  if (!product) return null;
  const getLocalizedText = (data: any) => {
    if (typeof data === 'string') return data;
    if (data && typeof data === 'object') {
      const localized = data[language] ?? data.en ?? data.ko;
      if (typeof localized === 'string') return localized;
    }
    return '';
  };

  const productName = getLocalizedText(product.name) || '';
  
  // getLocalizedText로 다국어 데이터를 문자열로 변환한 후 removeInlineColor 적용
  const allergensRaw = getLocalizedText(product.allergens);
  const ingredientsRaw = getLocalizedText(product.ingredients);
  const nutritionRaw = getLocalizedText(product.nutrition);
  
  const allergensText = allergensRaw ? removeInlineColor(allergensRaw) : 'None';
  const ingredientsText = ingredientsRaw ? removeInlineColor(ingredientsRaw) : '-';
  const nutritionText = nutritionRaw ? removeInlineColor(nutritionRaw) : '-';
  
  // 라벨 텍스트 가져오기 (전달받은 labels가 있으면 사용, 없으면 기본값)
  const currentLabels = labels || defaultLabels;
  const allergensLabel = currentLabels?.allergens?.[language] || currentLabels?.allergens?.en || defaultLabels.allergens[language] || defaultLabels.allergens.en;
  const ingredientsLabel = currentLabels?.ingredients?.[language] || currentLabels?.ingredients?.en || defaultLabels.ingredients[language] || defaultLabels.ingredients.en;
  const nutritionLabel = currentLabels?.nutrition?.[language] || currentLabels?.nutrition?.en || defaultLabels.nutrition[language] || defaultLabels.nutrition.en;

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
        <style>{`
          .ql-size-small { font-size: 0.75em; }
          .ql-size-large { font-size: 1.5em; }
          .ql-size-huge  { font-size: 2.5em; }
          .product-modal-content strong { font-weight: bold; margin-bottom: 6px; display: inline-block; }
          .product-modal-content ul { padding-left: 22px; margin-bottom: 10px; }
          .product-modal-content li { line-height: 1.5em; margin-bottom: 2px; }
          .product-modal-content p { line-height: 1.6; margin-bottom: 10px; }
          .product-modal-scroll {
            max-height: calc(100vh - 48px);
            overflow-y: auto;
            padding: 40px 32px 40px 32px;
            box-sizing: border-box;
            width: 100%;
          }
          .product-modal-scroll::-webkit-scrollbar {
            width: 8px;
            background: transparent;
          }
          .product-modal-scroll::-webkit-scrollbar-thumb {
            background: rgba(180,180,180,0.35);
            border-radius: 4px;
          }
        `}</style>
        <div className="product-modal-scroll">
          <div style={{ textAlign: 'center', marginBottom: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src={product.image} alt={productName} style={{ width: '100%', minWidth: 240, maxWidth: 360, height: 'auto', objectFit: 'contain', margin: 0, marginBottom: -50, display: 'block' }} />
            <div style={{ fontWeight: 700, fontSize: 22, marginTop: 0, marginBottom: 8 }}>{productName}</div>
          </div>
          <div className="product-modal-content" style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 4 }}>{allergensLabel}</div>
            <div dangerouslySetInnerHTML={{ __html: allergensText }} />
          </div>
          <div className="product-modal-content" style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 4 }}>{ingredientsLabel}</div>
            <div dangerouslySetInnerHTML={{ __html: ingredientsText }} />
          </div>
          <div className="product-modal-content">
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
    ko: {
      slogan: '시그니처 플레이버\n글로벌 스탠다드',
      subSlogan: 'OM FOOD는 대만, 베트남, 몽골의 해외 매장과 현지 한국 식당 및 해외 각지의 주방에 소스와 시즈닝 파우더를 공급합니다. 한국 음식의 풍부하고 진정한 맛을 포착하면서 현지 식문화에 자연스럽게 녹아들도록 제작된 이 제품들은 현지 입맛을 사로잡고 K-Food의 가치와 매력을 더욱 높입니다.',
      bottomText: '인증된 국내 제조 전문성과 독점 레시피를 바탕으로\n바이어의 요구에 맞춘 맞춤형 제품을 생산할 수 있습니다.'
    },
    en: {
      slogan: 'Signature Flavors\nGlobal Standards',
      subSlogan: 'OM FOOD supplies sauces and seasoning powders to its overseas stores in Taiwan, Vietnam, and Mongolia,\nas well as to local Korean restaurants and various kitchens abroad. Crafted to capture the rich, authentic flavors of Korean cuisine while blending seamlessly into local food cultures, these products win over local palates and further enhance the value and appeal of K-Food.',
      bottomText: 'With certified domestic manufacturing expertise and proprietary recipes,\nwe can produce customized products tailored to buyer needs.'
    }
  });
  const [modalProduct, setModalProduct] = useState<any>(null);
  const navigate = useNavigate();
  // localStorage가 'ko'일 때만 한국어, 그 외(null 포함)는 항상 영어가 기본값
  const [language, setLanguage] = useState<'en' | 'ko'>(localStorage.getItem('siteLang') === 'ko' ? 'ko' : 'en');
  const [labelSettings, setLabelSettings] = useState<LabelSettings>(defaultLabels);

  useEffect(() => {
    const unsubscribeCategories = onSnapshot(collection(db, 'productCategories'), (snapshot) => {
      const cats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Category));
      cats.sort((a, b) => a.order - b.order);
      setCategories(cats);
    });
    const unsubscribeProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const prods = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));
      prods.sort((a, b) => a.order - b.order);
      setProducts(prods);
    });
    const loadPageData = async () => {
      try {
        const koDoc = await getDoc(doc(db, 'productPage', 'ko'));
        const enDoc = await getDoc(doc(db, 'productPage', 'en'));
        
        if (koDoc.exists() || enDoc.exists()) {
          setPageData(prev => ({
            ...prev,
            ko: koDoc.exists() ? { ...prev.ko, ...koDoc.data() } : prev.ko,
            en: enDoc.exists() ? { ...prev.en, ...enDoc.data() } : prev.en
          }));
        }
      } catch (error) {
        console.error('ProductPage 데이터 로드 실패:', error);
      }
    };
    loadPageData();
    
    // 라벨 설정 실시간 구독
    const unsubscribeLabels = onSnapshot(doc(db, 'productPage', 'labels'), (labelSnap) => {
      if (labelSnap.exists()) {
        const data = labelSnap.data();
        const newLabelSettings = {
          allergens: {
            en: data.allergens?.en || defaultLabels.allergens.en,
            ko: data.allergens?.ko || defaultLabels.allergens.ko,
          },
          ingredients: {
            en: data.ingredients?.en || defaultLabels.ingredients.en,
            ko: data.ingredients?.ko || defaultLabels.ingredients.ko,
          },
          nutrition: {
            en: data.nutrition?.en || defaultLabels.nutrition.en,
            ko: data.nutrition?.ko || defaultLabels.nutrition.ko,
          }
        };
        setLabelSettings(newLabelSettings);
        console.log('라벨 설정 로드됨:', newLabelSettings);
      } else {
        // 문서가 없으면 기본값 사용
        setLabelSettings(defaultLabels);
        console.log('라벨 설정 문서 없음, 기본값 사용:', defaultLabels);
      }
    }, (error) => {
      console.error('라벨 설정 로드 실패:', error);
      // 에러 발생 시 기본값 사용
      setLabelSettings(defaultLabels);
    });
    
    return () => {
      unsubscribeCategories();
      unsubscribeProducts();
      unsubscribeLabels();
    };
  }, []);

  // 언어 변경 이벤트 구독
  useEffect(() => {
    const handleLangChange = (event: any) => {
      const lang = event.detail?.language as 'ko' | 'en';
      if (lang && (lang === 'ko' || lang === 'en')) {
        setLanguage(lang);
      }
    };

    // 언어 변경 이벤트 구독
    window.addEventListener('languageChange', handleLangChange);
    
    return () => {
      window.removeEventListener('languageChange', handleLangChange);
    };
  }, []);

  const subSloganRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = subSloganRef.current;
    if (el) {
      el.style.fontSize = '1.13rem';
      el.style.maxWidth = '1000px';
      el.style.margin = '0 auto';
      el.style.color = '#8c6450';
      el.style.textAlign = 'center';
      el.style.lineHeight = '1.45';
      el.style.fontFamily = "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif";
      el.style.padding = '0 10px';
      el.style.whiteSpace = 'pre-line';
    }
  }, [pageData[language].subSlogan, language]);

  useEffect(() => {
    // 이미 삽입된 style 태그가 있으면 제거
    const prev = document.getElementById('force-productPageSloganSub-style');
    if (prev) prev.remove();

    // 새로운 style 태그 삽입
    const style = document.createElement('style');
    style.id = 'force-productPageSloganSub-style';
    style.innerHTML = `
      .${styles.productPageSloganSub} {
        font-size: 1.13rem !important;
        color: #8c6450 !important;
        text-align: center !important;
        margin: 0 auto !important;
        line-height: 1.45 !important;
        font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif !important;
        max-width: 1000px !important;
        padding: 0 10px !important;
        white-space: pre-line !important;
      }
    `;
    document.head.appendChild(style);
  }, [pageData[language].subSlogan, language, styles.productPageSloganSub]);

  return (
    <>
      <Header isBrandPage />
      <div className={styles.pageBg}>
        <section className={styles.sloganContainer}>
          <div className={styles.sloganTitle} dangerouslySetInnerHTML={{ __html: pageData[language].slogan.replace(/\n/g, '<br/>') }} />
          <div
            ref={subSloganRef}
            className={styles.productPageSloganSub}
            dangerouslySetInnerHTML={{ __html: pageData[language].subSlogan.replace(/\n/g, '<br/>') }}
          />
        </section>
        {categories.map(category => (
          <section key={category.id} className={styles.categorySection}>
            <div className={styles.categoryTitle}>{(category.name as any)?.en !== undefined && typeof language === 'string' ? (category.name as any)[language] : String(category.name)}</div>
            <div className={styles.categoryDescription} dangerouslySetInnerHTML={{ __html: category.description ? category.description.replace(/\n/g, '<br/>') : '' }} />
            <div className={styles.productsGrid}>
              {products.filter(p => p.category === category.id || p.category === (typeof category.name === 'object' && category.name !== null && 'en' in category.name && 'ko' in category.name ? category.name[language] : String(category.name))).map(product => (
                <ProductCard
                  key={product.id}
                  image={product.image}
                  name={typeof product.name === 'object' && product.name !== null && 'en' in product.name && 'ko' in product.name ? product.name[language] : String(product.name)}
                  category={typeof category.name === 'object' && category.name !== null && 'en' in category.name && 'ko' in category.name ? category.name[language] : String(category.name)}
                  onClick={() => setModalProduct(product)}
                />
              ))}
            </div>
          </section>
        ))}
        <section className={styles.customSection}>
          <div className={styles.customText} dangerouslySetInnerHTML={{ __html: pageData[language].bottomText.replace(/\n/g, '<br/>') }} />
          <button 
            className={styles.moreButton}
            onClick={() => navigate('/contact')}
          >
            {language === 'ko' ? '더보기' : 'More'}
          </button>
        </section>
      </div>
      {modalProduct && (
        <ProductDetailModal product={modalProduct} onClose={() => setModalProduct(null)} language={language} labels={labelSettings} />
      )}
      <Footer />
    </>
  );
};

export default ProductPage; 