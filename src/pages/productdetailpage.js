import React, { useContext, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { products as allProducts } from '../data/products';
import { CartContext } from '../contexts/CartContext';
import StarRating from '../components/StarRating';
import ProductCard from '../components/ProductCard'; // For related products

const ProductDetailPage = () => {
  const { productId } = useParams();
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Simulate API call
    const foundProduct = allProducts.find(p => p.id === productId);
    setProduct(foundProduct);

    if (foundProduct) {
      const related = allProducts.filter(
        p => p.category === foundProduct.category && p.id !== foundProduct.id
      ).slice(0, 4); // Get up to 4 related products
      setRelatedProducts(related);
    }
    
    // Scroll to top on product change
    window.scrollTo(0, 0);
    setLoading(false);
  }, [productId]);

  const handleQuantityChange = (amount) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };

  if (loading) {
    return ( // Basic skeleton for product detail
      <div className="container mx-auto px-4 py-8 md:py-12 animate-pulse">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div className="h-[300px] md:h-[500px] bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
          <div>
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6 mb-6"></div>
            <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Sản phẩm không tồn tại</h1>
        <Link to="/" className="text-primary hover:underline">Quay lại trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Product Image Gallery */}
          <div className="rounded-xl overflow-hidden shadow-xl">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-auto object-cover aspect-[4/3] md:aspect-square"
              loading="lazy"
            />
            {/* Placeholder for multiple images/carousel */}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white">{product.name}</h1>
            
            <div className="flex items-center space-x-3">
              <StarRating rating={product.rating} starSize="w-5 h-5" />
              <span className="text-sm text-gray-600 dark:text-gray-400">({product.reviews || 0} đánh giá)</span>
              {product.stock > 0 ? (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-200 text-xs font-semibold rounded-full">Còn hàng</span>
              ) : (
                <span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-200 text-xs font-semibold rounded-full">Hết hàng</span>
              )}
            </div>

            <div>
              <span className="text-3xl font-bold text-primary dark:text-secondary">${product.salePrice}</span>
              {product.price > product.salePrice && (
                <span className="text-lg text-gray-500 dark:text-gray-400 line-through ml-3">${product.price}</span>
              )}
            </div>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{product.description}</p>
            
            {product.features && product.features.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Tính năng nổi bật:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quantity Selector & Add to Cart */}
            {product.stock > 0 && (
                <div className="flex items-center space-x-4 pt-4">
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                    <button 
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-lg disabled:opacity-50"
                    aria-label="Decrease quantity"
                    >
                    <i className="fas fa-minus"></i>
                    </button>
                    <input 
                    type="number"
                    value={quantity}
                    readOnly // Or implement onChange for direct input
                    className="w-12 text-center py-2.5 bg-transparent border-none focus:ring-0 text-gray-800 dark:text-white"
                    aria-label="Current quantity"
                    />
                    <button 
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                    className="px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-lg disabled:opacity-50"
                    aria-label="Increase quantity"
                    >
                    <i className="fas fa-plus"></i>
                    </button>
                </div>
                <button 
                    onClick={() => addToCart(product, quantity)}
                    className="flex-grow bg-primary hover:bg-red-600 dark:bg-secondary dark:hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold text-lg transition flex items-center justify-center space-x-2"
                    aria-label={`Add ${quantity} of ${product.name} to cart`}
                >
                    <i className="fas fa-cart-plus"></i>
                    <span>Thêm vào giỏ</span>
                </button>
                </div>
            )}
            {product.stock === 0 && (
                <p className="text-red-500 font-semibold">Sản phẩm hiện đang hết hàng.</p>
            )}

            <div className="text-sm text-gray-500 dark:text-gray-400 pt-4">
              <p>Danh mục: <Link to={`/products?category=${product.category}`} className="text-primary hover:underline">{product.category.charAt(0).toUpperCase() + product.category.slice(1)}</Link></p>
              {/* <p>Tags: Tag1, Tag2</p> */}
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 md:mt-20">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800 dark:text-white">Sản Phẩm Tương Tự</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {relatedProducts.map(relatedProduct => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;

