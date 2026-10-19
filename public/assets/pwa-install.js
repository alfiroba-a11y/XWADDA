(() => {
  let installPrompt = null;
  const button = document.querySelector('[data-pwa-install]');
  if (!button) return;

  const showStatus = message => {
    let status = document.getElementById('pwa-install-status');
    if (!status) {
      status = document.createElement('div');
      status.id = 'pwa-install-status';
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      Object.assign(status.style, {
        position: 'fixed', bottom: '18px', left: '50%', transform: 'translateX(-50%)',
        zIndex: '10000', maxWidth: 'min(92vw, 520px)', padding: '12px 16px',
        borderRadius: '10px', background: '#17191d', color: '#fff',
        boxShadow: '0 8px 28px #0004', font: '14px/1.45 system-ui,sans-serif'
      });
      document.body.append(status);
    }
    status.textContent = message;
    status.hidden = false;
    clearTimeout(status.hideTimer);
    status.hideTimer = setTimeout(() => { status.hidden = true; }, 8000);
  };

  if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
    button.textContent = 'App installed';
    button.disabled = true;
  }

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
    button.hidden = false;
    button.textContent = 'Install app';
  });

  button.addEventListener('click', async () => {
    if (installPrompt) {
      const prompt = installPrompt;
      installPrompt = null;
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === 'accepted') showStatus('XWADDA is being installed.');
      return;
    }
    showStatus('Direct installation is not available yet. Open XWADDA in Chrome using its secure HTTPS address, keep the page open for about 30 seconds, then refresh. This button will open the install confirmation when Chrome marks the site installable.');
  });

  window.addEventListener('appinstalled', () => {
    button.textContent = 'App installed';
    button.disabled = true;
    showStatus('XWADDA has been installed on this device.');
  });

  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register('/service-worker.js', { scope: '/' }).catch(() => {});
  }
})();
