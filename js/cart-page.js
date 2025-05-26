document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartSubtotalElement = document.getElementById('cartSubtotal');
    const cartTotalElement = document.getElementById('cartTotal');
    const checkoutButton = document.getElementById('checkoutButton');

    function renderCartItems() {
        if (!cartItemsContainer) return;

        if (app.cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center">
                    <svg class="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Giỏ hàng của bạn đang trống</h2>
                    <p class="text-gray-500 dark:text-gray-400 mb-6">Hãy thêm vài sản phẩm tuyệt vời nào!</p>
                    <a href="index.html#products" class="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors custom-focus-ring">
                        Tiếp tục mua sắm
                    </a>
                </div>
            `;
            if (checkoutButton) checkoutButton.disabled = true;
            updateCartSummary();
            return;
        }

        cartItemsContainer.innerHTML = `
            <div class="space-y-6">
                ${app.cart.map(item => `
                    <div class="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                        <img src="${item.image}" alt="${item.name}" class="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-lg border border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <div class="flex-grow text-center sm:text-left">
                            <h3 class="text-lg font-semibold text-gray-800 dark:text-white">${item.name}</h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Danh mục: ${item.category}</p>
                            <p class="text-red-500 font-medium mt-1">$${item.salePrice.toFixed(2)}</p>
                        </div>
                        <div class="flex items-center space-x-3 sm:ml-auto mt-3 sm:mt-0">
                            <button onclick="cartPage.decreaseQuantity(${item.id})" aria-label="Giảm số lượng ${item.name}" class="p-1.5 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 custom-focus-ring disabled:opacity-50" ${item.quantity <= 1 ? 'disabled' : ''}>
                                <svg class="w-4 h-4 text-gray-700 dark:text-gray-200" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clip-rule="evenodd"></path></svg>
                            </button>
                            <input type="number" value="${item.quantity}" min="1" aria-label="Số lượng ${item.name}" data-id="${item.id}" class="quantity-input w-12 text-center border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md focus:ring-red-500 focus:border-red-500 custom-focus-ring">
                            <button onclick="cartPage.increaseQuantity(${item.id})" aria-label="Tăng số lượng ${item.name}" class="p-1.5 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 custom-focus-ring">
                                <svg class="w-4 h-4 text-gray-700 dark:text-gray-200" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path></svg>
                            </button>
                        </div>
                        <div class="text-right font-semibold text-gray-800 dark:text-white w-full sm:w-auto mt-3 sm:mt-0 sm:min-w-[80px]">
                            $${(item.salePrice * item.quantity).toFixed(2)}
                        </div>
                        <button onclick="cartPage.removeItem(${item.id})" aria-label="Xóa ${item.name} khỏi giỏ hàng" class="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 custom-focus-ring transition-colors ml-2">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Add event listeners for quantity inputs
        cartItemsContainer.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', (event) => {
                const newQuantity = parseInt(event.target.value);
                const productId = event.target.dataset.id;
                if (newQuantity >= 1) {
                    app.updateCartItemQuantity(productId, newQuantity);
                    renderCartItems(); // Re-render to update totals and button states
                    updateCartSummary();
                } else {
                    // Reset to old value if invalid
                    const item = app.cart.find(i => i.id === parseInt(productId));
                    if (item) event.target.value = item.quantity;
                }
            });
        });

        if (checkoutButton) checkoutButton.disabled = false;
        updateCartSummary();
    }

    function updateCartSummary() {
        const subtotal = app.getCartTotal();
        // For simplicity, tax is 0, shipping is fixed or free.
        const shipping = subtotal > 50 || subtotal === 0 ? 0 : 10; // Example: free shipping over $50
        const taxRate = 0.0; // Example 0% tax
        const tax = subtotal * taxRate;
        const total = subtotal + shipping + tax;

        if (cartSubtotalElement) cartSubtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        // if (shippingCostElement) shippingCostElement.textContent = shipping === 0 ? 'Miễn phí' : `$${shipping.toFixed(2)}`;
        // if (estimatedTaxElement) estimatedTaxElement.textContent = `$${tax.toFixed(2)}`;
        if (cartTotalElement) cartTotalElement.textContent = `$${total.toFixed(2)}`;
    }

    // Expose functions to be called by inline onclick handlers
    window.cartPage = {
        increaseQuantity: (productId) => {
            const item = app.cart.find(i => i.id === productId);
            if (item) {
                app.updateCartItemQuantity(productId, item.quantity + 1);
                renderCartItems();
                updateCartSummary();
            }
        },
        decreaseQuantity: (productId) => {
            const item = app.cart.find(i => i.id === productId);
            if (item && item.quantity > 1) {
                app.updateCartItemQuantity(productId, item.quantity - 1);
                renderCartItems();
                updateCartSummary();
            }
        },
        removeItem: (productId) => {
            app.removeFromCart(productId);
            renderCartItems();
            updateCartSummary();
        }
    };

    if (checkoutButton) {
        checkoutButton.addEventListener('click', () => {
            if (app.cart.length > 0) {
                app.showToast('Chức năng thanh toán đang được phát triển!', 'info');
                // In a real app, redirect to a checkout page or process payment
            } else {
                app.showToast('Giỏ hàng của bạn trống.', 'error');
            }
        });
    }

    // Initial render
    // Ensure app data is loaded before rendering
    const ensureAppDataAndRender = () => {
        if (app.products && app.products.length > 0) { // Check if app.init has populated products
            renderCartItems();
        } else {
            // If app.products not ready, try again shortly. This is a simple polling.
            // A better approach would be an event/callback system from app.js
            setTimeout(ensureAppDataAndRender, 100);
        }
    };
    ensureAppDataAndRender();
});





