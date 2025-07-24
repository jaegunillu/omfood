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
  slogan: string;
  subSlogan: string;
  bottomText: string;
}

// 상세정보 모달 컴포넌트
const removeInlineColor = (html: string) => html.replace(/ style="color:[^"]*"/g, '');
const ProductDetailModal = ({ product, onClose }: { product: any, onClose: () => void }) => {
  if (!product) return null;
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
            <img src={product.image} alt={product.name} style={{ width: '100%', minWidth: 240, maxWidth: 360, height: 'auto', objectFit: 'contain', margin: 0, marginBottom: -50, display: 'block' }} />
            <div style={{ fontWeight: 700, fontSize: 22, marginTop: 0, marginBottom: 8 }}>{product.name}</div>
          </div>
          <div className="product-modal-content" style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 4 }}>Allergens</div>
            <div dangerouslySetInnerHTML={{ __html: removeInlineColor(product.allergens || 'None') }} />
          </div>
          <div className="product-modal-content" style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 4 }}>Ingredients</div>
            <div dangerouslySetInnerHTML={{ __html: removeInlineColor(product.ingredients || '-') }} />
          </div>
          <div className="product-modal-content">
            <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 4 }}>Nutrition</div>
            <div dangerouslySetInnerHTML={{ __html: removeInlineColor(product.nutrition || '-') }} />
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
    slogan: 'Signature Flavors\nGlobal Standards',
    subSlogan: 'OM FOOD supplies sauces and seasoning powders to its overseas stores in Taiwan, Vietnam, and Mongolia,\nas well as to local Korean restaurants and various kitchens abroad. Crafted to capture the rich, authentic flavors of Korean cuisine while blending seamlessly into local food cultures, these products win over local palates and further enhance the value and appeal of K-Food.',
    bottomText: 'With certified domestic manufacturing expertise and proprietary recipes,\nwe can produce customized products tailored to buyer needs.'
  });
  const [modalProduct, setModalProduct] = useState<any>(null);
  const navigate = useNavigate();
  const [language, setLanguage] = useState<'en' | 'ko'>(localStorage.getItem('siteLang') === 'en' ? 'en' : 'ko');

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
      const docRef = doc(db, 'productPage', 'content');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPageData({
          slogan: docSnap.data().slogan || 'Signature Flavors\nGlobal Standards',
          subSlogan: docSnap.data().subSlogan || 'OM FOOD supplies sauces and seasoning powders to its overseas stores in Taiwan, Vietnam, and Mongolia,\nas well as to local Korean restaurants and various kitchens abroad. Crafted to capture the rich, authentic flavors of Korean cuisine while blending seamlessly into local food cultures, these products win over local palates and further enhance the value and appeal of K-Food.',
          bottomText: docSnap.data().bottomText || 'With certified domestic manufacturing expertise and proprietary recipes,\nwe can produce customized products tailored to buyer needs.'
        });
      }
    };
    loadPageData();
    return () => {
      unsubscribeCategories();
      unsubscribeProducts();
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
  }, [pageData.subSlogan]);

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
  }, [pageData.subSlogan, styles.productPageSloganSub]);

  return (
    <>
      <Header isBrandPage />
      <div className={styles.pageBg}>
        <section className={styles.sloganContainer}>
          <div className={styles.sloganTitle} dangerouslySetInnerHTML={{ __html: pageData.slogan.replace(/\n/g, '<br/>') }} />
          <div
            ref={subSloganRef}
            className={styles.productPageSloganSub}
            dangerouslySetInnerHTML={{ __html: pageData.subSlogan.replace(/\n/g, '<br/>') }}
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
          <div className={styles.customText} dangerouslySetInnerHTML={{ __html: pageData.bottomText.replace(/\n/g, '<br/>') }} />
          <button 
            className={styles.moreButton}
            onClick={() => navigate('/contact')}
          >
            More &gt;&gt;
          </button>
        </section>
      </div>
      {modalProduct && (
        <ProductDetailModal product={modalProduct} onClose={() => setModalProduct(null)} />
      )}
      <Footer />
    </>
  );
};

export default ProductPage; 