import React from 'react';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  image: string;
  name: string;
  category: string;
  badges?: string[];
  onClick?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ image, name, category, badges = [], onClick }) => (
  <div className={styles.card} onClick={onClick}>
    <div className={styles.imageWrap}>
      <img
        src={image}
        alt={name}
        className={styles.image}
        onError={e => {
          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkRGNUU2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTEwQzExMC41NTcgMTEwIDEyMCAxMDAuNTU3IDEyMCA5MEMxMjAgNzkuNDQzIDExMC41NTcgNzAgMTAwIDcwQzg5LjQ0MyA3MCA4MCA3OS40NDMgODAgOTBDODAgMTAwLjU1NyA4OS40NDMgMTEwIDEwMCAxMTBaIiBmaWxsPSIjQ0NDQ0NDIi8+CjxwYXRoIGQ9Ik0xMDAgMTMwQzExMC41NTcgMTMwIDEyMCAxMjAuNTU3IDEyMCAxMTBDMTIwIDk5LjQ0MyAxMTAuNTU3IDkwIDEwMCA5MEM4OS40NDMgOTAgODAgOTkuNDQzIDgwIDExMEM4MCAxMjAuNTU3IDg5LjQ0MyAxMzAgMTAwIDEzMFoiIGZpbGw9IiNDQ0NDQ0MiLz4KPC9zdmc+';
        }}
      />
      {badges.length > 0 && (
        <div className={styles.productBadges}>
          {badges.map((badge, idx) => (
            <span
              key={idx}
              className={`${styles.productBadge} ${
                badge === 'new' ? styles.productBadgeNew : badge === 'vegan' ? styles.productBadgeVegan : styles.productBadgeGlutenFree
              }`}
            >
              {badge === 'new' ? 'New' : badge === 'vegan' ? 'Vegan' : 'Gluten Free'}
            </span>
          ))}
        </div>
      )}
    </div>
    <div className={styles.info}>
      <div className={styles.name}>{name}</div>
      <div className={styles.category}>{category}</div>
    </div>
  </div>
);

export default ProductCard; 