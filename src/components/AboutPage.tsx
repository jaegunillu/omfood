import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTypewriter, Cursor } from 'react-simple-typewriter';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

type HistoryItem = {
  year: string;
  contents: string[];
};

type Certificate = {
  id: string;
  image: string;
  caption: string;
};

const defaultHistoryItems: HistoryItem[] = [
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

const cloneHistoryItems = () =>
  defaultHistoryItems.map(item => ({
    year: item.year,
    contents: [...item.contents]
  }));

const AboutPage: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentLang, setCurrentLang] = useState<'ko' | 'en'>('en');
  const [aboutData, setAboutData] = useState({
    ko: {
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
      headerImagePos: { x: 50, y: 50 },
      philosophyImagePos: { x: 50, y: 50 },
      spiritImagePos: { x: 50, y: 50 },
      sloganImagePos: { x: 50, y: 50 },
      messageImagePos: { x: 50, y: 50 },
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
      visionMessageSize: '1.2rem',
      historyItems: cloneHistoryItems(),
      historyTitle: '기업 연혁',
      historySubtitle: '2010년부터 현재까지 OM FOOD가 걸어온 길입니다.',
      certificates: [] as Certificate[]
    },
    en: {
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
      headerImagePos: { x: 50, y: 50 },
      philosophyImagePos: { x: 50, y: 50 },
      spiritImagePos: { x: 50, y: 50 },
      sloganImagePos: { x: 50, y: 50 },
      messageImagePos: { x: 50, y: 50 },
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
      visionMessageSize: '1.2rem',
      historyItems: cloneHistoryItems(),
      historyTitle: 'Company History',
      historySubtitle: 'Milestones that shaped OM FOOD from 2010 to today.',
      certificates: [] as Certificate[]
    }
  });

  // 이미지 경로를 안전하게 처리
  const getImagePath = (imageName: string) => {
    const publicUrl = process.env.PUBLIC_URL || '';
    return `${publicUrl}/ABOUT_IMG/${imageName}`;
  };

  // 유효한 이미지 URL인지 확인하는 함수
  const isValidImageUrl = (url: string | null | undefined): boolean => {
    if (!url || typeof url !== 'string' || url.trim() === '') {
      return false;
    }
    // http:// 또는 https://로 시작하거나, /로 시작하는 경로 형식인지 확인
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/') || url.startsWith('./');
  };

  const headerImageSrc = isValidImageUrl(aboutData[currentLang].headerImage) 
    ? aboutData[currentLang].headerImage 
    : getImagePath('OM_E1.jpg');
  const philosophyImageSrc = isValidImageUrl(aboutData[currentLang].philosophyImage)
    ? aboutData[currentLang].philosophyImage
    : getImagePath('OM_E2.jpg');
  const spiritImageSrc = isValidImageUrl(aboutData[currentLang].spiritImage)
    ? aboutData[currentLang].spiritImage
    : getImagePath('OM_E3.jpg');
  const sloganImageSrc = isValidImageUrl(aboutData[currentLang].sloganImage)
    ? aboutData[currentLang].sloganImage
    : getImagePath('OM_E4.jpg');
  const messageImageSrc = isValidImageUrl(aboutData[currentLang].messageImage)
    ? aboutData[currentLang].messageImage
    : getImagePath('OM_E5.jpg');
  const section1ImageSrc = isValidImageUrl(aboutData[currentLang].section1Image)
    ? aboutData[currentLang].section1Image
    : getImagePath('OM_E2.jpg');
  const section2ImageSrc = isValidImageUrl(aboutData[currentLang].section2Image)
    ? aboutData[currentLang].section2Image
    : getImagePath('OM_E3.jpg');
  const section3ImageSrc = isValidImageUrl(aboutData[currentLang].section3Image)
    ? aboutData[currentLang].section3Image
    : getImagePath('OM_E4.jpg');
  const historyItems = aboutData[currentLang].historyItems || [];
  const visionMessageSize = (aboutData[currentLang] as any).visionMessageSize || '1.2rem';
  const introSections = [
    {
      label: aboutData[currentLang].section1Label || (currentLang === 'ko' ? '우리의 철학' : 'Our Philosophy'),
      labelSize: (aboutData[currentLang] as any).section1LabelSize || '1rem',
      title: aboutData[currentLang].section1Title,
      titleSize: (aboutData[currentLang] as any).section1TitleSize || '2.5rem',
      content: aboutData[currentLang].section1Content,
      contentSize: (aboutData[currentLang] as any).section1ContentSize || '1.1rem',
      image: section1ImageSrc,
      reverse: false
    },
    {
      label: aboutData[currentLang].section2Label || (currentLang === 'ko' ? '우리의 브랜드' : 'Our Brand'),
      labelSize: (aboutData[currentLang] as any).section2LabelSize || '1rem',
      title: aboutData[currentLang].section2Title,
      titleSize: (aboutData[currentLang] as any).section2TitleSize || '2.5rem',
      content: aboutData[currentLang].section2Content,
      contentSize: (aboutData[currentLang] as any).section2ContentSize || '1.1rem',
      image: section2ImageSrc,
      reverse: true
    },
    {
      label: aboutData[currentLang].section3Label || (currentLang === 'ko' ? '우리의 도전' : 'Our Challenge'),
      labelSize: (aboutData[currentLang] as any).section3LabelSize || '1rem',
      title: aboutData[currentLang].section3Title,
      titleSize: (aboutData[currentLang] as any).section3TitleSize || '2.5rem',
      content: `${aboutData[currentLang].section3Content}${aboutData[currentLang].visionMessage ? `<br/><br/><div style="font-size: ${visionMessageSize};">${aboutData[currentLang].visionMessage}</div>` : ''}`,
      contentSize: (aboutData[currentLang] as any).section3ContentSize || '1.1rem',
      image: section3ImageSrc,
      reverse: false
    }
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Firebase에서 데이터 로드
  useEffect(() => {
    const loadAboutData = async () => {
      try {
        const koDoc = await getDoc(doc(db, 'about', 'ko'));
        const enDoc = await getDoc(doc(db, 'about', 'en'));
        
        if (koDoc.exists()) {
          const data = koDoc.data();
          setAboutData(prev => ({
            ...prev,
            ko: {
              ...prev.ko,
              ...data,
              historyItems:
                (data as any).historyItems && (data as any).historyItems.length
                  ? (data as any).historyItems
                  : prev.ko.historyItems,
              certificates:
                (data as any).certificates && Array.isArray((data as any).certificates)
                  ? (data as any).certificates
                  : (prev.ko.certificates || []),
              // 폰트 사이즈 필드 기본값 설정
              section1LabelSize: (data as any).section1LabelSize || prev.ko.section1LabelSize || '1rem',
              section1TitleSize: (data as any).section1TitleSize || prev.ko.section1TitleSize || '2.5rem',
              section1ContentSize: (data as any).section1ContentSize || prev.ko.section1ContentSize || '1.1rem',
              section2LabelSize: (data as any).section2LabelSize || prev.ko.section2LabelSize || '1rem',
              section2TitleSize: (data as any).section2TitleSize || prev.ko.section2TitleSize || '2.5rem',
              section2ContentSize: (data as any).section2ContentSize || prev.ko.section2ContentSize || '1.1rem',
              section3LabelSize: (data as any).section3LabelSize || prev.ko.section3LabelSize || '1rem',
              section3TitleSize: (data as any).section3TitleSize || prev.ko.section3TitleSize || '2.5rem',
              section3ContentSize: (data as any).section3ContentSize || prev.ko.section3ContentSize || '1.1rem',
              visionMessageSize: (data as any).visionMessageSize || prev.ko.visionMessageSize || '1.2rem'
            }
          }));
        }
        if (enDoc.exists()) {
          const data = enDoc.data();
          setAboutData(prev => ({
            ...prev,
            en: {
              ...prev.en,
              ...data,
              historyItems:
                (data as any).historyItems && (data as any).historyItems.length
                  ? (data as any).historyItems
                  : prev.en.historyItems,
              certificates:
                (data as any).certificates && Array.isArray((data as any).certificates)
                  ? (data as any).certificates
                  : (prev.en.certificates || []),
              // 폰트 사이즈 필드 기본값 설정
              section1LabelSize: (data as any).section1LabelSize || prev.en.section1LabelSize || '1rem',
              section1TitleSize: (data as any).section1TitleSize || prev.en.section1TitleSize || '2.5rem',
              section1ContentSize: (data as any).section1ContentSize || prev.en.section1ContentSize || '1.1rem',
              section2LabelSize: (data as any).section2LabelSize || prev.en.section2LabelSize || '1rem',
              section2TitleSize: (data as any).section2TitleSize || prev.en.section2TitleSize || '2.5rem',
              section2ContentSize: (data as any).section2ContentSize || prev.en.section2ContentSize || '1.1rem',
              section3LabelSize: (data as any).section3LabelSize || prev.en.section3LabelSize || '1rem',
              section3TitleSize: (data as any).section3TitleSize || prev.en.section3TitleSize || '2.5rem',
              section3ContentSize: (data as any).section3ContentSize || prev.en.section3ContentSize || '1.1rem',
              visionMessageSize: (data as any).visionMessageSize || prev.en.visionMessageSize || '1.2rem'
            }
          }));
        }
      } catch (error) {
        console.error('About 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadAboutData();
  }, []);

  // 현재 언어 감지 (URL 파라미터 또는 localStorage에서)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get('lang') as 'ko' | 'en' | null;
    const savedLang = localStorage.getItem('siteLang') as 'ko' | 'en' | null;
    
    if (lang && (lang === 'ko' || lang === 'en')) {
      setCurrentLang(lang);
    } else if (savedLang && (savedLang === 'ko' || savedLang === 'en')) {
      setCurrentLang(savedLang);
    } else {
      // 기본값: 영어
      setCurrentLang('en');
    }
  }, []);

  // 언어 변경 이벤트 구독
  useEffect(() => {
    const handleLangChange = (event: any) => {
      const lang = event.detail?.language as 'ko' | 'en';
      if (lang && (lang === 'ko' || lang === 'en')) {
        setCurrentLang(lang);
      }
    };

    // 언어 변경 이벤트 구독
    window.addEventListener('languageChange', handleLangChange);
    
    return () => {
      window.removeEventListener('languageChange', handleLangChange);
    };
  }, []);

  useEffect(() => {
    historyItemRefs.current = [];
    setActiveHistoryIndex(0);
  }, [currentLang]);

  useEffect(() => {
    if (!historyItems.length) return;

    // IntersectionObserver를 사용하여 뷰포트 중앙에 있는 아이템 감지
    const observers: IntersectionObserver[] = [];
    const intersectionRatios: number[] = new Array(historyItems.length).fill(0);

    historyItemRefs.current.forEach((el, index) => {
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            intersectionRatios[index] = entry.intersectionRatio;
            
            // 가장 많이 보이는(중앙에 가까운) 아이템 찾기
            let maxRatio = 0;
            let activeIdx = 0;
            intersectionRatios.forEach((ratio, idx) => {
              if (ratio > maxRatio) {
                maxRatio = ratio;
                activeIdx = idx;
              }
            });

            // 뷰포트 중앙에 더 가까운 아이템 찾기 (보정)
            const viewportCenter = window.innerHeight / 2;
            let closestIndex = activeIdx;
            let minDistance = Number.POSITIVE_INFINITY;

            historyItemRefs.current.forEach((ref, idx) => {
              if (!ref) return;
              const rect = ref.getBoundingClientRect();
              const elementCenter = rect.top + rect.height / 2;
              const distance = Math.abs(elementCenter - viewportCenter);
              
              // 뷰포트 내에 있는 요소만 고려
              if (rect.top < window.innerHeight && rect.bottom > 0 && distance < minDistance) {
                minDistance = distance;
                closestIndex = idx;
              }
            });

            setActiveHistoryIndex(closestIndex);
          });
        },
        {
          threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
          rootMargin: '-40% 0px -40% 0px' // 뷰포트 상하 40% 영역만 감지 (중앙 영역)
        }
      );

      observer.observe(el);
      observers.push(observer);
    });

    // 초기 활성 인덱스 설정
    const handleInitialScroll = () => {
      const viewportCenter = window.innerHeight / 2;
      let closestIndex = 0;
      let minDistance = Number.POSITIVE_INFINITY;

      historyItemRefs.current.forEach((el, index) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2;
        const distance = Math.abs(elementCenter - viewportCenter);
        if (rect.top < window.innerHeight && rect.bottom > 0 && distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });

      setActiveHistoryIndex(closestIndex);
    };

    // 스크롤 이벤트로 보정 (IntersectionObserver와 함께 사용)
    const handleScroll = () => {
      const viewportCenter = window.innerHeight / 2;
      let closestIndex = 0;
      let minDistance = Number.POSITIVE_INFINITY;

      historyItemRefs.current.forEach((el, index) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2;
        const distance = Math.abs(elementCenter - viewportCenter);
        
        // 뷰포트 내에 있는 요소만 고려
        if (rect.top < window.innerHeight && rect.bottom > 0 && distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });

      setActiveHistoryIndex(closestIndex);
    };

    // 초기 실행 및 스크롤 이벤트 등록
    setTimeout(() => {
      handleInitialScroll();
    }, 100);

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      observers.forEach(observer => observer.disconnect());
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [historyItems]);

  const [text] = useTypewriter({
    words: ['먹는 사람도', '파는 사람도'],
    loop: 1,
    typeSpeed: 100,
    deleteSpeed: 50,
    delaySpeed: 1000,
  });
  const [activeHistoryIndex, setActiveHistoryIndex] = useState(0);
  const historyItemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
    viewport: { once: true }
  };

  const slideInLeft = {
    initial: { opacity: 0, x: -50 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: true }
  };

  const slideInRight = {
    initial: { opacity: 0, x: 50 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: true }
  };

  const scaleIn = {
    initial: { opacity: 0, scale: 0.8 },
    whileInView: { opacity: 1, scale: 1 },
    transition: { duration: 0.7, ease: "easeOut" },
    viewport: { once: true }
  };

  const staggerContainer = {
    initial: {},
    whileInView: {
      transition: {
        staggerChildren: 0.2
      }
    },
    viewport: { once: true }
  };

  const staggerItem = {
    initial: { opacity: 0, y: 20 },
    whileInView: { 
      opacity: 1, 
      y: 0
    }
  };

  const heroTextAnimation = {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1, ease: "easeOut" }
  };

  const floatingAnimation = {
    animate: {
      y: [-10, 10, -10]
    }
  };


  // 이미지 포커스 포인트 위치 정보
  const headerImagePos = aboutData[currentLang].headerImagePos || { x: 50, y: 50 };
  const philosophyImagePos = aboutData[currentLang].philosophyImagePos || { x: 50, y: 50 };
  const spiritImagePos = aboutData[currentLang].spiritImagePos || { x: 50, y: 50 };
  const sloganImagePos = aboutData[currentLang].sloganImagePos || { x: 50, y: 50 };
  const messageImagePos = aboutData[currentLang].messageImagePos || { x: 50, y: 50 };

  const historyTitle =
    aboutData[currentLang].historyTitle ||
    (currentLang === 'ko' ? '기업 연혁' : 'Company History');
  const historyDescription =
    aboutData[currentLang].historySubtitle ||
    (currentLang === 'ko'
      ? '2010년부터 현재까지 OM FOOD가 걸어온 길입니다.'
      : 'Milestones that shaped OM FOOD from 2010 to today.');

  if (loading) {
    return <div style={{ height: '100vh', background: '#fff' }}></div>;
  }

  return (
    <div className="about-page" style={{ minHeight: '800px', backgroundColor: 'white' }}>
      {/* 메인 히어로 섹션 */}
      <section style={{ 
        position: 'relative', 
        width: '100%',
        height: '800px',
        overflow: 'hidden',
        backgroundColor: '#000'
      }}>
        <img 
          src={headerImageSrc}
          alt="OM FOOD Background" 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: `${headerImagePos.x}% ${headerImagePos.y}%`,
            zIndex: 0
          }}
        />
        
        {/* 텍스트 오버레이 - 1번 이미지와 정확히 동일한 위치와 사이즈 */}
        <motion.div 
          style={{ 
            position: 'absolute', 
            bottom: '4rem', 
            right: '4rem', 
            zIndex: 10,
            display: 'flex',
            alignItems: 'flex-end',
            gap: '1.5rem'
          }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* 텍스트 블록 - 1번 이미지와 동일한 정렬 */}
          <motion.div 
            style={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              textAlign: 'right'
            }}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
          >
            {/* 첫 번째 텍스트 - 1번 이미지와 동일한 사이즈 */}
            <motion.p 
              style={{ 
                fontSize: '70px', 
                color: 'white', 
                margin: 10,
                padding: 0,
                fontWeight: '180',
                lineHeight: '1',
                marginBottom: '1rem',
                fontFamily: 'sans-serif'
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            >
              {aboutData[currentLang].headerTitle}
            </motion.p>
            
            {/* 두 번째 텍스트 - 1번 이미지와 동일한 사이즈 */}
            <motion.div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'flex-end', 
                gap: '1rem' 
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
            >
              <motion.span 
                style={{ 
                  fontSize: '120px', 
                  fontWeight: 'bold',
                  color: 'white',
                  fontFamily: 'sans-serif',
                  lineHeight: '1'
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.9, ease: "backOut" }}
              >
                {aboutData[currentLang].headerSubtitle.split(' ')[0]}
              </motion.span>
              <motion.span 
                style={{ 
                  fontSize: '120px', 
                  fontWeight: 'bold',
                  color: 'white',
                  fontFamily: 'sans-serif',
                  lineHeight: '1'
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1.1, ease: "backOut" }}
              >
                {aboutData[currentLang].headerSubtitle.split(' ')[1] || ''}
              </motion.span>
            </motion.div>
          </motion.div>
          
          {/* 다홍색 세로 라인 - 1번 이미지와 동일한 색상과 크기 */}
          <motion.div 
            style={{ 
              width: '6px',
              height: '198px',
              backgroundColor: '#E25858',
              marginTop: '1rem',
              borderRadius: '3px'
            }}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ duration: 0.8, delay: 1.3, ease: "easeOut" }}
          />
        </motion.div>
      </section>

      {/* 소개 지그재그 섹션 */}
      <motion.section
        className="intro-zigzag-section"
        style={{ padding: '10rem 10rem 6rem', backgroundColor: '#fff' }}
        {...fadeInUp}
      >
        <div className="intro-zigzag-container">
          <motion.div
            className="intro-main-slogan"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {aboutData[currentLang].introMainSlogan.split('\n').map((line, idx) => (
              <span key={idx}>
                {line}
                {idx < aboutData[currentLang].introMainSlogan.split('\n').length - 1 && <br />}
              </span>
            ))}
          </motion.div>
          {introSections.map((section, idx) => (
            <motion.div
              key={`${section.title}-${idx}`}
              className={`intro-row ${section.reverse ? 'reverse' : ''}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="intro-text">
                <p 
                  className="intro-label"
                  style={{ fontSize: section.labelSize }}
                >
                  {section.label}
                </p>
                <h3 style={{ fontSize: section.titleSize, whiteSpace: 'pre-line' }}>
                  {section.title}
                </h3>
                <div
                  className="intro-content"
                  style={{ fontSize: section.contentSize }}
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </div>
              <div className="intro-image">
                <img src={section.image} alt={section.title} />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 경영 이념 Section - 레퍼런스(2번)와 픽셀매칭 */}
      <motion.section
        style={{ padding: '26rem 10rem 13rem', backgroundColor: 'white' }}
        {...fadeInUp}
      >
        <div style={{ maxWidth: '76rem', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '33.75rem 1fr',   // ≒ 540px : 텍스트
              columnGap: '3.5rem',                   // ≒ 56px
              alignItems: 'start'                    // 상단 기준 정렬(레퍼런스 느낌)
            }}
          >
            {/* Left - OM_E2.jpg 카드 (세로로 크게, 라운드 크게) */}
            <motion.div 
              style={{ display: 'flex', justifyContent: 'flex-start' }}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <motion.div
                style={{ position: 'relative' }}
                whileHover={{ scale: 1.03, rotateY: 5 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                animate={{
                  y: [-10, 10, -10],
                  transition: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
              >
                <img
                  className="card-img"
                  src={philosophyImageSrc}
                  alt="Chess board with pawns"
                  style={{
                    width: '33.75rem',                 // 540px
                    height: '50.625rem',               // 810px (세로 우세 비율)
                    objectFit: 'cover',
                    objectPosition: `${philosophyImagePos.x}% ${philosophyImagePos.y}%`,
                    borderRadius: '1.5rem',            // 24px 라운드
                    boxShadow: '0 20px 48px rgba(0, 0, 0, 0.12)'
                  }}
                />
              </motion.div>
            </motion.div>

            {/* Right - 타이포 */}
            <motion.div 
              style={{ display: 'flex', flexDirection: 'column' }}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              {/* 소제목: 살구빛, 얇고 크게 */}
              <motion.h2
                style={{
                  fontSize: '5.5rem',                 // ≒ 56px
                  fontWeight: 100,
                  color: '#E36E6E',                   // 살구빛에 가깝게 톤업
                  letterSpacing: '0.01em',
                  margin: 0,
                  marginBottom: '1.25rem',
                  lineHeight: 1.05
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                {aboutData[currentLang].philosophyTitle}
              </motion.h2>

              {/* 메인 헤드라인: 매우 크게, 두 줄 강제 개행 */}
              <motion.h3
                style={{
                  fontSize: '4.355rem',               // ≒ 62px
                  fontWeight: 800,
                  color: '#0F172A',                   // 아주 진한 먹색
                  letterSpacing: '-0.01em',
                  lineHeight: 1.38,                   // 타이트한 줄간
                  margin: 0,
                  marginBottom: '10rem',
                  width: '1000px',                     // 가로 넓이 1000px
                  height: '255px'                     // 세로 높이 255px
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
              >
                {aboutData[currentLang].philosophySubtitle.split('\n').map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    {index < aboutData[currentLang].philosophySubtitle.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </motion.h3>

              {/* 불릿: 검은 점, 균일 행간/간격 */}
              <motion.ul
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.375rem',                    // 항목 간 14px
                  color: '#334155',                   // 다크 그레이블루
                  fontSize: '1.5625rem',              // 17px
                  lineHeight: 1.62,
                  margin: 0,
                  padding: 0,
                  listStyle: 'none'
                }}
                variants={staggerContainer}
                initial="initial"
                whileInView="whileInView"
                viewport={{ once: true }}
              >
                {aboutData[currentLang].philosophyItems.map((txt, i) => (
                  <motion.li 
                    key={i} 
                    style={{ display: 'flex', alignItems: 'flex-start' }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                    viewport={{ once: true }}
                  >
                    <motion.span
                      style={{
                        width: '0.375rem',             // 6px 점
                        height: '0.375rem',
                        backgroundColor: '#111827',
                        borderRadius: '50%',
                        marginTop: '1rem',
                        marginRight: '0.75rem',        // 12px
                        flexShrink: 0
                      }}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                      viewport={{ once: true }}
                    />
                    <span>{txt}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* 기업 정신 Section — 경영 이념 섹션과 동일 규격/레이아웃 */}
      <motion.section
        className="spirit-section"
        style={{ padding: '13rem 10rem 26rem', backgroundColor: 'white' }}
        {...fadeInUp}
      >
        <div style={{ maxWidth: '76rem', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '33.75rem 1fr',   // 좌: 이미지(540px) / 우: 텍스트
              columnGap: '3.5rem',
              alignItems: 'start'
            }}
          >
            {/* Left — 이미지 카드 (OM_E3.jpg), 규격 동일 */}
            <motion.div 
              style={{ display: 'flex', justifyContent: 'flex-start' }}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <motion.div
                style={{ position: 'relative' }}
                whileHover={{ scale: 1.03, rotateY: -5 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                animate={{
                  y: [-10, 10, -10],
                  transition: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
              >
                <img
                  className="card-img"
                  src={spiritImageSrc}
                  alt="Stacked blocks"
                  style={{
                    width: '33.75rem',               // 540px
                    height: '50.625rem',             // 810px
                    objectFit: 'cover',
                    objectPosition: `${spiritImagePos.x}% ${spiritImagePos.y}%`,
                    borderRadius: '1.5rem',          // 24px
                    boxShadow: '0 20px 48px rgba(0, 0, 0, 0.12)'
                  }}
                />
              </motion.div>
            </motion.div>

            {/* Right — 타이포(값 동일) */}
            <motion.div 
              style={{ display: 'flex', flexDirection: 'column' }}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <motion.h2
                style={{
                  fontSize: '5.5rem',
                  fontWeight: 100,
                  color: '#E36E6E',
                  letterSpacing: '0.01em',
                  margin: 0,
                  marginBottom: '1.25rem',
                  lineHeight: 1.05
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                {aboutData[currentLang].spiritTitle}
              </motion.h2>

              <motion.h3
                style={{
                  fontSize: '4.055rem',
                  fontWeight: 800,
                  color: '#0F172A',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.38,
                  margin: 0,
                  marginBottom: '10rem',
                  width: '1000px',
                  height: '255px'
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
              >
                {aboutData[currentLang].spiritSubtitle.split('\n').map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    {index < aboutData[currentLang].spiritSubtitle.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </motion.h3>

              <motion.ul
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.375rem',
                  color: '#334155',
                  fontSize: '1.5625rem',
                  lineHeight: 1.62,
                  margin: 0,
                  padding: 0,
                  listStyle: 'none'
                }}
                variants={staggerContainer}
                initial="initial"
                whileInView="whileInView"
                viewport={{ once: true }}
              >
                {aboutData[currentLang].spiritItems.map((txt, i) => (
                  <motion.li 
                    key={i} 
                    style={{ display: 'flex', alignItems: 'flex-start' }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                    viewport={{ once: true }}
                  >
                    <motion.span
                      style={{
                        width: '0.375rem',
                        height: '0.375rem',
                        backgroundColor: '#111827',
                        borderRadius: '50%',
                        marginTop: '1rem',
                        marginRight: '0.75rem',
                        flexShrink: 0
                      }}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                      viewport={{ once: true }}
                    />
                    <span>{txt}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* 기업 연혁 Section */}
      <motion.section
        className="history-section"
        style={{ padding: '18rem 10rem 0 10rem', background: '#FFF9F4' }}
        {...fadeInUp}
      >
        <div style={{ maxWidth: '76rem', margin: '0 auto' }}>
          <div style={{ marginBottom: '4rem' }}>
            <motion.p
              style={{
                fontSize: '1.1rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#F88D2A',
                marginBottom: '0.75rem'
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              {historyTitle}
            </motion.p>
            <motion.h2
              style={{
                fontSize: '3.5rem',
                fontWeight: 700,
                color: '#111',
                margin: 0,
                lineHeight: 1.2
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              {historyDescription}
            </motion.h2>
          </div>

          <div>
            {historyItems.map((item, index) => {
              const isActive = index === activeHistoryIndex;
              return (
                <div
                  key={`${item.year}-${index}`}
                  className="history-row"
                  ref={el => {
                    historyItemRefs.current[index] = el;
                  }}
                  data-history-index={index}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 3fr',
                    gap: '2.5rem',
                    padding: '2.5rem 0',
                    borderTop: index === 0 ? '1px solid #f0e4d9' : '1px solid #efe1d4'
                  }}
                >
                  <div
                    className={`history-year ${isActive ? 'active' : ''}`}
                    style={{
                      fontSize: '3rem',
                      fontWeight: 700,
                      color: isActive ? '#111111' : '#C9C9C9',
                      transition: 'color 0.5s ease',
                      letterSpacing: '-0.02em'
                    }}
                  >
                    {item.year}
                  </div>
                  <div
                    className="history-content"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.85rem',
                      color: isActive ? '#333333' : '#E0E0E0',
                      transition: 'color 0.5s ease'
                    }}
                  >
                    {item.contents.map((content, contentIndex) => (
                      <p
                        key={`${item.year}-${contentIndex}`}
                        style={{
                          margin: 0,
                          fontSize: '1.25rem',
                          lineHeight: 1.5,
                          color: 'inherit',
                          fontWeight: 400
                        }}
                      >
                        {content}
                      </p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* 인증서 섹션 */}
      {aboutData[currentLang].certificates && aboutData[currentLang].certificates.length > 0 && (
        <motion.section
          className="certificates-section"
          style={{
            padding: '8rem 10rem',
            background: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            boxSizing: 'border-box'
          }}
          {...fadeInUp}
        >
          <motion.h2
            style={{
              fontSize: '3.5rem',
              fontWeight: 700,
              color: '#111',
              marginBottom: '4rem',
              textAlign: 'center'
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            CERTIFICATES & AWARDS
          </motion.h2>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '40px',
              width: '100%',
              maxWidth: '1400px',
              margin: '0 auto',
              padding: 0
            }}
          >
            {aboutData[currentLang].certificates.map((cert) => (
              <motion.div
                key={cert.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  maxWidth: '600px',
                  width: '100%',
                  margin: '0 auto'
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                {cert.image && (
                  <img
                    src={cert.image}
                    alt={cert.caption || 'Certificate'}
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxWidth: '100%',
                      objectFit: 'contain',
                      marginBottom: '1rem',
                      marginLeft: 'auto',
                      marginRight: 'auto',
                      display: 'block',
                      imageRendering: 'auto' as any
                    }}
                  />
                )}
                {cert.caption && (
                  <p
                    style={{
                      fontSize: '1rem',
                      color: '#333',
                      textAlign: 'center',
                      margin: 0,
                      maxWidth: '280px',
                      lineHeight: 1.5
                    }}
                  >
                    {cert.caption}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* "음식은 먹는 사람도 파는 사람도 건강해야 한다" Section */}
      <motion.section 
        className="slogan-section"
        style={{ 
          position: 'relative', 
          padding: '0', 
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        {...fadeInUp}
      >
        <div className="slogan-image-wrapper">
          <img 
            className="slogan-image"
            src={sloganImageSrc}
            alt="Kitchen background" 
            style={{
              width: '100%',
              objectPosition: `${sloganImagePos.x}% ${sloganImagePos.y}%`
            }}
          />
          <div className="slogan-overlay" />
        </div>
        
        {/* 텍스트 */}
        <motion.div 
          style={{ 
            position: 'absolute', 
            zIndex: 10, 
            textAlign: 'center', 
            color: 'white' 
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <motion.div 
            className="slogan-text"
            style={{ 
              fontSize: '8rem', 
              fontWeight: 'bold', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1rem',
              lineHeight: '1.2'
            }}
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
          >
            {aboutData[currentLang].sloganText.split('\n').map((line, index) => (
              <motion.div 
                key={index} 
                style={{ color: index === 1 || index === 2 ? '#ff9a4b' : 'white' }}
                initial={{ opacity: 0, y: 50, rotateX: -90 }}
                whileInView={{ 
                  opacity: 1, 
                  y: 0, 
                  rotateX: 0
                }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.3,
                  ease: "easeOut"
                }}
                viewport={{ once: true }}
              >
                {line}
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.5 }}
            viewport={{ once: true }}
          >
            <Cursor cursorColor="#F88D2A" />
          </motion.div>
        </motion.div>
      </motion.section>

{/* 글로벌 K-푸드 시대 … Section */}
<motion.section
  className="om-global-kfood"
  style={{
    position: 'relative',
    padding: '0 2rem 28rem 2rem',              // 하단 padding 증가 (20rem → 28rem)
    backgroundColor: '#F6EFE8',        // 연베이지
    overflow: 'hidden'
  }}
  {...fadeInUp}
>
  {/* 오른쪽 배경 일러스트 (섹션 배경 위에 바로 얹기) */}
  <div
    aria-hidden
    style={{
      position: 'absolute',
      inset: 0,
      backgroundImage: `url(${messageImageSrc})`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: `${messageImagePos.x}% ${messageImagePos.y}%`,
      backgroundSize: 'cover',
      opacity: 0.58,
      filter: 'grayscale(100%)',
      mixBlendMode: 'multiply',
      pointerEvents: 'none'
    }}
  />

  <div style={{ maxWidth: '100rem', margin: '0 auto', paddingTop: '150px' }}>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(10, 64rem) 1fr', // 좌 텍스트 폭 고정
        columnGap: '4rem',
        alignItems: 'start'
      }}
    >
      {/* 좌측 텍스트 컬럼 */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        {/* 제목 : 줄바꿈 강제 */}
        <motion.h2
          style={{
            fontWeight: 800,
            color: '#0F172A',
            lineHeight: 1.25,
            letterSpacing: '-0.02em',
            fontSize: 'clamp(4.25rem, 1.6vw + 1.6rem, 2.25rem)',
            marginBottom: '2.5rem',
            maxWidth: '22ch',
            textAlign: 'left'
          }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {aboutData[currentLang].messageTitle.split('\n').map((line, index) => (
            <React.Fragment key={index}>
              {line}
              {index < aboutData[currentLang].messageTitle.split('\n').length - 1 && <br/>}
            </React.Fragment>
          ))}
        </motion.h2>

        {/* 본문 : 줄너비/행간 통일 + 줄바꿈 강제 예시 */}
        <motion.div
          style={{
            color: '#374151',
            fontSize: '1.5625rem',  // ≒17px
            lineHeight: 1.5,
            letterSpacing: 0,
            maxWidth: '58ch',
            display: 'grid',
            rowGap: '2.5rem'
          }}
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
        >
          {aboutData[currentLang].messageContent.split('\n\n').map((paragraph, index) => (
            <motion.p 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ 
                opacity: 1, 
                y: 0
              }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              {paragraph.split('\n').map((line, lineIndex) => (
                <React.Fragment key={lineIndex}>
                  {line}
                  {lineIndex < paragraph.split('\n').length - 1 && <br/>}
                </React.Fragment>
              ))}
            </motion.p>
          ))}

          <motion.p 
            style={{ fontWeight: 600, color: '#111827', marginTop: '0.5rem' }}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
          >
            {aboutData[currentLang].representativeName}
          </motion.p>
        </motion.div>
      </motion.div>

      {/* 우측 컬럼은 비워둬 배경 일러스트가 보이게만 사용 */}
      <div />
    </div>
  </div>
       </motion.section>
       
      <style>{`
.intro-zigzag-section {
  background: #fff;
}
.intro-zigzag-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 4rem;
}
.intro-main-slogan {
  font-size: 3.5rem;
  font-weight: 800;
  text-align: center;
  line-height: 1.3;
  color: #111;
}
.intro-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4rem;
}
.intro-row.reverse {
  flex-direction: row-reverse;
}
.intro-text {
  flex: 1;
  max-width: 45%;
}
.intro-text .intro-label {
  font-size: 0.95rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: #e36e6e;
  margin-bottom: 1rem;
}
.intro-text h3 {
  font-size: 2.8rem;
  margin-bottom: 1.5rem;
  color: #111;
  line-height: 1.2;
}
.intro-text p {
  font-size: 1.2rem;
  line-height: 1.7;
  color: #374151;
}
.intro-image {
  flex: 1;
  max-width: 50%;
}
.intro-image img {
  width: 100%;
  height: auto;
  border-radius: 24px;
  object-fit: cover;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.12);
}
.about-page .history-section {
  background: #FFF9F4;
}
.about-page .history-row {
  border-bottom: 1px solid #f0e4d9;
}
.about-page .history-row:last-child {
  border-bottom: none;
}
.about-page .history-year {
  color: #C9C9C9;
  transition: color 0.3s ease;
}
.about-page .history-year.active {
  color: #111111;
}
.about-page .history-content p {
  color: #333333;
  font-size: 1.25rem;
  line-height: 1.6;
}
.about-page .slogan-section {
  height: auto !important;
  min-height: auto !important;
}
.about-page .slogan-image-wrapper {
  width: 100%;
  position: relative;
  margin: 0 !important;
  padding: 0 !important;
}
.about-page .slogan-image {
  width: 100%;
  height: auto !important;
  object-fit: contain !important;
  position: relative !important;
  display: block;
  margin: 0 !important;
  padding: 0 !important;
}
.about-page .slogan-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.15);
  pointer-events: none;
}
.about-page .certificates-section img {
  image-rendering: auto;
}

