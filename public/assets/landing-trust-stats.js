(() => {
  const scamCount = document.getElementById('verified-scam-count');
  const escrowTotal = document.getElementById('escrow-amount') || document.getElementById('escrow-total');

  // Helper function to generate a random integer between min and max (inclusive)
  const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  // Number formatters
  const formatNumber = (value) =>
    new Intl.NumberFormat('en-KE').format(value);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  function updateStats() {
    // 1. Generate random scam count between 5000 and 7600 (with 'XW' suffix if desired)
    const randomScamCount = getRandomInt(5000, 7600);
    if (scamCount) {
      scamCount.textContent = `${formatNumber(randomScamCount)}k`;
    }

    // 2. Generate random dollar amount between $3,000 and $6,283
    const randomDollarAmount = getRandomInt(3000, 6283);
    if (escrowTotal) {
      escrowTotal.textContent = formatCurrency(randomDollarAmount);
    }
  }

  // Run immediately on load
  updateStats();

  // Update every 4 minutes (4 minutes * 60 seconds * 1000 milliseconds)
  window.setInterval(updateStats, 4 * 60 * 1000);
})();
