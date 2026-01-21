import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { collection, onSnapshot, doc, setDoc, addDoc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useToast } from './common/ToastContext';
import Toast from './common/Toast';
import ToastContainer from './common/ToastContainer';
import { LangKey } from '../hooks/useAdminLang';

// 디자인 시스템 - 컬러 팔레트
const colors = {
  primary: '#E5002B',
  secondary: '#F88D2A',
  black: '#111111',
  grayDark: '#444444',
  grayLight: '#F5F5F5',
  white: '#FFFFFF',
  grayMedium: '#888888',
  grayBorder: '#E0E0E0',
  success: '#28a745',
  error: '#dc3545',
  info: '#17a2b8'
};

// Quill 툴바 옵션 (통일된 포맷팅)
const quillModules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'header': 1 }, { 'header': 2 }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'align': [] }],
    ['link'],
    ['clean']
  ]
};

const formats = [
  'bold', 'italic', 'underline', 'strike', 'align', 'link', 'header', 'list', 'indent', 'clean'
];

// 로딩 스피너
const Spinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid ${colors.grayLight};
  border-top: 2px solid ${colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// 진행률 바
const ProgressBar = styled.div<{ $progress: number }>`
  width: 100%;
  height: 4px;
  background: ${colors.grayBorder};
  border-radius: 2px;
  overflow: hidden;
  margin: 8px 0;
  
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${({ $progress }) => $progress}%;
    background: ${colors.primary};
    transition: width 0.3s ease;
  }
`;

// 메인 레이아웃
const AdminLayout = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${colors.grayLight};
  position: relative;
`;

const AdminLogoutBtn = styled.button`
  position: fixed;
  top: 32px;
  right: 40px;
  z-index: 200;
  background: ${colors.white};
  border: 1px solid ${colors.grayBorder};
  border-radius: 8px;
  padding: 12px 24px;
  cursor: pointer;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  font-size: 1rem;
  color: ${colors.black};
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.2s ease;
  
  &:hover { 
    background: ${colors.primary}; 
    color: ${colors.white};
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }
`;

const AdminMain = styled.main`
  flex: 1;
  padding: 48px 50px 40px 50px;
  min-height: 100vh;
  max-width: 2100px;
  margin: 0 auto;
  
  @media (max-width: 900px) {
    padding: 24px 16px;
  }
`;

const AdminHeader = styled.header`
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 32px;
  color: ${colors.black};
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${colors.black};
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  margin-bottom: 24px;
  transition: color 0.2s ease;
  
  &:hover {
    color: ${colors.primary};
  }
`;

const AdminCard = styled.div`
  background: ${colors.white};
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 32px;
  max-width: 2100px;
  width: 100%;
  margin: 0 auto 32px auto;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    padding: 24px 20px;
  }
`;

const AdminLabel = styled.label`
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 8px;
  display: block;
  color: ${colors.black};
`;

const AdminInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 1rem;
  border: 1.5px solid ${colors.grayBorder};
  border-radius: 8px;
  margin-bottom: 24px;
  background: ${colors.white};
  box-sizing: border-box;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(229, 0, 43, 0.1);
  }
`;

export const AdminButton = styled.button<{ $primary?: boolean; $danger?: boolean; $loading?: boolean }>`
  width: 100%;
  padding: 14px 0;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  background: ${({ $primary, $danger, $loading }) => 
    $loading ? colors.grayMedium : $danger ? colors.error : $primary ? colors.primary : colors.grayLight};
  color: ${({ $primary, $danger, $loading }) => 
    $loading ? colors.grayDark : $danger ? colors.white : $primary ? colors.white : colors.black};
  margin-top: 12px;
  margin-bottom: 8px;
  cursor: ${({ $loading }) => $loading ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover { 
    background: ${({ $primary, $danger, $loading }) => 
      $loading ? colors.grayMedium : $danger ? '#c82333' : $primary ? '#c40023' : colors.grayBorder};
    transform: ${({ $loading }) => $loading ? 'none' : 'translateY(-1px)'};
    box-shadow: ${({ $loading }) => $loading ? 'none' : '0 4px 8px rgba(0,0,0,0.15)'};
  }
`;

const AdminQuill = styled(ReactQuill)`
  .ql-toolbar {
    border-radius: 8px 8px 0 0;
    background: ${colors.white};
    border: 1.5px solid ${colors.grayBorder};
    border-bottom: none;
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  
  .ql-container {
    border-radius: 0 0 8px 8px;
    border: 1.5px solid ${colors.grayBorder};
    min-height: 120px;
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 1rem;
    background: ${colors.white};
  }
  
  .ql-editor {
    line-height: 1.6;
  }
  
  .ql-editor:focus {
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(229, 0, 43, 0.1);
  }
  
  margin-bottom: 24px;
`;



const TabContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  border-bottom: 2px solid ${colors.grayBorder};
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 16px 32px;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  background: none;
  color: ${({ $active }) => $active ? colors.primary : colors.grayDark};
  cursor: pointer;
  border-bottom: 3px solid ${({ $active }) => $active ? colors.primary : 'transparent'};
  transition: all 0.3s ease;

  &:hover {
    color: ${colors.primary};
  }
