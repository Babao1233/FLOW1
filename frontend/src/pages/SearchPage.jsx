import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CategoryFilter from '../components/search/CategoryFilter';
import PriceFilter from '../components/search/PriceFilter';
import BrandFilter from '../components/search/BrandFilter';
import RatingFilter from '../components/search/RatingFilter';
import SortOptions from '../components/search/SortOptions';
import SearchResults from '../components/search/SearchResults';

/**
 * Trang tìm kiếm và lọc sản phẩm
 * Cho phép người dùng tìm kiếm, lọc và sắp xếp sản phẩm theo nhiều tiêu chí
 */
const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Lấy tham số từ URL
  const queryParams = new URLSearchParams(location.search);
  const queryFromUrl = queryParams.get('q') || '';
  const categoryFromUrl = queryParams.get('category') || '';
  const pageFromUrl = parseInt(queryParams.get('page') || '1', 10);
  const sortFromUrl = queryParams.get('sort') || 'relevance';
  const brandsFromUrl = queryParams.get('brands') ? queryParams.get('brands').split(',') : [];
  const ratingFromUrl = queryParams.get('rating') ? parseInt(queryParams.get('rating'), 10) : null;
  const minPriceFromUrl = queryParams.get('min_price') || '';
  const maxPriceFromUrl = queryParams.get('max_price') || '';
  
  // State cho các tùy chọn tìm kiếm và lọc
  const [searchQuery, setSearchQuery] = useState(queryFromUrl);
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);
  const [selectedBrands, setSelectedBrands] = useState(brandsFromUrl);
  const [selectedRating, setSelectedRating] = useState(ratingFromUrl);
  const [priceRange, setPriceRange] = useState({
    min: minPriceFromUrl,
    max: maxPriceFromUrl
  });
  const [selectedSort, setSelectedSort] = useState(sortFromUrl);
  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  const [viewMode, setViewMode] = useState('grid');
  
  // State cho dữ liệu sản phẩm
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // State cho dữ liệu bộ lọc
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  
  // State cho bộ lọc di động
  const [showFilters, setShowFilters] = useState(false);
  
  // Cập nhật URL khi các tùy chọn tìm kiếm và lọc thay đổi
  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedBrands.length > 0) params.set('brands', selectedBrands.join(','));
    if (selectedRating) params.set('rating', selectedRating.toString());
    if (priceRange.min) params.set('min_price', priceRange.min);
    if (priceRange.max) params.set('max_price', priceRange.max);
    if (selectedSort !== 'relevance') params.set('sort', selectedSort);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    navigate({ pathname: '/search', search: params.toString() });
  }, [
    searchQuery,
    selectedCategory,
    selectedBrands,
    selectedRating,
    priceRange,
    selectedSort,
    currentPage,
    navigate
  ]);
  
  // Tải dữ liệu sản phẩm từ API
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      // Tạo tham số truy vấn API
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (selectedCategory) params.set('category', selectedCategory);
      if (selectedBrands.length > 0) params.set('brands', selectedBrands.join(','));
      if (selectedRating) params.set('min_rating', selectedRating.toString());
      if (priceRange.min) params.set('min_price', priceRange.min);
      if (priceRange.max) params.set('max_price', priceRange.max);
      params.set('sort', selectedSort);
      params.set('page', currentPage.toString());
      params.set('limit', '12'); // Số sản phẩm trên mỗi trang
      
      // Gọi API lấy dữ liệu sản phẩm
      // Demo: Giả lập dữ liệu API
      await new Promise(resolve => setTimeout(resolve, 800)); // Giả lập độ trễ
      
      // Dữ liệu sản phẩm giả lập
      const mockProducts = Array(12).fill(null).map((_, index) => ({
        id: index + 1 + (currentPage - 1) * 12,
        name: `Sản phẩm thông minh ${index + 1 + (currentPage - 1) * 12}`,
        price: Math.floor(Math.random() * 10000000) + 500000,
        discount_price: Math.random() > 0.5 ? Math.floor(Math.random() * 8000000) + 400000 : null,
        image_url: `https://via.placeholder.com/300x300.png?text=Product+${index + 1 + (currentPage - 1) * 12}`,
        rating: Math.floor(Math.random() * 5) + 1,
        review_count: Math.floor(Math.random() * 100),
        description: 'Sản phẩm thông minh cao cấp, tính năng hiện đại, thiết kế sang trọng.',
        stock_status: Math.random() > 0.2 ? 'in_stock' : 'out_of_stock',
        category: 'smart-home',
        brand: 'Yapee'
      }));
      
      setProducts(mockProducts);
      setTotalResults(100); // Giả lập tổng số kết quả
      setTotalPages(Math.ceil(100 / 12)); // Giả lập tổng số trang
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu sản phẩm:', error);
    } finally {
      setLoading(false);
    }
  }, [
    searchQuery,
    selectedCategory,
    selectedBrands,
    selectedRating,
    priceRange,
    selectedSort,
    currentPage
  ]);
  
  // Tải dữ liệu bộ lọc từ API
  const fetchFilters = useCallback(async () => {
    try {
      // Gọi API lấy dữ liệu danh mục và thương hiệu
      // Demo: Giả lập dữ liệu API
      
      // Danh mục sản phẩm giả lập
      const mockCategories = [
        { id: 'smart-home', name: 'Nhà thông minh', count: 45 },
        { id: 'smart-kitchen', name: 'Nhà bếp thông minh', count: 23 },
        { id: 'smart-lighting', name: 'Đèn thông minh', count: 18 },
        { id: 'smart-security', name: 'An ninh thông minh', count: 15 },
        { id: 'smart-entertainment', name: 'Giải trí thông minh', count: 12 },
        { id: 'smart-health', name: 'Sức khỏe thông minh', count: 8 }
      ];
      
      // Thương hiệu giả lập
      const mockBrands = [
        { id: 'yapee', name: 'Yapee', count: 35 },
        { id: 'xiaomi', name: 'Xiaomi', count: 28 },
        { id: 'google', name: 'Google', count: 22 },
        { id: 'samsung', name: 'Samsung', count: 18 },
        { id: 'philips', name: 'Philips', count: 15 },
        { id: 'bosch', name: 'Bosch', count: 12 },
        { id: 'lg', name: 'LG', count: 10 },
        { id: 'aqara', name: 'Aqara', count: 8 },
        { id: 'tuya', name: 'Tuya', count: 7 },
        { id: 'sonoff', name: 'Sonoff', count: 5 }
      ];
      
      setCategories(mockCategories);
      setBrands(mockBrands);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu bộ lọc:', error);
    }
  }, []);
  
  // Xử lý thay đổi trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Cuộn lên đầu trang
    window.scrollTo(0, 0);
  };
  
  // Xử lý thay đổi cách hiển thị (lưới/danh sách)
  const toggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid');
  };
  
  // Xóa tất cả bộ lọc
  const clearAllFilters = () => {
    setSelectedCategory('');
    setSelectedBrands([]);
    setSelectedRating(null);
    setPriceRange({ min: '', max: '' });
    setCurrentPage(1);
  };
  
  // Cập nhật URL khi các tùy chọn thay đổi
  useEffect(() => {
    updateUrl();
  }, [
    searchQuery,
    selectedCategory,
    selectedBrands,
    selectedRating,
    priceRange,
    selectedSort,
    currentPage,
    updateUrl
  ]);
  
  // Tải dữ liệu khi trang được tải lần đầu
  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);
  
  // Tải dữ liệu sản phẩm khi các tùy chọn thay đổi
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  
  // Cập nhật tìm kiếm từ thanh tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    // Reset về trang 1 khi tìm kiếm mới
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Tiêu đề trang */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {searchQuery 
            ? `Kết quả tìm kiếm cho "${searchQuery}"`
            : selectedCategory 
              ? `Sản phẩm ${categories.find(cat => cat.id === selectedCategory)?.name || ''}`
              : 'Tất cả sản phẩm'}
        </h1>
        {totalResults > 0 && (
          <p className="text-gray-600 mt-1">
            Tìm thấy {totalResults} sản phẩm
          </p>
        )}
      </div>
      
      {/* Thanh tìm kiếm */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-amber-500 border-gray-300"
            placeholder="Tìm kiếm sản phẩm..."
          />
          <button
            type="submit"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-r-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>
      </div>
      
      {/* Bộ lọc áp dụng */}
      {(selectedCategory || selectedBrands.length > 0 || selectedRating || priceRange.min || priceRange.max) && (
        <div className="flex flex-wrap items-center gap-2 mb-6 bg-gray-50 p-3 rounded-md">
          <span className="text-gray-700 font-medium">Bộ lọc đã chọn:</span>
          
          {selectedCategory && (
            <div className="flex items-center bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
              <span>
                {categories.find(cat => cat.id === selectedCategory)?.name || 'Danh mục'}
              </span>
              <button
                onClick={() => setSelectedCategory('')}
                className="ml-2 text-amber-600 hover:text-amber-800"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
          
          {selectedBrands.map((brandId) => (
            <div key={brandId} className="flex items-center bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
              <span>
                {brands.find(brand => brand.id === brandId)?.name || 'Thương hiệu'}
              </span>
              <button
                onClick={() => setSelectedBrands(selectedBrands.filter(id => id !== brandId))}
                className="ml-2 text-amber-600 hover:text-amber-800"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
          
          {selectedRating && (
            <div className="flex items-center bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
              <span className="flex items-center">
                {selectedRating} sao trở lên
              </span>
              <button
                onClick={() => setSelectedRating(null)}
                className="ml-2 text-amber-600 hover:text-amber-800"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
          
          {(priceRange.min || priceRange.max) && (
            <div className="flex items-center bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
              <span>
                Giá: 
                {priceRange.min ? ` từ ${new Intl.NumberFormat('vi-VN').format(priceRange.min)}₫` : ''}
                {priceRange.max ? ` đến ${new Intl.NumberFormat('vi-VN').format(priceRange.max)}₫` : ''}
              </span>
              <button
                onClick={() => setPriceRange({ min: '', max: '' })}
                className="ml-2 text-amber-600 hover:text-amber-800"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
          
          <button
            onClick={clearAllFilters}
            className="text-amber-600 hover:text-amber-700 text-sm font-medium ml-auto"
          >
            Xóa tất cả
          </button>
        </div>
      )}
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Bộ lọc */}
        <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'} bg-white p-4 rounded-lg shadow-md lg:sticky lg:top-24 lg:h-fit`}>
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <h3 className="text-lg font-semibold">Bộ lọc</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={(category) => {
              setSelectedCategory(category);
              setCurrentPage(1);
            }}
          />
          
          <hr className="my-4" />
          
          <PriceFilter
            priceRange={priceRange}
            setPriceRange={(range) => {
              setPriceRange(range);
              setCurrentPage(1);
            }}
          />
          
          <hr className="my-4" />
          
          <BrandFilter
            brands={brands}
            selectedBrands={selectedBrands}
            setSelectedBrands={(brands) => {
              setSelectedBrands(brands);
              setCurrentPage(1);
            }}
          />
          
          <hr className="my-4" />
          
          <RatingFilter
            selectedRating={selectedRating}
            setSelectedRating={(rating) => {
              setSelectedRating(rating);
              setCurrentPage(1);
            }}
          />
        </div>
        
        {/* Nút hiện bộ lọc trên mobile */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowFilters(true)}
            className="flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Lọc sản phẩm
          </button>
        </div>
        
        {/* Kết quả tìm kiếm */}
        <div className="lg:w-3/4">
          {/* Thanh sắp xếp và điều khiển hiển thị */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-white p-3 rounded-lg shadow-sm">
            <SortOptions
              selectedSort={selectedSort}
              setSelectedSort={(sort) => {
                setSelectedSort(sort);
                setCurrentPage(1);
              }}
            />
            
            <div className="flex items-center mt-3 sm:mt-0">
              <button
                onClick={toggleViewMode}
                className="flex items-center text-gray-700 hover:text-amber-600"
              >
                {viewMode === 'grid' ? (
                  <>
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    <span className="text-sm">Dạng danh sách</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span className="text-sm">Dạng lưới</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Kết quả sản phẩm */}
          <SearchResults
            products={products}
            loading={loading}
            viewMode={viewMode}
            searchQuery={searchQuery}
            totalResults={totalResults}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchPage;