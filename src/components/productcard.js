import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';
import StarRating from './StarRating';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group flex flex-col">
      <Link to={`/product/${product.id}`} className="block relative overflow-hidden aspect-square">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        {product.salePrice < product.price && (
           <div className="absolute top-3 left-3 bg-primary text-white text-xs font-semibold px-2 py-1 rounded-full">
            SALE {Math.round(((product.price - product.salePrice) / product.price) * 100)}%
          </div>
        )}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
           <span className="text-white text-center text-sm font-semibold bg-black/50 px-3 py-2 rounded-md">Xem Chi Tiết</span>
        </div>
      </Link>
      <div className="p-5 flex flex-col flex-grow">
        <Link to={`/product/${product.id}`} className="block">
          <h4 className="text-lg font-semibold mb-1 text-gray-800 dark:text-white group-hover:text-primary dark:group-hover:text-secondary transition-colors truncate" title={product.name}>
            {product.name}
          </h4>
        </Link>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase">{product.category}</p>
        
        <div className="flex items-center mb-3">
          <StarRating rating={product.rating} />
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({product.reviews || 0} reviews)</span>
        </div>

        <div className="mt-auto">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-primary dark:text-secondary font-bold text-2xl">${product.salePrice}</span>
              {product.price > product.salePrice && (
                <span className="text-gray-500 dark:text-gray-400 line-through ml-2 text-sm">${product.price}</span>
              )}
            </div>
          </div>
          <button 
            onClick={() => addToCart(product)}
            aria-label={`Add ${product.name} to cart`}
            className="w-full bg-primary hover:bg-red-600 dark:bg-secondary dark:hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg font-semibold transition-colors duration-300 text-sm flex items-center justify-center space-x-2"
          >
            <i className="fas fa-cart-plus"></i>
            <span>Thêm Giỏ Hàng</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

