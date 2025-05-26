/**
 * Quản lý hiển thị chi tiết sản phẩm
 * File này xử lý việc hiển thị thông tin chi tiết sản phẩm, thêm vào giỏ hàng và các sản phẩm liên quan
 */

// DOM Elements
let productId;
let productData;
let quantityInput;
let mainProductImage;
let thumbnailContainer;
let productName;
let productRatingContainer;
let productRatingValue;
let productSalePrice;
let productOriginalPrice;
let productDescription;
let addToCartButton;
let relatedProductsContainer;

/**
 * Khởi tạo trang chi tiết sản phẩm
 */
document.addEventListener('DOMContentLoaded', () => {
  // Lấy ID sản phẩm từ URL
  const urlParams = new URLSearchParams(window.location.search);
  productId = urlParams.get('id');
  
  if (!productId) {
    // Nếu không có ID sản phẩm, chuyển hướng về trang sản phẩm
    window.location.href = 'index.html#products';
    return;
  }
  
  // Khởi tạo các phần tử DOM
  initElements();
  
  // Thiết lập các sự kiện
  setupEventListeners();
  
  // Tải thông tin sản phẩm
  loadProductDetails();
  
  // Cập nhật số lượng sản phẩm trong giỏ hàng
  updateCartCount();
});

/**
 * Khởi tạo các phần tử DOM
 */
function initElements() {
  quantityInput = document.getElementById('quantityInput');
  mainProductImage = document.getElementById('mainProductImage');
  thumbnailContainer = document.getElementById('thumbnailContainer');
  productName = document.getElementById('productName');
  productRatingContainer = document.getElementById('productRatingContainer');
  productRatingValue = document.getElementById('productRatingValue');
  productSalePrice = document.getElementById('productSalePrice');
  productOriginalPrice = document.getElementById('productOriginalPrice');
  productDescription = document.getElementById('productDescription');
  addToCartButton = document.getElementById('addToCartButton');
  relatedProductsContainer = document.getElementById('relatedProductsStore');
  
  // Thiết lập giá trị mặc định cho số lượng
  if (quantityInput) {
    quantityInput.value = 1;
  }
}

/**
 * Thiết lập các sự kiện
 */
function setupEventListeners() {
  // Sự kiện tăng giảm số lượng
  const decreaseBtn = document.getElementById('decreaseQuantity');
  const increaseBtn = document.getElementById('increaseQuantity');
  
  if (decreaseBtn && increaseBtn && quantityInput) {
    decreaseBtn.addEventListener('click', () => {
      const currentValue = parseInt(quantityInput.value);
      if (currentValue > 1) {
        quantityInput.value = currentValue - 1;
      }
    });
    
    increaseBtn.addEventListener('click', () => {
      const currentValue = parseInt(quantityInput.value);
      quantityInput.value = currentValue + 1;
    });
    
    // Đảm bảo giá trị nhập vào là số nguyên dương
    quantityInput.addEventListener('change', () => {
      let value = parseInt(quantityInput.value);
      if (isNaN(value) || value < 1) {
        value = 1;
      }
      quantityInput.value = value;
    });
  }
  
  // Sự kiện thêm vào giỏ hàng
  if (addToCartButton) {
    addToCartButton.addEventListener('click', () => {
      if (productData) {
        addToCart(productData, parseInt(quantityInput.value));
            }
        });
    }

  // Sự kiện chuyển đổi chế độ tối/sáng
  const darkModeToggle = document.getElementById('darkModeToggle');
  const lightModeIcon = document.getElementById('lightModeIcon');
  const darkModeIcon = document.getElementById('darkModeIcon');
  
  if (darkModeToggle && lightModeIcon && darkModeIcon) {
    // Kiểm tra trạng thái chế độ tối/sáng từ localStorage
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    // Cập nhật giao diện dựa trên trạng thái hiện tại
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      lightModeIcon.classList.remove('hidden');
      darkModeIcon.classList.add('hidden');
    } else {
      document.documentElement.classList.remove('dark');
      lightModeIcon.classList.add('hidden');
      darkModeIcon.classList.remove('hidden');
    }
    
    // Sự kiện chuyển đổi chế độ tối/sáng
    darkModeToggle.addEventListener('click', () => {
      const isDarkMode = document.documentElement.classList.toggle('dark');
      localStorage.setItem('darkMode', isDarkMode);
      
      // Cập nhật biểu tượng
      if (isDarkMode) {
        lightModeIcon.classList.remove('hidden');
        darkModeIcon.classList.add('hidden');
      } else {
        lightModeIcon.classList.add('hidden');
        darkModeIcon.classList.remove('hidden');
      }
    });
  }
  
  // Sự kiện tìm kiếm
  const searchInput = document.getElementById('searchInputHeader');
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
          window.location.href = `search-results.html?q=${encodeURIComponent(searchTerm)}`;
        }
      }
    });
  }
}

