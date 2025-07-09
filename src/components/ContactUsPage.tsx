import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
// 아이콘 라이브러리 예시 (Material Icons)
import { LocationOn, Phone, Fax, Email } from "@mui/icons-material";
import axios from "axios";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import privacyPolicy from "../assets/privacyPolicy.json";
import { useToast } from './common/ToastContext';
import Toast from './common/Toast';
import ToastContainer from './common/ToastContainer';
import Header from './Header';

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
  const [submitStatus, setSubmitStatus] = useState<null | "success" | "error">(null);
  const [submitError, setSubmitError] = useState<string>("");
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormValues>({
    mode: "onBlur",
    defaultValues: { agreedPrivacy: false },
  });

  const onSubmit = async (data: FormValues) => {
    setSubmitStatus(null);
    setSubmitError("");
    try {
      // Firebase Functions 엔드포인트 주소 (로컬/배포 환경에 따라 변경 필요)
      const endpoint = process.env.REACT_APP_CONTACT_API || "/sendContactUs";
      await axios.post(endpoint, {
        ...data,
        createdAt: new Date().toISOString(),
      });
      setSubmitStatus("success");
    } catch (err: any) {
      setSubmitStatus("error");
      setSubmitError(err?.response?.data?.error || "Submission failed");
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
    address: "",
    phone: "",
    fax: "",
    email: "",
  });

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "contact_us_config", "main_info"),
      (docSnap) => {
        if (docSnap.exists()) {
          setMainInfo(docSnap.data() as typeof mainInfo);
        }
      }
    );
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-start py-12 mt-[120px] bg-[#fdf8f3]">
        <h1 className="text-4xl font-extrabold text-[#5a3723] mb-8 font-pretendard tracking-tight">CONTACT US</h1>
        <form
          className="bg-white rounded-2xl shadow-lg p-16 w-full max-w-3xl border-2 border-[#e5e5e5] mt-8 mb-12 text-[1.15rem] font-pretendard"
          style={{ minWidth: 480, fontSize: '1.15rem' }}
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="mb-8">
            <b className="text-2xl font-extrabold text-[#5a3723] font-pretendard">Get in Touch</b>
            <p className="text-base text-[#8c6450] mt-2 font-pretendard">
              Have a question about our products, exploring partnership opportunities, or just want to learn more? We'd love to hear from you. Please fill out the form below and our team will get back to you as soon as possible.
            </p>
          </div>
          {submitStatus === "success" && (
            <div className="text-green-600 text-center mb-2">문의가 성공적으로 접수되었습니다.</div>
          )}
          {submitStatus === "error" && (
            <div className="text-red-600 text-center mb-2">{submitError}</div>
          )}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold mb-1">
                Please select the subject of your inquiry
              </label>
              <select
                {...register("subject", { required: true })}
                className="w-full border rounded px-3 py-2 text-sm"
                onFocus={() => setFocus((f) => ({ ...f, subject: true }))}
                onBlur={() => setFocus((f) => ({ ...f, subject: false }))}
                defaultValue=""
              >
                <option value="" disabled hidden>
                  {focus.subject ? "" : "Choose here"}
                </option>
                {SUBJECT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {errors.subject && (
                <span className="text-xs text-red-500">Required</span>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Product Name</label>
              <input
                {...register("productName")}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder={focus.productName ? "" : "e.g. Fire Sauce"}
                onFocus={() => setFocus((f) => ({ ...f, productName: true }))}
                onBlur={() => setFocus((f) => ({ ...f, productName: false }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold mb-1">Country / City</label>
              <input
                {...register("country")}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder={focus.country ? "" : "Country"}
                onFocus={() => setFocus((f) => ({ ...f, country: true }))}
                onBlur={() => setFocus((f) => ({ ...f, country: false }))}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Contact Address</label>
              <input
                {...register("email", {
                  required: true,
                  pattern: {
                    value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/,
                    message: "Please enter a valid email address",
                  },
                })}
                className={`w-full border rounded px-3 py-2 text-sm ${errors.email ? "border-red-500" : ""}`}
                placeholder={focus.email ? "" : "om@ovenmaru.com"}
                onFocus={() => setFocus((f) => ({ ...f, email: true }))}
                onBlur={() => setFocus((f) => ({ ...f, email: false }))}
              />
              {errors.email && (
                <span className="text-xs text-red-500">{errors.email.message || "Please enter a valid email address"}</span>
              )}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-bold mb-1">Additional Information</label>
            <textarea
              {...register("comments", {
                required: true,
                maxLength: 2000,
              })}
              className="w-full border rounded px-3 py-2 text-sm min-h-[100px]"
              placeholder={focus.comments ? "" : "Comments"}
              onFocus={() => setFocus((f) => ({ ...f, comments: true }))}
              onBlur={() => setFocus((f) => ({ ...f, comments: false }))}
              maxLength={2000}
            />
            <div className="text-xs text-right text-gray-400">
              {watch("comments")?.length || 0} / 2000
            </div>
            {errors.comments && (
              <span className="text-xs text-red-500">Required (max 2000 chars)</span>
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
              I've read and agree to the terms of the <b>privacy policy</b>
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
              <pre className="whitespace-pre-wrap">{privacyPolicy.en}</pre>
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-gray-300 text-white py-2 rounded mt-2 disabled:opacity-50"
            disabled={!watch("agreedPrivacy")}
          >
            Submit
          </button>
        </form>
        {/* 하단 정보 */}
        <div className="grid grid-cols-4 gap-6 mt-16 w-full max-w-4xl">
          <div className="flex flex-col items-center border rounded-2xl p-6 bg-white shadow font-pretendard">
            <LocationOn fontSize="large" className="text-[#E5002B]" />
            <div className="font-bold mt-2 text-base">OUR MAIN OFFICE</div>
            <div className="text-xs text-center mt-1 text-[#5a3723]">{mainInfo.address}</div>
          </div>
          <div className="flex flex-col items-center border rounded-2xl p-6 bg-white shadow font-pretendard">
            <Phone fontSize="large" className="text-[#E5002B]" />
            <div className="font-bold mt-2 text-base">PHONE NUMBER</div>
            <div className="text-xs text-center mt-1 whitespace-pre-line text-[#5a3723]">{mainInfo.phone}</div>
          </div>
          <div className="flex flex-col items-center border rounded-2xl p-6 bg-white shadow font-pretendard">
            <Fax fontSize="large" className="text-[#E5002B]" />
            <div className="font-bold mt-2 text-base">FAX</div>
            <div className="text-xs text-center mt-1 whitespace-pre-line text-[#5a3723]">{mainInfo.fax}</div>
          </div>
          <div className="flex flex-col items-center border rounded-2xl p-6 bg-white shadow font-pretendard">
            <Email fontSize="large" className="text-[#E5002B]" />
            <div className="font-bold mt-2 text-base">EMAIL</div>
            <div className="text-xs text-center mt-1 text-[#5a3723]">{mainInfo.email}</div>
          </div>
        </div>
      </main>
      {/* 푸터 등은 별도 컴포넌트 사용 */}
    </div>
  );
};

export default ContactUsPage; 