/* PC (1801px 이상)에는 기존 스타일 유지 */

/* 중간 해상도 (769px ~ 1800px) 스타일 */
@media (max-width: 1800px) {
  .intro-main-slogan {
    font-size: clamp(2rem, 4vw, 3rem);
  }
  .intro-row {
    gap: 2rem;
  }
  .intro-text {
    max-width: 50%;
  }
  .intro-text h3 {
    font-size: clamp(1.8rem, 3vw, 2.2rem);
  }
  .intro-text p {
    font-size: clamp(1rem, 1.6vw, 1.1rem);
  }
  .about-page section {
    padding: clamp(4rem, 5vw, 6rem) clamp(1rem, 2vw, 4rem) !important;
  }
  .about-page .history-section {
    padding: clamp(6rem, 8vw, 12rem) clamp(1.5rem, 3vw, 4rem) 0 clamp(1.5rem, 3vw, 4rem) !important;
  }
  .about-page .slogan-section {
    padding: 0 !important;
    margin: 0 !important;
  }
  .about-page .om-global-kfood {
    padding-top: 0 !important;
  }
  .about-page .history-row {
    grid-template-columns: 1fr 2fr !important;
    gap: clamp(1.5rem, 2.5vw, 3rem) !important;
  }
  .about-page .history-year {
    font-size: clamp(2.2rem, 3vw, 3rem) !important;
  }
  .about-page .history-content p {
    font-size: clamp(1rem, 1.4vw, 1.2rem) !important;
  }
  .about-page .slogan-image {
    object-fit: contain !important;
  }
  .about-page section:nth-of-type(2) > div,
  .about-page section:nth-of-type(3) > div {
    max-width: 1400px;
    margin: 0 auto;
  }
  .about-page section:nth-of-type(2) > div > div,
  .about-page section:nth-of-type(3) > div > div {
    grid-template-columns: 1fr 1fr !important;
    gap: clamp(1rem, 3vw, 2rem) !important;
  }
  .about-page section:nth-of-type(2) h2,
  .about-page section:nth-of-type(3) h2 {
    font-size: clamp(2.5rem, 4vw, 3.5rem) !important;
    margin-bottom: clamp(0.5rem, 1.5vw, 1rem) !important;
  }
  .about-page section:nth-of-type(2) h3,
  .about-page section:nth-of-type(3) h3 {
    font-size: clamp(1.8rem, 2.5vw, 2.5rem) !important;
    height: auto !important;
    width: auto !important;
    margin-bottom: clamp(1rem, 2.5vw, 1.5rem) !important;
  }
  .about-page section:nth-of-type(2) ul,
  .about-page section:nth-of-type(3) ul {
    list-style: none !important;
    padding: 0 !important;
    width: 100% !important;
    text-align: left !important;
  }
  .about-page section:nth-of-type(2) ul li,
  .about-page section:nth-of-type(3) ul li {
    font-size: clamp(0.9rem, 1.5vw, 1.1rem) !important;
    word-break: keep-all;
    margin-bottom: 0.5rem !important;
    padding-left: 0;
    text-align: left !important;
    width: 100% !important;
  }
  .about-page section:nth-of-type(2) ul li > span:first-child,
  .about-page section:nth-of-type(3) ul li > span:first-child {
    display: none !important;
  }
  .about-page section:nth-of-type(2) ul li > span:last-child,
  .about-page section:nth-of-type(3) ul li > span:last-child {
    display: block !important;
    text-align: left !important;
  }
  .about-page section:nth-of-type(2) > div > div > div:last-child,
  .about-page section:nth-of-type(3) > div > div > div:last-child {
    align-items: flex-start !important;
  }

  /* 1. 히어로 섹션 */
  .about-page section:first-of-type p {
    font-size: clamp(24px, 3vw, 70px) !important;
  }
  .about-page section:first-of-type span {
    font-size: clamp(40px, 6vw, 120px) !important;
  }
  
  /* 3. 슬로건 섹션 */
  .about-page .slogan-text {
    font-size: clamp(2.5rem, 6vw, 6rem) !important;
    line-height: 1.2 !important;
  }

  /* 4. K-푸드 섹션 */
  .about-page .om-global-kfood h2 {
    font-size: clamp(1.8rem, 3vw, 2.2rem) !important;
    text-align: left !important;
  }
  .about-page .om-global-kfood p {
    font-size: clamp(0.9rem, 1.5vw, 1rem) !important;
    text-align: left !important;
  }
  .about-page .certificates-section {
    padding: clamp(4rem, 6vw, 8rem) clamp(1.5rem, 3vw, 10rem) !important;
  }
  .about-page .certificates-section h2 {
    font-size: clamp(2rem, 4vw, 3.5rem) !important;
    margin-bottom: clamp(2rem, 4vw, 4rem) !important;
  }
  .about-page .certificates-section > div {
    gap: clamp(2rem, 4vw, 40px) !important;
  }
  .about-page .certificates-section > div > div {
    max-width: clamp(400px, 40vw, 600px) !important;
  }
  .about-page .certificates-section img {
    width: 100% !important;
    height: auto !important;
    max-width: 100% !important;
    image-rendering: auto !important;
  }
}

