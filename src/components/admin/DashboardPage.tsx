import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: '메인페이지 관리',
      description: '헤더, 섹션, 슬로건, 스토어, 브랜드 관리',
      icon: '🏠',
      path: '/admin/mainpage',
      color: 'bg-gradient-to-br from-orange-500 to-orange-600'
    },
    {
      title: '브랜드 페이지 관리',
      description: '브랜드 추가, 목록, 메인 영역 미디어 관리',
      icon: '🏢',
      path: '/admin/brandpage',
      color: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    {
      title: '제품 관리',
      description: '제품 추가, 수정, 삭제, 순서 변경',
      icon: '📦',
      path: '/admin/products',
      color: 'bg-gradient-to-br from-green-500 to-green-600'
    },
    {
      title: '스토어 관리',
      description: '스토어 정보 관리 및 위치 설정',
      icon: '🏪',
      path: '/admin/stores',
      color: 'bg-gradient-to-br from-purple-500 to-purple-600'
    },
    {
      title: '푸터 영역 관리',
      description: '홈페이지 하단 링크/SNS/카피라이트 관리',
      icon: '📄',
      path: '/admin/footer',
      color: 'bg-gradient-to-br from-orange-400 to-orange-600'
    },
    {
      title: '시스템 설정',
      description: '사이트 설정 및 관리자 계정 관리',
      icon: '⚙️',
      path: '/admin/settings',
      color: 'bg-gradient-to-br from-gray-500 to-gray-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          {menuItems.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
              onClick={() => navigate(item.path)}
            >
              <div className={`${item.color} p-6 text-white`}>
                <div className="text-3xl mb-2">{item.icon}</div>
                <h3 className="text-xl font-semibold font-pretendard mb-1">
                  {item.title}
                </h3>
                <p className="text-orange-100 text-sm font-pretendard">
                  {item.description}
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
          ))}
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
              onClick={() => navigate('/admin/brandpage')}
            >
              브랜드 추가
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