/**
 * Tải thông tin chi tiết sản phẩm
 */
async function loadProductDetails() {
  try {
    const response = await fetch(`/api/products/${productId}`);
    if (!response.ok) {
      throw new Error('Không thể tải thông tin sản phẩm');
    }
    
    productData = await response.json();
    
    // Hiển thị thông tin sản phẩm
    displayProductDetails(productData);
    
    // Tải các sản phẩm liên quan
    loadRelatedProducts(productData.category);
    
  } catch (error) {
    console.error('Lỗi khi tải thông tin sản phẩm:', error);
    
    // Thử tải từ dữ liệu mẫu nếu API không hoạt động
    loadSampleProductData();
  }
}

/**
 * Tải dữ liệu sản phẩm mẫu nếu API không hoạt động
 */
async function loadSampleProductData() {
  try {
    // Tải tất cả sản phẩm
    const response = await fetch('http://localhost:3000/api/products');
    if (!response.ok) {
      throw new Error('Không thể tải dữ liệu sản phẩm');
    }
    
    const products = await response.json();
    
    // Tìm sản phẩm theo ID
    productData = products.find(product => product.id == productId);
    
    if (productData) {
      // Hiển thị thông tin sản phẩm
      displayProductDetails(productData);
      
      // Tải các sản phẩm liên quan
      const relatedProducts = products.filter(product => 
        product.category === productData.category && product.id != productId
      ).slice(0, 4);
      
      displayRelatedProducts(relatedProducts);
    } else {
      showError('Không tìm thấy sản phẩm');
    }
    
  } catch (error) {
    console.error('Lỗi khi tải dữ liệu sản phẩm mẫu:', error);
    showError('Không thể tải thông tin sản phẩm');
  }
}

/**
 * Hiển thị thông tin chi tiết sản phẩm
 */
