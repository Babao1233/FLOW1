document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm'); // Using ID for the form
  const messageDiv = document.getElementById('message');

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      messageDiv.textContent = ''; // Clear previous messages
      messageDiv.className = 'mt-4 text-center text-sm'; // Reset class

      const usernameInput = document.getElementById('username');
      const emailInput = document.getElementById('email');
      const passwordInput = document.getElementById('password');

      const username = usernameInput.value.trim();
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();

      if (!username || !email || !password) {
        messageDiv.textContent = 'Vui lòng điền đầy đủ tất cả các trường.';
        messageDiv.classList.add('text-red-500');
        return;
      }

      // Basic email validation
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        messageDiv.textContent = 'Vui lòng nhập địa chỉ email hợp lệ.';
        messageDiv.classList.add('text-red-500');
        return;
      }

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (response.ok) {
          messageDiv.textContent = data.message + ' Đang chuyển hướng đến trang đăng nhập...';
          messageDiv.classList.add('text-green-500');
          
          // Clear form fields
          if(usernameInput) usernameInput.value = '';
          if(emailInput) emailInput.value = '';
          if(passwordInput) passwordInput.value = '';

          setTimeout(() => {
            window.location.href = 'login.html';
          }, 2000);
        } else {
          messageDiv.textContent = 'Lỗi: ' + (data.message || 'Đăng ký không thành công.');
          messageDiv.classList.add('text-red-500');
        }
      } catch (error) {
        console.error('Lỗi đăng ký:', error);
        messageDiv.textContent = 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.';
        messageDiv.classList.add('text-red-500');
      }
    });
  } else {
    console.warn('Register form not found.');
  }
});
