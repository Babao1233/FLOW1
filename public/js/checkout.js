/**
 * Quản lý trang thanh toán
 * File này xử lý việc hiển thị thông tin đơn hàng và xử lý form đặt hàng
 */

// DOM Elements
let checkoutForm;
let cartItems = [];
let provinces = [
  'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
  'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
  'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông',
  'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang',
  'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang', 'Hòa Bình',
  'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
  'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định',
  'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên',
  'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị',
  'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên',
  'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang',
  'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'
];

/**
 * Khởi tạo trang thanh toán
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
  
  // Hiển thị thông tin đơn hàng
  renderOrderSummary();
  
  // Khởi tạo danh sách tỉnh/thành phố
  initProvinceSelect();
});

/**
 * Khởi tạo các phần tử DOM
 */
function initElements() {
  checkoutForm = document.getElementById('checkoutForm');
  
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
 * Khởi tạo danh sách tỉnh/thành phố
 */
function initProvinceSelect() {
  const provinceInput = document.getElementById('province');
  if (!provinceInput) return;
  
  // Chuyển đổi input thành datalist
  const provinceDatalist = document.createElement('datalist');
  provinceDatalist.id = 'province-list';
  
  // Thêm các tùy chọn cho datalist
  provinces.forEach(province => {
    const option = document.createElement('option');
    option.value = province;
    provinceDatalist.appendChild(option);
  });
  
  // Thêm datalist vào trang
  document.body.appendChild(provinceDatalist);
  
  // Liên kết input với datalist
  provinceInput.setAttribute('list', 'province-list');
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
  
  // Sự kiện gửi form thanh toán
    if (checkoutForm) {
    checkoutForm.addEventListener('submit', handleCheckoutSubmit);
  }
  
  // Sự kiện thay đổi phương thức thanh toán
  const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
  paymentMethods.forEach(method => {
    method.addEventListener('change', updatePaymentMethod);
  });
}

/**
 * Tải dữ liệu giỏ hàng từ localStorage
 */
function loadCartData() {
  cartItems = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Kiểm tra giỏ hàng trống
  if (cartItems.length === 0) {
    // Chuyển hướng về trang giỏ hàng
    window.location.href = 'cart.html';
  }
}

/**
 * Hiển thị thông tin đơn hàng
 */
function renderOrderSummary() {
  const orderSummaryContainer = document.querySelector('.space-y-3');
  if (!orderSummaryContainer) return;
  
  // Xóa các mục mẫu
  orderSummaryContainer.innerHTML = '';
  
  // Tính tổng tiền
  let subtotal = 0;
  
  // Thêm các sản phẩm vào tóm tắt đơn hàng
  cartItems.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    
    // Format giá tiền
    const formatter = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    });
    
    const formattedTotal = formatter.format(itemTotal);
    
    // Sử dụng trực tiếp URL hình ảnh từ API
    const imageUrl = item.image || 'https://via.placeholder.com/300x300?text=No+Image';
    
    const itemElement = document.createElement('div');
    itemElement.className = 'flex justify-between items-center text-gray-600 dark:text-gray-300 py-2';
    itemElement.innerHTML = `
      <div class="flex items-center">
        <img src="${imageUrl}" alt="${item.name}" class="w-10 h-10 object-cover rounded-md mr-3 hidden sm:block">
        <span>${item.name} x ${item.quantity}</span>
      </div>
      <span>${formattedTotal}</span>
    `;
    
    orderSummaryContainer.appendChild(itemElement);
  });
  
  // Thêm đường phân cách
  const divider = document.createElement('hr');
  divider.className = 'border-gray-200 dark:border-gray-700 my-3';
  orderSummaryContainer.appendChild(divider);
  
  // Hiển thị tạm tính
  const formatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  });
  
  const formattedSubtotal = formatter.format(subtotal);
  
  const subtotalElement = document.createElement('div');
  subtotalElement.className = 'flex justify-between items-center font-medium text-gray-700 dark:text-gray-200';
  subtotalElement.innerHTML = `
    <span>Tạm tính</span>
    <span>${formattedSubtotal}</span>
  `;
  
  orderSummaryContainer.appendChild(subtotalElement);
  
  // Hiển thị phí vận chuyển
  const shippingElement = document.createElement('div');
  shippingElement.className = 'flex justify-between items-center font-medium text-gray-700 dark:text-gray-200';
  shippingElement.innerHTML = `
    <span>Phí vận chuyển</span>
    <span>Miễn phí</span>
  `;
  
  orderSummaryContainer.appendChild(shippingElement);
  
  // Thêm đường phân cách
  const divider2 = document.createElement('hr');
  divider2.className = 'border-gray-200 dark:border-gray-700 my-3';
  orderSummaryContainer.appendChild(divider2);
  
  // Hiển thị tổng cộng
  const totalElement = document.createElement('div');
  totalElement.className = 'flex justify-between items-center text-lg font-bold text-gray-800 dark:text-white';
  totalElement.innerHTML = `
    <span>Tổng cộng</span>
    <span class="text-red-500">${formattedSubtotal}</span>
  `;
  
  orderSummaryContainer.appendChild(totalElement);
}

