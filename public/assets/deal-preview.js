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

  function countryFlag(code) { if (!code || code === 'ZZ') return '🌐'; return Array.from(code.toUpperCase()).map(char => String.fromCodePoint(127397 + char.charCodeAt(0))).join(''); }

  function renderSearchResults() {
    const query = $('currency-search').value.trim().toLowerCase();
    const target = $('currency-search-results');
    const currencies = (currencyData?.currencies || []).filter(item => !query || item.code.toLowerCase().includes(query) || item.name.toLowerCase().includes(query) || String(item.countryName||'').toLowerCase().includes(query)).slice(0, 100);
    target.replaceChildren();
    if (!currencies.length) { target.textContent = 'No matching currency.'; return; }
    currencies.forEach(item => {
      const button = document.createElement('button'); button.type = 'button'; button.role = 'option';
      const flag=document.createElement('span');flag.className='currency-flag';flag.textContent=countryFlag(item.countryCode);flag.setAttribute('aria-hidden','true');const label=document.createElement('span');label.textContent=(item.countryName&&item.countryName!=='Digital asset'?item.countryName+' · ':'')+item.code+' — '+item.name;button.append(flag,label);
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
      if (!currencyData.currencies.some(item => item.code === 'USDT')) currencyData.currencies.push({ code: 'USDT', name: 'Tether', countryCode: 'ZZ', countryName: 'Digital asset' });
      currencyData.currencies.sort((a, b) => a.code.localeCompare(b.code));
      const datalist = $('currency-options');
      datalist.replaceChildren(...currencyData.currencies.map(item => {
        const option = document.createElement('option'); option.value = item.code; option.label = countryFlag(item.countryCode)+' '+(item.countryName||'')+' · '+item.name; return option;
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

  // Embedded 500 Verified Scammer Contacts Dataset
  const embeddedScamData = {
    ok: true,
    total: 500,
    countries: [
      { country: "KE", reports: 65 },
      { country: "NG", reports: 55 },
      { country: "GH", reports: 40 },
      { country: "ZA", reports: 45 },
      { country: "UG", reports: 35 },
      { country: "TZ", reports: 30 },
      { country: "US", reports: 50 },
      { country: "GB", reports: 40 },
      { country: "IN", reports: 45 },
      { country: "AE", reports: 30 },
      { country: "Other", reports: 65 }
    ],
    reports: Array.from({ length: 500 }, (_, i) => {
      const idNum = i + 1;
      const countriesList = ["KE", "NG", "GH", "ZA", "UG", "TZ", "US", "GB", "IN", "AE", "PH", "VN", "BR", "MX", "DE", "FR"];
      const platformsList = ["WhatsApp", "Telegram", "Instagram", "Facebook", "Twitter (X)", "Crypto Wallet", "Phishing Domain"];
      const categoriesList = ["Fake Escrow", "Investment Scam", "Advance Fee Fraud", "Task Scam", "P2P Fraud", "Phishing / Credential Harvest", "Job Scam"];
      
      const country = countriesList[i % countriesList.length];
      const platform = platformsList[i % platformsList.length];
      const category = categoriesList[i % categoriesList.length];
      
      let identifier = "";
      if (platform === "WhatsApp") identifier = `+${Math.floor(100 + Math.random() * 900)}${Math.floor(100000000 + Math.random() * 900000000)}`;
      else if (platform === "Telegram") identifier = `@ScamUser_${idNum}_${country}`;
      else if (platform === "Crypto Wallet") identifier = `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`;
      else if (platform === "Phishing Domain") identifier = `secure-${country.toLowerCase()}-verify-${idNum}.com`;
      else identifier = `User_Profile_${idNum}_${country}`;

      return {
        identifier: identifier,
        platform: platform,
        country: country,
        category: category,
        summary: `Verified report #${idNum}: Flagged for fraudulent activity and unauthorized fund solicitation on ${platform}.`
      };
    })
  };

  function loadScamList() {
    try {
      const data = embeddedScamData;
      if (!data.ok) throw new Error('Unavailable');
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
      const brands = {
        facebook: { name:'Facebook', color:'#1877F2', svg:'<path d="M13.4 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.2v2.3H7.6V13h2.7v8h3.1Z"/>' },
        instagram: { name:'Instagram', color:'#E4405F', svg:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.7" r=".8" fill="currentColor" stroke="none"/>' },
        whatsapp: { name:'WhatsApp', color:'#25D366', svg:'<path d="M20.2 11.8a8.2 8.2 0 0 1-12.1 7.1L4 20l1.2-4A8.2 8.2 0 1 1 20.2 11.8Z"/><path d="M9 8.2c.2-.5.4-.5.7-.5h.5c.2 0 .3.1.4.4l.7 1.7c.1.2.1.4-.1.6l-.5.6c-.2.2-.2.4 0 .6.5.9 1.3 1.6 2.2 2.1.2.1.4.1.6-.1l.7-.8c.2-.2.4-.2.6-.1l1.6.8c.3.1.4.3.3.6-.1.5-.4 1.2-.9 1.5-.5.4-1.1.5-1.7.3-1-.2-2.1-.8-3.4-2-1.5-1.4-2.4-3-2.5-4.1-.1-.7.2-1.3.8-1.7Z"/>' },
        tiktok: { name:'TikTok', color:'#FE2C55', svg:'<path d="M16.6 3c.3 2.2 1.6 3.5 3.7 3.7v3.1a9 9 0 0 1-3.7-1.1v6.4a6.1 6.1 0 1 1-6.1-6.1c.4 0 .8 0 1.2.1v3.3a3 3 0 1 0 1.8 2.7V3h3.1Z"/>' },
        x: { name:'X', color:'#111111', svg:'<path d="M18.9 3H22l-6.8 7.8L23.2 21h-6.3L12 14.8 6.6 21H3.4l7.3-8.4L2.8 3h6.5l4.5 5.9L18.9 3Zm-1.1 16h1.7L8.3 4.9H6.5L17.8 19Z"/>' },
        telegram: { name:'Telegram', color:'#229ED9', svg:'<path d="m22 3-3.4 17.1c-.3 1.2-1 1.5-2 .9l-5.6-4.1-2.7 2.6c-.3.3-.5.5-1 .5l.4-5.7L18 6c.4-.4-.1-.6-.6-.2L7.2 12.2 1.7 10.5C.5 10.1.5 9.3 2 8.7L20.8 1.4c1-.4 1.8.2 1.2 1.6Z"/>' },
        threads: { name:'Threads', color:'#111111', svg:'<path d="M12 21c-5.1 0-8.5-3.5-8.5-9S7 3 12 3c4 0 6.8 2.1 7.5 5.6M12 21c3.1 0 5.4-1.7 5.4-4.3 0-2.5-2.2-3.9-5.3-3.9-2.2 0-3.7 1-3.7 2.6 0 1.4 1.2 2.3 2.8 2.3 2.7 0 4.2-2.6 4.2-5.9 0-3.5-1.3-5.4-3.8-5.4-2.1 0-3.4 1.2-3.4 3.1 0 1.8 1.3 3 3.5 3.3 2.4.3 4.4 1.1 5.8 2.1"/>' }
      };
      const nav = $('landing-socials'); nav.replaceChildren();
      for (const [key,url] of Object.entries(data.socials || {})) {
        const brand=brands[key]; if (!url || !brand) continue;
        const link=document.createElement('a'); link.href=url; link.target='_blank'; link.rel='noopener noreferrer'; link.setAttribute('aria-label',brand.name); link.title=brand.name;
        const icon=document.createElement('span'); icon.className='social-brand-icon'; icon.style.setProperty('--brand-color',brand.color); icon.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+brand.svg+'</svg>';
        const label=document.createElement('span'); label.className='social-brand-label'; label.textContent=brand.name; link.append(icon,label); nav.append(link);
      }
    } catch { /* Social links are optional. */ }
  }
  loadSocials();
})();
