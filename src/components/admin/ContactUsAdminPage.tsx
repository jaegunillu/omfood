import React, { useState, useEffect } from "react";
// 아이콘 예시 (Material Icons)
import { ContentCopy } from "@mui/icons-material";
import { db } from "../../firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, setDoc } from "firebase/firestore";
import { useToast } from '../common/ToastContext';
import Toast from '../common/Toast';
import ToastContainer from '../common/ToastContainer';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// AdminButton 스타일 컴포넌트 정의
const AdminButton = styled.button<{ $primary?: boolean; $danger?: boolean; $loading?: boolean }>`
  padding: 14px 24px;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  background: ${({ $primary, $danger, $loading }) => 
    $loading ? '#888888' : $danger ? '#dc3545' : $primary ? '#E5002B' : '#F5F5F5'};
  color: ${({ $primary, $danger, $loading }) => 
    $loading ? '#444444' : $danger ? '#FFFFFF' : $primary ? '#FFFFFF' : '#111111'};
  cursor: ${({ $loading }) => $loading ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover { 
    background: ${({ $primary, $danger, $loading }) => 
      $loading ? '#888888' : $danger ? '#c82333' : $primary ? '#c40023' : '#E0E0E0'};
    transform: ${({ $loading }) => $loading ? 'none' : 'translateY(-1px)'};
    box-shadow: ${({ $loading }) => $loading ? 'none' : '0 4px 8px rgba(0,0,0,0.15)'};
  }
`;

