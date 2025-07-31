import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
// 아이콘 라이브러리 예시 (Material Icons)
import { LocationOn, Phone, Fax, Email } from "@mui/icons-material";
import axios from "axios";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import privacyPolicy from "../assets/privacyPolicy.json";
import { useToast } from './common/ToastContext';
import Header from './Header';
import Footer from './Footer';

// 개인정보보호 약관 전문 (static 파일 import)
// const privacyPolicy = `...`; // 기존 코드 제거

const SUBJECT_OPTIONS = [
  "Where to Buy (Distributors/Retailers)",
  "Product Questions",
  "Company Questions",
  "Collaboration Proposal",
  "Other",
];

type FormValues = {
  subject: string;
  productName: string;
  country: string;
  email: string;
  comments: string;
  agreedPrivacy: boolean;
};

const ContactUsPage: React.FC = () => {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [currentLang, setCurrentLang] = useState<'en'|'ko'>(localStorage.getItem('siteLang') === 'en' ? 'en' : 'ko');

  const { success, error } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormValues>({
    mode: "onBlur",
    defaultValues: { agreedPrivacy: false },
  });

  // 언어 변경 이벤트 리스너
  useEffect(() => {
    const onLang = (e: any) => {
      const lang = e?.detail?.language || (localStorage.getItem('siteLang') === 'en' ? 'en' : 'ko');
      setCurrentLang(lang);
    };
    window.addEventListener('languageChange', onLang);
    window.addEventListener('storage', onLang);
    return () => {
      window.removeEventListener('languageChange', onLang);
      window.removeEventListener('storage', onLang);
    };
  }, []);

  // 다국어 안전 추출 유틸
  function tx(val: any, lang: 'en'|'ko'): string {
    if (val == null) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      if (typeof val[lang] === 'string') return val[lang];
      if (typeof val.en === 'string') return val.en;
      if (typeof val.ko === 'string') return val.ko;
    }
    return ''; // 객체가 오면 빈 문자열로 안전하게
  }

  const onSubmit = async (data: FormValues) => {
    try {
      // Contact Us API 호출 경로를 항상 배포된 Cloud Function URL로 고정
      const endpoint = 'https://us-central1-omfood-a621d.cloudfunctions.net/sendContactUs';
      
      await axios.post(endpoint, {
        ...data,
        createdAt: new Date().toISOString(),
      });
      success('문의가 성공적으로 접수되었습니다.');
      reset(); // 폼 초기화
    } catch (err: any) {
      console.error('Contact form submission error:', err);
      const errorMessage = err?.response?.data?.error || "Submission failed. Please try again later.";
      error(errorMessage);
    }
  };

  // placeholder 제거용 state
  const [focus, setFocus] = useState({
    subject: false,
    productName: false,
    country: false,
    email: false,
    comments: false,
  });

  // 하단 정보 Firestore 연동
  const [mainInfo, setMainInfo] = useState({
    address: { en: "", ko: "" },
    phone: { en: "", ko: "" },
    fax: { en: "", ko: "" },
    email: { en: "", ko: "" },
  });

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "contact_us_config", "main_info"),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Firestore 스냅샷 호환 변환 (옛/새 스키마 동시 지원)
          const norm = (v: any) => (typeof v === 'string' ? { en: v, ko: v } : (v || { en: '', ko: '' }));
          const payload = {
            address: norm(data.address),
            phone: norm(data.phone),
            fax: norm(data.fax),
            email: norm(data.email),
          };
          setMainInfo(payload);
        }
      }
    );
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-start py-12 mt-[120px] bg-[#fdf8f3]">
        <h1 className="text-4xl font-extrabold text-[#5a3723] mb-8 font-pretendard tracking-tight">
          {currentLang === 'ko' ? '문의하기' : 'CONTACT US'}
        </h1>
        <form
          className="bg-white rounded-2xl shadow-lg p-16 w-full max-w-3xl border-2 border-[#e5e5e5] mt-8 mb-12 text-[1.15rem] font-pretendard"
          style={{ minWidth: 480, fontSize: '1.15rem' }}
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="mb-8">
            <b className="text-2xl font-extrabold text-[#5a3723] font-pretendard">
              {currentLang === 'ko' ? '연락하기' : 'Get in Touch'}
            </b>
            <p className="text-base text-[#8c6450] mt-2 font-pretendard">
              {currentLang === 'ko' 
                ? '제품에 대한 질문이 있으시거나, 파트너십 기회를 탐색하고 싶으시거나, 더 자세히 알고 싶으시다면? 저희가 도와드리겠습니다. 아래 양식을 작성해 주시면 저희 팀이 최대한 빨리 연락드리겠습니다.'
                : 'Have a question about our products, exploring partnership opportunities, or just want to learn more? We\'d love to hear from you. Please fill out the form below and our team will get back to you as soon as possible.'
              }
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold mb-1">
                {currentLang === 'ko' ? '문의 주제를 선택해 주세요' : 'Please select the subject of your inquiry'}
              </label>
              <div style={{ position: 'relative', width: '100%' }}>
                <select
                  {...register("subject", { required: true })}
                  className="w-full border rounded px-3 py-2 text-sm"
                  style={{ appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none', width: '100%' }}
                  onFocus={() => setFocus((f) => ({ ...f, subject: true }))}
                  onBlur={() => setFocus((f) => ({ ...f, subject: false }))}
                  defaultValue=""
                >
                  <option value="" disabled hidden>
                    {focus.subject ? "" : (currentLang === 'ko' ? "선택해 주세요" : "Choose here")}
                  </option>
                  {SUBJECT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <span
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%) scale(0.5)",
                    pointerEvents: "none",
                    fontSize: "1.2em",
                    lineHeight: 1
                  }}
                >▼</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">
                {currentLang === 'ko' ? '제품명' : 'Product Name'}
              </label>
              <input
                {...register("productName")}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder={focus.productName ? "" : (currentLang === 'ko' ? "예: Fire Sauce" : "e.g. Fire Sauce")}
                onFocus={() => setFocus((f) => ({ ...f, productName: true }))}
                onBlur={() => setFocus((f) => ({ ...f, productName: false }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold mb-1">
                {currentLang === 'ko' ? '국가 / 도시' : 'Country / City'}
              </label>
              <input
                {...register("country")}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder={focus.country ? "" : (currentLang === 'ko' ? "국가" : "Country")}
                onFocus={() => setFocus((f) => ({ ...f, country: true }))}
                onBlur={() => setFocus((f) => ({ ...f, country: false }))}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">
                {currentLang === 'ko' ? '이메일' : 'Email'}
              </label>
              <input
                {...register("email", {
                  required: true,
                  pattern: {
                    value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/,
                    message: currentLang === 'ko' ? "올바른 이메일 주소를 입력해 주세요" : "Please enter a valid email address",
                  },
                })}
                className={`w-full border rounded px-3 py-2 text-sm ${errors.email ? "border-red-500" : ""}`}
                placeholder={focus.email ? "" : "om@ovenmaru.com"}
                onFocus={() => setFocus((f) => ({ ...f, email: true }))}
                onBlur={() => setFocus((f) => ({ ...f, email: false }))}
              />
              {errors.email && (
                <span className="text-xs text-red-500">
                  {errors.email.message || (currentLang === 'ko' ? "올바른 이메일 주소를 입력해 주세요" : "Please enter a valid email address")}
                </span>
              )}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-bold mb-1">
              {currentLang === 'ko' ? '추가 정보' : 'Additional Information'}
            </label>
            <textarea
              {...register("comments", {
                required: true,
                maxLength: 2000,
              })}
              className="w-full border rounded px-3 py-2 text-sm min-h-[100px]"
              placeholder={focus.comments ? "" : (currentLang === 'ko' ? "댓글" : "Comments")}
              onFocus={() => setFocus((f) => ({ ...f, comments: true }))}
              onBlur={() => setFocus((f) => ({ ...f, comments: false }))}
              maxLength={2000}
            />
            <div className="text-xs text-right text-gray-400">
              {watch("comments")?.length || 0} / 2000
            </div>
            {errors.comments && (
              <span className="text-xs text-red-500">
                {currentLang === 'ko' ? "필수 (최대 2000자)" : "Required (max 2000 chars)"}
              </span>
            )}
          </div>
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              {...register("agreedPrivacy", { required: true })}
              id="privacy"
              className="mr-2"
            />
            <label htmlFor="privacy" className="text-xs">
              {currentLang === 'ko' 
                ? '개인정보처리방침을 읽고 동의합니다'
                : 'I\'ve read and agree to the terms of the <b>privacy policy</b>'
              }
            </label>
            <button
              type="button"
              className="ml-2 text-xs underline"
              onClick={() => setShowPrivacy((v) => !v)}
            >
              {showPrivacy ? "▲" : "▼"}
            </button>
          </div>
          {showPrivacy && (
            <div className="mb-4 border rounded bg-gray-50 p-4 max-h-48 overflow-y-auto text-xs">
              <style>{`
                .privacy-policy-table { border-collapse: collapse; width: 100%; margin-bottom: 16px; font-size: 13px; }
                .privacy-policy-table th, .privacy-policy-table td { border: 1px solid #bbb; padding: 6px 8px; text-align: left; background: #fff; }
                .privacy-policy-table th { background: #f5f5f5; font-weight: 700; }
                .privacy-policy-table tr:nth-child(even) td { background: #fafafa; }
              `}</style>
              <div dangerouslySetInnerHTML={{ __html: privacyPolicy.en.replace(/<table /g, '<table class="privacy-policy-table" ') }} />
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-gray-300 text-white py-2 rounded mt-2 disabled:opacity-50"
            disabled={!watch("agreedPrivacy")}
          >
            {currentLang === 'ko' ? '제출' : 'Submit'}
          </button>
        </form>
        {/* 하단 정보 */}
        <div className="contactBoxGrid mt-16 w-full max-w-4xl items-stretch">
          <div className="h-48 flex-1 flex flex-col items-center justify-center border rounded-2xl p-6 bg-white shadow font-pretendard contactBox w-full min-w-0 break-words">
            <LocationOn fontSize="large" className="text-[#E5002B]" />
            <div className="font-bold mt-2 text-base text-center">
              {currentLang === 'ko' ? '본사' : 'OUR MAIN OFFICE'}
            </div>
            <div className="text-xs text-center mt-1 text-[#5a3723] break-words">{tx(mainInfo.address, currentLang)}</div>
          </div>
          <div className="h-48 flex-1 flex flex-col items-center justify-center border rounded-2xl p-6 bg-white shadow font-pretendard contactBox w-full min-w-0 break-words">
            <Phone fontSize="large" className="text-[#E5002B]" />
            <div className="font-bold mt-2 text-base text-center">
              {currentLang === 'ko' ? '전화번호' : 'PHONE NUMBER'}
            </div>
            <div className="text-xs text-center mt-1 whitespace-pre-line text-[#5a3723] break-words">{tx(mainInfo.phone, currentLang)}</div>
          </div>
          <div className="h-48 flex-1 flex flex-col items-center justify-center border rounded-2xl p-6 bg-white shadow font-pretendard contactBox w-full min-w-0 break-words">
            <Fax fontSize="large" className="text-[#E5002B]" />
            <div className="font-bold mt-2 text-base text-center">
              {currentLang === 'ko' ? '팩스' : 'FAX'}
            </div>
            <div className="text-xs text-center mt-1 whitespace-pre-line text-[#5a3723] break-words">{tx(mainInfo.fax, currentLang)}</div>
          </div>
          <div className="h-48 flex-1 flex flex-col items-center justify-center border rounded-2xl p-6 bg-white shadow font-pretendard contactBox w-full min-w-0 break-words">
            <Email fontSize="large" className="text-[#E5002B]" />
            <div className="font-bold mt-2 text-base text-center">
              {currentLang === 'ko' ? '이메일' : 'EMAIL'}
            </div>
            <div className="text-xs text-center mt-1 text-[#5a3723] break-words">{tx(mainInfo.email, currentLang)}</div>
          </div>
        </div>
      </main>
      {/* 푸터 등은 별도 컴포넌트 사용 */}
      <Footer />
    </div>
  );
};

export default ContactUsPage; 