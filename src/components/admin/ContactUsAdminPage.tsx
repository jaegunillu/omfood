import React, { useState, useEffect } from "react";
// 아이콘 예시 (Material Icons)
import { ContentCopy } from "@mui/icons-material";
import { db } from "../../firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, setDoc } from "firebase/firestore";
import { useToast } from '../common/ToastContext';
import Toast from '../common/Toast';
import ToastContainer from '../common/ToastContainer';
import { useNavigate } from 'react-router-dom';

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
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center py-12 font-pretendard">
      <div className="w-full max-w-4xl flex items-center justify-between mb-8">
        <button
          className="px-6 py-3 bg-white border border-[#E0E0E0] rounded-lg shadow hover:bg-orange-100 text-base font-semibold transition-colors"
          onClick={() => navigate('/admin/dashboard')}
        >
          ← 대시보드로
        </button>
        <button
          className="px-6 py-3 bg-white border border-[#E0E0E0] rounded-lg shadow hover:bg-orange-100 text-base font-semibold transition-colors"
          onClick={handleLogout}
        >
          로그아웃
        </button>
      </div>
      <h1 className="text-3xl font-extrabold mb-10 text-[#111]">CONTACT US 문의 관리</h1>
      <ToastContainer>{null}</ToastContainer>
      <div className="bg-white rounded shadow p-6 w-full max-w-4xl mb-8">
        <h2 className="font-bold mb-4">문의 리스트</h2>
        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">Subject</th>
              <th className="border px-2 py-1">Product</th>
              <th className="border px-2 py-1">Country</th>
              <th className="border px-2 py-1">Email</th>
              <th className="border px-2 py-1">Date</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inq) => (
              <tr
                key={inq.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => setSelected(inq)}
              >
                <td className="border px-2 py-1">{inq.subject}</td>
                <td className="border px-2 py-1">{inq.productName}</td>
                <td className="border px-2 py-1">{inq.country}</td>
                <td className="border px-2 py-1">{inq.email}</td>
                <td className="border px-2 py-1">{new Date(inq.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* 상세 보기 */}
      {selected && (
        <div className="bg-white rounded shadow p-6 w-full max-w-2xl mb-8">
          <h2 className="font-bold mb-4">문의 상세</h2>
          <div className="mb-2">
            <b>Subject:</b> {selected.subject}
          </div>
          <div className="mb-2">
            <b>Product:</b> {selected.productName}
          </div>
          <div className="mb-2">
            <b>Country:</b> {selected.country}
          </div>
          <div className="mb-2 flex items-center">
            <b>Email:</b>
            <span className="ml-2">{selected.email}</span>
            <button
              className="ml-2 text-gray-500 hover:text-black"
              onClick={() => copyEmail(selected.email)}
              title="이메일 복사"
            >
              <ContentCopy fontSize="small" />
            </button>
          </div>
          <div className="mb-2">
            <b>Comments:</b>
            <div className="border rounded p-2 bg-gray-50 mt-1 text-sm">
              {selected.comments}
            </div>
          </div>
          <button
            className="mt-4 px-4 py-2 bg-gray-200 rounded"
            onClick={() => setSelected(null)}
          >
            닫기
          </button>
        </div>
      )}
      {/* 하단 정보 수정 */}
      <div className="bg-white rounded shadow p-6 w-full max-w-2xl">
        <h2 className="font-bold mb-4">CONTACT US 하단 정보 관리</h2>
        {editMode ? (
          <>
            <div className="mb-2">
              <label className="block text-xs font-bold mb-1">주소</label>
              <input
                className="w-full border rounded px-2 py-1"
                value={editInfo.address}
                onChange={(e) => setEditInfo({ ...editInfo, address: e.target.value })}
              />
            </div>
            <div className="mb-2">
              <label className="block text-xs font-bold mb-1">전화번호</label>
              <input
                className="w-full border rounded px-2 py-1"
                value={editInfo.phone}
                onChange={(e) => setEditInfo({ ...editInfo, phone: e.target.value })}
              />
            </div>
            <div className="mb-2">
              <label className="block text-xs font-bold mb-1">팩스</label>
              <input
                className="w-full border rounded px-2 py-1"
                value={editInfo.fax}
                onChange={(e) => setEditInfo({ ...editInfo, fax: e.target.value })}
              />
            </div>
            <div className="mb-2">
              <label className="block text-xs font-bold mb-1">이메일</label>
              <input
                className="w-full border rounded px-2 py-1"
                value={editInfo.email}
                onChange={(e) => setEditInfo({ ...editInfo, email: e.target.value })}
              />
            </div>
            <button className="bg-blue-500 text-white px-4 py-2 rounded mr-2" onClick={saveInfo}>저장</button>
            <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => setEditMode(false)}>취소</button>
          </>
        ) : (
          <>
            <div className="mb-2"><b>주소:</b> {mainInfo.address}</div>
            <div className="mb-2"><b>전화번호:</b> {mainInfo.phone}</div>
            <div className="mb-2"><b>팩스:</b> {mainInfo.fax}</div>
            <div className="mb-2"><b>이메일:</b> {mainInfo.email}</div>
            <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => setEditMode(true)}>수정</button>
          </>
        )}
      </div>
    </div>
  );
};

export default ContactUsAdminPage; 