import React, { useState, useEffect } from 'react';
import { db, storage } from '../../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAdminLang } from '../../App';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// File: /src/components/admin/AboutPage_admin.tsx
// [주의] 오직 이 파일만 수정하고, 다른 파일은 절대 건드리지 마세요.

interface ImagePosition {
  x: number;
  y: number;
}

interface HistoryEntry {
  year: string;
  contents: string[];
}

interface AboutContent {
  // 헤더 섹션
  headerImage: string;
  headerImagePos?: ImagePosition;
  headerTitle: string;
  headerSubtitle: string;
  
  // 경영 이념 섹션
  philosophyTitle: string;
  philosophySubtitle: string;
  philosophyItems: string[];
  philosophyImage: string;
  philosophyImagePos?: ImagePosition;
  
  // 기업 정신 섹션
  spiritTitle: string;
  spiritSubtitle: string;
  spiritItems: string[];
  spiritImage: string;
  spiritImagePos?: ImagePosition;
  
  // 핵심 슬로건 섹션
  sloganText: string;
  sloganImage: string;
  sloganImagePos?: ImagePosition;
  
  // 대표 메시지 섹션
  messageTitle: string;
  messageContent: string;
  representativeName: string;
  messageImage: string;
  messageImagePos?: ImagePosition;
  introMainSlogan: string;
  section1Label: string;
  section1LabelSize: string;
  section1Title: string;
  section1TitleSize: string;
  section1Content: string;
  section1ContentSize: string;
  section1Image: string;
  section2Label: string;
  section2LabelSize: string;
  section2Title: string;
  section2TitleSize: string;
  section2Content: string;
  section2ContentSize: string;
  section2Image: string;
  section3Label: string;
  section3LabelSize: string;
  section3Title: string;
  section3TitleSize: string;
  section3Content: string;
  section3ContentSize: string;
  section3Image: string;
  visionMessage: string;
  historyItems: HistoryEntry[];
  historyTitle: string;
  historySubtitle: string;
  certificates: Array<{ id: string; image: string; caption: string }>;
}

const defaultHistoryItems: HistoryEntry[] = [
  {
    year: '2025',
    contents: [
      'Selected for the Global Market Expansion Capability Strengthening Voucher Program (KOTRA)',
      'Acquired MAINBiz (Management Innovation SME) Certification',
      'Acquired Venture Company Certification (Korea)',
      'Launched the Grilled Barbecue Series & Spicy Cream Mayo Series'
    ]
  },
  {
    year: '2024',
    contents: [
      'Established an Industry–Academia Cooperation Framework with the Kwangwoon University Industry-Academic Cooperation Foundation',
      'Founded the Ovenmaru Chicken R&D Center'
    ]
  },
  {
    year: '2023',
    contents: ['Ovenmaru Mongolia – First Store Grand Opening']
  },
  {
    year: '2022',
    contents: [
      'Selected as a Promising Franchise Growth-Stage Support Company (Ministry of SMEs and Startups / Korea SME & Startups Agency)',
      'Selected for the Overseas Certification Registration Support Program (Korea Food Research Institute)',
      'Selected for the Overseas Expansion Voucher Program for Food Service Companies (aT – Korea Agro-Fisheries & Food Trade Corporation)'
    ]
  },
  {
    year: '2021',
    contents: [
      'Selected for the Overseas Expansion Voucher Program for Food Service Companies (aT – Korea Agro-Fisheries & Food Trade Corporation)',
      'Introduced the Welfare Club Service',
      'Launched the Ovenmaru Core Care System (Franchise-focused management system)',
      'Launched 3 new pizza menu items'
    ]
  },
  {
    year: '2020',
    contents: [
      'Selected for the Overseas Expansion Voucher Program for Food Service Companies (aT – Korea Agro-Fisheries & Food Trade Corporation)',
      'Selected for the Win-Win Franchise Cooperation Support Program (Ministry of SMEs and Startups / KOSMES)',
      'Signed a Financial Support MOU with Shinhan Bank',
      'Sponsored advertisement on SBS “Animal Farm” (TV Show)'
    ]
  },
  {
    year: '2019',
    contents: [
      'Selected for the Profit-Sharing Franchise Development Support Program (Ministry of SMEs and Startups)',
      'Selected for the 2019 Data Voucher Program (Ministry of Science and ICT)',
      'Selected for the 2019 Employee Vacation Support Program (Ministry of Culture, Sports and Tourism)',
      'Launched new menu items (Hanoi Chicken Bun Cha, Chicken & Bread Platter, Chicken Mapo Tofu Soup)',
      'Acquired ISO 22000:2018 (Food Safety Management System)',
      'Selected as a Next-Generation World-Class Product (2019)'
    ]
  },
  {
    year: '2018',
    contents: [
      'Reached 150 Ovenmaru Chicken Stores Nationwide',
      'Launched new menu items (Bulgogi Roast, Maru Tteokbokki, Cheese Tteokbokki, Boneless Chicken Feet, Stir-fried Garlic Gizzard)',
      'Won No.1 Excellence Brand Award (JungAng Ilbo, 2018)'
    ]
  },
  {
    year: '2017',
    contents: [
      'Acquired ISO 9001:2015',
      'Launched Ovenmaru Chicken Wing & Stick Menu',
      'Reached 140 Stores Nationwide'
    ]
  },
  {
    year: '2016',
    contents: [
      'Signed Food Bank Support Agreement with Gireum Social Welfare Center',
      'Sponsored advertisement on SBS K-POP Star',
      'Launched Oppane Baked Chicken',
      'Changed chicken size standard from No.8 → No.9',
      'Won Korea First Class Brand Award',
      'Signed contract for First Ho Chi Minh Branch (Vietnam)',
      'Launched new menu items (Jackson Chicken, Spicy Chicken Feet)',
      'Reached 120 Stores Nationwide',
      'Grand Opening of 1st Ho Chi Minh Store (Vietnam)'
    ]
  },
  {
    year: '2015',
    contents: [
      'Company name changed to OM Food Co., Ltd.',
      'Launched new menu items (Honey Butter Bake, Bburings Bake, Garlic Roast, Cheese Chicken Stir-fry, Maru Mulbaeng-i)',
      'Opened Daegu Branch Office',
      'Selected as one of Korea’s Good Companies',
      'Won No.1 Consumer Preference Brand Award',
      'Sponsored tvN Drama “Bubblegum”',
      'Sponsored SBS “Running Man”',
      'Sponsored MBC “Surprise”',
      'Opened 90th Ovenmaru Store'
    ]
  },
  {
    year: '2014',
    contents: [
      'Launched new menu items (Guobaorou Bake, Garlic-holic Bake, Salad Boneless Roast & Bake)',
      'Signed Taiwan Branch Agreement',
      'Opened Gwangju / Jeonnam Branch',
      'Opened 1st Taipei Store (Taiwan)',
      'Opened Daejeon / Chungcheong Branch',
      'Reached 60 Stores Nationwide'
    ]
  },
  {
    year: '2013',
    contents: [
      'Launched new menu items (Carbonara Boneless Bake, Kkanpung Roast, Spicy Chicken Roast)',
      'Reached 20 Stores Nationwide'
    ]
  },
  {
    year: '2012',
    contents: [
      'Established chain headquarters Good F&C',
      'Started franchise business',
      'Opened Busan Branch Office',
      'Applied for Ovenmaru Chicken Trademark Registration'
    ]
  },
  {
    year: '2010',
    contents: ['Began Brand R&D']
  }
];

