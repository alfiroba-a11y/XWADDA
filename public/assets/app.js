(() => {
  const titles = {home:'Overview',deals:'My deals',market:'Market scan',sellers:'Find sellers',watchlist:'Scam watch',numbers:'My numbers',settings:'Settings'};
  const views = [...document.querySelectorAll('.view')];
  const nav = [...document.querySelectorAll('[data-view]')];
  const crumb = document.getElementById('crumb');
  function showView(name, updateHash=true) {
    if (!titles[name]) name='home';
    views.forEach(v => v.classList.toggle('hidden',v.id !== `view-${name}`));
    nav.forEach(n => n.classList.toggle('active',n.dataset.view === name));
    crumb.textContent=titles[name];
    document.title=`${titles[name]} · XWADDA.KE`;
    if(updateHash && location.hash !== `#${name}`) history.pushState({view:name},'',`#${name}`);
    document.getElementById('sidebar').classList.remove('open');
    window.scrollTo({top:0,behavior:'smooth'});
  }
  nav.forEach(n=>n.addEventListener('click',e=>{e.preventDefault();showView(n.dataset.view)}));
  document.querySelectorAll('.link-button[data-view]').forEach(n=>n.addEventListener('click',()=>showView(n.dataset.view)));
  window.addEventListener('popstate',()=>showView(location.hash.slice(1)||'home',false));
  showView(location.hash.slice(1)||'home',false);
  document.getElementById('menuToggle').addEventListener('click',()=>document.getElementById('sidebar').classList.toggle('open'));

  const toast=document.getElementById('toast');let toastTimer;
  function showToast(message){toast.textContent=message;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2600)}
  document.querySelectorAll('[data-toast]').forEach(el=>el.addEventListener('click',()=>showToast(el.dataset.toast)));
  document.querySelectorAll('[data-modal]').forEach(el=>el.addEventListener('click',()=>document.getElementById(el.dataset.modal).classList.add('open')));
  document.querySelectorAll('.modal-close').forEach(el=>el.addEventListener('click',()=>el.closest('.modal-backdrop').classList.remove('open')));
  document.querySelectorAll('.modal-backdrop').forEach(el=>el.addEventListener('click',e=>{if(e.target===el)el.classList.remove('open')}));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.modal-backdrop.open').forEach(m=>m.classList.remove('open'))});
  const dealForm=document.getElementById('dealForm');
  if(dealForm){
    const amount=dealForm.elements.amount,currency=dealForm.elements.currency,preview=document.getElementById('feePreview');
    const refreshFee=()=>{
      const principal=Math.round((Number.parseFloat(amount.value)||0)*100),code=currency.value;
      const fee=code==='KES'?Math.round((Math.min(principal,1000000)*0.03+Math.max(0,Math.min(principal-1000000,9000000))*0.02+Math.max(0,principal-10000000)*0.01)/100)*100:Math.round(Math.min(principal,10000)*0.025+Math.max(0,Math.min(principal-10000,90000))*0.015+Math.max(0,principal-100000)*0.01);
      const fmt=n=>new Intl.NumberFormat('en-KE',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n/100);
      preview.textContent=`Estimated fee: ${code} ${fmt(fee)} · Total due: ${code} ${fmt(principal+fee)}`;
    };
    amount.addEventListener('input',refreshFee);currency.addEventListener('change',refreshFee);refreshFee();
  }
  document.querySelectorAll('.filter-chip').forEach(btn=>btn.addEventListener('click',()=>{
    const siblings=[...btn.parentElement.querySelectorAll('.filter-chip')];
    if(siblings.length<7){siblings.forEach(s=>s.classList.remove('selected'));btn.classList.add('selected')}
  }));
  document.querySelectorAll('.toggle').forEach(btn=>btn.addEventListener('click',()=>btn.classList.toggle('on')));
})();
