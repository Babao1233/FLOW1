/**
 * Testimonials module for Yapee ecommerce website
 * Manages testimonial carousel functionality
 */

// Mock testimonials
const testimonials = [
  {
    name: "Nguyen Van A",
    text: "Sản phẩm chất lượng cao và giao hàng siêu nhanh!",
    rating: 5
  },
  {
    name: "Tran Thi B",
    text: "Thiết kế hiện đại, dễ sử dụng và giá cả hợp lý.",
    rating: 4
  },
  {
    name: "Le Van C",
    text: "Hỗ trợ khách hàng tận tâm, sẽ quay lại mua lần sau.",
    rating: 5
  }
];

// Current testimonial index
let currentTestimonial = 0;
let testimonialInterval;

/**
 * Renders current testimonial to the DOM
 */
function renderCurrentTestimonial() {
  const testimonialContainer = document.getElementById('testimonial-container');
  const current = testimonials[currentTestimonial];
  
  // Create rating stars
  let starsHTML = '';
  for (let i = 0; i < 5; i++) {
    starsHTML += `
      <svg 
        class="w-6 h-6 ${i < current.rating ? 'text-yellow-400' : 'text-gray-300'}" 
        fill="currentColor" 
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    `;
  }
  
  // Apply animation by first hiding the content
  testimonialContainer.style.opacity = '0';
  
  // Update the content
  setTimeout(() => {
    testimonialContainer.innerHTML = `
      <div class="mb-4 flex justify-center" aria-label="Đánh giá ${current.rating} sao">
        ${starsHTML}
      </div>
      <p class="text-lg text-center mb-6 italic">"${current.text}"</p>
      <p class="text-center font-semibold">— ${current.name}</p>
    `;
    
    // Fade in the new content
    testimonialContainer.style.opacity = '1';
  }, 300);
}

/**
 * Moves to the next testimonial
 */
function nextTestimonial() {
  currentTestimonial = (currentTestimonial + 1) % testimonials.length;
  renderCurrentTestimonial();
  resetTestimonialInterval();
}

/**
 * Moves to the previous testimonial
 */
function prevTestimonial() {
  currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
  renderCurrentTestimonial();
  resetTestimonialInterval();
}

/**
 * Resets the automatic testimonial rotation interval
 */
function resetTestimonialInterval() {
  clearInterval(testimonialInterval);
  testimonialInterval = setInterval(nextTestimonial, 5000);
}

/**
 * Initializes the testimonial carousel
 */
function initTestimonials() {
  // Render initial testimonial
  renderCurrentTestimonial();
  
  // Set up automatic rotation
  resetTestimonialInterval();
  
  // Set up manual controls
  document.getElementById('next-testimonial').addEventListener('click', nextTestimonial);
  document.getElementById('prev-testimonial').addEventListener('click', prevTestimonial);
  
  // Add event listener for visibility changes to optimize performance
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      clearInterval(testimonialInterval);
    } else {
      resetTestimonialInterval();
    }
  });
}









