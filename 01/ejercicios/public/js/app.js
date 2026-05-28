document.addEventListener('DOMContentLoaded', function() {
  const themeToggle = document.getElementById('themeToggle');
  let isDarkMode = false;

  function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    if (themeToggle) {
      themeToggle.textContent = isDarkMode ? 'Modo Claro' : 'Modo Oscuro';
    }
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }

  function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      isDarkMode = true;
      document.documentElement.setAttribute('data-theme', 'dark');
      if (themeToggle) {
        themeToggle.textContent = 'Modo Claro';
      }
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  loadTheme();
});
