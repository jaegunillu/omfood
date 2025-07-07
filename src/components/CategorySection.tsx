import React from 'react';
import ProductCard from './ProductCard';

interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
  order: number;
}

interface CategorySectionProps {
  name: string;
  description: string;
  icon?: React.ReactNode;
  products: Product[];
  getBadges: (product: Product) => string[];
  onProductClick: (product: Product) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({ name, description, icon, products, getBadges, onProductClick }) => (
  <section className="w-full max-w-[1440px] mx-auto px-6 md:px-20 lg:px-20 py-16">
    <div className="mb-8 flex items-end gap-6">
      {icon && <div className="text-3xl md:text-4xl lg:text-5xl">{icon}</div>}
      <div>
        <h2 className="font-pretendard font-bold text-[28px] md:text-3xl text-neutral-900 mb-2 leading-tight">{name}</h2>
        <p className="font-pretendard text-base md:text-lg text-neutral-700 leading-relaxed max-w-xl text-left" dangerouslySetInnerHTML={{ __html: description }} />
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8 lg:gap-8">
      {products.map(product => (
        <ProductCard
          key={product.id}
          image={product.image}
          name={product.name}
          category={product.category}
          badges={getBadges(product)}
          onClick={() => onProductClick(product)}
        />
      ))}
    </div>
  </section>
);

export default CategorySection; 