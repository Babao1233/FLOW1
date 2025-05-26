const CART_STORAGE_KEY = 'yapeeCartItems';
const DARK_MODE_KEY = 'yapeeDarkMode';

function getCartItems() {
  try {
    const items = localStorage.getItem(CART_STORAGE_KEY);
    return items ? JSON.parse(items) : [];
  } catch (e) {
    console.error("Error parsing cart items from localStorage:", e);
    return [];
  }
}

function saveCartItems(cartItems) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    updateCartIcon(); // Update icon whenever cart is saved
  } catch (e) {
    console.error("Error saving cart items to localStorage:", e);
  }
}

function updateCartIcon() {
  const cartItems = getCartItems();
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartCountElement = document.getElementById('cartCount');
  if (cartCountElement) {
    cartCountElement.textContent = totalQuantity;
    cartCountElement.classList.toggle('hidden', totalQuantity === 0);
  }
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.className = 'fixed top-4 right-4 px-4 py-2 rounded shadow-lg transition-all duration-300 z-50'; // Reset classes
  
  if (type === 'success') {
    toast.classList.add('bg-green-500', 'text-white');
  } else if (type === 'error') {
    toast.classList.add('bg-red-500', 'text-white');
  } else { // Info or default
    toast.classList.add('bg-blue-500', 'text-white');
  }

  toast.classList.remove('opacity-0', 'translate-y-[-20px]');
  toast.classList.add('opacity-100', 'translate-y-0');

  setTimeout(() => {
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', 'translate-y-[-20px]');
  }, 3000);
}


function initDarkMode() {
  const darkMode = localStorage.getItem(DARK_MODE_KEY) === 'true';
  const lightIcon = document.getElementById('lightModeIcon');
  const darkIcon = document.getElementById('darkModeIcon');
  
  if (darkMode) {
    document.documentElement.classList.add('dark');
    if (lightIcon) lightIcon.classList.remove('hidden');
    if (darkIcon) darkIcon.classList.add('hidden');
  } else {
    document.documentElement.classList.remove('dark');
    if (lightIcon) lightIcon.classList.add('hidden');
    if (darkIcon) darkIcon.classList.remove('hidden');
  }
}

function toggleDarkMode() {
  const isDarkMode = document.documentElement.classList.toggle('dark');
  localStorage.setItem(DARK_MODE_KEY, isDarkMode);
  
  const lightIcon = document.getElementById('lightModeIcon');
  const darkIcon = document.getElementById('darkModeIcon');
  if (lightIcon && darkIcon) {
    lightIcon.classList.toggle('hidden', !isDarkMode);
    darkIcon.classList.toggle('hidden', isDarkMode);
  }
}

function setupDarkModeToggle() {
  const toggleButton = document.getElementById('darkModeToggle');
  if (toggleButton) {
    toggleButton.addEventListener('click', toggleDarkMode);
  }
  initDarkMode(); // Apply on load
}

function formatCurrency(amount) {
  return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

function updateCurrentYear() {
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// Initialize common elements on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  setupDarkModeToggle();
  updateCartIcon();
  updateCurrentYear();
});






