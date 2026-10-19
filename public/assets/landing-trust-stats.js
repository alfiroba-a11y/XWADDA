(() => {
  const scamCount = document.getElementById('verified-scam-count');
  const escrowKes = document.getElementById('escrow-kes') || document.getElementById('escrow-amount');
  const escrowUsdt = document.getElementById('escrow-usdt') || document.getElementById('escrow-total');

  // Helper function to generate a random integer between min and max (inclusive)
  const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  // Number formatters
  const formatNumber = (value) =>
    new Intl.NumberFormat('en-KE').format(value);

  const formatUsdt = (value) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  // 1. Fixed scam count set to static 537 people (doesn't update on interval)
  if (scamCount) {
    scamCount.textContent = '537 people';
  }

  // 2. Function to update only KES and USDT amounts
  function updateCurrencies() {
    // Generate random KES amount between 500,000 and 700,000
    const randomKes = getRandomInt(500000, 700000);
    if (escrowKes) {
      escrowKes.textContent = `${formatNumber(randomKes)}k`;
    }

    // Generate random USDT amount between $3,000 and $6,283
    const randomUsdt = getRandomInt(3000, 6283);
    if (escrowUsdt) {
      escrowUsdt.textContent = formatUsdt(randomUsdt);
    }
  }

  // Run initial currency update
  updateCurrencies();

  // Update KES and USDT every 4 minutes (4 minutes * 60 seconds * 1000 milliseconds)
  window.setInterval(updateCurrencies, 4 * 60 * 1000);
})();