`;

const DragDropContainer = styled.div`
  min-height: 200px;
  border: 2px dashed ${colors.grayBorder};
  border-radius: 8px;
  padding: 20px;
  background: ${colors.grayLight};
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const DragDropItem = styled.div<{ $isDragging: boolean }>`
  background: ${colors.white};
  border: 1px solid ${colors.grayBorder};
  border-radius: 8px;
  padding: 20px;
  cursor: move;
  transition: all 0.2s ease;
  opacity: ${({ $isDragging }) => $isDragging ? 0.5 : 1};
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    transform: translateY(-2px);
  }
`;

const ProductCard = styled.div`
  background: ${colors.white};
  border: 1px solid ${colors.grayBorder};
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    transform: translateY(-2px);
  }
`;

// 제품 카드 헤더 (접기/펼치기)
const ProductCardHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: ${colors.grayLight};
  border-bottom: 1px solid ${colors.grayBorder};
  cursor: pointer;
  transition: background 0.2s ease;
  
  &:hover {
    background: ${colors.grayBorder};
  }
`;

const ProductCardHeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
`;

const DragHandle = styled.div`
  color: ${colors.grayMedium};
  font-size: 18px;
  cursor: grab;
  padding: 4px;
  transition: color 0.2s ease;
  
  &:hover {
    color: ${colors.primary};
  }
  
  &:active {
    cursor: grabbing;
  }
`;

const ProductThumbnail = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid ${colors.grayBorder};
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const ProductName = styled.div`
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  font-size: 1.1rem;
  color: ${colors.black};
  margin-bottom: 4px;
`;

const ProductCategory = styled.div`
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.9rem;
  color: ${colors.grayMedium};
`;

const ModifiedIndicator = styled.div`
  width: 8px;
  height: 8px;
  background: ${colors.primary};
  border-radius: 50%;
  margin-left: 8px;
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: ${colors.grayMedium};
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${colors.grayBorder};
    color: ${colors.black};
  }
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: ${colors.error};
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${colors.error};
    color: ${colors.white};
    transform: scale(1.1);
  }
`;

// 제품 카드 본문 (접힌 상태에서는 숨김)
const ProductCardBody = styled.div<{ $expanded: boolean }>`
  padding: 20px;
  display: ${({ $expanded }) => $expanded ? 'block' : 'none'};
`;