/* 모바일 (768px 이하) 스타일 */
@media (max-width: 768px) {
  .intro-zigzag-section {
    padding: 4rem 1.5rem !important;
  }
  .intro-main-slogan {
    font-size: 2rem;
  }
  .intro-row,
  .intro-row.reverse {
    flex-direction: column;
  }
  .intro-text,
  .intro-image {
    max-width: 100%;
  }
  .intro-text h3 {
    font-size: 1.8rem;
    text-align: center;
  }
  .intro-text p {
    font-size: 1rem;
    text-align: center;
  }
  .about-page section {
    padding: 3rem 1rem !important;
  }
  .about-page .history-section {
    padding: 3rem 1.25rem 0 1.25rem !important;
  }
  .about-page .slogan-section {
    padding: 0 !important;
    margin: 0 !important;
  }
  .about-page .om-global-kfood {
    padding-top: 0 !important;
  }
  .about-page .om-global-kfood > div {
    padding-top: 80px !important;
  }
  .about-page section h2,
  .about-page section h3,
  .about-page section p {
    text-align: center !important;
    margin-left: auto;
    margin-right: auto;
  }
  .about-page section:nth-of-type(2) > div > div,
  .about-page section:nth-of-type(3) > div > div {
    grid-template-columns: 1fr !important;
    gap: 2rem !important;
  }
  .about-page section:nth-of-type(3) > div > div {
    grid-template-columns: 1fr !important;
    gap: 2rem !important;
  }
  .about-page section:nth-of-type(2) > div > div > div:last-child,
  .about-page section:nth-of-type(3) > div > div > div:last-child {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    text-align: center !important;
    width: 100% !important;
  }
  .about-page section:nth-of-type(2) h2,
  .about-page section:nth-of-type(3) h2 {
    font-size: 1.8rem !important;
    margin-bottom: 1rem !important;
    text-align: center !important;
    width: 100% !important;
  }
  .about-page section:nth-of-type(3) h2 {
    font-size: 1.8rem !important;
    text-align: center !important;
  }
  .about-page section:nth-of-type(2) h3,
  .about-page section:nth-of-type(3) h3 {
    font-size: 1.5rem !important;
    height: auto !important;
    width: 100% !important;
    margin-bottom: 1.5rem !important;
    text-align: center !important;
    line-height: 1.4 !important;
  }
  .about-page section:nth-of-type(3) h3 {
    font-size: 1.5rem !important;
    text-align: center !important;
  }
  .about-page section:nth-of-type(2) ul,
  .about-page section:nth-of-type(3) ul {
    list-style: none !important;
    padding: 0 !important;
    width: 100% !important;
    text-align: center !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    gap: 0.75rem !important;
  }
  .about-page section:nth-of-type(2) ul li,
  .about-page section:nth-of-type(3) ul li {
    font-size: 1rem !important;
    word-break: keep-all;
    margin-bottom: 0 !important;
    padding-left: 0 !important;
    text-align: center !important;
    width: 100% !important;
    line-height: 1.5 !important;
  }
  .about-page section:nth-of-type(3) ul li {
    font-size: 1rem !important;
    padding-left: 0 !important;
  }
  .about-page section:nth-of-type(2) ul li > span:first-child,
  .about-page section:nth-of-type(3) ul li > span:first-child {
    display: none !important;
  }
  .about-page section:nth-of-type(2) ul li > span:last-child,
  .about-page section:nth-of-type(3) ul li > span:last-child {
    display: block !important;
    width: 100% !important;
    text-align: center !important;
  }
  .about-page section:first-of-type {
    padding: 0 !important;
    height: auto !important;
    min-height: unset !important;
    position: relative !important;
    z-index: 1 !important;
  }
  .about-page section:first-of-type img {
    position: relative !important;
    width: 100% !important;
    height: auto !important;
    min-height: unset !important;
    object-fit: contain !important;
    display: block !important;
    z-index: 1 !important;
  }
  .about-page section:first-of-type > div {
    position: absolute !important;
    top: auto !important;
    left: auto !important;
    right: 20px !important;
    bottom: 20px !important;
    transform: none !important;
    flex-direction: row !important;
    align-items: flex-end !important;
    text-align: right !important;
    width: auto !important;
    gap: 1rem !important;
    z-index: 1 !important;
  }
  .about-page section:first-of-type > div > div:first-child {
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-end !important;
  }
  .about-page section:first-of-type p {
    font-size: 1.5rem !important;
    margin-bottom: 0.5rem !important;
    text-align: right !important;
    color: white !important;
    margin: 0 !important;
    padding: 0 !important;
    line-height: 1.2 !important;
  }
  .about-page section:first-of-type span {
    font-size: 2.5rem !important;
    text-align: right !important;
    color: white !important;
    line-height: 1.2 !important;
  }
  .about-page section:first-of-type > div > div:last-of-type {
    align-self: stretch !important;
    height: auto !important;
    min-height: 60px !important;
    margin-top: 0 !important;
    flex-shrink: 0 !important;
  }
  .about-page section:nth-of-type(2) > div > div > div:first-child,
  .about-page section:nth-of-type(3) > div > div > div:first-child {
    justify-content: center !important;
    height: auto !important;
    width: 100% !important;
    margin-left: auto;
    margin-right: auto;
  }
  .about-page img.card-img {
    width: 100% !important;
    height: auto !important;
    max-height: 400px !important;
    object-fit: cover !important;
    object-position: center !important;
  }
  .about-page section:nth-of-type(3) img {
    width: 100% !important;
    height: auto !important;
  }
  .about-page .slogan-text {
    font-size: 2.2rem !important;
    line-height: 1.3 !important;
  }
  .about-page .history-row {
    grid-template-columns: 1fr !important;
    gap: 1rem !important;
    padding: 1.5rem 0 !important;
  }
  .about-page .history-year {
    font-size: 2rem !important;
    text-align: left !important;
  }
  .about-page .history-content p {
    font-size: 1rem !important;
    text-align: left !important;
  }
  .about-page .slogan-image {
    object-fit: contain !important;
  }
  .about-page .om-global-kfood {
    padding: 4rem 1.5rem 12rem 1.5rem !important;
  }
  .om-global-kfood > div {
    grid-template-columns: 1fr !important;
  }
  .om-global-kfood > div > div:first-child {
    max-width: 100% !important;
  }
  .om-global-kfood h2 {
    font-size: 2.2rem !important;
    margin-bottom: 1rem !important;
    text-align: left !important;
    width: 100% !important;
    max-width: 100% !important;
  }
  .om-global-kfood > div > div > div:first-child {
    text-align: left !important;
    align-items: flex-start !important;
    width: 100% !important;
  }
  .om-global-kfood > div > div > div:first-child > div {
    text-align: left !important;
    width: 100% !important;
    max-width: 100% !important;
  }
  .om-global-kfood p {
    font-size: 1rem !important;
    margin-bottom: 0.8rem !important;
    text-align: left !important;
    width: 100% !important;
    line-height: 1.6 !important;
  }
  .om-global-kfood p:last-of-type {
    margin-bottom: 0 !important;
    text-align: right !important;
    width: 100% !important;
  }
  .om-global-kfood > div[aria-hidden="true"] {
    height: 300px;
    background-position: center !important;
    background-size: cover !important;
    background-repeat: no-repeat !important;
    margin-top: 2rem;
    opacity: 0.4 !important;
  }
  .about-page .certificates-section {
    padding: 4rem 1.5rem !important;
    width: 100% !important;
    max-width: 100% !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    box-sizing: border-box !important;
  }
  .about-page .certificates-section h2 {
    font-size: 2rem !important;
    margin-bottom: 2rem !important;
  }
  .about-page .certificates-section > div {
    flex-direction: column !important;
    align-items: center !important;
    gap: 2rem !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 auto !important;
    padding: 0 !important;
  }
  .about-page .certificates-section > div > div {
    max-width: 90vw !important;
    width: 100% !important;
    margin: 0 auto !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
  }
  .about-page .certificates-section img {
    width: 100% !important;
    height: auto !important;
    max-width: 100% !important;
    margin-left: auto !important;
    margin-right: auto !important;
    display: block !important;
    image-rendering: auto !important;
  }
  /* 기업 정신 섹션 전용 모바일 스타일 */
  .spirit-section > div > div {
    grid-template-columns: 1fr !important;
    gap: 3rem !important;
  }
  .spirit-section img.card-img {
    width: 100% !important;
    height: auto !important;
    max-height: 400px !important;
    object-fit: cover !important;
    object-position: center !important;
    border-radius: 1rem !important;
  }
  .spirit-section h2 {
    font-size: 1.8rem !important;
    text-align: center !important;
    margin-bottom: 1rem !important;
  }
  .spirit-section h3 {
    font-size: 1.5rem !important;
    text-align: center !important;
    line-height: 1.4 !important;
    width: 100% !important;
    height: auto !important;
    margin-bottom: 2rem !important;
  }
  .spirit-section ul {
    padding: 0 !important;
    margin: 0 !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 1rem !important;
    align-items: center !important;
  }
  .spirit-section ul li {
    font-size: 1rem !important;
    text-align: center !important;
    padding-left: 0 !important;
    display: flex !important;
    justify-content: center !important;
    align-items: flex-start !important;
    width: 100% !important;
  }
  .spirit-section ul li > span:first-child {
    display: none !important;
  }
  .spirit-section ul li > span:last-child {
    display: block !important;
    width: 100% !important;
    text-align: center !important;
  }
}
`}</style>
     </div>
   );
 };

export default AboutPage; 