const ContactUsAdminPage: React.FC = () => {
  const navigate = useNavigate();
  // 문의 리스트 Firestore 연동
  const [inquiries, setInquiries] = useState<any[]>([]);
  useEffect(() => {
    const q = query(collection(db, "contact_us"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setInquiries(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    });
    return () => unsub();
  }, []);

  // 하단 정보 Firestore 연동
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "contact_us_config", "main_info"), (docSnap) => {
      if (docSnap.exists()) {
        setMainInfo(docSnap.data() as typeof mainInfo);
        setEditInfo(docSnap.data() as typeof mainInfo);
      }
    });
    return () => unsub();
  }, []);

  const [selected, setSelected] = useState<any | null>(null);

  // 하단 정보(임시)
  const [mainInfo, setMainInfo] = useState({
    address: "8, Dongseong-ro 17-gil, Songbuk-gu, Seoul, Republic of Korea",
    phone: "+82-2-928-5669\n02.928.5669",
    fax: "+82-2-927-5662\n02.927.5662",
    email: "om@ovenmaru.com",
  });
  const [editInfo, setEditInfo] = useState(mainInfo);
  const [editMode, setEditMode] = useState(false);

  const { success } = useToast();

  // 이메일 복사
  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    success("이메일이 복사되었습니다.");
  };

  // 하단 정보 저장 (Firestore 업데이트)
  const saveInfo = async () => {
    try {
      await updateDoc(doc(db, "contact_us_config", "main_info"), editInfo);
      success("저장되었습니다.");
    } catch (e) {
      // 문서가 없어서 update 실패 시 setDoc으로 생성
      await setDoc(doc(db, "contact_us_config", "main_info"), editInfo);
      success("새 문서로 저장되었습니다.");
    }
    setEditMode(false);
  };

  const handleLogout = () => {
    // 실제 구현 시 auth.signOut() 등으로 교체
    alert('로그아웃 기능은 추후 구현 예정입니다.');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0' }}>
      <div style={{ width: '100%', maxWidth: 1440, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <AdminButton onClick={() => navigate('/admin/dashboard')}>← 대시보드로</AdminButton>
        <AdminButton onClick={handleLogout}>로그아웃</AdminButton>
      </div>
              <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 40, color: '#111', letterSpacing: '-1px' }}>CONTACT US 문의 관리</h1>
        <ToastContainer>
          <div></div>
        </ToastContainer>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 36, width: '100%', maxWidth: 1440, marginBottom: 40 }}>
        <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 24 }}>문의 리스트</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: 16, borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ background: '#f8f9fa', color: '#222', fontWeight: 700, fontSize: 16 }}>
                <th style={{ padding: '12px 16px', borderBottom: '2px solid #e0e0e0', textAlign: 'left', minWidth: 220 }}>Subject</th>
                <th style={{ padding: '12px 16px', borderBottom: '2px solid #e0e0e0', textAlign: 'left', minWidth: 140 }}>Product</th>
                <th style={{ padding: '12px 16px', borderBottom: '2px solid #e0e0e0', textAlign: 'left', minWidth: 120 }}>Country</th>
                <th style={{ padding: '12px 16px', borderBottom: '2px solid #e0e0e0', textAlign: 'left', minWidth: 220 }}>Email</th>
                <th style={{ padding: '12px 16px', borderBottom: '2px solid #e0e0e0', textAlign: 'center', minWidth: 180 }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inq) => (
                <tr
                  key={inq.id}
                  style={{ cursor: 'pointer', background: selected && selected.id === inq.id ? '#f2f6ff' : '#fff', transition: 'background 0.2s' }}
                  onClick={() => setSelected(inq)}
                >
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0', fontWeight: 500 }}>{inq.subject}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0' }}>{inq.productName}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0' }}>{inq.country}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0' }}>{inq.email}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0', textAlign: 'center' }}>{new Date(inq.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* 상세 보기 */}
      {selected && (
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 36, width: '100%', maxWidth: 700, marginBottom: 40 }}>
          <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 24 }}>문의 상세</h2>
          <div style={{ marginBottom: 12 }}><b>Subject:</b> {selected.subject}</div>
          <div style={{ marginBottom: 12 }}><b>Product:</b> {selected.productName}</div>
          <div style={{ marginBottom: 12 }}><b>Country:</b> {selected.country}</div>
          <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center' }}>
            <b>Email:</b>
            <span style={{ marginLeft: 8 }}>{selected.email}</span>
            <AdminButton onClick={() => copyEmail(selected.email)}>복사</AdminButton>
          </div>
          <div style={{ marginBottom: 12 }}>
            <b>Comments:</b>
            <div style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: 12, background: '#f8f9fa', marginTop: 6, fontSize: 15 }}>{selected.comments}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
            <AdminButton $primary onClick={() => setSelected(null)}>닫기</AdminButton>
          </div>
        </div>
      )}
      {/* 하단 정보 수정 */}
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 36, width: '100%', maxWidth: 700 }}>
        <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 24 }}>CONTACT US 하단 정보 관리</h2>
        {editMode ? (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>주소</label>
              <input style={{ width: '100%', border: '1px solid #e0e0e0', borderRadius: 8, padding: '10px 14px', fontSize: 15 }} value={editInfo.address} onChange={e => setEditInfo({ ...editInfo, address: e.target.value })} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>전화번호</label>
              <input style={{ width: '100%', border: '1px solid #e0e0e0', borderRadius: 8, padding: '10px 14px', fontSize: 15 }} value={editInfo.phone} onChange={e => setEditInfo({ ...editInfo, phone: e.target.value })} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>팩스</label>
              <input style={{ width: '100%', border: '1px solid #e0e0e0', borderRadius: 8, padding: '10px 14px', fontSize: 15 }} value={editInfo.fax} onChange={e => setEditInfo({ ...editInfo, fax: e.target.value })} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>이메일</label>
              <input style={{ width: '100%', border: '1px solid #e0e0e0', borderRadius: 8, padding: '10px 14px', fontSize: 15 }} value={editInfo.email} onChange={e => setEditInfo({ ...editInfo, email: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <AdminButton $primary onClick={saveInfo}>저장</AdminButton>
              <AdminButton onClick={() => setEditMode(false)}>취소</AdminButton>
            </div>
          </>
        ) : (
          <>
            <div style={{ marginBottom: 12, fontSize: 16 }}><b>주소:</b> {mainInfo.address}</div>
            <div style={{ marginBottom: 12, fontSize: 16 }}><b>전화번호:</b> {mainInfo.phone}</div>
            <div style={{ marginBottom: 12, fontSize: 16 }}><b>팩스:</b> {mainInfo.fax}</div>
            <div style={{ marginBottom: 12, fontSize: 16 }}><b>이메일:</b> {mainInfo.email}</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <AdminButton $primary onClick={() => setEditMode(true)}>수정</AdminButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ContactUsAdminPage; 