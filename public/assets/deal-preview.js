(()=>{
  const $ = id => document.getElementById(id);
  const currencyAmount = (value, currency) => currency === 'KES'
    ? 'KES ' + Math.round(value).toLocaleString('en-KE')
    : '$' + Number(value).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' USDT';
  let quote = null;

  async function loadQuote() {
    try {
      const response = await fetch('/api/public/market-quotes', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error);
      quote = data;
      $('converter-source').textContent = 'Reference rate ' + data.mid.toFixed(2) + ' KES per USDT · ' + data.source;
      convert();
      calcFee();
    } catch {
      $('converter-result').textContent = 'Live conversion rate unavailable. Try again shortly.';
      $('converter-source').textContent = 'Rates are retrieved from current market data.';
    }
  }

  function convert() {
    const amount = Number($('converter-amount').value) || 0;
    const from = $('converter-from').value;
    const to = $('converter-to').value;
    if (!quote) { $('converter-result').textContent = 'Loading current rate…'; return; }
    const value = from === to ? amount : from === 'KES' ? amount / quote.mid : amount * quote.mid;
    $('converter-result').textContent = currencyAmount(value, to);
  }

  async function calcFee() {
    const amount = Number($('fee-amount').value) || 0;
    const currency = $('fee-currency').value;
    const payer = $('fee-payer').value;
    if (amount <= 0) { $('fee-result').textContent = 'Enter an amount to calculate the fee.'; return; }
    try {
      const url = new URL('/api/public/fee-quote', location.origin);
      url.searchParams.set('amount', String(amount));
      url.searchParams.set('currency', currency);
      url.searchParams.set('payer', payer);
      const response = await fetch(url, { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error);
      $('fee-result').textContent = 'Fee ' + currencyAmount(data.fee, currency) + ' · Buyer pays ' + currencyAmount(data.buyerPays, currency) + ' · Seller pays ' + currencyAmount(data.sellerPays, currency) + ' · Buyer total ' + currencyAmount(data.buyerTotal, currency) + ' · Seller receives ' + currencyAmount(data.sellerReceives, currency);
      $('fee-source').textContent = currency === 'USDT' ? 'KES tier applied using live rate ' + data.rate.toFixed(2) + ' KES per USDT.' : 'KES fee bands continue in the same schedule through KES 500,000.';
      const bandList = $('fee-band-list');
      if (data.bands && bandList) {
        bandList.replaceChildren(...data.bands.map(band => {
          const row = document.createElement('div'); row.className = 'fee-band-row';
          const range = document.createElement('span'); range.textContent = 'KES ' + band.min.toLocaleString('en-KE') + '–' + band.max.toLocaleString('en-KE');
          const fee = document.createElement('b'); fee.textContent = 'KES ' + band.fee.toLocaleString('en-KE');
          row.append(range, fee); return row;
        }));
      }
    } catch (error) { $('fee-result').textContent = error.message || 'Fee estimate unavailable.'; }
  }

  $('converter-amount').addEventListener('input', convert);
  $('converter-from').addEventListener('change', convert);
  $('converter-to').addEventListener('change', convert);
  ['fee-amount', 'fee-currency', 'fee-payer'].forEach(id => $(id).addEventListener('input', calcFee));
  ['fee-currency', 'fee-payer'].forEach(id => $(id).addEventListener('change', calcFee));
  loadQuote();
  setInterval(loadQuote, 60000);

  async function loadScamList() {
    try {
      const response = await fetch('/api/public/scam-list', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error('Unavailable');
      $('scam-report-total').textContent = data.total.toLocaleString('en-KE');
      $('scam-country-total').textContent = data.countries.length.toLocaleString('en-KE');
      const countries = $('scam-country-list'); countries.replaceChildren();
      if (!data.countries.length) {
        const empty = document.createElement('p'); empty.textContent = 'No substantiated reports to display.'; countries.append(empty);
      } else data.countries.forEach(item => {
        const row = document.createElement('div'); row.className = 'scam-country-row';
        const name = document.createElement('span');
        name.textContent = item.country && /^[A-Z]{2}$/.test(item.country) ? (new Intl.DisplayNames(['en'], { type: 'region' }).of(item.country) || item.country) : (item.country || 'Other');
        const count = document.createElement('b'); count.textContent = item.reports + ' reviewed ' + (item.reports === 1 ? 'report' : 'reports');
        row.append(name, count); countries.append(row);
      });
      const reports = $('scam-report-list'); reports.replaceChildren();
      data.reports.forEach(item => {
        const card = document.createElement('article'); card.className = 'scam-report-card';
        const head = document.createElement('div'); head.className = 'scam-report-head';
        const ident = document.createElement('b'); ident.textContent = item.identifier;
        const type = document.createElement('span'); type.textContent = item.platform + ' · ' + (item.country || 'Other');
        head.append(ident, type);
        const summary = document.createElement('p'); summary.textContent = item.summary;
        const category = document.createElement('small'); category.textContent = item.category;
        card.append(head, summary, category); reports.append(card);
      });
    } catch {
      $('scam-report-total').textContent = '—'; $('scam-country-total').textContent = '—';
      $('scam-country-list').textContent = 'Reviewed reports are temporarily unavailable.';
    }
  }
  loadScamList();

  async function loadSocials() {
    try {
      const response = await fetch('/api/public/site-details', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data.ok) return;
      const labels = { facebook: ['f', 'Facebook'], instagram: ['◎', 'Instagram'], whatsapp: ['◉', 'WhatsApp'], tiktok: ['♪', 'TikTok'], x: ['𝕏', 'X'], telegram: ['➤', 'Telegram'], threads: ['@', 'Threads'] };
      const nav = $('landing-socials'); nav.replaceChildren();
      for (const [key, url] of Object.entries(data.socials || {})) {
        if (!url || !labels[key]) continue;
        const link = document.createElement('a'); link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer';
        link.setAttribute('aria-label', labels[key][1]);
        const sign = document.createElement('span'); sign.textContent = labels[key][0]; sign.setAttribute('aria-hidden', 'true');
        link.append(sign, document.createTextNode(labels[key][1])); nav.append(link);
      }
    } catch { /* Social links are optional on the public landing page. */ }
  }
  loadSocials();
})();
