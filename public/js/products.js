/**
 * Products module for Yapee ecommerce website
 * Manages product data, filtering, and rendering
 */

// Dữ liệu sản phẩm từ PostgreSQL
let products = [];

// Lấy dữ liệu sản phẩm từ API khi trang tải xong
async function fetchProducts() {
  try {
    const response = await fetch('http://localhost:3000/api/products');
    const data = await response.json();
    products = data;
    renderProducts();
  } catch (error) {
    console.error('Lỗi lấy dữ liệu sản phẩm:', error);
    showToast('Có lỗi xảy ra khi tải sản phẩm. Vui lòng thử lại sau.', 'error');
  }
}

// Gọi hàm fetchProducts khi module được tải
fetchProducts();

// State
let activeCategory = 'all';
let searchTerm = '';

/**
 * Updates the active category filter and re-renders products.
 * @param {string} category - The category to filter by.
 */
function setActiveCategory(category) {
  activeCategory = category;
  // Clear search term when changing category
  searchTerm = '';
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.value = '';
  }
  renderProducts();
}

/**
 * Updates the search term, sets category to 'all', and re-renders products.
 * Debounced function handled in initProductSearch.
 * @param {string} term - The search term.
 */
function setSearchTerm(term) {
  searchTerm = term.toLowerCase();
  activeCategory = 'all'; // Set category to 'all' for search

  // Update category buttons UI to reflect 'all' is active
  document.querySelectorAll('.category-btn').forEach(btn => {
    if (btn.dataset.category === 'all') {
      btn.classList.remove('bg-white', 'dark:bg-gray-700', 'hover:bg-gray-200', 'dark:hover:bg-gray-600');
      btn.classList.add('bg-red-500', 'text-white');
      btn.setAttribute('aria-pressed', 'true');
    } else {
      btn.classList.remove('bg-red-500', 'text-white');
      btn.classList.add('bg-white', 'dark:bg-gray-700', 'hover:bg-gray-200', 'dark:hover:bg-gray-600');
      btn.setAttribute('aria-pressed', 'false');
    }
  });

  renderProducts(); // This will now use the correct searchTerm and activeCategory
}


/**
 * Filters products based on the active category AND current search term.
 * @returns {Array} Filtered products array
 */
function getFilteredProducts() {
  let filtered = products; // Start with all products

  // Filter by category if not 'all'
  if (activeCategory !== 'all') {
    filtered = filtered.filter(p => p.category === activeCategory);
  }
  
  // Then, filter by search term if present
  if (searchTerm) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(searchTerm)
    );
  }

  return filtered;
}

/**
 * Creates HTML for a single product card
 * @param {Object} product - The product object
 * @returns {string} HTML string for product card
 */
function createProductCardHTML(product) {
  return `
    <article 
      data-product-id="${product.id}" 
      class="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 flex flex-col"
      aria-labelledby="product-title-${product.id}"
    >
      <div class="relative overflow-hidden group">
        <img 
          src="${product.image}" 
          alt="${product.name}"
          loading="lazy"
          class="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button 
            class="add-to-cart-btn bg-white text-red-500 px-4 py-2 rounded-full font-semibold transform transition hover:scale-105"
            aria-label="Thêm ${product.name} vào giỏ hàng"
          >
            Thêm Giỏ Hàng
          </button>
        </div>
      </div>
      <div class="p-4 flex flex-col flex-grow">
        <h4 id="product-title-${product.id}" class="text-lg font-semibold mb-2 flex-grow">${product.name}</h4>
        <div class="flex items-center justify-between mt-auto">
          <div>
            <span class="text-red-500 font-bold text-lg">$${product.salePrice}</span>
            <span class="text-gray-500 line-through ml-2">$${product.price}</span>
          </div>
          <div class="flex" aria-label="Đánh giá ${product.rating} trên 5 sao">
            ${createStarRating(product.rating)}
          </div>
        </div>
      </div>
    </article>
  `;
}

/**
 * Renders skeleton loading state for products
 */
function renderProductSkeletons() {
  const skeletonContainer = document.getElementById('products-skeleton');
  const productsGrid = document.getElementById('products-grid');
  const searchResultsInfo = document.getElementById('searchResultsInfo');

  skeletonContainer.innerHTML = '';
  skeletonContainer.classList.remove('hidden');
  productsGrid.classList.add('hidden');
  searchResultsInfo.classList.add('hidden');

  for (let i = 0; i < 8; i++) {
    skeletonContainer.appendChild(createProductCardSkeleton());
  }
}

/**
 * Renders products based on active category and search term
 */
