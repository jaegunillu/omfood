import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { collection, onSnapshot, doc, setDoc, addDoc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Quill 툴바 옵션
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link', 'color', 'background'],
    ['clean']
  ]
};

// 토스트 알림 컴포넌트
const ToastContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 3000;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Toast = styled.div<{ $type: 'success' | 'error' | 'info' }>`
  background: ${({ $type }) => 
    $type === 'success' ? '#28a745' : 
    $type === 'error' ? '#dc3545' : '#17a2b8'};
  color: white;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  font-weight: 500;
  min-width: 300px;
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

// 로딩 스피너
const Spinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #1976d2;
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
  background: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
  margin: 8px 0;
  
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${({ $progress }) => $progress}%;
    background: #1976d2;
    transition: width 0.3s ease;
  }
`;

// 스타일 컴포넌트
const AdminLayout = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f7f7f7;
  position: relative;
`;

const AdminLogoutBtn = styled.button`
  position: fixed;
  top: 32px;
  right: 40px;
  z-index: 200;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px 32px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  color: #222;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: background 0.2s, color 0.2s;
  &:hover { background: #ffd600; color: #222; }
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
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 32px;
  color: #222;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #222;
  font-size: 16px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  margin-bottom: 24px;
  &:hover {
    color: #666;
  }
`;

const AdminCard = styled.div`
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  padding: 40px;
  max-width: 1300px;
  width: 100%;
  margin: 0 auto 40px auto;
  box-sizing: border-box;
`;

const AdminLabel = styled.label`
  font-weight: 700;
  font-size: 1.08rem;
  margin-bottom: 8px;
  display: block;
  color: #222;
`;

const AdminInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  font-size: 1.08rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 24px;
  background: #fafbfc;
  box-sizing: border-box;
`;

const AdminButton = styled.button<{ $primary?: boolean; $danger?: boolean; $loading?: boolean }>`
  width: 100%;
  padding: 14px 0;
  font-size: 1.1rem;
  font-weight: 700;
  border-radius: 10px;
  border: none;
  background: ${({ $primary, $danger, $loading }) => 
    $loading ? '#ccc' : $danger ? '#dc3545' : $primary ? '#1976d2' : '#f5f5f5'};
  color: ${({ $primary, $danger, $loading }) => 
    $loading ? '#666' : $danger ? '#fff' : $primary ? '#fff' : '#222'};
  margin-top: 12px;
  margin-bottom: 8px;
  cursor: ${({ $loading }) => $loading ? 'not-allowed' : 'pointer'};
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  &:hover { 
    background: ${({ $primary, $danger, $loading }) => 
      $loading ? '#ccc' : $danger ? '#c82333' : $primary ? '#1251a3' : '#e0e0e0'}; 
  }
`;

const AdminQuill = styled(ReactQuill)`
  .ql-toolbar {
    border-radius: 8px 8px 0 0;
    background: #fafbfc;
    border: 1.5px solid #e0e0e0;
    border-bottom: none;
  }
  .ql-container {
    border-radius: 0 0 8px 8px;
    border: 1.5px solid #e0e0e0;
    min-height: 120px;
    font-size: 1.08rem;
    background: #fff;
  }
  margin-bottom: 24px;
`;

const AdminGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  max-width: 1300px;
  width: 100%;
  margin: 0 auto;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  border-bottom: 2px solid #f0f0f0;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 16px 32px;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  background: none;
  color: ${({ $active }) => $active ? '#1976d2' : '#666'};
  cursor: pointer;
  border-bottom: 3px solid ${({ $active }) => $active ? '#1976d2' : 'transparent'};
  transition: all 0.3s;

  &:hover {
    color: #1976d2;
  }
`;

const DragDropContainer = styled.div`
  min-height: 200px;
  border: 2px dashed #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  background: #fafbfc;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const DragDropItem = styled.div<{ $isDragging: boolean }>`
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  cursor: move;
  transition: all 0.2s;
  opacity: ${({ $isDragging }) => $isDragging ? 0.5 : 1};
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

const ProductCard = styled.div`
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

// 제품 카드 헤더 (접기/펼치기)
const ProductCardHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #e9ecef;
  }
`;

const ProductCardHeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
`;

const DragHandle = styled.div`
  color: #999;
  font-size: 18px;
  cursor: grab;
  padding: 4px;
  
  &:active {
    cursor: grabbing;
  }
`;

const ProductThumbnail = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const ProductName = styled.div`
  font-weight: 600;
  font-size: 1.1rem;
  color: #222;
  margin-bottom: 4px;
`;

const ProductCategory = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const ModifiedIndicator = styled.div`
  width: 8px;
  height: 8px;
  background: #1976d2;
  border-radius: 50%;
  margin-left: 8px;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: #666;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  
  &:hover {
    background: #e0e0e0;
    color: #333;
  }
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #dc3545;
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s;
  
  &:hover {
    background: #dc3545;
    color: white;
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
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  margin-bottom: 16px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const SmallButton = styled.button<{ $primary?: boolean; $danger?: boolean; $loading?: boolean }>`
  padding: 10px 20px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  background: ${({ $primary, $danger, $loading }) => 
    $loading ? '#ccc' : $danger ? '#dc3545' : $primary ? '#1976d2' : '#f5f5f5'};
  color: ${({ $primary, $danger, $loading }) => 
    $loading ? '#666' : $danger ? '#fff' : $primary ? '#fff' : '#222'};
  cursor: ${({ $loading }) => $loading ? 'not-allowed' : 'pointer'};
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover { 
    background: ${({ $primary, $danger, $loading }) => 
      $loading ? '#ccc' : $danger ? '#c82333' : $primary ? '#1251a3' : '#e0e0e0'}; 
  }
`;

// 전체 접기/펼치기 버튼
const ToggleAllButton = styled.button`
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 16px;
  
  &:hover {
    background: #e9ecef;
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <AdminInput
                        value={category.name}
                        onChange={e => setCategories(prev => prev.map((c, i) => i === index ? { ...c, name: e.target.value } : c))}
                        placeholder="카테고리명"
                        style={{ marginBottom: 6 }}
                      />
                      <AdminQuill
                        value={category.description || ''}
                        onChange={value => setCategories(prev => prev.map((c, i) => i === index ? { ...c, description: value } : c))}
                        modules={quillModules}
                        theme="snow"
                        placeholder="카테고리 설명"
                      />
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
                      fontSize: '1.08rem',
                      border: '1.5px solid #e0e0e0',
                      borderRadius: '8px',
                      marginBottom: '24px',
                      background: '#fafbfc'
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
                                fontSize: '1.08rem',
                                border: '1.5px solid #e0e0e0',
                                borderRadius: '8px',
                                marginBottom: '12px',
                                background: '#fafbfc'
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
          <AdminCard>
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
          </AdminCard>
        )}
      </AdminMain>
    </AdminLayout>
  );
};

export default AdminProductManage; 