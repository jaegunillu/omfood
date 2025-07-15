import React, { useEffect, useState } from 'react';
import { db, storage } from '../../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

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

  // 홈페이지 링크 관리 (생략, 기존과 동일)
  const handleAddLink = async () => {
    if (!newLink.name.trim() || !newLink.url.trim()) return;
    const updatedLinks = [...editLinks, { ...newLink }];
    setSaving(true);
    await setDoc(doc(db, 'footer_config', 'main'), {
      ...(footerConfig || defaultConfig),
      links: updatedLinks,
      sns: editSNS,
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500 text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start py-12">
      <div className="max-w-3xl w-full bg-white rounded-xl shadow p-8 mt-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 font-pretendard">푸터 영역 관리</h1>
        {/* 홈페이지 링크 관리 */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">홈페이지 링크 관리</h2>
          <div className="space-y-2 mb-4">
            {editLinks.length === 0 && <div className="text-gray-400 text-sm">등록된 링크가 없습니다.</div>}
            {editLinks.map((link, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  className="border rounded px-2 py-1 text-sm w-36"
                  value={link.name}
                  onChange={e => handleEditLink(idx, 'name', e.target.value)}
                  placeholder="링크명"
                />
                <input
                  className="border rounded px-2 py-1 text-sm flex-1"
                  value={link.url}
                  onChange={e => handleEditLink(idx, 'url', e.target.value)}
                  placeholder="URL"
                />
                <button
                  className="text-red-500 hover:underline text-xs ml-2"
                  onClick={() => handleDeleteLink(idx)}
                  disabled={saving}
                >삭제</button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mb-2">
            <input
              className="border rounded px-2 py-1 text-sm w-36"
              value={newLink.name}
              onChange={e => setNewLink(l => ({ ...l, name: e.target.value }))}
              placeholder="새 링크명"
            />
            <input
              className="border rounded px-2 py-1 text-sm flex-1"
              value={newLink.url}
              onChange={e => setNewLink(l => ({ ...l, url: e.target.value }))}
              placeholder="새 URL"
            />
            <button
              className="bg-orange-500 text-white rounded px-3 py-1 text-sm font-semibold disabled:opacity-50"
              onClick={handleAddLink}
              disabled={!newLink.name.trim() || !newLink.url.trim() || saving}
            >추가</button>
          </div>
          <button
            className="mt-2 bg-gray-800 text-white rounded px-4 py-1 text-sm font-semibold disabled:opacity-50"
            onClick={handleSaveLinks}
            disabled={saving}
          >전체 저장</button>
        </div>
        {/* SNS 관리 */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">SNS 링크 관리</h2>
          <div className="space-y-2 mb-4">
            {editSNS.length === 0 && <div className="text-gray-400 text-sm">등록된 SNS가 없습니다.</div>}
            {editSNS.map((sns, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded overflow-hidden">
                  {sns.icon ? <img src={sns.icon} alt="sns" className="w-6 h-6 object-contain" /> : <span className="text-xs text-gray-400">No Icon</span>}
                </div>
                <input
                  className="border rounded px-2 py-1 text-sm flex-1"
                  value={sns.url}
                  onChange={e => handleEditSNS(idx, 'url', e.target.value)}
                  placeholder="SNS URL"
                />
                <label className="text-xs text-blue-600 cursor-pointer ml-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => e.target.files && handleSNSIconUpload(idx, e.target.files[0])}
                    disabled={uploadingIdx === idx}
                  />
                  {uploadingIdx === idx ? '업로드중...' : '아이콘 변경'}
                </label>
                <button
                  className="text-red-500 hover:underline text-xs ml-2"
                  onClick={() => handleDeleteSNS(idx)}
                  disabled={saving}
                >삭제</button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mb-2 items-center">
            <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded overflow-hidden">
              {newSNS.file ? <img src={URL.createObjectURL(newSNS.file)} alt="sns" className="w-6 h-6 object-contain" /> : <span className="text-xs text-gray-400">No Icon</span>}
            </div>
            <input
              className="border rounded px-2 py-1 text-sm flex-1"
              value={newSNS.url}
              onChange={e => setNewSNS(s => ({ ...s, url: e.target.value }))}
              placeholder="새 SNS URL"
            />
            <label className="text-xs text-blue-600 cursor-pointer ml-2">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => e.target.files && setNewSNS(s => ({ ...s, file: e.target.files![0], icon: '' }))}
                disabled={uploadingNew}
              />
              {uploadingNew ? '업로드중...' : '아이콘 선택'}
            </label>
            <button
              className="bg-orange-500 text-white rounded px-3 py-1 text-sm font-semibold disabled:opacity-50"
              onClick={handleAddSNS}
              disabled={uploadingNew || !newSNS.url.trim() || (!newSNS.icon && !newSNS.file)}
            >추가</button>
          </div>
          <button
            className="mt-2 bg-gray-800 text-white rounded px-4 py-1 text-sm font-semibold disabled:opacity-50"
            onClick={handleSaveSNS}
            disabled={saving}
          >전체 저장</button>
        </div>
        {/* 카피라이트 관리 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">카피라이트 문구 관리</h2>
          <input
            className="border rounded px-2 py-1 text-sm w-full mb-2"
            value={copyright}
            onChange={e => setCopyright(e.target.value)}
            placeholder="COPYRIGHT(C) OMFOOD ALL RIGHT RESERVED."
          />
          <button
            className="bg-gray-800 text-white rounded px-4 py-1 text-sm font-semibold disabled:opacity-50"
            onClick={handleSaveCopyright}
            disabled={saving}
          >저장</button>
        </div>
        {/* 카피라이트 프리뷰 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">카피라이트 문구 (프리뷰)</h2>
          <pre className="bg-gray-100 rounded p-2 text-xs text-gray-700">{footerConfig?.copyright}</pre>
        </div>
      </div>
    </div>
  );
};

export default FooterManagePage; 