function renderProducts() {
  renderProductSkeletons();

  const filteredProducts = getFilteredProducts();
  const productsGrid = document.getElementById('products-grid');
  const skeletonContainer = document.getElementById('products-skeleton');
  const searchResultsInfo = document.getElementById('searchResultsInfo');

  setTimeout(() => {
    let productsHTML = '';
    if (filteredProducts.length > 0) {
      filteredProducts.forEach(product => {
        productsHTML += createProductCardHTML(product);
      });
      searchResultsInfo.classList.add('hidden');
    } else {
      productsHTML = ''; 
      const messageBase = "Không tìm thấy sản phẩm nào phù hợp";
      if (searchTerm) {
        searchResultsInfo.textContent = `${messageBase} với tìm kiếm "${searchTerm}".`;
      } else if (activeCategory !== 'all') {
        const categoryElement = document.querySelector(`.category-btn[data-category="${activeCategory}"]`);
        const categoryName = categoryElement ? categoryElement.textContent.trim() : activeCategory;
        searchResultsInfo.textContent = `${messageBase} trong danh mục "${categoryName}".`;
      } else {
         searchResultsInfo.textContent = messageBase + ".";
      }
      searchResultsInfo.classList.remove('hidden');
    }

    productsGrid.innerHTML = productsHTML;
    skeletonContainer.classList.add('hidden');
    productsGrid.classList.remove('hidden');

    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const productElement = this.closest('[data-product-id]');
        if (productElement) {
            const productId = parseInt(productElement.dataset.productId);
            const product = products.find(p => p.id === productId);
            if (product) {
                addToCart(product);
            }
        }
      });
    });
  }, 300); 
}

/**
 * Initialize category filters
 */
function initCategoryFilters() {
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const newCategory = this.dataset.category;
      setActiveCategory(newCategory);
      
      document.querySelectorAll('.category-btn').forEach(el => {
        if (el.dataset.category === newCategory) {
          el.classList.remove('bg-white', 'dark:bg-gray-700', 'hover:bg-gray-200', 'dark:hover:bg-gray-600');
          el.classList.add('bg-red-500', 'text-white');
          el.setAttribute('aria-pressed', 'true');
        } else {
          el.classList.remove('bg-red-500', 'text-white');
          el.classList.add('bg-white', 'dark:bg-gray-700', 'hover:bg-gray-200', 'dark:hover:bg-gray-600');
          el.setAttribute('aria-pressed', 'false');
        }
      });
    });
  });
}

/**
 * Initialize product search functionality
 */
function initProductSearch() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    const debouncedSearch = debounce(setSearchTerm, 400); 
    searchInput.addEventListener('input', function(event) {
      debouncedSearch(event.target.value);
    });
  }
}

/**
 * Quản lý hiển thị danh sách sản phẩm theo danh mục
 * File này xử lý việc hiển thị sản phẩm, lọc theo danh mục và tìm kiếm
 */

// Các danh mục sản phẩm
const CATEGORIES = {
  'all': 'Tất cả sản phẩm',
  'air-purifier': 'Máy lọc không khí',
  'vacuum': 'Robot hút bụi',
  'lighting': 'Đèn thông minh',
  'security': 'Camera an ninh'
};

// DOM Elements
let productsContainer;
let categoryFilters;
let searchInput;
let sortSelect;
let currentPage = 1;
const productsPerPage = 8;
let totalProducts = 0;
let filteredProducts = [];

/**
 * Khởi tạo trang danh sách sản phẩm
 */
document.addEventListener('DOMContentLoaded', () => {
  initElements();
  setupEventListeners();
  loadProducts();
  updateCartCount();
});

/**
 * Khởi tạo các phần tử DOM
 */
function initElements() {
  productsContainer = document.getElementById('products-container');
  categoryFilters = document.getElementById('category-filters');
  searchInput = document.getElementById('search-input');
  sortSelect = document.getElementById('sort-select');
  
  // Tạo bộ lọc danh mục
  createCategoryFilters();
}

/**
 * Tạo các bộ lọc danh mục
 */
function createCategoryFilters() {
  if (!categoryFilters) return;
  
  let html = '';
  
  Object.entries(CATEGORIES).forEach(([key, value]) => {
    html += `
      <button 
        class="category-filter px-4 py-2 rounded-full text-sm font-medium transition-colors" 
        data-category="${key}"
      >
        ${value}
      </button>
    `;
  });
  
  categoryFilters.innerHTML = html;
  
  // Thiết lập trạng thái active cho danh mục đầu tiên
  const firstCategory = categoryFilters.querySelector('.category-filter');
  if (firstCategory) {
    firstCategory.classList.add('bg-primary', 'text-white');
    firstCategory.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
  }
}

/**
 * Thiết lập các sự kiện
 */
