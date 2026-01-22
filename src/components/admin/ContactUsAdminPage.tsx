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
import { useAdminLang } from '../../App';
import PageHeader from './PageHeader';
import Button from '../common/Button';

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

// 관리자 페이지 공통 레이아웃 스타일
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


const ContactUsAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { adminLang } = useAdminLang();
  const defaultPageContent = {
    title: { en: 'CONTACT US', ko: '문의하기' },
    formTitle: { en: 'Get in Touch', ko: '연락하기' },
    formDesc: {
      en: "Have a question about our products, exploring partnership opportunities, or just want to learn more? We'd love to hear from you. Please fill out the form below and our team will get back to you as soon as possible.",
      ko: '제품에 대한 질문이 있으시거나, 파트너십 기회를 탐색하고 싶으시거나, 더 자세히 알고 싶으시다면? 저희가 도와드리겠습니다. 아래 양식을 작성해 주시면 저희 팀이 최대한 빨리 연락드리겠습니다.'
    },
    subjectOptions: [
      { en: "Where to Buy (Distributors/Retailers)", ko: "구매처 안내 (대리점 / 판매처)" },
      { en: "Product Questions", ko: "제품 관련 문의" },
      { en: "Company Questions", ko: "회사 관련 문의" },
      { en: "Collaboration Proposal", ko: "협업 제안" },
      { en: "Other", ko: "기타 문의" }
    ],
    labels: {
      subject: { en: 'Please select the subject of your inquiry', ko: '문의 주제를 선택해 주세요' },
      product: { en: 'Product Name', ko: '제품명' },
      country: { en: 'Country / City', ko: '국가 / 도시' },
      email: { en: 'Email', ko: '이메일' },
      comments: { en: 'Additional Information', ko: '추가 정보' },
      privacy: { en: "I've read and agree to the terms of the ", ko: '을 읽고 동의합니다' },
      submit: { en: 'Submit', ko: '제출' }
    }
  };
  // 문의 리스트 Firestore 연동
  const [inquiries, setInquiries] = useState<any[]>([]);
  useEffect(() => {
    const q = query(collection(db, "contact_messages"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setInquiries(
        snap.docs.map((d) => {
          const data = d.data();
          // Firestore Timestamp를 Date로 변환
          let createdAt = data.createdAt;
          if (createdAt && typeof createdAt.toDate === 'function') {
            createdAt = createdAt.toDate();
          } else if (createdAt && createdAt.seconds) {
            createdAt = new Date(createdAt.seconds * 1000);
          } else if (!(createdAt instanceof Date)) {
            createdAt = createdAt ? new Date(createdAt) : new Date();
          }
          return { id: d.id, ...data, createdAt };
        })
      );
    });
    return () => unsub();
  }, []);

  // 하단 정보 Firestore 연동
  // Firestore에서 받아올 때 string이면 { en: '', ko: '' }로 변환
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "contact_us_config", "main_info"), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        setMainInfo({
          address: typeof d.address === 'string' ? { en: d.address, ko: '' } : (d.address || { en: '', ko: '' }),
          phone: typeof d.phone === 'string' ? { en: d.phone, ko: '' } : (d.phone || { en: '', ko: '' }),
          fax: typeof d.fax === 'string' ? { en: d.fax, ko: '' } : (d.fax || { en: '', ko: '' }),
          email: typeof d.email === 'string' ? { en: d.email, ko: '' } : (d.email || { en: '', ko: '' })
        });
        setEditInfo({
          address: typeof d.address === 'string' ? { en: d.address, ko: '' } : (d.address || { en: '', ko: '' }),
          phone: typeof d.phone === 'string' ? { en: d.phone, ko: '' } : (d.phone || { en: '', ko: '' }),
          fax: typeof d.fax === 'string' ? { en: d.fax, ko: '' } : (d.fax || { en: '', ko: '' }),
          email: typeof d.email === 'string' ? { en: d.email, ko: '' } : (d.email || { en: '', ko: '' })
        });
      }
    });
    return () => unsub();
  }, []);

  const [selected, setSelected] = useState<any | null>(null);

  // 하단 정보(다국어)
  const [mainInfo, setMainInfo] = useState({
    address: { en: '', ko: '' },
    phone: { en: '', ko: '' },
    fax: { en: '', ko: '' },
    email: { en: '', ko: '' },
  });
  const [editInfo, setEditInfo] = useState(mainInfo);
  const [editMode, setEditMode] = useState(false);
  const [pageContent, setPageContent] = useState(defaultPageContent);

  const { success } = useToast();

  // 이메일 복사
  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    success("이메일이 복사되었습니다.");
  };

  // 하단 정보 저장 (Firestore 업데이트)
  const saveInfo = async () => {
    // 안전하게 변환
    const safeInfo = {
      address: typeof editInfo.address === 'string' ? { en: editInfo.address, ko: '' } : (editInfo.address || { en: '', ko: '' }),
      phone: typeof editInfo.phone === 'string' ? { en: editInfo.phone, ko: '' } : (editInfo.phone || { en: '', ko: '' }),
      fax: typeof editInfo.fax === 'string' ? { en: editInfo.fax, ko: '' } : (editInfo.fax || { en: '', ko: '' }),
      email: typeof editInfo.email === 'string' ? { en: editInfo.email, ko: '' } : (editInfo.email || { en: '', ko: '' })
    };
    try {
      await updateDoc(doc(db, "contact_us_config", "main_info"), safeInfo);
      success("저장되었습니다.");
    } catch (e) {
      await setDoc(doc(db, "contact_us_config", "main_info"), safeInfo);
      success("새 문서로 저장되었습니다.");
    }
    setEditMode(false);
  };

  const savePageContent = async () => {
    try {
      await updateDoc(doc(db, "contact_us_config", "page_content"), pageContent);
      success("저장되었습니다.");
    } catch (e) {
      await setDoc(doc(db, "contact_us_config", "page_content"), pageContent);
      success("새 문서로 저장되었습니다.");
    }
  };

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "contact_us_config", "page_content"), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        const norm = (v: any, fallback: { en: string; ko: string }) => {
          if (typeof v === 'string') return { en: v, ko: v };
          if (v && typeof v === 'object') {
            return {
              en: typeof v.en === 'string' ? v.en : fallback.en,
              ko: typeof v.ko === 'string' ? v.ko : fallback.ko
            };
          }
          return fallback;
        };
        const normOption = (v: any, fallback: { en: string; ko: string }) => {
          if (typeof v === 'string') return { en: v, ko: v };
          if (v && typeof v === 'object') {
            return {
              en: typeof v.en === 'string' ? v.en : fallback.en,
              ko: typeof v.ko === 'string' ? v.ko : fallback.ko
            };
          }
          return fallback;
        };
        const optionsFallback = defaultPageContent.subjectOptions;
        const normalizedOptions = Array.isArray(d.subjectOptions)
          ? d.subjectOptions.map((opt: any, idx: number) => normOption(opt, optionsFallback[idx] || { en: '', ko: '' }))
          : optionsFallback;

        setPageContent({
          title: norm(d.title, defaultPageContent.title),
          formTitle: norm(d.formTitle, defaultPageContent.formTitle),
          formDesc: norm(d.formDesc, defaultPageContent.formDesc),
          subjectOptions: (normalizedOptions && normalizedOptions.length > 0 ? normalizedOptions : optionsFallback) || optionsFallback,
          labels: {
            subject: norm(d.labels?.subject, defaultPageContent.labels.subject),
            product: norm(d.labels?.product, defaultPageContent.labels.product),
            country: norm(d.labels?.country, defaultPageContent.labels.country),
            email: norm(d.labels?.email, defaultPageContent.labels.email),
            comments: norm(d.labels?.comments, defaultPageContent.labels.comments),
            privacy: norm(d.labels?.privacy, defaultPageContent.labels.privacy),
            submit: norm(d.labels?.submit, defaultPageContent.labels.submit)
          }
        });
      }
    });

    return () => unsub();
  }, []);

  const handleOptionChange = (index: number, value: string) => {
    const currentOptions = pageContent.subjectOptions || [];
    const updated = currentOptions.map((opt: any, idx: number) => {
      if (idx !== index) return opt;
      return { ...opt, [adminLang]: value };
    });
    setPageContent({ ...pageContent, subjectOptions: updated });
  };

  const addOption = () => {
    const currentOptions = pageContent.subjectOptions || [];
    setPageContent({
      ...pageContent,
      subjectOptions: [...currentOptions, { en: '', ko: '' }]
    });
  };

  const removeOption = (index: number) => {
    const currentOptions = pageContent.subjectOptions || [];
    setPageContent({
      ...pageContent,
      subjectOptions: currentOptions.filter((_, idx) => idx !== index)
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_login');
    window.location.href = '/admin/login';
  };

  return (
    <AdminLayout>
      <AdminMain>
        <PageHeader 
          title="CONTACT US 문의 관리"
          subtitle="문의 리스트와 하단 정보를 관리합니다"
          showBackButton={false}
          showLogout={false}
        />
        
        <ToastContainer>
          <div></div>
        </ToastContainer>
        
        <div style={{ background: colors.white, borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 36, width: '100%', maxWidth: 1440, marginBottom: 40 }}>
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
                    style={{ cursor: 'pointer', background: selected && selected.id === inq.id ? '#f2f6ff' : colors.white, transition: 'background 0.2s' }}
                    onClick={() => setSelected(inq)}
                  >
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0', fontWeight: 500 }}>{inq.subject}</td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0' }}>{inq.productName}</td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0' }}>{inq.country}</td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0' }}>{inq.email}</td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0', textAlign: 'center' }}>
                      {inq.createdAt && inq.createdAt instanceof Date 
                        ? inq.createdAt.toLocaleString() 
                        : inq.createdAt && typeof inq.createdAt.toDate === 'function'
                        ? inq.createdAt.toDate().toLocaleString()
                        : inq.createdAt && inq.createdAt.seconds
                        ? new Date(inq.createdAt.seconds * 1000).toLocaleString()
                        : inq.createdAt
                        ? new Date(inq.createdAt).toLocaleString()
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* 상세 보기 */}
        {selected && (
          <div style={{ background: colors.white, borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 36, width: '100%', maxWidth: 700, marginBottom: 40 }}>
            <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 24 }}>문의 상세</h2>
            <div style={{ marginBottom: 12 }}><b>Subject:</b> {selected.subject}</div>
            <div style={{ marginBottom: 12 }}><b>Product:</b> {selected.productName}</div>
            <div style={{ marginBottom: 12 }}><b>Country:</b> {selected.country}</div>
            <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center' }}>
              <b>Email:</b>
              <span style={{ marginLeft: 8 }}>{selected.email}</span>
              <Button onClick={() => copyEmail(selected.email)}>복사</Button>
            </div>
            <div style={{ marginBottom: 12 }}>
              <b>Comments:</b>
              <div style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: 12, background: '#f8f9fa', marginTop: 6, fontSize: 15 }}>{selected.comments}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
              <Button variant="primary" onClick={() => setSelected(null)}>닫기</Button>
            </div>
          </div>
        )}
        
        {/* 페이지 콘텐츠 및 폼 라벨 관리 */}
        <div style={{ background: colors.white, borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 36, width: '100%', maxWidth: 1440, marginBottom: 40 }}>
          <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 24 }}>페이지 콘텐츠 및 폼 라벨 관리</h2>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 12 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 700 }}>문의 주제 옵션 (Dropdown Menu)</label>
              <Button onClick={addOption} style={{ minWidth: 120, height: 36 }}>+ 항목 추가</Button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(pageContent.subjectOptions || []).map((opt: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    style={{ width: '100%', border: '1px solid #e0e0e0', borderRadius: 8, padding: '10px 14px', fontSize: 15 }}
                    value={opt?.[adminLang] || ''}
                    onChange={e => handleOptionChange(idx, e.target.value)}
                  />
                  <Button onClick={() => removeOption(idx)} style={{ minWidth: 88, height: 36, whiteSpace: 'nowrap' }}>삭제</Button>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>페이지 제목</label>
            <input
              style={{ width: '100%', border: '1px solid #e0e0e0', borderRadius: 8, padding: '10px 14px', fontSize: 15 }}
              value={pageContent.title[adminLang] || ''}
              onChange={e => setPageContent({ ...pageContent, title: { ...pageContent.title, [adminLang]: e.target.value } })}
            />
            </div>
            <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>폼 제목</label>
            <input
              style={{ width: '100%', border: '1px solid #e0e0e0', borderRadius: 8, padding: '10px 14px', fontSize: 15 }}
              value={pageContent.formTitle[adminLang] || ''}
              onChange={e => setPageContent({ ...pageContent, formTitle: { ...pageContent.formTitle, [adminLang]: e.target.value } })}
            />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>폼 설명</label>
            <textarea
              style={{ width: '100%', border: '1px solid #e0e0e0', borderRadius: 8, padding: '10px 14px', fontSize: 15, minHeight: 120, resize: 'vertical', whiteSpace: 'pre-wrap' }}
              value={pageContent.formDesc[adminLang] || ''}
              onChange={e => setPageContent({ ...pageContent, formDesc: { ...pageContent.formDesc, [adminLang]: e.target.value } })}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>주제(Subject)</label>
            <input
              style={{ width: '100%', border: '1px solid #e0e0e0', borderRadius: 8, padding: '10px 14px', fontSize: 15 }}
              value={pageContent.labels.subject[adminLang] || ''}
              onChange={e => setPageContent({ ...pageContent, labels: { ...pageContent.labels, subject: { ...pageContent.labels.subject, [adminLang]: e.target.value } } })}
            />
            </div>
            <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>제품명</label>
            <input
              style={{ width: '100%', border: '1px solid #e0e0e0', borderRadius: 8, padding: '10px 14px', fontSize: 15 }}
              value={pageContent.labels.product[adminLang] || ''}
              onChange={e => setPageContent({ ...pageContent, labels: { ...pageContent.labels, product: { ...pageContent.labels.product, [adminLang]: e.target.value } } })}
            />
            </div>
            <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>국가/도시</label>
            <input
              style={{ width: '100%', border: '1px solid #e0e0e0', borderRadius: 8, padding: '10px 14px', fontSize: 15 }}
              value={pageContent.labels.country[adminLang] || ''}
              onChange={e => setPageContent({ ...pageContent, labels: { ...pageContent.labels, country: { ...pageContent.labels.country, [adminLang]: e.target.value } } })}
            />
            </div>
            <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>이메일</label>
            <input
              style={{ width: '100%', border: '1px solid #e0e0e0', borderRadius: 8, padding: '10px 14px', fontSize: 15 }}
              value={pageContent.labels.email[adminLang] || ''}
              onChange={e => setPageContent({ ...pageContent, labels: { ...pageContent.labels, email: { ...pageContent.labels.email, [adminLang]: e.target.value } } })}
            />
            </div>
            <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>추가 정보(Comments)</label>
            <input
              style={{ width: '100%', border: '1px solid #e0e0e0', borderRadius: 8, padding: '10px 14px', fontSize: 15 }}
              value={pageContent.labels.comments[adminLang] || ''}
              onChange={e => setPageContent({ ...pageContent, labels: { ...pageContent.labels, comments: { ...pageContent.labels.comments, [adminLang]: e.target.value } } })}
            />
            </div>
            <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>개인정보 동의 문구</label>
            <input
              style={{ width: '100%', border: '1px solid #e0e0e0', borderRadius: 8, padding: '10px 14px', fontSize: 15 }}
              value={pageContent.labels.privacy[adminLang] || ''}
              onChange={e => setPageContent({ ...pageContent, labels: { ...pageContent.labels, privacy: { ...pageContent.labels.privacy, [adminLang]: e.target.value } } })}
            />
            </div>
            <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>제출 버튼 텍스트</label>
            <input
              style={{ width: '100%', border: '1px solid #e0e0e0', borderRadius: 8, padding: '10px 14px', fontSize: 15 }}
              value={pageContent.labels.submit[adminLang] || ''}
              onChange={e => setPageContent({ ...pageContent, labels: { ...pageContent.labels, submit: { ...pageContent.labels.submit, [adminLang]: e.target.value } } })}
            />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <Button variant="primary" onClick={savePageContent}>저장</Button>
          </div>
        </div>

        {/* 하단 정보 수정 */}
        <div style={{ background: colors.white, borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 36, width: '100%', maxWidth: 1440 }}>
          <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 24 }}>CONTACT US 하단 정보 관리</h2>
          {editMode ? (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>주소</label>
                <input style={{ width: '100%', border: '1px solid #e0e0e0', borderRadius: 8, padding: '10px 14px', fontSize: 15 }} value={editInfo.address[adminLang] || ''} onChange={e => setEditInfo({ ...editInfo, address: { ...editInfo.address, [adminLang]: e.target.value } })} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>전화번호</label>
                <input style={{ width: '100%', border: '1px solid #e0e0e0', borderRadius: 8, padding: '10px 14px', fontSize: 15 }} value={editInfo.phone[adminLang] || ''} onChange={e => setEditInfo({ ...editInfo, phone: { ...editInfo.phone, [adminLang]: e.target.value } })} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>팩스</label>
                <input style={{ width: '100%', border: '1px solid #e0e0e0', borderRadius: 8, padding: '10px 14px', fontSize: 15 }} value={editInfo.fax[adminLang] || ''} onChange={e => setEditInfo({ ...editInfo, fax: { ...editInfo.fax, [adminLang]: e.target.value } })} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>이메일</label>
                <input style={{ width: '100%', border: '1px solid #e0e0e0', borderRadius: 8, padding: '10px 14px', fontSize: 15 }} value={editInfo.email[adminLang] || ''} onChange={e => setEditInfo({ ...editInfo, email: { ...editInfo.email, [adminLang]: e.target.value } })} />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <Button variant="primary" onClick={saveInfo}>저장</Button>
                <Button onClick={() => setEditMode(false)}>취소</Button>
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: 12, fontSize: 16 }}><b>주소:</b> {mainInfo.address[adminLang]}</div>
              <div style={{ marginBottom: 12, fontSize: 16 }}><b>전화번호:</b> {mainInfo.phone[adminLang]}</div>
              <div style={{ marginBottom: 12, fontSize: 16 }}><b>팩스:</b> {mainInfo.fax[adminLang]}</div>
              <div style={{ marginBottom: 12, fontSize: 16 }}><b>이메일:</b> {mainInfo.email[adminLang]}</div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                <Button variant="primary" onClick={() => setEditMode(true)}>수정</Button>
              </div>
            </>
          )}
        </div>
      </AdminMain>
    </AdminLayout>
  );
};

export default ContactUsAdminPage; 