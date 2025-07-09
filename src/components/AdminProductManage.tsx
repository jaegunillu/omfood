import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { collection, onSnapshot, doc, setDoc, addDoc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useToast } from './common/ToastContext';
import Toast from './common/Toast';
import ToastContainer from './common/ToastContainer';

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
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link'],
    ['clean']
  ]
};

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
  max-width: 1400px;
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
  max-width: 1300px;
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

const AdminButton = styled.button<{ $primary?: boolean; $danger?: boolean; $loading?: boolean }>`
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

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const AdminProductManage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'categories' | 'products' | 'page'>('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [pageData, setPageData] = useState<ProductPageData>({
    slogan: 'Signature Flavors. Global Standards.',
    subSlogan: 'OM FOOD supplies sauces and seasoning powders to its overseas stores in Taiwan, Vietnam, and Mongolia, as well as to local Korean restaurants and various kitchens abroad. Crafted to capture the rich, authentic flavors of Korean cuisine while blending seamlessly into local food cultures, these products win over local palates and further enhance the value and appeal of K-Food.'
  });
  const [msg, setMsg] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [savingProducts, setSavingProducts] = useState<Set<string>>(new Set());
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [modifiedProducts, setModifiedProducts] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<Toast[]>([]);

  // 새 카테고리/제품 상태
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    image: '',
    allergens: '',
    ingredients: '',
    nutrition: ''
  });

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
      const cats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Category));
      cats.sort((a, b) => a.order - b.order);
      setCategories(cats);
    });

    return () => unsubscribe();
  }, []);

  // 제품 데이터 로드
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

  // 페이지 데이터 로드
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

  // 카테고리 추가
  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) return;
    try {
      const order = categories.length;
      const processedCategory = {
        ...newCategory,
        description: newCategory.description ? convertNewlinesToBr(newCategory.description) : '',
        order
      };
      await addDoc(collection(db, 'productCategories'), processedCategory);
      setNewCategory({ name: '', description: '' });
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
    if (!newProduct.name.trim() || !newProduct.category) return;
    try {
      const order = products.length;
      await addDoc(collection(db, 'products'), { ...newProduct, order });
      setNewProduct({
        name: '',
        category: '',
        image: '',
        allergens: '',
        ingredients: '',
        nutrition: ''
      });
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

  // 페이지 데이터 저장
  const handleSavePageData = async () => {
    try {
      const processedData = {
        slogan: convertNewlinesToBr(pageData.slogan),
        subSlogan: convertNewlinesToBr(pageData.subSlogan)
      };
      await setDoc(doc(db, 'productPage', 'content'), processedData);
      addToast('페이지 데이터가 저장되었습니다!');
    } catch (error) {
      addToast('페이지 데이터 저장 중 오류가 발생했습니다.', 'error');
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
    <AdminLayout>
      <ToastContainer>
        {toasts.map(toast => (
          <Toast key={toast.id} $type={toast.type}>
            {toast.message}
          </Toast>
        ))}
      </ToastContainer>
      
      <AdminMain>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <BackButton onClick={() => window.history.back()}>
            <span style={{ fontSize: 20 }}>←</span> 대시보드로
          </BackButton>
          <AdminLogoutBtn onClick={logout}>로그아웃</AdminLogoutBtn>
        </div>

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
        </TabContainer>

        {activeTab === 'categories' && (
          <>
            <AdminCard>
              <AdminLabel>카테고리 추가</AdminLabel>
              <AdminGrid>
                <div>
                  <AdminInput
                    value={newCategory.name}
                    onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="카테고리명"
                  />
                  <AdminQuill
                    value={newCategory.description}
                    onChange={value => setNewCategory({ ...newCategory, description: value })}
                    modules={quillModules}
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
                {categories.map((category, index) => (
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
                            value={category.name}
                            onChange={e => setCategories(prev => prev.map((c, i) => i === index ? { ...c, name: e.target.value } : c))}
                            placeholder="카테고리명"
                          />
                        </div>
                        <ButtonGroup>
                          <SmallButton $primary onClick={async () => {
                            const processedCategory = {
                              ...category,
                              description: category.description ? convertNewlinesToBr(category.description) : ''
                            };
                            await setDoc(doc(db, 'productCategories', category.id), processedCategory);
                            addToast('카테고리가 저장되었습니다!');
                          }}>저장</SmallButton>
                          <SmallButton $danger onClick={() => handleDeleteCategory(category.id)}>삭제</SmallButton>
                        </ButtonGroup>
                      </div>
                      <div>
                        <AdminLabel>카테고리 설명</AdminLabel>
                        <AdminQuill
                          value={category.description || ''}
                          onChange={value => setCategories(prev => prev.map((c, i) => i === index ? { ...c, description: value } : c))}
                          modules={quillModules}
                          theme="snow"
                          placeholder="카테고리 설명을 입력하세요..."
                          style={{ minHeight: '120px' }}
                        />
                      </div>
                    </div>
                  </DragDropItem>
                ))}
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
                    value={newProduct.name}
                    onChange={e => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="제품명"
                  />
                  <select
                    value={newProduct.category}
                    onChange={e => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
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
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
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
                  <AdminLabel>Allergens</AdminLabel>
                  <AdminQuill
                    value={newProduct.allergens}
                    onChange={value => setNewProduct(prev => ({ ...prev, allergens: value }))}
                    modules={quillModules}
                    theme="snow"
                    placeholder="알레르기 정보"
                  />
                  <AdminLabel>Ingredients</AdminLabel>
                  <AdminQuill
                    value={newProduct.ingredients}
                    onChange={value => setNewProduct(prev => ({ ...prev, ingredients: value }))}
                    modules={quillModules}
                    theme="snow"
                    placeholder="성분 정보"
                  />
                  <AdminLabel>Nutrition Facts</AdminLabel>
                  <AdminQuill
                    value={newProduct.nutrition}
                    onChange={value => setNewProduct(prev => ({ ...prev, nutrition: value }))}
                    modules={quillModules}
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
                {products.map((product, index) => (
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
                            <ProductThumbnail src={product.image} alt={product.name} />
                          )}
                          <ProductInfo>
                            <ProductName>
                              {product.name || '제품명 없음'}
                              {modifiedProducts.has(product.id) && <ModifiedIndicator />}
                            </ProductName>
                            <ProductCategory>{product.category || '카테고리 없음'}</ProductCategory>
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
                            <ProductImage src={product.image} alt={product.name} />
                          )}
                          <div style={{ flex: 1 }}>
                            <AdminInput
                              value={product.name}
                              onChange={e => {
                                setProducts(prev => prev.map((p, i) => i === index ? { ...p, name: e.target.value } : p));
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
                              {categories.map(cat => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                              ))}
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
                            <AdminLabel>Allergens</AdminLabel>
                            <AdminQuill
                              value={product.allergens || ''}
                              onChange={value => {
                                setProducts(prev => prev.map((p, i) => i === index ? { ...p, allergens: value } : p));
                                handleProductChange(product.id);
                              }}
                              modules={quillModules}
                              theme="snow"
                              placeholder="알레르기 정보"
                            />
                            <AdminLabel>Ingredients</AdminLabel>
                            <AdminQuill
                              value={product.ingredients || ''}
                              onChange={value => {
                                setProducts(prev => prev.map((p, i) => i === index ? { ...p, ingredients: value } : p));
                                handleProductChange(product.id);
                              }}
                              modules={quillModules}
                              theme="snow"
                              placeholder="성분 정보"
                            />
                            <AdminLabel>Nutrition Facts</AdminLabel>
                            <AdminQuill
                              value={product.nutrition || ''}
                              onChange={value => {
                                setProducts(prev => prev.map((p, i) => i === index ? { ...p, nutrition: value } : p));
                                handleProductChange(product.id);
                              }}
                              modules={quillModules}
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
                ))}
              </DragDropContainer>
            </AdminCard>
          </>
        )}

        {activeTab === 'page' && (
          <>
            <AdminCard>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                <div>
                  <AdminLabel>페이지 슬로건</AdminLabel>
                  <AdminQuill
                    value={pageData.slogan}
                    onChange={value => setPageData(prev => ({ ...prev, slogan: value }))}
                    modules={quillModules}
                    theme="snow"
                    placeholder="메인 슬로건"
                  />
                  <AdminLabel>페이지 서브 슬로건</AdminLabel>
                  <AdminQuill
                    value={pageData.subSlogan}
                    onChange={value => setPageData(prev => ({ ...prev, subSlogan: value }))}
                    modules={quillModules}
                    theme="snow"
                    placeholder="서브 슬로건"
                  />
                  <AdminButton onClick={handleSavePageData} $primary>
                    페이지 데이터 저장
                  </AdminButton>
                </div>
                <div>
                  <AdminLabel>실시간 Preview</AdminLabel>
                  <div style={{
                    background: colors.white,
                    border: `1px solid ${colors.grayBorder}`,
                    borderRadius: '8px',
                    padding: '24px',
                    minHeight: '200px'
                  }}>
                    <div style={{
                      fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: '2rem',
                      fontWeight: '700',
                      color: colors.black,
                      marginBottom: '16px',
                      lineHeight: '1.4'
                    }}
                    dangerouslySetInnerHTML={{ __html: convertNewlinesToBr(pageData.slogan) }}
                    />
                    <div style={{
                      fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: '1.2rem',
                      fontWeight: '500',
                      color: colors.grayDark,
                      lineHeight: '1.6'
                    }}
                    dangerouslySetInnerHTML={{ __html: convertNewlinesToBr(pageData.subSlogan) }}
                    />
                  </div>
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