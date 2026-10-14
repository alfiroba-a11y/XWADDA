(() => {
  const form = document.querySelector('form[action="/deals"]');
  if (!form) return;
  const amount = form.elements.amount;
  const currency = form.elements.currency;
  const output = form.querySelector('[data-fee-preview]');
  const feeFor = (code, principal) => code === 'KES'
    ? Math.round((Math.min(principal, 1000000) * .03 + Math.max(0, Math.min(principal - 1000000, 9000000)) * .02 + Math.max(0, principal - 10000000) * .01) / 100) * 100
    : Math.round(Math.min(principal, 10000) * .025 + Math.max(0, Math.min(principal - 10000, 90000)) * .015 + Math.max(0, principal - 100000) * .01);
  const fmt = (value, code) => `${code} ${(value / 100).toLocaleString('en-KE', { minimumFractionDigits: code === 'KES' ? 0 : 2, maximumFractionDigits: 2 })}`;
  try {
    const draft = JSON.parse(sessionStorage.getItem('xwaddaDealPreview') || 'null');
    if (draft && Date.now() - Number(draft.savedAt) < 30 * 60 * 1000) {
      if (['KES','USDT'].includes(draft.currency)) currency.value = draft.currency;
      if (/^\d+(?:\.\d{1,2})?$/.test(String(draft.amount || ''))) amount.value = draft.amount;
      if (draft.title) form.elements.title.value = String(draft.title).slice(0, 160);
      sessionStorage.removeItem('xwaddaDealPreview');
      const dialog = form.closest('dialog');
      if (dialog && !dialog.open) dialog.showModal();
    } else if (draft) sessionStorage.removeItem('xwaddaDealPreview');
  } catch { /* The deal form remains available when browser storage is unavailable. */ }
  const update = () => {
    const principal = Math.round((Number.parseFloat(amount.value) || 0) * 100);
    if (!principal || principal < 0) { output.textContent = 'Escrow fee and buyer total will update here.'; return; }
    const fee = feeFor(currency.value, principal);
    output.textContent = `Escrow fee: ${fmt(fee, currency.value)} · Buyer total: ${fmt(principal + fee, currency.value)}`;
  };
  amount.addEventListener('input', update);
  currency.addEventListener('change', update);
  update();
})();
