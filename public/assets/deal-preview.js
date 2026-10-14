(() => {
  const form = document.getElementById('deal-preview');
  if (!form) return;
  const currency = document.getElementById('preview-currency');
  const amount = document.getElementById('preview-amount');
  const phoneWrap = document.getElementById('preview-phone-wrap');
  const title = document.getElementById('preview-title');
  const start = document.getElementById('preview-start');
  const methods = [...form.querySelectorAll('[data-method]')];
  let method = 'mpesa';
  const fmt = (n, c) => `${c} ${(n / 100).toLocaleString('en-KE', { minimumFractionDigits: c === 'KES' ? 0 : 2, maximumFractionDigits: 2 })}`;
  const feeFor = (c, principal) => c === 'KES'
    ? Math.round((Math.min(principal, 1000000) * .03 + Math.max(0, Math.min(principal - 1000000, 9000000)) * .02 + Math.max(0, principal - 10000000) * .01) / 100) * 100
    : Math.round(Math.min(principal, 10000) * .025 + Math.max(0, Math.min(principal - 10000, 90000)) * .015 + Math.max(0, principal - 100000) * .01);
  function update() {
    const c = currency.value;
    const principal = Math.max(0, Math.round((Number(amount.value) || 0) * 100));
    const fee = principal ? feeFor(c, principal) : 0;
    const total = principal + fee;
    if (c === 'USDT' && method === 'mpesa') method = 'trc20';
    if (c === 'KES' && method !== 'mpesa') method = 'mpesa';
    document.getElementById('preview-principal').textContent = fmt(principal, c);
    document.getElementById('preview-fee').textContent = fmt(fee, c);
    document.getElementById('preview-total').textContent = fmt(total, c);
    document.getElementById('preview-total-row').textContent = fmt(total, c);
    phoneWrap.hidden = !(c === 'KES' && method === 'mpesa');
    methods.forEach(button => {
      const unavailable = button.dataset.method === 'mpesa' && c !== 'KES';
      button.hidden = unavailable;
      button.classList.toggle('active', button.dataset.method === method);
      button.setAttribute('aria-pressed', String(button.dataset.method === method));
    });
    start.href = '/signup';
  }
  methods.forEach(button => button.addEventListener('click', () => { method = button.dataset.method; update(); }));
  [currency, amount, title].forEach(input => input.addEventListener('input', update));
  [currency, amount].forEach(input => input.addEventListener('change', update));
  start.addEventListener('click', () => {
    try {
      sessionStorage.setItem('xwaddaDealPreview', JSON.stringify({
        title: title.value.trim(), amount: amount.value, currency: currency.value, savedAt: Date.now()
      }));
    } catch { /* Continue to account creation even when browser storage is unavailable. */ }
  });
  form.addEventListener('submit', event => event.preventDefault());
  update();
})();
