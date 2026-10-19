(() => {
  const kes = document.getElementById('secured-kes');
  const usdt = document.getElementById('secured-usdt');
  const scamCount = document.getElementById('verified-scam-count');
  if (!kes || !usdt || !scamCount) return;

  const format = (value, maximumFractionDigits = 0) =>
    new Intl.NumberFormat('en-KE', { maximumFractionDigits }).format(value);

  async function refresh() {
    try {
      const response = await fetch('/api/public/escrow-totals', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error('Stats unavailable');
      kes.textContent = `KES ${format(data.secured.KES.amount)}`;
      usdt.textContent = `${format(data.secured.USDT.amount, 2)} USDT`;
      scamCount.textContent = format(data.verifiedScamReports);
    } catch {
      kes.textContent = 'Unavailable';
      usdt.textContent = 'Unavailable';
      scamCount.textContent = 'Unavailable';
    }
  }

  refresh();
  window.setInterval(refresh, 30 * 60 * 1000);
})();
