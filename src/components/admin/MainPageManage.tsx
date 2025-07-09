import React, { useState, useEffect } from 'react';
import { collection, doc, getDocs, updateDoc, deleteDoc, addDoc, orderBy, query } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../firebase';
import Accordion from '../common/Accordion';
import DragDropList from '../common/DragDropList';
import ImageUploader from '../common/ImageUploader';
import Button from '../common/Button';
import { useToast } from '../common/ToastContext';

interface HeaderData {
  id: string;
  logo: string;
  order: number;
}

interface SectionData {
  id: string;
  title: string;
  content: string;
  order: number;
}

interface SloganData {
  id: string;
  text: string;
  order: number;
}

interface StoreData {
  id: string;
  name: string;
  location: string;
  image: string;
  order: number;
}

interface BrandData {
  id: string;
  name: string;
  description: string;
  image: string;
  order: number;
}

const MainPageManage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('header');
  const [loading, setLoading] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  
  const [headers, setHeaders] = useState<HeaderData[]>([]);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [slogans, setSlogans] = useState<SloganData[]>([]);
  const [stores, setStores] = useState<StoreData[]>([]);
  const [brands, setBrands] = useState<BrandData[]>([]);
  
  const { success, error, info } = useToast();

  const tabs = [
    { id: 'header', name: '헤더 영역', icon: '🏠' },
    { id: 'sections', name: '섹션 관리', icon: '📄' },
    { id: 'slogans', name: '슬로건 관리', icon: '💬' },
    { id: 'stores', name: '스토어 관리', icon: '🏪' },
    { id: 'brands', name: '브랜드 관리', icon: '🏢' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // 헤더 데이터 로드
      const headerQuery = query(collection(db, 'headers'), orderBy('order'));
      const headerSnapshot = await getDocs(headerQuery);
      const headerData = headerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HeaderData));
      setHeaders(headerData);

      // 섹션 데이터 로드
      const sectionQuery = query(collection(db, 'sections'), orderBy('order'));
      const sectionSnapshot = await getDocs(sectionQuery);
      const sectionData = sectionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SectionData));
      setSections(sectionData);

      // 슬로건 데이터 로드
      const sloganQuery = query(collection(db, 'slogans'), orderBy('order'));
      const sloganSnapshot = await getDocs(sloganQuery);
      const sloganData = sloganSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SloganData));
      setSlogans(sloganData);

      // 스토어 데이터 로드
      const storeQuery = query(collection(db, 'stores'), orderBy('order'));
      const storeSnapshot = await getDocs(storeQuery);
      const storeData = storeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StoreData));
      setStores(storeData);

      // 브랜드 데이터 로드
      const brandQuery = query(collection(db, 'brands'), orderBy('order'));
      const brandSnapshot = await getDocs(brandQuery);
      const brandData = brandSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BrandData));
      setBrands(brandData);
    } catch (error: any) {
      console.error('데이터 로드 실패:', error);
      error('데이터 로드에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File, collectionName: string, itemId: string, fieldName: string) => {
    try {
      const storageRef = ref(storage, `${collectionName}/${itemId}/${fieldName}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      const docRef = doc(db, collectionName, itemId);
      await updateDoc(docRef, { [fieldName]: downloadURL });
      
      success('이미지가 업로드되었습니다.');
      loadData();
    } catch (error: any) {
      console.error('이미지 업로드 실패:', error);
      error('이미지 업로드에 실패했습니다.');
    }
  };

  const handleReorder = async (items: any[], collectionName: string, setter: React.Dispatch<React.SetStateAction<any[]>>) => {
    try {
      const updatedItems = items.map((item, index) => ({ ...item, order: index }));
      setter(updatedItems);
      
      // Firestore 업데이트
      for (const item of updatedItems) {
        const docRef = doc(db, collectionName, item.id);
        await updateDoc(docRef, { order: item.order });
      }
      
      success('순서가 변경되었습니다.');
    } catch (error: any) {
      console.error('순서 변경 실패:', error);
      error('순서 변경에 실패했습니다.');
    }
  };

  const handleDelete = async (id: string, collectionName: string, setter: React.Dispatch<React.SetStateAction<any[]>>, currentItems: any[]) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      await deleteDoc(doc(db, collectionName, id));
      const updatedItems = currentItems.filter(item => item.id !== id);
      setter(updatedItems);
      success('삭제되었습니다.');
    } catch (error: any) {
      console.error('삭제 실패:', error);
      error('삭제에 실패했습니다.');
    }
  };

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const renderHeaderManagement = () => (
    <div className="space-y-6">
      <Accordion
        title="로고 업로드"
        defaultExpanded={true}
        className="mb-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {headers.map((header) => (
            <div key={header.id} className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 font-pretendard">로고 {header.order + 1}</h4>
              <ImageUploader
                currentImage={header.logo}
                onImageUpload={(file) => handleImageUpload(file, 'headers', header.id, 'logo')}
                label="로고 이미지"
              />
            </div>
          ))}
        </div>
      </Accordion>
    </div>
  );

  const renderSectionManagement = () => (
    <div className="space-y-6">
      <DragDropList
        items={sections}
        onReorder={(items) => handleReorder(items, 'sections', setSections)}
        renderItem={(section, index) => (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 font-pretendard">
                섹션 {index + 1}: {section.title}
              </h4>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(section.id, 'sections', setSections, sections)}
              >
                삭제
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-pretendard">제목</label>
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => {
                    const updated = sections.map(s => 
                      s.id === section.id ? { ...s, title: e.target.value } : s
                    );
                    setSections(updated);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-pretendard">내용</label>
                <textarea
                  value={section.content}
                  onChange={(e) => {
                    const updated = sections.map(s => 
                      s.id === section.id ? { ...s, content: e.target.value } : s
                    );
                    setSections(updated);
                  }}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );

  const renderSloganManagement = () => (
    <div className="space-y-6">
      <DragDropList
        items={slogans}
        onReorder={(items) => handleReorder(items, 'slogans', setSlogans)}
        renderItem={(slogan, index) => (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 font-pretendard">
                슬로건 {index + 1}
              </h4>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(slogan.id, 'slogans', setSlogans, slogans)}
              >
                삭제
              </Button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-pretendard">슬로건 텍스트</label>
              <input
                type="text"
                value={slogan.text}
                onChange={(e) => {
                  const updated = slogans.map(s => 
                    s.id === slogan.id ? { ...s, text: e.target.value } : s
                  );
                  setSlogans(updated);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      />
    </div>
  );

  const renderStoreManagement = () => (
    <div className="space-y-6">
      <DragDropList
        items={stores}
        onReorder={(items) => handleReorder(items, 'stores', setStores)}
        renderItem={(store, index) => (
          <Accordion
            title={`스토어 ${index + 1}: ${store.name}`}
            defaultExpanded={expandedItems.has(store.id)}
            onToggle={(expanded) => {
              if (expanded) {
                setExpandedItems(prev => new Set([...Array.from(prev), store.id]));
              } else {
                setExpandedItems(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(store.id);
                  return newSet;
                });
              }
            }}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-pretendard">스토어명</label>
                  <input
                    type="text"
                    value={store.name}
                    onChange={(e) => {
                      const updated = stores.map(s => 
                        s.id === store.id ? { ...s, name: e.target.value } : s
                      );
                      setStores(updated);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-pretendard">위치</label>
                  <input
                    type="text"
                    value={store.location}
                    onChange={(e) => {
                      const updated = stores.map(s => 
                        s.id === store.id ? { ...s, location: e.target.value } : s
                      );
                      setStores(updated);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
              <ImageUploader
                currentImage={store.image}
                onImageUpload={(file) => handleImageUpload(file, 'stores', store.id, 'image')}
                label="스토어 이미지"
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(store.id, 'stores', setStores, stores)}
                >
                  삭제
                </Button>
              </div>
            </div>
          </Accordion>
        )}
      />
    </div>
  );

  const renderBrandManagement = () => (
    <div className="space-y-6">
      <DragDropList
        items={brands}
        onReorder={(items) => handleReorder(items, 'brands', setBrands)}
        renderItem={(brand, index) => (
          <Accordion
            title={`브랜드 ${index + 1}: ${brand.name}`}
            defaultExpanded={expandedItems.has(brand.id)}
            onToggle={(expanded) => {
              if (expanded) {
                setExpandedItems(prev => new Set([...Array.from(prev), brand.id]));
              } else {
                setExpandedItems(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(brand.id);
                  return newSet;
                });
              }
            }}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-pretendard">브랜드명</label>
                  <input
                    type="text"
                    value={brand.name}
                    onChange={(e) => {
                      const updated = brands.map(b => 
                        b.id === brand.id ? { ...b, name: e.target.value } : b
                      );
                      setBrands(updated);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-pretendard">설명</label>
                  <textarea
                    value={brand.description}
                    onChange={(e) => {
                      const updated = brands.map(b => 
                        b.id === brand.id ? { ...b, description: e.target.value } : b
                      );
                      setBrands(updated);
                    }}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
              <ImageUploader
                currentImage={brand.image}
                onImageUpload={(file) => handleImageUpload(file, 'brands', brand.id, 'image')}
                label="브랜드 이미지"
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(brand.id, 'brands', setBrands, brands)}
                >
                  삭제
                </Button>
              </div>
            </div>
          </Accordion>
        )}
      />
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'header':
        return renderHeaderManagement();
      case 'sections':
        return renderSectionManagement();
      case 'slogans':
        return renderSloganManagement();
      case 'stores':
        return renderStoreManagement();
      case 'brands':
        return renderBrandManagement();
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-pretendard">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-pretendard mb-2">
            메인페이지 관리
          </h1>
          <p className="text-gray-600 font-pretendard">
            메인페이지의 각 영역을 관리하세요
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm font-pretendard transition-colors ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default MainPageManage; 