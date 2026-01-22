import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
// 아이콘 라이브러리 예시 (Material Icons)
import { LocationOn, Phone, Fax, Email } from "@mui/icons-material";
import axios from "axios";
import { db } from "../firebase";
import { doc, onSnapshot, collection, addDoc } from "firebase/firestore";
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

const DEFAULT_PAGE_CONTENT = {
  title: { en: 'CONTACT US', ko: '문의하기' },
  formTitle: { en: 'Get in Touch', ko: '연락하기' },
  formDesc: {
    en: "Have a question about our products, exploring partnership opportunities, or just want to learn more? We'd love to hear from you. Please fill out the form below and our team will get back to you as soon as possible.",
    ko: '제품에 대한 질문이 있으시거나, 파트너십 기회를 탐색하고 싶으시거나, 더 자세히 알고 싶으시다면? 저희가 도와드리겠습니다. 아래 양식을 작성해 주시면 저희 팀이 최대한 빨리 연락드리겠습니다.'
  },
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
  // localStorage가 'ko'일 때만 한국어, 그 외(null 포함)는 항상 영어
  const [currentLang, setCurrentLang] = useState<'en'|'ko'>(localStorage.getItem('siteLang') === 'ko' ? 'ko' : 'en');

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
      const lang = e?.detail?.language || (localStorage.getItem('siteLang') === 'ko' ? 'ko' : 'en');
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

  const [pageContent, setPageContent] = useState(DEFAULT_PAGE_CONTENT);

  const getText = (val: any, fallback: string) => {
    const resolved = tx(val, currentLang);
    return resolved || fallback;
  };

  const onSubmit = async (data: FormValues) => {
    try {
      // Firestore에 직접 저장
      await addDoc(collection(db, 'contact_messages'), {
        ...data,
        createdAt: new Date(),
      });
      success('Your inquiry has been successfully submitted.');
      reset(); // 폼 초기화
    } catch (err: any) {
      console.error('Contact form submission error:', err);
      const errorMessage = "Submission failed. Please try again later.";
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

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "contact_us_config", "page_content"),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
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

          setPageContent({
            title: norm(data.title, DEFAULT_PAGE_CONTENT.title),
            formTitle: norm(data.formTitle, DEFAULT_PAGE_CONTENT.formTitle),
            formDesc: norm(data.formDesc, DEFAULT_PAGE_CONTENT.formDesc),
            labels: {
              subject: norm(data.labels?.subject, DEFAULT_PAGE_CONTENT.labels.subject),
              product: norm(data.labels?.product, DEFAULT_PAGE_CONTENT.labels.product),
              country: norm(data.labels?.country, DEFAULT_PAGE_CONTENT.labels.country),
              email: norm(data.labels?.email, DEFAULT_PAGE_CONTENT.labels.email),
              comments: norm(data.labels?.comments, DEFAULT_PAGE_CONTENT.labels.comments),
              privacy: norm(data.labels?.privacy, DEFAULT_PAGE_CONTENT.labels.privacy),
              submit: norm(data.labels?.submit, DEFAULT_PAGE_CONTENT.labels.submit)
            }
          });
        }
      }
    );
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-start py-12 mt-[120px] bg-[#fdf8f3] contact-fallback-page px-4">
        <h1 className="text-5xl font-extrabold text-[#5a3723] mb-6 font-pretendard tracking-tight text-center contact-fallback-title">
          {getText(pageContent.title, currentLang === 'ko' ? DEFAULT_PAGE_CONTENT.title.ko : DEFAULT_PAGE_CONTENT.title.en)}
        </h1>
        <form
          className="bg-white rounded-2xl shadow-lg md:p-16 p-4 w-full max-w-4xl border border-gray-200 mt-8 mb-12 text-[1.15rem] font-pretendard contact-fallback-card"
          style={{ fontSize: '1.15rem', minWidth: 'unset' }}
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold text-[#5a3723] font-pretendard mb-4">
              {getText(pageContent.formTitle, currentLang === 'ko' ? DEFAULT_PAGE_CONTENT.formTitle.ko : DEFAULT_PAGE_CONTENT.formTitle.en)}
            </h2>
            <p className="text-lg text-[#8c6450] font-pretendard leading-relaxed max-w-3xl mx-auto whitespace-pre-wrap">
              {getText(pageContent.formDesc, currentLang === 'ko' ? DEFAULT_PAGE_CONTENT.formDesc.ko : DEFAULT_PAGE_CONTENT.formDesc.en)}
            </p>
          </div>

          {/* Left Column */}
          <div className="grid md:grid-cols-2 grid-cols-1 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {getText(pageContent.labels.subject, currentLang === 'ko' ? DEFAULT_PAGE_CONTENT.labels.subject.ko : DEFAULT_PAGE_CONTENT.labels.subject.en)}
              </label>
              <div style={{ position: 'relative', width: '100%' }}>
                <select
                  {...register("subject", { required: true })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:border-[#E5002B] focus:ring-2 focus:ring-[#E5002B] focus:ring-opacity-20 transition-colors contact-fallback-select"
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
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    fontSize: "14px",
                    color: "#6B7280"
                  }}
                >▼</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {getText(pageContent.labels.product, currentLang === 'ko' ? DEFAULT_PAGE_CONTENT.labels.product.ko : DEFAULT_PAGE_CONTENT.labels.product.en)}
              </label>
              <input
                {...register("productName")}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:border-[#E5002B] focus:ring-2 focus:ring-[#E5002B] focus:ring-opacity-20 transition-colors contact-fallback-input"
                placeholder={focus.productName ? "" : (currentLang === 'ko' ? "예: Fire Sauce" : "e.g. Fire Sauce")}
                onFocus={() => setFocus((f) => ({ ...f, productName: true }))}
                onBlur={() => setFocus((f) => ({ ...f, productName: false }))}
              />
            </div>
          </div>
          
          {/* Right Column */}
          <div className="grid md:grid-cols-2 grid-cols-1 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {getText(pageContent.labels.country, currentLang === 'ko' ? DEFAULT_PAGE_CONTENT.labels.country.ko : DEFAULT_PAGE_CONTENT.labels.country.en)}
              </label>
              <input
                {...register("country")}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:border-[#E5002B] focus:ring-2 focus:ring-[#E5002B] focus:ring-opacity-20 transition-colors contact-fallback-input"
                placeholder={focus.country ? "" : (currentLang === 'ko' ? "국가" : "Country")}
                onFocus={() => setFocus((f) => ({ ...f, country: true }))}
                onBlur={() => setFocus((f) => ({ ...f, country: false }))}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {getText(pageContent.labels.email, currentLang === 'ko' ? DEFAULT_PAGE_CONTENT.labels.email.ko : DEFAULT_PAGE_CONTENT.labels.email.en)}
              </label>
              <input
                {...register("email", {
                  required: true,
                  pattern: {
                    value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/,
                    message: currentLang === 'ko' ? "올바른 이메일 주소를 입력해 주세요" : "Please enter a valid email address",
                  },
                })}
                className={`w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:border-[#E5002B] focus:ring-2 focus:ring-[#E5002B] focus:ring-opacity-20 transition-colors contact-fallback-input ${errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                placeholder={focus.email ? "" : "om@ovenmaru.com"}
                onFocus={() => setFocus((f) => ({ ...f, email: true }))}
                onBlur={() => setFocus((f) => ({ ...f, email: false }))}
              />
              {errors.email && (
                <span className="text-xs text-red-500 mt-1">
                  {errors.email.message || (currentLang === 'ko' ? "올바른 이메일 주소를 입력해 주세요" : "Please enter a valid email address")}
                </span>
              )}
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {getText(pageContent.labels.comments, currentLang === 'ko' ? DEFAULT_PAGE_CONTENT.labels.comments.ko : DEFAULT_PAGE_CONTENT.labels.comments.en)}
            </label>
            <textarea
              {...register("comments", {
                required: true,
                maxLength: 2000,
              })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm min-h-[120px] focus:border-[#E5002B] focus:ring-2 focus:ring-[#E5002B] focus:ring-opacity-20 transition-colors resize-none contact-fallback-textarea"
              placeholder={focus.comments ? "" : (currentLang === 'ko' ? "댓글" : "Comments")}
              onFocus={() => setFocus((f) => ({ ...f, comments: true }))}
              onBlur={() => setFocus((f) => ({ ...f, comments: false }))}
              maxLength={2000}
            />
            <div className="text-xs text-right text-gray-400 mt-2">
              {watch("comments")?.length || 0} / 2000
            </div>
            {errors.comments && (
              <span className="text-xs text-red-500 mt-1">
                {currentLang === 'ko' ? "필수 (최대 2000자)" : "Required (max 2000 chars)"}
              </span>
            )}
          </div>
        <div className="mb-8 flex items-start gap-3" style={{ flexWrap: 'nowrap' }}>
            <input
              type="checkbox"
              {...register("agreedPrivacy", { required: true })}
              id="privacy"
              className="mr-3 mt-1 w-5 h-5 text-[#E5002B] border-gray-300 rounded focus:ring-[#E5002B] focus:ring-2 flex-shrink-0"
            />
          <div className="flex-1 flex items-center gap-2" style={{ flexWrap: 'nowrap' }}>
            <label
              htmlFor="privacy"
              className="text-sm text-gray-700 leading-relaxed cursor-pointer inline-flex items-center flex-wrap"
            >
              {currentLang === 'ko' ? (
                <>
                  <span className="font-bold text-[#E5002B] inline-flex items-center" 
                        onClick={(e) => { e.preventDefault(); setShowPrivacy((v) => !v); }}>
                    개인정보처리방침
                    <button
                      type="button"
                      className="text-sm text-[#E5002B] underline hover:text-[#C4002B] transition-colors ml-1"
                      style={{ padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
                    >
                      {showPrivacy ? "▲" : "▼"}
                    </button>
                  </span>
                  {getText(pageContent.labels.privacy, DEFAULT_PAGE_CONTENT.labels.privacy.ko)}
                </>
              ) : (
                <>
                  {getText(pageContent.labels.privacy, DEFAULT_PAGE_CONTENT.labels.privacy.en)}
                  <span className="font-bold text-[#E5002B] inline-flex items-center">
                    privacy policy
                    <button
                      type="button"
                      className="text-sm text-[#E5002B] underline hover:text-[#C4002B] transition-colors"
                      style={{ flexShrink: 0, padding: 0, margin: 0, marginLeft: 0, border: 'none', background: 'none', cursor: 'pointer' }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowPrivacy((v) => !v);
                      }}
                    >
                      {showPrivacy ? "▲" : "▼"}
                    </button>
                  </span>
                </>
              )}
            </label>
            </div>
          </div>
          {showPrivacy && (
            <div className="mb-4 border rounded bg-gray-50 p-4 max-h-48 overflow-y-auto text-xs">
              <style>{`
                .privacy-policy-table { border-collapse: collapse; width: 100%; margin-bottom: 16px; font-size: 13px; }
                .privacy-policy-table th, .privacy-policy-table td { border: 1px solid #bbb; padding: 6px 8px; text-align: left; background: #fff; }
                .privacy-policy-table th { background: #f5f5f5; font-weight: 700; }
                .privacy-policy-table tr:nth-child(even) td { background: #fafafa; }
              `}</style>
              <div dangerouslySetInnerHTML={{ 
                __html: (currentLang === 'ko' ? privacyPolicy.ko : privacyPolicy.en).replace(/<table /g, '<table class="privacy-policy-table" ') 
              }} />
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-gray-300 hover:bg-gray-400 text-white py-3 rounded-lg mt-6 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base transition-colors duration-200 contact-fallback-submit"
            disabled={!watch("agreedPrivacy")}
          >
            {getText(pageContent.labels.submit, currentLang === 'ko' ? DEFAULT_PAGE_CONTENT.labels.submit.ko : DEFAULT_PAGE_CONTENT.labels.submit.en)}
          </button>
        </form>
        {/* 하단 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16 w-full max-w-6xl px-4">
          <div className="h-48 flex flex-col items-center justify-center border border-gray-200 rounded-2xl p-6 bg-white shadow font-pretendard">
            <LocationOn fontSize="large" className="text-[#E5002B]" />
            <div className="font-bold mt-2 text-base text-center">
              {currentLang === 'ko' ? '본사' : 'OUR MAIN OFFICE'}
            </div>
            <div className="text-xs text-center mt-1 text-[#5a3723] break-words">{tx(mainInfo.address, currentLang)}</div>
          </div>
          <div className="h-48 flex flex-col items-center justify-center border border-gray-200 rounded-2xl p-6 bg-white shadow font-pretendard">
            <Phone fontSize="large" className="text-[#E5002B]" />
            <div className="font-bold mt-2 text-base text-center">
              {currentLang === 'ko' ? '전화번호' : 'PHONE NUMBER'}
            </div>
            <div className="text-xs text-center mt-1 whitespace-pre-line text-[#5a3723] break-words">{tx(mainInfo.phone, currentLang)}</div>
          </div>
          <div className="h-48 flex flex-col items-center justify-center border border-gray-200 rounded-2xl p-6 bg-white shadow font-pretendard">
            <Fax fontSize="large" className="text-[#E5002B]" />
            <div className="font-bold mt-2 text-base text-center">
              {currentLang === 'ko' ? '팩스' : 'FAX'}
            </div>
            <div className="text-xs text-center mt-1 whitespace-pre-line text-[#5a3723] break-words">{tx(mainInfo.fax, currentLang)}</div>
          </div>
          <div className="h-48 flex flex-col items-center justify-center border border-gray-200 rounded-2xl p-6 bg-white shadow font-pretendard">
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