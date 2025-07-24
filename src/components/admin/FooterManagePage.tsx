import React, { useEffect, useState } from 'react';
import { db, storage } from '../../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import styled from 'styled-components';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useToast } from '../common/ToastContext';
import { useAdminLang } from '../../App';

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
  privacyPolicy: {
    ko: { button: string; title: string; content: string };
    en: { button: string; title: string; content: string };
  };
  emailReject: {
    ko: { button: string; title: string; content: string };
    en: { button: string; title: string; content: string };
  };
}

const DEFAULT_PRIVACY_POLICY = `<div>\
  <strong>개인정보처리방침</strong>\
  <hr style=\"margin: 12px 0;\" />\
  <div style=\"margin-bottom: 12px;\">\
    (이하 ‘회사’라 함)은(는) 개인정보보호법에 따라 이용자의 개인정보 보호 및 권익을 보호하고 개인정보와 관련한 이용자의 고충을 원활하게 처리할 수 있도록 다음과 같은 처리방침을 두고 있습니다. 회사는 개인정보처리방침을 개정하는 경우 웹사이트 공지사항(또는 개별공지)을 통하여 공지할 것입니다. 본 방침은 년 월 일부부터 시행됩니다.\
  </div>\
  <ol>\
    <li>\
      <strong>1. 개인정보의 수집 및 이용 목적</strong><br/>\
      회사는 개인정보를 다음의 목적을 위해 처리합니다. 처리한 개인정보는 다음의 목적 이외의 용도로 사용되지 않으며 이용 목적이 변경될 경우에는 개인정보 보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.<br/>\
      - 고객상담 : 가입 관련 문의 확인 및 연락통지, 처리결과 통보 등을 목적으로 개인정보를 처리합니다.<br/>\
      - 정보제공 : 회사에서 주최하는 프로그램에 대한 정보 제공 등의 목적으로 개인정보를 처리합니다.<br/>\
      - 홈페이지\
    </li>\
    <li>\
      <strong>2. 처리하는 개인정보 항목</strong><br/>\
      회사는 다음의 개인정보 항목을 처리하고 있습니다.<br/>\
      - 필수항목 : 이름, 연락처 (접속 IP 정보, 쿠키, 서비스 이용 기록, 접속 로그)<br/>\
      - 선택항목 : 없음\
    </li>\
    <li>\
      <strong>3. 개인정보의 처리 및 보유 기간</strong><br/>\
      회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의 받은 개인정보 보유, 이용기간 내에서 개인정보를 처리, 보유합니다.<br/>\
      ① 구체적인 개인정보 처리 및 보유 기간은 다음과 같습니다.<br/>\
      - 고객상담 : 이용자의 문의 확인 및 답변을 위한 연락통지, 처리결과 통보 등을 목적으로 개인정보를 처리합니다.<br/>\
      - 정보제공 : 회사에서 주최하는 프로그램에 대한 정보 제공 등의 목적으로 개인정보를 처리합니다.<br/>\
      - 개인정보 보유기간 : 5년\
    </li>\
    <li>\
      <strong>4. 개인정보의 파기</strong><br/>\
      회사는 원칙적으로 개인정보 처리목적의 달성된 경우에는 보유기간을 거친 후 지체 없이 해당 개인정보를 파기합니다. 파기의 절차, 기한 및 방법은 다음과 같습니다.<br/>\
      - 파기절차 : 이용자가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져(종이의 경우 별도의 서류) 내부 방침 및 기타 관련 법령에 따라 일정기간 저장된 후 혹은 즉시 파기됩니다. 이 때, DB로 옮겨진 개인정보는 법률에 의한 경우가 아니고서는 다른 목적으로 이용되지 않습니다.<br/>\
      - 파기기한 : 이용자의 개인정보는 개인정보의 보유기간이 경과된 경우에는 보유기간의 종료일부터 5일 이내에, 개인정보의 처리 목적 달성, 해당 서비스의 폐지, 사업의 종료 등 그 개인정보가 불필요하게 되었을 때에는 개인정보의 처리가 불필요한 것으로 인정되는 날로부터 5일 이내에 파기합니다.<br/>\
      - 파기방법 : 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용합니다. 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각을 통하여 파기합니다.\
    </li>\
    <li>\
      <strong>5. 개인정보의 제3자 제공에 관한 사항</strong><br/>\
      회사는 원칙적으로 이용자의 개인정보를 수집 및 이용 목적에서 명시한 범위 내에서 처리하며, 이용자의 사전 동의 없이는 본래의 범위를 초과하여 처리하거나 제3자에게 제공하지 않습니다. 단, 다음의 경우에는 개인정보를 처리할 수 있습니다.<br/>\
      - 이용자가 사전에 제3자 제공 및 공개에 동의한 경우<br/>\
      - 법령 등에 의해 제공이 요구되는 경우<br/>\
      - 서비스의 제공에 관한 계약의 이행을 위하여 필요한 개인정보로서 경제적/기술적인 사유로 동의를 받는 것이 현저히 곤란한 경우<br/>\
      - 개인을 식별하기에 특정할 수 없는 상태로 가공하여 이용하는 경우<br/>\
      - 개인정보를 제공받는 자, 이용목적, 제공하는 개인정보 항목, 보유 및 이용기간 등에 대한 안내를 받은 경우\
    </li>\
    <li>\
      <strong>6. 개인정보 처리의 위탁</strong><br/>\
      회사는 개인정보를 위탁하지 않으며, 개인정보를 위탁하게 될 시 최소 15일 전에 별도로 공지사항을 통해 공지한 뒤 개인정보 취급방침을 개정합니다.\
    </li>\
    <li>\
      <strong>7. 정보주체의 권리, 의무 및 행사방법</strong><br/>\
      정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.<br/>\
      가. 개인정보 열람요구<br/>\
      나. 오류 등이 있을 경우 정정 요구<br/>\
      다. 삭제요구<br/>\
      라. 처리정지 요구\
    </li>\
    <li>\
      <strong>8. 개인정보 수집 장치의 설치, 운영 및 거부에 관한 사항</strong><br/>\
      회사는 고객님의 정보를 수시로 저장하고 찾아내는 ‘쿠키(cookie)’ 등을 운용합니다.<br/>\
      - 쿠키란?<br/>\
      - 쿠키는 웹사이트를 운영하는데 이용되는 서버가 이용자의 브라우저에 보내는 아주 작은 텍스트 파일로 이용자 컴퓨터의 하드디스크에 저장됩니다. 이용자께서 웹 브라우저의 옵션을 설정함으로써 모든 쿠키를 허용하거나, 쿠키가 저장될 때마다 확인을 거치거나, 아니면 모든 쿠키의 저장을 거부할 수도 있습니다.<br/>\
      - 단, 쿠키의 저장을 거부할 경우에는 일부 서비스 이용에 어려움이 있을 수 있습니다.<br/>\
      - 쿠키 설치 허용 여부를 지정하는 방법(Internet Explorer의 경우)은 다음과 같습니다.<br/>\
      (1) [도구] 메뉴에서 [인터넷 옵션]을 선택합니다.<br/>\
      (2) [개인정보 탭]을 클릭합니다.<br/>\
      (3) [개인정보취급 수준]을 설정하시면 됩니다.\
    </li>\
    <li>\
      <strong>9. 개인정보관리책임자</strong><br/>\
      회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.<br/>\
      - 개인정보 보호 책임자<br/>\
      - 부서명 : 운영기획부<br/>\
      - 담당자 : 교육팀<br/>\
      - 연락처 : 010-3087-2772\
    </li>\
  </ol>\
</div>`;