function displayProductDetails(product) {
  // Cập nhật tiêu đề trang
  document.title = `${product.name} - Yapee`;
  
  // Sử dụng trực tiếp URL hình ảnh từ API
  const imageUrl = product.image || 'https://via.placeholder.com/300x300?text=No+Image';
  
  // Cập nhật hình ảnh sản phẩm
  if (mainProductImage) {
    mainProductImage.src = imageUrl;
    mainProductImage.alt = product.name;
    
    // Hiển thị hình ảnh khi đã tải xong
    mainProductImage.onload = () => {
      mainProductImage.classList.remove('opacity-0');
    };
  }
  
  // Tạo các hình ảnh thumbnail
  if (thumbnailContainer) {
    // Tạo danh sách hình ảnh thumbnail (chỉ sử dụng ảnh gốc)
    const thumbnailImages = [
      imageUrl,
      imageUrl, // Sử dụng ảnh gốc
      imageUrl, // Sử dụng ảnh gốc
      imageUrl  // Sử dụng ảnh gốc
    ];
    
    let thumbnailsHtml = '';
    thumbnailImages.forEach((img, index) => {
      thumbnailsHtml += `
        <div class="cursor-pointer thumbnail ${index === 0 ? 'border-primary' : 'border-transparent'} border-2 rounded-md overflow-hidden">
          <img src="${img}" alt="Thumbnail ${index + 1}" class="w-full h-full object-cover">
        </div>
      `;
    });
    
    thumbnailContainer.innerHTML = thumbnailsHtml;
    
    // Thêm sự kiện click cho các thumbnail
    const thumbnails = thumbnailContainer.querySelectorAll('.thumbnail');
    thumbnails.forEach((thumbnail, index) => {
      thumbnail.addEventListener('click', () => {
        // Cập nhật hình ảnh chính
        mainProductImage.src = thumbnailImages[index];
        
        // Cập nhật trạng thái active cho thumbnail
        thumbnails.forEach(t => t.classList.replace('border-primary', 'border-transparent'));
        thumbnail.classList.replace('border-transparent', 'border-primary');
      });
    });
  }
  
  // Cập nhật tên sản phẩm
  if (productName) {
    productName.textContent = product.name;
  }
  
  // Cập nhật đánh giá sản phẩm
  if (productRatingContainer && productRatingValue) {
    productRatingContainer.innerHTML = getStarRating(product.rating);
    productRatingValue.textContent = `${product.rating}/5`;
  }
  
  // Cập nhật giá sản phẩm
  if (productSalePrice && productOriginalPrice) {
    const formatter = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    });
    
    productSalePrice.textContent = formatter.format(product.saleprice);
    productOriginalPrice.textContent = formatter.format(product.price);
  }
  
  // Cập nhật mô tả sản phẩm
  if (productDescription) {
    // Tạo mô tả chi tiết sản phẩm
    const description = `
      <h2 class="text-xl font-semibold mb-3">Mô tả sản phẩm</h2>
      <p class="mb-4">${product.name} là sản phẩm cao cấp từ Yapee, được thiết kế để mang lại trải nghiệm tốt nhất cho người dùng.</p>
      
      <h3 class="text-lg font-semibold mb-2">Đặc điểm nổi bật</h3>
      <ul class="list-disc pl-5 mb-4 space-y-1">
        <li>Thiết kế hiện đại, sang trọng</li>
        <li>Công nghệ tiên tiến, tiết kiệm năng lượng</li>
        <li>Vận hành êm ái, bền bỉ</li>
        <li>Dễ dàng sử dụng và bảo trì</li>
        <li>Kết nối thông minh với ứng dụng di động</li>
      </ul>
      
      <h3 class="text-lg font-semibold mb-2">Thông số kỹ thuật</h3>
      <table class="w-full mb-4 border-collapse">
        <tr class="border-b border-gray-200 dark:border-gray-700">
          <td class="py-2 font-medium">Thương hiệu</td>
          <td class="py-2">Yapee</td>
        </tr>
        <tr class="border-b border-gray-200 dark:border-gray-700">
          <td class="py-2 font-medium">Model</td>
          <td class="py-2">${product.name.split(' ').pop()}</td>
        </tr>
        <tr class="border-b border-gray-200 dark:border-gray-700">
          <td class="py-2 font-medium">Xuất xứ</td>
          <td class="py-2">Việt Nam</td>
        </tr>
        <tr class="border-b border-gray-200 dark:border-gray-700">
          <td class="py-2 font-medium">Bảo hành</td>
          <td class="py-2">24 tháng</td>
        </tr>
      </table>
      
      <h3 class="text-lg font-semibold mb-2">Hướng dẫn sử dụng</h3>
      <p>Chi tiết hướng dẫn sử dụng được đính kèm trong hộp sản phẩm. Quý khách vui lòng đọc kỹ hướng dẫn trước khi sử dụng để đảm bảo an toàn và hiệu quả.</p>
    `;
    
    productDescription.innerHTML = description;
  }
}

/**
 * Tải các sản phẩm liên quan
 */
