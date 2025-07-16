import React, { useEffect, useState } from 'react';
import { db, storage } from '../../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
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

// 관리자 페이지 공통 스타일
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
  padding: 12px 24px;
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
  display: inline-flex;
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

const AdminHeader = styled.header`
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 32px;
  color: ${colors.black};
`;

const AdminLayout = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${colors.grayLight};
  position: relative;
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

const SectionTitle = styled.h2`
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 24px;
  color: ${colors.black};
`;

const LinkItem = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
  padding: 16px;
  background: ${colors.grayLight};
  border-radius: 8px;
  border: 1px solid ${colors.grayBorder};
`;

const SNSItem = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
  padding: 16px;
  background: ${colors.grayLight};
  border-radius: 8px;
  border: 1px solid ${colors.grayBorder};
`;

const IconPreview = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${colors.white};
  border-radius: 4px;
  border: 1px solid ${colors.grayBorder};
  overflow: hidden;
`;

const IconImage = styled.img`
  width: 24px;
  height: 24px;
  object-fit: contain;
`;

const AddForm = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px;
  background: ${colors.white};
  border-radius: 8px;
  border: 2px dashed ${colors.grayBorder};
`;

const FileInput = styled.input`
  display: none;
`;

const FileLabel = styled.label`
  display: inline-block;
  padding: 8px 16px;
  background: ${colors.grayLight};
  border-radius: 6px;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  color: ${colors.black};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${colors.grayBorder};
    transform: translateY(-1px);
  }
`;

const PreviewBox = styled.div`
  background: ${colors.grayLight};
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
  border: 1px solid ${colors.grayBorder};
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.9rem;
  color: ${colors.grayDark};
`;

interface FooterConfig {
  links: { name: string; url: string }[];
  sns: { icon: string; url: string }[];
  copyright: string;
}

const defaultConfig: FooterConfig = {
  links: [],
  sns: [],
  copyright: '',
};

