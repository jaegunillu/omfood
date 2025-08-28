import React from 'react';
import { motion } from 'framer-motion';
import { useTypewriter, Cursor } from 'react-simple-typewriter';

const AboutPage: React.FC = () => {
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

  // 이미지 경로를 안전하게 처리
  const getImagePath = (imageName: string) => {
    return `${process.env.PUBLIC_URL}/ABOUT_IMG/${imageName}`;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      {/* 메인 히어로 섹션: 원본 전체 이미지 그대로 노출 (크롭 없음) */}
      <section style={{ 
        position: 'relative', 
        width: '100%',
        // height: '100vh' 제거: 크롭 원인
        overflow: 'hidden',
        backgroundColor: '#000' // 레터박스 영역이 생길 때 자연스러운 배경
      }}>
        {/* 원본 전체 이미지: 크롭 없이 */}
        <img 
          src={getImagePath('OM_E1.jpg')}
          alt="OM FOOD Background" 
          style={{
            display: 'block',
            width: '100%',
            height: 'auto',       // 핵심: 비율 유지 + 크롭 없음
            objectFit: 'contain', // 혹시 부모 높이가 생겨도 잘리지 않도록
            objectPosition: 'center'
          }}
        />
        
        {/* 텍스트 오버레이 - 1번 이미지와 정확히 동일한 위치와 사이즈 */}
        <div style={{ 
          position: 'absolute', 
          bottom: '4rem', 
          right: '4rem', 
          zIndex: 10,
          display: 'flex',
          alignItems: 'flex-end',
          gap: '1.5rem'
        }}>
          {/* 텍스트 블록 - 1번 이미지와 동일한 정렬 */}
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            textAlign: 'right'
          }}>
            {/* 첫 번째 텍스트 - 1번 이미지와 동일한 사이즈 */}
            <p style={{ 
              fontSize: '70px', 
              color: 'white', 
              margin: 10,
              padding: 0,
              fontWeight: '180',
              lineHeight: '1',
              marginBottom: '1rem',
              fontFamily: 'sans-serif'
            }}>
              진심이 담긴 맛
            </p>
            
            {/* 두 번째 텍스트 - 1번 이미지와 동일한 사이즈 */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'flex-end', 
              gap: '1rem' 
            }}>
              <span style={{ 
                fontSize: '120px', 
                fontWeight: 'bold',
                color: 'white',
                fontFamily: 'sans-serif',
                lineHeight: '1'
              }}>
                OM
              </span>
              <span style={{ 
                fontSize: '120px', 
                fontWeight: 'bold',
                color: 'white',
                fontFamily: 'sans-serif',
                lineHeight: '1'
              }}>
                FOOD
              </span>
            </div>
          </div>
          
          {/* 다홍색 세로 라인 - 1번 이미지와 동일한 색상과 크기 */}
          <div style={{ 
            width: '6px',
            height: '198px',
            backgroundColor: '#E25858',
            marginTop: '1rem',
            borderRadius: '3px'
          }}></div>
        </div>
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
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <motion.div
                style={{ position: 'relative' }}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.22 }}
              >
                <img
                  src={getImagePath('OM_E2.jpg')}
                  alt="Chess board with pawns"
                  style={{
                    width: '33.75rem',                 // 540px
                    height: '50.625rem',               // 810px (세로 우세 비율)
                    objectFit: 'cover',
                    borderRadius: '1.5rem',            // 24px 라운드
                    boxShadow: '0 20px 48px rgba(0, 0, 0, 0.12)'
                  }}
                />
              </motion.div>
            </div>

            {/* Right - 타이포 */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* 소제목: 살구빛, 얇고 크게 */}
              <h2
                style={{
                  fontSize: '5.5rem',                 // ≒ 56px
                  fontWeight: 100,
                  color: '#E36E6E',                   // 살구빛에 가깝게 톤업
                  letterSpacing: '0.01em',
                  margin: 0,
                  marginBottom: '1.25rem',
                  lineHeight: 1.05
                }}
              >
                경영 이념
              </h2>

              {/* 메인 헤드라인: 매우 크게, 두 줄 강제 개행 */}
                              <h3
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
                >
                체계적이고 조직적인<br />
                가맹점 관리와 철저한 사후관리
              </h3>

              {/* 불릿: 검은 점, 균일 행간/간격 */}
              <ul
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
              >
                {[
                  '완벽한 책임경영, 투명한 기업경영',
                  '수입의 일부 사회 환원(각종 봉사활동 실시, 장례)',
                  '고객의 기호에 맞는 신 메뉴 개발 강화 및 지속적 개발',
                  '고객에게는 참신하고 새로운 맛과 분위기로 성공브랜드 정착',
                  '지속적이고 철저한 사후관리로 믿음과 신뢰를 바탕으로 한 가맹점 우수경영'
                ].map((txt, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <span
                      style={{
                        width: '0.375rem',             // 6px 점
                        height: '0.375rem',
                        backgroundColor: '#111827',
                        borderRadius: '50%',
                        marginTop: '1rem',
                        marginRight: '0.75rem',        // 12px
                        flexShrink: 0
                      }}
                    />
                    <span>{txt}</span>
                  </li>
                ))}
              </ul>
            </div>
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
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <motion.div
                style={{ position: 'relative' }}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.22 }}
              >
                <img
                  src={getImagePath('OM_E3.jpg')}
                  alt="Stacked blocks"
                  style={{
                    width: '33.75rem',               // 540px
                    height: '50.625rem',             // 810px
                    objectFit: 'cover',
                    borderRadius: '1.5rem',          // 24px
                    boxShadow: '0 20px 48px rgba(0, 0, 0, 0.12)'
                  }}
                />
              </motion.div>
            </div>

            {/* Right — 타이포(값 동일) */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h2
                style={{
                  fontSize: '5.5rem',
                  fontWeight: 100,
                  color: '#E36E6E',
                  letterSpacing: '0.01em',
                  margin: 0,
                  marginBottom: '1.25rem',
                  lineHeight: 1.05
                }}
              >
                기업 정신
              </h2>

              <h3
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
              >
                고객의 만족을 최우선으로<br />
                미래를 지향하는 기업이 되겠습니다.
              </h3>

              <ul
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
              >
                {[
                  '모든 식재료에 있어 안전성과 신뢰를 최주선으로 생각하겠습니다.',
                  '차별화, 고급화, 동일화를 사명으로 한 고객 지향적 기업이 되겠습니다.',
                  '가맹점과 상생을 바탕으로, 신뢰와 협력의 동반성장 모델을 구축하겠습니다.',
                  '최고의 맛과 서비스 및 분위기 제공, 고객만족을 추구하는 기업이 되겠습니다.',
                  '표준 메뉴얼과 체계화된 교육프로그램으로 사전교육, 사후관리를 철저히 실시 하도록 하겠습니다.'
                ].map((txt, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <span
                      style={{
                        width: '0.375rem',
                        height: '0.375rem',
                        backgroundColor: '#111827',
                        borderRadius: '50%',
                        marginTop: '1rem',
                        marginRight: '0.75rem',
                        flexShrink: 0
                      }}
                    />
                    <span>{txt}</span>
                  </li>
                ))}
              </ul>
            </div>
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
          src={getImagePath('OM_E4.jpg')}
          alt="Kitchen background" 
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center'
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
        <div style={{ 
          position: 'relative', 
          zIndex: 10, 
          textAlign: 'center', 
          color: 'white' 
        }}>
          <div style={{ 
            fontSize: '8rem', 
            fontWeight: 'bold', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1rem',
            lineHeight: '1.2'
          }}>
            <div>음식은</div>
            <div style={{ color: '#ff9a4b' }}>먹는 사람도</div>
            <div style={{ color: '#ff9a4b' }}>파는 사람도</div>
            <div>건강해야 한다</div>
          </div>
          <Cursor cursorColor="#F88D2A" />
        </div>
      </motion.section>

{/* 글로벌 K-푸드 시대 … Section */}
<motion.section
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
      backgroundImage: `url(${getImagePath('OM_E5.jpg')})`,
      backgroundRepeat: 'no-repeat',
      // 오른쪽으로 너무 붙지 않도록 살짝 왼쪽으로 당김
      // (오른쪽 여백 약 8~10rem 확보 느낌)
      backgroundPosition: 'calc(10% - 0rem) center',
      // 데스크톱 기준 크기 고정 + 상한/하한 (원본처럼 큼직하게)
      backgroundSize: 'clamp(160rem, 50vw, 200rem)',
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
      <div>
        {/* 제목 : 줄바꿈 강제 */}
        <h2
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
        >
          글로벌 K-푸드 시대를 이끄는<br/>
          외식문화 선도기업 OM FOOD
        </h2>

        {/* 본문 : 줄너비/행간 통일 + 줄바꿈 강제 예시 */}
        <div
          style={{
            color: '#374151',
            fontSize: '1.5625rem',  // ≒17px
            lineHeight: 1.5,
            letterSpacing: 0,
            maxWidth: '58ch',
            display: 'grid',
            rowGap: '2.5rem'
          }}
        >
          <p>
            OM FOOD는 건강하고 정직한 식문화를 통해 고객의 일상에<br/>
            따뜻한 가치를 더하는 것을 목표로 합니다.
          </p>
          <p>
            기름에 튀기지 않고 오븐에 구워내는 등 본사만의 특별한 조리방식은<br/>
            현대인의 건강 트렌드에 부합하며, 식재료 본연의 맛과 영양을<br/>
            지키는 조리 철학을 바탕으로 보다 건강하고<br/>
            안심할 수 있는 음식을 제공합니다.
          </p>
          <p>
            또한, OM FOOD는 단순한 프랜차이즈를 넘어 K-푸드의 글로벌화를<br/>
            선도하는브랜드로 나아가고 있습니다. 한국의 전통적인 식재료와<br/>
            조리법에 현대적인 감각을 더해 전 세계 소비자들에게<br/>
            새로운 식문화의 경험을 제안합니다.
          </p>
          <p>
            세계 여러 나라의 식문화와 고객의 입맛을 연구하고, 이를 반영한<br/>
            현지 맞춤형 메뉴와 서비스로 글로벌 외식시장에서의<br/>
            경쟁력을 확보해 나가고 있습니다.
          </p>
          <p>
            OM FOOD는 앞으로도 건강한 재료, 정직한 조리, 감동 있는<br/>
            서비스로 고객의 신뢰를 쌓아가며 K-푸드를 대표하는<br/>
            글로벌 외식 브랜드로 성장하겠습니다.
          </p>

          <p style={{ fontWeight: 600, color: '#111827', marginTop: '0.5rem' }}>
            대표이사 박성우
          </p>
        </div>
      </div>

      {/* 우측 컬럼은 비워둬 배경 일러스트가 보이게만 사용 */}
      <div />
    </div>
  </div>
</motion.section>
    </div>
  );
};

export default AboutPage; 