function setupEventListeners() {
  // Lọc theo danh mục
  if (categoryFilters) {
    categoryFilters.addEventListener('click', (e) => {
      if (e.target.classList.contains('category-filter')) {
        const category = e.target.dataset.category;
        setActiveCategory(e.target);
        filterProducts(category);
      }
    });
  }
  
  // Tìm kiếm sản phẩm
  if (searchInput) {
    searchInput.addEventListener('input', debounce(() => {
      const searchTerm = searchInput.value.trim().toLowerCase();
      const activeCategory = document.querySelector('.category-filter.bg-primary')?.dataset.category || 'all';
      filterProducts(activeCategory, searchTerm);
    }, 300));
  }
  
  // Sắp xếp sản phẩm
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      const activeCategory = document.querySelector('.category-filter.bg-primary')?.dataset.category || 'all';
      const searchTerm = searchInput?.value.trim().toLowerCase() || '';
      filterProducts(activeCategory, searchTerm);
    });
  }
  
  // Sự kiện thêm vào giỏ hàng
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart')) {
      e.preventDefault();
      const productId = e.target.dataset.id;
      addToCart(productId);
    }
  });
}

/**
 * Đặt trạng thái active cho danh mục được chọn
 */
function setActiveCategory(selectedCategory) {
  // Xóa trạng thái active từ tất cả các danh mục
  document.querySelectorAll('.category-filter').forEach(category => {
    category.classList.remove('bg-primary', 'text-white');
    category.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
  });
  
  // Thêm trạng thái active cho danh mục được chọn
  selectedCategory.classList.add('bg-primary', 'text-white');
  selectedCategory.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
}

/**
 * Tải danh sách sản phẩm từ API
 */
async function loadProducts() {
  try {
    const response = await fetch('http://localhost:3000/api/products');
    if (!response.ok) {
      throw new Error('Không thể tải dữ liệu sản phẩm');
    }
    
    const products = await response.json();
    filteredProducts = products;
    totalProducts = products.length;
    
    // Hiển thị tất cả sản phẩm ban đầu
    displayProducts(products);
  } catch (error) {
    console.error('Lỗi khi tải sản phẩm:', error);
    productsContainer.innerHTML = `
      <div class="col-span-full text-center py-12">
        <p class="text-lg text-gray-600 dark:text-gray-400">
          Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau.
        </p>
      </div>
    `;
  }
}

/**
 * Lọc sản phẩm theo danh mục và từ khóa tìm kiếm
 */
async function filterProducts(category = 'all', searchTerm = '') {
  try {
    // Xây dựng URL API với các tham số lọc
    let apiUrl = '/api/products';
    const params = [];
    
    if (category && category !== 'all') {
      params.push(`category=${encodeURIComponent(category)}`);
    }
    
    if (searchTerm) {
      params.push(`search=${encodeURIComponent(searchTerm)}`);
    }
    
    if (params.length > 0) {
      apiUrl += '?' + params.join('&');
    }
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Không thể tải dữ liệu sản phẩm');
    }
    
    let products = await response.json();
    
    // Sắp xếp sản phẩm nếu có
    if (sortSelect) {
      const sortValue = sortSelect.value;
      products = sortProducts(products, sortValue);
    }
    
    filteredProducts = products;
    totalProducts = products.length;
    currentPage = 1;
    
    displayProducts(products);
  } catch (error) {
    console.error('Lỗi khi lọc sản phẩm:', error);
  }
}

/**
 * Sắp xếp sản phẩm theo tiêu chí
 */
function sortProducts(products, sortBy) {
  switch (sortBy) {
    case 'price-asc':
      return [...products].sort((a, b) => parseFloat(a.saleprice) - parseFloat(b.saleprice));
    case 'price-desc':
      return [...products].sort((a, b) => parseFloat(b.saleprice) - parseFloat(a.saleprice));
    case 'name-asc':
      return [...products].sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return [...products].sort((a, b) => b.name.localeCompare(a.name));
    case 'rating-desc':
      return [...products].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    default:
      return products;
  }
}

/**
 * Hiển thị sản phẩm lên trang
 */
function displayProducts(products) {
  if (!productsContainer) return;
  
  // Tính toán phân trang
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const paginatedProducts = products.slice(startIndex, endIndex);
  
  if (products.length === 0) {
    productsContainer.innerHTML = `
      <div class="col-span-full text-center py-12">
        <p class="text-lg text-gray-600 dark:text-gray-400">
          Không tìm thấy sản phẩm nào phù hợp với tiêu chí tìm kiếm.
        </p>
      </div>
    `;
    return;
  }
  
  let html = '';
  
  paginatedProducts.forEach(product => {
    // Format giá tiền
    const formatter = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    });
    
    const price = formatter.format(product.price);
    const salePrice = formatter.format(product.saleprice);
    
    html += `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
        <a href="product-detail.html?id=${product.id}">
          <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover">
          <div class="p-4">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-2">${product.name}</h3>
            <div class="flex items-center mb-2">
              <div class="flex text-yellow-400">
                ${getStarRating(product.rating)}
              </div>
              <span class="text-gray-600 dark:text-gray-400 text-sm ml-1">(${product.rating})</span>
            </div>
            <div class="flex items-center">
              <span class="text-lg font-bold text-blue-600 dark:text-blue-400">${salePrice}</span>
              <span class="text-sm text-gray-500 dark:text-gray-400 line-through ml-2">${price}</span>
            </div>
            <button 
              class="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 add-to-cart"
              data-id="${product.id}"
            >
              Thêm vào giỏ
            </button>
          </div>
        </a>
      </div>
    `;
  });
  
  productsContainer.innerHTML = html;
  
  // Hiển thị phân trang
  displayPagination(products.length);
}

