import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Header from './Header';
import Footer from './Footer';

const OuterBox = styled.div`
  min-height: 100vh;
  background: #fafafa;
  padding: 40px 50px;
  border-radius: 40px;
  border: 2px solid #bbb;
  margin: 32px auto;
  box-sizing: border-box;
  max-width: 1400px;
  width: 100%;
  @media (max-width: 900px) {
    padding: 24px 20px;
    border-radius: 24px;
    margin: 16px;
  }
  @media (max-width: 600px) {
    padding: 16px 12px;
    border-radius: 18px;
    margin: 8px;
  }
`;

const SloganWrap = styled.div`
  margin-bottom: 48px;
  text-align: left;
  @media (max-width: 900px) {
    margin-bottom: 32px;
  }
`;
const Slogan = styled.div`
  font-size: 2.8rem;
  font-weight: 800;
  margin-bottom: 0.3em;
  margin-top: 0.5em;
  line-height: 1.1;
  color: #111;
  @media (max-width: 900px) {
    font-size: 2.2rem;
  }
  @media (max-width: 600px) {
    font-size: 1.8rem;
  }
`;
const SloganDesc = styled.div`
  font-size: 1.12rem;
  color: #333;
  margin-bottom: 3em;
  max-width: 900px;
  line-height: 1.7;
  @media (max-width: 900px) {
    font-size: 1.08rem;
    margin-bottom: 2.5em;
  }
`;

const CategorySection = styled.section`
  margin-bottom: 72px;
  @media (max-width: 900px) {
    margin-bottom: 48px;
  }
  @media (max-width: 600px) {
    margin-bottom: 36px;
  }
`;
const CategoryTitle = styled.h2`
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 0.3em;
  margin-top: 2.5em;
  border-bottom: 2px solid #bbb;
  padding-bottom: 0.3em;
  display: inline-block;
  color: #111;
  @media (max-width: 900px) {
    font-size: 1.8rem;
    margin-top: 2em;
  }
  @media (max-width: 600px) {
    font-size: 1.6rem;
  }
`;
const CategoryRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 56px;
  margin-top: 24px;
  @media (max-width: 900px) {
    flex-direction: column;
    gap: 24px;
  }
  @media (max-width: 600px) {
    gap: 20px;
  }
`;
const CategoryDesc = styled.div`
  font-size: 1.08rem;
  color: #333;
  margin: 0;
  max-width: 380px;
  min-width: 240px;
  white-space: pre-line;
  line-height: 1.7;
  @media (max-width: 900px) {
    max-width: 100%;
    min-width: auto;
    font-size: 1.05rem;
  }
`;
const ProductGrid = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px 36px;
  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px 20px;
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;
const ProductCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  background: none;
  border: none;
  box-shadow: none;
  transition: transform 0.2s ease;
  &:hover {
    transform: translateY(-6px) scale(1.02);
  }
`;
const ProductImg = styled.img`
  width: 130px;
  height: 150px;
  object-fit: contain;
  margin-bottom: 12px;
  background: #f8f8f8;
  border-radius: 14px;
  border: 1.5px solid #e0e0e0;
  @media (max-width: 900px) {
    width: 110px;
    height: 130px;
  }
  @media (max-width: 600px) {
    width: 100px;
    height: 120px;
  }
`;
const ProductName = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: #111;
  text-align: center;
  margin-top: 4px;
  line-height: 1.3;
  @media (max-width: 900px) {
    font-size: 1.05rem;
  }
  @media (max-width: 600px) {
    font-size: 1rem;
  }
`;

// 모달
const ModalOverlay = styled.div<{ $open: boolean }>`
  display: ${({ $open }) => ($open ? 'flex' : 'none')};
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.45);
  z-index: 2000;
  align-items: center;
  justify-content: center;
`;
const ModalBox = styled.div`
  background: #fff;
  border-radius: 32px;
  max-width: 600px;
  width: 95vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 40px rgba(0,0,0,0.18);
  padding: 36px 32px 32px 32px;
  position: relative;
  @media (max-width: 600px) {
    padding: 18px 6px 18px 6px;
    border-radius: 18px;
  }
`;
const ModalClose = styled.button`
  position: absolute;
  top: 18px;
  right: 18px;
  background: none;
  border: none;
  font-size: 2.2rem;
  color: #888;
  cursor: pointer;
  z-index: 10;
`;
const ModalImg = styled.img`
  width: 120px;
  height: 140px;
  object-fit: contain;
  margin: 0 auto 18px auto;
  display: block;
  background: #f5f5f5;
  border-radius: 12px;
  border: 1.5px solid #eee;
`;
const ModalProductName = styled.div`
  font-size: 1.2rem;
  font-weight: 700;
  color: #111;
  text-align: center;
  margin-bottom: 18px;
`;
const ModalSection = styled.div`
  margin-bottom: 18px;
`;
const ModalSectionTitle = styled.div`
  font-size: 1.08rem;
  font-weight: 700;
  margin-bottom: 4px;