const FooterManagePage: React.FC = () => {
  const [footerConfig, setFooterConfig] = useState<FooterConfig | null>(null);
  const [loading, setLoading] = useState(true);
  // 홈페이지 링크
  const [newLink, setNewLink] = useState({ name: '', url: '' });
  const [editLinks, setEditLinks] = useState<{ name: string; url: string }[]>([]);
  // SNS
  const [newSNS, setNewSNS] = useState<{ icon: string; file: File | null; url: string }>({ icon: '', file: null, url: '' });
  const [editSNS, setEditSNS] = useState<{ icon: string; url: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [uploadingNew, setUploadingNew] = useState(false);
  const [copyright, setCopyright] = useState('');

  // 실시간 구독
  useEffect(() => {
    const ref = doc(db, 'footer_config', 'main');
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as FooterConfig;
        setFooterConfig(data);
        setEditLinks(data.links || []);
        setEditSNS(data.sns || []);
        setCopyright(data.copyright || '');
      } else {
        setFooterConfig(null);
        setEditLinks([]);
        setEditSNS([]);
        setCopyright('');
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 홈페이지 링크 관리
  const handleAddLink = async () => {
    if (!newLink.name.trim() || !newLink.url.trim()) return;
    const updatedLinks = [...editLinks, { ...newLink }];
    setSaving(true);
    await setDoc(doc(db, 'footer_config', 'main'), {
      ...(footerConfig || defaultConfig),
      links: updatedLinks,
      sns: editSNS,
      copyright,
    });
    setNewLink({ name: '', url: '' });
    setSaving(false);
  };

  const handleEditLink = async (idx: number, key: 'name' | 'url', value: string) => {
    const updated = editLinks.map((l, i) => i === idx ? { ...l, [key]: value } : l);
    setEditLinks(updated);
  };

  const handleSaveLinks = async () => {
    setSaving(true);
    await setDoc(doc(db, 'footer_config', 'main'), {
      ...(footerConfig || defaultConfig),
      links: editLinks,
      sns: editSNS,
      copyright,
    });
    setSaving(false);
  };

  const handleDeleteLink = async (idx: number) => {
    const updated = editLinks.filter((_, i) => i !== idx);
    setSaving(true);
    await setDoc(doc(db, 'footer_config', 'main'), {
      ...(footerConfig || defaultConfig),
      links: updated,
      sns: editSNS,
      copyright,
    });
    setSaving(false);
  };

  // SNS 관리
  const handleAddSNS = async () => {
    if (!newSNS.url.trim() || (!newSNS.icon && !newSNS.file)) return;
    setUploadingNew(true);
    let iconUrl = newSNS.icon;
    if (newSNS.file) {
      const ext = newSNS.file.name.split('.').pop();
      const sRef = storageRef(storage, `footer-icons/sns_${Date.now()}.${ext}`);
      await uploadBytes(sRef, newSNS.file);
      iconUrl = await getDownloadURL(sRef);
    }
    const updatedSNS = [...editSNS, { icon: iconUrl, url: newSNS.url }];
    await setDoc(doc(db, 'footer_config', 'main'), {
      ...(footerConfig || defaultConfig),
      links: editLinks,
      sns: updatedSNS,
      copyright,
    });
    setNewSNS({ icon: '', file: null, url: '' });
    setUploadingNew(false);
  };

  const handleEditSNS = (idx: number, key: 'icon' | 'url', value: string) => {
    const updated = editSNS.map((s, i) => i === idx ? { ...s, [key]: value } : s);
    setEditSNS(updated);
  };

  const handleSaveSNS = async () => {
    setSaving(true);
    await setDoc(doc(db, 'footer_config', 'main'), {
      ...(footerConfig || defaultConfig),
      links: editLinks,
      sns: editSNS,
      copyright,
    });
    setSaving(false);
  };

  const handleDeleteSNS = async (idx: number) => {
    const updated = editSNS.filter((_, i) => i !== idx);
    setSaving(true);
    await setDoc(doc(db, 'footer_config', 'main'), {
      ...(footerConfig || defaultConfig),
      links: editLinks,
      sns: updated,
      copyright,
    });
    setSaving(false);
  };

  // SNS 아이콘 업로드(수정)
  const handleSNSIconUpload = async (idx: number, file: File) => {
    setUploadingIdx(idx);
    const ext = file.name.split('.').pop();
    const sRef = storageRef(storage, `footer-icons/sns_${Date.now()}.${ext}`);
    await uploadBytes(sRef, file);
    const iconUrl = await getDownloadURL(sRef);
    const updated = editSNS.map((s, i) => i === idx ? { ...s, icon: iconUrl } : s);
    setEditSNS(updated);
    setUploadingIdx(null);
  };

  // 카피라이트 저장
  const handleSaveCopyright = async () => {
    setSaving(true);
    await setDoc(doc(db, 'footer_config', 'main'), {
      ...(footerConfig || defaultConfig),
      links: editLinks,
      sns: editSNS,
      copyright,
    });
    setSaving(false);
  };

  if (loading) {
    return (
      <AdminLayout>
        <AdminMain>
          <div style={{ textAlign: 'center', color: colors.grayDark, fontSize: '1.2rem' }}>
            로딩 중...
          </div>
        </AdminMain>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <AdminMain>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <BackButton onClick={() => window.history.back()}>
            <span style={{ fontSize: 20 }}>←</span> 대시보드로
          </BackButton>
          <AdminLogoutBtn onClick={() => {
            localStorage.removeItem('admin_login');
            window.location.href = '/admin/login';
          }}>
            로그아웃
          </AdminLogoutBtn>
        </div>
        
        <AdminHeader>푸터 영역 관리</AdminHeader>

        {/* 홈페이지 링크 관리 */}
        <AdminCard>
          <SectionTitle>홈페이지 링크 관리</SectionTitle>
          
          {editLinks.length === 0 && (
            <div style={{ color: colors.grayMedium, fontSize: '0.9rem', marginBottom: 16 }}>
              등록된 링크가 없습니다.
            </div>
          )}
          
          {editLinks.map((link, idx) => (
            <LinkItem key={idx}>
              <AdminInput
                value={link.name}
                onChange={e => handleEditLink(idx, 'name', e.target.value)}
                placeholder="링크명"
                style={{ marginBottom: 0, flex: 1 }}
              />
              <AdminInput
                value={link.url}
                onChange={e => handleEditLink(idx, 'url', e.target.value)}
                placeholder="URL"
                style={{ marginBottom: 0, flex: 2 }}
              />
              <AdminButton
                $danger
                onClick={() => handleDeleteLink(idx)}
                disabled={saving}
                style={{ margin: 0, padding: '8px 16px' }}
              >
                삭제
              </AdminButton>
            </LinkItem>
          ))}
          
          <AddForm>
            <AdminInput
              value={newLink.name}
              onChange={e => setNewLink(l => ({ ...l, name: e.target.value }))}
              placeholder="새 링크명"
              style={{ marginBottom: 0, flex: 1 }}
            />
            <AdminInput
              value={newLink.url}
              onChange={e => setNewLink(l => ({ ...l, url: e.target.value }))}
              placeholder="새 URL"
              style={{ marginBottom: 0, flex: 2 }}
            />
            <AdminButton
              $primary
              onClick={handleAddLink}
              disabled={!newLink.name.trim() || !newLink.url.trim() || saving}
              style={{ margin: 0, padding: '8px 16px' }}
            >
              추가
            </AdminButton>
          </AddForm>
          
          <AdminButton
            onClick={handleSaveLinks}
            disabled={saving}
            style={{ width: 'auto' }}
          >
            전체 저장
          </AdminButton>
        </AdminCard>

        {/* SNS 관리 */}
        <AdminCard>
          <SectionTitle>SNS 링크 관리</SectionTitle>
          
          {editSNS.length === 0 && (
            <div style={{ color: colors.grayMedium, fontSize: '0.9rem', marginBottom: 16 }}>
              등록된 SNS가 없습니다.
            </div>
          )}
          
          {editSNS.map((sns, idx) => (
            <SNSItem key={idx}>
              <IconPreview>
                {sns.icon ? (
                  <IconImage src={sns.icon} alt="sns" />
                ) : (
                  <span style={{ fontSize: '0.8rem', color: colors.grayMedium }}>No Icon</span>
                )}
              </IconPreview>
              <AdminInput
                value={sns.url}
                onChange={e => handleEditSNS(idx, 'url', e.target.value)}
                placeholder="SNS URL"
                style={{ marginBottom: 0, flex: 1 }}
              />
              <FileLabel>
                <FileInput
                  type="file"
                  accept="image/*"
                  onChange={e => e.target.files && handleSNSIconUpload(idx, e.target.files[0])}
                  disabled={uploadingIdx === idx}
                />
                {uploadingIdx === idx ? '업로드중...' : '아이콘 변경'}
              </FileLabel>
              <AdminButton
                $danger
                onClick={() => handleDeleteSNS(idx)}
                disabled={saving}
                style={{ margin: 0, padding: '8px 16px' }}
              >
                삭제
              </AdminButton>
            </SNSItem>
          ))}
          
          <AddForm>
            <IconPreview>
              {newSNS.file ? (
                <IconImage src={URL.createObjectURL(newSNS.file)} alt="sns" />
              ) : (
                <span style={{ fontSize: '0.8rem', color: colors.grayMedium }}>No Icon</span>
              )}
            </IconPreview>
            <AdminInput
              value={newSNS.url}
              onChange={e => setNewSNS(s => ({ ...s, url: e.target.value }))}
              placeholder="새 SNS URL"
              style={{ marginBottom: 0, flex: 1 }}
            />
            <FileLabel>
              <FileInput
                type="file"
                accept="image/*"
                onChange={e => e.target.files && setNewSNS(s => ({ ...s, file: e.target.files![0], icon: '' }))}
                disabled={uploadingNew}
              />
              {uploadingNew ? '업로드중...' : '아이콘 선택'}
            </FileLabel>
            <AdminButton
              $primary
              onClick={handleAddSNS}
              disabled={uploadingNew || !newSNS.url.trim() || (!newSNS.icon && !newSNS.file)}
              style={{ margin: 0, padding: '8px 16px' }}
            >
              추가
            </AdminButton>
          </AddForm>
          
          <AdminButton
            onClick={handleSaveSNS}
            disabled={saving}
            style={{ width: 'auto' }}
          >
            전체 저장
          </AdminButton>
        </AdminCard>

        {/* 카피라이트 관리 */}
        <AdminCard>
          <SectionTitle>카피라이트 문구 관리</SectionTitle>
          <AdminInput
            value={copyright}
            onChange={e => setCopyright(e.target.value)}
            placeholder="COPYRIGHT(C) OMFOOD ALL RIGHT RESERVED."
          />
          <AdminButton
            onClick={handleSaveCopyright}
            disabled={saving}
            style={{ width: 'auto' }}
          >
            저장
          </AdminButton>
          
          <PreviewBox>
            <strong>카피라이트 문구 (프리뷰)</strong>
            <div style={{ marginTop: 8 }}>
              {footerConfig?.copyright || 'COPYRIGHT(C) OMFOOD ALL RIGHT RESERVED.'}
            </div>
          </PreviewBox>
        </AdminCard>
      </AdminMain>
    </AdminLayout>
  );
};

export default FooterManagePage; 