import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTypewriter, Cursor } from 'react-simple-typewriter';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const AboutPage: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [currentLang, setCurrentLang] = useState<'ko' | 'en'>('ko');
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
      messageImagePos: { x: 50, y: 50 }
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
      messageImagePos: { x: 50, y: 50 }
    }
  });

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
          setAboutData(prev => ({
            ...prev,
            ko: { ...prev.ko, ...koDoc.data() }
          }));
        }
        if (enDoc.exists()) {
          setAboutData(prev => ({
            ...prev,
            en: { ...prev.en, ...enDoc.data() }
          }));
        }
      } catch (error) {
        console.error('About 데이터 로드 실패:', error);
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

  const [text] = useTypewriter({
    words: ['먹는 사람도', '파는 사람도'],
    loop: 1,
    typeSpeed: 100,
    deleteSpeed: 50,
    delaySpeed: 1000,
  });

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

  // 이미지 경로를 안전하게 처리
  const getImagePath = (imageName: string) => {
    return `${process.env.PUBLIC_URL}/ABOUT_IMG/${imageName}`;
  };

  const headerImageSrc = aboutData[currentLang].headerImage || getImagePath('OM_E1.jpg');
  const philosophyImageSrc = aboutData[currentLang].philosophyImage || getImagePath('OM_E2.jpg');
  const spiritImageSrc = aboutData[currentLang].spiritImage || getImagePath('OM_E3.jpg');
  const sloganImageSrc = aboutData[currentLang].sloganImage || getImagePath('OM_E4.jpg');
  const messageImageSrc = aboutData[currentLang].messageImage || getImagePath('OM_E5.jpg');

  // 이미지 포커스 포인트 위치 정보
  const headerImagePos = aboutData[currentLang].headerImagePos || { x: 50, y: 50 };
  const philosophyImagePos = aboutData[currentLang].philosophyImagePos || { x: 50, y: 50 };
  const spiritImagePos = aboutData[currentLang].spiritImagePos || { x: 50, y: 50 };
  const sloganImagePos = aboutData[currentLang].sloganImagePos || { x: 50, y: 50 };
  const messageImagePos = aboutData[currentLang].messageImagePos || { x: 50, y: 50 };

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

      {/* "음식은 먹는 사람도 파는 사람도 건강해야 한다" Section */}
      <motion.section 
        style={{ 
          position: 'relative', 
          padding: '8rem 2rem', 
          overflow: 'hidden',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        {...fadeInUp}
      >
      {/* 배경 이미지 */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <img 
          src={sloganImageSrc}
          alt="Kitchen background" 
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: `${sloganImagePos.x}% ${sloganImagePos.y}%`
          }}
        />
      </div> 
        {/* 어두운 오버레이 */}
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          backgroundColor: 'rgba(0, 0, 0, 0.02)' 
        }}></div>
        
        {/* 텍스트 */}
        <motion.div 
          style={{ 
            position: 'relative', 
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
    padding: '20rem 2rem',              // 20rem → 6rem (원본 여백감에 맞춤)
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

  <div style={{ maxWidth: '100rem', margin: '0 auto' }}>
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
/* PC (1801px 이상)에는 기존 스타일 유지 */

/* 중간 해상도 (769px ~ 1800px) 스타일 */
@media (max-width: 1800px) {
  .about-page section {
    padding: clamp(4rem, 5vw, 6rem) clamp(1rem, 2vw, 4rem) !important;
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
  .about-page section:nth-of-type(4) > div > div {
    font-size: clamp(2.5rem, 5vw, 8rem) !important;
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
}

/* 모바일 (768px 이하) 스타일 */
@media (max-width: 768px) {
  .about-page section {
    padding: 4rem 1rem !important;
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
  .about-page section:nth-of-type(2) h2,
  .about-page section:nth-of-type(3) h2 {
    font-size: 2.5rem !important;
    margin-bottom: 1rem !important;
  }
  .about-page section:nth-of-type(2) h3,
  .about-page section:nth-of-type(3) h3 {
    font-size: 1.8rem !important;
    height: auto !important;
    width: auto !important;
    margin-bottom: 1.5rem !important;
  }
  .about-page section:nth-of-type(2) ul,
  .about-page section:nth-of-type(3) ul {
    list-style: none !important;
    padding: 0 !important;
    width: 100% !important;
    text-align: center !important;
  }
  .about-page section:nth-of-type(2) ul li,
  .about-page section:nth-of-type(3) ul li {
    font-size: 1.1rem !important;
    word-break: keep-all;
    margin-bottom: 0.5rem !important;
    padding-left: 0;
    text-align: center !important;
    width: 100% !important;
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
  }
  .about-page section:first-of-type img {
    width: 100% !important;
    height: auto !important;
    object-fit: cover !important;
  }
  .about-page section:first-of-type > div {
    position: absolute !important;
    top: auto !important;
    left: auto !important;
    right: 1rem !important;
    bottom: 2rem !important;
    transform: none !important;
    flex-direction: column !important;
    align-items: flex-end !important;
    width: auto !important;
  }
  .about-page section:first-of-type p {
    font-size: 24px !important;
    margin-bottom: 0 !important;
    text-align: right !important;
    color: white !important;
  }
  .about-page section:first-of-type span {
    font-size: 40px !important;
    text-align: right !important;
    color: white !important;
  }
  .about-page section:first-of-type > div > div:last-of-type {
    display: none !important;
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
    object-fit: cover !important;
    object-position: center !important;
  }
  .about-page section:nth-of-type(4) > div > div {
    font-size: 3rem !important;
    line-height: 1.2 !important;
  }
  .about-page .om-global-kfood {
    padding: 4rem 1rem !important;
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
  }
  .om-global-kfood p {
    font-size: 1rem !important;
    margin-bottom: 0.8rem !important;
    text-align: center !important;
  }
  .om-global-kfood p:last-of-type {
    margin-bottom: 0 !important;
  }
  .om-global-kfood > div[aria-hidden="true"] {
    height: 300px;
    background-position: center !important;
    background-size: cover !important;
    background-repeat: no-repeat !important;
    margin-top: 2rem;
  }
}
`}</style>
     </div>
   );
 };

export default AboutPage; 