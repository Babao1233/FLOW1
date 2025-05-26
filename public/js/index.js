/**
 * Quản lý hiển thị trang chủ
 * File này xử lý việc hiển thị sản phẩm, đánh giá khách hàng và các chức năng khác trên trang chủ
 */

document.addEventListener('DOMContentLoaded', () => {
  // Khởi tạo trang chủ
  initPage();
});

/**
 * Khởi tạo trang chủ
 */
function initPage() {
  // Hiển thị sản phẩm
  renderProducts();
  
  // Hiển thị đánh giá khách hàng
  renderTestimonials();
  
  // Thiết lập các sự kiện
  setupEventListeners();
  
  // Cập nhật số lượng sản phẩm trong giỏ hàng
  updateCartCount();
}

/**
 * Thiết lập các sự kiện
 */
function setupEventListeners() {
  // Sự kiện lọc theo danh mục
  const categoryButtons = document.querySelectorAll('.category-btn');
  if (categoryButtons) {
    categoryButtons.forEach(button => {
      button.addEventListener('click', () => {
        const category = button.dataset.category;
        
        // Cập nhật trạng thái active cho nút danh mục
        categoryButtons.forEach(btn => {
          btn.classList.remove('bg-primary', 'text-white');
          btn.classList.add('bg-white', 'dark:bg-gray-700', 'hover:bg-gray-200', 'dark:hover:bg-gray-600', 'text-gray-800', 'dark:text-gray-200');
        });
        
        button.classList.add('bg-primary', 'text-white');
        button.classList.remove('bg-white', 'dark:bg-gray-700', 'hover:bg-gray-200', 'dark:hover:bg-gray-600', 'text-gray-800', 'dark:text-gray-200');
        
        // Lọc và hiển thị sản phẩm
        filterProducts(category);
      });
    });
  }
  
  // Sự kiện chuyển đổi đánh giá khách hàng
  const prevButton = document.getElementById('prevTestimonial');
  const nextButton = document.getElementById('nextTestimonial');
  
  if (prevButton && nextButton) {
    prevButton.addEventListener('click', () => {
      navigateTestimonial('prev');
    });
    
    nextButton.addEventListener('click', () => {
      navigateTestimonial('next');
    });
  }
}

/**
 * Hiển thị sản phẩm
 */
function renderProducts() {
  const productGrid = document.getElementById('product-grid');
  if (!productGrid) return;
  
  // Xóa nội dung hiện tại
  productGrid.innerHTML = '';
  
  // Hiển thị sản phẩm từ API
  fetchProducts()
    .then(products => {
      // Hiển thị sản phẩm
      products.forEach(product => {
        const productElement = createProductElement(product);
        productGrid.appendChild(productElement);
      });
    })
    .catch(error => {
      console.error('Lỗi khi tải sản phẩm:', error);
      
      // Hiển thị sản phẩm từ dữ liệu mẫu nếu API không hoạt động
      if (window.products) {
        window.products.forEach(product => {
          const productElement = createProductElement(product);
          productGrid.appendChild(productElement);
        });
      }
    });
}

/**
 * Tạo phần tử sản phẩm
 */
function createProductElement(product) {
  // Format giá tiền
  const formatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  });
  
  const price = formatter.format(product.price);
  const salePrice = formatter.format(product.salePrice);
  
  // Tạo phần tử sản phẩm
  const element = document.createElement('div');
  element.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1';
  
  // Sử dụng trực tiếp URL hình ảnh từ API
  const imageUrl = product.image || 'https://via.placeholder.com/300x300?text=No+Image';
  
  element.innerHTML = `
    <a href="product-detail.html?id=${product.id}">
      <img src="${imageUrl}" alt="${product.name}" class="w-full h-48 object-cover">
      <div class="p-4">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-2">${product.name}</h3>
        <div class="flex items-center mb-2">
          <div class="flex text-yellow-400">
            ${getStarRating(product.rating)}
          </div>
          <span class="text-gray-600 dark:text-gray-400 text-sm ml-1">(${product.rating})</span>
        </div>
        <div class="flex items-center">
          <span class="text-lg font-bold text-red-500">${salePrice}</span>
          <span class="text-sm text-gray-500 dark:text-gray-400 line-through ml-2">${price}</span>
        </div>
      </div>
    </a>
    <div class="px-4 pb-4">
      <button 
        class="w-full bg-primary hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition duration-300 add-to-cart"
        data-id="${product.id}"
      >
        Thêm vào giỏ
      </button>
    </div>
  `;
  
  // Thêm sự kiện thêm vào giỏ hàng
  const addToCartButton = element.querySelector('.add-to-cart');
  if (addToCartButton) {
    addToCartButton.addEventListener('click', (e) => {
      e.preventDefault();
      addToCart(product);
    });
  }
  
  return element;
}

/**
 * Lọc sản phẩm theo danh mục
 */
