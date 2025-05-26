import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { products as allProducts } from '../data/products';
import SkeletonProductCard from '../components/SkeletonProductCard';

// Basic placeholder component
const SearchResultsPage = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get('q');
    setSearchTerm(query || '');

    if (query) {
      setLoading(true);
      // Simulate search delay
      setTimeout(() => {
        const filtered = allProducts.filter(product =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase()) ||
          (product.description && product.description.toLowerCase().includes(query.toLowerCase()))
        );
        setResults(filtered);
        setLoading(false);
      }, 500);
    } else {
      setResults([]);
    }
  }, [location.search]);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">
        Kết quả tìm kiếm cho: "{searchTerm}"
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        {loading ? 'Đang tìm kiếm...' : `${results.length} sản phẩm được tìm thấy.`}
      </p>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {[...Array(4)].map((_, i) => <SkeletonProductCard key={i} />)}
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {results.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        !loading && searchTerm && <p className="text-center text-gray-500 dark:text-gray-400 text-lg">Không tìm thấy sản phẩm nào phù hợp.</p>
      )}
    </div>
  );
};

export default SearchResultsPage;

