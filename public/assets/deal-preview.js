(()=>{
  const $ = id => document.getElementById(id);
  let currencyData = null;
  let usdtKes = null;
  let quoteLabel = '';

  function formatMoney(value, code) {
    const digits = ['JPY','KRW','VND','CLP','XAF','XOF','ISK'].includes(code) ? 0 : 2;
    try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: code, maximumFractionDigits: digits }).format(value); }
    catch { return Number(value).toFixed(digits) + ' ' + code; }
  }

  function updateConverter() {
    const amount = Number($('converter-amount').value) || 0;
    const from = $('converter-from').value.trim().toUpperCase();
    const to = $('converter-to').value.trim().toUpperCase();
    if (!currencyData) { $('converter-result').textContent = 'Loading current reference rates…'; return; }
    const fromRate = Number(currencyData.rates[from]), toRate = Number(currencyData.rates[to]);
    if (!fromRate || !toRate) { $('converter-result').textContent = 'Choose a supported currency from the list.'; return; }
    $('converter-result').textContent = formatMoney((amount / fromRate) * toRate, to);
    $('converter-source').textContent = quoteLabel + ' · Rates are reference estimates and may differ from transaction prices.';
  }

  function renderSearchResults() {
    const query = $('currency-search').value.trim().toLowerCase();
    const target = $('currency-search-results');
    const currencies = (currencyData?.currencies || []).filter(item => !query || item.code.toLowerCase().includes(query) || item.name.toLowerCase().includes(query)).slice(0, 60);
    target.replaceChildren();
    if (!currencies.length) { target.textContent = 'No matching currency.'; return; }
    currencies.forEach(item => {
      const button = document.createElement('button'); button.type = 'button'; button.role = 'option';
      button.textContent = item.code + ' — ' + item.name;
      button.addEventListener('click', () => {
        const input = $('converter-' + $('currency-search-target').value);
        input.value = item.code;
        $('currency-search-panel').hidden = true;
        $('currency-search-toggle').setAttribute('aria-expanded', 'false');
        updateConverter();
      });
      target.append(button);
    });
  }

  async function loadCurrencies() {
    try {
      const [currenciesResponse, usdtResponse] = await Promise.all([
        fetch('/api/public/currencies', { cache: 'no-store' }).then(response => response.json()),
        fetch('/api/public/market-quotes', { cache: 'no-store' }).then(response => response.json()).catch(() => null)
      ]);
      if (!currenciesResponse.ok) throw new Error(currenciesResponse.error);
      currencyData = currenciesResponse;
      const mid = usdtResponse?.ok ? Number(usdtResponse.mid) : null;
      if (mid > 0 && currencyData.rates.KES > 0) {
        currencyData.rates.USDT = mid / currencyData.rates.KES;
        usdtKes = mid;
      }
      if (!currencyData.currencies.some(item => item.code === 'USDT')) currencyData.currencies.push({ code: 'USDT', name: 'Tether' });
      currencyData.currencies.sort((a, b) => a.code.localeCompare(b.code));
      const datalist = $('currency-options');
      datalist.replaceChildren(...currencyData.currencies.map(item => {
        const option = document.createElement('option'); option.value = item.code; option.label = item.name; return option;
      }));
      quoteLabel = (currencyData.source || 'Global currency reference') + (currencyData.asOf ? ' · Updated ' + currencyData.asOf : '') + (usdtKes ? ' · USDT/KES ' + usdtKes.toFixed(2) + (currencyData.marketAsOf ? ' (' + currencyData.marketAsOf + ')' : '') : '');
      updateConverter();
      renderSearchResults();
    } catch (error) {
      $('converter-result').textContent = error.message || 'Currency rates are temporarily unavailable.';
      $('converter-source').textContent = 'Please try again later.';
    }
  }

  async function calculateFee() {
    const amount = Number($('fee-amount').value) || 0;
    const currency = $('fee-currency').value;
    const payer = $('fee-payer').value;
    const output = $('fee-result');
    if (amount <= 0) { output.textContent = 'Your fee estimate will appear here.'; return; }
    output.textContent = 'Calculating…';
    try {
      const url = new URL('/api/public/fee-quote', location.origin);
      url.searchParams.set('amount', String(amount)); url.searchParams.set('currency', currency); url.searchParams.set('payer', payer);
      const response = await fetch(url, { cache: 'no-store' }); const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error);
      const rows = [
        ['Escrow fee', formatMoney(data.fee, currency)],
        ['Buyer pays', formatMoney(data.buyerPays, currency)],
        ['Seller pays', formatMoney(data.sellerPays, currency)],
        ['Buyer total', formatMoney(data.buyerTotal, currency)],
        ['Seller receives', formatMoney(data.sellerReceives, currency)]
      ];
      output.replaceChildren(...rows.map(([label, value]) => {
        const row = document.createElement('span'); row.className = 'fee-result-row';
        const name = document.createElement('span'); name.textContent = label;
        const amount = document.createElement('b'); amount.textContent = value;
        row.append(name, amount); return row;
      }));
    } catch (error) { output.textContent = error.message || 'Fee estimate unavailable.'; }
  }

  ['converter-amount','converter-from','converter-to'].forEach(id => $(id).addEventListener('input', updateConverter));
  $('currency-search-toggle').addEventListener('click', () => {
    const panel = $('currency-search-panel'); panel.hidden = !panel.hidden;
    $('currency-search-toggle').setAttribute('aria-expanded', String(!panel.hidden));
    if (!panel.hidden) { renderSearchResults(); $('currency-search').focus(); }
  });
  $('currency-search').addEventListener('input', renderSearchResults);
  ['fee-amount','fee-currency','fee-payer'].forEach(id => $(id).addEventListener('input', calculateFee));
  ['fee-currency','fee-payer'].forEach(id => $(id).addEventListener('change', calculateFee));
  loadCurrencies(); setInterval(loadCurrencies, 30 * 60 * 1000);

  async function loadScamList() {
    try {
      const response = await fetch('/api/public/scam-list', { cache: 'no-store' }); const data = await response.json();
      if (!response.ok || !data.ok) throw new Error('Unavailable');
      $('scam-report-total').textContent = data.total.toLocaleString('en-KE');
      $('scam-country-total').textContent = data.countries.length.toLocaleString('en-KE');
      const countries = $('scam-country-list'); countries.replaceChildren();
      if (!data.countries.length) { const empty = document.createElement('p'); empty.textContent = 'No substantiated reports to display.'; countries.append(empty); }
      else data.countries.forEach(item => {
        const row = document.createElement('div'); row.className = 'scam-country-row'; const name = document.createElement('span');
        name.textContent = item.country && /^[A-Z]{2}$/.test(item.country) ? (new Intl.DisplayNames(['en'], { type: 'region' }).of(item.country) || item.country) : (item.country || 'Other');
        const count = document.createElement('b'); count.textContent = item.reports + ' reviewed ' + (item.reports === 1 ? 'report' : 'reports'); row.append(name, count); countries.append(row);
      });
      const reports = $('scam-report-list'); reports.replaceChildren();
      data.reports.forEach(item => {
        const card = document.createElement('article'); card.className = 'scam-report-card'; const head = document.createElement('div'); head.className = 'scam-report-head';
        const ident = document.createElement('b'); ident.textContent = item.identifier; const type = document.createElement('span'); type.textContent = item.platform + ' · ' + (item.country || 'Other'); head.append(ident, type);
        const summary = document.createElement('p'); summary.textContent = item.summary; const category = document.createElement('small'); category.textContent = item.category; card.append(head, summary, category); reports.append(card);
      });
    } catch { $('scam-report-total').textContent = '—'; $('scam-country-total').textContent = '—'; $('scam-country-list').textContent = 'Reviewed reports are temporarily unavailable.'; }
  }
  loadScamList();
  async function loadSocials() {
    try {
      const response = await fetch('/api/public/site-details', { cache: 'no-store' }); const data = await response.json(); if (!response.ok || !data.ok) return;
      const labels = { facebook:['f','Facebook'], instagram:['◎','Instagram'], whatsapp:['◉','WhatsApp'], tiktok:['♪','TikTok'], x:['𝕏','X'], telegram:['➤','Telegram'], threads:['@','Threads'] }, nav = $('landing-socials'); nav.replaceChildren();
      for (const [key,url] of Object.entries(data.socials || {})) { if (!url || !labels[key]) continue; const link=document.createElement('a'); link.href=url; link.target='_blank'; link.rel='noopener noreferrer'; link.setAttribute('aria-label',labels[key][1]); const sign=document.createElement('span'); sign.textContent=labels[key][0]; sign.setAttribute('aria-hidden','true'); link.append(sign,document.createTextNode(labels[key][1])); nav.append(link); }
    } catch { /* Social links are optional. */ }
  }
  loadSocials();
})();
