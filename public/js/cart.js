/**
 * Quản lý giỏ hàng
 * File này xử lý việc hiển thị, cập nhật và xóa sản phẩm trong giỏ hàng
 */

// DOM Elements
let cartItemsContainer;
let cartSubtotal;
let cartTotal;
let emptyCartMessage;
let cartSummary;
let proceedToCheckoutBtn;

// Biến lưu trữ dữ liệu giỏ hàng
let cartItems = [];

/**
 * Khởi tạo trang giỏ hàng
 */
document.addEventListener('DOMContentLoaded', () => {
  // Khởi tạo các phần tử DOM
  initElements();
  
  // Tải dữ liệu giỏ hàng từ localStorage
  loadCartData();
  
  // Thiết lập các sự kiện
  setupEventListeners();
  
  // Cập nhật số lượng sản phẩm trong giỏ hàng
  updateCartCount();
  
  // Hiển thị giỏ hàng
  renderCart();
});

/**
 * Khởi tạo các phần tử DOM
 */
function initElements() {
  cartItemsContainer = document.getElementById('cartItemsContainer');
  cartSubtotal = document.getElementById('cartSubtotal');
  cartTotal = document.getElementById('cartTotal');
  emptyCartMessage = document.getElementById('emptyCartMessage');
  cartSummary = document.getElementById('cartSummary');
  proceedToCheckoutBtn = document.getElementById('proceedToCheckoutBtn');
  
  // Khởi tạo chế độ tối/sáng
  initDarkMode();
}

/**
 * Khởi tạo chế độ tối/sáng
 */
function initDarkMode() {
  const darkModeToggle = document.getElementById('globalDarkModeToggle');
  if (!darkModeToggle) return;
  
  // Kiểm tra trạng thái chế độ tối/sáng từ localStorage
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  
  // Cập nhật giao diện dựa trên trạng thái hiện tại
  if (isDarkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  // Cập nhật biểu tượng
  updateDarkModeIcon(isDarkMode);
  
  // Sự kiện chuyển đổi chế độ tối/sáng
  darkModeToggle.addEventListener('click', () => {
    const isDarkMode = document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', isDarkMode);
    
    // Cập nhật biểu tượng
    updateDarkModeIcon(isDarkMode);
  });
}

/**
 * Cập nhật biểu tượng chế độ tối/sáng
 */
function updateDarkModeIcon(isDarkMode) {
  const darkModeToggle = document.getElementById('globalDarkModeToggle');
  if (!darkModeToggle) return;
  
  // Xóa nội dung hiện tại
  darkModeToggle.innerHTML = '';
  
  // Thêm biểu tượng mới
  if (isDarkMode) {
    darkModeToggle.innerHTML = `
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fill-rule="evenodd" clip-rule="evenodd" />
      </svg>
    `;
  } else {
    darkModeToggle.innerHTML = `
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
      </svg>
    `;
  }
}

/**
 * Thiết lập các sự kiện
 */
function setupEventListeners() {
  // Sự kiện cho nút menu di động
  const mobileMenuButton = document.getElementById('mobileMenuButton');
  const mobileMenu = document.getElementById('mobileMenu');
  
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
      mobileMenuButton.setAttribute('aria-expanded', !isExpanded);
    });
  }
  
  // Sự kiện xóa sản phẩm khỏi giỏ hàng
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-item') || e.target.closest('.remove-item')) {
      const button = e.target.classList.contains('remove-item') ? e.target : e.target.closest('.remove-item');
      const productId = button.dataset.id;
      removeFromCart(productId);
    }
  });
  
  // Sự kiện cập nhật số lượng sản phẩm
  document.addEventListener('change', (e) => {
    if (e.target.classList.contains('quantity-input')) {
      const productId = e.target.dataset.id;
      const quantity = parseInt(e.target.value);
      updateQuantity(productId, quantity);
    }
  });
}

