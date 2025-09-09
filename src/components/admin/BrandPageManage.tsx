import React, { useState, useEffect } from 'react';
import { collection, doc, getDocs, updateDoc, deleteDoc, addDoc, orderBy, query, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../firebase';
import Accordion from '../common/Accordion';
import DragDropList from '../common/DragDropList';
import ImageUploader from '../common/ImageUploader';
import Button from '../common/Button';
import { useToast } from '../common/ToastContext';
import { useAdminLang } from '../../App';

interface BrandPageData {
  id: string;
  name: { en: string; ko: string };
  description: { en: string; ko: string };
  image: string;
  video?: string;
  order: number;
  mainImage?: string;
  mainVideo?: string;
}

const BrandPageManage: React.FC = () => {
  const { adminLang } = useAdminLang();
  const [loading, setLoading] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [brandPages, setBrandPages] = useState<BrandPageData[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBrand, setNewBrand] = useState<BrandPageData>({
    id: '',
    name: { en: '', ko: '' },
    description: { en: '', ko: '' },
    image: '',
    video: '',
    order: 0,
    mainImage: '',
    mainVideo: ''
  });
  
  const { success, error, info } = useToast();

  useEffect(() => {
    loadBrandPages();
  }, []);

  const loadBrandPages = async () => {
    setLoading(true);
    try {
      const brandQuery = query(collection(db, 'brandPages'), orderBy('order'));
      const brandSnapshot = await getDocs(brandQuery);
      // Firestore에서 받아올 때 string이면 { en: '', ko: '' }로 변환
      const brandData = brandSnapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          name: typeof d.name === 'string' ? { en: d.name, ko: '' } : (d.name || { en: '', ko: '' }),
          description: typeof d.description === 'string' ? { en: d.description, ko: '' } : (d.description || { en: '', ko: '' }),
          image: d.image || '',
          video: d.video || '',
          order: typeof d.order === 'number' ? d.order : 0,
          mainImage: d.mainImage || '',
          mainVideo: d.mainVideo || ''
        };
      });
      setBrandPages(brandData);
    } catch (error: any) {
      console.error('브랜드 페이지 로드 실패:', error);
      error('브랜드 페이지 로드에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File, itemId: string, fieldName: string) => {
    try {
      const storageRef = ref(storage, `brandPages/${itemId}/${fieldName}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      const docRef = doc(db, 'brandPages', itemId);
      try {
        await updateDoc(docRef, { [fieldName]: downloadURL });
      } catch (e) {
        await setDoc(docRef, { [fieldName]: downloadURL }, { merge: true });
      }
      success('이미지가 업로드되었습니다.');
      loadBrandPages();
    } catch (error: any) {
      console.error('이미지 업로드 실패:', error);
      error('이미지 업로드에 실패했습니다.');
    }
  };

  const handleVideoUpload = async (file: File, itemId: string, fieldName: string) => {
    try {
      const storageRef = ref(storage, `brandPages/${itemId}/${fieldName}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      const docRef = doc(db, 'brandPages', itemId);
      try {
        await updateDoc(docRef, { [fieldName]: downloadURL });
      } catch (e) {
        await setDoc(docRef, { [fieldName]: downloadURL }, { merge: true });
      }
      success('영상이 업로드되었습니다.');
      loadBrandPages();
    } catch (error: any) {
      console.error('영상 업로드 실패:', error);
      error('영상 업로드에 실패했습니다.');
    }
  };

  const handleReorder = async (items: any[]) => {
    try {
      const updatedItems = items.map((item, index) => ({ ...item, order: index }));
      setBrandPages(updatedItems);
      
      // Firestore 업데이트
      for (const item of updatedItems) {
        const docRef = doc(db, 'brandPages', item.id);
        try {
          await updateDoc(docRef, { order: item.order });
        } catch (e) {
          await setDoc(docRef, { order: item.order }, { merge: true });
        }
      }
      
      success('순서가 변경되었습니다.');
    } catch (error: any) {
      console.error('순서 변경 실패:', error);
      error('순서 변경에 실패했습니다.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      await deleteDoc(doc(db, 'brandPages', id));
      const updatedBrands = brandPages.filter(brand => brand.id !== id);
      setBrandPages(updatedBrands);
      success('삭제되었습니다.');
    } catch (error: any) {
      console.error('삭제 실패:', error);
      error('삭제에 실패했습니다.');
    }
  };

  const handleAddBrand = async () => {
    if (!newBrand.name[adminLang].trim()) {
      error('브랜드명을 입력해주세요.');
      return;
    }

    try {
      const brandData = {
        ...newBrand,
        order: brandPages.length,
        createdAt: new Date()
      };
      
      await addDoc(collection(db, 'brandPages'), brandData);
      
      setNewBrand({
        id: '',
        name: { en: '', ko: '' },
        description: { en: '', ko: '' },
        image: '',
        video: '',
        order: 0,
        mainImage: '',
        mainVideo: ''
      });
      setShowAddForm(false);
      success('브랜드가 추가되었습니다.');
      loadBrandPages();
    } catch (error: any) {
      console.error('브랜드 추가 실패:', error);
      error('브랜드 추가에 실패했습니다.');
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

  const renderBrandItem = (item: any, index: number) => {
    const brand = item;
    return (
    <Accordion
      title={`${brand.name[adminLang]} (순서: ${index + 1})`}
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
      <div className="space-y-6">
        {/* 기본 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-pretendard">브랜드명</label>
            <input
              type="text"
              value={brand.name[adminLang] || ''}
              onChange={(e) => {
                const updated = brandPages.map(b => 
                  b.id === brand.id ? { ...b, name: { ...b.name, [adminLang]: e.target.value } } : b
                );
                setBrandPages(updated);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-pretendard">설명</label>
            <textarea
              value={brand.description[adminLang] || ''}
              onChange={(e) => {
                const updated = brandPages.map(b => 
                  b.id === brand.id ? { ...b, description: { ...b.description, [adminLang]: e.target.value } } : b
                );
                setBrandPages(updated);
              }}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 브랜드 이미지/영상 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImageUploader
            currentImage={brand.image}
            onImageUpload={(file) => handleImageUpload(file, brand.id, 'image')}
            label="브랜드 이미지"
          />
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 font-pretendard">브랜드 영상</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleVideoUpload(file, brand.id, 'video');
                  }
                }}
                className="w-full"
              />
              {brand.video && (
                <div className="mt-3">
                  <video
                    src={brand.video}
                    controls
                    className="w-full h-32 object-cover rounded"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 메인 영역 미디어 */}
        <Accordion
          title="메인 영역 미디어 관리"
          defaultExpanded={false}
          className="mt-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageUploader
              currentImage={brand.mainImage}
              onImageUpload={(file) => handleImageUpload(file, brand.id, 'mainImage')}
              label="메인 영역 이미지"
            />
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 font-pretendard">메인 영역 영상</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleVideoUpload(file, brand.id, 'mainVideo');
                    }
                  }}
                  className="w-full"
                />
                {brand.mainVideo && (
                  <div className="mt-3">
                    <video
                      src={brand.mainVideo}
                      controls
                      className="w-full h-32 object-cover rounded"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </Accordion>

        {/* 액션 버튼 */}
        <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(brand.id)}
          >
            삭제
          </Button>
        </div>
      </div>
    </Accordion>
    );
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
    <div className="min-h-screen">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ width: '2100px', maxWidth: '2100px' }}>
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-pretendard mb-2">
            브랜드 페이지 관리
          </h1>
          <p className="text-gray-600 font-pretendard">
            브랜드 페이지의 콘텐츠와 메인 영역 미디어를 관리하세요
          </p>
        </div>

        {/* 브랜드 추가 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <Accordion
            title="새 브랜드 추가"
            defaultExpanded={showAddForm}
            onToggle={(expanded) => setShowAddForm(expanded)}
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-pretendard">브랜드명</label>
                  <input
                    type="text"
                    value={newBrand.name[adminLang] || ''}
                    onChange={(e) => setNewBrand({ ...newBrand, name: { ...newBrand.name, [adminLang]: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="브랜드명을 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-pretendard">설명</label>
                  <textarea
                    value={newBrand.description[adminLang] || ''}
                    onChange={(e) => setNewBrand({ ...newBrand, description: { ...newBrand.description, [adminLang]: e.target.value } })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="브랜드 설명을 입력하세요"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setShowAddForm(false)}
                >
                  취소
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleAddBrand}
                >
                  브랜드 추가
                </Button>
              </div>
            </div>
          </Accordion>
        </div>

        {/* 브랜드 목록 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 font-pretendard mb-6">
            브랜드 목록 ({brandPages.length}개)
          </h2>
          
          <DragDropList
            items={brandPages}
            onReorder={handleReorder}
            renderItem={renderBrandItem}
          />
        </div>
      </div>
    </div>
  );
};

export default BrandPageManage; 