async function loadRelatedProducts(category) {
  try {
    const response = await fetch(`/api/products?category=${encodeURIComponent(category)}`);
    if (!response.ok) {
      throw new Error('Không thể tải sản phẩm liên quan');
    }
    
    const products = await response.json();
    
    // Lọc bỏ sản phẩm hiện tại và giới hạn số lượng
    const relatedProducts = products
      .filter(product => product.id != productId)
      .slice(0, 4);
    
    displayRelatedProducts(relatedProducts);
    
  } catch (error) {
    console.error('Lỗi khi tải sản phẩm liên quan:', error);
    
    // Ẩn phần sản phẩm liên quan nếu không có dữ liệu
    const relatedSection = document.getElementById('relatedProductsSection');
    if (relatedSection) {
      relatedSection.style.display = 'none';
    }
  }
}

/**
 * Hiển thị các sản phẩm liên quan
 */
function displayRelatedProducts(products) {
  if (!relatedProductsContainer || products.length === 0) {
    // Ẩn phần sản phẩm liên quan nếu không có dữ liệu
    const relatedSection = document.getElementById('relatedProductsSection');
    if (relatedSection) {
      relatedSection.style.display = 'none';
    }
            return;
        }

  let html = '';
  
  products.forEach(product => {
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
          <img src="${product.image}" alt="${product.name}" class="w-full h-40 object-cover">
          <div class="p-4">
            <h3 class="text-base font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2">${product.name}</h3>
                        <div class="flex items-center mb-2">
              <div class="flex text-yellow-400 text-sm">
                ${getStarRating(product.rating)}
                        </div>
              <span class="text-gray-600 dark:text-gray-400 text-xs ml-1">(${product.rating})</span>
                            </div>
            <div class="flex items-center">
              <span class="text-base font-bold text-red-500">${salePrice}</span>
              <span class="text-xs text-gray-500 dark:text-gray-400 line-through ml-2">${price}</span>
                        </div>
                    </div>
        </a>
                </div>
            `;
  });
  
  relatedProductsContainer.innerHTML = html;
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
function addToCart(product, quantity = 1) {
  // Lấy giỏ hàng hiện tại từ localStorage
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
  const existingProductIndex = cart.findIndex(item => item.id == product.id);
  
  if (existingProductIndex > -1) {
    // Nếu sản phẩm đã có, tăng số lượng
    cart[existingProductIndex].quantity += quantity;
  } else {
    // Nếu sản phẩm chưa có, thêm vào giỏ hàng
    cart.push({
      id: product.id,
      name: product.name,
      price: parseFloat(product.saleprice),
      image: product.image,
      quantity: quantity
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
  
  const cartCountElement = document.getElementById('cartCount');
  if (cartCountElement) {
    cartCountElement.textContent = totalItems;
  }
}

/**
 * Hiển thị thông báo toast
 */
function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  
  toast.textContent = message;
  toast.classList.remove('opacity-0');
  toast.classList.add('opacity-100');
  
  setTimeout(() => {
    toast.classList.remove('opacity-100');
    toast.classList.add('opacity-0');
  }, duration);
}

/**
 * Hiển thị thông báo lỗi
 */
function showError(message) {
  const productInfoElement = document.getElementById('productInfo');
  if (productInfoElement) {
    productInfoElement.innerHTML = `
      <div class="text-center py-12">
        <svg class="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h1 class="text-2xl font-bold text-gray-700 dark:text-gray-300 mt-4">${message}</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-2">Vui lòng thử lại sau hoặc quay lại trang chủ.</p>
        <a href="index.html" class="mt-6 inline-block bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
          Quay lại trang chủ
        </a>
      </div>
    `;
    
    // Ẩn các phần khác
    const imageGallery = document.getElementById('productImageGallery');
    const relatedSection = document.getElementById('relatedProductsSection');
    
    if (imageGallery) imageGallery.style.display = 'none';
    if (relatedSection) relatedSection.style.display = 'none';
  }
}

// Cập nhật năm hiện tại cho footer
document.addEventListener('DOMContentLoaded', () => {
  const currentYearElement = document.getElementById('currentYearFooter');
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
  }
});







