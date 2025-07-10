import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Header from './Header';
import Footer from './Footer';
import ProductCard from './ProductCard';
import styles from './ProductPage.module.css';

interface Category {
  id: string;
  name: string;
  description: string;
  order: number;
}

interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
  order: number;
}

interface ProductPageData {
  slogan: string;
  subSlogan: string;
}

const ProductPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [pageData, setPageData] = useState<ProductPageData>({
    slogan: 'Signature Flavors\nGlobal Standards',
    subSlogan: 'OM FOOD supplies sauces and seasoning powders to its overseas stores in Taiwan, Vietnam, and Mongolia,\nas well as to local Korean restaurants and various kitchens abroad. Crafted to capture the rich, authentic flavors of Korean cuisine while blending seamlessly into local food cultures, these products win over local palates and further enhance the value and appeal of K-Food.'
  });

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
          subSlogan: docSnap.data().subSlogan || 'OM FOOD supplies sauces and seasoning powders to its overseas stores in Taiwan, Vietnam, and Mongolia,\nas well as to local Korean restaurants and various kitchens abroad. Crafted to capture the rich, authentic flavors of Korean cuisine while blending seamlessly into local food cultures, these products win over local palates and further enhance the value and appeal of K-Food.'
        });
      }
    };
    loadPageData();
    return () => {
      unsubscribeCategories();
      unsubscribeProducts();
    };
  }, []);

  return (
    <>
      <Header isBrandPage />
      <div className={styles.pageBg}>
        <section className={styles.sloganContainer}>
          <div className={styles.sloganTitle} dangerouslySetInnerHTML={{ __html: pageData.slogan.replace(/\n/g, '<br/>') }} />
          <div className={styles.sloganSub} dangerouslySetInnerHTML={{ __html: pageData.subSlogan.replace(/\n/g, '<br/>') }} />
        </section>
        {categories.map(category => (
          <section key={category.id} className={styles.categorySection}>
            <div className={styles.categoryTitle}>{category.name}</div>
            <div className={styles.categoryDescription} dangerouslySetInnerHTML={{ __html: category.description ? category.description.replace(/\n/g, '<br/>') : '' }} />
            <div className={styles.productsGrid}>
              {products.filter(p => p.category === category.name).map(product => (
                <ProductCard
                  key={product.id}
                  image={product.image}
                  name={product.name}
                  category={product.category}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
      <Footer />
    </>
  );
};

export default ProductPage; 