// Dark mode toggle — remembers the visitor's choice in localStorage
(function () {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;

  function isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  function updateButton() {
    const dark = isDark();
    toggleBtn.textContent = dark ? '☀️' : '🌙';
    toggleBtn.setAttribute('aria-pressed', String(dark));
    toggleBtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  // Set the correct icon on load (theme itself was already applied by the
  // inline script in <head>, before the page painted, to avoid a flash).
  updateButton();

  toggleBtn.addEventListener('click', function () {
    if (isDark()) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }
    updateButton();
  });
})();