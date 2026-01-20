import React, { useState, useEffect } from 'react';
import { collection, doc, getDocs, updateDoc, deleteDoc, addDoc, orderBy, query, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../firebase';
import Accordion from '../common/Accordion';
import DragDropList from '../common/DragDropList';
import ImageUploader from '../common/ImageUploader';
import Button from '../common/Button';
import PageHeader from './PageHeader';
import { useToast } from '../common/ToastContext';
import { useAdminLang } from '../../App';
import styled from 'styled-components';

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

const AdminLayout = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${colors.grayLight};
  position: relative;
`;

const AdminMain = styled.main`
  flex: 1;
  padding: 60px 80px 60px 80px;
  min-height: 100vh;
  max-width: 2400px;
  margin: 0 auto;
  width: 100%;
  
  @media (max-width: 1400px) {
    padding: 48px 60px 48px 60px;
  }
  
  @media (max-width: 1200px) {
    padding: 40px 40px 40px 40px;
  }
  
  @media (max-width: 900px) {
    padding: 32px 24px 32px 24px;
  }
`;

const AdminCard = styled.div`
  background: ${colors.white};
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  padding: 48px;
  max-width: 2400px;
  width: 100%;
  margin: 0 auto 40px auto;
  box-sizing: border-box;
  
  @media (max-width: 1400px) {
    padding: 40px;
  }
  
  @media (max-width: 1200px) {
    padding: 32px;
  }
  
  @media (max-width: 768px) {
    padding: 24px 20px;
  }
`;

const AdminLabel = styled.label`
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 12px;
  display: block;
  color: ${colors.black};
`;

const AdminInput = styled.input`
  width: 100%;
  padding: 16px 20px;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 1.1rem;
  border: 2px solid ${colors.grayBorder};
  border-radius: 12px;
  margin-bottom: 32px;
  background: ${colors.white};
  box-sizing: border-box;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 4px rgba(229, 0, 43, 0.1);
    transform: translateY(-1px);
  }
  
  &:hover {
    border-color: ${colors.grayDark};
  }
`;

const AdminTextarea = styled.textarea`
  width: 100%;
  padding: 16px 20px;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 1.1rem;
  border: 2px solid ${colors.grayBorder};
  border-radius: 12px;
  margin-bottom: 32px;
  background: ${colors.white};
  box-sizing: border-box;
  transition: all 0.2s ease;
  resize: vertical;
  min-height: 120px;
  
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 4px rgba(229, 0, 43, 0.1);
    transform: translateY(-1px);
  }
  
  &:hover {
    border-color: ${colors.grayDark};
  }
`;

const SectionTitle = styled.h2`
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 40px;
  color: ${colors.black};
  border-bottom: 3px solid ${colors.primary};
  padding-bottom: 16px;
`;

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {/* 기본 정보 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
          <div>
            <AdminLabel>브랜드명</AdminLabel>
            <AdminInput
              type="text"
              value={brand.name[adminLang] || ''}
              onChange={(e) => {
                const updated = brandPages.map(b => 
                  b.id === brand.id ? { ...b, name: { ...b.name, [adminLang]: e.target.value } } : b
                );
                setBrandPages(updated);
              }}
            />
          </div>
          <div>
            <AdminLabel>설명</AdminLabel>
            <AdminTextarea
              value={brand.description[adminLang] || ''}
              onChange={(e) => {
                const updated = brandPages.map(b => 
                  b.id === brand.id ? { ...b, description: { ...b.description, [adminLang]: e.target.value } } : b
                );
                setBrandPages(updated);
              }}
              rows={4}
            />
          </div>
        </div>

        {/* 브랜드 이미지/영상 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '40px' }}>
          <ImageUploader
            currentImage={brand.image}
            onImageUpload={(file) => handleImageUpload(file, brand.id, 'image')}
            label="브랜드 이미지"
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <AdminLabel>브랜드 영상</AdminLabel>
            <div style={{ border: '2px dashed', borderColor: colors.grayBorder, borderRadius: '12px', padding: '24px', background: '#fafafa' }}>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleVideoUpload(file, brand.id, 'video');
                  }
                }}
                style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
              />
              {brand.video && (
                <div style={{ marginTop: '20px' }}>
                  <video
                    src={brand.video}
                    controls
                    style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px' }}
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
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '40px', padding: '20px 0' }}>
            <ImageUploader
              currentImage={brand.mainImage}
              onImageUpload={(file) => handleImageUpload(file, brand.id, 'mainImage')}
              label="메인 영역 이미지"
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <AdminLabel>메인 영역 영상</AdminLabel>
              <div style={{ border: '2px dashed', borderColor: colors.grayBorder, borderRadius: '12px', padding: '24px', background: '#fafafa' }}>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleVideoUpload(file, brand.id, 'mainVideo');
                    }
                  }}
                  style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
                />
                {brand.mainVideo && (
                  <div style={{ marginTop: '20px' }}>
                    <video
                      src={brand.mainVideo}
                      controls
                      style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px' }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </Accordion>

        {/* 액션 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', paddingTop: '24px', borderTop: `2px solid ${colors.grayBorder}`, marginTop: '20px' }}>
          <Button
            variant="danger"
            size="lg"
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
      <AdminLayout>
        <AdminMain>
          <div style={{ 
            textAlign: 'center', 
            color: colors.grayDark, 
            fontSize: '1.4rem',
            padding: '80px 0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: `4px solid ${colors.grayBorder}`,
              borderTop: `4px solid ${colors.primary}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <div>데이터를 불러오는 중...</div>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </AdminMain>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <AdminMain>
        <PageHeader 
          title="브랜드 페이지 관리"
          subtitle="브랜드 페이지의 콘텐츠와 메인 영역 미디어를 관리하세요"
          onLogout={() => {
            localStorage.removeItem('admin_login');
            window.location.href = '/admin/login';
          }}
        />

        {/* 브랜드 추가 */}
        <AdminCard>
          <Accordion
            title="새 브랜드 추가"
            defaultExpanded={showAddForm}
            onToggle={(expanded) => setShowAddForm(expanded)}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
                <div>
                  <AdminLabel>브랜드명</AdminLabel>
                  <AdminInput
                    type="text"
                    value={newBrand.name[adminLang] || ''}
                    onChange={(e) => setNewBrand({ ...newBrand, name: { ...newBrand.name, [adminLang]: e.target.value } })}
                    placeholder="브랜드명을 입력하세요"
                  />
                </div>
                <div>
                  <AdminLabel>설명</AdminLabel>
                  <AdminTextarea
                    value={newBrand.description[adminLang] || ''}
                    onChange={(e) => setNewBrand({ ...newBrand, description: { ...newBrand.description, [adminLang]: e.target.value } })}
                    rows={4}
                    placeholder="브랜드 설명을 입력하세요"
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', paddingTop: '20px', borderTop: `2px solid ${colors.grayBorder}` }}>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowAddForm(false)}
                >
                  취소
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleAddBrand}
                >
                  브랜드 추가
                </Button>
              </div>
            </div>
          </Accordion>
        </AdminCard>

        {/* 브랜드 목록 */}
        <AdminCard>
          <SectionTitle>브랜드 목록 ({brandPages.length}개)</SectionTitle>
          
          <DragDropList
            key={adminLang}
            items={brandPages}
            onReorder={handleReorder}
            renderItem={renderBrandItem}
          />
        </AdminCard>
      </AdminMain>
    </AdminLayout>
  );
};

export default BrandPageManage; 