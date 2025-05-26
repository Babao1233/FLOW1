/**
 * Quản lý trang tài khoản
 * File này xử lý việc đăng nhập, đăng ký và quản lý thông tin tài khoản
 */

// DOM Elements
let loginForm;
let registerForm;
let accountInfo;
let orderHistory;
let logoutButton;

// Biến lưu trữ trạng thái đăng nhập (sẽ được cập nhật từ API)
let currentUser = null; 

/**
 * Khởi tạo trang tài khoản
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Kiểm tra trạng thái đăng nhập đầu tiên
  try {
    const response = await fetch('/api/auth/status');
    if (!response.ok) {
      // If API call fails (e.g. server error), redirect to login as a precaution
      console.error('Auth status check failed, redirecting to login.');
      window.location.href = 'login.html';
      return;
    }
    const data = await response.json();

    if (!data.isLoggedIn) {
      window.location.href = 'login.html';
      return; // Stop further execution if not logged in
    }
    
    // User is logged in, store user data and proceed
    currentUser = {
      id: data.userId,
      username: data.username,
      // email: data.email // Assuming email is also returned by /api/auth/status or fetched separately
    };
    
    // Khởi tạo các phần tử DOM
    initElements(); 
    
    // Hiển thị thông tin tài khoản (vì đã đăng nhập)
    showAccountInfo(); 
    
    // Thiết lập các sự kiện
    setupEventListeners(); 
    
    // Tải lịch sử đơn hàng
    loadOrderHistory(); 
    
    // Cập nhật số lượng sản phẩm trong giỏ hàng
    updateCartCount(); 

  } catch (error) {
    console.error('Error checking auth status:', error);
    window.location.href = 'login.html'; // Redirect on any error during auth check
    return;
  }
});

/**
 * Khởi tạo các phần tử DOM
 */
function initElements() {
  // loginForm and registerForm are no longer needed on this page if it's protected
  // loginForm = document.getElementById('loginForm'); 
  // registerForm = document.getElementById('registerForm'); 
  accountInfo = document.getElementById('accountInfo');
  orderHistory = document.getElementById('orderHistory');
  // logoutButton is handled by js/main.js in the header now
  // logoutButton = document.getElementById('logoutButton'); 
  
  // Khởi tạo chế độ tối/sáng
  initDarkMode();
}

/**
 * Khởi tạo chế độ tối/sáng
 */
function initDarkMode() {
  const darkModeToggle = document.getElementById('darkModeToggle');
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
  const lightModeIcon = document.getElementById('lightModeIcon');
  const darkModeIcon = document.getElementById('darkModeIcon');
  
  if (lightModeIcon && darkModeIcon) {
    if (isDarkMode) {
      lightModeIcon.classList.remove('hidden');
      darkModeIcon.classList.add('hidden');
    } else {
      lightModeIcon.classList.add('hidden');
      darkModeIcon.classList.remove('hidden');
    }
  }
}

/**
 * Thiết lập các sự kiện
 */
function setupEventListeners() {
  // Sự kiện cho nút menu di động (if it exists on account.html, otherwise handled by main.js)
  const mobileMenuButton = document.getElementById('mobileMenuButton');
  const mobileMenu = document.getElementById('mobileMenu');
  
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
      mobileMenuButton.setAttribute('aria-expanded', !isExpanded);
    });
  }
  
  // Sự kiện chuyển đổi giữa đăng nhập và đăng ký
  // Login/Register tabs and forms are no longer part of this page's direct responsibility
  // if it's a protected page.
  // const loginTab = document.getElementById('loginTab');
  // const registerTab = document.getElementById('registerTab');
  // const loginSection = document.getElementById('loginSection');
  // const registerSection = document.getElementById('registerSection');
  
  // if (loginTab && registerTab && loginSection && registerSection) { ... }
  
  // Login/Register form submissions are handled by login.js and register.js
  // if (loginForm) { ... }
  // if (registerForm) { ... }
  
  // Logout is handled by main.js in the header
  // if (logoutButton) { ... }
  
  // Sự kiện chuyển đổi tab trong trang tài khoản
  const accountTabs = document.querySelectorAll('.account-tab');
  const accountSections = document.querySelectorAll('.account-section');
  
  accountTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.target;
      
      // Cập nhật trạng thái active cho tab
      accountTabs.forEach(t => t.classList.remove('bg-blue-500', 'text-white'));
      tab.classList.add('bg-blue-500', 'text-white');
      
      // Hiển thị section tương ứng
      accountSections.forEach(section => {
        if (section.id === target) {
          section.classList.remove('hidden');
        } else {
          section.classList.add('hidden');
        }
      });
    });
  });
}

/**
 * Kiểm tra trạng thái đăng nhập
 */
// The old checkLoginStatus, showLoginForm, handleLogin, handleRegister, handleLogout are removed
// as they are based on localStorage and conflict with the new session-based auth.

/**
 * Hiển thị thông tin tài khoản
 */
function showAccountInfo() {
  // This page should only be visible if logged in, so authSection can be assumed hidden.
  // const authSection = document.getElementById('authSection');
  const accountSection = document.getElementById('accountSection'); 
  
  if (accountSection) { // Ensure account section exists
    accountSection.classList.remove('hidden');
  }
  
  // Cập nhật thông tin người dùng
  const userNameElement = document.getElementById('userName'); // Assuming this ID exists in account.html
  const userEmailElement = document.getElementById('userEmail'); // Assuming this ID exists
  const welcomeMessageElement = document.getElementById('welcome-message'); // Optional welcome message
  
  if (currentUser) {
    if (userNameElement) {
      userNameElement.textContent = currentUser.username || 'Người dùng'; // Use username from session
    }
    if (userEmailElement && currentUser.email) { // Check if email is available
      userEmailElement.textContent = currentUser.email;
    } else if (userEmailElement) {
      userEmailElement.textContent = 'N/A'; // Or fetch it if needed
    }
    if (welcomeMessageElement) {
      welcomeMessageElement.textContent = `Chào mừng trở lại, ${currentUser.username || 'User'}!`;
    }
  }
}

