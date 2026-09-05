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

// Multi-phrase typing animation — cycles through role/tagline strings
(function () {
  const typedEl = document.getElementById('typed-text');
  if (!typedEl) return;

  const phrases = [
    'Pre-Engineering Student',
    'AI & Computer Science Enthusiast',
    'NGO Volunteer',
    'Builder of School Projects'
  ];

  // Respect reduced-motion preference: show the first phrase, skip animating
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    typedEl.textContent = phrases[0];
    return;
  }

  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function tick() {
    const current = phrases[phraseIndex];

    if (!deleting) {
      charIndex++;
      typedEl.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(tick, 1400); // pause on the full phrase
        return;
      }
    } else {
      charIndex--;
      typedEl.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
    }

    setTimeout(tick, deleting ? 40 : 70);
  }

  tick();
})();