function filterProducts(category) {
  const productGrid = document.getElementById('product-grid');
  if (!productGrid) return;
  
  // Xóa nội dung hiện tại
  productGrid.innerHTML = '';
  
  // Hiển thị sản phẩm từ API
  fetchProducts(category)
    .then(products => {
      // Hiển thị sản phẩm
      products.forEach(product => {
        const productElement = createProductElement(product);
        productGrid.appendChild(productElement);
      });
    })
    .catch(error => {
      console.error('Lỗi khi lọc sản phẩm:', error);
      
      // Lọc sản phẩm từ dữ liệu mẫu nếu API không hoạt động
      if (window.products) {
        const filteredProducts = category === 'all' 
          ? window.products 
          : window.products.filter(p => p.category === category);
        
        filteredProducts.forEach(product => {
          const productElement = createProductElement(product);
          productGrid.appendChild(productElement);
        });
      }
    });
}

/**
 * Lấy dữ liệu sản phẩm từ API
 */
async function fetchProducts(category = null) {
  let url = 'http://localhost:3000/api/products';
  
  if (category && category !== 'all') {
    url += `?category=${category}`;
  }
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Không thể tải dữ liệu sản phẩm');
  }
  
  return await response.json();
}

/**
 * Hiển thị đánh giá khách hàng
 */
function renderTestimonials() {
  const testimonialSlider = document.getElementById('testimonial-slider');
  const testimonialDots = document.getElementById('testimonial-dots');
  
  if (!testimonialSlider || !testimonialDots) return;
  
  // Xóa nội dung hiện tại
  testimonialSlider.innerHTML = '';
  testimonialDots.innerHTML = '';
  
  // Hiển thị đánh giá từ dữ liệu mẫu
  if (window.testimonials) {
    window.testimonials.forEach((testimonial, index) => {
      // Tạo phần tử đánh giá
      const element = document.createElement('div');
      element.className = 'testimonial-slide w-full flex-shrink-0 p-6 bg-white dark:bg-gray-700 rounded-xl shadow-sm';
      
      element.innerHTML = `
        <div class="flex items-center mb-4">
          <img src="${testimonial.avatar}" alt="${testimonial.name}" class="w-12 h-12 rounded-full mr-4">
          <div>
            <h4 class="font-semibold text-gray-800 dark:text-white">${testimonial.name}</h4>
            <div class="flex text-yellow-400 mt-1">
              ${getStarRating(testimonial.rating)}
            </div>
          </div>
        </div>
        <p class="text-gray-600 dark:text-gray-300 italic">"${testimonial.text}"</p>
      `;
      
      testimonialSlider.appendChild(element);
      
      // Tạo điểm chỉ báo
      const dot = document.createElement('button');
      dot.className = `testimonial-dot w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 ${index === 0 ? 'bg-primary dark:bg-primary' : ''}`;
      dot.setAttribute('aria-label', `Đánh giá của ${testimonial.name}`);
      dot.dataset.index = index;
      
      dot.addEventListener('click', () => {
        goToTestimonial(index);
      });
      
      testimonialDots.appendChild(dot);
    });
  }
}

/**
 * Chuyển đổi đánh giá khách hàng
 */
function navigateTestimonial(direction) {
  const testimonialSlider = document.getElementById('testimonial-slider');
  const dots = document.querySelectorAll('.testimonial-dot');
  
  if (!testimonialSlider || dots.length === 0) return;
  
  // Tìm điểm chỉ báo đang active
  const activeIndex = Array.from(dots).findIndex(dot => dot.classList.contains('bg-primary'));
  let newIndex = activeIndex;
  
  if (direction === 'prev') {
    newIndex = activeIndex > 0 ? activeIndex - 1 : dots.length - 1;
  } else {
    newIndex = activeIndex < dots.length - 1 ? activeIndex + 1 : 0;
  }
  
  goToTestimonial(newIndex);
}

/**
 * Chuyển đến đánh giá khách hàng theo chỉ số
 */
function goToTestimonial(index) {
  const testimonialSlider = document.getElementById('testimonial-slider');
  const dots = document.querySelectorAll('.testimonial-dot');
  
  if (!testimonialSlider || dots.length === 0) return;
  
  // Cập nhật vị trí slider
  testimonialSlider.style.transform = `translateX(-${index * 100}%)`;
  
  // Cập nhật trạng thái active cho điểm chỉ báo
  dots.forEach((dot, i) => {
    if (i === index) {
      dot.classList.add('bg-primary', 'dark:bg-primary');
      dot.classList.remove('bg-gray-300', 'dark:bg-gray-600');
    } else {
      dot.classList.remove('bg-primary', 'dark:bg-primary');
      dot.classList.add('bg-gray-300', 'dark:bg-gray-600');
    }
  });
}

/**
 * Thêm sản phẩm vào giỏ hàng
 */
function addToCart(product) {
  // Lấy giỏ hàng hiện tại từ localStorage
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
  const existingProductIndex = cart.findIndex(item => item.id == product.id);
  
  if (existingProductIndex > -1) {
    // Nếu sản phẩm đã có, tăng số lượng
    cart[existingProductIndex].quantity += 1;
  } else {
    // Nếu sản phẩm chưa có, thêm vào giỏ hàng
    cart.push({
      id: product.id,
      name: product.name,
      price: parseFloat(product.salePrice),
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