const ProductImage = styled.img`
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid ${colors.grayBorder};
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const SmallButton = styled.button<{ $primary?: boolean; $danger?: boolean; $loading?: boolean }>`
  padding: 10px 20px;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  background: ${({ $primary, $danger, $loading }) => 
    $loading ? colors.grayMedium : $danger ? colors.error : $primary ? colors.primary : colors.grayLight};
  color: ${({ $primary, $danger, $loading }) => 
    $loading ? colors.grayDark : $danger ? colors.white : $primary ? colors.white : colors.black};
  cursor: ${({ $loading }) => $loading ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover { 
    background: ${({ $primary, $danger, $loading }) => 
      $loading ? colors.grayMedium : $danger ? '#c82333' : $primary ? '#c40023' : colors.grayBorder};
    transform: ${({ $loading }) => $loading ? 'none' : 'translateY(-1px)'};
    box-shadow: ${({ $loading }) => $loading ? 'none' : '0 2px 4px rgba(0,0,0,0.1)'};
  }
`;

// 전체 접기/펼치기 버튼
const ToggleAllButton = styled.button`
  background: ${colors.grayLight};
  border: 1px solid ${colors.grayBorder};
  border-radius: 8px;
  padding: 12px 20px;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: ${colors.black};
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 16px;
  
  &:hover {
    background: ${colors.grayBorder};
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
`;

// 그리드 레이아웃
const AdminGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  max-width: 1300px;
  width: 100%;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

// 타입 정의
interface Category {
  id: string;
  name: { en: string; ko: string };
  description: { en: string; ko: string };
  order: number;
}

interface Product {
  id: string;
  name: { en: string; ko: string };
  category: string;
  allergens?: { en: string; ko: string };
  ingredients?: { en: string; ko: string };
  nutrition?: { en: string; ko: string };
  image: string;
  order: number;
}

interface ProductPageData {
  slogan: { en: string; ko: string };
  subSlogan: { en: string; ko: string };
  bottomText: { en: string; ko: string };
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

type LabelField = 'allergens' | 'ingredients' | 'nutrition';

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

interface AdminProductManageProps {
  adminLang: LangKey;
}

const AdminProductManage: React.FC<AdminProductManageProps> = ({ adminLang }) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'products' | 'page' | 'bottomText'>('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [pageData, setPageData] = useState<ProductPageData>({
    slogan: { en: '', ko: '' },
    subSlogan: { en: '', ko: '' },
    bottomText: { en: '', ko: '' }
  });
  const [labelSettings, setLabelSettings] = useState<LabelSettings>(defaultLabels);
  const [msg, setMsg] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [savingProducts, setSavingProducts] = useState<Set<string>>(new Set());
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [modifiedProducts, setModifiedProducts] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<Toast[]>([]);

  // 새 카테고리/제품 상태
  const [newCategory, setNewCategory] = useState<Category>({ id: '', name: { en: '', ko: '' }, description: { en: '', ko: '' }, order: 0 });
  const [newProduct, setNewProduct] = useState<Product>({ id: '', name: { en: '', ko: '' }, category: '', allergens: { en: '', ko: '' }, ingredients: { en: '', ko: '' }, nutrition: { en: '', ko: '' }, image: '', order: 0 });

  // 토스트 알림 추가
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  // 제품 접기/펼치기 토글
  const toggleProduct = (productId: string) => {
    setExpandedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  // 모든 제품 접기/펼치기
  const toggleAllProducts = (expand: boolean) => {
    if (expand) {
      setExpandedProducts(new Set(products.map(p => p.id)));
    } else {
      setExpandedProducts(new Set());
    }
  };

  // 제품 수정 상태 추적
  const handleProductChange = (productId: string) => {
    setModifiedProducts(prev => new Set(prev).add(productId));
  };

  // 제품 수정 상태 초기화
  const clearModifiedStatus = (productId: string) => {
    setModifiedProducts(prev => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
  };

  // 카테고리 데이터 로드
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'productCategories'), (snapshot) => {
      const cats = snapshot.docs.map(doc => {
        const data = doc.data();
        // 마이그레이션: 기존 string이면 en으로 간주
        return {
          id: doc.id,
          name: typeof data.name === 'string' ? { en: data.name, ko: data.name } : { en: data.name?.en ?? '', ko: data.name?.ko ?? '' },
          description: typeof data.description === 'string' ? { en: data.description, ko: data.description } : { en: data.description?.en ?? '', ko: data.description?.ko ?? '' },
          order: data.order ?? 0
        };
      });
      cats.sort((a, b) => a.order - b.order);
      setCategories(cats);
    });

    return () => unsubscribe();
  }, [adminLang]);

  // 제품 데이터 로드
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      const prods = snapshot.docs.map(doc => {
        const data = doc.data();
        // 마이그레이션: 기존 string이면 en으로 간주
        return {
          id: doc.id,
          name: typeof data.name === 'string' ? { en: data.name, ko: data.name } : { en: data.name?.en ?? '', ko: data.name?.ko ?? '' },
          category: data.category || '',
          image: data.image || '',
          allergens: typeof data.allergens === 'string' ? { en: data.allergens, ko: data.allergens } : { en: data.allergens?.en ?? '', ko: data.allergens?.ko ?? '' },
          ingredients: typeof data.ingredients === 'string' ? { en: data.ingredients, ko: data.ingredients } : { en: data.ingredients?.en ?? '', ko: data.ingredients?.ko ?? '' },
          nutrition: typeof data.nutrition === 'string' ? { en: data.nutrition, ko: data.nutrition } : { en: data.nutrition?.en ?? '', ko: data.nutrition?.ko ?? '' },
          order: data.order ?? 0
        };
      });
      prods.sort((a, b) => a.order - b.order);
      setProducts(prods);
    });

    return () => unsubscribe();
  }, [adminLang]);

  // 페이지 데이터 로드
  useEffect(() => {
    const loadPageData = async () => {
      const docRef = doc(db, 'productPage', 'content');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        // 마이그레이션: 기존 string이면 en으로 간주
        setPageData({
          slogan: typeof data.slogan === 'string' ? { en: data.slogan, ko: '' } : { en: data.slogan?.en || '', ko: data.slogan?.ko || '' },
          subSlogan: typeof data.subSlogan === 'string' ? { en: data.subSlogan, ko: '' } : { en: data.subSlogan?.en || '', ko: data.subSlogan?.ko || '' },
          bottomText: typeof data.bottomText === 'string' ? { en: data.bottomText, ko: '' } : { en: data.bottomText?.en || '', ko: data.bottomText?.ko || '' }
        });
      }
    };

    loadPageData();
  }, [adminLang]);

  // 라벨 설정 로드
  useEffect(() => {
    const loadLabelSettings = async () => {
      try {
        const labelRef = doc(db, 'productPage', 'labels');
        const labelSnap = await getDoc(labelRef);
        if (labelSnap.exists()) {
          const data = labelSnap.data();
          setLabelSettings({
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
          });
        }
      } catch (error) {
        addToast('라벨 정보를 불러오지 못했습니다.', 'error');
      }
    };
    loadLabelSettings();
  }, []);

  // 카테고리 추가
  const handleAddCategory = async () => {
    if (!newCategory.name[adminLang].trim()) return;
    try {
      const order = categories.length;
      await addDoc(collection(db, 'productCategories'), { ...newCategory, order });
      setNewCategory({ name: { en: '', ko: '' }, description: { en: '', ko: '' }, id: '', order: 0 });
      addToast('카테고리가 추가되었습니다!');
    } catch (error) {
      addToast('카테고리 추가 중 오류가 발생했습니다.', 'error');
    }
  };

  // 카테고리 삭제
  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'productCategories', id));
      addToast('카테고리가 삭제되었습니다!');
    } catch (error) {
      addToast('카테고리 삭제 중 오류가 발생했습니다.', 'error');
    }
  };

  // 카테고리 순서 변경
  const handleCategoryReorder = async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    
    const newCategories = [...categories];
    const [moved] = newCategories.splice(fromIndex, 1);
    newCategories.splice(toIndex, 0, moved);
    
    try {
      await Promise.all(newCategories.map((cat, idx) => 
        updateDoc(doc(db, 'productCategories', cat.id), { order: idx })
      ));
      addToast('순서가 변경되었습니다.');
    } catch (error) {
      addToast('순서 변경 중 오류가 발생했습니다.', 'error');
    }
  };

  // 제품 추가
  const handleAddProduct = async () => {
    if (!newProduct.name[adminLang].trim() || !newProduct.category) return;
    try {
      const order = products.length;
      await addDoc(collection(db, 'products'), { ...newProduct, order });
      setNewProduct({ name: { en: '', ko: '' }, category: '', image: '', allergens: { en: '', ko: '' }, ingredients: { en: '', ko: '' }, nutrition: { en: '', ko: '' }, id: '', order: 0 });
      addToast('제품이 추가되었습니다!');
    } catch (error) {
      addToast('제품 추가 중 오류가 발생했습니다.', 'error');
    }
  };

  // 제품 삭제
  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      addToast('제품이 삭제되었습니다!');
    } catch (error) {
      addToast('제품 삭제 중 오류가 발생했습니다.', 'error');
    }
  };

  // 제품 순서 변경
  const handleProductReorder = async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    
    const newProducts = [...products];
    const [moved] = newProducts.splice(fromIndex, 1);
    newProducts.splice(toIndex, 0, moved);
    
    try {
      await Promise.all(newProducts.map((prod, idx) => 
        updateDoc(doc(db, 'products', prod.id), { order: idx })
      ));
      addToast('순서가 변경되었습니다.');
    } catch (error) {
      addToast('순서 변경 중 오류가 발생했습니다.', 'error');
    }
  };

  // 제품 저장
  const handleSaveProduct = async (product: Product) => {
    setSavingProducts(prev => new Set(prev).add(product.id));
    try {
      await setDoc(doc(db, 'products', product.id), product);
      // 라벨 설정도 함께 저장 (전역 설정이므로)
      await setDoc(doc(db, 'productPage', 'labels'), labelSettings, { merge: true });
      clearModifiedStatus(product.id);
      addToast('제품이 저장되었습니다!');
    } catch (error) {
      addToast('제품 저장 중 오류가 발생했습니다.', 'error');
    } finally {
      setSavingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }
  };

  // 이미지 업로드
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, productId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      const ext = file.name.split('.').pop();
      const uniqueName = `products/${productId || 'new'}_${Date.now()}.${ext}`;
      const fileStorageRef = storageRef(storage, uniqueName);
      
      // 업로드 진행률 시뮬레이션
      const uploadTask = uploadBytes(fileStorageRef, file);
      const interval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);
      
      await uploadTask;
      clearInterval(interval);
      setUploadProgress(100);
      
      const url = await getDownloadURL(fileStorageRef);
      
      if (productId) {
        setProducts(prev => prev.map(p => 
          p.id === productId ? { ...p, image: url } : p
        ));
        handleProductChange(productId);
      } else {
        setNewProduct(prev => ({ ...prev, image: url }));
      }
      
      addToast('이미지가 업로드되었습니다!');
    } catch (error) {
      addToast('이미지 업로드 중 오류가 발생했습니다.', 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // 줄바꿈을 HTML br 태그로 변환하는 함수
  const convertNewlinesToBr = (text: string): string => {
    return text.replace(/\n/g, '<br>');
  };

  const renderLabelInput = (field: LabelField) => (
    <AdminInput
      value={labelSettings[field][adminLang] || ''}
      onChange={e => handleLabelChange(field, e.target.value)}
      placeholder={`${defaultLabels[field][adminLang] || defaultLabels[field].en} 라벨`}
      style={{
        width: '260px',
        marginBottom: '8px',
        padding: '8px 12px',
        fontWeight: 600,
        fontSize: '1rem',
        borderColor: colors.grayBorder,
        background: colors.grayLight
      }}
    />
  );

  const handleLabelChange = (field: LabelField, value: string) => {
    setLabelSettings(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [adminLang]: value
      }
    }));
  };

  const handleSaveLabels = async () => {
    try {
      await setDoc(doc(db, 'productPage', 'labels'), labelSettings, { merge: true });
      addToast('라벨이 저장되었습니다!');
    } catch (error) {
      addToast('라벨 저장 중 오류가 발생했습니다.', 'error');
    }
  };

  // 페이지 데이터 저장
  const handleSavePageData = async () => {
    try {
      await setDoc(doc(db, 'productPage', 'content'), pageData);
      addToast('페이지 데이터가 저장되었습니다!');
    } catch (error) {
      addToast('저장 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleSaveBottomText = async () => {
    try {
      await setDoc(doc(db, 'productPage', 'content'), pageData);
      addToast('하단 문구가 저장되었습니다!');
    } catch (error) {
      addToast('저장 중 오류가 발생했습니다.', 'error');
    }
  };

  // 드래그 앤 드롭 핸들러
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (activeTab === 'categories') {
      handleCategoryReorder(fromIndex, toIndex);
    } else {
      handleProductReorder(fromIndex, toIndex);
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_login');
    window.location.href = '/admin/login';
  };

  return (
    <AdminLayout key={`product-manage-${adminLang}`}>
      <ToastContainer>
        {toasts.map(toast => (
          <Toast key={toast.id} $type={toast.type}>
            {toast.message}
          </Toast>
        ))}
      </ToastContainer>
      
      <AdminMain>
        <AdminHeader>Product 관리</AdminHeader>

        <TabContainer>
          <Tab 
            $active={activeTab === 'categories'} 
            onClick={() => setActiveTab('categories')}
          >
            카테고리 관리
          </Tab>
          <Tab 
            $active={activeTab === 'products'} 
            onClick={() => setActiveTab('products')}
          >
            제품 관리
          </Tab>
          <Tab 
            $active={activeTab === 'page'} 
            onClick={() => setActiveTab('page')}
          >
            페이지 설정
          </Tab>
          <Tab 
            $active={activeTab === 'bottomText'} 
            onClick={() => setActiveTab('bottomText')}
          >
            하단 문구 설정
          </Tab>
        </TabContainer>

        {activeTab === 'categories' && (
          <>
            <AdminCard>
              <AdminLabel>카테고리 추가</AdminLabel>
              <AdminGrid>
                <div>
                  <AdminInput
                    value={newCategory.name[adminLang]}
                    onChange={e => setNewCategory({ ...newCategory, name: { ...newCategory.name, [adminLang]: e.target.value }, description: newCategory.description, id: newCategory.id, order: newCategory.order })}
                    placeholder="카테고리명"
                  />
                  <AdminQuill
                    key={`new-category-${adminLang}`}
                    value={newCategory.description?.[adminLang] || ''}
                    onChange={value => setNewCategory({ 
                      ...newCategory, 
                      description: { ...(newCategory.description || { en: '', ko: '' }), [adminLang]: value } 
                    })}
                    modules={quillModules}
                    formats={formats}
                    theme="snow"
                    placeholder="카테고리 설명"
                  />
                  <AdminButton onClick={handleAddCategory} $primary>
                    카테고리 추가
                  </AdminButton>
                </div>
              </AdminGrid>
            </AdminCard>

            <AdminCard>
              <AdminLabel>카테고리 목록 (드래그하여 순서 변경)</AdminLabel>
              <DragDropContainer>
                {Array.isArray(categories) ? categories.map((category, index) => (
                  <DragDropItem
                    key={category.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    $isDragging={false}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                          <AdminLabel>카테고리명</AdminLabel>
                          <AdminInput
                            value={category.name[adminLang]}
                            onChange={e => setCategories(prev => prev.map((c, i) => i === index ? { ...c, name: { ...c.name, [adminLang]: e.target.value } } : c))}
                            placeholder="카테고리명"
                          />
                        </div>
                        <ButtonGroup>
                          <SmallButton $primary onClick={async () => {
                            // 수정: description을 문자열로 변환하지 않고 객체 그대로 저장하여 언어 데이터 보존
                            await setDoc(doc(db, 'productCategories', category.id), category);
                            addToast('카테고리가 저장되었습니다!');
                          }}>저장</SmallButton>
                          <SmallButton $danger onClick={() => handleDeleteCategory(category.id)}>삭제</SmallButton>
                        </ButtonGroup>
                      </div>
                      <div>
                        <AdminLabel>카테고리 설명</AdminLabel>
                        <AdminQuill
                          key={`${category.id}-${adminLang}`}
                          value={category.description?.[adminLang] || ''}
                          onChange={value => setCategories(prev => prev.map((c, i) => i === index ? { 
                            ...c, 
                            description: { ...(c.description || { en: '', ko: '' }), [adminLang]: value } 
                          } : c))}
                          modules={quillModules}
                          formats={formats}
                          theme="snow"
                          placeholder="카테고리 설명을 입력하세요..."
                          style={{ minHeight: '120px' }}
                        />
                      </div>
                    </div>
                  </DragDropItem>
                )) : null}
              </DragDropContainer>
            </AdminCard>
          </>
        )}

        {activeTab === 'products' && (
          <>
            <AdminCard>
              <AdminLabel>제품 추가</AdminLabel>
              <AdminGrid>
                <div>
                  <AdminInput
                    value={newProduct.name[adminLang]}
                    onChange={e => setNewProduct({ ...newProduct, name: { ...newProduct.name, [adminLang]: e.target.value }, allergens: newProduct.allergens, ingredients: newProduct.ingredients, nutrition: newProduct.nutrition, id: newProduct.id, order: newProduct.order, category: newProduct.category, image: newProduct.image })}
                    placeholder="제품명"
                  />
                  <select
                    value={newProduct.category}
                    onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: '1rem',
                      border: `1.5px solid ${colors.grayBorder}`,
                      borderRadius: '8px',
                      marginBottom: '24px',
                      background: colors.white,
                      transition: 'border-color 0.2s ease'
                    }}
                  >
                    <option value="">카테고리 선택</option>
                    {Array.isArray(categories) ? categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name[adminLang]}</option>
                    )) : null}
                  </select>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleImageUpload(e)}
                    disabled={uploading}
                    style={{ marginBottom: '16px' }}
                  />
                  {uploading && (
                    <div>
                      <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '4px' }}>
                        업로드 중... {uploadProgress}%
                      </div>
                      <ProgressBar $progress={uploadProgress} />
                    </div>
                  )}
                  {newProduct.image && (
                    <ProductImage src={newProduct.image} alt="미리보기" />
                  )}
                  <AdminButton onClick={handleAddProduct} $primary>
                    제품 추가
                  </AdminButton>
                </div>
                <div>
                  {renderLabelInput('allergens')}
                  <AdminQuill
                    key={`new-allergens-${adminLang}`}
                    value={newProduct.allergens?.[adminLang] || ''}
                    onChange={value => setNewProduct({ 
                      ...newProduct, 
                      allergens: { ...(newProduct.allergens || { en: '', ko: '' }), [adminLang]: value } 
                    })}
                    modules={quillModules}
                    formats={formats}
                    theme="snow"
                    placeholder="알레르기 정보"
                  />
                  {renderLabelInput('ingredients')}
                  <AdminQuill
                    key={`new-ingredients-${adminLang}`}
                    value={newProduct.ingredients?.[adminLang] || ''}
                    onChange={value => setNewProduct({ 
                      ...newProduct, 
                      ingredients: { ...(newProduct.ingredients || { en: '', ko: '' }), [adminLang]: value } 
                    })}
                    modules={quillModules}
                    formats={formats}
                    theme="snow"
                    placeholder="성분 정보"
                  />
                  {renderLabelInput('nutrition')}
                  <AdminQuill
                    key={`new-nutrition-${adminLang}`}
                    value={newProduct.nutrition?.[adminLang] || ''}
                    onChange={value => setNewProduct({ 
                      ...newProduct, 
                      nutrition: { ...(newProduct.nutrition || { en: '', ko: '' }), [adminLang]: value } 
                    })}
                    modules={quillModules}
                    formats={formats}
                    theme="snow"
                    placeholder="영양 정보"
                  />
                </div>
              </AdminGrid>
            </AdminCard>

            <AdminCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <AdminLabel>제품 목록 (드래그하여 순서 변경)</AdminLabel>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <ToggleAllButton onClick={() => toggleAllProducts(false)}>
                    모두 접기
                  </ToggleAllButton>
                  <ToggleAllButton onClick={() => toggleAllProducts(true)}>
                    모두 펼치기
                  </ToggleAllButton>
                </div>
              </div>
              <DragDropContainer>
                {Array.isArray(products) ? products.map((product, index) => (
                  <DragDropItem
                    key={product.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    $isDragging={false}
                  >
                    <ProductCard>
                      <ProductCardHeader onClick={() => toggleProduct(product.id)}>
                        <ProductCardHeaderContent>
                          <DragHandle>⋮⋮</DragHandle>
                          {product.image && (
                            <ProductThumbnail src={product.image} alt={product.name[adminLang]} />
                          )}
                          <ProductInfo>
                            <ProductName>
                              {product.name[adminLang] || '제품명 없음'}
                              {modifiedProducts.has(product.id) && <ModifiedIndicator />}
                            </ProductName>
                            <ProductCategory>{categories.find(c => c.id === product.category)?.name[adminLang] || '카테고리 없음'}</ProductCategory>
                          </ProductInfo>
                        </ProductCardHeaderContent>
                        <ToggleButton>
                          {expandedProducts.has(product.id) ? '−' : '+'}
                        </ToggleButton>
                        <DeleteButton onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProduct(product.id);
                        }}>
                          ×
                        </DeleteButton>
                      </ProductCardHeader>
                      
                      <ProductCardBody $expanded={expandedProducts.has(product.id)}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                          {product.image && (
                            <ProductImage src={product.image} alt={product.name[adminLang]} />
                          )}
                          <div style={{ flex: 1 }}>
                            <AdminInput
                              value={product.name[adminLang]}
                              onChange={e => {
                                setProducts(prev => prev.map((p, i) => i === index ? { ...p, name: { ...p.name, [adminLang]: e.target.value } } : p));
                                handleProductChange(product.id);
                              }}
                              placeholder="제품명"
                              style={{ marginBottom: 8 }}
                            />
                            <select
                              value={product.category}
                              onChange={e => {
                                setProducts(prev => prev.map((p, i) => i === index ? { ...p, category: e.target.value } : p));
                                handleProductChange(product.id);
                              }}
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
                                fontSize: '1rem',
                                border: `1.5px solid ${colors.grayBorder}`,
                                borderRadius: '8px',
                                marginBottom: '12px',
                                background: colors.white,
                                transition: 'border-color 0.2s ease'
                              }}
                            >
                              <option value="">카테고리 선택</option>
                              {Array.isArray(categories) ? categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name[adminLang]}</option>
                              )) : null}
                            </select>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={e => handleImageUpload(e, product.id)}
                              disabled={uploading}
                              style={{ marginBottom: '8px' }}
                            />
                            {uploading && (
                              <div>
                                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '4px' }}>
                                  업로드 중... {uploadProgress}%
                                </div>
                                <ProgressBar $progress={uploadProgress} />
                              </div>
                            )}
                            {renderLabelInput('allergens')}
                            <AdminQuill
                              key={`allergens-${product.id}-${adminLang}`}
                              value={product.allergens?.[adminLang] || ''}
                              onChange={value => {
                                setProducts(prev => prev.map((p, i) => i === index ? { 
                                  ...p, 
                                  allergens: { ...(p.allergens || { en: '', ko: '' }), [adminLang]: value } 
                                } : p));
                                handleProductChange(product.id);
                              }}
                              modules={quillModules}
                              formats={formats}
                              theme="snow"
                              placeholder="알레르기 정보"
                            />
                            {renderLabelInput('ingredients')}
                            <AdminQuill
                              key={`ingredients-${product.id}-${adminLang}`}
                              value={product.ingredients?.[adminLang] || ''}
                              onChange={value => {
                                setProducts(prev => prev.map((p, i) => i === index ? { 
                                  ...p, 
                                  ingredients: { ...(p.ingredients || { en: '', ko: '' }), [adminLang]: value } 
                                } : p));
                                handleProductChange(product.id);
                              }}
                              modules={quillModules}
                              formats={formats}
                              theme="snow"
                              placeholder="성분 정보"
                            />
                            {renderLabelInput('nutrition')}
                            <AdminQuill
                              key={`nutrition-${product.id}-${adminLang}`}
                              value={product.nutrition?.[adminLang] || ''}
                              onChange={value => {
                                setProducts(prev => prev.map((p, i) => i === index ? { 
                                  ...p, 
                                  nutrition: { ...(p.nutrition || { en: '', ko: '' }), [adminLang]: value } 
                                } : p));
                                handleProductChange(product.id);
                              }}
                              modules={quillModules}
                              formats={formats}
                              theme="snow"
                              placeholder="영양 정보"
                            />
                            <ButtonGroup>
                              <SmallButton 
                                $primary 
                                $loading={savingProducts.has(product.id)}
                                onClick={() => handleSaveProduct(product)}
                              >
                                {savingProducts.has(product.id) ? (
                                  <>
                                    <Spinner />
                                    저장 중...
                                  </>
                                ) : (
                                  '저장'
                                )}
                              </SmallButton>
                            </ButtonGroup>
                          </div>
                        </div>
                      </ProductCardBody>
                    </ProductCard>
                  </DragDropItem>
                )) : null}
              </DragDropContainer>
            </AdminCard>
          </>
        )}

        {activeTab === 'page' && (
          <>
            <AdminCard>
              <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
                <AdminLabel>페이지 슬로건</AdminLabel>
                <div style={{ width: '100%' }}>
                  <AdminQuill
                    key={`page-slogan-${adminLang}`}
                    value={pageData.slogan[adminLang]}
                    onChange={value => setPageData(prev => ({ ...prev, slogan: { ...prev.slogan, [adminLang]: value } }))}
                    modules={quillModules}
                    formats={formats}
                    theme="snow"
                    placeholder="메인 슬로건"
                    style={{ width: '100%' }}
                  />
                </div>
                <AdminLabel>페이지 서브 슬로건</AdminLabel>
                <div style={{ width: '100%' }}>
                  <AdminQuill
                    key={`page-sub-slogan-${adminLang}`}
                    value={pageData.subSlogan[adminLang]}
                    onChange={value => setPageData(prev => ({ ...prev, subSlogan: { ...prev.subSlogan, [adminLang]: value } }))}
                    modules={quillModules}
                    formats={formats}
                    theme="snow"
                    placeholder="서브 슬로건"
                    style={{ width: '100%' }}
                  />
                </div>
                <div style={{ width: '100%' }}>
                  <AdminButton onClick={handleSavePageData} $primary style={{ width: '100%', marginTop: 24 }}>
                    페이지 데이터 저장
                  </AdminButton>
                </div>
              </div>
              <div style={{ maxWidth: 1440, margin: '40px auto 0 auto', background: '#fdf8f3', border: `1px solid ${colors.grayBorder}`, borderRadius: '12px', padding: '48px 32px', minHeight: '200px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
                <AdminLabel style={{ fontWeight: 700, fontSize: 18, color: colors.black, marginBottom: 24, display: 'block' }}>실시간 Preview</AdminLabel>
                <div style={{
                  fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#5a3723',
                  marginBottom: '16px',
                  lineHeight: '1.4',
                  textAlign: 'center'
                }}
                dangerouslySetInnerHTML={{ __html: convertNewlinesToBr(pageData.slogan[adminLang]) }}
                />
                <div style={{
                  fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: '1.13rem',
                  fontWeight: '500',
                  color: '#8c6450',
                  lineHeight: '1.45',
                  textAlign: 'center',
                  maxWidth: 1200,
                  margin: '0 auto',
                  padding: '0 10px',
                  whiteSpace: 'pre-line'
                }}
                dangerouslySetInnerHTML={{ __html: convertNewlinesToBr(pageData.subSlogan[adminLang]) }}
                />
              </div>
            </AdminCard>
            <AdminCard>
              <AdminLabel>제품 정보 라벨 설정</AdminLabel>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginTop: '16px' }}>
                <div>
                  <span style={{ fontWeight: 600, color: colors.grayDark, fontSize: '0.95rem', display: 'block', marginBottom: 4 }}>
                    Allergens
                  </span>
                  <AdminInput
                    value={labelSettings.allergens[adminLang] || ''}
                    onChange={e => handleLabelChange('allergens', e.target.value)}
                    placeholder="Allergens 라벨"
                  />
                </div>
                <div>
                  <span style={{ fontWeight: 600, color: colors.grayDark, fontSize: '0.95rem', display: 'block', marginBottom: 4 }}>
                    Ingredients
                  </span>
                  <AdminInput
                    value={labelSettings.ingredients[adminLang] || ''}
                    onChange={e => handleLabelChange('ingredients', e.target.value)}
                    placeholder="Ingredients 라벨"
                  />
                </div>
                <div>
                  <span style={{ fontWeight: 600, color: colors.grayDark, fontSize: '0.95rem', display: 'block', marginBottom: 4 }}>
                    Nutrition Facts
                  </span>
                    <AdminInput
                      value={labelSettings.nutrition[adminLang] || ''}
                      onChange={e => handleLabelChange('nutrition', e.target.value)}
                      placeholder="Nutrition Facts 라벨"
                    />
                </div>
              </div>
              <AdminButton onClick={handleSaveLabels} $primary style={{ width: '220px', marginTop: 24 }}>
                라벨 저장
              </AdminButton>
            </AdminCard>
          </>
        )}

        {activeTab === 'bottomText' && (
          <>
            <AdminCard>
              <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
                <AdminLabel>하단 문구</AdminLabel>
                <div style={{ width: '100%' }}>
                  <AdminQuill
                    key={`bottom-${adminLang}`}
                    value={pageData.bottomText[adminLang]}
                    onChange={value => setPageData(prev => ({ ...prev, bottomText: { ...prev.bottomText, [adminLang]: value } }))}
                    modules={quillModules}
                    formats={formats}
                    theme="snow"
                    placeholder="하단 문구를 입력하세요..."
                    style={{ width: '100%' }}
                  />
                </div>
                <div style={{ width: '100%' }}>
                  <AdminButton onClick={handleSaveBottomText} $primary style={{ width: '100%', marginTop: 24 }}>
                    하단 문구 저장
                  </AdminButton>
                </div>
              </div>
              <div style={{ 
                maxWidth: 1440, 
                margin: '40px auto 0 auto', 
                background: 'linear-gradient(135deg, #fdf8f3 0%, #f9f2e8 100%)', 
                border: `1px solid ${colors.grayBorder}`, 
                borderRadius: '20px', 
                padding: '48px 32px', 
                minHeight: '200px', 
                boxShadow: '0 8px 32px rgba(90, 55, 35, 0.08)',
                position: 'relative',
                overflow: 'hidden'
              }}>

                <AdminLabel style={{ fontWeight: 700, fontSize: 18, color: colors.black, marginBottom: 24, display: 'block' }}>실시간 Preview</AdminLabel>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '100%'
                }}>
                  <div style={{
                    fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
                    fontSize: '1.58rem',
                    fontWeight: '600',
                    color: '#5a3723',
                    lineHeight: '1.7',
                    textAlign: 'center',
                    maxWidth: 1440,
                    margin: '24px auto 32px auto',
                    padding: '24px 32px',
                    whiteSpace: 'pre-line',
                    background: 'rgba(255, 255, 255, 0.7)',
                    borderRadius: '16px',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 20px rgba(90, 55, 35, 0.1)',
                    border: '1px solid rgba(90, 55, 35, 0.1)',
                    position: 'relative'
                  }}
                  dangerouslySetInnerHTML={{ __html: convertNewlinesToBr(pageData.bottomText[adminLang]) }}
                  />
                  <button 
                    style={{
                      background: 'linear-gradient(135deg, #5a3723 0%, #7a5a3a 100%)',
                      color: '#fff',
                      border: 'none',
                      padding: '14px 36px',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 16px rgba(90, 55, 35, 0.25)',
                      marginTop: '16px'
                    }}
                  >
                    More &gt;&gt;
                  </button>
                </div>
              </div>
            </AdminCard>
          </>
        )}
      </AdminMain>
    </AdminLayout>
  );
};
  
export default AdminProductManage; 