/**
 * Tải lịch sử đơn hàng
 */
function loadOrderHistory() {
  if (!orderHistory || !currentUser) return;
  
  // Lấy đơn hàng từ localStorage (trong thực tế, dữ liệu này sẽ được lấy từ API)
  const lastOrder = JSON.parse(localStorage.getItem('lastOrder'));
  const orders = [];
  
  if (lastOrder) {
    // Thêm đơn hàng mẫu
    orders.push({
      id: 'ORD-' + Date.now(),
      date: new Date().toLocaleDateString('vi-VN'),
      status: 'Đang xử lý',
      total: lastOrder.total,
      items: lastOrder.items
    });
  }
  
  // Thêm một số đơn hàng mẫu khác
  orders.push({
    id: 'ORD-20230501',
    date: '01/05/2023',
    status: 'Đã giao',
    total: 4990000,
    items: [
      { name: 'Máy lọc không khí Yapee A8',
        quantity: 1,
        price: 4990000
      }
    ]
  });
  
  orders.push({
    id: 'ORD-20230415',
    date: '15/04/2023',
    status: 'Đã giao',
    total: 2990000,
    items: [
      {
        name: 'Máy lọc không khí Yapee P9',
        quantity: 1,
        price: 2990000
      }
    ]
  });
  
  // Hiển thị đơn hàng
  if (orders.length === 0) {
    orderHistory.innerHTML = `
      <div class="text-center py-8">
        <p class="text-gray-500 dark:text-gray-400">Bạn chưa có đơn hàng nào.</p>
      </div>
    `;
    return;
  }
  
  let html = `
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mã đơn hàng</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ngày đặt</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Trạng thái</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tổng tiền</th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Thao tác</th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
  `;
  
  orders.forEach(order => {
    // Format giá tiền
    const formatter = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    });
    
    const formattedTotal = formatter.format(order.total);
    
    html += `
      <tr>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">${order.id}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${order.date}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'Đang xử lý' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}">
            ${order.status}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${formattedTotal}</td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <button class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" data-order-id="${order.id}">Chi tiết</button>
        </td>
      </tr>
    `;
  });
  
  html += `
        </tbody>
      </table>
    </div>
  `;
  
  orderHistory.innerHTML = html;
  
  // Thêm sự kiện cho nút chi tiết
  const detailButtons = orderHistory.querySelectorAll('button[data-order-id]');
  detailButtons.forEach(button => {
    button.addEventListener('click', () => {
      const orderId = button.dataset.orderId;
      const order = orders.find(o => o.id === orderId);
      
      if (order) {
        showOrderDetail(order);
      }
    });
  });
}

/**
 * Hiển thị chi tiết đơn hàng
 */
function showOrderDetail(order) {
  // Tạo modal hiển thị chi tiết đơn hàng
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50';
  
  // Format giá tiền
  const formatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  });
  
  let itemsHtml = '';
  order.items.forEach(item => {
    const itemTotal = item.price * item.quantity;
    const formattedPrice = formatter.format(item.price);
    const formattedTotal = formatter.format(itemTotal);
    
    itemsHtml += `
      <tr>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${item.name}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${item.quantity}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${formattedPrice}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${formattedTotal}</td>
      </tr>
    `;
  });
  
  const formattedTotal = formatter.format(order.total);
  
  modal.innerHTML = `
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
      <div class="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 p-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Chi tiết đơn hàng #${order.id}</h3>
        <button id="closeOrderDetail" class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <div class="p-4">
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Ngày đặt hàng</p>
            <p class="font-medium text-gray-900 dark:text-white">${order.date}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Trạng thái</p>
            <p class="font-medium">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'Đang xử lý' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}">
                            ${order.status}
                        </span>
            </p>
          </div>
                    </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sản phẩm</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Số lượng</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Đơn giá</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Thành tiền</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              ${itemsHtml}
            </tbody>
          </table>
                    </div>
                    
        <div class="mt-4 text-right">
          <p class="text-sm text-gray-500 dark:text-gray-400">Tổng tiền</p>
          <p class="text-lg font-bold text-gray-900 dark:text-white">${formattedTotal}</p>
                    </div>
                    </div>
                </div>
  `;
  
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
  
  // Thêm sự kiện đóng modal
  const closeButton = document.getElementById('closeOrderDetail');
  closeButton.addEventListener('click', () => {
    document.body.removeChild(modal);
    document.body.style.overflow = '';
  });
  
  // Đóng modal khi click ra ngoài
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      document.body.removeChild(modal);
      document.body.style.overflow = '';
    }
  });
}

/**
 * Cập nhật số lượng sản phẩm trong giỏ hàng
 */
function updateCartCount() {
  const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
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
function showToast(message, type = 'success', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg text-white ${type === 'error' ? 'bg-red-500' : 'bg-green-500'} transition-opacity duration-300`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('opacity-0');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, duration);
}

// Cập nhật năm hiện tại cho footer
document.addEventListener('DOMContentLoaded', () => {
  const currentYearElement = document.getElementById('currentYear');
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
  }
});



