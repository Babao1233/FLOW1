/**
 * Dark mode module for Yapee ecommerce website
 * Manages dark mode preferences and UI updates
 */

// State
let darkMode = false;

/**
 * Toggle dark mode state and update UI
 */
function toggleDarkMode() {
  darkMode = !darkMode;
  updateDarkModeUI();
  saveDarkModePreference();
}

/**
 * Update UI elements based on dark mode state
 */
function updateDarkModeUI() {
  // Update root element class
  if (darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  // Update icon visibility
  const darkModeIcon = document.getElementById('darkModeIcon');
  const lightModeIcon = document.getElementById('lightModeIcon');
  
  if (darkMode) {
    darkModeIcon.classList.add('hidden');
    lightModeIcon.classList.remove('hidden');
  } else {
    darkModeIcon.classList.remove('hidden');
    lightModeIcon.classList.add('hidden');
  }
}

/**
 * Save dark mode preference to localStorage
 */
function saveDarkModePreference() {
  try {
    localStorage.setItem('yapeeDarkMode', darkMode ? 'true' : 'false');
  } catch (error) {
    console.error('Error saving dark mode preference:', error);
  }
}

/**
 * Load dark mode preference from localStorage
 */
function loadDarkModePreference() {
  try {
    const savedPreference = localStorage.getItem('yapeeDarkMode');
    if (savedPreference !== null) {
      darkMode = savedPreference === 'true';
      updateDarkModeUI();
    } else {
      // If no preference is saved, check system preference
      checkSystemDarkModePreference();
    }
  } catch (error) {
    console.error('Error loading dark mode preference:', error);
  }
}

/**
 * Check system dark mode preference
 */
function checkSystemDarkModePreference() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    darkMode = true;
    updateDarkModeUI();
  }
}

/**
 * Initialize dark mode functionality
 */
function initDarkMode() {
  // Load saved preference
  loadDarkModePreference();
  
  // Set up toggle button
  document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
  
  // Listen for system preference changes
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      const systemPrefersDark = e.matches;
      // Only update if user hasn't explicitly set a preference
      if (localStorage.getItem('yapeeDarkMode') === null) {
        darkMode = systemPrefersDark;
        updateDarkModeUI();
      }
    });
  }
}