/**
 * Tải dữ liệu giỏ hàng từ localStorage
 */
function loadCartData() {
  cartItems = JSON.parse(localStorage.getItem('cart')) || [];
}

/**
 * Hiển thị giỏ hàng
 */
function renderCart() {
  if (!cartItemsContainer) return;
  
  // Kiểm tra giỏ hàng trống
  if (cartItems.length === 0) {
    showEmptyCart();
    return;
  }

  // Hiển thị các sản phẩm trong giỏ hàng
  let html = '';
  
  cartItems.forEach(item => {
    const itemTotal = item.price * item.quantity;
    
    // Format giá tiền
    const formatter = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    });
    
    const formattedPrice = formatter.format(item.price);
    const formattedTotal = formatter.format(itemTotal);
    
    // Sử dụng trực tiếp URL hình ảnh từ API
    const imageUrl = item.image || 'https://via.placeholder.com/300x300?text=No+Image';
    
    html += `
      <div class="flex flex-col sm:flex-row items-center border-b border-gray-200 dark:border-gray-700 py-4 last:border-b-0 gap-4">
        <div class="w-full sm:w-auto flex items-center">
          <img src="${imageUrl}" alt="${item.name}" class="w-20 h-20 object-cover rounded-md mr-4">
          <div class="flex-grow">
            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200">${item.name}</h3>
            <p class="text-red-500 font-bold mt-1">${formattedPrice}</p>
          </div>
        </div>
        
        <div class="flex items-center justify-between w-full sm:w-auto sm:ml-auto gap-4">
          <div class="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
            <button 
              class="decrease-quantity px-3 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" 
              aria-label="Giảm số lượng"
              data-id="${item.id}"
            >
              <i class="fas fa-minus text-sm"></i>
                  </button>
            
            <input 
              type="number" 
              value="${item.quantity}" 
              min="1" 
              class="quantity-input w-12 text-center border-none focus:ring-0 bg-transparent dark:text-white"
              aria-label="Số lượng sản phẩm"
              data-id="${item.id}"
            >
            
            <button 
              class="increase-quantity px-3 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" 
              aria-label="Tăng số lượng"
              data-id="${item.id}"
            >
              <i class="fas fa-plus text-sm"></i>
                  </button>
                </div>
          
          <div class="text-right">
            <p class="font-semibold text-gray-700 dark:text-gray-200">${formattedTotal}</p>
              </div>
          
          <button 
            class="remove-item text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors" 
            aria-label="Xóa sản phẩm"
            data-id="${item.id}"
          >
            <i class="fas fa-trash"></i>
                </button>
              </div>
      </div>
    `;
  });
  
  cartItemsContainer.innerHTML = html;
  
  // Thêm sự kiện tăng/giảm số lượng
  document.querySelectorAll('.decrease-quantity').forEach(button => {
    button.addEventListener('click', () => {
      const productId = button.dataset.id;
      const input = document.querySelector(`.quantity-input[data-id="${productId}"]`);
      const currentValue = parseInt(input.value);
      if (currentValue > 1) {
        input.value = currentValue - 1;
        updateQuantity(productId, currentValue - 1);
      }
    });
  });
  
  document.querySelectorAll('.increase-quantity').forEach(button => {
    button.addEventListener('click', () => {
      const productId = button.dataset.id;
      const input = document.querySelector(`.quantity-input[data-id="${productId}"]`);
      const currentValue = parseInt(input.value);
      input.value = currentValue + 1;
      updateQuantity(productId, currentValue + 1);
    });
  });
  
  // Ẩn thông báo giỏ hàng trống
  if (emptyCartMessage) {
    emptyCartMessage.style.display = 'none';
  }
  
  // Hiển thị tóm tắt giỏ hàng
  if (cartSummary) {
    cartSummary.style.display = 'block';
  }
  
  // Cập nhật tổng tiền
  updateCartTotal();
}

