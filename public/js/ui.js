const ui = {
    toastTimeout: null,

    showToast: (message, duration = 3000) => {
        const toastElement = document.getElementById('toast');
        if (!toastElement) return;

        toastElement.textContent = message;
        toastElement.classList.remove('opacity-0');
        toastElement.classList.add('opacity-100');

        clearTimeout(ui.toastTimeout);
        ui.toastTimeout = setTimeout(() => {
            toastElement.classList.remove('opacity-100');
            toastElement.classList.add('opacity-0');
        }, duration);
    },

    applyDarkMode: (isDark) => {
        const lightIcon = document.getElementById('lightModeIcon');
        const darkIcon = document.getElementById('darkModeIcon');
        if (isDark) {
            document.documentElement.classList.add('dark');
            if (lightIcon) lightIcon.classList.remove('hidden');
            if (darkIcon) darkIcon.classList.add('hidden');
        } else {
            document.documentElement.classList.remove('dark');
            if (lightIcon) lightIcon.classList.add('hidden');
            if (darkIcon) darkIcon.classList.remove('hidden');
        }
    },

    loadTheme: () => {
        const darkModeSaved = localStorage.getItem('darkMode');
        if (darkModeSaved === 'true') {
            ui.applyDarkMode(true);
        } else {
            ui.applyDarkMode(false);
        }
    },

    initThemeToggle: (buttonId) => {
        const toggleButton = document.getElementById(buttonId);
        if (!toggleButton) return;

        toggleButton.addEventListener('click', () => {
            const isDark = document.documentElement.classList.toggle('dark');
            localStorage.setItem('darkMode', isDark);
            ui.applyDarkMode(isDark);
        });
    },

    renderStarRating: (rating, starSize = 'w-4 h-4') => {
        let starsHTML = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                starsHTML += `<svg class="${starSize} text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>`;
            } else if (i - 0.5 <= rating) {
                starsHTML += `<svg class="${starSize} text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292zM10 12.585l.01-.008-2.304 1.675.44-2.567-1.863-1.816 2.577-.374L10 7.085v5.5z"/></svg>`; // Half star logic (approximation)
            } else {
                starsHTML += `<svg class="${starSize} text-gray-300 dark:text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>`;
            }
        }
        return `<div class="flex items-center">${starsHTML}</div>`;
    }
};

// Make ui object globally accessible
window.ui = ui;







