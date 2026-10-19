(() => {
  const open = () => document.body.classList.add('nav-open');
  const close = () => document.body.classList.remove('nav-open');
  document.querySelector('[data-menu-toggle]')?.addEventListener('click', open);
  document.querySelectorAll('[data-menu-close]').forEach(button => button.addEventListener('click', close));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
  document.querySelectorAll('.app-sidebar .sidebar-link').forEach(button => button.addEventListener('click', () => {
    if (button.getAttribute('onclick')?.includes("location.href='#")) close();
  }));
  document.querySelectorAll('[data-open-dialog]').forEach(button => button.addEventListener('click', () => {
    close();
    const dialog = document.getElementById(button.dataset.openDialog);
    if (dialog && !dialog.open) dialog.showModal();
  }));
  document.querySelectorAll('[data-dialog-back]').forEach(button => button.addEventListener('click', () => button.closest('dialog')?.close()));
  document.querySelectorAll('.portal-dialog').forEach(dialog => dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  }));
})();
