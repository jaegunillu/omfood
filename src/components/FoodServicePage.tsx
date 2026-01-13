import React from 'react';

const FoodServicePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="py-20 px-8 bg-gradient-to-r from-orange-500 to-red-600">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-6">Food Service</h1>
          <p className="text-xl text-white/90">
            OM FOOD의 다양한 음식 서비스를 경험해보세요
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Service Card 1 */}
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🍕</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">프랜차이즈 운영</h3>
              <p className="text-gray-600">
                체계적인 프랜차이즈 시스템으로 성공적인 사업을 시작하세요.
              </p>
            </div>

            {/* Service Card 2 */}
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🍽️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">메뉴 개발</h3>
              <p className="text-gray-600">
                고객의 기호에 맞는 새로운 메뉴를 지속적으로 개발합니다.
              </p>
            </div>

            {/* Service Card 3 */}
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">사업 컨설팅</h3>
              <p className="text-gray-600">
                전문적인 컨설팅으로 사업 성공을 위한 전략을 제시합니다.
              </p>
            </div>

            {/* Service Card 4 */}
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🏪</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">매장 관리</h3>
              <p className="text-gray-600">
                효율적인 매장 운영과 고객 서비스를 위한 시스템을 제공합니다.
              </p>
            </div>

            {/* Service Card 5 */}
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">글로벌 확장</h3>
              <p className="text-gray-600">
                K-푸드의 글로벌화를 위한 해외 진출 전략을 지원합니다.
              </p>
            </div>

            {/* Service Card 6 */}
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">디지털 솔루션</h3>
              <p className="text-gray-600">
                최신 기술을 활용한 디지털 마케팅과 운영 솔루션을 제공합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            음식 서비스에 대해 더 자세히 알고 싶으신가요?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            OM FOOD의 전문가들이 도움을 드리겠습니다.
          </p>
          <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300">
            문의하기
          </button>
        </div>
      </section>
    </div>
  );
};

export default FoodServicePage; 