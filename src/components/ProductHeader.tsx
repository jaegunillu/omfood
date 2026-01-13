import React from 'react';

interface ProductHeaderProps {
  slogan: string;
  subSlogan: string;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({ slogan, subSlogan }) => (
  <section className="w-full max-w-[1440px] mx-auto px-6 md:px-20 lg:px-20 pt-16 pb-10 text-center">
    <h1 className="font-pretendard font-bold text-3xl md:text-4xl lg:text-5xl text-neutral-900 mb-4 leading-tight" dangerouslySetInnerHTML={{ __html: slogan }} />
    <p className="font-pretendard text-base md:text-lg text-neutral-700 leading-relaxed max-w-3xl mx-auto" dangerouslySetInnerHTML={{ __html: subSlogan }} />
  </section>
);

export default ProductHeader; 