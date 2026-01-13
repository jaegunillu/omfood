import { collection, addDoc, setDoc, doc, getDocs, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

// 초기 카테고리 데이터
const initialCategories = [
  { name: 'Gochujang Base', order: 0 },
  { name: 'Soy Sauce Base', order: 1 },
  { name: 'Powder', order: 2 }
];

// 초기 제품 데이터
const initialProducts = [
  {
    name: 'Spicy Gochujang Sauce',
    category: 'Gochujang Base',
    image: 'https://via.placeholder.com/400x300/f0f0f0/666?text=Spicy+Gochujang',
    allergens: 'Contains: Soy, Wheat',
    ingredients: 'Gochujang (fermented soybean paste), red pepper powder, sugar, garlic, sesame oil, salt',
    nutrition: 'Per 100g: Calories 120, Protein 3g, Fat 2g, Carbohydrates 25g, Sodium 800mg',
    order: 0
  },
  {
    name: 'Mild Gochujang Sauce',
    category: 'Gochujang Base',
    image: 'https://via.placeholder.com/400x300/f0f0f0/666?text=Mild+Gochujang',
    allergens: 'Contains: Soy, Wheat',
    ingredients: 'Gochujang (fermented soybean paste), red pepper powder, sugar, garlic, sesame oil, salt',
    nutrition: 'Per 100g: Calories 110, Protein 3g, Fat 2g, Carbohydrates 23g, Sodium 750mg',
    order: 1
  },
  {
    name: 'Premium Soy Sauce',
    category: 'Soy Sauce Base',
    image: 'https://via.placeholder.com/400x300/f0f0f0/666?text=Premium+Soy+Sauce',
    allergens: 'Contains: Soy, Wheat',
    ingredients: 'Soybeans, wheat, salt, water, koji culture',
    nutrition: 'Per 100g: Calories 60, Protein 8g, Fat 0g, Carbohydrates 5g, Sodium 6000mg',
    order: 2
  },
  {
    name: 'Garlic Soy Sauce',
    category: 'Soy Sauce Base',
    image: 'https://via.placeholder.com/400x300/f0f0f0/666?text=Garlic+Soy+Sauce',
    allergens: 'Contains: Soy, Wheat',
    ingredients: 'Soy sauce, garlic, sugar, sesame oil, green onions',
    nutrition: 'Per 100g: Calories 80, Protein 6g, Fat 2g, Carbohydrates 8g, Sodium 5500mg',
    order: 3
  },
  {
    name: 'Korean BBQ Powder',
    category: 'Powder',
    image: 'https://via.placeholder.com/400x300/f0f0f0/666?text=Korean+BBQ+Powder',
    allergens: 'Contains: Soy, Wheat',
    ingredients: 'Salt, sugar, garlic powder, onion powder, black pepper, red pepper powder, sesame seeds',
    nutrition: 'Per 100g: Calories 250, Protein 8g, Fat 5g, Carbohydrates 45g, Sodium 4000mg',
    order: 4
  },
  {
    name: 'Bibimbap Seasoning Powder',
    category: 'Powder',
    image: 'https://via.placeholder.com/400x300/f0f0f0/666?text=Bibimbap+Seasoning',
    allergens: 'Contains: Soy, Wheat',
    ingredients: 'Salt, sugar, garlic powder, onion powder, red pepper powder, sesame seeds, seaweed powder',
    nutrition: 'Per 100g: Calories 220, Protein 6g, Fat 4g, Carbohydrates 42g, Sodium 3500mg',
    order: 5
  }
];

// 초기 페이지 데이터
const initialPageData = {
  slogan: 'Signature Flavors. Global Standards.',
  subSlogan: 'Discover our premium sauces and powders crafted with authentic Korean flavors.'
};

// 데이터 초기화 함수
export const initializeProductData = async () => {
  try {
    console.log('Product 데이터 초기화 시작...');

    // 카테고리 추가
    for (const category of initialCategories) {
      await addDoc(collection(db, 'productCategories'), category);
      console.log(`카테고리 추가: ${category.name}`);
    }

    // 제품 추가
    for (const product of initialProducts) {
      await addDoc(collection(db, 'products'), product);
      console.log(`제품 추가: ${product.name}`);
    }

    // 페이지 데이터 설정
    await setDoc(doc(db, 'productPage', 'content'), initialPageData);
    console.log('페이지 데이터 설정 완료');

    console.log('Product 데이터 초기화 완료!');
    return true;
  } catch (error) {
    console.error('Product 데이터 초기화 중 오류:', error);
    return false;
  }
};

// 데이터 확인 함수
export const checkProductData = async () => {
  try {
    const categoriesSnapshot = await getDocs(collection(db, 'productCategories'));
    const productsSnapshot = await getDocs(collection(db, 'products'));
    const pageDataSnapshot = await getDoc(doc(db, 'productPage', 'content'));

    console.log(`카테고리 개수: ${categoriesSnapshot.size}`);
    console.log(`제품 개수: ${productsSnapshot.size}`);
    console.log(`페이지 데이터 존재: ${pageDataSnapshot.exists()}`);

    return {
      categories: categoriesSnapshot.size,
      products: productsSnapshot.size,
      pageData: pageDataSnapshot.exists()
    };
  } catch (error) {
    console.error('데이터 확인 중 오류:', error);
    return null;
  }
}; 