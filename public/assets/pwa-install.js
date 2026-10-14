(() => {
  let installPrompt = null;
  const button = document.querySelector('[data-pwa-install]');
  if (!button) return;

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
    button.hidden = false;
    button.textContent = 'Install app';
  });

  button.addEventListener('click', async () => {
    if (installPrompt) {
      installPrompt.prompt();
      await installPrompt.userChoice;
      installPrompt = null;
      return;
    }
    alert('To add XWADDA to your phone, open the browser menu and choose “Add to Home Screen” or “Install app”.');
  });

  window.addEventListener('appinstalled', () => {
    button.textContent = 'App installed';
    button.disabled = true;
  });

  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register('/service-worker.js', { scope: '/' }).catch(() => {});
  }
})();