const DEFAULT_EMAIL_REJECT = `<div>\
  <strong>이메일무단수집거부</strong>\
  <hr style=\"margin: 12px 0;\" />\
  <div style=\"margin-bottom: 12px;\">\
    이용자에게 무차별적으로 보내지는 타사의 메일을 차단하기 위해,<br/>\
    본 웹사이트에 게시된 이메일 주소가 전자우편 수집 프로그램이나 그 밖의 기술적 장치를 이용하여 무단으로 수집되는 것을 거부하며,<br/>\
    이를 위반시 정보통신망법에 의해 형사처벌됨을 유념하시기 바랍니다.\
  </div>\
  <div>[게시일 년 월 일]</div>\
</div>`;

const DEFAULT_PRIVACY_POLICY_KO = {
  button: '개인정보처리방침',
  title: '개인정보처리방침',
  content: DEFAULT_PRIVACY_POLICY,
};
const DEFAULT_PRIVACY_POLICY_EN = {
  button: 'Privacy Policy',
  title: 'Privacy Policy',
  content: '<div><strong>Privacy Policy</strong><hr style="margin: 12px 0;" /><div style="margin-bottom: 12px;">This is the English privacy policy. Please provide the actual content.</div></div>',
};
const DEFAULT_EMAIL_REJECT_KO = {
  button: '이메일무단수집거부',
  title: '이메일무단수집거부',
  content: DEFAULT_EMAIL_REJECT,
};
const DEFAULT_EMAIL_REJECT_EN = {
  button: 'Email Rejection Notice',
  title: 'Email Rejection Notice',
  content: '<div><strong>Email Rejection Notice</strong><hr style="margin: 12px 0;" /><div style="margin-bottom: 12px;">This is the English email rejection notice. Please provide the actual content.</div></div>',
};