const cloneHistoryItems = (): HistoryEntry[] =>
  defaultHistoryItems.map(item => ({
    year: item.year,
    contents: [...item.contents]
  }));

const mergeContent = (base: AboutContent, incoming?: Partial<AboutContent>): AboutContent => {
  if (!incoming) return base;
  return {
    ...base,
    ...incoming,
    historyItems:
      incoming.historyItems && incoming.historyItems.length
        ? incoming.historyItems
        : base.historyItems,
    certificates:
      incoming.certificates && incoming.certificates.length
        ? incoming.certificates
        : (base.certificates || [])
  };
};

const AboutPageAdmin: React.FC = () => {
  const { adminLang } = useAdminLang();
  
  // 한국어 콘텐츠 상태
  const [koContent, setKoContent] = useState<AboutContent>({
    headerImage: '',
    headerTitle: '진심이 담긴 맛',
    headerSubtitle: 'OM FOOD',
    philosophyTitle: '경영 이념',
    philosophySubtitle: '체계적이고 조직적인 가맹점 관리와 철저한 사후관리',
    philosophyItems: [
      '완벽한 책임경영, 투명한 기업경영',
      '수입의 일부 사회 환원(각종 봉사활동 실시, 장례)',
      '고객의 기호에 맞는 신 메뉴 개발 강화 및 지속적 개발',
      '고객에게는 참신하고 새로운 맛과 분위기로 성공브랜드 정착',
      '지속적이고 철저한 사후관리로 믿음과 신뢰를 바탕으로 한 가맹점 우수경영'
    ],
    philosophyImage: '',
    spiritTitle: '기업 정신',
    spiritSubtitle: '고객의 만족을 최우선으로 미래를 지향하는 기업이 되겠습니다.',
    spiritItems: [
      '모든 식재료에 있어 안전성과 신뢰를 최우선으로 생각하겠습니다.',
      '차별화, 고급화, 동일화를 사명으로 한 고객 지향적 기업이 되겠습니다.',
      '가맹점과 상생을 바탕으로, 신뢰와 협력의 동반성장 모델을 구축하겠습니다.',
      '최고의 맛과 서비스 및 분위기 제공, 고객만족을 추구하는 기업이 되겠습니다.',
      '표준 메뉴얼과 체계화된 교육프로그램으로 사전교육, 사후관리를 철저히 실시 하도록 하겠습니다.'
    ],
    spiritImage: '',
    sloganText: '음식은\n먹는 사람도\n파는 사람도\n건강해야 한다',
    sloganImage: '',
    messageTitle: '글로벌 K-푸드 시대를 이끄는 외식문화 선도기업 OM FOOD',
    messageContent: `OM FOOD는 건강하고 정직한 식문화를 통해 고객의 일상에 따뜻한 가치를 더하는 것을 목표로 합니다.

기름에 튀기지 않고 오븐에 구워내는 등 본사만의 특별한 조리방식은 현대인의 건강 트렌드에 부합하며, 식재료 본연의 맛과 영양을 지키는 조리 철학을 바탕으로 보다 건강하고 안심할 수 있는 음식을 제공합니다.

또한, OM FOOD는 단순한 프랜차이즈를 넘어 K-푸드의 글로벌화를 선도하는 브랜드로 나아가고 있습니다. 한국의 전통적인 식재료와 조리법에 현대적인 감각을 더해 전 세계 소비자들에게 새로운 식문화의 경험을 제안합니다.

세계 여러 나라의 식문화와 고객의 입맛을 연구하고, 이를 반영한 현지 맞춤형 메뉴와 서비스로 글로벌 외식시장에서의 경쟁력을 확보해 나가고 있습니다.

OM FOOD는 앞으로도 건강한 재료, 정직한 조리, 감동 있는 서비스로 고객의 신뢰를 쌓아가며 K-푸드를 대표하는 글로벌 외식 브랜드로 성장하겠습니다.`,
    representativeName: '대표이사 박성우',
    messageImage: '',
    introMainSlogan: '건강과 맛, 그리고 즐거움\n오엠푸드가 만드는 새로운 식문화',
    section1Label: '우리의 철학',
    section1LabelSize: '1rem',
    section1Title: '우리의 철학',
    section1TitleSize: '2.5rem',
    section1Content: '음식은 먹는 사람도, 파는 사람도 건강해야 합니다. 오엠푸드는 재료 선정부터 조리, 배송 과정까지 모든 단계에서 건강과 안전을 최우선 가치로 둡니다. 오랜 시간 축적한 노하우와 위생 시스템을 통해 고객이 믿고 먹을 수 있는 한 끼를 만들며, 진심이 담긴 맛으로 일상의 휴식을 선물합니다.',
    section1ContentSize: '1.1rem',
    section1Image: '',
    section2Label: '우리의 브랜드',
    section2LabelSize: '1rem',
    section2Title: '우리의 브랜드',
    section2TitleSize: '2.5rem',
    section2Content: '다양한 맛과 즐거움을 전하는 푸드 브랜드를 지향합니다. 한국의 정체성을 담되 세계 어디서나 사랑받을 수 있는 메뉴를 고민하며, 감각적인 비주얼과 스토리를 더해 브랜드 경험의 깊이를 확장합니다. 한 끼의 만족이 고객의 일상 에너지가 되도록 지속적인 실험을 이어갑니다.',
    section2ContentSize: '1.1rem',
    section2Image: '',
    section3Label: '우리의 도전',
    section3LabelSize: '1rem',
    section3Title: '우리의 도전',
    section3TitleSize: '2.5rem',
    section3Content: '변화하는 식문화 속에서 끊임없는 혁신으로 한계를 넘어섭니다. 데이터 기반의 연구와 글로벌 파트너십을 통해 새로운 시장을 개척하고, 현지화 전략으로 더 넓은 고객과 만납니다. 건강한 음식, 행복한 식탁이라는 비전을 향해 오늘도 더 나은 맛과 가치를 만듭니다.',
    section3ContentSize: '1.1rem',
    section3Image: '',
    visionMessage: '건강한 음식, 행복한 식탁\n오엠푸드는 오늘도 더 나은 맛과 가치를 만듭니다.',
    historyItems: cloneHistoryItems(),
    historyTitle: '기업 연혁',
    historySubtitle: '2010년부터 현재까지 OM FOOD가 걸어온 길입니다.',
    certificates: []
  });

  // 영어 콘텐츠 상태
  const [enContent, setEnContent] = useState<AboutContent>({
    headerImage: '',
    headerTitle: 'Taste with Sincerity',
    headerSubtitle: 'OM FOOD',
    philosophyTitle: 'Management Philosophy',
    philosophySubtitle: 'Systematic and organized franchise management and thorough after-sales service',
    philosophyItems: [
      'Perfect responsible management, transparent corporate management',
      'Part of income is returned to society (various volunteer activities, etc.)',
      'Strengthening and continuous development of new menu development to suit customer preferences',
      'Establishing a successful brand with fresh and new tastes and atmosphere for customers',
      'Excellent franchise management based on trust and reliability through continuous and thorough after-sales service'
    ],
    philosophyImage: '',
    spiritTitle: 'Corporate Spirit',
    spiritSubtitle: 'We will be a company that prioritizes customer satisfaction and aims for the future.',
    spiritItems: [
      'We will prioritize safety and trust in all ingredients.',
      'We will become a customer-oriented company with a mission of differentiation, advancement, and standardization.',
      'We will build a mutual growth model based on trust and cooperation with franchisees.',
      'We will become a company that pursues customer satisfaction by providing the best taste, service, and atmosphere.',
      'We will thoroughly implement pre-education and after-sales management through standardized manuals and systematic education programs.'
    ],
    spiritImage: '',
    sloganText: 'Food must be healthy\nfor both those who eat it\nand those who sell it',
    sloganImage: '',
    messageTitle: 'OM FOOD, a leading restaurant culture company that leads the global K-Food era',
    messageContent: `OM FOOD aims to add warm value to customers' daily lives through healthy and honest food culture.

Our unique cooking methods, such as baking in an oven instead of frying, align with modern health trends and provide healthier and safer food based on a cooking philosophy that preserves the natural taste and nutrients of ingredients.

Furthermore, OM FOOD is moving beyond a simple franchise to become a brand that leads the globalization of K-Food. It proposes a new culinary experience to consumers worldwide by adding a modern touch to traditional Korean ingredients and cooking methods.

By researching the food cultures and tastes of various countries around the world and reflecting them in localized menus and services, OM FOOD is securing its competitiveness in the global dining market.

OM FOOD will continue to grow as a global dining brand representing K-Food, building customer trust with healthy ingredients, honest cooking, and impressive service.`,
    representativeName: 'CEO Park Sung-woo',
    messageImage: '',
    introMainSlogan: 'Health, Flavor, and Joy\nA New Dining Culture by OM FOOD',
    section1Label: 'Our Philosophy',
    section1LabelSize: '1rem',
    section1Title: 'Our Philosophy',
    section1TitleSize: '2.5rem',
    section1Content: 'Food should keep both the diner and the maker healthy. OM FOOD prioritizes safety from sourcing to cooking and delivery, combining proven know-how with strict hygiene systems. Every bite is prepared with sincerity so customers can trust what they eat and feel comfort in every meal.',
    section1ContentSize: '1.1rem',
    section1Image: '',
    section2Label: 'Our Brand',
    section2LabelSize: '1rem',
    section2Title: 'Our Brand',
    section2TitleSize: '2.5rem',
    section2Content: 'We are a food brand that delivers diverse flavors and delightful experiences. While rooted in Korean identity, we design menus that resonate globally, pairing modern storytelling with distinctive presentation to deepen the brand experience. Each menu aims to energize daily life and inspire curiosity.',
    section2ContentSize: '1.1rem',
    section2Image: '',
    section3Label: 'Our Challenge',
    section3LabelSize: '1rem',
    section3Title: 'Our Challenge',
    section3TitleSize: '2.5rem',
    section3Content: 'We continue to innovate within the ever-changing culinary landscape. Data-driven research and global partnerships open new markets, while tailored localization helps us connect with more customers. Guided by the vision of healthy food and happy tables, we relentlessly pursue better taste and value.',
    section3ContentSize: '1.1rem',
    section3Image: '',
    visionMessage: 'Healthy Food, Happy Tables\nOM FOOD keeps creating better flavors and values.',
    historyItems: cloneHistoryItems(),
    historyTitle: 'Company History',
    historySubtitle: 'Milestones that shaped OM FOOD from 2010 to today.',
    certificates: []
  });

  const currentContent = adminLang === 'ko' ? koContent : enContent;
  const setCurrentContent = adminLang === 'ko' ? setKoContent : setEnContent;

  // 이미지 업로드 핸들러
  const handleImageUpload = async (field: keyof AboutContent, file: File) => {
    try {
      const fileRef = storageAvailableRef(field, file);
      await uploadBytes(fileRef, file);
      const downloadUrl = await getDownloadURL(fileRef);
      // 두 언어 상태 모두 업데이트
      setKoContent(prev => ({ ...prev, [field]: downloadUrl }));
      setEnContent(prev => ({ ...prev, [field]: downloadUrl }));
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    }
  };

  // 이미지 포커스 포인트 클릭 핸들러
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>, posField: keyof AboutContent) => {
    const img = e.currentTarget;
    const rect = img.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const position = { x: Math.round(x), y: Math.round(y) };
    
    // 두 언어 상태 모두 업데이트
    setKoContent(prev => ({
      ...prev,
      [posField]: position
    }));
    setEnContent(prev => ({
      ...prev,
      [posField]: position
    }));
  };

  const storageAvailableRef = (field: keyof AboutContent, file: File) => {
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const safeField = String(field);
    return storageRef(storage, `about/${safeField}_${timestamp}.${extension || 'jpg'}`);
  };

  // 리스트 아이템 추가
  const addListItem = (field: 'philosophyItems' | 'spiritItems') => {
    setCurrentContent(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  // 리스트 아이템 삭제
  const removeListItem = (field: 'philosophyItems' | 'spiritItems', index: number) => {
    setCurrentContent(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  // 리스트 아이템 업데이트
  const updateListItem = (field: 'philosophyItems' | 'spiritItems', index: number, value: string) => {
    setCurrentContent(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addHistoryYear = () => {
    setCurrentContent(prev => ({
      ...prev,
      historyItems: [{ year: '', contents: [''] }, ...(prev.historyItems || [])]
    }));
  };

  const removeHistoryYear = (index: number) => {
    setCurrentContent(prev => ({
      ...prev,
      historyItems: prev.historyItems.filter((_, i) => i !== index)
    }));
  };

  const updateHistoryYear = (index: number, value: string) => {
    setCurrentContent(prev => ({
      ...prev,
      historyItems: prev.historyItems.map((entry, i) =>
        i === index ? { ...entry, year: value } : entry
      )
    }));
  };

  const addHistoryContentLine = (index: number) => {
    setCurrentContent(prev => ({
      ...prev,
      historyItems: prev.historyItems.map((entry, i) =>
        i === index ? { ...entry, contents: [...entry.contents, ''] } : entry
      )
    }));
  };

  const updateHistoryContentLine = (index: number, contentIndex: number, value: string) => {
    setCurrentContent(prev => ({
      ...prev,
      historyItems: prev.historyItems.map((entry, i) =>
        i === index
          ? {
              ...entry,
              contents: entry.contents.map((content, ci) =>
                ci === contentIndex ? value : content
              )
            }
          : entry
      )
    }));
  };

  const removeHistoryContentLine = (index: number, contentIndex: number) => {
    setCurrentContent(prev => ({
      ...prev,
      historyItems: prev.historyItems.map((entry, i) =>
        i === index
          ? {
              ...entry,
              contents: entry.contents.filter((_, ci) => ci !== contentIndex).length
                ? entry.contents.filter((_, ci) => ci !== contentIndex)
                : ['']
            }
          : entry
      )
    }));
  };

  // Firebase에서 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        const koDoc = await getDoc(doc(db, 'about', 'ko'));
        const enDoc = await getDoc(doc(db, 'about', 'en'));
        
        const enData = enDoc.exists() ? (enDoc.data() as Partial<AboutContent>) : null;
        const koData = koDoc.exists() ? (koDoc.data() as Partial<AboutContent>) : null;
        
        // 영문 데이터의 이미지 필드들을 추출
        const imageFields: Partial<AboutContent> = {};
        if (enData) {
          if (enData.headerImage) imageFields.headerImage = enData.headerImage;
          if (enData.headerImagePos) imageFields.headerImagePos = enData.headerImagePos;
          if (enData.philosophyImage) imageFields.philosophyImage = enData.philosophyImage;
          if (enData.philosophyImagePos) imageFields.philosophyImagePos = enData.philosophyImagePos;
          if (enData.spiritImage) imageFields.spiritImage = enData.spiritImage;
          if (enData.spiritImagePos) imageFields.spiritImagePos = enData.spiritImagePos;
          if (enData.sloganImage) imageFields.sloganImage = enData.sloganImage;
          if (enData.sloganImagePos) imageFields.sloganImagePos = enData.sloganImagePos;
          if (enData.messageImage) imageFields.messageImage = enData.messageImage;
          if (enData.messageImagePos) imageFields.messageImagePos = enData.messageImagePos;
          if (enData.section1Image) imageFields.section1Image = enData.section1Image;
          if (enData.section2Image) imageFields.section2Image = enData.section2Image;
          if (enData.section3Image) imageFields.section3Image = enData.section3Image;
        }
        
        if (koDoc.exists()) {
          // 한국어 텍스트 데이터와 영문 이미지 데이터를 합쳐서 설정
          setKoContent(prev => mergeContent(prev, { ...koData, ...imageFields }));
        } else if (enData) {
          // 한국어 데이터가 없으면 영문 이미지 필드만 적용
          setKoContent(prev => ({ ...prev, ...imageFields }));
        }
        
        if (enDoc.exists() && enData) {
          setEnContent(prev => mergeContent(prev, enData));
        }
      } catch (error) {
        console.error('데이터 로드 실패:', error);
      }
    };
    
    loadData();
  }, []);

  // 저장 핸들러
  const handleSave = async () => {
    try {
      // Firebase에 한국어와 영어 데이터를 각각 저장
      await setDoc(doc(db, 'about', 'ko'), koContent);
      await setDoc(doc(db, 'about', 'en'), enContent);
      
      console.log('About Page Content:', { ko: koContent, en: enContent });
      alert('콘텐츠가 Firebase에 저장되었습니다!');
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto" style={{ width: '100%', maxWidth: '1600px', margin: '0 auto' }}>
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">About OMFOOD 관리</h1>
          <p className="text-gray-600">ABOUT OMFOOD 페이지의 콘텐츠를 관리합니다.</p>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 입력 폼 영역 */}
          <div className="space-y-6">
            {/* 헤더 섹션 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">헤더 섹션</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    헤더 이미지
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload('headerImage', e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {currentContent.headerImage && (
                    <div className="mt-2">
                      <img src={currentContent.headerImage} alt="Header preview" className="w-32 h-20 object-cover rounded" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    제목
                  </label>
                  <input
                    type="text"
                    value={currentContent.headerTitle}
                    onChange={(e) => setCurrentContent(prev => ({ ...prev, headerTitle: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    부제목
                  </label>
                  <input
                    type="text"
                    value={currentContent.headerSubtitle}
                    onChange={(e) => setCurrentContent(prev => ({ ...prev, headerSubtitle: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 소개글 관리 (지그재그 섹션) */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">소개글 관리 (지그재그 섹션)</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">메인 슬로건</label>
                  <textarea
                    value={currentContent.introMainSlogan}
                    onChange={(e) => setCurrentContent(prev => ({ ...prev, introMainSlogan: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="줄바꿈으로 문장을 구분하세요"
                  />
                </div>

                {[1, 2, 3].map((num) => {
                  const labelKey = `section${num}Label` as 'section1Label' | 'section2Label' | 'section3Label';
                  const labelSizeKey = `section${num}LabelSize` as 'section1LabelSize' | 'section2LabelSize' | 'section3LabelSize';
                  const titleKey = `section${num}Title` as 'section1Title' | 'section2Title' | 'section3Title';
                  const titleSizeKey = `section${num}TitleSize` as 'section1TitleSize' | 'section2TitleSize' | 'section3TitleSize';
                  const contentKey = `section${num}Content` as 'section1Content' | 'section2Content' | 'section3Content';
                  const contentSizeKey = `section${num}ContentSize` as 'section1ContentSize' | 'section2ContentSize' | 'section3ContentSize';
                  const imageKey = `section${num}Image` as 'section1Image' | 'section2Image' | 'section3Image';
                  return (
                    <div key={`intro-section-${num}`} className="border border-gray-200 rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        {`섹션 ${num}`} ({num === 1 ? '철학' : num === 2 ? '브랜드' : '도전/비전'})
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">라벨(태그)</label>
                        <input
                          type="text"
                          value={currentContent[labelKey]}
                          onChange={(e) => setCurrentContent(prev => ({ ...prev, [labelKey]: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={num === 1 ? '우리의 철학' : num === 2 ? '우리의 브랜드' : '우리의 도전'}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">라벨 폰트 크기</label>
                        <input
                          type="text"
                          value={currentContent[labelSizeKey]}
                          onChange={(e) => setCurrentContent(prev => ({ ...prev, [labelSizeKey]: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="예: 1rem"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
                        <input
                          type="text"
                          value={currentContent[titleKey]}
                          onChange={(e) => setCurrentContent(prev => ({ ...prev, [titleKey]: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">제목 폰트 크기</label>
                        <input
                          type="text"
                          value={currentContent[titleSizeKey]}
                          onChange={(e) => setCurrentContent(prev => ({ ...prev, [titleSizeKey]: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="예: 2.5rem"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">본문 폰트 크기</label>
                      <input
                        type="text"
                        value={currentContent[contentSizeKey]}
                        onChange={(e) => setCurrentContent(prev => ({ ...prev, [contentSizeKey]: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                        placeholder="예: 1.1rem"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">본문</label>
                      <ReactQuill
                        value={currentContent[contentKey]}
                        onChange={(value) => setCurrentContent(prev => ({ ...prev, [contentKey]: value }))}
                        theme="snow"
                        modules={{
                          toolbar: [
                            [{ 'header': [1, 2, 3, false] }],
                            ['bold', 'italic', 'underline', 'strike'],
                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                            [{ 'color': [] }, { 'background': [] }],
                            ['link'],
                            ['clean']
                          ]
                        }}
                        style={{ minHeight: '200px' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">이미지</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleImageUpload(imageKey, e.target.files[0])}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {currentContent[imageKey] && (
                        <div className="mt-2">
                          <img
                            src={currentContent[imageKey]}
                            alt={`섹션 ${num} 이미지 미리보기`}
                            className="w-40 h-32 object-cover rounded"
                          />
                        </div>
                      )}
                    </div>
                    </div>
                  );
                })}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">비전 메시지</label>
                  <textarea
                    value={currentContent.visionMessage}
                    onChange={(e) => setCurrentContent(prev => ({ ...prev, visionMessage: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 건강한 음식, 행복한 식탁..."
                  />
                </div>
              </div>
            </div>

            {/* 경영 이념 섹션 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">경영 이념</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    제목
                  </label>
                  <input
                    type="text"
                    value={currentContent.philosophyTitle}
                    onChange={(e) => setCurrentContent(prev => ({ ...prev, philosophyTitle: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    부제목
                  </label>
                  <textarea
                    value={currentContent.philosophySubtitle}
                    onChange={(e) => setCurrentContent(prev => ({ ...prev, philosophySubtitle: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    항목 리스트
                  </label>
                  <div className="space-y-2">
                    {currentContent.philosophyItems.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateListItem('philosophyItems', index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => removeListItem('philosophyItems', index)}
                          className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                          삭제
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addListItem('philosophyItems')}
                      className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                    >
                      항목 추가
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이미지
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload('philosophyImage', e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {currentContent.philosophyImage && (
                    <div className="mt-2">
                      <img src={currentContent.philosophyImage} alt="Philosophy preview" className="w-32 h-20 object-cover rounded" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 기업 정신 섹션 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">기업 정신</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    제목
                  </label>
                  <input
                    type="text"
                    value={currentContent.spiritTitle}
                    onChange={(e) => setCurrentContent(prev => ({ ...prev, spiritTitle: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    부제목
                  </label>
                  <textarea
                    value={currentContent.spiritSubtitle}
                    onChange={(e) => setCurrentContent(prev => ({ ...prev, spiritSubtitle: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    항목 리스트
                  </label>
                  <div className="space-y-2">
                    {currentContent.spiritItems.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateListItem('spiritItems', index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => removeListItem('spiritItems', index)}
                          className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                          삭제
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addListItem('spiritItems')}
                      className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                    >
                      항목 추가
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이미지
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload('spiritImage', e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {currentContent.spiritImage && (
                    <div className="mt-2">
                      <img src={currentContent.spiritImage} alt="Spirit preview" className="w-32 h-20 object-cover rounded" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 기업 연혁 관리 */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">기업 연혁 관리</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      섹션 제목
                    </label>
                    <input
                      type="text"
                      value={currentContent.historyTitle}
                      onChange={(e) => setCurrentContent(prev => ({ ...prev, historyTitle: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="예: 기업 연혁"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      섹션 설명
                    </label>
                    <textarea
                      value={currentContent.historySubtitle}
                      onChange={(e) => setCurrentContent(prev => ({ ...prev, historySubtitle: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="예: 2010년부터 현재까지..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">연도별 히스토리</h3>
                <button
                  onClick={addHistoryYear}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                  연도 추가
                </button>
              </div>

              <div className="space-y-6">
                {(currentContent.historyItems || []).map((entry, index) => (
                  <div key={`${entry.year}-${index}`} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          연도
                        </label>
                        <input
                          type="text"
                          value={entry.year}
                          onChange={(e) => updateHistoryYear(index, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="예: 2025"
                        />
                      </div>
                      <button
                        onClick={() => removeHistoryYear(index)}
                        className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                      >
                        연도 삭제
                      </button>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        연혁 내용
                      </label>
                      {entry.contents.map((content, contentIndex) => (
                        <div key={`${entry.year}-content-${contentIndex}`} className="flex gap-2">
                          <input
                            type="text"
                            value={content}
                            onChange={(e) =>
                              updateHistoryContentLine(index, contentIndex, e.target.value)
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="내용을 입력하세요"
                          />
                          <button
                            onClick={() => removeHistoryContentLine(index, contentIndex)}
                            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
                          >
                            삭제
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addHistoryContentLine(index)}
                        className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                      >
                        내용 추가
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 인증서 관리 섹션 */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">인증서 관리</h2>
                <button
                  onClick={() => {
                    const newId = Math.random().toString(36).substr(2, 9);
                    setCurrentContent(prev => ({
                      ...prev,
                      certificates: [...(prev.certificates || []), { id: newId, image: '', caption: '' }]
                    }));
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                  + 인증서 추가
                </button>
              </div>

              <div className="space-y-4">
                {(currentContent.certificates || []).map((cert, index) => (
                  <div key={cert.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          인증서 이미지
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              const timestamp = Date.now();
                              const extension = file.name.split('.').pop();
                              const fileRef = storageRef(storage, `about/certificate_${timestamp}.${extension || 'jpg'}`);
                              await uploadBytes(fileRef, file);
                              const downloadUrl = await getDownloadURL(fileRef);
                              // 두 언어 상태 모두 업데이트
                              setKoContent(prev => ({
                                ...prev,
                                certificates: prev.certificates.map((c, i) =>
                                  i === index ? { ...c, image: downloadUrl } : c
                                )
                              }));
                              setEnContent(prev => ({
                                ...prev,
                                certificates: prev.certificates.map((c, i) =>
                                  i === index ? { ...c, image: downloadUrl } : c
                                )
                              }));
                            } catch (error) {
                              console.error('이미지 업로드 실패:', error);
                              alert('이미지 업로드 중 오류가 발생했습니다.');
                            }
                          }}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-2"
                        />
                        {cert.image && (
                          <div className="mt-2">
                            <img src={cert.image} alt="Certificate preview" className="w-32 h-40 object-contain rounded border border-gray-200" />
                          </div>
                        )}
                        <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">
                          캡션 (설명)
                        </label>
                        <input
                          type="text"
                          value={cert.caption}
                          onChange={(e) => {
                            setCurrentContent(prev => ({
                              ...prev,
                              certificates: prev.certificates.map((c, i) =>
                                i === index ? { ...c, caption: e.target.value } : c
                              )
                            }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="인증서 설명을 입력하세요"
                        />
                      </div>
                      <button
                        onClick={() => {
                          setCurrentContent(prev => ({
                            ...prev,
                            certificates: prev.certificates.filter((_, i) => i !== index)
                          }));
                        }}
                        className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
                {(!currentContent.certificates || currentContent.certificates.length === 0) && (
                  <div className="text-center text-gray-500 py-8">
                    인증서가 없습니다. [+ 인증서 추가] 버튼을 눌러 추가하세요.
                  </div>
                )}
              </div>
            </div>

            {/* 핵심 슬로건 섹션 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">핵심 슬로건</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    슬로건 텍스트
                  </label>
                  <textarea
                    value={currentContent.sloganText}
                    onChange={(e) => setCurrentContent(prev => ({ ...prev, sloganText: e.target.value }))}
                    rows={4}
                    placeholder="줄바꿈으로 구분하여 입력하세요"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    배경 이미지
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload('sloganImage', e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {currentContent.sloganImage && (
                    <div className="mt-2">
                      <img src={currentContent.sloganImage} alt="Slogan preview" className="w-32 h-20 object-cover rounded" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 대표 메시지 섹션 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">대표 메시지</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    제목
                  </label>
                  <textarea
                    value={currentContent.messageTitle}
                    onChange={(e) => setCurrentContent(prev => ({ ...prev, messageTitle: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    본문
                  </label>
                  <textarea
                    value={currentContent.messageContent}
                    onChange={(e) => setCurrentContent(prev => ({ ...prev, messageContent: e.target.value }))}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    대표 이름
                  </label>
                  <input
                    type="text"
                    value={currentContent.representativeName}
                    onChange={(e) => setCurrentContent(prev => ({ ...prev, representativeName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    배경 이미지
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload('messageImage', e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {currentContent.messageImage && (
                    <div className="mt-2">
                      <img src={currentContent.messageImage} alt="Message preview" className="w-32 h-20 object-cover rounded" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 저장 버튼 */}
            <div className="bg-white rounded-lg shadow p-6">
              <button
                onClick={handleSave}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 font-medium"
              >
                저장하기
              </button>
            </div>
          </div>

          {/* 프리뷰 영역 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">실시간 프리뷰</h2>
            <div className="border rounded-lg p-4 bg-gray-50 min-h-screen overflow-y-auto">
              {/* 헤더 프리뷰 */}
              <div className="mb-8">
                <div className="relative bg-black rounded-lg overflow-hidden mb-4">
                  {currentContent.headerImage ? (
                    <div className="relative" style={{ cursor: 'crosshair' }}>
                      <img 
                        src={currentContent.headerImage} 
                        alt="Header" 
                        className="w-full h-64 object-cover"
                        onClick={(e) => handleImageClick(e, 'headerImagePos')}
                      />
                      {currentContent.headerImagePos && (
                        <div
                          style={{
                            position: 'absolute',
                            left: `${currentContent.headerImagePos.x}%`,
                            top: `${currentContent.headerImagePos.y}%`,
                            transform: 'translate(-50%, -50%)',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: 'red',
                            border: '2px solid white',
                            pointerEvents: 'none',
                            zIndex: 10
                          }}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-64 bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-500">헤더 이미지</span>
                    </div>
                  )}
                  <div className="absolute bottom-4 right-4 text-white">
                    <p className="text-2xl font-light mb-2">{currentContent.headerTitle}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-4xl font-bold">{currentContent.headerSubtitle}</span>
                      <div className="w-1 h-16 bg-red-500"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 소개 지그재그 프리뷰 */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">소개 섹션 프리뷰</h3>
                <div className="space-y-8">
                  <div className="text-center text-3xl font-bold leading-snug whitespace-pre-line">
                    {currentContent.introMainSlogan || '메인 슬로건을 입력하세요.'}
                  </div>
                  {[1, 2, 3].map((num) => {
                    const labelKey = `section${num}Label` as 'section1Label' | 'section2Label' | 'section3Label';
                    const labelSizeKey = `section${num}LabelSize` as 'section1LabelSize' | 'section2LabelSize' | 'section3LabelSize';
                    const titleKey = `section${num}Title` as 'section1Title' | 'section2Title' | 'section3Title';
                    const titleSizeKey = `section${num}TitleSize` as 'section1TitleSize' | 'section2TitleSize' | 'section3TitleSize';
                    const contentKey = `section${num}Content` as 'section1Content' | 'section2Content' | 'section3Content';
                    const contentSizeKey = `section${num}ContentSize` as 'section1ContentSize' | 'section2ContentSize' | 'section3ContentSize';
                    const imageKey = `section${num}Image` as 'section1Image' | 'section2Image' | 'section3Image';
                    const isReverse = num === 2;
                    return (
                      <div
                        key={`intro-preview-${num}`}
                        className={`flex flex-col md:flex-row ${isReverse ? 'md:flex-row-reverse' : ''} items-center gap-6`}
                      >
                        <div className="flex-1">
                          <p 
                            className="tracking-[0.3em] text-orange-400 uppercase mb-2"
                            style={{ fontSize: currentContent[labelSizeKey] || '1rem' }}
                          >
                            {currentContent[labelKey] || (num === 1 ? 'Philosophy' : num === 2 ? 'Brand' : 'Challenge')}
                          </p>
                          <h4 
                            className="font-bold text-gray-900 mb-3"
                            style={{ fontSize: currentContent[titleSizeKey] || '2.5rem' }}
                          >
                            {currentContent[titleKey] || `섹션 ${num} 제목`}
                          </h4>
                          <div 
                            className="text-gray-600 leading-relaxed"
                            style={{ fontSize: currentContent[contentSizeKey] || '1.1rem' }}
                            dangerouslySetInnerHTML={{ __html: currentContent[contentKey] || '내용을 입력하세요.' }}
                          />
                          {num === 3 && currentContent.visionMessage && (
                            <p className="mt-3 font-semibold text-gray-800 whitespace-pre-line">
                              {currentContent.visionMessage}
                            </p>
                          )}
                        </div>
                        <div className="flex-1 w-full">
                          {currentContent[imageKey] ? (
                            <img
                              src={currentContent[imageKey]}
                              alt={`소개 섹션 ${num}`}
                              className="w-full h-64 object-cover rounded-xl shadow"
                            />
                          ) : (
                            <div className="w-full h-64 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                              이미지 업로드
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 경영 이념 프리뷰 */}
              <div className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    {currentContent.philosophyImage ? (
                      <div className="relative" style={{ cursor: 'crosshair' }}>
                        <img 
                          src={currentContent.philosophyImage} 
                          alt="Philosophy" 
                          className="w-full h-64 object-cover rounded-lg"
                          onClick={(e) => handleImageClick(e, 'philosophyImagePos')}
                        />
                        {currentContent.philosophyImagePos && (
                          <div
                            style={{
                              position: 'absolute',
                              left: `${currentContent.philosophyImagePos.x}%`,
                              top: `${currentContent.philosophyImagePos.y}%`,
                              transform: 'translate(-50%, -50%)',
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              backgroundColor: 'red',
                              border: '2px solid white',
                              pointerEvents: 'none',
                              zIndex: 10
                            }}
                          />
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-64 bg-gray-300 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500">경영 이념 이미지</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-light text-orange-400 mb-2">{currentContent.philosophyTitle}</h3>
                    <h4 className="text-xl font-bold text-gray-900 mb-4">{currentContent.philosophySubtitle}</h4>
                    <ul className="space-y-2">
                      {currentContent.philosophyItems.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 bg-gray-800 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* 기업 정신 프리뷰 */}
              <div className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    {currentContent.spiritImage ? (
                      <div className="relative" style={{ cursor: 'crosshair' }}>
                        <img 
                          src={currentContent.spiritImage} 
                          alt="Spirit" 
                          className="w-full h-64 object-cover rounded-lg"
                          onClick={(e) => handleImageClick(e, 'spiritImagePos')}
                        />
                        {currentContent.spiritImagePos && (
                          <div
                            style={{
                              position: 'absolute',
                              left: `${currentContent.spiritImagePos.x}%`,
                              top: `${currentContent.spiritImagePos.y}%`,
                              transform: 'translate(-50%, -50%)',
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              backgroundColor: 'red',
                              border: '2px solid white',
                              pointerEvents: 'none',
                              zIndex: 10
                            }}
                          />
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-64 bg-gray-300 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500">기업 정신 이미지</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-light text-orange-400 mb-2">{currentContent.spiritTitle}</h3>
                    <h4 className="text-xl font-bold text-gray-900 mb-4">{currentContent.spiritSubtitle}</h4>
                    <ul className="space-y-2">
                      {currentContent.spiritItems.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 bg-gray-800 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* 기업 연혁 프리뷰 */}
              <div className="mb-8">
                <div className="rounded-lg p-6" style={{ backgroundColor: '#FFF9F4', border: '1px solid #FDE4D0' }}>
                  <p className="text-sm font-semibold tracking-widest uppercase" style={{ color: '#F88D2A' }}>
                    {currentContent.historyTitle || 'COMPANY HISTORY'}
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-2 mb-6">
                    {currentContent.historySubtitle || 'Milestones that shaped OM FOOD from 2010 to today.'}
                  </h3>
                  <div className="space-y-4">
                    {(currentContent.historyItems || []).map((entry, index) => (
                      <div
                        key={`preview-history-${entry.year}-${index}`}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 py-3 border-t border-orange-100"
                      >
                        <div className="text-3xl font-bold text-gray-800">
                          {entry.year || '----'}
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          {entry.contents.map((content, contentIndex) => (
                            <p key={`${entry.year}-content-preview-${contentIndex}`} className="text-base text-gray-700 leading-relaxed">
                              {content || '내용을 입력하세요.'}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 인증서 프리뷰 */}
              {(currentContent.certificates && currentContent.certificates.length > 0) && (
                <div className="mb-8">
                  <div className="bg-white rounded-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">CERTIFICATES & AWARDS</h3>
                    <div className="flex flex-wrap justify-center gap-10">
                      {currentContent.certificates.map((cert) => (
                        <div key={cert.id} className="flex flex-col items-center">
                          {cert.image && (
                            <img
                              src={cert.image}
                              alt={cert.caption || 'Certificate'}
                              className="h-96 object-contain mb-3"
                            />
                          )}
                          {cert.caption && (
                            <p className="text-sm text-gray-700 text-center max-w-xs">{cert.caption}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 슬로건 프리뷰 */}
              <div className="mb-8">
                <div className="relative bg-gray-800 rounded-lg overflow-hidden">
                  {currentContent.sloganImage ? (
                    <div className="relative" style={{ cursor: 'crosshair' }}>
                      <img 
                        src={currentContent.sloganImage} 
                        alt="Slogan" 
                        className="w-full h-64 object-cover"
                        onClick={(e) => handleImageClick(e, 'sloganImagePos')}
                      />
                      {currentContent.sloganImagePos && (
                        <div
                          style={{
                            position: 'absolute',
                            left: `${currentContent.sloganImagePos.x}%`,
                            top: `${currentContent.sloganImagePos.y}%`,
                            transform: 'translate(-50%, -50%)',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: 'red',
                            border: '2px solid white',
                            pointerEvents: 'none',
                            zIndex: 10
                          }}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-64 bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-500">슬로건 배경 이미지</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    <div className="text-center text-white">
                      {currentContent.sloganText.split('\n').map((line, index) => (
                        <div key={index} className="text-2xl font-bold mb-2">
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 대표 메시지 프리뷰 */}
              <div className="mb-8">
                <div className="bg-orange-50 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">{currentContent.messageTitle}</h3>
                      <div className="space-y-4 text-gray-700">
                        {currentContent.messageContent.split('\n\n').map((paragraph, index) => (
                          <p key={index}>{paragraph}</p>
                        ))}
                      </div>
                      <p className="font-semibold text-gray-900 mt-4">{currentContent.representativeName}</p>
                    </div>
                    <div>
                      {currentContent.messageImage ? (
                        <div className="relative" style={{ cursor: 'crosshair' }}>
                          <img 
                            src={currentContent.messageImage} 
                            alt="Message" 
                            className="w-full h-64 object-cover rounded-lg"
                            onClick={(e) => handleImageClick(e, 'messageImagePos')}
                          />
                          {currentContent.messageImagePos && (
                            <div
                              style={{
                                position: 'absolute',
                                left: `${currentContent.messageImagePos.x}%`,
                                top: `${currentContent.messageImagePos.y}%`,
                                transform: 'translate(-50%, -50%)',
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                backgroundColor: 'red',
                                border: '2px solid white',
                                pointerEvents: 'none',
                                zIndex: 10
                              }}
                            />
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-64 bg-gray-300 rounded-lg flex items-center justify-center">
                          <span className="text-gray-500">대표 메시지 이미지</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPageAdmin;