`;
const ModalSectionContent = styled.div`
  font-size: 1rem;
  color: #333;
  white-space: pre-line;
`;

interface Category {
  id: string;
  name: string;
  description?: string;
  order: number;
}
interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
  allergens?: string;
  ingredients?: string;
  nutrition?: string;
  order: number;
}
interface ProductPageData {
  slogan: string;
  subSlogan: string;
}

const DEFAULT_CATEGORY_DESC: Record<string, string> = {
  'Gochujang Base': 'Made with traditional Korean gochujang,\nthis chicken sauce blends sweet, spicy, and savory flavors in\nperfect harmony. It offers a versatile taste experience that\nbrings out the unique charm of K-Chicken.',
  'Soy Sauce Base': 'Made with traditional Korean gochujang,\nthis chicken sauce blends sweet, spicy, and savory flavors in\nperfect harmony. It offers a versatile taste experience that\nbrings out the unique charm of K-Chicken.',
  'Powder': 'Made with traditional Korean gochujang,\nthis chicken sauce blends sweet, spicy, and savory flavors in\nperfect harmony. It offers a versatile taste experience that\nbrings out the unique charm of K-Chicken.'
};

const ProductPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [pageData, setPageData] = useState<ProductPageData>({
    slogan: 'Signature Flavors. Global Standards.',
    subSlogan: 'OM FOOD supplies sauces and seasoning powders to its overseas stores in Taiwan, Vietnam, and Mongolia, as well as to local Korean restaurants and various kitchens abroad. Crafted to capture the rich, authentic flavors of Korean cuisine while blending seamlessly into local food cultures, these products win over local palates and further enhance the value and appeal of K-Food.'
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'productCategories'), (snapshot) => {
      const cats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Category));
      cats.sort((a, b) => a.order - b.order);
      setCategories(cats);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      const prods = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));
      prods.sort((a, b) => a.order - b.order);
      setProducts(prods);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadPageData = async () => {
      const docRef = doc(db, 'productPage', 'content');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPageData({
          slogan: docSnap.data().slogan || 'Signature Flavors. Global Standards.',
          subSlogan: docSnap.data().subSlogan || 'OM FOOD supplies sauces and seasoning powders to its overseas stores in Taiwan, Vietnam, and Mongolia, as well as to local Korean restaurants and various kitchens abroad. Crafted to capture the rich, authentic flavors of Korean cuisine while blending seamlessly into local food cultures, these products win over local palates and further enhance the value and appeal of K-Food.'
        });
      }
    };
    loadPageData();
  }, []);

  const handleProductClick = (product: Product) => {
    setModalProduct(product);
    setModalOpen(true);
  };
  const handleModalClose = () => {
    setModalOpen(false);
    setModalProduct(null);
  };

  return (
    <>
      <Header isBrandPage={true} />
      <OuterBox>
        <SloganWrap>
          <Slogan dangerouslySetInnerHTML={{ __html: pageData.slogan }} />
          <SloganDesc dangerouslySetInnerHTML={{ __html: pageData.subSlogan }} />
        </SloganWrap>
        {categories.map((cat) => (
          <CategorySection key={cat.id}>
            <CategoryTitle>{cat.name}</CategoryTitle>
            <CategoryRow>
              <CategoryDesc dangerouslySetInnerHTML={{ __html: cat.description || DEFAULT_CATEGORY_DESC[cat.name] || '' }} />
              <ProductGrid>
                {products.filter(p => p.category === cat.name).map(product => (
                  <ProductCard key={product.id} onClick={() => handleProductClick(product)}>
                    <ProductImg src={product.image} alt={product.name} />
                    <ProductName>{product.name}</ProductName>
                  </ProductCard>
                ))}
              </ProductGrid>
            </CategoryRow>
          </CategorySection>
        ))}
      </OuterBox>
      <ModalOverlay $open={modalOpen} onClick={handleModalClose}>
        {modalProduct && (
          <ModalBox onClick={e => e.stopPropagation()}>
            <ModalClose onClick={handleModalClose}>×</ModalClose>
            <ModalImg src={modalProduct.image} alt={modalProduct.name} />
            <ModalProductName>{modalProduct.name}</ModalProductName>
            {modalProduct.allergens && (
              <ModalSection>
                <ModalSectionTitle>Allergens</ModalSectionTitle>
                <ModalSectionContent>{modalProduct.allergens}</ModalSectionContent>
              </ModalSection>
            )}
            {modalProduct.ingredients && (
              <ModalSection>
                <ModalSectionTitle>Ingredients</ModalSectionTitle>
                <ModalSectionContent>{modalProduct.ingredients}</ModalSectionContent>
              </ModalSection>
            )}
            {modalProduct.nutrition && (
              <ModalSection>
                <ModalSectionTitle>Nutrition</ModalSectionTitle>
                <ModalSectionContent>{modalProduct.nutrition}</ModalSectionContent>
              </ModalSection>
            )}
          </ModalBox>
        )}
      </ModalOverlay>
      <Footer />
    </>
  );
};

export default ProductPage; 