/**
 * Hiển thị phân trang
 */
function displayPagination(totalItems) {
  const paginationContainer = document.getElementById('pagination');
  if (!paginationContainer) return;
  
  const totalPages = Math.ceil(totalItems / productsPerPage);
  
  if (totalPages <= 1) {
    paginationContainer.innerHTML = '';
    return;
  }
  
  let html = `
    <div class="flex justify-center items-center space-x-2 mt-8">
  `;
  
  // Nút Previous
  html += `
    <button class="pagination-btn ${currentPage === 1 ? 'disabled' : ''}" 
      data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>
      <i class="fas fa-chevron-left"></i>
    </button>
  `;
  
  // Các nút số trang
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 || 
      i === totalPages || 
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      html += `
        <button class="pagination-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">
          ${i}
        </button>
      `;
    } else if (
      i === currentPage - 2 || 
      i === currentPage + 2
    ) {
      html += `<span class="px-2">...</span>`;
    }
  }
  
  // Nút Next
  html += `
    <button class="pagination-btn ${currentPage === totalPages ? 'disabled' : ''}" 
      data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>
      <i class="fas fa-chevron-right"></i>
    </button>
  `;
  
  html += `</div>`;
  
  paginationContainer.innerHTML = html;
  
  // Thêm sự kiện click cho các nút phân trang
  document.querySelectorAll('.pagination-btn').forEach(button => {
    button.addEventListener('click', () => {
      if (button.disabled) return;
      
      currentPage = parseInt(button.dataset.page);
      displayProducts(filteredProducts);
      
      // Cuộn lên đầu danh sách sản phẩm
      productsContainer.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/**
 * Tạo hiển thị đánh giá sao
 */
function getStarRating(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  
  let stars = '';
  
  // Full stars
  for (let i = 0; i < fullStars; i++) {
    stars += '<i class="fas fa-star"></i>';
  }
  
  // Half star
  if (halfStar) {
    stars += '<i class="fas fa-star-half-alt"></i>';
  }
  
  // Empty stars
  for (let i = 0; i < emptyStars; i++) {
    stars += '<i class="far fa-star"></i>';
  }
  
  return stars;
}

/**
 * Thêm sản phẩm vào giỏ hàng
 */
function addToCart(productId) {
  // Tìm sản phẩm theo ID
  const product = filteredProducts.find(p => p.id == productId);
  if (!product) return;
  
  // Lấy giỏ hàng hiện tại từ localStorage
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
  const existingProductIndex = cart.findIndex(item => item.id == productId);
  
  if (existingProductIndex > -1) {
    // Nếu sản phẩm đã có, tăng số lượng
    cart[existingProductIndex].quantity += 1;
  } else {
    // Nếu sản phẩm chưa có, thêm vào giỏ hàng
    cart.push({
      id: product.id,
      name: product.name,
      price: parseFloat(product.saleprice),
      image: product.image,
      quantity: 1
    });
  }
  
  // Lưu giỏ hàng vào localStorage
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Cập nhật số lượng sản phẩm trong giỏ hàng
  updateCartCount();
  
  // Hiển thị thông báo
  showToast('Đã thêm sản phẩm vào giỏ hàng!');
}

/**
 * Cập nhật số lượng sản phẩm trong giỏ hàng
 */
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  
  const cartCountElements = document.querySelectorAll('#cart-count, #cart-count-badge');
  cartCountElements.forEach(element => {
    element.textContent = totalItems;
    
    if (element.id === 'cart-count-badge') {
      element.style.display = totalItems > 0 ? 'flex' : 'none';
    }
  });
}

/**
 * Hiển thị thông báo toast
 */
function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  
  toast.textContent = message;
  toast.style.visibility = 'visible';
  toast.classList.remove('opacity-0', 'translate-y-full');
  toast.classList.add('opacity-100', 'translate-y-0');
  
  setTimeout(() => {
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', 'translate-y-full');
    
    setTimeout(() => {
      toast.style.visibility = 'hidden';
    }, 500);
  }, duration);
}

/**
 * Hàm debounce để giảm số lần gọi hàm
 */
function debounce(func, delay) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
}









