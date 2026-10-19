(() => {
  const scamCount = document.getElementById('verified-scam-count');
  const usdtTotal = document.getElementById('usdt-total') || document.getElementById('escrow-total');

  // Helper function to generate a random integer between min and max (inclusive)
  const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  // Currency formatter for Tether (USDT) in USD format
  const formatUsdt = (value) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  // 1. Static Scam Count (Set directly to 500, no fetching or interval)
  if (scamCount) {
    scamCount.textContent = '500';
  }

  // 2. Function to update Tether (USDT) amount dynamically
  function refreshUsdt() {
    if (!usdtTotal) return;
    
    // Generate random dollar/USDT amount between $3,000 and $6,283
    const randomUsdt = getRandomInt(3000, 6283);
    usdtTotal.textContent = formatUsdt(randomUsdt);
  }

  // Run USDT update immediately
  refreshUsdt();

  // Update USDT every 4 minutes (4 * 60 * 1000 ms)
  window.setInterval(refreshUsdt, 4 * 60 * 1000);
})();
