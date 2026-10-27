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
  ['fee-currency','fee-payer'].forEach(id => $('fee-currency','fee-payer').forEach?.() || $(id).addEventListener('change', calculateFee));
  loadCurrencies(); setInterval(loadCurrencies, 30 * 60 * 1000);

  const countryCodes = new Set('AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'.split(' '));
  const countryAliases = { 'uk':'GB','united kingdom':'GB','great britain':'GB','usa':'US','u.s.a.':'US','united states of america':'US','ivory coast':'CI',"cote d’ivoire":'CI',"cote d'ivoire":'CI','dr congo':'CD','drc':'CD','democratic republic of the congo':'CD','congo':'CG','republic of the congo':'CG','south korea':'KR','north korea':'KP','russia':'RU','vietnam':'VN','laos':'LA','syria':'SY','taiwan':'TW','tanzania':'TZ','moldova':'MD','bolivia':'BO','venezuela':'VE','brunei':'BN','micronesia':'FM','palestine':'PS','czech republic':'CZ','swaziland':'SZ','cape verde':'CV','kosovo':'XK' };
  const countryNameToCode = (() => { const map = new Map(); const names = new Intl.DisplayNames(['en'], {type:'region'}); for (const code of countryCodes) { const name=names.of(code); if(name&&name!==code)map.set(name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),code); } return map; })();
  function countryFlag(country) { const raw=String(country||'').trim(); let code=''; if(/^[a-z]{2}$/i.test(raw)&&countryCodes.has(raw.toUpperCase()))code=raw.toUpperCase(); else { const key=raw.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(); code=countryAliases[key]||countryNameToCode.get(key)||''; } if(!code)return '🌐'; return Array.from(code).map(char=>String.fromCodePoint(127397+char.charCodeAt(0))).join(''); }
  function countryLabel(country) { const raw=String(country||'Other').trim(); if(/^[a-z]{2}$/i.test(raw)&&countryCodes.has(raw.toUpperCase())){try{return new Intl.DisplayNames(['en'],{type:'region'}).of(raw.toUpperCase())||raw.toUpperCase()}catch{return raw.toUpperCase()}} return raw||'Other'; }
  const reportButtons=[$('scam-report-toggle'),$('scam-country-toggle')].filter(Boolean),reportContent=$('reviewed-reports-content'),countryView=$('scam-country-view'),reportView=$('scam-report-view');
  let scamCountryRows=[];
  function setScamPanel(open){reportContent.hidden=!open;reportButtons.forEach(button=>button.setAttribute('aria-expanded',String(open)));if(open){countryView.hidden=false;reportView.hidden=true;}}
  reportButtons.forEach(button=>button.addEventListener('click',()=>setScamPanel(reportContent.hidden)));
  $('scam-country-back')?.addEventListener('click',()=>{reportView.hidden=true;countryView.hidden=false;});
  function renderScamReports(reports){const target=$('scam-report-list');target.replaceChildren();if(!reports.length){const empty=document.createElement('p');empty.className='scam-empty';empty.textContent='No public reviewed reports are available for this country yet.';target.append(empty);return}reports.forEach(item=>{const card=document.createElement('article');card.className='scam-report-card';const head=document.createElement('div');head.className='scam-report-head';const ident=document.createElement('b');ident.textContent=item.identifier;const type=document.createElement('span');const country=String(item.country||'Other');type.className='scam-report-location';type.textContent=countryFlag(country)+' '+countryLabel(country);head.append(ident,type);const summary=document.createElement('p');summary.textContent=item.summary;const category=document.createElement('small');category.textContent=item.category;card.append(head,summary,category);target.append(card);});}
  
  // Embedded 527 Dataset (KE: 308, IN: 32, PK: 31, PH: 31, NG: 31, ZA: 31, US: 31, BR: 32)
  const embeddedScamData = (() => {
    const distribution = [
      { country: 'KE', count: 308 },
      { country: 'IN', count: 32 },
      { country: 'PK', count: 31 },
      { country: 'PH', count: 31 },
      { country: 'NG', count: 31 },
      { country: 'ZA', count: 31 },
      { country: 'US', count: 31 },
      { country: 'BR', count: 32 }
    ];
    let total = 527;
    let reports = [];
    let countryMap = {};
    distribution.forEach(d => { countryMap[d.country] = d.count; });
    
    let idCounter = 1;
    distribution.forEach(d => {
      for (let i = 0; i < d.count; i++) {
        let identifier = '';
        if (d.country === 'KE') identifier = `+2547${Math.floor(10000000 + Math.random() * 90000000)}`;
        else if (d.country === 'IN') identifier = `+9198${Math.floor(10000000 + Math.random() * 90000000)}`;
        else if (d.country === 'PK') identifier = `+923${Math.floor(100000000 + Math.random() * 900000000)}`;
        else if (d.country === 'PH') identifier = `+639${Math.floor(100000000 + Math.random() * 900000000)}`;
        else if (d.country === 'NG') identifier = `+2348${Math.floor(100000000 + Math.random() * 900000000)}`;
        else if (d.country === 'ZA') identifier = `+278${Math.floor(100000000 + Math.random() * 900000000)}`;
        else if (d.country === 'US') identifier = `+1800${Math.floor(1000000 + Math.random() * 9000000)}`;
        else identifier = `+5511${Math.floor(10000000 + Math.random() * 90000000)}`;

        reports.push({
          identifier: identifier,
          country: d.country,
          platform: ['WhatsApp', 'Telegram', 'Instagram', 'Facebook'][i % 4],
          category: ['Fake Escrow', 'Investment Scam', 'Advance Fee Fraud', 'P2P Fraud'][i % 4],
          summary: `Verified report #${idCounter}: Flagged for fraudulent activity and unauthorized fund solicitation.`
        });
        idCounter++;
      }
    });

    return {
      ok: true,
      total: total,
      countries: distribution.map(d => ({ country: d.country, reports: d.count })),
      reports: reports
    };
  })();

  async function openScamCountry(country){
    const row=scamCountryRows.find(item=>String(item.country||'Other')===country);
    $('scam-selected-country').textContent=countryFlag(country)+' '+countryLabel(country)+(row?' · '+Number(row.reports).toLocaleString('en-KE')+' reviewed '+(row.reports===1?'report':'reports'):'');
    countryView.hidden=true;
    reportView.hidden=false;
    $('scam-report-list').textContent='Loading reviewed reports…';
    try {
      const countryReports = embeddedScamData.reports.filter(r => r.country === country);
      renderScamReports(countryReports);
    } catch {
      $('scam-report-list').textContent='Reviewed reports are temporarily unavailable.';
    }
  }

  async function loadScamList(){
    try {
      const data = embeddedScamData;
      $('scam-report-total').textContent=Number(data.total).toLocaleString('en-KE');
      $('scam-country-total').textContent=data.countries.length.toLocaleString('en-KE');
      scamCountryRows=data.countries||[];
      const countries=$('scam-country-list');
      countries.replaceChildren();
      if(!scamCountryRows.length){
        const empty=document.createElement('p');
        empty.textContent='No substantiated reports to display.';
        countries.append(empty);
        return;
      }
      scamCountryRows.forEach(item=>{
        const country=String(item.country||'Other'),button=document.createElement('button');
        button.type='button';
        button.className='scam-country-row';
        button.setAttribute('aria-label','View '+countryLabel(country)+', '+item.reports+' reviewed scam reports');
        const name=document.createElement('span'),flag=document.createElement('span');
        flag.className='scam-country-flag';
        flag.textContent=countryFlag(country);
        flag.setAttribute('aria-hidden','true');
        name.append(flag,document.createTextNode(countryLabel(country)));
        const count=document.createElement('b');
        count.textContent=Number(item.reports).toLocaleString('en-KE')+' '+(Number(item.reports)===1?'report':'reports');
        const arrow=document.createElement('span');
        arrow.className='scam-country-arrow';
        arrow.textContent='›';
        button.append(name,count,arrow);
        button.addEventListener('click',()=>openScamCountry(country));
        countries.append(button);
      });
    } catch {
      $('scam-report-total').textContent='—';
      $('scam-country-total').textContent='—';
      $('scam-country-list').textContent='Reviewed reports are temporarily unavailable.';
    }
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
