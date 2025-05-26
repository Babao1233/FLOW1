const app = {
    darkMode: localStorage.getItem('darkMode') === 'true',
    cart: [],
    products: [], // Will be populated from window.appData
    testimonials: [], // Will be populated from window.appData

    init() {
        this.products = window.appData.products;
        this.testimonials = window.appData.testimonials;
        this.loadCart();
        this.initDarkMode();
        this.updateCartCountDisplay();
        this.initToast();
        this.initSearchForm();
    },

    initDarkMode() {
        const darkModeToggle = document.getElementById('darkModeToggle');
        const lightModeIcon = document.getElementById('lightModeIcon');
        const darkModeIcon = document.getElementById('darkModeIcon');

        if (!darkModeToggle || !lightModeIcon || !darkModeIcon) return;

        const applyDarkMode = () => {
            if (this.darkMode) {
                document.documentElement.classList.add('dark');
                lightModeIcon.classList.remove('hidden');
                darkModeIcon.classList.add('hidden');
            } else {
                document.documentElement.classList.remove('dark');
                lightModeIcon.classList.add('hidden');
                darkModeIcon.classList.remove('hidden');
            }
        };

        applyDarkMode(); // Apply on initial load

        darkModeToggle.addEventListener('click', () => {
            this.darkMode = !this.darkMode;
            localStorage.setItem('darkMode', this.darkMode);
            applyDarkMode();
        });
    },
    
    initSearchForm() {
        const searchForms = document.querySelectorAll('form[role="search"]');
        searchForms.forEach(form => {
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                const searchInput = form.querySelector('input[type="search"]');
                const query = searchInput.value.trim();
                if (query) {
                    window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
                }
            });
        });
    },

    loadCart() {
        const storedCart = localStorage.getItem('yapeeCart');
        if (storedCart) {
            this.cart = JSON.parse(storedCart);
        } else {
            this.cart = []; // Ensure cart is an array
        }
    },

    saveCart() {
        localStorage.setItem('yapeeCart', JSON.stringify(this.cart));
    },

    addToCart(productId) {
        const product = this.products.find(p => p.id === parseInt(productId));
        if (!product) return;

        const existingItem = this.cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({ ...product, quantity: 1 });
        }
        this.saveCart();
        this.updateCartCountDisplay();
        this.showToast(`${product.name} đã được thêm vào giỏ hàng!`);
    },

    updateCartItemQuantity(productId, newQuantity) {
        const item = this.cart.find(item => item.id === parseInt(productId));
        if (item) {
            if (newQuantity > 0) {
                item.quantity = newQuantity;
            } else {
                this.cart = this.cart.filter(cartItem => cartItem.id !== parseInt(productId));
            }
            this.saveCart();
            this.updateCartCountDisplay();
        }
        return this.cart; // Return updated cart for potential re-render
    },
    
    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== parseInt(productId));
        this.saveCart();
        this.updateCartCountDisplay();
        const product = this.products.find(p => p.id === parseInt(productId));
        if (product) {
            this.showToast(`${product.name} đã được xóa khỏi giỏ hàng.`, 'info');
        }
    },

    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.salePrice || item.price) * item.quantity, 0);
    },

    updateCartCountDisplay() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartCountElements = document.querySelectorAll('#cartCount, .cart-count-badge'); // Use a class for more flexibility
        cartCountElements.forEach(el => {
            el.textContent = totalItems;
            el.classList.toggle('hidden', totalItems === 0);
        });
    },
    
    initToast() {
        const toastElement = document.getElementById('toast');
        if (toastElement) {
            // Set initial aria attributes
            toastElement.setAttribute('aria-live', 'assertive');
            toastElement.setAttribute('aria-atomic', 'true');
            toastElement.setAttribute('role', 'alert');
        }
    },

    showToast(message, type = 'success') { // type can be 'success', 'error', 'info'
        const toast = document.getElementById('toast');
        if (!toast) return;

        toast.textContent = message;
        toast.classList.remove('opacity-0', 'translate-y-full', 'bg-green-500', 'bg-red-500', 'bg-blue-500');
        toast.classList.add('opacity-100', 'translate-y-0');

        if (type === 'success') {
            toast.classList.add('bg-green-500');
        } else if (type === 'error') {
            toast.classList.add('bg-red-500');
        } else { // info or default
            toast.classList.add('bg-blue-500');
        }
        
        // Ensure toast is visible for screen readers
        toast.classList.remove('hidden');


        setTimeout(() => {
            toast.classList.remove('opacity-100', 'translate-y-0');
            toast.classList.add('opacity-0', 'translate-y-full');
            setTimeout(() => toast.classList.add('hidden'), 500); // Hide after transition
        }, 3000);
    },

    renderProductCard(product, isSkeleton = false) {
        if (isSkeleton) {
            return `
                <div class="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col">
                    <div class="skeleton skeleton-image"></div>
                    <div class="p-5 flex flex-col flex-grow">
                        <div class="skeleton skeleton-text skeleton-text-lg mb-2"></div>
                        <div class="skeleton skeleton-text skeleton-text-md mb-1"></div>
                        <div class="skeleton skeleton-text skeleton-text-sm mb-3"></div>
                        <div class="mt-auto skeleton-button-container">
                             <div class="skeleton skeleton-button"></div>
                        </div>
                    </div>
                </div>
            `;
        }

        const ratingStars = Array(5).fill(0).map((_, i) => 
            `<svg class="w-4 h-4 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>`
        ).join('');

        return `
            <article class="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col group">
                <div class="relative overflow-hidden aspect-w-4 aspect-h-3">
                    <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy">
                    <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <button 
                            onclick="app.addToCart(${product.id})" 
                            aria-label="Thêm ${product.name} vào giỏ hàng"
                            class="bg-white text-red-500 hover:bg-red-100 dark:bg-red-500 dark:text-white dark:hover:bg-red-600 px-6 py-2.5 rounded-full font-semibold shadow-md transform transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm">
                            Thêm Giỏ Hàng
                        </button>
                    </div>
                </div>
                <div class="p-5 flex flex-col flex-grow">
                    <h4 class="text-lg font-semibold mb-1 text-gray-800 dark:text-white truncate" title="${product.name}">${product.name}</h4>
                    <div class="flex items-center mb-2">
                        ${ratingStars}
                        <span class="ml-2 text-sm text-gray-500 dark:text-gray-400">(${product.rating || 'N/A'})</span>
                    </div>
                    <div class="flex items-baseline mb-3">
                        <span class="text-xl font-bold text-red-500 mr-2">$${product.salePrice}</span>
                        ${product.price !== product.salePrice ? `<span class="text-sm text-gray-500 dark:text-gray-400 line-through">$${product.price}</span>` : ''}
                    </div>
                    <p class="text-xs text-gray-600 dark:text-gray-300 mb-3 flex-grow">${product.description ? product.description.substring(0, 60) + '...' : 'Mô tả ngắn gọn cho sản phẩm này.'}</p>
                    <a href="product-detail.html?id=${product.id}" class="mt-auto text-center w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 custom-focus-ring">
                        Xem Chi Tiết
                    </a>
                </div>
            </article>
        `;
    },
    
    renderFooter() {
        const footerContainer = document.getElementById('footer-container');
        if (!footerContainer) return;

        footerContainer.innerHTML = `
        <footer class="bg-gray-800 text-white py-16">
            <div class="container mx-auto px-4">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    <div>
                        <h4 class="text-xl font-bold mb-4 flex items-center">
                            <svg class="w-7 h-7 text-red-500 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/><path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                            Yapee
                        </h4>
                        <p class="text-gray-400 mb-4 text-sm">Nâng tầm cuộc sống hiện đại với những thiết bị thông minh hàng đầu.</p>
                        <div class="flex space-x-4">
                            <a href="#" aria-label="Facebook" class="text-gray-400 hover:text-white transition-colors"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg></a>
                            <a href="#" aria-label="Instagram" class="text-gray-400 hover:text-white transition-colors"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.85-.069zM12 0C8.74 0 8.333.014 7.053.06 2.05 0.222 1.116 1.4 1.03 4.384.984 6.064.98 6.623.98 12s0 5.936.004 7.616C1.07 22.6 2.005 23.778 7.008 23.94c1.281.046 1.689.06 4.949.06 3.26 0 3.668-.014 4.949-.06 4.99-0.162 5.929-1.34 5.975-4.324.004-1.68.004-2.239.004-7.616s0-5.936-.004-7.616c-0.046-2.984-1.07-4.162-5.975-4.324-1.281-.045-1.689-.06-4.949-.06z" /><path d="M12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8z" /><circle cx="18.406" cy="5.594" r="1.44" /></svg></a>
                            <a href="#" aria-label="Twitter" class="text-gray-400 hover:text-white transition-colors"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg></a>
                        </div>
                    </div>
                    <div>
                        <h4 class="text-lg font-semibold mb-4">Liên Kết Nhanh</h4>
                        <ul class="space-y-2 text-sm">
                            <li><a href="index.html#products" class="text-gray-400 hover:text-white transition-colors">Sản phẩm</a></li>
                            <li><a href="index.html#promotions" class="text-gray-400 hover:text-white transition-colors">Khuyến mãi</a></li>
                            <li><a href="index.html#testimonials" class="text-gray-400 hover:text-white transition-colors">Đánh giá</a></li>
                            <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Chính sách bảo hành</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="text-lg font-semibold mb-4">Hỗ Trợ</h4>
                        <ul class="space-y-2 text-sm">
                            <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Trung tâm hỗ trợ</a></li>
                            <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Hướng dẫn sử dụng</a></li>
                            <li><a href="index.html#contact" class="text-gray-400 hover:text-white transition-colors">Liên hệ</a></li>
                            <li><a href="#" class="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="text-lg font-semibold mb-4">Nhận Tin Mới</h4>
                        <p class="text-gray-400 mb-4 text-sm">Đăng ký để nhận ưu đãi đặc biệt và cập nhật sản phẩm mới nhất.</p>
                        <form class="flex">
                            <input type="email" placeholder="Email của bạn" aria-label="Email của bạn" class="px-3 py-2.5 w-full rounded-l-md focus:outline-none text-gray-900 text-sm custom-focus-ring">
                            <button type="submit" class="bg-red-500 hover:bg-red-600 px-4 py-2.5 rounded-r-md font-semibold text-sm custom-focus-ring">Đăng ký</button>
                        </form>
                    </div>
                </div>
                <div class="border-t border-gray-700 mt-10 pt-8 text-center text-gray-400 text-sm">
                    <p>&copy; ${new Date().getFullYear()} Yapee. Tất cả quyền được bảo lưu.</p>
                </div>
            </div>
        </footer>
        `;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    app.init();
    app.renderFooter(); // Render footer on all pages that include footer-container
});