/**
 * Cập nhật phương thức thanh toán
 */
function updatePaymentMethod() {
  // Thực hiện các thay đổi khi phương thức thanh toán thay đổi
  const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
  
  // Có thể thêm logic hiển thị thêm thông tin cho từng phương thức thanh toán
  switch (selectedMethod) {
    case 'bank_transfer':
      // Hiển thị thông tin chuyển khoản
      break;
    case 'card':
      // Hiển thị form nhập thông tin thẻ
      break;
    default:
      // Thanh toán khi nhận hàng (COD)
      break;
  }
}

/**
 * Xử lý gửi form thanh toán
 */
function handleCheckoutSubmit(event) {
  event.preventDefault();
  
  // Kiểm tra giỏ hàng trống
  if (cartItems.length === 0) {
    showToast('Giỏ hàng trống. Không thể đặt hàng.');
                return;
            }
            
  // Lấy dữ liệu từ form
            const formData = new FormData(checkoutForm);
  const orderData = {
    customer: {
      fullName: formData.get('fullName'),
      phoneNumber: formData.get('phoneNumber'),
      province: formData.get('province'),
      district: formData.get('district'),
      ward: formData.get('ward'),
      addressDetail: formData.get('addressDetail'),
      notes: formData.get('notes')
    },
    paymentMethod: formData.get('paymentMethod'),
    items: cartItems,
    subtotal: cartItems.reduce((total, item) => total + (item.price * item.quantity), 0),
    shipping: 0, // Miễn phí vận chuyển
    total: cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  };
  
  // Lưu đơn hàng vào localStorage để xử lý sau
  localStorage.setItem('lastOrder', JSON.stringify(orderData));
  
  // Xóa giỏ hàng
  localStorage.removeItem('cart');
  
  // Hiển thị thông báo đặt hàng thành công
  showOrderSuccess(orderData);
}

/**
 * Hiển thị thông báo đặt hàng thành công
 */
function showOrderSuccess(orderData) {
  // Xóa nội dung trang hiện tại
  document.querySelector('main').innerHTML = `
    <div class="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center">
      <div class="mb-6">
        <svg class="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      
      <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">Đặt hàng thành công!</h2>
      
      <p class="text-gray-600 dark:text-gray-300 mb-6">
        Cảm ơn bạn đã mua hàng tại Yapee. Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.
        Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.
      </p>
      
      <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6 text-left">
        <h3 class="font-semibold text-gray-700 dark:text-gray-200 mb-2">Thông tin đơn hàng:</h3>
        <p class="text-gray-600 dark:text-gray-300">
          <strong>Người nhận:</strong> ${orderData.customer.fullName}<br>
          <strong>Số điện thoại:</strong> ${orderData.customer.phoneNumber}<br>
          <strong>Địa chỉ:</strong> ${orderData.customer.addressDetail}, ${orderData.customer.ward}, ${orderData.customer.district}, ${orderData.customer.province}<br>
          <strong>Phương thức thanh toán:</strong> ${getPaymentMethodName(orderData.paymentMethod)}<br>
          <strong>Tổng tiền:</strong> ${formatCurrency(orderData.total)}
        </p>
      </div>
      
      <div class="flex flex-wrap justify-center gap-4">
        <a href="index.html" class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
          Tiếp tục mua sắm
        </a>
        <a href="account.html#orders" class="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-6 py-3 rounded-lg font-semibold transition-colors">
          Xem đơn hàng
        </a>
      </div>
    </div>
  `;
}

/**
 * Lấy tên phương thức thanh toán
 */
function getPaymentMethodName(method) {
  switch (method) {
    case 'cod':
      return 'Thanh toán khi nhận hàng (COD)';
    case 'bank_transfer':
      return 'Chuyển khoản ngân hàng';
    case 'card':
      return 'Thẻ tín dụng/ghi nợ';
    default:
      return 'Không xác định';
  }
}

/**
 * Format giá tiền
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
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




