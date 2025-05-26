document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm'); // Using ID for the form
  const messageDiv = document.getElementById('message');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      messageDiv.textContent = ''; // Clear previous messages
      messageDiv.className = 'mt-4 text-center text-sm'; // Reset class

      const usernameInput = document.getElementById('username');
      const passwordInput = document.getElementById('password');
      
      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();

      if (!username || !password) {
        messageDiv.textContent = 'Vui lòng điền tên đăng nhập và mật khẩu.';
        messageDiv.classList.add('text-red-500');
        return;
      }

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
          messageDiv.textContent = data.message + ' Đang chuyển hướng...';
          messageDiv.classList.add('text-green-500');
          
          // Clear form fields
          if(usernameInput) usernameInput.value = '';
          if(passwordInput) passwordInput.value = '';
          
          // Store user info if needed (e.g., in localStorage or a global state)
          // For now, just redirecting.
          // if (data.user) {
          //   localStorage.setItem('currentUser', JSON.stringify(data.user));
          // }

          setTimeout(() => {
            // Redirect to account page or home page based on preference
            window.location.href = 'account.html'; 
          }, 1500);
        } else {
          messageDiv.textContent = 'Lỗi: ' + (data.message || 'Đăng nhập không thành công.');
          messageDiv.classList.add('text-red-500');
        }
      } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        messageDiv.textContent = 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.';
        messageDiv.classList.add('text-red-500');
      }
    });
  } else {
    console.warn('Login form not found.');
  }
});
