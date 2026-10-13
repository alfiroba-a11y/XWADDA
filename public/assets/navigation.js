(() => {
  const open = () => document.body.classList.add('nav-open');
  const close = () => document.body.classList.remove('nav-open');
  document.querySelector('[data-menu-toggle]')?.addEventListener('click', open);
  document.querySelector('[data-menu-close]')?.addEventListener('click', close);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
  document.querySelectorAll('.app-sidebar .sidebar-link').forEach(button => button.addEventListener('click', () => {
    if (button.getAttribute('onclick')?.includes("location.href='#")) close();
  }));
})();