const defaultConfig: FooterConfig = {
  links: [],
  sns: [],
  copyright: '',
  privacyPolicy: {
    ko: DEFAULT_PRIVACY_POLICY_KO,
    en: DEFAULT_PRIVACY_POLICY_EN,
  },
  emailReject: {
    ko: DEFAULT_EMAIL_REJECT_KO,
    en: DEFAULT_EMAIL_REJECT_EN,
  },
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
  const [privacyPolicy, setPrivacyPolicy] = useState({
    ko: { ...DEFAULT_PRIVACY_POLICY_KO },
    en: { ...DEFAULT_PRIVACY_POLICY_EN },
  });
  const [emailReject, setEmailReject] = useState({
    ko: { ...DEFAULT_EMAIL_REJECT_KO },
    en: { ...DEFAULT_EMAIL_REJECT_EN },
  });
  const [privacyPolicyHtmlMode, setPrivacyPolicyHtmlMode] = useState(false);
  const [emailRejectHtmlMode, setEmailRejectHtmlMode] = useState(false);
  const { success } = useToast();
  const { adminLang, setAdminLang } = useAdminLang();

  // 언어 변경 핸들러
  const handleAdminLangChange = (lang: 'ko' | 'en') => {
    setAdminLang(lang);
  };

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
        setPrivacyPolicy(data.privacyPolicy || { ko: DEFAULT_PRIVACY_POLICY_KO, en: DEFAULT_PRIVACY_POLICY_EN });
        setEmailReject(data.emailReject || { ko: DEFAULT_EMAIL_REJECT_KO, en: DEFAULT_EMAIL_REJECT_EN });
        setPrivacyPolicyHtmlMode(false); // 기본적으로 시각 편집 모드로 시작
        setEmailRejectHtmlMode(false); // 기본적으로 시각 편집 모드로 시작
      } else {
        setFooterConfig(null);
        setEditLinks([]);
        setEditSNS([]);
        setCopyright('');
        setPrivacyPolicy({ ko: DEFAULT_PRIVACY_POLICY_KO, en: DEFAULT_PRIVACY_POLICY_EN });
        setEmailReject({ ko: DEFAULT_EMAIL_REJECT_KO, en: DEFAULT_EMAIL_REJECT_EN });
        setPrivacyPolicyHtmlMode(false); // 데이터가 없을 때도 시각 편집 모드로 변경
        setEmailRejectHtmlMode(false); // 데이터가 없을 때도 시각 편집 모드로 변경
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
      privacyPolicy,
      emailReject,
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
      privacyPolicy,
      emailReject,
    });
    setSaving(false);
    success('저장되었습니다');
  };

  const handleDeleteLink = async (idx: number) => {
    const updated = editLinks.filter((_, i) => i !== idx);
    setSaving(true);
    await setDoc(doc(db, 'footer_config', 'main'), {
      ...(footerConfig || defaultConfig),
      links: updated,
      sns: editSNS,
      copyright,
      privacyPolicy,
      emailReject,
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
      privacyPolicy,
      emailReject,
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
      privacyPolicy,
      emailReject,
    });
    setSaving(false);
    success('저장되었습니다');
  };

  const handleDeleteSNS = async (idx: number) => {
    const updated = editSNS.filter((_, i) => i !== idx);
    setSaving(true);
    await setDoc(doc(db, 'footer_config', 'main'), {
      ...(footerConfig || defaultConfig),
      links: editLinks,
      sns: updated,
      copyright,
      privacyPolicy,
      emailReject,
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
      privacyPolicy,
      emailReject,
    });
    setSaving(false);
    success('저장되었습니다');
  };

  // 개인정보처리방침 저장
  const handleSavePrivacyPolicy = async () => {
    setSaving(true);
    await setDoc(doc(db, 'footer_config', 'main'), {
      ...(footerConfig || defaultConfig),
      links: editLinks,
      sns: editSNS,
      copyright,
      privacyPolicy,
      emailReject,
    });
    setSaving(false);
    success('저장되었습니다');
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={() => handleAdminLangChange('en')} style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer', outline: 'none', opacity: adminLang === 'en' ? 1 : 0.5 }}>
              <img src={process.env.PUBLIC_URL + '/america.png'} alt="EN" style={{ width: 32, height: 32, objectFit: 'contain' }} />
            </button>
            <button onClick={() => handleAdminLangChange('ko')} style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer', outline: 'none', opacity: adminLang === 'ko' ? 1 : 0.5 }}>
              <img src={process.env.PUBLIC_URL + '/korea.png'} alt="KO" style={{ width: 32, height: 32, objectFit: 'contain' }} />
            </button>
            <AdminLogoutBtn onClick={() => {
              localStorage.removeItem('admin_login');
              window.location.href = '/admin/login';
            }}>
              로그아웃
            </AdminLogoutBtn>
          </div>
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

        {/* 개인정보처리방침/이메일무단수집거부 관리 */}
        <AdminCard>
          <SectionTitle>개인정보처리방침 / 이메일무단수집거부 관리</SectionTitle>
          <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
            <AdminButton $primary={adminLang === 'ko'} disabled style={{ padding: '8px 18px', margin: 0 }}>한국어 관리</AdminButton>
            <AdminButton $primary={adminLang === 'en'} disabled style={{ padding: '8px 18px', margin: 0 }}>English 관리</AdminButton>
          </div>
          <AdminLabel>개인정보처리방침 버튼명</AdminLabel>
          <AdminInput
            value={privacyPolicy[adminLang]?.button ?? ''}
            onChange={e => setPrivacyPolicy(prev => ({ ...prev, [adminLang]: { ...prev[adminLang], button: e.target.value } }))}
            placeholder={adminLang === 'ko' ? '개인정보처리방침' : 'Privacy Policy'}
            style={{ marginBottom: 12 }}
          />
          <AdminLabel>개인정보처리방침 모달 제목</AdminLabel>
          <AdminInput
            value={privacyPolicy[adminLang]?.title ?? ''}
            onChange={e => setPrivacyPolicy(prev => ({ ...prev, [adminLang]: { ...prev[adminLang], title: e.target.value } }))}
            placeholder={adminLang === 'ko' ? '개인정보처리방침' : 'Privacy Policy'}
            style={{ marginBottom: 12 }}
          />
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <AdminButton $primary={!privacyPolicyHtmlMode} onClick={() => setPrivacyPolicyHtmlMode(false)} style={{ padding: '8px 18px', margin: 0 }}>시각 편집</AdminButton>
            <AdminButton $primary={privacyPolicyHtmlMode} onClick={() => setPrivacyPolicyHtmlMode(true)} style={{ padding: '8px 18px', margin: 0 }}>HTML 편집</AdminButton>
          </div>
          {privacyPolicyHtmlMode ? (
            <>
              <AdminLabel>개인정보처리방침 본문 (HTML 가능)</AdminLabel>
              <textarea
                value={privacyPolicy[adminLang]?.content ?? ''}
                onChange={e => setPrivacyPolicy(prev => ({ ...prev, [adminLang]: { ...prev[adminLang], content: e.target.value } }))}
                placeholder={adminLang === 'ko' ? '개인정보처리방침 내용을 입력하세요.' : 'Enter privacy policy content.'}
                style={{ width: '100%', minHeight: 180, fontSize: '1rem', fontFamily: 'Pretendard, sans-serif', marginBottom: 18, borderRadius: 8, border: `1.5px solid ${colors.grayBorder}`, padding: 16 }}
              />
            </>
          ) : (
            <>
              <AdminLabel>개인정보처리방침 본문 (시각 편집)</AdminLabel>
              <ReactQuill
                value={privacyPolicy[adminLang]?.content ?? ''}
                onChange={val => setPrivacyPolicy(prev => ({ ...prev, [adminLang]: { ...prev[adminLang], content: val } }))}
                style={{ marginBottom: 18, background: '#fff' }}
                theme="snow"
              />
            </>
          )}
          <AdminLabel>이메일무단수집거부 버튼명</AdminLabel>
          <AdminInput
            value={emailReject[adminLang]?.button ?? ''}
            onChange={e => setEmailReject(prev => ({ ...prev, [adminLang]: { ...prev[adminLang], button: e.target.value } }))}
            placeholder={adminLang === 'ko' ? '이메일무단수집거부' : 'Email Rejection Notice'}
            style={{ marginBottom: 12 }}
          />
          <AdminLabel>이메일무단수집거부 모달 제목</AdminLabel>
          <AdminInput
            value={emailReject[adminLang]?.title ?? ''}
            onChange={e => setEmailReject(prev => ({ ...prev, [adminLang]: { ...prev[adminLang], title: e.target.value } }))}
            placeholder={adminLang === 'ko' ? '이메일무단수집거부' : 'Email Rejection Notice'}
            style={{ marginBottom: 12 }}
          />
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <AdminButton $primary={!emailRejectHtmlMode} onClick={() => setEmailRejectHtmlMode(false)} style={{ padding: '8px 18px', margin: 0 }}>시각 편집</AdminButton>
            <AdminButton $primary={emailRejectHtmlMode} onClick={() => setEmailRejectHtmlMode(true)} style={{ padding: '8px 18px', margin: 0 }}>HTML 편집</AdminButton>
          </div>
          {emailRejectHtmlMode ? (
            <>
              <AdminLabel>이메일무단수집거부 본문 (HTML 가능)</AdminLabel>
              <textarea
                value={emailReject[adminLang]?.content ?? ''}
                onChange={e => setEmailReject(prev => ({ ...prev, [adminLang]: { ...prev[adminLang], content: e.target.value } }))}
                placeholder={adminLang === 'ko' ? '이메일무단수집거부 내용을 입력하세요.' : 'Enter email rejection notice content.'}
                style={{ width: '100%', minHeight: 120, fontSize: '1rem', fontFamily: 'Pretendard, sans-serif', marginBottom: 18, borderRadius: 8, border: `1.5px solid ${colors.grayBorder}`, padding: 16 }}
              />
            </>
          ) : (
            <>
              <AdminLabel>이메일무단수집거부 본문 (시각 편집)</AdminLabel>
              <ReactQuill
                value={emailReject[adminLang]?.content ?? ''}
                onChange={val => setEmailReject(prev => ({ ...prev, [adminLang]: { ...prev[adminLang], content: val } }))}
                style={{ marginBottom: 18, background: '#fff' }}
                theme="snow"
              />
            </>
          )}
          <AdminButton onClick={handleSavePrivacyPolicy} disabled={saving} style={{ width: 'auto' }}>
            저장
          </AdminButton>
          <PreviewBox>
            <strong>개인정보처리방침 (프리뷰)</strong>
            <div style={{ marginTop: 8, background: '#fff', padding: 12, borderRadius: 8, minHeight: 80 }} dangerouslySetInnerHTML={{ __html: String(privacyPolicy[adminLang]?.content || (adminLang === 'ko' ? '개인정보처리방침 미입력' : 'No privacy policy content')) }} />
            <strong style={{ marginTop: 18, display: 'block' }}>이메일무단수집거부 (프리뷰)</strong>
            <div style={{ marginTop: 8, background: '#fff', padding: 12, borderRadius: 8, minHeight: 60 }} dangerouslySetInnerHTML={{ __html: String(emailReject[adminLang]?.content || (adminLang === 'ko' ? '이메일무단수집거부 미입력' : 'No email rejection notice content')) }} />
          </PreviewBox>
        </AdminCard>
      </AdminMain>
    </AdminLayout>
  );
};

export default FooterManagePage; 