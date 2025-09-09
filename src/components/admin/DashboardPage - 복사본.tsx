import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import { db } from '../../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAdminLang } from '../../App';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { adminLang } = useAdminLang();
  const [menuNames, setMenuNames] = useState<{ en: string[]; ko: string[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = doc(db, 'header_menu', 'main');
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data && Array.isArray(data.en) && Array.isArray(data.ko)) {
          setMenuNames({ en: [...data.en], ko: [...data.ko] });
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 메뉴 설명(고정) - HOME 제외
  const menuDescriptions = [
    '헤더, 메인 섹션, 슬로건, 스토어, 브랜드 관리',
    'ABOUT 페이지 관리',
    '브랜드 페이지 관리',
    '제품 관리',
    'CONTACT 페이지 관리',
    '푸터 영역 관리'
  ];

  // 메뉴 경로(고정) - HOME 제외
  const menuPaths = [
    '/admin/mainpage',
    '/admin/about',
    '/admin/brandpage',
    '/admin/products',
    '/admin/contact',
    '/admin/footer'
  ];

  // 메뉴 아이콘(고정) - HOME 제외
  const menuIcons = ['🏠', 'ℹ️', '🏢', '📦', '📞', '📄'];
  const menuColors = [
    'bg-gradient-to-br from-orange-500 to-orange-600',
    'bg-gradient-to-br from-blue-500 to-blue-600',
    'bg-gradient-to-br from-green-500 to-green-600',
    'bg-gradient-to-br from-purple-500 to-purple-600',
    'bg-gradient-to-br from-pink-500 to-pink-600',
    'bg-gradient-to-br from-orange-400 to-orange-600'
  ];

  // 현재 언어의 메뉴명 배열 가져오기
  const allMenuNames = menuNames?.[adminLang] || [];
  console.log('원본 메뉴명:', allMenuNames);

  // HOME 메뉴인지 확인하는 함수
  const isHomeMenu = (name: string) => {
    const lowerName = name.toLowerCase().trim();
    return lowerName.includes('home') || 
           lowerName.includes('홈') ||
           lowerName.includes('food service') ||
           lowerName.includes('푸드서비스') ||
           lowerName.includes('foodservice') ||
           lowerName === 'home' ||
           lowerName === '홈' ||
           lowerName === 'food service' ||
           lowerName === '푸드서비스';
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ width: '2100px', maxWidth: '2100px' }}>
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-pretendard mb-2">
            OM FOOD 관리자 대시보드
          </h1>
          <p className="text-gray-600 font-pretendard">
            웹사이트 콘텐츠와 설정을 관리하세요
          </p>
        </div>

        {/* 메뉴 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading || !menuNames ? (
            <div>로딩 중...</div>
          ) : (
            allMenuNames.map((title, originalIndex) => {
              // HOME 메뉴인 경우 렌더링하지 않음
              if (isHomeMenu(title)) {
                console.log('제외된 메뉴:', title);
                return null;
              }

              // HOME이 아닌 메뉴들의 인덱스 계산
              const nonHomeMenus = allMenuNames.filter((_, idx) => idx <= originalIndex && !isHomeMenu(allMenuNames[idx]));
              const displayIndex = nonHomeMenus.length - 1;

              return (
                <div
                  key={originalIndex}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
                  onClick={() => navigate(menuPaths[displayIndex] || '/')}
                >
                  <div className={`${menuColors[displayIndex]} p-6 text-white`}>
                    <div className="text-3xl mb-2">{menuIcons[displayIndex]}</div>
                    <h3 className="text-xl font-semibold font-pretendard mb-1">
                      {title}
                    </h3>
                    <p className="text-orange-100 text-sm font-pretendard">
                      {menuDescriptions[displayIndex]}
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 font-pretendard">
                        클릭하여 관리
                      </span>
                      <div className="w-6 h-6 text-gray-400 group-hover:text-orange-500 transition-colors">
                        →
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 빠른 액션 */}
        <div className="mt-12 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 font-pretendard mb-4">
            빠른 액션
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/admin/mainpage')}
            >
              메인페이지 수정
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/admin/about')}
            >
              ABOUT 관리
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/admin/products')}
            >
              제품 추가
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 