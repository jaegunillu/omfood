import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAdminLang } from '../../App';

// File: /src/components/admin/AboutPage_admin.tsx
// [주의] 오직 이 파일만 수정하고, 다른 파일은 절대 건드리지 마세요.

interface AboutContent {
  // 헤더 섹션
  headerImage: string;
  headerTitle: string;
  headerSubtitle: string;
  
  // 경영 이념 섹션
  philosophyTitle: string;
  philosophySubtitle: string;
  philosophyItems: string[];
  philosophyImage: string;
  
  // 기업 정신 섹션
  spiritTitle: string;
  spiritSubtitle: string;
  spiritItems: string[];
  spiritImage: string;
  
  // 핵심 슬로건 섹션
  sloganText: string;
  sloganImage: string;
  
  // 대표 메시지 섹션
  messageTitle: string;
  messageContent: string;
  representativeName: string;
  messageImage: string;
}

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
    messageImage: ''
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
    messageImage: ''
  });

  const currentContent = adminLang === 'ko' ? koContent : enContent;
  const setCurrentContent = adminLang === 'ko' ? setKoContent : setEnContent;

  // 이미지 업로드 핸들러
  const handleImageUpload = (field: keyof AboutContent, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setCurrentContent(prev => ({ ...prev, [field]: imageUrl }));
    };
    reader.readAsDataURL(file);
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

  // Firebase에서 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        const koDoc = await getDoc(doc(db, 'about', 'ko'));
        const enDoc = await getDoc(doc(db, 'about', 'en'));
        
        if (koDoc.exists()) {
          setKoContent(koDoc.data() as AboutContent);
        }
        if (enDoc.exists()) {
          setEnContent(enDoc.data() as AboutContent);
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
      <div className="mx-auto" style={{ width: '2100px', maxWidth: '2100px' }}>
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
                    <img 
                      src={currentContent.headerImage} 
                      alt="Header" 
                      className="w-full h-64 object-cover"
                    />
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

              {/* 경영 이념 프리뷰 */}
              <div className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    {currentContent.philosophyImage ? (
                      <img 
                        src={currentContent.philosophyImage} 
                        alt="Philosophy" 
                        className="w-full h-64 object-cover rounded-lg"
                      />
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
                      <img 
                        src={currentContent.spiritImage} 
                        alt="Spirit" 
                        className="w-full h-64 object-cover rounded-lg"
                      />
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

              {/* 슬로건 프리뷰 */}
              <div className="mb-8">
                <div className="relative bg-gray-800 rounded-lg overflow-hidden">
                  {currentContent.sloganImage ? (
                    <img 
                      src={currentContent.sloganImage} 
                      alt="Slogan" 
                      className="w-full h-64 object-cover"
                    />
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
                        <img 
                          src={currentContent.messageImage} 
                          alt="Message" 
                          className="w-full h-64 object-cover rounded-lg"
                        />
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
