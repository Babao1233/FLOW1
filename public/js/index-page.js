document.addEventListener('DOMContentLoaded', function() {
  const productGrid = document.getElementById('product-grid');
  const categoryButtonsContainer = document.getElementById('category-buttons');
  let activeCategory = 'all';

  const renderStarRating = (rating) => {
    let stars = '';
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++) {
      stars += '<i class="fas fa-star text-yellow-400"></i>';
    }
    if (halfStar) {
      stars += '<i class="fas fa-star-half-alt text-yellow-400"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
      stars += '<i class="far fa-star text-yellow-400"></i>'; // Use far for empty star outline
    }
    return `<div class="flex text-xs">${stars}</div>`;
  };
  
  const renderSkeletonCard = () => {
    return `
      <div class="skeleton-card animate-pulse">
        <div class="skeleton-image"></div>
        <div class="p-4">
          <div class="skeleton-text w-3/4"></div>
          <div class="skeleton-text w-1/2"></div>
          <div class="flex justify-between items-center mt-2">
            <div class="skeleton-text-sm w-1/4"></div>
            <div class="skeleton-text-sm w-1/3"></div>
          </div>
        </div>
      </div>
    `;
  };

  const renderProducts = (productsToRender) => {
    if (!productGrid) return;
    productGrid.innerHTML = ''; // Clear existing products or skeletons

    if (productsToRender.length === 0 && activeCategory !== 'all') {
        productGrid.innerHTML = `<p class="col-span-full text-center text-gray-500 dark:text-gray-400">Không có sản phẩm nào trong danh mục này.</p>`;
        return;
    }
    if (productsToRender.length === 0 && activeCategory === 'all') {
        productGrid.innerHTML = `<p class="col-span-full text-center text-gray-500 dark:text-gray-400">Chưa có sản phẩm nào được hiển thị.</p>`;
        return;
    }

    productsToRender.forEach(product => {
      const productCard = document.createElement('div');
      productCard.className = "bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col";
      productCard.innerHTML = `
        <div class="relative overflow-hidden group aspect-[4/3]">
          <img 
            src="${product.image}" 
            alt="${product.name}"
            loading="lazy"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
            <button 
              data-product-id="${product.id}"
              class="add-to-cart-btn bg-white text-primary hover:bg-gray-100 px-6 py-2.5 rounded-full font-semibold text-sm shadow-md transform transition hover:scale-105 duration-300"
            >
              <i class="fas fa-cart-plus mr-2"></i>Thêm Giỏ Hàng
            </button>
          </div>
           ${product.salePrice < product.price ? `<span class="absolute top-3 right-3 bg-primary text-white text-xs font-semibold px-2.5 py-1 rounded-full">- ${Math.round(((product.price - product.salePrice)/product.price)*100)}%</span>` : ''}
        </div>
        <div class="p-5 flex flex-col flex-grow">
          <h4 class="text-lg font-semibold mb-1.5 text-gray-800 dark:text-white truncate" title="${product.name}">${product.name}</h4>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-2.5 capitalize">${product.category}</p>
          <div class="mt-auto">
            <div class="flex items-baseline justify-between mb-2.5">
              <div>
                <span class="text-primary font-bold text-xl">$${product.salePrice}</span>
                ${product.salePrice < product.price ? `<span class="text-gray-400 dark:text-gray-500 line-through ml-2 text-sm">$${product.price}</span>` : ''}
              </div>
              ${renderStarRating(product.rating || 0)}
            </div>
             <button 
              data-product-id="${product.id}"
              class="add-to-cart-btn-mobile w-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary hover:bg-primary/20 dark:hover:bg-primary/30 px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-300 mt-2 md:hidden"
            >
              <i class="fas fa-cart-plus mr-1.5"></i>Thêm vào giỏ
            </button>
          </div>
        </div>
      `;
      productGrid.appendChild(productCard);
    });

    // Add event listeners for new "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart-btn, .add-to-cart-btn-mobile').forEach(button => {
      button.addEventListener('click', handleAddToCart);
    });
  };

  const filterAndRenderProducts = () => {
    // Show skeleton loaders
    if (productGrid) {
        productGrid.innerHTML = Array(8).fill(0).map(renderSkeletonCard).join('');
    }

    // Simulate API delay for skeleton effect
    setTimeout(() => {
        const filteredProducts = activeCategory === 'all' 
        ? products 
        : products.filter(p => p.category === activeCategory);
        renderProducts(filteredProducts);
    }, 500); 
  };

  if (categoryButtonsContainer) {
    categoryButtonsContainer.addEventListener('click', (event) => {
      if (event.target.tagName === 'BUTTON') {
        document.querySelectorAll('#category-buttons button').forEach(btn => {
          btn.classList.remove('active');
        });
        event.target.classList.add('active');
        activeCategory = event.target.dataset.category;
        filterAndRenderProducts();
      }
    });
    // Set 'All' as active initially
    const allButton = categoryButtonsContainer.querySelector('button[data-category="all"]');
    if (allButton) {
      allButton.classList.add('active');
    }
  }
  
  filterAndRenderProducts(); // Initial render

  // Handle Add to Cart
  const handleAddToCart = (event) => {
    const productId = parseInt(event.currentTarget.dataset.productId);
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProductIndex = cart.findIndex(item => item.id === productId);

    if (existingProductIndex > -1) {
      cart[existingProductIndex].quantity += 1;
    } else {
      cart.push({ id: productId, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    
    if (window.showToast) window.showToast('Đã thêm sản phẩm vào giỏ hàng!');
    if (window.updateCartCount) window.updateCartCount();
  };

  // Testimonial Carousel
  const testimonialSlider = document.getElementById('testimonial-slider');
  const prevTestimonialBtn = document.getElementById('prevTestimonial');
  const nextTestimonialBtn = document.getElementById('nextTestimonial');
  const testimonialDotsContainer = document.getElementById('testimonial-dots');
  let currentTestimonialIndex = 0;
  let testimonialInterval;

  const renderTestimonials = () => {
    if (!testimonialSlider || !testimonials || testimonials.length === 0) return;
    testimonialSlider.innerHTML = '';
    testimonialDotsContainer.innerHTML = '';

    testimonials.forEach((testimonial, index) => {
      const slide = document.createElement('div');
      slide.className = 'w-full flex-shrink-0 p-1'; // Added p-1 for better shadow visibility if card has shadow
      slide.innerHTML = `
        <div class="bg-white dark:bg-gray-700 p-6 sm:p-8 rounded-xl shadow-lg text-center min-h-[280px] flex flex-col justify-center">
          <img src="${testimonial.avatar}" alt="${testimonial.name}" class="w-16 h-16 rounded-full mx-auto mb-4 border-2 border-primary shadow-sm">
          <div class="mb-4 flex justify-center text-lg">
            ${Array(testimonial.rating).fill(0).map(() => '<i class="fas fa-star text-yellow-400"></i>').join('')}
            ${Array(5 - testimonial.rating).fill(0).map(() => '<i class="far fa-star text-yellow-400"></i>').join('')}
          </div>
          <p class="text-gray-600 dark:text-gray-300 italic text-sm sm:text-base mb-5">"${testimonial.text}"</p>
          <p class="font-semibold text-gray-800 dark:text-white">— ${testimonial.name}</p>
        </div>
      `;
      testimonialSlider.appendChild(slide);

      const dot = document.createElement('button');
      dot.className = 'testimonial-dot';
      dot.setAttribute('aria-label', `Go to testimonial ${index + 1}`);
      dot.addEventListener('click', () => {
        currentTestimonialIndex = index;
        updateTestimonialSlider();
        resetTestimonialInterval();
      });
      testimonialDotsContainer.appendChild(dot);
    });
    updateTestimonialSlider();
  };

  const updateTestimonialSlider = () => {
    if (!testimonialSlider || !testimonials || testimonials.length === 0) return;
    testimonialSlider.style.transform = `translateX(-${currentTestimonialIndex * 100}%)`;
    
    document.querySelectorAll('#testimonial-dots .testimonial-dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === currentTestimonialIndex);
    });
  };
  
  const resetTestimonialInterval = () => {
    clearInterval(testimonialInterval);
    testimonialInterval = setInterval(() => {
      currentTestimonialIndex = (currentTestimonialIndex + 1) % testimonials.length;
      updateTestimonialSlider();
    }, 7000); // Increased interval
  };

  if (prevTestimonialBtn) {
    prevTestimonialBtn.addEventListener('click', () => {
      currentTestimonialIndex = (currentTestimonialIndex - 1 + testimonials.length) % testimonials.length;
      updateTestimonialSlider();
      resetTestimonialInterval();
    });
  }

  if (nextTestimonialBtn) {
    nextTestimonialBtn.addEventListener('click', () => {
      currentTestimonialIndex = (currentTestimonialIndex + 1) % testimonials.length;
      updateTestimonialSlider();
      resetTestimonialInterval();
    });
  }

  renderTestimonials();
  if (testimonials && testimonials.length > 1) {
      resetTestimonialInterval();
  }

});


