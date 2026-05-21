const themeToggle = document.getElementById('themeToggle');
let isDarkMode = false;

function toggleTheme() {
  isDarkMode = !isDarkMode;
  document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  themeToggle.textContent = isDarkMode ? 'Modo Claro' : 'Modo Oscuro';
  localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}

function loadTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    isDarkMode = true;
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.textContent = 'Modo Claro';
  }
}

themeToggle.addEventListener('click', toggleTheme);
loadTheme();