/**
 * Hiển thị giỏ hàng trống
 */
function showEmptyCart() {
  // Hiển thị thông báo giỏ hàng trống
  if (emptyCartMessage) {
    emptyCartMessage.style.display = 'block';
  }
  
  // Xóa các sản phẩm trong giỏ hàng
  cartItemsContainer.innerHTML = '';
  
  // Ẩn tóm tắt giỏ hàng
  if (cartSummary) {
    cartSummary.style.display = 'none';
  }
  
  // Vô hiệu hóa nút thanh toán
  if (proceedToCheckoutBtn) {
    proceedToCheckoutBtn.classList.add('opacity-50', 'cursor-not-allowed');
    proceedToCheckoutBtn.setAttribute('disabled', 'disabled');
  }
}

/**
 * Cập nhật tổng tiền giỏ hàng
 */
function updateCartTotal() {
  if (!cartSubtotal || !cartTotal) return;
  
  // Tính tổng tiền
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Format giá tiền
  const formatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  });
  
  const formattedSubtotal = formatter.format(subtotal);
  const formattedTotal = formatter.format(subtotal); // Chưa tính phí vận chuyển
  
  // Cập nhật hiển thị
  cartSubtotal.textContent = formattedSubtotal;
  cartTotal.textContent = formattedTotal;
  
  // Cập nhật trạng thái nút thanh toán
  if (proceedToCheckoutBtn) {
    if (cartItems.length === 0) {
      proceedToCheckoutBtn.classList.add('opacity-50', 'cursor-not-allowed');
      proceedToCheckoutBtn.setAttribute('disabled', 'disabled');
        } else {
      proceedToCheckoutBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      proceedToCheckoutBtn.removeAttribute('disabled');
    }
  }
}

/**
 * Cập nhật số lượng sản phẩm trong giỏ hàng
 */
function updateQuantity(productId, quantity) {
  // Đảm bảo số lượng là số nguyên dương
  quantity = Math.max(1, parseInt(quantity) || 1);
  
  // Tìm sản phẩm trong giỏ hàng
  const productIndex = cartItems.findIndex(item => item.id == productId);
  
  if (productIndex > -1) {
    // Cập nhật số lượng
    cartItems[productIndex].quantity = quantity;
    
    // Lưu giỏ hàng vào localStorage
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    // Cập nhật hiển thị
    updateCartCount();
    updateCartTotal();
  }
}

/**
 * Xóa sản phẩm khỏi giỏ hàng
 */
function removeFromCart(productId) {
  // Lọc bỏ sản phẩm khỏi giỏ hàng
  cartItems = cartItems.filter(item => item.id != productId);
  
  // Lưu giỏ hàng vào localStorage
  localStorage.setItem('cart', JSON.stringify(cartItems));
  
  // Cập nhật hiển thị
  updateCartCount();
  renderCart();
  
  // Hiển thị thông báo
  showToast('Đã xóa sản phẩm khỏi giỏ hàng!');
}

/**
 * Cập nhật số lượng sản phẩm trong giỏ hàng
 */
function updateCartCount() {
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  
  const cartCountElements = document.querySelectorAll('#cartItemCount, #cart-count-badge');
  cartCountElements.forEach(element => {
    if (element) {
      element.textContent = totalItems;
      
      if (element.id === 'cart-count-badge') {
        element.style.display = totalItems > 0 ? 'flex' : 'none';
      }
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
  toast.style.display = 'block';
  toast.classList.remove('opacity-0', 'translate-y-full');
  toast.classList.add('opacity-100', 'translate-y-0');
  
  setTimeout(() => {
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', 'translate-y-full');
    
    setTimeout(() => {
      toast.style.display = 'none';
    }, 500);
  }, duration);
}

// Cập nhật năm hiện tại cho footer
document.addEventListener('DOMContentLoaded', () => {
  const currentYearElement = document.getElementById('currentYear');
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
  }
});






