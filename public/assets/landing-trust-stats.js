(() => {
  // Target elements based on your UI structure
  const scamCount = document.getElementById('verified-scam-count');
  const kesElement = document.getElementById('escrow-kes') || document.getElementById('kes-balance');
  const usdtElement = document.getElementById('escrow-usdt') || document.getElementById('usdt-balance');

  // Helper function to get random integer inclusive
  const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  // Formatter for KES (e.g. 500,020)
  const formatKES = (val) => new Intl.NumberFormat('en-KE').format(val);

  // Formatter for USDT (e.g. 3,450 USDT or $3,450)
  const formatUSDT = (val) => `${new Intl.NumberFormat('en-US').format(val)} USDT`;

  // 1. Static Scam Watch Value (Set once, never changes)
  if (scamCount) {
    scamCount.textContent = '500'; 
    // If your subtext says "reviewed reports", 500 looks clean. 
    // Change to '500 people' if you prefer.
  }

  // 2. Dynamic updates for KES and USDT
  function updateBalances() {
    // Random KES between 500,000 and 700,000
    if (kesElement) {
      const randomKes = getRandomInt(500000, 700000);
      kesElement.textContent = formatKES(randomKes); // e.g. "500,020"
    }

    // Random USDT between 3,000 and 6,283
    if (usdtElement) {
      const randomUsdt = getRandomInt(3000, 6283);
      usdtElement.textContent = formatUSDT(randomUsdt); // e.g. "4,250 USDT"
    }
  }

  // Run immediately on page load
  updateBalances();

  // Refresh KES & USDT every 4 minutes (4 * 60 * 1000 ms)
  window.setInterval(updateBalances, 4 * 60 * 1000);
})();
